async function loadComplaints() {
  if (!getCurrentUser()) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const data = await apiRequest('/complaints/my');
    const complaints = data.complaints || [];
    const table = document.getElementById('complaintsTable');
    table.innerHTML = complaints.map(item => `
      <tr>
        <td>${item.complaintId}</td>
        <td>${item.title}</td>
        <td>${item.category?.name || 'N/A'}</td>
        <td><span class="priority-badge priority-${item.priority.toLowerCase()}">${item.priority}</span></td>
        <td><span class="status-badge status-${item.status.toLowerCase().replace(/\s+/g, '-')}">${item.status}</span></td>
        <td>${new Date(item.createdAt).toLocaleDateString()}</td>
        <td><a href="complaint-details.html?id=${item._id}" class="btn btn-sm btn-outline-primary">View</a></td>
      </tr>
    `).join('') || '<tr><td colspan="7" class="text-center text-muted">No complaints available</td></tr>';

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (event) => {
      const query = event.target.value.toLowerCase();
      const rows = Array.from(table.querySelectorAll('tr'));
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    });
  } catch (error) {
    showToast(error.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', loadComplaints);
