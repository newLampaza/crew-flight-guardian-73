
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import time
import sqlite3
import uuid
import json
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps
from neural_network.predict import FatigueAnalyzer, analyze_source
import cv2
import numpy as np

app = Flask(__name__, static_folder='neural_network/data/video')
CORS(app)

DATABASE = 'database/database.db'
SECRET_KEY = 'fatigue-guard-secret-key'  # В реальном проекте использовать переменную окружения
UPLOAD_FOLDER = 'neural_network/data/video'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Проверка подключения к БД
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# Декоратор для защиты маршрутов
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            conn = get_db_connection()
            user = conn.execute('SELECT * FROM users WHERE id = ?', 
                               (data['user_id'],)).fetchone()
            conn.close()
            
            if not user:
                return jsonify({'message': 'User not found!'}), 401
                
            # Добавляем информацию о пользователе в request
            request.current_user = {
                'id': user['id'],
                'username': user['username'],
                'role': user['role']
            }
            
        except Exception as e:
            print(f"Token error: {str(e)}")
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(*args, **kwargs)
    
    return decorated

# Маршрут для проверки состояния сервера
@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({'status': 'Server is running', 'time': time.time()})

# Маршрут для входа в систему
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing username or password'}), 400
        
    username = data['username']
    password = data['password']
    
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE username = ?', 
                       (username,)).fetchone()
    conn.close()
    
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'message': 'Invalid username or password'}), 401
        
    # Создаем токен доступа
    token = jwt.encode({
        'user_id': user['id'],
        'username': user['username'],
        'role': user['role'],
        'exp': datetime.utcnow() + timedelta(hours=24)  # 24 часа
    }, SECRET_KEY, algorithm="HS256")
    
    return jsonify({
        'token': token,
        'user': {
            'id': user['id'],
            'username': user['username'],
            'first_name': user['first_name'],
            'last_name': user['last_name'],
            'role': user['role']
        }
    })

# Маршрут для регистрации нового пользователя
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    
    required_fields = ['username', 'password', 'first_name', 'last_name']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'message': f'Missing {field}'}), 400
    
    conn = get_db_connection()
    existing_user = conn.execute('SELECT * FROM users WHERE username = ?', 
                               (data['username'],)).fetchone()
                               
    if existing_user:
        conn.close()
        return jsonify({'message': 'User already exists'}), 400
    
    # Хешируем пароль
    hashed_password = generate_password_hash(data['password'])
    
    # Роль по умолчанию - pilot
    role = data.get('role', 'pilot')
    
    conn.execute(
        'INSERT INTO users (username, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
        (data['username'], hashed_password, data['first_name'], data['last_name'], role)
    )
    conn.commit()
    user_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
    conn.close()
    
    return jsonify({
        'message': 'User created successfully',
        'user_id': user_id
    }), 201

# Маршрут для загрузки и анализа видео
@app.route('/api/fatigue/analyze', methods=['POST'])
@token_required
def analyze_fatigue():
    try:
        # Проверяем, что получено видео
        if 'video' not in request.files:
            return jsonify({'message': 'No video file provided'}), 400
            
        video_file = request.files['video']
        
        if video_file.filename == '':
            return jsonify({'message': 'No video file selected'}), 400
            
        # Создаем уникальное имя файла
        filename = f"{uuid.uuid4()}.webm"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Сохраняем файл
        video_file.save(filepath)
        print(f"Video saved to {filepath}")
        
        # Проверяем, существует ли файл после сохранения
        if not os.path.exists(filepath) or os.path.getsize(filepath) == 0:
            return jsonify({'message': 'Failed to save video file or file is empty'}), 500
            
        # Конвертируем webm в mp4 для лучшей совместимости с OpenCV
        converted_filename = f"converted_{filename.replace('.webm', '.mp4')}"
        converted_filepath = os.path.join(UPLOAD_FOLDER, converted_filename)
        
        # Проверяем наличие ffmpeg
        import subprocess
        try:
            subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
        except (subprocess.SubprocessError, FileNotFoundError):
            return jsonify({'message': 'ffmpeg not found. Required for video conversion'}), 500
        
        # Используем ffmpeg для конвертации
        cmd = f"ffmpeg -y -i {filepath} -c:v libx264 -preset ultrafast {converted_filepath}"
        process = subprocess.run(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        if process.returncode != 0:
            error_msg = process.stderr.decode('utf-8')
            print(f"Conversion failed: {error_msg}")
            return jsonify({'message': f'Video conversion failed: {error_msg[:200]}...'}), 500
            
        print(f"Video converted to {converted_filepath}")
        
        # Проверяем, существует ли конвертированный файл
        if not os.path.exists(converted_filepath) or os.path.getsize(converted_filepath) == 0:
            return jsonify({'message': 'Converted video file is missing or empty'}), 500
        
        # Анализируем видео с помощью нашей модели усталости
        try:
            # Инициализируем анализатор усталости
            analyzer = FatigueAnalyzer('neural_network/data/models/fatigue_model.keras')
            
            # Открываем видео файл
            video = cv2.VideoCapture(converted_filepath)
            if not video.isOpened():
                return jsonify({'message': 'Failed to open video file for analysis'}), 500
                
            fatigue_scores = []
            frame_count = 0
            
            # Обрабатываем кадры видео
            while True:
                ret, frame = video.read()
                if not ret:
                    break
                    
                # Пропускаем каждые 5 кадров для ускорения
                frame_count += 1
                if frame_count % 5 != 0:
                    continue
                    
                try:
                    # Обрабатываем кадр и получаем предсказание
                    processed_frame = analyzer.process_frame(frame)
                    if len(analyzer.buffer) > 0:
                        fatigue_scores.append(analyzer.buffer[-1])
                except Exception as e:
                    print(f"Error processing frame: {str(e)}")
                    continue
            
            # Закрываем видео файл
            video.release()
            
            # Проверяем, есть ли результаты анализа
            if not fatigue_scores:
                return jsonify({'message': 'No faces detected in video'}), 400
            
            # Получаем окончательный результат анализа
            result = analyzer.get_final_score()
            
            # Сохраняем результат в БД
            conn = get_db_connection()
            conn.execute(
                '''INSERT INTO fatigue_analysis 
                   (user_id, fatigue_level, neural_network_score, video_path, analysis_date) 
                   VALUES (?, ?, ?, ?, datetime('now'))''',
                (request.current_user['id'], result['level'], result['score'], converted_filename)
            )
            conn.commit()
            analysis_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
            conn.close()
            
            # Возвращаем результат
            return jsonify({
                'analysis_id': analysis_id,
                'fatigue_level': result['level'],
                'neural_network_score': result['score'],
                'analysis_date': datetime.now().isoformat(),
                'video_path': converted_filename
            })
            
        except Exception as e:
            print(f"Analysis error: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'message': f'Error analyzing video: {str(e)}'}), 500
            
    except Exception as e:
        print(f"General error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': f'Server error: {str(e)}'}), 500

# Маршрут для сохранения записи видео
@app.route('/api/fatigue/save-recording', methods=['POST'])
@token_required
def save_recording():
    try:
        if 'video' not in request.files:
            return jsonify({'message': 'No video file provided'}), 400
            
        video_file = request.files['video']
        
        if video_file.filename == '':
            return jsonify({'message': 'No video file selected'}), 400
        
        # Сохраняем файл
        filename = f"{uuid.uuid4()}.webm"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        video_file.save(filepath)
        
        # Проверяем, существует ли файл после сохранения
        if not os.path.exists(filepath) or os.path.getsize(filepath) == 0:
            return jsonify({'message': 'Failed to save video file or file is empty'}), 500
        
        # Конвертируем в mp4
        converted_filename = f"converted_{filename.replace('.webm', '.mp4')}"
        converted_filepath = os.path.join(UPLOAD_FOLDER, converted_filename)
        
        # Проверяем наличие ffmpeg
        import subprocess
        try:
            subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
        except (subprocess.SubprocessError, FileNotFoundError):
            return jsonify({'message': 'ffmpeg not found. Required for video conversion'}), 500
        
        # Используем ffmpeg для конвертации
        cmd = f"ffmpeg -y -i {filepath} -c:v libx264 -preset ultrafast {converted_filepath}"
        process = subprocess.run(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        if process.returncode != 0:
            error_msg = process.stderr.decode('utf-8')
            print(f"Conversion failed: {error_msg}")
            return jsonify({'message': f'Video conversion failed: {error_msg[:200]}...'}), 500
        
        # Проверяем, существует ли конвертированный файл
        if not os.path.exists(converted_filepath) or os.path.getsize(converted_filepath) == 0:
            return jsonify({'message': 'Converted video file is missing or empty'}), 500
        
        # Сохраняем запись в БД
        conn = get_db_connection()
        conn.execute(
            '''INSERT INTO recordings 
               (user_id, video_path, recorded_date) 
               VALUES (?, ?, datetime('now'))''',
            (request.current_user['id'], converted_filename)
        )
        conn.commit()
        recording_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
        conn.close()
        
        return jsonify({
            'recording_id': recording_id,
            'video_path': converted_filename,
            'message': 'Recording saved successfully'
        })
        
    except Exception as e:
        print(f"Save recording error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': f'Error saving recording: {str(e)}'}), 500

# Маршрут для анализа последнего рейса
@app.route('/api/fatigue/analyze-flight', methods=['POST'])
@token_required
def analyze_flight():
    try:
        data = request.json
        flight_id = data.get('flight_id')
        
        if not flight_id:
            return jsonify({'message': 'No flight ID provided'}), 400
        
        # Получаем информацию о рейсе из БД
        conn = get_db_connection()
        flight = conn.execute(
            'SELECT * FROM flights WHERE flight_id = ?', 
            (flight_id,)
        ).fetchone()
        
        if not flight:
            conn.close()
            return jsonify({'message': 'Flight not found'}), 404
        
        video_path = flight['video_path']
        if not video_path:
            conn.close()
            return jsonify({'message': 'No video recording for this flight'}), 400
            
        full_video_path = os.path.join(UPLOAD_FOLDER, video_path)
        
        # Проверяем существование файла
        if not os.path.exists(full_video_path):
            conn.close()
            return jsonify({'message': 'Video file not found'}), 404
        
        # Анализируем видео рейса
        try:
            level, percent = analyze_source(full_video_path, is_video_file=True)
            
            # Сохраняем результат анализа
            conn.execute(
                '''INSERT INTO fatigue_analysis 
                   (user_id, fatigue_level, neural_network_score, video_path, analysis_date, flight_id) 
                   VALUES (?, ?, ?, ?, datetime('now'), ?)''',
                (request.current_user['id'], level, percent / 100, video_path, flight_id)
            )
            conn.commit()
            analysis_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
            
            # Получаем данные о рейсе
            flight_data = dict(flight)
            
            conn.close()
            
            return jsonify({
                'analysis_id': analysis_id,
                'fatigue_level': level,
                'neural_network_score': percent / 100,
                'analysis_date': datetime.now().isoformat(),
                'video_path': video_path,
                'from_code': flight_data['from_code'],
                'to_code': flight_data['to_code'],
                'resolution': '1280x720',  # Пример данных
                'fps': 30  # Пример данных
            })
            
        except Exception as e:
            conn.close()
            print(f"Flight analysis error: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'message': f'Error analyzing flight video: {str(e)}'}), 500
            
    except Exception as e:
        print(f"General flight error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': f'Server error: {str(e)}'}), 500

# Маршрут для получения видеофайла
@app.route('/api/video/<path:filename>')
def get_video(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# Маршрут для сохранения отзыва об анализе
@app.route('/api/fatigue/feedback', methods=['POST'])
@token_required
def save_feedback():
    try:
        data = request.json
        
        if not data or not data.get('analysis_id') or 'score' not in data:
            return jsonify({'message': 'Missing analysis_id or score'}), 400
        
        analysis_id = data['analysis_id']
        score = data['score']
        
        # Проверяем, что анализ существует
        conn = get_db_connection()
        analysis = conn.execute(
            'SELECT * FROM fatigue_analysis WHERE analysis_id = ?', 
            (analysis_id,)
        ).fetchone()
        
        if not analysis:
            conn.close()
            return jsonify({'message': 'Analysis not found'}), 404
        
        # Обновляем запись с отзывом
        conn.execute(
            'UPDATE fatigue_analysis SET feedback_score = ? WHERE analysis_id = ?', 
            (score, analysis_id)
        )
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Feedback saved successfully',
            'analysis_id': analysis_id,
            'score': score
        })
        
    except Exception as e:
        print(f"Feedback error: {str(e)}")
        return jsonify({'message': f'Error saving feedback: {str(e)}'}), 500

# Получение данных пользователя
@app.route('/api/user', methods=['GET'])
@token_required
def get_user():
    return jsonify({
        'user': {
            'id': request.current_user['id'],
            'username': request.current_user['username'],
            'role': request.current_user['role']
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
