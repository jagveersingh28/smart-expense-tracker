from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import users_collection, transactions_collection, activity_logs_collection
from bson import ObjectId
from datetime import datetime

admin_bp = Blueprint("admin", __name__)

# ─── Helper: Check Admin Role ─────────────────────────────────────
def is_admin(user_id):
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    return user and user.get("role") == "admin"

def serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc

# ─── GET ALL USERS ────────────────────────────────────────────────
# GET /api/admin/users
# Returns list of all registered users
@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def get_all_users():
    user_id = get_jwt_identity()

    if not is_admin(user_id):
        return jsonify({"error": "Admins only"}), 403

    users = list(users_collection.find({}, {"password": 0}))  # exclude passwords

    result = []
    for user in users:
        uid = str(user["_id"])

        # Count transactions per user
        txn_count = transactions_collection.count_documents({"user_id": uid})

        # Total spent by user
        expenses = list(transactions_collection.find({
            "user_id": uid,
            "type":    "expense"
        }))
        total_spent = sum(e["amount"] for e in expenses)

        result.append({
            "_id":         uid,
            "name":        user.get("name", ""),
            "email":       user.get("email", ""),
            "role":        user.get("role", "user"),
            "created_at":  user.get("created_at", "N/A"),
            "txn_count":   txn_count,
            "total_spent": total_spent
        })

    return jsonify(result), 200


# ─── GET ACTIVITY LOGS ────────────────────────────────────────────
# GET /api/admin/logs
# Returns all user activity (login, signup, etc.)
@admin_bp.route("/logs", methods=["GET"])
@jwt_required()
def get_logs():
    user_id = get_jwt_identity()

    if not is_admin(user_id):
        return jsonify({"error": "Admins only"}), 403

    # Optional filter by user email
    email = request.args.get("email", "")
    query = {}
    if email:
        query["user_email"] = {"$regex": email, "$options": "i"}

    logs = list(activity_logs_collection.find(query).sort("timestamp", -1).limit(200))
    logs = [serialize(l) for l in logs]

    return jsonify(logs), 200


# ─── GET ADMIN STATS ──────────────────────────────────────────────
# GET /api/admin/stats
# Returns platform-wide statistics
@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_stats():
    user_id = get_jwt_identity()

    if not is_admin(user_id):
        return jsonify({"error": "Admins only"}), 403

    total_users        = users_collection.count_documents({"role": "user"})
    total_transactions = transactions_collection.count_documents({})

    # Total money tracked across all users
    all_expenses = list(transactions_collection.find({"type": "expense"}))
    all_income   = list(transactions_collection.find({"type": "income"}))

    total_expense_tracked = sum(e["amount"] for e in all_expenses)
    total_income_tracked  = sum(i["amount"] for i in all_income)

    # Recent signups (last 5)
    recent_users = list(users_collection.find(
        {"role": "user"},
        {"password": 0}
    ).sort("created_at", -1).limit(5))
    recent_users = [serialize(u) for u in recent_users]

    # Today's logins
    today = datetime.utcnow().strftime("%Y-%m-%d")
    todays_logins = activity_logs_collection.count_documents({
        "action":    "login",
        "timestamp": {"$regex": f"^{today}"}
    })

    return jsonify({
        "total_users":            total_users,
        "total_transactions":     total_transactions,
        "total_expense_tracked":  total_expense_tracked,
        "total_income_tracked":   total_income_tracked,
        "todays_logins":          todays_logins,
        "recent_users":           recent_users
    }), 200


# ─── DELETE USER ─────────────────────────────────────────────────
# DELETE /api/admin/users/<id>
@admin_bp.route("/users/<id>", methods=["DELETE"])
@jwt_required()
def delete_user(id):
    user_id = get_jwt_identity()

    if not is_admin(user_id):
        return jsonify({"error": "Admins only"}), 403

    # Delete user and all their data
    users_collection.delete_one({"_id": ObjectId(id)})
    transactions_collection.delete_many({"user_id": id})

    return jsonify({"message": "User deleted successfully"}), 200
