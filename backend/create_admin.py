"""
Run this ONCE to create your admin account.
Usage: python create_admin.py
"""
from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from datetime import datetime

# ── Connect to local MongoDB ──────────────────────────────────────
client = MongoClient("mongodb://127.0.0.1:27017/")
db     = client["expense_tracker"]
users  = db["users"]

# ── Admin credentials — CHANGE THESE ─────────────────────────────
ADMIN_EMAIL    = "admin@expenseiq.com"
ADMIN_PASSWORD = "admin@123"        # change this to something strong
ADMIN_NAME     = "Admin"

# ── Check if admin already exists ────────────────────────────────
if users.find_one({"email": ADMIN_EMAIL}):
    print(f"⚠️  Admin already exists with email: {ADMIN_EMAIL}")
else:
    users.insert_one({
        "name":       ADMIN_NAME,
        "email":      ADMIN_EMAIL,
        "password":   generate_password_hash(ADMIN_PASSWORD),
        "role":       "admin",
        "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    })
    print(f"✅ Admin account created!")
    print(f"   Email:    {ADMIN_EMAIL}")
    print(f"   Password: {ADMIN_PASSWORD}")
    print(f"\n👉 Login at: http://127.0.0.1:5500/frontend/pages/admin-login.html")
