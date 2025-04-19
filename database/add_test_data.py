
import sqlite3
import os
from datetime import datetime, timedelta
import hashlib
from werkzeug.security import generate_password_hash

# Database path
db_path = os.path.join('database.db')

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Clear existing data (optional, comment out if not needed)
tables = [
    'TestMistakes', 'CognitiveTests', 'MedicalChecks', 
    'FatigueAnalysis', 'CrewMembers', 'Flights', 'Crews',
    'Users', 'Employees'
]

for table in tables:
    cursor.execute(f'DELETE FROM {table}')

# Add test employees
employees_data = [
    ('Иванов Иван', 'pilot', 'Командир воздушного судна', 'ivanov@example.com', '2020-01-15', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=60'),
    ('Петров Петр', 'pilot', 'Второй пилот', 'petrov@example.com', '2019-05-20', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60'),
    ('Сидорова Анна', 'medical', 'Врач', 'sidorova@example.com', '2021-03-10', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60'),
    ('Кузнецова Мария', 'admin', 'Администратор', 'kuznetsova@example.com', '2018-07-22', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=60')
]

for emp in employees_data:
    cursor.execute('''
        INSERT INTO Employees (name, role, position, contact_info, employment_date, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', emp)

# Add users with hashed passwords
for i in range(1, 5):
    username = f"user{i}"
    password = generate_password_hash("password123")
    role = cursor.execute('SELECT role FROM Employees WHERE employee_id = ?', (i,)).fetchone()[0]
    
    cursor.execute('''
        INSERT INTO Users (employee_id, username, password, role)
        VALUES (?, ?, ?, ?)
    ''', (i, username, password, role))

# Add test crews
cursor.execute("INSERT INTO Crews (crew_name) VALUES ('Экипаж А')")
cursor.execute("INSERT INTO Crews (crew_name) VALUES ('Экипаж Б')")

# Add crew members
crew_members_data = [
    (1, 1, 'commander'),
    (1, 2, 'co-pilot'),
    (2, 2, 'commander')
]

for crew in crew_members_data:
    cursor.execute('''
        INSERT INTO CrewMembers (crew_id, employee_id, role)
        VALUES (?, ?, ?)
    ''', crew)

# Add test flights
now = datetime.now()
flights_data = [
    (1, 'SU1234', now + timedelta(days=1), now + timedelta(days=1, hours=3), 'SVO', 'Москва', 'LED', 'Санкт-Петербург', 'Boeing 737', 'Normal'),
    (1, 'SU1235', now + timedelta(days=2), now + timedelta(days=2, hours=6), 'LED', 'Санкт-Петербург', 'SVO', 'Москва', 'Boeing 737', 'Normal'),
    (2, 'SU1236', now + timedelta(days=3), now + timedelta(days=3, hours=4), 'SVO', 'Москва', 'KZN', 'Казань', 'Airbus A320', 'Normal')
]

for flight in flights_data:
    cursor.execute('''
        INSERT INTO Flights (
            crew_id, flight_number, departure_time, arrival_time,
            from_code, from_city, to_code, to_city,
            aircraft, conditions
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', flight)

# Add medical checks
medical_checks_data = [
    (1, '2024-01-01', '2025-01-01', 'passed', 'Dr. Smith', 'Regular check'),
    (2, '2024-01-15', '2025-01-15', 'passed', 'Dr. Johnson', 'Regular check')
]

for check in medical_checks_data:
    cursor.execute('''
        INSERT INTO MedicalChecks (
            employee_id, check_date, expiry_date,
            status, doctor_name, notes
        )
        VALUES (?, ?, ?, ?, ?, ?)
    ''', check)

# Add cognitive tests
cognitive_tests_data = [
    (1, datetime.now().isoformat(), 'attention', 95.5, 300, '{"questions": 20, "correct": 19}'),
    (1, datetime.now().isoformat(), 'memory', 88.0, 240, '{"questions": 15, "correct": 13}'),
    (2, datetime.now().isoformat(), 'reaction', 92.5, 180, '{"questions": 10, "correct": 9}')
]

for test in cognitive_tests_data:
    cursor.execute('''
        INSERT INTO CognitiveTests (
            employee_id, test_date, test_type,
            score, duration, details
        )
        VALUES (?, ?, ?, ?, ?, ?)
    ''', test)

# Commit changes and close connection
conn.commit()
conn.close()

print("Test data successfully added to the database!")