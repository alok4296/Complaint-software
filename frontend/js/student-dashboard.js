async function loadStudentDashboard() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('welcomeMessage').textContent = `Welcome, ${user.name}`;

  try {
    const data = await apiRequest('/complaints/my', { method: 'GET' });
    const complaints = data.complaints || [];

    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => ['Submitted', 'Under Review', 'Assigned'].includes(c.status)).length,
      inProgress: complaints.filter(c => c.status === 'In Progress').length,
      resolved: complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length,
    };

    const statContainer = document.getElementById('studentStats');
    statContainer.innerHTML = `
      <div class="col-md-3"><div class="card stat-card p-3"><small>Total Complaints</small><h3>${stats.total}</h3></div></div>
      <div class="col-md-3"><div class="card stat-card p-3"><small>Pending</small><h3>${stats.pending}</h3></div></div>
      <div class="col-md-3"><div class="card stat-card p-3"><small>In Progress</small><h3>${stats.inProgress}</h3></div></div>
      <div class="col-md-3"><div class="card stat-card p-3"><small>Resolved</small><h3>${stats.resolved}</h3></div></div>
    `;

    const table = document.getElementById('studentComplaintTable');
    table.innerHTML = complaints.slice(0, 5).map(item => `
      <tr>
        <td>${item.complaintId}</td>
        <td>${item.title}</td>
        <td>${item.category?.name || 'N/A'}</td>
        <td><span class="status-badge status-${item.status.toLowerCase().replace(/\s+/g, '-')}">${item.status}</span></td>
        <td><span class="priority-badge priority-${item.priority.toLowerCase()}">${item.priority}</span></td>
        <td><a class="btn btn-sm btn-outline-primary" href="complaint-details.html?id=${item._id}">View</a></td>
      </tr>
    `).join('') || '<tr><td colspan="6" class="text-center text-muted">No complaints found</td></tr>';
  } catch (error) {
    showToast(error.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', loadStudentDashboard);
