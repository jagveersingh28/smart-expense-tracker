from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import transactions_collection
from bson import ObjectId
from datetime import datetime

transaction_bp = Blueprint("transactions", __name__)

# Helper: Convert MongoDB document to JSON-safe dict
def serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc


# ─── ADD TRANSACTION ─────────────────────────────────────────────
# POST /api/transactions/add
# @jwt_required() means: user must be logged in (send token in header)
@transaction_bp.route("/add", methods=["POST"])
@jwt_required()
def add_transaction():
    user_id = get_jwt_identity()  # Extract user ID from JWT token
    data    = request.get_json()

    # Validate required fields
    required = ["type", "amount", "category", "description"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    # Build transaction document
    transaction = {
        "user_id":     user_id,
        "type":        data["type"],        # "income" or "expense"
        "amount":      float(data["amount"]),
        "category":    data["category"],    # food, travel, bills, etc.
        "description": data["description"],
        "date":        data.get("date", datetime.utcnow().strftime("%Y-%m-%d"))
    }

    result = transactions_collection.insert_one(transaction)
    transaction["_id"] = str(result.inserted_id)

    return jsonify({"message": "Transaction added!", "transaction": transaction}), 201


# ─── GET ALL TRANSACTIONS ─────────────────────────────────────────
# GET /api/transactions/
# Returns all transactions for the logged-in user
@transaction_bp.route("/", methods=["GET"])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()

    # Optional filters from query params: ?month=2024-06&category=food
    month    = request.args.get("month")
    category = request.args.get("category")

    query = {"user_id": user_id}

    if month:
        # Filter by month: match dates starting with "2024-06"
        query["date"] = {"$regex": f"^{month}"}
    if category:
        query["category"] = category

    # Fetch from MongoDB, sort by date descending (newest first)
    transactions = list(transactions_collection.find(query).sort("date", -1))
    transactions = [serialize(t) for t in transactions]

    return jsonify(transactions), 200


# ─── DELETE TRANSACTION ───────────────────────────────────────────
# DELETE /api/transactions/<id>
@transaction_bp.route("/<id>", methods=["DELETE"])
@jwt_required()
def delete_transaction(id):
    user_id = get_jwt_identity()

    result = transactions_collection.delete_one({
        "_id":     ObjectId(id),
        "user_id": user_id  # Ensure user can only delete their own data
    })

    if result.deleted_count == 0:
        return jsonify({"error": "Transaction not found"}), 404

    return jsonify({"message": "Transaction deleted!"}), 200
