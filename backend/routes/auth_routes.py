from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from database import users_collection, activity_logs_collection
from bson import ObjectId
from datetime import datetime

auth_bp = Blueprint("auth", __name__)

# ─── Helper: Log Activity ─────────────────────────────────────────
# Every login/signup is recorded so admin can see user history
def log_activity(user_id, user_name, user_email, action):
    activity_logs_collection.insert_one({
        "user_id":    str(user_id),
        "user_name":  user_name,
        "user_email": user_email,
        "action":     action,   # e.g. "signup", "login"
        "timestamp":  datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    })

# ─── SIGNUP ──────────────────────────────────────────────────────
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data     = request.get_json()
    name     = data.get("name")
    email    = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409

    hashed_password = generate_password_hash(password)

    new_user = {
        "name":       name,
        "email":      email,
        "password":   hashed_password,
        "role":       "user",   # "user" or "admin"
        "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    }

    result = users_collection.insert_one(new_user)

    # Log the signup activity
    log_activity(result.inserted_id, name, email, "signup")

    return jsonify({
        "message": "Account created successfully!",
        "user_id": str(result.inserted_id)
    }), 201


# ─── LOGIN ────────────────────────────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
def login():
    data     = request.get_json()
    email    = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})

    if not user or not check_password_hash(user["password"], password):
        # Log failed login attempt too
        if user:
            log_activity(user["_id"], user["name"], email, "failed_login")
        return jsonify({"error": "Invalid email or password"}), 401

    # Log successful login
    log_activity(user["_id"], user["name"], email, "login")

    token = create_access_token(identity=str(user["_id"]))

    return jsonify({
        "message": "Login successful!",
        "token":   token,
        "name":    user["name"],
        "email":   user["email"],
        "role":    user.get("role", "user")  # send role to frontend
    }), 200


# ─── ADMIN LOGIN ──────────────────────────────────────────────────
# Separate admin login — checks role == "admin"
@auth_bp.route("/admin-login", methods=["POST"])
def admin_login():
    data     = request.get_json()
    email    = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})

    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    if user.get("role") != "admin":
        return jsonify({"error": "Access denied. Admins only."}), 403

    log_activity(user["_id"], user["name"], email, "admin_login")

    token = create_access_token(identity=str(user["_id"]))

    return jsonify({
        "message": "Admin login successful!",
        "token":   token,
        "name":    user["name"],
        "role":    "admin"
    }), 200
