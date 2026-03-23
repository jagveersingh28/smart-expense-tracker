// ─── admin-logs.js ────────────────────────────────────────────────
let allLogs = [];

document.addEventListener("DOMContentLoaded", loadLogs);

async function loadLogs() {
  allLogs = await apiAdminGetLogs();
  renderLogs(allLogs);
}

function renderLogs(logs) {
  const tbody = document.getElementById("logs-body");
  tbody.innerHTML = "";

  if (!logs.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">No logs found</td></tr>`;
    return;
  }

  logs.forEach((log, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${log.user_name}</td>
      <td>${log.user_email}</td>
      <td><span class="log-action ${log.action}">${actionLabel(log.action)}</span></td>
      <td>${log.timestamp}</td>
    `;
    tbody.appendChild(row);
  });
}

// Filter logs by email + action
function filterLogs() {
  const emailQuery  = document.getElementById("log-search").value.toLowerCase();
  const actionQuery = document.getElementById("log-action-filter").value;

  const filtered = allLogs.filter(log => {
    const matchEmail  = log.user_email.toLowerCase().includes(emailQuery);
    const matchAction = actionQuery ? log.action === actionQuery : true;
    return matchEmail && matchAction;
  });

  renderLogs(filtered);
}

// Human-readable action labels with emoji
function actionLabel(action) {
  const map = {
    login:        "✅ Login",
    signup:       "🆕 Signup",
    failed_login: "❌ Failed Login",
    admin_login:  "🛡️ Admin Login"
  };
  return map[action] || action;
}
