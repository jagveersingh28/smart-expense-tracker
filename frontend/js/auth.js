// ─── auth.js ──────────────────────────────────────────────────────
// Handles: login form, signup form, logout, protecting pages
// ─────────────────────────────────────────────────────────────────

// On every page load, show the user's name if logged in
document.addEventListener("DOMContentLoaded", () => {
  const nameEl = document.getElementById("user-name-display");
  if (nameEl) {
    nameEl.textContent = localStorage.getItem("name") || "User";
  }

  const isAuthPage = document.body.classList.contains("auth-page");
  if (!isAuthPage && !localStorage.getItem("token")) {
    window.location.href = "index.html";
  }

  // If admin tries to access user dashboard, redirect to admin dashboard
  if (!isAuthPage && localStorage.getItem("role") === "admin") {
    const adminPages = ["admin-dashboard", "admin-users", "admin-logs"];
    const currentPage = window.location.pathname;
    const isAdminPage = adminPages.some(p => currentPage.includes(p));
    if (!isAdminPage) {
      window.location.href = "admin-dashboard.html";
    }
  }
});

// ─── TAB TOGGLE (Login / Signup) ─────────────────────────────────
function showTab(tab) {
  document.getElementById("login-form").classList.toggle("hidden",  tab !== "login");
  document.getElementById("signup-form").classList.toggle("hidden", tab !== "signup");

  // Toggle active class on buttons
  document.querySelectorAll(".tab-btn").forEach((btn, i) => {
    btn.classList.toggle("active", (i === 0 && tab === "login") || (i === 1 && tab === "signup"));
  });
}

// ─── LOGIN HANDLER ────────────────────────────────────────────────
async function handleLogin(event) {
  event.preventDefault(); // Stop page refresh on form submit

  const email    = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const msgEl    = document.getElementById("login-msg");
  const btn      = document.getElementById("login-btn");

  btn.textContent = "Logging in...";
  btn.disabled    = true;

  const data = await apiLogin(email, password);

  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("name",  data.name);
    localStorage.setItem("email", data.email);
    localStorage.setItem("role",  data.role);

    msgEl.textContent = "Login successful! Redirecting...";
    msgEl.className   = "form-msg success";

    // Redirect based on role
    if (data.role === "admin") {
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_name",  data.name);
        setTimeout(() => window.location.href = "admin-dashboard.html", 800);
    } else {
        setTimeout(() => window.location.href = "dashboard.html", 800);
    }
  } else {
    msgEl.textContent = data.error || "Login failed";
    msgEl.className   = "form-msg error";
    btn.textContent   = "Login";
    btn.disabled      = false;
  }
}

// ─── SIGNUP HANDLER ───────────────────────────────────────────────
async function handleSignup(event) {
  event.preventDefault();

  const name     = document.getElementById("signup-name").value;
  const email    = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const msgEl    = document.getElementById("signup-msg");
  const btn      = document.getElementById("signup-btn");

  btn.textContent = "Creating account...";
  btn.disabled    = true;

  const data = await apiSignup(name, email, password);

  if (data.user_id) {
    msgEl.textContent = "Account created! Please login.";
    msgEl.className   = "form-msg success";
    showTab("login"); // Switch to login tab
  } else {
    msgEl.textContent = data.error || "Signup failed";
    msgEl.className   = "form-msg error";
  }

  btn.textContent = "Create Account";
  btn.disabled    = false;
}

// ─── LOGOUT ───────────────────────────────────────────────────────
function logout() {
  // Remove stored session data
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  localStorage.removeItem("email");
  localStorage.removeItem("role");
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_name");
  window.location.href = "index.html";
}
