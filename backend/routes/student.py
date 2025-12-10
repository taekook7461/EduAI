from flask import Blueprint, request, jsonify
from extensions import db
from models import Student, TaskAssignment, Task, StudentSubmission
from functools import wraps
import jwt
import os
from datetime import datetime
import openai

student_bp = Blueprint('student', __name__)

SECRET_KEY = os.getenv("JWT_SECRET_KEY")


# ---------------------------------------------------------
# JWT Проверка
# ---------------------------------------------------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")

        if not auth.startswith("Bearer "):
            return jsonify({"message": "Token is missing"}), 401

        token = auth.split(" ")[1]

        try:
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            student_id = decoded.get("user_id")
        except Exception:
            return jsonify({"message": "Invalid token"}), 401

        return f(student_id, *args, **kwargs)

    return decorated


# ---------------------------------------------------------
# Профиль студента
# ---------------------------------------------------------
@student_bp.route('/profile', methods=['GET'])
@token_required
def profile(current_student_id):
    student = Student.query.get(current_student_id)

    if not student:
        return jsonify({"message": "Student not found"}), 404

    return jsonify({
        "id": student.id,
        "first_name": student.first_name,
        "last_name": student.last_name,
        "email": student.email,
        "total_xp": student.total_xp,
        "level": student.current_level,
        "streak": student.streak
    }), 200


# ---------------------------------------------------------
# Назначенные задачи
# ---------------------------------------------------------
@student_bp.route('/tasks', methods=['GET'])
@token_required
def assigned_tasks(current_student_id):
    assignments = TaskAssignment.query.filter_by(student_id=current_student_id).all()

    task_list = []
    for a in assignments:
        task = Task.query.get(a.task_id)
        task_list.append({
            "assignment_id": a.id,
            "task_id": task.id,
            "title": task.title,
            "description": task.description,
            "difficulty": task.difficulty,
            "complexity": task.complexity,
            "xp_reward": task.xp_reward,
            "assigned_at": a.assigned_at.isoformat()
        })

    return jsonify(task_list), 200


# ---------------------------------------------------------
# Отправка кода + AI проверка
# ---------------------------------------------------------
@student_bp.route('/submit', methods=['POST'])
@token_required
def submit_code(current_student_id):
    data = request.get_json() or {}

    task_id = data.get("task_id")
    code = data.get("code")

    if not task_id or not code:
        return jsonify({"message": "Missing task_id or code"}), 400

    task = Task.query.get(task_id)
    if not task:
        return jsonify({"message": "Task not found"}), 404

    # Создаём запись отправки
    submission = StudentSubmission(
        student_id=current_student_id,
        task_id=task_id,
        code=code,
        is_correct=False,
        xp_earned=0,
        submitted_at=datetime.utcnow()
    )
    db.session.add(submission)
    db.session.commit()

    # ---------------------------
    # AI Проверка
    # ---------------------------
    openai.api_key = os.getenv("OPENAI_API_KEY")

    prompt = f"""
    Проверь код Python и оцени правильно ли решена задача.
    Код:

    {code}

    Ответь одним словом: correct или incorrect.
    """

    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    feedback = response["choices"][0]["message"]["content"].lower()
    is_correct = "correct" in feedback

    # Обновляем запись
    student = Student.query.get(current_student_id)

    if is_correct:
        submission.is_correct = True
        submission.xp_earned = task.xp_reward
        student.total_xp = (student.total_xp or 0) + task.xp_reward
    else:
        submission.is_correct = False
        submission.xp_earned = 0

    submission.feedback = feedback

    db.session.commit()

    return jsonify({
        "message": "AI checked your submission",
        "is_correct": is_correct,
        "xp_earned": submission.xp_earned,
        "feedback": feedback
    }), 200


# ---------------------------------------------------------
# История отправок
# ---------------------------------------------------------
@student_bp.route('/submissions', methods=['GET'])
@token_required
def get_submissions(current_student_id):
    submissions = StudentSubmission.query.filter_by(student_id=current_student_id).all()

    return jsonify([
        {
            "id": s.id,
            "task_id": s.task_id,
            "code": s.code,
            "is_correct": s.is_correct,
            "xp_earned": s.xp_earned,
            "submitted_at": s.submitted_at.isoformat(),
            "feedback": s.feedback
        }
        for s in submissions
    ]), 200
