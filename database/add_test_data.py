import sqlite3
import os
from datetime import datetime, timedelta
import hashlib

# Путь к базе данных
db_path = os.path.join('database', 'database.db')

# Подключение к базе данных
conn = sqlite3.connect(db_path)
cursor = conn.cursor()


# cursor.execute('DELETE FROM FatigueAnalysis')
# cursor.execute('DELETE FROM CrewMembers')
# cursor.execute('DELETE FROM CognitiveTests')
# cursor.execute('DELETE FROM Crews')
# cursor.execute('DELETE FROM Feedback')
# cursor.execute('DELETE FROM Flights')
# cursor.execute('DELETE FROM TrainingMaterials')
# cursor.execute('DELETE FROM Users')


# Добавление тестовых сотрудников
cursor.execute('''
INSERT INTO Employees (name, role, contact_info, employment_date, image_url)
VALUES 
    ('Иван Иванов', 'Пилот', 'ivan@example.com', '2020-01-15', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=60'),
    ('Петр Петров', 'Бортпроводник', 'petr@example.com', '2019-05-20', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60'),
    ('Анна Сидорова', 'Стюардесса', 'anna@example.com', '2021-03-10', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60'),
    ('Мария Кузнецова', 'Штурман', 'maria@example.com', '2018-07-22', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=60'),
    ('Алексей Смирнов', 'Инженер', 'alexey@example.com', '2017-11-30', 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&auto=format&fit=crop&q=60')
''')

# Добавление тестовых экипажей
cursor.execute('''
INSERT INTO Crews (crew_name)
VALUES 
    ('Экипаж 1'),
    ('Экипаж 2'),
    ('Экипаж 3')
''')

# Добавление сотрудников в экипажи
cursor.execute('''
INSERT INTO CrewMembers (crew_id, employee_id)
VALUES 
    (1, 1),  -- Иван Иванов в Экипаже 1
    (1, 2),  -- Петр Петров в Экипаже 1
    (2, 3),  -- Анна Сидорова в Экипаже 2
    (2, 4),  -- Мария Кузнецова в Экипаже 2
    (3, 5)   -- Алексей Смирнов в Экипаже 3
''')

# Добавление тестовых полетов
# Добавление рейсов
now = datetime.now()
flights = [
    # День 1
    (1, now + timedelta(hours=2), now + timedelta(hours=5), 'SVO', 'Москва', 'LED', 'Санкт-Петербург', 'Airbus A320', 'Хорошие'),
    (2, now + timedelta(hours=6), now + timedelta(hours=12), 'SVO', 'Москва', 'DXB', 'Дубай', 'Boeing 777-300', 'Нормальные'),
    
    # День 2
    (3, now + timedelta(days=1, hours=3), now + timedelta(days=1, hours=5), 'LED', 'Санкт-Петербург', 'MMK', 'Мурманск', 'Airbus A319', 'Сложные'),
    (1, now + timedelta(days=1, hours=8), now + timedelta(days=1, hours=14), 'SVO', 'Москва', 'PEK', 'Пекин', 'Boeing 787-9', 'Нормальные'),
    
    # День 3
    (2, now + timedelta(days=2, hours=4), now + timedelta(days=2, hours=6), 'VKO', 'Москва', 'KZN', 'Казань', 'Airbus A320', 'Хорошие'),
    (3, now + timedelta(days=2, hours=10), now + timedelta(days=2, hours=16), 'SVO', 'Москва', 'BKK', 'Бангкок', 'Boeing 777-300', 'Нормальные'),
    
    # День 4
    (1, now + timedelta(days=3, hours=2), now + timedelta(days=3, hours=8), 'SVO', 'Москва', 'DEL', 'Дели', 'Boeing 787-9', 'Сложные'),
    
    # День 5
    (2, now + timedelta(days=4, hours=5), now + timedelta(days=4, hours=7), 'DME', 'Москва', 'ROV', 'Ростов-на-Дону', 'Airbus A320', 'Хорошие'),
    (3, now + timedelta(days=4, hours=9), now + timedelta(days=4, hours=11), 'LED', 'Санкт-Петербург', 'KGD', 'Калининград', 'Airbus A319', 'Нормальные'),
    
    # День 6
    (1, now + timedelta(days=5, hours=3), now + timedelta(days=5, hours=9), 'SVO', 'Москва', 'HKG', 'Гонконг', 'Boeing 787-9', 'Нормальные'),
    (2, now + timedelta(days=5, hours=12), now + timedelta(days=5, hours=14), 'VKO', 'Москва', 'SOF', 'Сочи', 'Airbus A320', 'Хорошие'),
    
    # День 7
    (3, now + timedelta(days=6, hours=4), now + timedelta(days=6, hours=10), 'SVO', 'Москва', 'ALA', 'Алматы', 'Boeing 777-300', 'Сложные'),
    (1, now + timedelta(days=6, hours=14), now + timedelta(days=6, hours=16), 'LED', 'Санкт-Петербург', 'MSQ', 'Минск', 'Airbus A320', 'Хорошие')
]

cursor.executemany('''
    INSERT INTO Flights 
    (crew_id, departure_time, arrival_time, from_code, from_city, to_code, to_city, aircraft, conditions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
''', flights)

fatigue_data = [
    (1, 1, 'Средний', 0.65),
    (1, 2, 'Высокий', 0.82),
    (3, 3, 'Низкий', 0.28)
]
cursor.executemany('''
    INSERT INTO FatigueAnalysis 
    (employee_id, flight_id, fatigue_level, neural_network_score, analysis_date)
    VALUES (?, ?, ?, ?, datetime('now'))
''', fatigue_data)

medical_checks = [
    (1, '2024-01-10', '2025-01-10', 'passed', 'Dr. Smith', 'Full clearance'),
    (2, '2024-02-15', '2025-02-15', 'conditionally_passed', 'Dr. Johnson', 'Limited to short-haul'),
    (3, '2024-03-01', '2024-03-01', 'failed', 'Dr. Wilson', 'Requires re-examination')
]

cursor.executemany('''
    INSERT INTO MedicalChecks 
    (employee_id, check_date, expiry_date, status, doctor_name, notes)
    VALUES (?, ?, ?, ?, ?, ?)
''', medical_checks)

cognitive_tests = [
    (1, '2024-03-01', 'attention', 85.5, 15, 'Focus and distraction test'),
    (1, '2024-03-05', 'memory', 92.0, 20, 'Short-term memory check'),
    (1, '2024-03-10', 'reaction', 78.5, 10, 'Emergency response test'),
    (2, '2024-03-02', 'attention', 88.0, 15, 'Auditory attention test'),
]
cursor.executemany('''
    INSERT INTO CognitiveTests 
    (employee_id, test_date, test_type, score, duration, details)
    VALUES (?, ?, ?, ?, ?, ?)
''', cognitive_tests)


mistakes = [
    (1, "What's the minimum safe altitude?", "1500m", "1000m"),
    (1, "Engine failure procedure step 3", "Call ATC", "Deploy flaps")
]
cursor.executemany('''
    INSERT INTO TestMistakes 
    (test_id, question, user_answer, correct_answer)
    VALUES (?, ?, ?, ?)
''', mistakes)


def hash_password(password):
        return hashlib.sha256(password.encode()).hexdigest()

cursor.execute('''
INSERT INTO Users (employee_id, username, password)
VALUES 
    (1, 'pilot_ivan', ?),
    (2, 'attendant_petr', ?),
    (3, 'stewardess_anna', ?),
    (4, 'navigator_maria', ?),
    (5, 'engineer_alexey', ?)
''', (
    hash_password('pilot123'),
    hash_password('attendant123'),
    hash_password('stewardess123'),
    hash_password('navigator123'),
    hash_password('engineer123')
))

#UPDATE Flights SET video_path = 'test.mp4';



# # Добавление тестовых пользователей
# cursor.execute('''
# INSERT INTO Users (employee_id, username, password)
# VALUES 
#     (1, 'pilot_ivan', 'pilot123'),
#     (2, 'attendant_petr', 'attendant123'),
#     (3, 'stewardess_anna', 'stewardess123'),
#     (4, 'navigator_maria', 'navigator123'),
#     (5, 'engineer_alexey', 'engineer123')
# ''')

# cursor.execute('ALTER TABLE Employees ADD COLUMN image_url TEXT;')

# Обновление значений в новом столбце
# cursor.execute("UPDATE Employees SET image_url = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=60' WHERE employee_id = 1;")
# cursor.execute("UPDATE Employees SET image_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60' WHERE employee_id = 2;")
# cursor.execute("UPDATE Employees SET image_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60' WHERE employee_id = 3;")
# cursor.execute("UPDATE Employees SET image_url = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=60' WHERE employee_id = 4;")
# cursor.execute("UPDATE Employees SET image_url = 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&auto=format&fit=crop&q=60' WHERE employee_id = 5;")

# Сохраняем изменения и закрываем соединение
conn.commit()
conn.close()

print("Тестовые данные успешно добавлены!")



