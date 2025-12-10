from flask import Blueprint, request, jsonify
from extensions import db
from models import Teacher, Student, Task, TaskAssignment, StudentSubmission, Attendance
from functools import wraps
import jwt
import os
import json
from datetime import datetime, date
from openai import OpenAI

teacher_bp = Blueprint("teacher", __name__)

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)


# ===================================================
# JWT защита
# ===================================================
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization")
        if not auth or not auth.startswith("Bearer "):
            return jsonify({"message": "Token missing"}), 401

        token = auth.split(" ")[1]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            teacher_id = payload.get("user_id")
        except Exception:
            return jsonify({"message": "Invalid token"}), 401

        return f(teacher_id, *args, **kwargs)

    return decorated


# ===================================================
# Получить задания
# ===================================================
@teacher_bp.route("/<int:teacher_id>/tasks", methods=["GET"])
@token_required
def get_tasks(current_teacher_id, teacher_id):
    if current_teacher_id != teacher_id:
        return jsonify({"message": "Forbidden"}), 403

    tasks = Task.query.filter_by(teacher_id=teacher_id).order_by(Task.date_created.desc()).all()

    return jsonify([
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "difficulty": t.difficulty,
            "complexity": t.complexity,
            "xp_reward": t.xp_reward,
            "example_code": t.example_code,
            "hints": t.hints,
            "ai_analysis": t.ai_analysis,
            "date": t.date_created.isoformat() if t.date_created else None
        }
        for t in tasks
    ]), 200


# ===================================================
# Создать задание вручную
# ===================================================
@teacher_bp.route("/<int:teacher_id>/tasks", methods=["POST"])
@token_required
def create_task(current_teacher_id, teacher_id):
    if current_teacher_id != teacher_id:
        return jsonify({"message": "Forbidden"}), 403

    data = request.get_json() or {}

    task = Task(
        teacher_id=teacher_id,
        title=data.get("title"),
        description=data.get("description"),
        difficulty=data.get("difficulty"),
        complexity=data.get("complexity"),
        xp_reward=data.get("xp_reward", 100),
        example_code=data.get("example_code"),
        hints=data.get("hints"),
        ai_analysis=data.get("ai_analysis"),
    )
    db.session.add(task)
    db.session.commit()

    # Назначаем студентам
    students = Student.query.filter_by(teacher_id=teacher_id).all()
    for s in students:
        db.session.add(TaskAssignment(student_id=s.id, task_id=task.id))

    db.session.commit()

    return jsonify({"message": "Task created and assigned", "task_id": task.id}), 201


# ===================================================
# Удалить задание
# ===================================================
@teacher_bp.route("/<int:teacher_id>/tasks/<int:task_id>", methods=["DELETE"])
@token_required
def delete_task(current_teacher_id, teacher_id, task_id):
    if current_teacher_id != teacher_id:
        return jsonify({"message": "Forbidden"}), 403

    task = Task.query.filter_by(id=task_id, teacher_id=teacher_id).first()
    if not task:
        return jsonify({"message": "Task not found"}), 404

    db.session.delete(task)
    db.session.commit()

    return jsonify({"message": "Task deleted"}), 200


# ===================================================
# AI: сгенерировать задание
# ===================================================
@teacher_bp.route("/<int:teacher_id>/tasks/generate", methods=["POST"])
@token_required
def generate_ai_task(current_teacher_id, teacher_id):
    if current_teacher_id != teacher_id:
        return jsonify({"message": "Forbidden"}), 403

    data = request.get_json() or {}
    prompt = data.get("prompt")

    if not prompt:
        return jsonify({"message": "Prompt is required"}), 400

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Сен информатика мұғалімісің. Python бойынша тапсырмалар құр. "
                        "JSON форматында жауап бер: "
                        "{title, description, difficulty, complexity, example_code, hints, ai_analysis}"
                    )
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )

        raw = response.choices[0].message.content.strip()

        # Чистим от ```json
        if raw.startswith("```"):
            raw = raw.split("```")[-2].replace("json", "").strip()

        try:
            parsed = json.loads(raw)
        except Exception:
            parsed = {
                "title": "AI Generated Task",
                "description": raw,
                "difficulty": "орташа",
                "complexity": "орташа",
                "example_code": "",
                "hints": [],
                "ai_analysis": "Failed to parse JSON",
            }

        hints = parsed.get("hints")
        if isinstance(hints, list):
            hints = "\n".join(hints)

        task = Task(
            teacher_id=teacher_id,
            title=parsed.get("title"),
            description=parsed.get("description"),
            difficulty=parsed.get("difficulty"),
            complexity=parsed.get("complexity"),
            xp_reward=100,
            example_code=parsed.get("example_code"),
            hints=hints,
            ai_analysis=parsed.get("ai_analysis"),
        )

        db.session.add(task)
        db.session.commit()

        # Назначаем всем студентам
        students = Student.query.filter_by(teacher_id=teacher_id).all()
        for s in students:
            db.session.add(TaskAssignment(student_id=s.id, task_id=task.id))

        db.session.commit()

        return jsonify({
            "message": "AI тапсырмасы құрылды",
            "task": {"id": task.id, "title": task.title}
        }), 200

    except Exception as e:
        print("AI ERROR:", e)
        return jsonify({"error": str(e)}), 500


# ===================================================
# Получить студентов учителя
# ===================================================
@teacher_bp.route("/<int:teacher_id>/students", methods=["GET"])
@token_required
def get_students(current_teacher_id, teacher_id):
    if current_teacher_id != teacher_id:
        return jsonify({"message": "Forbidden"}), 403

    students = Student.query.filter_by(teacher_id=teacher_id).all()
    result = []

    for s in students:
        # Attendance
        all_days = Attendance.query.filter_by(student_id=s.id).count()
        present_days = Attendance.query.filter_by(student_id=s.id, is_present=True).count()
        attendance_percent = round((present_days / all_days) * 100, 2) if all_days else 0

        subs = StudentSubmission.query.filter_by(student_id=s.id).all()
        task_points = sum(100 if sub.is_correct else 0 for sub in subs)

        rating = round(0.4 * attendance_percent + 0.6 * (task_points / 10), 2) if subs else 0

        result.append({
            "id": s.id,
            "first_name": s.first_name,
            "last_name": s.last_name,
            "email": s.email,
            "attendance": attendance_percent,
            "taskPoints": task_points,
            "rating": rating,
            "total_xp": s.total_xp,
            "current_level": s.current_level,
            "streak": s.streak,
        })

    return jsonify(result), 200


# ===================================================
# Добавить студента
# ===================================================
@teacher_bp.route("/<int:teacher_id>/students", methods=["POST"])
@token_required
def add_student(current_teacher_id, teacher_id):
    if current_teacher_id != teacher_id:
        return jsonify({"message": "Forbidden"}), 403

    data = request.get_json() or {}

    first_name = data.get("first_name")
    last_name = data.get("last_name")
    email = data.get("email")
    password = data.get("password", "123456")  # DEFAULT PASSWORD

    if not first_name or not last_name or not email:
        return jsonify({"message": "Missing required fields"}), 400

    try:
        new_student = Student(
            teacher_id=teacher_id,
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password,  # REQUIRED
            total_xp=0,
            current_level=1,
            streak=0
        )

        db.session.add(new_student)
        db.session.commit()

        return jsonify({
            "message": "Студент добавлен",
            "student": {
                "id": new_student.id,
                "first_name": new_student.first_name,
                "last_name": new_student.last_name,
                "email": new_student.email
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ===================================================
# Удалить студента
# ===================================================
@teacher_bp.route("/<int:teacher_id>/students/<int:student_id>", methods=["DELETE"])
@token_required
def delete_student(current_teacher_id, teacher_id, student_id):
    if current_teacher_id != teacher_id:
        return jsonify({"message": "Forbidden"}), 403

    student = Student.query.filter_by(id=student_id, teacher_id=teacher_id).first()
    if not student:
        return jsonify({"message": "Student not found"}), 404

    db.session.delete(student)
    db.session.commit()

    return jsonify({"message": "Студент удалён"}), 200


# ===================================================
# Обновить студента
# ===================================================
@teacher_bp.route("/<int:teacher_id>/students/<int:student_id>", methods=["PUT"])
@token_required
def update_student(current_teacher_id, teacher_id, student_id):
    if current_teacher_id != teacher_id:
        return jsonify({"message": "Forbidden"}), 403

    student = Student.query.filter_by(id=student_id, teacher_id=teacher_id).first()
    if not student:
        return jsonify({"message": "Student not found"}), 404

    data = request.get_json() or {}

    student.first_name = data.get("first_name", student.first_name)
    student.last_name = data.get("last_name", student.last_name)
    student.email = data.get("email", student.email)

    db.session.commit()

    return jsonify({"message": "Студент обновлён"}), 200


# ===================================================
# Главная статистика учителя
# ===================================================
@teacher_bp.route("/<int:teacher_id>/stats", methods=["GET"])
@token_required
def teacher_stats(current_teacher_id, teacher_id):
    if current_teacher_id != teacher_id:
        return jsonify({"message": "Forbidden"}), 403

    total_students = Student.query.filter_by(teacher_id=teacher_id).count()

    active_students = (
        db.session.query(Attendance.student_id)
        .join(Student, Student.id == Attendance.student_id)
        .filter(Student.teacher_id == teacher_id, Attendance.is_present == True)
        .distinct()
        .count()
    )

    subs = (
        db.session.query(StudentSubmission)
        .join(Student, StudentSubmission.student_id == Student.id)
        .filter(Student.teacher_id == teacher_id)
        .all()
    )

    total_subs = len(subs)
    correct_subs = len([s for s in subs if s.is_correct])
    avg_success = round((correct_subs / total_subs) * 100, 2) if total_subs else 0

    new_tasks = Task.query.filter_by(teacher_id=teacher_id).count()

    return jsonify({
        "total_students": total_students,
        "active_students": active_students,
        "avg_success": avg_success,
        "new_tasks": new_tasks
    }), 200
