// ─── admin-dashboard.js ───────────────────────────────────────────
document.addEventListener("DOMContentLoaded", loadAdminStats);

async function loadAdminStats() {
  const stats = await apiAdminGetStats();

  document.getElementById("stat-users").textContent   = stats.total_users        || 0;
  document.getElementById("stat-txns").textContent    = stats.total_transactions  || 0;
  document.getElementById("stat-logins").textContent  = stats.todays_logins       || 0;
  document.getElementById("stat-income").textContent  = `₹${(stats.total_income_tracked  || 0).toLocaleString()}`;
  document.getElementById("stat-expense").textContent = `₹${(stats.total_expense_tracked || 0).toLocaleString()}`;

  // Recent users table
  const tbody = document.getElementById("recent-users-body");
  tbody.innerHTML = "";

  if (!stats.recent_users || stats.recent_users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">No users yet</td></tr>`;
    return;
  }

  stats.recent_users.forEach(user => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.created_at || "N/A"}</td>
      <td><span class="role-badge ${user.role}">${user.role}</span></td>
    `;
    tbody.appendChild(row);
  });
}
