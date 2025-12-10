from flask import Blueprint, request, jsonify
from extensions import db
from werkzeug.security import generate_password_hash
from models import Teacher, Student

admin_routes = Blueprint("admin_routes", __name__)


# -----------------------------------------
# GET ALL TEACHERS
# -----------------------------------------
@admin_routes.route("/teachers", methods=["GET"])
def get_teachers():
    teachers = Teacher.query.all()
    return jsonify([
        {"id": t.id, "email": t.email}
        for t in teachers
    ]), 200


# -----------------------------------------
# GET ALL STUDENTS
# -----------------------------------------
@admin_routes.route("/students", methods=["GET"])
def get_students():
    students = Student.query.all()
    result = []

    for s in students:
        teacher = None
        if s.teacher:
            teacher = {
                "id": s.teacher.id,
                "email": s.teacher.email
            }

        result.append({
            "id": s.id,
            "email": s.email,
            "first_name": s.first_name,
            "last_name": s.last_name,
            "teacher": teacher
        })

    return jsonify(result), 200


# -----------------------------------------
# CREATE TEACHER
# -----------------------------------------
@admin_routes.route("/teachers", methods=["POST"])
def add_teacher():
    data = request.get_json() or {}

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    if Teacher.query.filter_by(email=email).first():
        return jsonify({"error": "Teacher already exists"}), 409

    t = Teacher(
        email=email,
        password_hash=generate_password_hash(password)
    )

    db.session.add(t)
    db.session.commit()

    return jsonify({"message": "Teacher created"}), 201


# -----------------------------------------
# CREATE STUDENT
# -----------------------------------------
@admin_routes.route("/students", methods=["POST"])
def add_student():
    data = request.get_json() or {}

    email = data.get("email")
    password = data.get("password")
    teacher_id = data.get("teacher_id")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    if Student.query.filter_by(email=email).first():
        return jsonify({"error": "Student already exists"}), 409

    # пустая строка → None
    if teacher_id in ["", None, "null", "undefined"]:
        teacher_id = None

    student = Student(
        email=email,
        password=password,
        first_name=data.get("first_name", "NoName"),
        last_name=data.get("last_name", "NoLast"),
        teacher_id=teacher_id
    )

    db.session.add(student)
    db.session.commit()

    return jsonify({"message": "Student created"}), 201


# -----------------------------------------
# ASSIGN STUDENT TO TEACHER
# -----------------------------------------
@admin_routes.route("/assign-student", methods=["POST"])
def assign_student():
    data = request.get_json() or {}

    student_id = data.get("student_id")
    teacher_id = data.get("teacher_id")

    if not student_id or not teacher_id:
        return jsonify({"error": "Missing student_id or teacher_id"}), 400

    student = Student.query.get(student_id)
    teacher = Teacher.query.get(teacher_id)

    if not student or not teacher:
        return jsonify({"error": "Student or teacher not found"}), 404

    student.teacher_id = teacher.id
    db.session.commit()

    return jsonify({"message": "Assigned"}), 200
