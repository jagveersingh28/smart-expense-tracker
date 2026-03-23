# 💸 Smart Expense Tracker — ExpenseIQ

A full-stack personal finance web app to track income, expenses, budgets, and generate monthly reports.

---

## 🔧 Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | HTML, CSS, JavaScript   |
| Backend   | Python (Flask)          |
| Database  | MongoDB                 |
| Auth      | JWT (JSON Web Tokens)   |
| Charts    | Chart.js                |
| PDF       | jsPDF                   |

---

## 📁 Project Structure

```
smart-expense-tracker/
├── backend/
│   ├── app.py                  ← Flask app entry point
│   ├── database.py             ← MongoDB connection
│   ├── requirements.txt        ← Python dependencies
│   ├── .env.example            ← Environment variable template
│   └── routes/
│       ├── auth_routes.py      ← Signup / Login
│       ├── transaction_routes.py ← Add / Get / Delete transactions
│       ├── budget_routes.py    ← Set / Get budgets
│       └── report_routes.py    ← Monthly summary & trend
│
└── frontend/
    ├── pages/
    │   ├── index.html          ← Login / Signup
    │   ├── dashboard.html      ← Summary + Charts
    │   ├── transactions.html   ← Add & view transactions
    │   ├── budgets.html        ← Set & track budgets
    │   └── reports.html        ← Monthly report + PDF export
    ├── css/
    │   └── style.css
    └── js/
        ├── api.js              ← All API calls (bridge)
        ├── auth.js             ← Login/Signup/Logout logic
        ├── dashboard.js        ← Charts & summary
        ├── transactions.js     ← Transaction CRUD
        ├── budgets.js          ← Budget progress bars
        └── reports.js          ← Report + PDF export
```

---

## 🚀 How to Run Locally

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/smart-expense-tracker.git
cd smart-expense-tracker
```

### 2. Setup Backend
```bash
cd backend
pip install -r requirements.txt

# Create .env file from template
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET_KEY

python app.py
```
> Backend runs at: http://localhost:5000

### 3. Run Frontend
Open `frontend/pages/index.html` directly in your browser,  
or use Live Server extension in VS Code.

### 4. MongoDB
- Install [MongoDB](https://www.mongodb.com/try/download/community) locally, OR
- Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud DB) and paste the URI in `.env`

---

## ✨ Features

- 🔐 User Authentication (JWT)
- 💳 Add / Delete income & expenses
- 🏷️ Category-wise tracking (Food, Travel, Bills, etc.)
- 📊 Dashboard with Pie & Bar charts
- 🎯 Monthly budget limits with progress bars
- ⚠️ Budget alerts (when 90% is spent)
- 📈 Monthly reports with category breakdown
- ⬇️ Export reports as PDF

---

## 📸 Pages

| Page | Description |
|------|-------------|
| Login/Signup | Auth with JWT |
| Dashboard | Summary cards + Charts |
| Transactions | Add & filter transactions |
| Budgets | Set limits & progress bars |
| Reports | Monthly summary + PDF export |

---

## 👨‍💻 Author

Made as a college project — Full Stack Web Development
