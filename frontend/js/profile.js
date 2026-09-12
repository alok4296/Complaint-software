async function loadProfile() {
  if (!getCurrentUser()) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const data = await apiRequest('/users/profile');
    const user = data.user;
    document.getElementById('profileName').value = user.name || '';
    document.getElementById('profileEmail').value = user.email || '';
    document.getElementById('profilePhone').value = user.phone || '';
    document.getElementById('profileRollNumber').value = user.rollNumber || '';
  } catch (error) {
    showToast(error.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();

  const form = document.getElementById('profileForm');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const payload = {
        name: document.getElementById('profileName').value.trim(),
        phone: document.getElementById('profilePhone').value.trim(),
        rollNumber: document.getElementById('profileRollNumber').value.trim(),
      };

      const result = await apiRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setCurrentUser(result.user);
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
});
