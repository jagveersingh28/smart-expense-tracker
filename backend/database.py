from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

# ─── Connect to MongoDB (Local PC) ───────────────────────────────
# Connects to MongoDB installed on YOUR computer
# Data is physically stored at: C:\data\db (Windows)
# Change MONGO_URI in .env file if needed
MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/")

client = MongoClient(MONGO_URI)

# Select (or create) the database named "expense_tracker"
db = client["expense_tracker"]

# ─── Collections ─────────────────────────────────────────────────
users_collection         = db["users"]          # user accounts
transactions_collection  = db["transactions"]   # income & expenses
budgets_collection       = db["budgets"]        # budget limits
activity_logs_collection = db["activity_logs"]  # admin log history
