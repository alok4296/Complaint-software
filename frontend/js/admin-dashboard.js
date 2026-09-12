async function loadAdminDashboard() {
  if (!getCurrentUser() || getCurrentUser().role !== 'admin') {
    window.location.href = 'login.html';
    return;
  }

  try {
    const stats = await apiRequest('/admin/stats');
    const complaints = await apiRequest('/admin/complaints');

    const cards = [
      { label: 'Total Complaints', value: stats.totalComplaints },
      { label: 'Pending', value: stats.pendingComplaints },
      { label: 'Under Review', value: stats.underReview },
      { label: 'In Progress', value: stats.inProgress },
      { label: 'Resolved', value: stats.resolved },
      { label: 'Closed', value: stats.closed },
      { label: 'Critical', value: stats.critical },
    ];

    document.getElementById('adminStatCards').innerHTML = cards.map(card => `
      <div class="col-md-3">
        <div class="card stat-card p-3">
          <small class="text-muted">${card.label}</small>
          <h3 class="mb-0 mt-2">${card.value}</h3>
        </div>
      </div>
    `).join('');

    new Chart(document.getElementById('complaintsChart'), {
      type: 'bar',
      data: {
        labels: (complaints.complaints || []).slice(0, 6).map(c => c.complaintId),
        datasets: [{
          label: 'Complaints',
          data: (complaints.complaints || []).slice(0, 6).map(() => 1),
          backgroundColor: '#0d6efd',
        }],
      },
      options: { responsive: true, plugins: { legend: { display: false } } },
    });

    document.getElementById('adminComplaintTable').innerHTML = (complaints.complaints || []).slice(0, 8).map(item => `
      <tr>
        <td>${item.complaintId}</td>
        <td>${item.user?.name || 'N/A'}</td>
        <td>${item.category?.name || 'N/A'}</td>
        <td><span class="priority-badge priority-${item.priority.toLowerCase()}">${item.priority}</span></td>
        <td><span class="status-badge status-${item.status.toLowerCase().replace(/\s+/g, '-')}">${item.status}</span></td>
        <td><a href="complaint-details.html?id=${item._id}" class="btn btn-sm btn-primary">View</a></td>
      </tr>
    `).join('');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', loadAdminDashboard);
