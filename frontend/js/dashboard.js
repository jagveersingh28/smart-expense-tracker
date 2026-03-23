// ─── dashboard.js ────────────────────────────────────────────────
// Loads: summary cards, budget alerts, pie chart, bar chart
// ─────────────────────────────────────────────────────────────────

let pieChart = null;
let barChart = null;

// Run when page loads
document.addEventListener("DOMContentLoaded", () => {
  // Set month picker to current month (e.g. "2024-06")
  const picker = document.getElementById("month-picker");
  picker.value = getCurrentMonth();
  loadDashboard();
});

// Helper: returns current month as "YYYY-MM"
function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// ─── MAIN LOAD FUNCTION ───────────────────────────────────────────
async function loadDashboard() {
  const month = document.getElementById("month-picker").value;
  if (!month) return;

  // Run all API calls in parallel for speed
  const [summary, budgets, trend] = await Promise.all([
    apiGetSummary(month),
    apiGetBudgets(month),
    apiGetTrend()
  ]);

  updateCards(summary);
  renderAlerts(budgets);
  renderPieChart(summary.category_totals || {});
  renderBarChart(trend);
}

// ─── UPDATE SUMMARY CARDS ─────────────────────────────────────────
function updateCards(summary) {
  document.getElementById("total-income").textContent  = `₹${(summary.total_income  || 0).toLocaleString()}`;
  document.getElementById("total-expense").textContent = `₹${(summary.total_expense || 0).toLocaleString()}`;
  document.getElementById("balance").textContent       = `₹${(summary.balance       || 0).toLocaleString()}`;
}

// ─── BUDGET ALERTS ────────────────────────────────────────────────
// Shows a warning if spending is >= 90% of budget limit
function renderAlerts(budgets) {
  const section = document.getElementById("alerts-section");
  section.innerHTML = "";

  const alerts = budgets.filter(b => b.alert);
  alerts.forEach(b => {
    const percent = Math.round((b.spent / b.limit) * 100);
    const div = document.createElement("div");
    div.className = "alert-box";
    div.textContent = `⚠️ ${capitalize(b.category)}: You've spent ₹${b.spent.toLocaleString()} of ₹${b.limit.toLocaleString()} budget (${percent}%)`;
    section.appendChild(div);
  });
}

// ─── PIE CHART (Category Breakdown) ──────────────────────────────
function renderPieChart(categoryTotals) {
  const labels = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);

  const colors = ["#6c63ff","#ff6584","#2ecc71","#f39c12","#3498db","#e74c3c","#9b59b6","#1abc9c"];

  // Destroy old chart before creating new one (prevents duplicates)
  if (pieChart) pieChart.destroy();

  const ctx = document.getElementById("pie-chart").getContext("2d");

  if (labels.length === 0) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return;
  }

  pieChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data:            values,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth:     0
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: "#e8eaf0", font: { size: 12 } }
        }
      }
    }
  });
}

// ─── BAR CHART (Income vs Expense trend) ─────────────────────────
function renderBarChart(trend) {
  if (barChart) barChart.destroy();

  const ctx    = document.getElementById("bar-chart").getContext("2d");
  const labels = trend.map(t => t.month);
  const income  = trend.map(t => t.income);
  const expense = trend.map(t => t.expense);

  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label:           "Income",
          data:            income,
          backgroundColor: "rgba(46,204,113,0.7)",
          borderRadius:    6
        },
        {
          label:           "Expense",
          data:            expense,
          backgroundColor: "rgba(231,76,60,0.7)",
          borderRadius:    6
        }
      ]
    },
    options: {
      plugins: {
        legend: { labels: { color: "#e8eaf0" } }
      },
      scales: {
        x: { ticks: { color: "#8b8fa8" }, grid: { color: "#2e3148" } },
        y: { ticks: { color: "#8b8fa8" }, grid: { color: "#2e3148" } }
      }
    }
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
