// ─── api.js ──────────────────────────────────────────────────────
// Bridge between frontend and backend — all fetch() calls live here
// ─────────────────────────────────────────────────────────────────

const BASE_URL = "https://smart-expense-tracker-83jk.onrender.com/api";

function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("admin_token");
}

function headers(withAuth = true) {
  const h = { "Content-Type": "application/json" };
  if (withAuth) h["Authorization"] = `Bearer ${getToken()}`;
  return h;
}

// ─── AUTH ─────────────────────────────────────────────────────────
async function apiSignup(name, email, password) {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST", headers: headers(false),
    body: JSON.stringify({ name, email, password })
  });
  return res.json();
}

async function apiLogin(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST", headers: headers(false),
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

// Admin login uses separate endpoint
async function apiAdminLogin(email, password) {
  const res = await fetch(`${BASE_URL}/auth/admin-login`, {
    method: "POST", headers: headers(false),
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

// ─── TRANSACTIONS ──────────────────────────────────────────────────
async function apiAddTransaction(data) {
  const res = await fetch(`${BASE_URL}/transactions/add`, {
    method: "POST", headers: headers(),
    body: JSON.stringify(data)
  });
  return res.json();
}

async function apiGetTransactions(month = "", category = "") {
  const res = await fetch(`${BASE_URL}/transactions/?month=${month}&category=${category}`, {
    headers: headers()
  });
  return res.json();
}

async function apiDeleteTransaction(id) {
  const res = await fetch(`${BASE_URL}/transactions/${id}`, {
    method: "DELETE", headers: headers()
  });
  return res.json();
}

// ─── BUDGETS ───────────────────────────────────────────────────────
async function apiSetBudget(category, limit, month) {
  const res = await fetch(`${BASE_URL}/budgets/set`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ category, limit, month })
  });
  return res.json();
}

async function apiGetBudgets(month) {
  const res = await fetch(`${BASE_URL}/budgets/?month=${month}`, {
    headers: headers()
  });
  return res.json();
}

// ─── REPORTS ───────────────────────────────────────────────────────
async function apiGetSummary(month) {
  const res = await fetch(`${BASE_URL}/reports/summary?month=${month}`, {
    headers: headers()
  });
  return res.json();
}

async function apiGetTrend() {
  const res = await fetch(`${BASE_URL}/reports/trend`, {
    headers: headers()
  });
  return res.json();
}

// ─── ADMIN ─────────────────────────────────────────────────────────
async function apiAdminGetStats() {
  const res = await fetch(`${BASE_URL}/admin/stats`, { headers: headers() });
  return res.json();
}

async function apiAdminGetUsers() {
  const res = await fetch(`${BASE_URL}/admin/users`, { headers: headers() });
  return res.json();
}

async function apiAdminGetLogs(email = "") {
  const res = await fetch(`${BASE_URL}/admin/logs?email=${email}`, { headers: headers() });
  return res.json();
}

async function apiAdminDeleteUser(id) {
  const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
    method: "DELETE", headers: headers()
  });
  return res.json();
}
