// ─── admin-users.js ───────────────────────────────────────────────
let allUsers = [];

document.addEventListener("DOMContentLoaded", loadUsers);

async function loadUsers() {
  allUsers = await apiAdminGetUsers();
  renderUsers(allUsers);
}

function renderUsers(users) {
  const tbody = document.getElementById("users-body");
  tbody.innerHTML = "";

  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted)">No users found</td></tr>`;
    return;
  }

  users.forEach((user, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td><span class="role-badge ${user.role}">${user.role}</span></td>
      <td>${user.created_at || "N/A"}</td>
      <td>${user.txn_count}</td>
      <td>₹${(user.total_spent || 0).toLocaleString()}</td>
      <td>
        ${user.role !== "admin" ? `<button class="btn-delete" onclick="deleteUser('${user._id}', '${user.name}')">🗑️ Delete</button>` : "—"}
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Search/filter users by name or email
function filterUsers() {
  const query = document.getElementById("user-search").value.toLowerCase();
  const filtered = allUsers.filter(u =>
    u.name.toLowerCase().includes(query) ||
    u.email.toLowerCase().includes(query)
  );
  renderUsers(filtered);
}

// Delete a user
async function deleteUser(id, name) {
  if (!confirm(`Delete user "${name}" and all their data? This cannot be undone.`)) return;

  const result = await apiAdminDeleteUser(id);
  if (result.message) {
    alert("✅ User deleted successfully.");
    loadUsers(); // Refresh list
  } else {
    alert("❌ Failed to delete: " + (result.error || "Unknown error"));
  }
}
