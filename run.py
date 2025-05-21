
import subprocess
import sys
import webbrowser
import time
import os
import platform
import logging
from threading import Thread

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("app.log")
    ]
)

logger = logging.getLogger("FatigueGuard")

def check_dependencies():
    """Проверка наличия необходимых зависимостей"""
    try:
        # Проверка Python-библиотек
        import tensorflow as tf
        import mediapipe as mp
        import cv2
        import numpy as np
        logger.info("All required Python libraries are installed")
        
        # Проверка ffmpeg
        try:
            process = subprocess.run(["ffmpeg", "-version"], 
                                   stdout=subprocess.PIPE, 
                                   stderr=subprocess.PIPE, 
                                   text=True)
            if process.returncode == 0:
                logger.info("ffmpeg is installed")
            else:
                logger.warning("ffmpeg check returned non-zero status")
        except (subprocess.SubprocessError, FileNotFoundError):
            logger.error("ffmpeg is not installed or not in PATH. Video conversion will fail!")
            print("\nWARNING: ffmpeg is not installed or not in PATH!")
            print("Video recording and analysis will not work without ffmpeg")
            print("Please install ffmpeg: https://ffmpeg.org/download.html\n")
            
        # Проверка модели
        model_path = 'neural_network/data/models/fatigue_model.keras'
        if not os.path.exists(model_path):
            logger.error(f"Model file not found: {model_path}")
            print(f"\nERROR: Model file not found at {model_path}")
            print("Fatigue analysis will not work without the model file\n")
        else:
            logger.info(f"Model file found at {model_path}")
            
        return True
    except ImportError as e:
        logger.error(f"Missing dependency: {str(e)}")
        print(f"\nERROR: Missing dependency: {str(e)}")
        print("Please install all required dependencies from requirements.txt\n")
        return False

def run_frontend():
    """Запуск фронтенда"""
    try:
        npm_cmd = "npm.cmd" if platform.system() == "Windows" else "npm"
        node_path = os.path.join(os.environ.get('PROGRAMFILES', r"C:\Program Files"), "nodejs", npm_cmd) if platform.system() == "Windows" else npm_cmd
        
        logger.info(f"Starting frontend using {node_path}")
        subprocess.run([node_path, "run", "dev"], check=True)
    except subprocess.CalledProcessError as e:
        logger.error(f"Frontend error: {e}")
        sys.exit(1)

def run_backend():
    """Запуск бэкенда"""
    try:
        logger.info("Starting backend server")
        from routes import app
        app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
    except Exception as e:
        logger.error(f"Backend error: {e}")
        sys.exit(1)

def open_browser():
    """Открытие браузера"""
    time.sleep(2)  # Wait for servers to start
    url = 'http://localhost:8080'
    logger.info(f"Opening browser at {url}")
    webbrowser.open(url)

def check_server_status():
    """Проверка статуса серверов"""
    import requests
    max_retries = 10
    retry_delay = 1
    
    # Проверка бэкенда
    for i in range(max_retries):
        try:
            response = requests.get("http://localhost:5000/api/status")
            if response.status_code == 200:
                logger.info("Backend server is running")
                print("Backend server is running")
                break
        except requests.RequestException:
            if i == max_retries - 1:
                logger.warning("Backend server not responding")
                print("WARNING: Backend server not responding")
            time.sleep(retry_delay)
    
    # Проверка фронтенда
    for i in range(max_retries):
        try:
            response = requests.get("http://localhost:8080")
            if response.status_code == 200:
                logger.info("Frontend server is running")
                print("Frontend server is running")
                break
        except requests.RequestException:
            if i == max_retries - 1:
                logger.warning("Frontend server not responding")
                print("WARNING: Frontend server not responding")
            time.sleep(retry_delay)

if __name__ == "__main__":
    print("\n===== FatigueGuard Application =====\n")
    
    # Проверка зависимостей
    if not check_dependencies():
        print("Dependency check failed. Some features may not work correctly.")
    
    # Создаем директорию для видео
    os.makedirs('neural_network/data/video', exist_ok=True)
    
    # Start backend in a separate thread
    backend_thread = Thread(target=run_backend)
    backend_thread.daemon = True
    backend_thread.start()

    # Start frontend in a separate thread
    frontend_thread = Thread(target=run_frontend)
    frontend_thread.daemon = True
    frontend_thread.start()

    # Проверяем статус серверов в отдельном потоке
    status_thread = Thread(target=check_server_status)
    status_thread.daemon = True
    status_thread.start()

    # Open browser
    browser_thread = Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()

    try:
        print("\nServers are starting...")
        print("Press Ctrl+C to exit\n")
        # Keep the main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        logger.info("Application shutdown initiated")
        sys.exit(0)
