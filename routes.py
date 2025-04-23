from logging.handlers import RotatingFileHandler
import subprocess
import traceback
import cv2
from flask import Flask, jsonify, request, send_file, send_from_directory
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime, time, timedelta
import jwt
from functools import wraps
import hashlib
import uuid
import json
import shutil
import logging
from werkzeug.security import generate_password_hash, check_password_hash
from neural_network.predict import analyze_source

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        RotatingFileHandler(
            'app.log',
            maxBytes=1024*1024*5,  # 5 MB
            backupCount=3,
            encoding='utf-8'
        ),
        logging.StreamHandler()
    ]
)

app = Flask(__name__)
CORS(app, supports_credentials=True, expose_headers=['Authorization'], resources={r"/api/*": {"origins": "*"}})
app.config['SECRET_KEY'] = os.urandom(24).hex()
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

DATABASE = os.path.join('database', 'database.db')
VIDEO_DIR = os.path.join('neural_network', 'data', 'video')
os.makedirs(VIDEO_DIR, exist_ok=True)
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'webm', 'mkv'}
test_sessions = {}

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

class AuthError(Exception):
    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code

@app.errorhandler(AuthError)
def handle_auth_error(ex):
    response = jsonify(ex.error)
    response.status_code = ex.status_code
    return response

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                raise AuthError({"code": "invalid_header",
                               "description": "Invalid header. Use 'Bearer {token}'"}, 401)
        
        if not token:
            raise AuthError({"code": "invalid_header",
                           "description": "Token missing"}, 401)
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            conn = get_db_connection()
            current_user = conn.execute(
                'SELECT * FROM Users WHERE username = ?', 
                (data['username'],)
            ).fetchone()
            conn.close()
            
            if not current_user:
                raise AuthError({"code": "invalid_user",
                               "description": "User not found"}, 401)
                
        except jwt.ExpiredSignatureError:
            raise AuthError({"code": "token_expired",
                           "description": "Token has expired"}, 401)
        except jwt.InvalidTokenError:
            raise AuthError({"code": "invalid_token",
                           "description": "Invalid token"}, 401)
            
        return f(current_user, *args, **kwargs)
    return decorated

def create_tokens(user):
    access_token = jwt.encode({
        'username': user['username'],
        'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
    }, app.config['SECRET_KEY'])
    
    refresh_token = jwt.encode({
        'username': user['username'],
        'exp': datetime.utcnow() + app.config['JWT_REFRESH_TOKEN_EXPIRES']
    }, app.config['SECRET_KEY'])
    
    return access_token, refresh_token

@app.route('/api/login', methods=['POST'])
def login():
    try:
        auth = request.get_json()
        if not auth or not auth.get('username') or not auth.get('password'):
            raise AuthError({"code": "invalid_credentials",
                           "description": "Missing username or password"}, 400)

        conn = get_db_connection()
        
        # Получаем информацию о пользователе с присоединением данных из таблицы Employees
        user = conn.execute('''
            SELECT u.*, e.name, e.role, e.position, e.image_url 
            FROM Users u
            LEFT JOIN Employees e ON u.employee_id = e.employee_id
            WHERE u.username = ?
        ''', (auth['username'],)).fetchone()
        
        conn.close()

        if not user:
            raise AuthError({"code": "invalid_credentials",
                           "description": "User not found"}, 404)

        if not check_password_hash(user['password'], auth['password']):
            print(user['password'], auth['password'])
            raise AuthError({"code": "invalid_credentials",
                           "description": "Invalid password"}, 401)

        access_token, refresh_token = create_tokens(user)
        
        # Формируем объект пользователя для отправки клиенту
        user_data = {
            'id': user['user_id'],
            'username': user['username'],
            'name': user['name'],
            'role': user['role'],
            'position': user['position'],
            'avatarUrl': user['image_url']
        }

        return jsonify({
            'token': access_token,
            'refresh_token': refresh_token,
            'user': user_data
        })

    except AuthError as e:
        return jsonify(e.error), e.status_code
    except Exception as e:
        app.logger.error(f"Login error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/refresh-token', methods=['POST'])
def refresh_token():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise AuthError({"code": "invalid_header",
                           "description": "No refresh token provided"}, 401)
        
        try:
            refresh_token = auth_header.split(" ")[1]
        except IndexError:
            raise AuthError({"code": "invalid_header",
                           "description": "Invalid header format"}, 401)

        try:
            data = jwt.decode(refresh_token, app.config['SECRET_KEY'], algorithms=["HS256"])
            conn = get_db_connection()
            user = conn.execute('SELECT * FROM Users WHERE username = ?', 
                              (data['username'],)).fetchone()
            conn.close()

            if not user:
                raise AuthError({"code": "invalid_token",
                               "description": "User not found"}, 401)

            new_access_token, new_refresh_token = create_tokens(user)

            return jsonify({
                'token': new_access_token,
                'refresh_token': new_refresh_token
            })

        except jwt.ExpiredSignatureError:
            raise AuthError({"code": "token_expired",
                           "description": "Refresh token has expired"}, 401)
        except jwt.InvalidTokenError:
            raise AuthError({"code": "invalid_token",
                           "description": "Invalid refresh token"}, 401)

    except AuthError as e:
        return jsonify(e.error), e.status_code
    except Exception as e:
        app.logger.error(f"Token refresh error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/user-profile', methods=['GET'])
@token_required
def get_user_profile(current_user):
    try:
        conn = get_db_connection()
        # Получаем полную и��формацию о ��ользователе
        user_data = conn.execute('''
            SELECT u.*, e.name, e.role, e.position, e.image_url 
            FROM Users u
            LEFT JOIN Employees e ON u.employee_id = e.employee_id
            WHERE u.user_id = ?
        ''', (current_user['user_id'],)).fetchone()
        conn.close()

        if not user_data:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            'id': user_data['user_id'],
            'username': user_data['username'],
            'name': user_data['name'],
            'role': user_data['role'],
            'position': user_data['position'],
            'avatarUrl': user_data['image_url']
        })

    except Exception as e:
        app.logger.error(f"Error getting user profile: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/validate-token', methods=['GET'])
@token_required
def validate_token(current_user):
    return jsonify({'valid': True})

@app.route('/api/logout', methods=['POST'])
@token_required
def logout(current_user):
    # В будущем здесь можно добавить инвалидацию токена
    return jsonify({'message': 'Successfully logged out'})

def generate_test_questions(test_type):
    """Генерирует вопросы для когнитивных тестов в зависимости от типа теста"""
    if test_type == 'attention':
        return [
            {
                'id': str(uuid.uuid4()),
                'type': 'difference',
                'question': 'Найдите отличия между изображениями',
                'options': [
                    'https://picsum.photos/id/237/300/200',
                    'https://picsum.photos/id/238/300/200'
                ],
                'correct_answer': 'https://picsum.photos/id/238/300/200'
            },
            {
                'id': str(uuid.uuid4()),
                'type': 'count',
                'question': 'Сколько треугольников на изображении?',
                'options': ['4', '5', '6', '7'],
                'image': 'https://picsum.photos/id/239/300/200',
                'correct_answer': '6'
            },
            {
                'id': str(uuid.uuid4()),
                'type': 'select',
                'question': 'Выберите все красные объекты',
                'options': ['Яблоко', 'Банан', 'Клубника', 'Лимон', 'Вишня'],
                'correct_answer': 'Яблоко,Клубника,Вишня',
                'multiple_select': True
            },
            {
                'id': str(uuid.uuid4()),
                'type': 'pattern',
                'question': 'Какое число должно быть следующим в последовательности: 2, 4, 8, 16, ?',
                'options': ['24', '32', '30', '42'],
                'correct_answer': '32'
            },
            {
                'id': str(uuid.uuid4()),
                'type': 'grid',
                'question': 'Запомните расположение символов и выберите позицию, где был символ #',
                'grid': [
                    ['@', '$', '%'],
                    ['&', '#', '*'],
                    ['!', '?', '+']
                ],
                'options': ['1-1', '1-2', '1-3', '2-1', '2-2', '2-3', '3-1', '3-2', '3-3'],
                'correct_answer': '2-2',
                'delay': 3
            }
        ]
    elif test_type == 'memory':
        return [
            {
                'id': str(uuid.uuid4()),
                'type': 'sequence',
                'question': 'Запомните последовательность: 7294',
                'correct_answer': '7294',
                'delay': 5
            },
            {
                'id': str(uuid.uuid4()),
                'type': 'words',
                'question': 'Запомните следующие слова: Дом, Кот, Сад, Луна, Река',
                'options': ['Дом', 'Мяч', 'Кот', 'Сон', 'Сад', 'Снег', 'Луна', 'Река', 'Гора'],
                'correct_answer': 'Дом,Кот,Сад,Луна,Река',
                'delay': 8
            },
            {
                'id': str(uuid.uuid4()),
                'type': 'images',
                'question': 'Запомните изображения и их порядок',
                'images': ['🍎', '🚗', '🏠', '📱'],
                'options': ['🍎', '🚗', '🏠', '📱', '💻', '🎮'],
                'correct_answer': '🍎,🚗,🏠,📱',
                'delay': 6
            },
            {
                'id': str(uuid.uuid4()),
                'type': 'pairs',
                'question': 'Запомните пары: A-1, B-2, C-3, D-4',
                'options': ['A-?', 'B-?', 'C-?', 'D-?'],
                'answer_options': ['1', '2', '3', '4', '5'],
                'correct_answer': 'A-1,B-2,C-3,D-4',
                'delay': 7
            },
            {
                'id': str(uuid.uuid4()),
                'type': 'matrix',
                'question': 'Запомните расположение чисел в матрице',
                'matrix': [
                    [3, 7, 1],
                    [9, 5, 8],
                    [2, 6, 4]
                ],
                'question_text': 'Какое число было в центре?',
                'options': ['3', '5', '7', '8', '9'],
                'correct_answer': '5',
                'delay': 6
            }
        ]
    elif test_type == 'reaction':
        return [
            {
                'id': str(uuid.uuid4()),
                'type': 'quick_choice',
                'question': 'Нажмите при появлении красного круга',
                'stimulus': 'red_circle',
                'correct_answer': 'click:<500',
                'delay': 1.5
            },
            {
                'id': str(uuid.uuid4()),
                'type': 'choice_reaction',
                'question': 'Нажмите левую кнопку для зеленого круга, правую для красного',
                'stimulus': ['green_circle', 'red_circle'],
                'options': ['left', 'right'],
                'correct_answer': 'green_circle:left,red_circle:right',
                'delay': 1.2
            },
            {
                'id': str(uuid.uuid4()),
                'type': 'go_nogo',
                'question': 'Нажмите только при появлении буквы X, но не при Y',
                'stimulus': ['X', 'Y'],
                'correct_answer': 'X:click,Y:none',
                'delay': 0.8
            },
            {
                'id': str(uuid.uuid4()),
                'type': 'reaction_chain',
                'question': 'Быстро нажимайте на появляющиеся числа по порядку: 1,2,3',
                'stimulus': ['1', '2', '3'],
                'correct_answer': 'sequence:1,2,3',
                'delay': 1
            },
            {
                'id': str(uuid.uuid4()),
                'type': 'multi_target',
                'question': 'Нажмите на все красные объекты как можно быстрее',
                'stimulus': ['red_square', 'red_circle', 'blue_square', 'green_circle', 'red_triangle'],
                'correct_answer': 'red_square,red_circle,red_triangle',
                'delay': 2
            }
        ]
    elif test_type == 'cognitive':
        return [
            {
                'id': str(uuid.uuid4()),
                'type': 'math',
                'question': 'Решите пример: 18 + 7 * 3 - 5',
                'options': ['34', '28', '33', '64'],
                'correct_answer': '34'
            },
            {
                'id': str(uuid.uuid4()),
                'type': 'verbal',
                'question': 'Какое слово лишнее?',
                'options': ['Яблоко', 'Банан', 'Картофель', 'Апельсин'],
                'correct_answer': 'Картофель'
            },
            {
                'id': str(uuid.uuid4()),
                'type': 'spatial',
                'question': 'Как будет выглядеть фигура после поворота на 90° по часовой стрелке?',
                'image': 'https://i.imgur.com/LqDF35P.png',
                'options': [
                    'https://i.imgur.com/9X5RTsP.png',
                    'https://i.imgur.com/Z87nP3E.png',
                    'https://i.imgur.com/D4R6QHw.png',
                    'https://i.imgur.com/LCjuK9M.png'
                ],
                'correct_answer': 'https://i.imgur.com/Z87nP3E.png'
            },
            {
                'id': str(uuid.uuid4()),
                'type': 'logic',
                'question': 'Все коты любят рыбу. Мурзик любит рыбу. Следовательно:',
                'options': [
                    'Мурзик - кот',
                    'Мурзик не может быть котом',
                    'Недостаточно данных для вывода',
                    'Все животные, которые любят рыбу - коты'
                ],
                'correct_answer': 'Недостаточно данных для вывода'
            },
            {
                'id': str(uuid.uuid4()),
                'type': 'pattern',
                'question': 'Найдите пропущенное число: 2, 6, 12, 20, ?',
                'options': ['30', '24', '28', '32'],
                'correct_answer': '30'
            }
        ]
    return []

def calculate_results(questions, answers, test_type, time_elapsed):
    """Рассчитывает результаты тестирования"""
    correct = 0
    mistakes = []
    test_details = {}
    
    for q in questions:
        user_answer = answers.get(q['id'], '')
        if not user_answer:
            user_answer = "не дан ответ"
        
        # Проверяем правильность ответа
        is_correct = user_answer == q['correct_answer']
        
        # Сохраняем детальные результаты по каждому вопросу
        question_result = {
            'question_id': q['id'],
            'question_type': q['type'],
            'question_text': q['question'],
            'user_answer': user_answer,
            'correct_answer': q['correct_answer'],
            'is_correct': is_correct
        }
        
        # Добавляем в детали теста
        if q['type'] not in test_details:
            test_details[q['type']] = []
        test_details[q['type']].append(question_result)
        
        if is_correct:
            correct += 1
        else:
            mistakes.append({
                'question': q['question'],
                'user_answer': user_answer,
                'correct_answer': q['correct_answer']
            })
    
    total_questions = len(questions)
    score = (correct / total_questions) * 100 if total_questions > 0 else 0
    
    # Группируем анализ ошибок по типам
    error_analysis = {}
    for m in mistakes:
        question_type = next((q['type'] for q in questions if q['question'] == m['question']), 'unknown')
        if question_type not in error_analysis:
            error_analysis[question_type] = 0
        error_analysis[question_type] += 1
    
    return {
        'score': round(score, 1),
        'total_questions': total_questions,
        'correct_answers': correct,
        'mistakes': mistakes,
        'time_elapsed': time_elapsed,
        'test_details': test_details,
        'error_analysis': error_analysis
    }

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/fatigue/analyze', methods=['POST'])
@token_required
def analyze_fatigue(current_user):
    conn = None
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
            
        video_file = request.files['video']
        if not video_file or video_file.filename == '':
            return jsonify({'error': 'Invalid video file'}), 400

        if not allowed_file(video_file.filename):
            return jsonify({'error': f'Unsupported format. Allowed: {ALLOWED_EXTENSIONS}'}), 400

        # Генерация имен файлов
        video_ext = video_file.filename.split('.')[-1]
        original_name = f"{uuid.uuid4()}.{video_ext}"
        original_path = os.path.join(VIDEO_DIR, original_name)
        converted_name = f"converted_{uuid.uuid4()}.mp4"
        converted_path = os.path.join(VIDEO_DIR, converted_name)

        try:
            # Сохраняем оригинальный файл
            video_file.save(original_path)
            app.logger.info(f"Original video saved: {original_path}")

            # Конвертация с FFmpeg
            cmd = [
                'ffmpeg', '-y', '-i', original_path,
                '-vf', 'scale=640:480:force_original_aspect_ratio=increase',
                '-r', '15',
                '-c:v', 'libx264',
                '-preset', 'fast',
                '-crf', '23',
                '-movflags', '+faststart',
                converted_path
            ]
            
            try:
                result = subprocess.run(
                    cmd, 
                    check=True, 
                    stdout=subprocess.PIPE, 
                    stderr=subprocess.PIPE,
                    text=True
                )
                app.logger.info(f"FFmpeg output:\n{result.stderr}")
            except subprocess.CalledProcessError as e:
                app.logger.error(f"FFmpeg error: {e.stderr}")
                return jsonify({'error': 'Video processing failed'}), 400

            # Проверка конвертированного видео
            cap = cv2.VideoCapture(converted_path)
            if not cap.isOpened():
                raise ValueError("Failed to open converted video")

            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            cap.release()

            if width < 640 or height < 480:
                raise ValueError(f"Invalid resolution: {width}x{height}")

            if fps < 15:
                raise ValueError(f"Low FPS: {fps:.1f}")

            if total_frames < 15:
                raise ValueError("Video too short")

            # Анализ видео
            level, percent = analyze_source(converted_path, is_video_file=True)

            # Сохранение в БД
            conn = get_db_connection()
            flight = conn.execute('''
                SELECT flight_id FROM Flights 
                WHERE crew_id = (
                    SELECT crew_id FROM CrewMembers 
                    WHERE employee_id = ?
                )
                ORDER BY arrival_time DESC 
                LIMIT 1
            ''', (current_user['employee_id'],)).fetchone()
            
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO FatigueAnalysis 
                (employee_id, flight_id, fatigue_level, 
                neural_network_score, analysis_date, video_path)
                VALUES (?, ?, ?, ?, datetime('now', 'localtime'), ?)
            ''', (
                current_user['employee_id'],
                flight['flight_id'] if flight else None,
                level,
                percent/100,
                converted_name
            ))
            conn.commit()
            analysis_id = cursor.lastrowid
            return jsonify({
                'status': 'success',
                'analysis_id': analysis_id,
                'fatigue_level': level,
                'neural_network_score': percent / 100,
                'video_path': converted_name
            }), 201

        except Exception as e:
            error_type = ""
            user_msg = "Ошибка обработки видео"
            technical_msg = str(e)
            
            if "resolution" in technical_msg:
                user_msg = "Недостаточное разрешение видео (мин. 640x480)"
                error_type = "resolution_error"
            elif "FPS" in technical_msg:
                user_msg = "Низкая частота кадров (мин. 15 FPS)"
                error_type = "fps_error"
            elif "short" in technical_msg:
                user_msg = "Видео слишком короткое (мин. 1 секунда)"
                error_type = "duration_error"

            app.logger.error(f"Processing error [{error_type}]: {traceback.format_exc()}")
            return jsonify({
                'error': user_msg,
                'technical_details': technical_msg,
                'error_type': error_type
            }), 400

        finally:
            # Очистка временных файлов
            if os.path.exists(original_path):
                os.remove(original_path)
            if conn:
                conn.close()

    except Exception as e:
        app.logger.error(f"Critical error: {traceback.format_exc()}")
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500
    finally:
        if conn:
            conn.close()


@app.route('/api/flights/last-completed', methods=['GET'])
@token_required
def get_last_completed_flight(current_user):
    conn = None
    try:
        conn = get_db_connection()
        flight = conn.execute('''
            SELECT 
                f.flight_id,
                f.from_code,
                f.from_city,
                f.to_code,
                f.to_city,
                f.departure_time,
                f.arrival_time,
                f.video_path
            FROM Flights f
            JOIN CrewMembers cm ON f.crew_id = cm.crew_id
            WHERE cm.employee_id = ?
                AND f.arrival_time < datetime('now', 'localtime')
                AND f.video_path IS NOT NULL
            ORDER BY f.arrival_time DESC
            LIMIT 1
        ''', (current_user['employee_id'],)).fetchone()
        
        return jsonify(dict(flight)) if flight else jsonify({})

    except Exception as e:
        app.logger.error(f"Error getting last flight: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

@app.route('/api/fatigue/analyze-flight', methods=['POST'])
@token_required
def analyze_flight(current_user):
    conn = None
    try:
        conn = get_db_connection()
        
        # Получаем последний рейс с видео
        flight = conn.execute('''
            SELECT f.flight_id, f.video_path 
            FROM Flights f
            JOIN CrewMembers cm ON f.crew_id = cm.crew_id
            WHERE cm.employee_id = ?
                AND f.arrival_time < datetime('now', 'localtime')
                AND f.video_path IS NOT NULL
            ORDER BY f.arrival_time DESC
            LIMIT 1
        ''', (current_user['employee_id'],)).fetchone()

        if not flight:
            return jsonify({'error': 'No completed flights with video found'}), 404

        video_path = os.path.join(VIDEO_DIR, flight['video_path'])
        
        if not os.path.exists(video_path):
            return jsonify({'error': 'Video file not found'}), 404

        # Анализ видео
        level, percent = analyze_source(video_path, is_video_file=True)

        # Сохранение результатов
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO FatigueAnalysis 
            (employee_id, flight_id, fatigue_level, 
             neural_network_score, analysis_date, video_path)
            VALUES (?, ?, ?, ?, datetime('now', 'localtime'), ?)
        ''', (
            current_user['employee_id'],
            flight['flight_id'],
            level,
            percent/100,
            flight['video_path']
        ))
        analysis_id = cursor.lastrowid
        conn.commit()

        # Получаем полные данные анализа
        new_analysis = conn.execute('''
            SELECT * FROM FatigueAnalysis 
            WHERE analysis_id = ?
        ''', (analysis_id,)).fetchone()

        return jsonify(dict(new_analysis))

    except Exception as e:
        app.logger.error(f"Flight analysis error: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn: conn.close()


@app.route('/api/fatigue/history', methods=['GET'])
@token_required
def get_fatigue_history(current_user):
    conn = get_db_connection()
    try:
        history = conn.execute('''
            SELECT 
                fa.analysis_id,
                fa.analysis_date,
                fa.fatigue_level,
                fa.neural_network_score,
                fa.feedback_score,
                fa.video_path,
                f.from_code,
                f.to_code,
                f.departure_time
            FROM FatigueAnalysis fa
            JOIN Flights f ON fa.flight_id = f.flight_id
            WHERE fa.employee_id = ?
            ORDER BY fa.analysis_date DESC
        ''', (current_user['employee_id'],)).fetchall()
        
        return jsonify([dict(row) for row in history])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/fatigue/feedback', methods=['POST'])
@token_required
def submit_fatigue_feedback(current_user):
    conn = None  # Инициализация до try
    try:
        app.logger.info(f"Incoming feedback data: {request.json}")
        data = request.get_json()

        if not data:
            app.logger.warning("Empty request body")
            return jsonify({'error': 'Empty request'}), 400

        required_fields = ['analysis_id', 'score']
        if not all(field in data for field in required_fields):
            app.logger.warning("Empty request body2")
            return jsonify({'error': f'Missing fields: {required_fields}'}), 400
        
        try:
            analysis_id = int(data['analysis_id'])
            score = float(data['score'])
        except ValueError:
            app.logger.warning("Empty request body3")
            return jsonify({'error': 'Invalid data types'}), 400
            
        conn = get_db_connection()


        analysis = conn.execute(
            'SELECT * FROM FatigueAnalysis WHERE analysis_id = ? AND employee_id = ?',
            (analysis_id, current_user['employee_id'])
        ).fetchone()
        
        if not analysis:
            app.logger.warning("Empty request body4")
            return jsonify({'error': 'Analysis not found'}), 404



        conn.execute(
            '''UPDATE FatigueAnalysis 
            SET feedback_score = ?
            WHERE analysis_id = ?''',
            (score, analysis_id)
        )
        conn.commit()
        
        return jsonify({
            'status': 'success',
            'updated_id': analysis_id,
            'new_score': score
        })
    except sqlite3.Error as e:
        app.logger.error(f"Database error: {str(e)}")
        return jsonify({'error': 'Database operation failed'}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error: {traceback.format_exc()}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/videos/<path:filename>', methods=['GET'])
def get_video(filename):
    try:
        return send_from_directory(
            VIDEO_DIR,
            filename,
            mimetype='video/mp4',
            as_attachment=False
        )
    except FileNotFoundError:
        return jsonify({'error': 'Video not found'}), 404
    
@app.route('/api/fatigue/<int:analysis_id>', methods=['GET'])
@token_required
def get_analysis(current_user, analysis_id):
    conn = None
    try:
        conn = get_db_connection()
        analysis = conn.execute('''
            SELECT * FROM FatigueAnalysis 
            WHERE analysis_id = ?
            AND employee_id = ?
        ''', (analysis_id, current_user['employee_id'])).fetchone()
        
        if not analysis:
            return jsonify({'error': 'Analysis not found'}), 404
            
        return jsonify(dict(analysis))
        
    except Exception as e:
        app.logger.error(f"Error getting analysis: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn: conn.close()


@app.route('/api/tests/start', methods=['POST'])
@token_required
def start_test(current_user):
    try:
        test_type = request.json.get('test_type')
        if not test_type:
            return jsonify({'error': 'Тип теста не указан'}), 400
            
        # Проверяем интервал между попытками
        conn = get_db_connection()
        last_test = conn.execute('''
            SELECT test_date 
            FROM CognitiveTests 
            WHERE employee_id = ? 
              AND test_type = ?
            ORDER BY test_date DESC 
            LIMIT 1
        ''', (current_user['employee_id'], test_type)).fetchone()
        
        # Можно снять ограничение интервала для удобства тестирования
        # if last_test:
        #     last_time = datetime.fromisoformat(last_test['test_date'])
        #     if (datetime.now() - last_time).total_seconds() < 600:  # 10 минут
        #         return jsonify({
        #             'error': 'Повторная попытка доступна через 10 минут',
        #             'retry_after': 600 - int((datetime.now() - last_time).total_seconds())
        #         }), 429
                
        if test_type not in ['attention', 'memory', 'reaction', 'cognitive']:
            return jsonify({'error': 'Недопустимый тип теста'}), 400

        # Генерируем вопросы
        questions = generate_test_questions(test_type)
        test_id = str(uuid.uuid4())
        
        # Сохраняем сессию теста
        conn.execute('''
            INSERT INTO TestSessions 
            (session_id, employee_id, test_type, start_time, questions)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            test_id,
            current_user['employee_id'],
            test_type,
            datetime.now().isoformat(),
            json.dumps(questions)
        ))
        conn.commit()
        conn.close()

        # Возвращаем облегчённую версию вопросов (без правильных ответов)
        return jsonify({
            'test_id': test_id,
            'questions': [{
                'id': q['id'],
                'type': q['type'],
                'question': q['question'],
                'options': q.get('options', []),
                'image': q.get('image', None),
                'images': q.get('images', None),
                'grid': q.get('grid', None),
                'matrix': q.get('matrix', None),
                'stimulus': q.get('stimulus', None),
                'delay': q.get('delay', None),
                'answer_options': q.get('answer_options', None),
                'question_text': q.get('question_text', None)
            } for q in questions],
            'time_limit': 300  # 5 минут на весь тест
        })

    except Exception as e:
        print(f"Error in start_test: {str(e)}")
        app.logger.error(f"Start test error: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'conn' in locals():
            conn.close()

@app.route('/api/tests/submit', methods=['POST'])
@token_required
def submit_test(current_user):
    if not request.is_json:
        return jsonify({'error': 'Запрос должен быть в формате JSON'}), 400

    data = request.get_json()
    required_fields = ['test_id', 'answers']
    
    if not all(field in data for field in required_fields):
        return jsonify({'error': f'Отсутствуют обязательные поля: {required_fields}'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Получаем информацию о текущей сессии теста
        test_session = conn.execute('''
            SELECT * FROM TestSessions 
            WHERE session_id = ?
              AND employee_id = ?
        ''', (data['test_id'], current_user['employee_id'])).fetchone()

        if not test_session:
            return jsonify({'error': 'Недействительная сессия теста'}), 404

        # Рассчитываем время выполнения
        start_time = datetime.fromisoformat(test_session['start_time'])
        time_elapsed = (datetime.now() - start_time).total_seconds()

        # Рассчитываем результаты
        questions = json.loads(test_session['questions'])
        results = calculate_results(
            questions,
            data['answers'],
            test_session['test_type'],
            time_elapsed
        )

        # Сохраняем результаты в базу данных
        cursor.execute('''
            INSERT INTO CognitiveTests 
            (employee_id, test_date, test_type, score, duration, details)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            current_user['employee_id'],
            datetime.now().isoformat(),
            test_session['test_type'],
            results['score'],
            time_elapsed,
            json.dumps({
                'total_questions': results['total_questions'],
                'correct_answers': results['correct_answers'],
                'error_analysis': results['error_analysis']
            })
        ))

        test_id = cursor.lastrowid

        # Сохраняем ошибки
        if results['mistakes']:
            mistakes_data = []
            for m in results['mistakes']:
                mistakes_data.append((
                    test_id, 
                    m['question'], 
                    m['user_answer'], 
                    m['correct_answer']
                ))
            
            cursor.executemany('''
                INSERT INTO TestMistakes 
                (test_id, question, user_answer, correct_answer)
                VALUES (?, ?, ?, ?)
            ''', mistakes_data)

        # Удаляем сессию теста
        conn.execute('DELETE FROM TestSessions WHERE session_id = ?', 
                   (data['test_id'],))
        
        conn.commit()
        
        # Возвращаем краткие результаты
        return jsonify({
            'score': results['score'],
            'test_id': test_id,
            'total_questions': results['total_questions'],
            'correct_answers': results['correct_answers']
        })

    except sqlite3.Error as e:
        conn.rollback()
        app.logger.error(f"Database error: {traceback.format_exc()}")
        return jsonify({'error': f'Ошибка базы данных: {str(e)}'}), 500
    except Exception as e:
        conn.rollback()
        app.logger.error(f"Submit test error: {traceback.format_exc()}")
        return jsonify({'error': f'Внутренняя ошибка: {str(e)}'}), 500
    finally:
        conn.close()

@app.route('/api/tests/results/<int:test_id>', methods=['GET'])
@token_required
def get_test_results(current_user, test_id):
    conn = get_db_connection()
    try:
        # Основная информация о тесте
        test = conn.execute('''
            SELECT * FROM CognitiveTests
            WHERE test_id = ? 
              AND employee_id = ?
        ''', (test_id, current_user['employee_id'])).fetchone()

        if not test:
            return jsonify({'error': 'Тест не найден'}), 404

        # Ошибки теста
        mistakes = conn.execute('''
            SELECT question, user_answer, correct_answer
            FROM TestMistakes
            WHERE test_id = ?
        ''', (test_id,)).fetchall()

        # Преобразуем результаты в структурированные данные
        test_details = json.loads(test['details']) if test['details'] else {}
        
        return jsonify({
            'test_id': test['test_id'],
            'test_date': test['test_date'],
            'test_type': test['test_type'],
            'score': test['score'],
            'duration': test['duration'],
            'details': test_details,
            'mistakes': [dict(m) for m in mistakes]
        })

    except Exception as e:
        app.logger.error(f"Get test results error: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/crew', methods=['GET'])
@token_required
def get_crew(current_user):
    conn = get_db_connection()
    crew = conn.execute('''
        SELECT e.*, c.crew_name 
        FROM Employees e
        JOIN CrewMembers cm ON e.employee_id = cm.employee_id
        JOIN Crews c ON cm.crew_id = c.crew_id
        WHERE cm.crew_id = (
            SELECT crew_id FROM CrewMembers 
            WHERE employee_id = ?
        )
    ''', (current_user['employee_id'],)).fetchall()
    conn.close()
    return jsonify([dict(member) for member in crew])

@app.route('/api/flights', methods=['GET'])
@token_required
def get_flights(current_user):
    conn = get_db_connection()
    flights = conn.execute('''
        SELECT 
            f.flight_id,
            f.departure_time,
            f.arrival_time,
            f.duration,
            f.from_code,
            f.from_city,
            f.to_code,
            f.to_city,
            f.aircraft,
            f.conditions,
            c.crew_name
        FROM Flights f
        JOIN Crews c ON f.crew_id = c.crew_id
        WHERE f.crew_id = (
            SELECT crew_id FROM CrewMembers 
            WHERE employee_id = ?
        )
        ORDER BY f.departure_time DESC
    ''', (current_user['employee_id'],)).fetchall()
    conn.close()
    return jsonify([dict(flight) for flight in flights])

@app.route('/api/fatigue', methods=['GET'])
@token_required
def get_fatigue_data(current_user):
    conn = get_db_connection()
    data = conn.execute('''
        SELECT * FROM FatigueAnalysis
        WHERE employee_id = ?
        ORDER BY analysis_date DESC
    ''', (current_user['employee_id'],)).fetchall()
    conn.close()
    return jsonify([dict(row) for row in data])

@app.route('/api/flight-eligibility', methods=['GET'])
@token_required
def get_flight_eligibility(current_user):
    conn = get_db_connection()
    try:
        current_date = datetime.now().date()
        eligibility_data = []

        # 1. Медицинская проверка
        medical = conn.execute('''
            SELECT 
                check_date, 
                expiry_date, 
                status,
                notes 
            FROM MedicalChecks
            WHERE 
                employee_id = ?
                AND status IN ('passed', 'conditionally_passed')
            ORDER BY check_date DESC
            LIMIT 1
        ''', (current_user['employee_id'],)).fetchone()

        if medical:
            expiry_date = datetime.strptime(medical['expiry_date'], '%Y-%m-%d').date()
            is_valid = expiry_date >= current_date
        else:
            is_valid = False
        
        medical_status = {
            'id': 1,
            'name': 'Medical Certificate',
            'status': 'passed' if is_valid else 'failed',
            'last_check': medical['check_date'] if medical else None,
            'expiry_date': medical['expiry_date'] if medical else None,
            'details': medical['notes'] if medical else 'No valid medical certificate',
            'required': True
        }
        eligibility_data.append(medical_status)

        # 2. Когнитивный тест
        cognitive_tests = conn.execute('''
            SELECT score, test_date 
            FROM CognitiveTests
            WHERE employee_id = ?
            ORDER BY test_date DESC
            LIMIT 3
        ''', (current_user['employee_id'],)).fetchall()

        test_status = 'failed'
        details = 'No cognitive tests available'
        latest_date = None

        if cognitive_tests:
            latest_date = cognitive_tests[0]['test_date']

        if len(cognitive_tests) >= 3:
            total = sum(t['score'] for t in cognitive_tests)
            average = total / 3
            test_status = 'passed' if average >= 75 else 'failed'
            details = f"Average of last 3 tests: {average:.1f}%"
        else:
            details = f"Requires 3 tests (current: {len(cognitive_tests)})"

        eligibility_data.append({
            'id': 2,
            'name': 'Cognitive Assessment',
            'status': test_status,
            'last_check': latest_date,
            'details': details,
            'required': True
        })

        # 3. Анализ усталости
        fatigue = conn.execute('''
            SELECT analysis_date, neural_network_score
            FROM FatigueAnalysis
            WHERE employee_id = ?
            ORDER BY analysis_date DESC
            LIMIT 1
        ''', (current_user['employee_id'],)).fetchone()

        fatigue_status = 'pending'
        if fatigue:
            fatigue_status = 'passed' if fatigue['neural_network_score'] < 0.7 else 'failed'

        eligibility_data.append({
            'id': 3,
            'name': 'Fatigue Level',
            'status': fatigue_status,
            'last_check': fatigue['analysis_date'] if fatigue else None,
            'details': f"Last reading: {fatigue['neural_network_score']*100:.1f}%" if fatigue else 'No fatigue data',
            'required': True
        })

        return jsonify(eligibility_data)

    except Exception as e:
        app.logger.error(f"Error in flight eligibility: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        conn.close()

@app.route('/api/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    conn = get_db_connection()
    try:
        # Основные данные профиля
        profile = conn.execute('''
            SELECT 
                e.employee_id,
                e.name,
                e.role,
                e.contact_info,
                e.employment_date,
                e.image_url,
                COUNT(f.flight_id) as total_flights,
                SUM(f.duration) as total_hours
            FROM Employees e
            LEFT JOIN CrewMembers cm ON e.employee_id = cm.employee_id
            LEFT JOIN Flights f ON cm.crew_id = f.crew_id 
                AND f.arrival_time < CURRENT_TIMESTAMP
            WHERE e.employee_id = ?
            GROUP BY e.employee_id
        ''', (current_user['employee_id'],)).fetchone()

        # Статистика за текущую неделю (только завершенные рейсы)
        weekly_stats = conn.execute('''
            SELECT 
                COUNT(f.flight_id) as weekly_completed_flights,
                SUM(f.duration) as weekly_completed_hours
            FROM Flights f
            JOIN CrewMembers cm ON f.crew_id = cm.crew_id
            WHERE cm.employee_id = ?
              AND DATE(f.departure_time) >= DATE('now', 'weekday 0', '-6 days')
              AND f.arrival_time < CURRENT_TIMESTAMP
        ''', (current_user['employee_id'],)).fetchone()

        result = dict(profile)
        result.update({
            'weekly_completed_flights': weekly_stats['weekly_completed_flights'] or 0,
            'weekly_completed_hours': weekly_stats['weekly_completed_hours'] or 0
        })

        return jsonify(result)

    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/cognitive-tests', methods=['GET'])
@token_required
def get_cognitive_tests(current_user):
    """Получение списка когнитивных тестов пользователя"""
    conn = get_db_connection()
    try:
        tests = conn.execute('''
            SELECT 
                test_id,
                test_date,
                test_type,
                score,
                duration,
                details
            FROM CognitiveTests
            WHERE employee_id = ?
            ORDER BY test_date DESC
        ''', (current_user['employee_id'],)).fetchall()

        if not tests:
            return jsonify({"message": "No tests found"}), 404

        return jsonify([dict(test) for test in tests])

    except sqlite3.Error as e:
        app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database operation failed"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        conn.close()

@app.route('/api/cognitive-tests/<int:test_id>/results', methods=['GET'])
@token_required
def get_test_details(current_user, test_id):
    """Получение деталей теста и ошибок"""
    conn = get_db_connection()
    try:
        # Проверка принадлежности теста пользователю
        test = conn.execute('''
            SELECT * FROM CognitiveTests
            WHERE test_id = ? 
            AND employee_id = ?
        ''', (test_id, current_user['employee_id'])).fetchone()

        if not test:
            return jsonify({"error": "Test not found"}), 404

        # Получение ошибок
        mistakes = conn.execute('''
            SELECT 
                question,
                user_answer,
                correct_answer
            FROM TestMistakes
            WHERE test_id = ?
        ''', (test_id,)).fetchall()

        response_data = {
            "test": dict(test),
            "mistakes": [dict(mistake) for mistake in mistakes],
            "analysis": {
                "total_questions": len(mistakes) + test['score']/100*(len(mistakes)/(1-test['score']/100)) if test['score'] < 100 else len(mistakes),
                "correct_answers": round(test['score']/100 * (len(mistakes)/(1-test['score']/100))) if test['score'] < 100 else "N/A"
            }
        }

        return jsonify(response_data)

    except sqlite3.Error as e:
        app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database operation failed"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        conn.close()

@app.route('/api/feedback', methods=['GET', 'POST'])
@token_required
def handle_feedback(current_user):
    app.logger.info(f"Handling feedback request: {request.method}")
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            feedbacks = conn.execute('''
                SELECT 
                    f.*,
                    CASE 
                        WHEN f.entity_type = 'flight' THEN (
                            SELECT from_code || ' - ' || to_code 
                            FROM Flights 
                            WHERE flight_id = f.entity_id
                        )
                        WHEN f.entity_type = 'cognitive_test' THEN (
                            SELECT test_type || ' (' || score || '%)'
                            FROM CognitiveTests 
                            WHERE test_id = f.entity_id
                        )
                        WHEN f.entity_type = 'fatigue_analysis' THEN (
                            SELECT fatigue_level || ' (' || (neural_network_score * 100) || '%)'
                            FROM FatigueAnalysis 
                            WHERE analysis_id = f.entity_id
                        )
                    END as entity_info,
                    datetime(f.created_at) as formatted_date
                FROM Feedback f
                WHERE f.employee_id = ?
                ORDER BY f.created_at DESC
            ''', (current_user['employee_id'],)).fetchall()
            
            app.logger.info(f"Found {len(feedbacks) if feedbacks else 0} feedback entries")
            
            return jsonify([{
                'id': f['feedback_id'],
                'type': f['entity_type'],
                'entityId': f['entity_id'],
                'entityInfo': f['entity_info'] or f"Unknown {f['entity_type']} #{f['entity_id']}",
                'rating': f['rating'],
                'comments': f['comments'],
                'date': f['formatted_date']
            } for f in feedbacks])
        
        except sqlite3.Error as e:
            app.logger.error(f"Database error in feedback GET: {str(e)}")
            return jsonify({'error': 'Failed to fetch feedback'}), 500
        except Exception as e:
            app.logger.error(f"Unexpected error in feedback GET: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
        finally:
            if 'conn' in locals():
                conn.close()

    elif request.method == 'POST':
        try:
            app.logger.info(f"Received feedback data: {request.json}")
            data = request.get_json()
            
            if not data:
                app.logger.warning("Empty request body")
                return jsonify({'error': 'No data provided'}), 400
                
            # Проверяем наличие как camelCase, так и snake_case полей
            entity_type = data.get('entity_type') or data.get('entityType')
            entity_id = data.get('entity_id') or data.get('entityId')
            rating = data.get('rating')
            comments = data.get('comments')
            
            if not all([entity_type, entity_id, rating]):
                app.logger.warning(f"Missing required fields. Got: {data}")
                return jsonify({'error': 'Missing required fields'}), 400

            try:
                entity_id = int(entity_id)
                rating = int(rating)
            except (ValueError, TypeError):
                app.logger.warning(f"Invalid data types: entity_id={entity_id}, rating={rating}")
                return jsonify({'error': 'Invalid data types'}), 400

            if not 1 <= rating <= 5:
                return jsonify({'error': 'Rating must be between 1 and 5'}), 400

            conn = get_db_connection()
            
            # Check if entity exists
            entity_exists = False
            if entity_type in ['flight', 'cognitive_test', 'fatigue_analysis']:
                table_name = {
                    'flight': 'Flights',
                    'cognitive_test': 'CognitiveTests',
                    'fatigue_analysis': 'FatigueAnalysis'
                }[entity_type]
                id_field = {
                    'flight': 'flight_id',
                    'cognitive_test': 'test_id',
                    'fatigue_analysis': 'analysis_id'
                }[entity_type]
                
                entity_exists = conn.execute(f'SELECT 1 FROM {table_name} WHERE {id_field} = ?', 
                                         (entity_id,)).fetchone() is not None
            
            # Для тестирования разрешим любые entity_id
            entity_exists = True
            
            if not entity_exists:
                app.logger.warning(f"Entity not found: {entity_type} with id {entity_id}")
                return jsonify({'error': f'{entity_type} not found'}), 404

            # Check for existing feedback
            existing = conn.execute('''
                SELECT 1 FROM Feedback 
                WHERE employee_id = ? 
                AND entity_type = ? 
                AND entity_id = ?
            ''', (
                current_user['employee_id'],
                entity_type,
                entity_id
            )).fetchone()

            if existing:
                app.logger.info(f"Feedback already exists for {entity_type} #{entity_id}")
                return jsonify({'error': 'Feedback already exists'}), 409

            # Insert new feedback
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO Feedback (
                    employee_id, entity_type, entity_id,
                    rating, comments, created_at
                ) VALUES (?, ?, ?, ?, ?, datetime('now'))
            ''', (
                current_user['employee_id'],
                entity_type,
                entity_id,
                rating,
                comments,
            ))
            
            conn.commit()
            feedback_id = cursor.lastrowid
            app.logger.info(f"Feedback saved with ID: {feedback_id}")
            
            return jsonify({
                'id': feedback_id,
                'message': 'Feedback submitted successfully'
            }), 201

        except sqlite3.Error as e:
            app.logger.error(f"Database error in feedback POST: {str(e)}")
            return jsonify({'error': 'Failed to save feedback'}), 500
        except Exception as e:
            app.logger.error(f"Unexpected error in feedback POST: {traceback.format_exc()}")
            return jsonify({'error': 'Internal server error'}), 500
        finally:
            if 'conn' in locals():
                conn.close()

@app.route('/api/tests/cooldown/<string:test_type>', methods=['GET'])
@app.route('/api/cognitive-tests/cooldown/<string:test_type>', methods=['GET'])
@token_required
def check_test_cooldown(current_user, test_type):
    """Проверка времени перезарядки теста"""
    conn = get_db_connection()
    try:
        last_test = conn.execute('''
            SELECT test_date 
            FROM CognitiveTests 
            WHERE employee_id = ? 
              AND test_type = ?
            ORDER BY test_date DESC 
            LIMIT 1
        ''', (current_user['employee_id'], test_type)).fetchone()
        
        if not last_test:
            return jsonify({'in_cooldown': False})
            
        # Проверяем прошло ли достаточно времени (например, 10 минут для тестирования)
        last_time = datetime.fromisoformat(last_test['test_date'])
        cooldown_seconds = 600  # 10 минут
        now = datetime.now()
        
        if (now - last_time).total_seconds() < cooldown_seconds:
            cooldown_end = last_time + timedelta(seconds=cooldown_seconds)
            return jsonify({
                'in_cooldown': True,
                'cooldown_end': cooldown_end.isoformat()
            })
        
        return jsonify({'in_cooldown': False})
        
    except Exception as e:
        app.logger.error(f"Error in test cooldown check: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/debug/check-db', methods=['GET'])
def check_database():
    try:
        conn = get_db_connection()
        # Check if we can access the database
        tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
        table_names = [table['name'] for table in tables]
        conn.close()
        return jsonify({
            'status': 'OK',
            'database_file': DATABASE,
            'tables': table_names
        })
    except sqlite3.Error as e:
        return jsonify({
            'status': 'ERROR',
            'error': str(e),
            'database_file': DATABASE
        }), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(os.path.join('site', 'dist', path)):
        return send_from_directory('site/dist', path)
    return send_from_directory('site/dist', 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
