function getComplaintIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function loadComplaintDetails() {
  const id = getComplaintIdFromUrl();
  if (!id) {
    showToast('Complaint ID is missing', 'error');
    return;
  }

  try {
    const data = await apiRequest(`/complaints/${id}`);
    const complaint = data.complaint;
    const detailContainer = document.getElementById('complaintDetailContent');

    detailContainer.innerHTML = `
      <div class="row g-4">
        <div class="col-lg-8">
          <h4 class="fw-bold">${complaint.title}</h4>
          <p class="text-muted mb-3">${complaint.complaintId}</p>
          <div class="mb-3">
            <span class="status-badge status-${complaint.status.toLowerCase().replace(/\s+/g, '-')}">${complaint.status}</span>
            <span class="priority-badge priority-${complaint.priority.toLowerCase()} ms-2">${complaint.priority}</span>
          </div>
          <p>${complaint.description}</p>
          <div class="row g-3 mb-4">
            <div class="col-md-6"><strong>Category:</strong> ${complaint.category?.name || 'N/A'}</div>
            <div class="col-md-6"><strong>Department:</strong> ${complaint.department?.name || 'N/A'}</div>
            <div class="col-md-6"><strong>Location:</strong> ${complaint.location}</div>
            <div class="col-md-6"><strong>Assigned Staff:</strong> ${complaint.assignedStaff?.name || 'Not assigned'}</div>
          </div>

          <h5 class="fw-bold">Complaint Timeline</h5>
          <div class="mt-3">
            ${(complaint.history || []).map(item => `
              <div class="timeline-item">
                <strong>${item.action}</strong>
                <div class="text-muted small">${new Date(item.createdAt).toLocaleString()}</div>
                <div>${item.details}</div>
              </div>
            `).join('') || '<p class="text-muted">No history available.</p>'}
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card bg-light p-3">
            <h6 class="fw-bold">Complaint Info</h6>
            <ul class="list-unstyled mb-0">
              <li><strong>Created:</strong> ${new Date(complaint.createdAt).toLocaleString()}</li>
              <li><strong>Updated:</strong> ${new Date(complaint.updatedAt).toLocaleString()}</li>
              <li><strong>Resolved:</strong> ${complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleString() : 'Pending'}</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    showToast(error.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', loadComplaintDetails);
