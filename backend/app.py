from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

load_dotenv()

from routes.auth_routes import auth_bp
from routes.transaction_routes import transaction_bp
from routes.budget_routes import budget_bp
from routes.report_routes import report_bp
from routes.admin_routes import admin_bp          # NEW: admin routes

app = Flask(__name__)
CORS(app, origins=["http://127.0.0.1:5500", "http://localhost:5500", "https://smart-expense-tracker-gray.vercel.app"])

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key")
jwt = JWTManager(app)

# ─── Register all blueprints ──────────────────────────────────────
app.register_blueprint(auth_bp,        url_prefix="/api/auth")
app.register_blueprint(transaction_bp, url_prefix="/api/transactions")
app.register_blueprint(budget_bp,      url_prefix="/api/budgets")
app.register_blueprint(report_bp,      url_prefix="/api/reports")
app.register_blueprint(admin_bp,       url_prefix="/api/admin")   # NEW

@app.route("/")
def index():
    return {"message": "Smart Expense Tracker API is running!"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)