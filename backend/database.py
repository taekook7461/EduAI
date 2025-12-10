from app import db
from models import Teacher, Student, Task, TaskAssignment, StudentSubmission, Attendance, Achievement, StudentProfile
from datetime import datetime, date

def init_database():
    """Initialize database with tables"""
    db.create_all()
    print("✓ Database tables created")

def seed_database():
    """Seed database with sample data"""
    # Check if data already exists
    if Teacher.query.first():
        print("✓ Database already seeded")
        return
    
    # Create sample teacher
    teacher = Teacher(
        username='teacher123',
        email='teacher@example.com',
        full_name='Mr. Python'
    )
    teacher.set_password('teacher123')
    db.session.add(teacher)
    db.session.flush()
    
    # Create sample students
    students_data = [
        {'first_name': 'Иван', 'last_name': 'Петров', 'email': 'ivan@example.com'},
        {'first_name': 'Мария', 'last_name': 'Иванова', 'email': 'maria@example.com'},
        {'first_name': 'Петр', 'last_name': 'Сидоров', 'email': 'petr@example.com'},
    ]
    
    students = []
    for data in students_data:
        student = Student(
            teacher_id=teacher.id,
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            total_xp=0,
            current_level=1,
            streak=0
        )
        db.session.add(student)
        students.append(student)
    
    db.session.flush()
    
    # Create profiles for students
    for student in students:
        profile = StudentProfile(student_id=student.id)
        db.session.add(profile)
    
    # Create sample tasks
    tasks_data = [
        {
            'title': 'Переменные и типы данных',
            'description': 'Напишите программу, которая демонстрирует использование различных типов данных в Python',
            'difficulty': 'Начальный',
            'complexity': 'низкая',
            'xp_reward': 100,
            'example_code': 'name = "Иван"\nage = 15\nprint(f"Привет, {name}! Тебе {age} лет")',
            'hints': ['Используйте переменные', 'Примените f-строки']
        },
        {
            'title': 'Функции и параметры',
            'description': 'Создайте функцию, которая принимает два числа и возвращает их сумму',
            'difficulty': 'Промежуточный',
            'complexity': 'средняя',
            'xp_reward': 200,
            'example_code': 'def add(a, b):\n    return a + b\n\nresult = add(5, 3)\nprint(result)',
            'hints': ['Определите функцию', 'Используйте return']
        },
        {
            'title': 'Циклы и условия',
            'description': 'Напишите программу, которая выводит все четные числа от 1 до 20',
            'difficulty': 'Промежуточный',
            'complexity': 'средняя',
            'xp_reward': 200,
            'example_code': 'for i in range(1, 21):\n    if i % 2 == 0:\n        print(i)',
            'hints': ['Используйте цикл for', 'Проверьте условие четности']
        },
    ]
    
    for task_data in tasks_data:
        task = Task(
            teacher_id=teacher.id,
            **task_data
        )
        db.session.add(task)
    
    db.session.commit()
    print("✓ Database seeded with sample data")

def drop_database():
    """Drop all tables"""
    db.drop_all()
    print("✓ All tables dropped")
