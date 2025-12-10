from werkzeug.security import generate_password_hash
from app import app, db
from models import Teacher, Student

with app.app_context():
    print("🔄 Filling database with demo data...")

    # Чистим таблицы
    db.session.query(Student).delete()
    db.session.query(Teacher).delete()
    db.session.commit()

    # Создаём учителя (id станет 1, но потом мы добавим второго)
    teacher1 = Teacher(
        email="old@school.kz",
        password_hash=generate_password_hash("oldpass123")
    )
    db.session.add(teacher1)

    teacher2 = Teacher(
        email="admin@school.kz",
        password_hash=generate_password_hash("admin123")
    )
    db.session.add(teacher2)
    db.session.commit()
    print(f"👩‍🏫 Teacher created: {teacher2.email} (id={teacher2.id})")

    # Добавляем студентов для teacher_id=2
    students = [
        Student(first_name="Айдана", last_name="Жалғас", email="aidanazh@example.kz", teacher_id=teacher2.id, total_xp=120),
        Student(first_name="Ернар", last_name="Төлеген", email="ernar.t@example.kz", teacher_id=teacher2.id, total_xp=200),
        Student(first_name="Мадина", last_name="Әлібек", email="madina.a@example.kz", teacher_id=teacher2.id, total_xp=180),
        Student(first_name="Данияр", last_name="Қайрат", email="daniyar.q@example.kz", teacher_id=teacher2.id, total_xp=250),
        Student(first_name="Жансая", last_name="Ораз", email="zhansaya.o@example.kz", teacher_id=teacher2.id, total_xp=300),
    ]

    db.session.add_all(students)
    db.session.commit()

    print(f"👩‍🎓 Added {len(students)} students for teacher_id={teacher2.id}")
    print("🎉 Database successfully seeded!")
