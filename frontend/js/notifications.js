async function loadNotifications() {
  if (!getCurrentUser()) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const data = await apiRequest('/notifications');
    const notificationList = document.getElementById('notificationList');
    if (!data.notifications || data.notifications.length === 0) {
      notificationList.innerHTML = '<div class="list-group-item text-muted">No notifications yet.</div>';
      return;
    }

    notificationList.innerHTML = data.notifications.map(item => `
      <div class="list-group-item d-flex justify-content-between align-items-center ${item.isRead ? 'opacity-75' : ''}">
        <div>
          <div>${item.message}</div>
          <small class="text-muted">${new Date(item.createdAt).toLocaleString()}</small>
        </div>
        ${!item.isRead ? `<button class="btn btn-sm btn-primary mark-read" data-id="${item._id}">Mark Read</button>` : '<span class="text-success small">Read</span>'}
      </div>
    `).join('');

    document.querySelectorAll('.mark-read').forEach(button => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        await apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
        loadNotifications();
      });
    });
  } catch (error) {
    showToast(error.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', loadNotifications);
