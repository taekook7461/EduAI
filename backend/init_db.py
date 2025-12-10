from extensions import db
from models import SuperAdmin
from werkzeug.security import generate_password_hash

def create_default_superadmin():
    if SuperAdmin.query.count() == 0:
        admin = SuperAdmin(
            email="admin@admin.com",
            password_hash=generate_password_hash("admin123")
        )
        db.session.add(admin)
        db.session.commit()
        print("Default SUPERADMIN created!")
    else:
        print("SuperAdmin already exists.")
