// ─── budgets.js ──────────────────────────────────────────────────
// Handles: setting budget limits, displaying spending progress bars
// ─────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  // Default to current month
  document.getElementById("budget-month").value = getCurrentMonth();
  loadBudgets();
});

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// ─── SET BUDGET ───────────────────────────────────────────────────
async function handleSetBudget(event) {
  event.preventDefault();

  const category = document.getElementById("budget-category").value;
  const limit    = document.getElementById("budget-limit").value;
  const month    = document.getElementById("budget-month").value;
  const msgEl    = document.getElementById("budget-msg");

  const result = await apiSetBudget(category, limit, month);

  if (result.message) {
    msgEl.textContent = "✅ Budget saved!";
    msgEl.className   = "form-msg success";
    loadBudgets(); // Refresh the list
  } else {
    msgEl.textContent = result.error || "Failed to save budget";
    msgEl.className   = "form-msg error";
  }

  setTimeout(() => msgEl.textContent = "", 3000);
}

// ─── LOAD BUDGETS ─────────────────────────────────────────────────
async function loadBudgets() {
  const month     = document.getElementById("budget-month").value;
  const budgets   = await apiGetBudgets(month);
  const container = document.getElementById("budget-list");
  container.innerHTML = "";

  if (!budgets.length) {
    container.innerHTML = `<div class="empty-state">No budgets set for this month. Set one above! 🎯</div>`;
    return;
  }

  budgets.forEach(budget => {
    const percent = Math.min(Math.round((budget.spent / budget.limit) * 100), 100);

    // Color the bar: green < 70%, yellow 70-90%, red > 90%
    let barClass = "";
    if (percent >= 90) barClass = "danger";
    else if (percent >= 70) barClass = "warning";

    const item = document.createElement("div");
    item.className = `budget-item${budget.alert ? " alert" : ""}`;

    item.innerHTML = `
      <div class="budget-header">
        <span class="budget-category">${categoryEmoji(budget.category)} ${capitalize(budget.category)}</span>
        <span class="budget-amounts">₹${budget.spent.toLocaleString()} / ₹${budget.limit.toLocaleString()}</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill ${barClass}" style="width: ${percent}%"></div>
      </div>
      <div style="display:flex; justify-content:space-between; margin-top:6px;">
        <span style="font-size:0.8rem; color:var(--text-muted)">${percent}% used</span>
        <span style="font-size:0.8rem; color:var(--text-muted)">₹${(budget.limit - budget.spent).toLocaleString()} remaining</span>
      </div>
      ${budget.alert ? `<p class="budget-alert-text">⚠️ You're close to your limit!</p>` : ""}
    `;

    container.appendChild(item);
  });
}

// ─── HELPERS ─────────────────────────────────────────────────────
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function categoryEmoji(cat) {
  const map = {
    food: "🍔", travel: "✈️", bills: "💡", shopping: "🛍️",
    health: "💊", education: "📚", other: "📦"
  };
  return map[cat] || "💰";
}
