from flask import Blueprint, request, jsonify
from extensions import db
from models import Teacher, Student, SuperAdmin
from werkzeug.security import check_password_hash, generate_password_hash
import jwt
import os
from datetime import datetime, timedelta

auth_bp = Blueprint("auth", __name__)

# Надежный fallback если .env пуст или отсутствует
SECRET_KEY = os.getenv("JWT_SECRET_KEY") or "SUPER_SECRET_KEY_123"


# -----------------------------------------------------
# JWT TOKEN CREATOR
# -----------------------------------------------------
def create_token(user_id, role):
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=5),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


# -----------------------------------------------------
# UNIVERSAL LOGIN (superadmin + teacher + student)
# -----------------------------------------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    # Validate input
    if not email or not password or not role:
        return jsonify({"message": "Missing required fields"}), 400

    # ---------------- SUPERADMIN ----------------
    if role == "superadmin":
        user = SuperAdmin.query.filter_by(email=email).first()
        if not user:
            return jsonify({"message": "SuperAdmin not found"}), 404

        if not check_password_hash(user.password_hash, password):
            return jsonify({"message": "Invalid password"}), 401

        token = create_token(user.id, "superadmin")
        return jsonify({
            "token": token,
            "user_id": user.id,
            "role": "superadmin"
        }), 200

    # ---------------- TEACHER ----------------
    elif role == "teacher":
        user = Teacher.query.filter_by(email=email).first()
        if not user:
            return jsonify({"message": "Teacher not found"}), 404

        if not check_password_hash(user.password_hash, password):
            return jsonify({"message": "Invalid password"}), 401

        token = create_token(user.id, "teacher")
        return jsonify({
            "token": token,
            "user_id": user.id,
            "role": "teacher"
        }), 200

    # ---------------- STUDENT ----------------
    elif role == "student":
        user = Student.query.filter_by(email=email).first()
        if not user:
            return jsonify({"message": "Student not found"}), 404

        # ЖАЙ ТЕКСТ салыстыру
        if user.password != password:
            return jsonify({"message": "Invalid password"}), 401

        token = create_token(user.id, "student")
        return jsonify({"token": token, "user_id": user.id, "role": "student"}), 200

# -----------------------------------------------------
# SUPERADMIN REGISTRATION
# -----------------------------------------------------
@auth_bp.route("/register_admin", methods=["POST"])
def register_admin():
    data = request.get_json() or {}

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Missing fields"}), 400

    if SuperAdmin.query.filter_by(email=email).first():
        return jsonify({"message": "Admin already exists"}), 409

    hashed_pw = generate_password_hash(password)
    admin = SuperAdmin(email=email, password_hash=hashed_pw)

    db.session.add(admin)
    db.session.commit()

    return jsonify({"message": "SuperAdmin created"}), 201
