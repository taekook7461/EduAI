from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from extensions import db
from init_db import create_default_superadmin

# Загружаем переменные окружения (.env)
load_dotenv()


def create_app():
    app = Flask(__name__)

    # -------------------------------
    # 🔧 Настройки приложения
    # -------------------------------
    app.config['SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev_secret_key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'DATABASE_URL', 'sqlite:///instance/school.db'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY", None)

    # -------------------------------
    # 🧩 Подключаем базу данных
    # -------------------------------
    db.init_app(app)

    # -------------------------------
    # 📦 Импортируем модели
    # -------------------------------
    try:
        from models import (
            Teacher,
            Student,
            Task,
            TaskAssignment,
            StudentSubmission,
            SuperAdmin,
        )
    except Exception as e:
        print("⚠️ Ошибка при импорте моделей:", e)

    # -------------------------------
    # 🔌 Импорт и регистрация роутов
    # -------------------------------
    from routes.ai import ai_bp
    from routes.auth import auth_bp
    from routes.teacher import teacher_bp
    from routes.student import student_bp
    from routes.admin import admin_routes

    # Все маршруты начинаются с /api/
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(teacher_bp, url_prefix='/api/teacher')
    app.register_blueprint(student_bp, url_prefix='/api/student')
    app.register_blueprint(admin_routes, url_prefix='/api/admin')

    # -------------------------------
    # 🌐 CORS — разрешаем запросы от фронтенда
    # -------------------------------
    # Разрешаем запросы с localhost:3000 (Next.js)
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

    # -------------------------------
    # 🧠 Тестовый маршрут (для проверки связи)
    # -------------------------------
    @app.route('/api/health')
    def health():
        return jsonify({"status": "ok", "message": "Backend connected successfully"}), 200

    return app


# ---------------------------------
# 🏁 Точка входа
# ---------------------------------
app = create_app()

if __name__ == "__main__":
    # Убедимся, что папка instance существует
    instance_dir = os.path.join(os.path.dirname(__file__), "instance")
    os.makedirs(instance_dir, exist_ok=True)

    with app.app_context():
        # Создаём таблицы, если их нет
        db.create_all()

        # Создаём дефолтного супер-админа (если отсутствует)
        try:
            create_default_superadmin()
        except Exception as e:
            print("⚠️ Не удалось создать супер-админа:", e)

    # Запускаем сервер
    print("🚀 Flask сервер запущен на http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
