from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import budgets_collection, transactions_collection
from bson import ObjectId

budget_bp = Blueprint("budgets", __name__)

def serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc


# ─── SET BUDGET ───────────────────────────────────────────────────
# POST /api/budgets/set
# Set a spending limit for a category in a given month
@budget_bp.route("/set", methods=["POST"])
@jwt_required()
def set_budget():
    user_id = get_jwt_identity()
    data    = request.get_json()

    category = data.get("category")
    limit    = data.get("limit")
    month    = data.get("month")  # Format: "2024-06"

    if not category or not limit or not month:
        return jsonify({"error": "category, limit, and month are required"}), 400

    # Upsert: update if exists, insert if not
    # This prevents duplicate budgets for the same category+month
    budgets_collection.update_one(
        {"user_id": user_id, "category": category, "month": month},
        {"$set": {"limit": float(limit)}},
        upsert=True
    )

    return jsonify({"message": f"Budget set for {category} in {month}"}), 200


# ─── GET BUDGETS WITH SPENDING ────────────────────────────────────
# GET /api/budgets/?month=2024-06
# Returns budgets + how much has been spent in each category
@budget_bp.route("/", methods=["GET"])
@jwt_required()
def get_budgets():
    user_id = get_jwt_identity()
    month   = request.args.get("month")

    if not month:
        return jsonify({"error": "month query param required"}), 400

    # Fetch all budgets for this user in this month
    budgets = list(budgets_collection.find({"user_id": user_id, "month": month}))

    result = []
    for budget in budgets:
        category = budget["category"]

        # Calculate total spent in this category this month
        spent_cursor = transactions_collection.find({
            "user_id":  user_id,
            "type":     "expense",
            "category": category,
            "date":     {"$regex": f"^{month}"}
        })

        total_spent = sum(t["amount"] for t in spent_cursor)

        result.append({
            "_id":      str(budget["_id"]),
            "category": category,
            "limit":    budget["limit"],
            "spent":    total_spent,
            # Alert if spending >= 90% of budget
            "alert":    total_spent >= (budget["limit"] * 0.9)
        })

    return jsonify(result), 200
