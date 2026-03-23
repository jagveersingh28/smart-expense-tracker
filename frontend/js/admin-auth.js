// ─── admin-auth.js ────────────────────────────────────────────────
// Handles admin login, logout, and page protection
// ─────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const nameEl = document.getElementById("admin-name-display");
  if (nameEl) nameEl.textContent = localStorage.getItem("admin_name") || "Admin";

  // Protect admin pages — redirect to admin login if not logged in
  const isLoginPage = window.location.pathname.includes("admin-login");
  if (!isLoginPage && !localStorage.getItem("admin_token")) {
    window.location.href = "admin-login.html";
  }
});

// ─── ADMIN LOGIN ──────────────────────────────────────────────────
async function handleAdminLogin(event) {
  event.preventDefault();

  const email    = document.getElementById("admin-email").value;
  const password = document.getElementById("admin-password").value;
  const msgEl    = document.getElementById("admin-login-msg");
  const btn      = document.getElementById("admin-login-btn");

  btn.textContent = "Logging in...";
  btn.disabled    = true;

  const data = await apiAdminLogin(email, password);

  if (data.token) {
    // Store admin token separately from user token
    localStorage.setItem("admin_token", data.token);
    localStorage.setItem("admin_name",  data.name);

    msgEl.textContent = "✅ Access granted! Redirecting...";
    msgEl.className   = "form-msg success";

    setTimeout(() => window.location.href = "admin-dashboard.html", 800);
  } else {
    msgEl.textContent = data.error || "Login failed";
    msgEl.className   = "form-msg error";
    btn.textContent   = "Login as Admin";
    btn.disabled      = false;
  }
}

// ─── ADMIN LOGOUT ─────────────────────────────────────────────────
function adminLogout() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_name");
  window.location.href = "admin-login.html";
}
