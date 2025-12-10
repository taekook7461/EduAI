from extensions import db
from datetime import datetime, date


# ------------------------------------
# Teacher
# ------------------------------------
class Teacher(db.Model):
    __tablename__ = "teachers"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    students = db.relationship("Student", backref="teacher", lazy=True, cascade="all, delete-orphan")
    tasks = db.relationship("Task", backref="teacher", lazy=True, cascade="all, delete-orphan")


# ------------------------------------
# Student
# ------------------------------------
class Student(db.Model):
    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True)

    # ❗ Главная правка: nullable=True чтобы студент мог существовать БЕЗ учителя
    teacher_id = db.Column(db.Integer, db.ForeignKey("teachers.id"), nullable=True)

    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)

    email = db.Column(db.String(255), unique=True, nullable=False)

    # ❗ Plain password (оставляем для совместимости)
    password = db.Column(db.String(200), nullable=False)

    # ❗ Если хочешь позже — мы можем заменить на password_hash
    # password_hash = db.Column(db.String(255), nullable=True)

    total_xp = db.Column(db.Integer, default=0)
    current_level = db.Column(db.Integer, default=1)
    streak = db.Column(db.Integer, default=0)

    assignments = db.relationship("TaskAssignment", backref="student", lazy=True, cascade="all, delete-orphan")
    submissions = db.relationship("StudentSubmission", backref="student", lazy=True, cascade="all, delete-orphan")
    attendance = db.relationship("Attendance", backref="student", lazy=True, cascade="all, delete-orphan")


# ------------------------------------
# Attendance
# ------------------------------------
class Attendance(db.Model):
    __tablename__ = "attendance"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    is_present = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f"<Attendance student={self.student_id} date={self.date}>"


# ------------------------------------
# Task
# ------------------------------------
class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey("teachers.id"), nullable=False)

    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)

    difficulty = db.Column(db.String(50))
    complexity = db.Column(db.String(50))
    xp_reward = db.Column(db.Integer, default=100)

    example_code = db.Column(db.Text)
    hints = db.Column(db.Text)
    ai_analysis = db.Column(db.Text)

    date_created = db.Column(db.DateTime, default=datetime.utcnow)

    assignments = db.relationship("TaskAssignment", backref="task", lazy=True, cascade="all, delete-orphan")
    submissions = db.relationship("StudentSubmission", backref="task", lazy=True, cascade="all, delete-orphan")


# ------------------------------------
# TaskAssignment
# ------------------------------------
class TaskAssignment(db.Model):
    __tablename__ = "task_assignments"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey("tasks.id"), nullable=False)

    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_completed = db.Column(db.Boolean, default=False)


# ------------------------------------
# StudentSubmission
# ------------------------------------
class StudentSubmission(db.Model):
    __tablename__ = "student_submissions"
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey("tasks.id"), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False)

    code = db.Column(db.Text, nullable=False)
    is_correct = db.Column(db.Boolean, default=False)
    xp_earned = db.Column(db.Integer, default=0)
    feedback = db.Column(db.Text)

    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)


# ------------------------------------
# SuperAdmin
# ------------------------------------
class SuperAdmin(db.Model):
    __tablename__ = "superadmins"
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
