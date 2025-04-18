
import sqlite3
import os
import hashlib

# Путь к базе данных
db_path = os.path.join('database', 'database.db')

# Подключение к базе данных
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Создание таблицы для хранения настроек нейросети
cursor.execute('''
CREATE TABLE IF NOT EXISTS AISettings (
    setting_id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_name TEXT NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_by INTEGER,
    updated_at TEXT,
    FOREIGN KEY (updated_by) REFERENCES Employees (employee_id)
)
''')

# Создание таблицы для верификации результатов анализа
cursor.execute('''
CREATE TABLE IF NOT EXISTS AnalysisVerification (
    verification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    analysis_id INTEGER NOT NULL,
    verified_by INTEGER NOT NULL,
    verification_date TEXT NOT NULL,
    verified_score REAL,
    verification_notes TEXT,
    FOREIGN KEY (analysis_id) REFERENCES FatigueAnalysis (analysis_id),
    FOREIGN KEY (verified_by) REFERENCES Employees (employee_id)
)
''')

# Создание таблицы медицинских рекомендаций
cursor.execute('''
CREATE TABLE IF NOT EXISTS MedicalRecommendations (
    recommendation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    created_by INTEGER NOT NULL,
    creation_date TEXT NOT NULL,
    expiry_date TEXT,
    recommendation_text TEXT NOT NULL,
    status TEXT CHECK(status IN ('active', 'completed', 'expired')),
    FOREIGN KEY (employee_id) REFERENCES Employees (employee_id),
    FOREIGN KEY (created_by) REFERENCES Employees (employee_id)
)
''')

# Добавление тестовых пользователей с разными ролями
cursor.execute('SELECT username FROM Users WHERE username = "admin"')
if not cursor.fetchone():
    # Добавим администратора системы
    cursor.execute('''
    INSERT INTO Employees (name, role, contact_info, employment_date, image_url)
    VALUES (?, ?, ?, ?, ?)
    ''', ('Алексей Сидоров', 'Системный администратор', 'admin@example.com', '2020-01-01', '/admin-avatar.jpg'))
    
    admin_id = cursor.lastrowid
    
    # Хешируем пароль
    password_hash = hashlib.sha256('password'.encode()).hexdigest()
    
    cursor.execute('''
    INSERT INTO Users (employee_id, username, password)
    VALUES (?, ?, ?)
    ''', (admin_id, 'admin', password_hash))

cursor.execute('SELECT username FROM Users WHERE username = "medical"')
if not cursor.fetchone():
    # Добавим медицинского работника
    cursor.execute('''
    INSERT INTO Employees (name, role, contact_info, employment_date, image_url)
    VALUES (?, ?, ?, ?, ?)
    ''', ('Елена Иванова', 'Медицинский специалист', 'medical@example.com', '2021-03-15', '/medical-avatar.jpg'))
    
    medical_id = cursor.lastrowid
    
    # Хешируем пароль
    password_hash = hashlib.sha256('password'.encode()).hexdigest()
    
    cursor.execute('''
    INSERT INTO Users (employee_id, username, password)
    VALUES (?, ?, ?)
    ''', (medical_id, 'medical', password_hash))

# Сохраняем изменения и закрываем соединение
conn.commit()
conn.close()

print("Роли и пользователи успешно добавлены!")
