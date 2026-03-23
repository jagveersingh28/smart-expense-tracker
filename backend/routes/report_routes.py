from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import transactions_collection
from collections import defaultdict

report_bp = Blueprint("reports", __name__)


# ─── MONTHLY SUMMARY ─────────────────────────────────────────────
# GET /api/reports/summary?month=2024-06
# Returns: total income, total expenses, balance, breakdown by category
@report_bp.route("/summary", methods=["GET"])
@jwt_required()
def monthly_summary():
    user_id = get_jwt_identity()
    month   = request.args.get("month")

    if not month:
        return jsonify({"error": "month query param required"}), 400

    # Fetch all transactions for this user in this month
    transactions = list(transactions_collection.find({
        "user_id": user_id,
        "date":    {"$regex": f"^{month}"}
    }))

    total_income  = 0
    total_expense = 0
    category_totals = defaultdict(float)  # { "food": 1200, "travel": 500 }

    for t in transactions:
        if t["type"] == "income":
            total_income += t["amount"]
        else:
            total_expense        += t["amount"]
            category_totals[t["category"]] += t["amount"]

    return jsonify({
        "month":            month,
        "total_income":     total_income,
        "total_expense":    total_expense,
        "balance":          total_income - total_expense,
        "category_totals":  dict(category_totals)  # Used for pie chart
    }), 200


# ─── LAST 6 MONTHS TREND ─────────────────────────────────────────
# GET /api/reports/trend
# Returns monthly income vs expense for last 6 months (for bar chart)
@report_bp.route("/trend", methods=["GET"])
@jwt_required()
def trend():
    user_id = get_jwt_identity()

    # Fetch all transactions for this user
    transactions = list(transactions_collection.find({"user_id": user_id}))

    monthly = defaultdict(lambda: {"income": 0, "expense": 0})

    for t in transactions:
        # Extract YYYY-MM from date string
        month_key = t["date"][:7]
        if t["type"] == "income":
            monthly[month_key]["income"] += t["amount"]
        else:
            monthly[month_key]["expense"] += t["amount"]

    # Sort by month and return last 6 months
    sorted_months = sorted(monthly.keys())[-6:]

    result = [
        {
            "month":   m,
            "income":  monthly[m]["income"],
            "expense": monthly[m]["expense"]
        }
        for m in sorted_months
    ]

    return jsonify(result), 200
