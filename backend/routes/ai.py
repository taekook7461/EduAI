from flask import Blueprint, request, jsonify
import jwt
from functools import wraps
from extensions import db
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

ai_bp = Blueprint('ai', __name__)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SECRET_KEY = os.getenv("JWT_SECRET_KEY")


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            token = token.split(' ')[1]
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            user_id = data.get("user_id")
        except Exception:
            return jsonify({'message': 'Invalid token'}), 401

        return f(user_id, *args, **kwargs)

    return decorated


@ai_bp.route('/analyze-task', methods=['POST'])
@token_required
def analyze_task(current_user_id):
    data = request.get_json()
    student_code = data.get("code", "").strip()

    if not student_code:
        return jsonify({"message": "Code is required"}), 400

    system_prompt = (
        "You are an experienced Python teacher. Analyze the student's code. "
        "Return ONLY JSON like:\n"
        "{\n"
        "  \"complexity\": \"low\" | \"medium\" | \"high\",\n"
        "  \"estimated_time\": number,\n"
        "  \"recommendations\": [\"text1\", \"text2\"]\n"
        "}"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": student_code}
            ],
            temperature=0.4,
            max_tokens=500
        )

        raw = response.choices[0].message.content

        import json
        try:
            parsed = json.loads(raw)
        except:
            parsed = {
                "complexity": "medium",
                "estimated_time": 30,
                "recommendations": ["Check syntax", "Fix formatting", raw]
            }

        return jsonify(parsed), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@ai_bp.route('/generate-tasks', methods=['POST'])
@token_required
def generate_tasks(current_user_id):
    data = request.get_json()
    prompt = data.get("prompt", "").strip()

    if not prompt:
        return jsonify({"message": "Prompt is required"}), 400

    system_prompt = (
        "You are an informatics teacher. Generate 3 Python tasks. "
        "Return ONLY JSON array like:\n"
        "[{\n"
        "  \"title\": \"...\",\n"
        "  \"description\": \"...\",\n"
        "  \"difficulty\": \"Beginner\" | \"Intermediate\" | \"Advanced\",\n"
        "  \"example_code\": \"code here...\",\n"
        "  \"hints\": [\"h1\", \"h2\"]\n"
        "}]"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=800
        )

        raw = response.choices[0].message.content

        import json
        try:
            tasks = json.loads(raw)
        except:
            tasks = [{
                "title": f"Fallback {prompt}",
                "description": "Parsing error",
                "difficulty": "Intermediate",
                "example_code": "def solution(): pass",
                "hints": ["Review your logic", raw]
            }]

        return jsonify(tasks), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
