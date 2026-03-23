// ─── transactions.js ─────────────────────────────────────────────
// Handles: adding transactions, listing them, deleting them
// ─────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  // Set today's date as default in date input
  document.getElementById("txn-date").value = new Date().toISOString().split("T")[0];

  // Set current month as filter default
  document.getElementById("filter-month").value = getCurrentMonth();

  loadTransactions();
});

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// ─── ADD TRANSACTION ──────────────────────────────────────────────
async function handleAddTransaction(event) {
  event.preventDefault();

  const msgEl = document.getElementById("txn-msg");

  // Collect form values
  const data = {
    type:        document.getElementById("txn-type").value,
    amount:      document.getElementById("txn-amount").value,
    category:    document.getElementById("txn-category").value,
    description: document.getElementById("txn-desc").value,
    date:        document.getElementById("txn-date").value
  };

  const result = await apiAddTransaction(data);

  if (result.transaction) {
    msgEl.textContent = "✅ Transaction added!";
    msgEl.className   = "form-msg success";
    event.target.reset(); // Clear the form
    document.getElementById("txn-date").value = new Date().toISOString().split("T")[0];
    loadTransactions(); // Refresh the list
  } else {
    msgEl.textContent = result.error || "Failed to add transaction";
    msgEl.className   = "form-msg error";
  }

  // Clear message after 3 seconds
  setTimeout(() => msgEl.textContent = "", 3000);
}

// ─── LOAD & DISPLAY TRANSACTIONS ─────────────────────────────────
async function loadTransactions() {
  const month    = document.getElementById("filter-month").value;
  const category = document.getElementById("filter-category").value;

  const transactions = await apiGetTransactions(month, category);
  const container    = document.getElementById("transaction-list");
  container.innerHTML = "";

  if (!transactions.length) {
    container.innerHTML = `<div class="empty-state">No transactions found. Add your first one above! 💳</div>`;
    return;
  }

  // Render each transaction as a card
  transactions.forEach(txn => {
    const item = document.createElement("div");
    item.className = "txn-item";

    const sign = txn.type === "income" ? "+" : "-";

    item.innerHTML = `
      <div class="txn-left">
        <span class="txn-desc">${txn.description}</span>
        <span class="txn-meta">${categoryEmoji(txn.category)} ${capitalize(txn.category)} &nbsp;·&nbsp; ${txn.date}</span>
      </div>
      <div class="txn-right">
        <span class="txn-amount ${txn.type}">${sign}₹${txn.amount.toLocaleString()}</span>
        <button class="btn-delete" onclick="deleteTransaction('${txn._id}')" title="Delete">🗑️</button>
      </div>
    `;
    container.appendChild(item);
  });
}

// ─── DELETE TRANSACTION ───────────────────────────────────────────
async function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;

  const result = await apiDeleteTransaction(id);

  if (result.message) {
    loadTransactions(); // Refresh list after delete
  } else {
    alert("Failed to delete: " + (result.error || "Unknown error"));
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function categoryEmoji(cat) {
  const map = {
    food: "🍔", travel: "✈️", bills: "💡", shopping: "🛍️",
    health: "💊", education: "📚", salary: "💼", other: "📦"
  };
  return map[cat] || "💰";
}
