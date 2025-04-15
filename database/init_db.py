import sqlite3
import os

# Путь к базе данных
db_path = os.path.join('database', 'database.db')

# Подключение к базе данных
conn = sqlite3.connect(db_path)
cursor = conn.cursor()



# Создание таблицы "Сотрудники"
cursor.execute('''
CREATE TABLE IF NOT EXISTS Employees (
    employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    contact_info TEXT,
    employment_date TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'Активный'
)
''')

# Создание таблицы "Экипажи"
cursor.execute('''
CREATE TABLE IF NOT EXISTS Crews (
    crew_id INTEGER PRIMARY KEY AUTOINCREMENT,
    crew_name TEXT NOT NULL
)
''')

# Создание таблицы "Составы экипажей"
cursor.execute('''
CREATE TABLE IF NOT EXISTS CrewMembers (
    crew_id INTEGER,
    employee_id INTEGER,
    FOREIGN KEY (crew_id) REFERENCES Crews (crew_id),
    FOREIGN KEY (employee_id) REFERENCES Employees (employee_id),
    PRIMARY KEY (crew_id, employee_id)
)
''')

# Создание таблицы "Полеты"
cursor.execute('''
CREATE TABLE IF NOT EXISTS Flights (
    flight_id INTEGER PRIMARY KEY AUTOINCREMENT,
    crew_id INTEGER,
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    duration INTEGER,
    from_code TEXT NOT NULL,
    from_city TEXT NOT NULL,
    to_code TEXT NOT NULL,
    to_city TEXT NOT NULL,
    aircraft TEXT NOT NULL,
    conditions TEXT,
    FOREIGN KEY (crew_id) REFERENCES Crews (crew_id)
)
''')

# Создание таблицы "Анализ усталости"
cursor.execute('''
CREATE TABLE IF NOT EXISTS FatigueAnalysis (
    analysis_id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER,
    flight_id INTEGER,
    fatigue_level TEXT,
    analysis_date TEXT,
    neural_network_score REAL,
    feedback_score REAL,
    FOREIGN KEY (employee_id) REFERENCES Employees (employee_id),
    FOREIGN KEY (flight_id) REFERENCES Flights (flight_id)
)
''')

# Создание таблицы "Пользователи"
cursor.execute('''
CREATE TABLE IF NOT EXISTS Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES Employees (employee_id)
)
''')

# Создание таблицы "Обучающие материалы"
cursor.execute('''
CREATE TABLE IF NOT EXISTS TrainingMaterials (
    material_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT
)
''')


# Создание таблицы "Отзывы"
cursor.execute('''
CREATE TABLE IF NOT EXISTS Feedback (
    feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER,
    flight_id INTEGER,
    feedback_text TEXT,
    feedback_date TEXT,
    FOREIGN KEY (employee_id) REFERENCES Employees (employee_id),
    FOREIGN KEY (flight_id) REFERENCES Flights (flight_id)
)
''')


# Создание таблицы "Когнитивные тесты"


cursor.execute('''
CREATE TABLE IF NOT EXISTS MedicalChecks (
    check_id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    check_date TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    status TEXT CHECK(status IN ('passed', 'conditionally_passed', 'failed')),
    doctor_name TEXT,
    notes TEXT,
    FOREIGN KEY (employee_id) REFERENCES Employees (employee_id)
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS CognitiveTests (
    test_id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    test_date TEXT NOT NULL,
    test_type TEXT CHECK(test_type IN ('attention', 'memory', 'reaction')),
    score REAL NOT NULL,
    duration INTEGER NOT NULL,
    details TEXT,
    FOREIGN KEY (employee_id) REFERENCES Employees (employee_id)
)
''')


# Таблица ошибок тестов
cursor.execute('''
CREATE TABLE IF NOT EXISTS TestMistakes (
    mistake_id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    user_answer TEXT,
    correct_answer TEXT NOT NULL,
    FOREIGN KEY (test_id) REFERENCES CognitiveTests(test_id)
)
''')


cursor.execute('''
    CREATE TRIGGER IF NOT EXISTS CalculateFlightDuration 
    AFTER INSERT ON Flights
    BEGIN
        UPDATE Flights 
        SET duration = CAST(
            (strftime('%s', arrival_time) - strftime('%s', departure_time)) / 60 
            AS INTEGER)
        WHERE flight_id = NEW.flight_id;
    END;
    ''')

# Сохраняем изменения и закрываем соединение
conn.commit()
conn.close()

print("База данных успешно создана!")