async function loadFormOptions() {
  try {
    const categories = await apiRequest('/categories');
    const departments = await apiRequest('/departments');

    const categorySelect = document.getElementById('category');
    const departmentSelect = document.getElementById('department');

    categorySelect.innerHTML = '<option value="">Select Category</option>' + (categories.categories || []).map(c => `<option value="${c._id}">${c.name}</option>`).join('');
    departmentSelect.innerHTML = '<option value="">Select Department</option>' + (departments.departments || []).map(d => `<option value="${d._id}">${d.name}</option>`).join('');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!getCurrentUser()) {
    window.location.href = 'login.html';
    return;
  }

  await loadFormOptions();

  const form = document.getElementById('complaintForm');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('title', document.getElementById('title').value.trim());
    formData.append('description', document.getElementById('description').value.trim());
    formData.append('category', document.getElementById('category').value);
    formData.append('department', document.getElementById('department').value);
    formData.append('location', document.getElementById('location').value.trim());
    formData.append('priority', document.getElementById('priority').value);

    const fileInput = document.getElementById('attachment');
    if (fileInput.files[0]) {
      formData.append('attachment', fileInput.files[0]);
    }

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Complaint submission failed');
      showToast('Complaint submitted successfully', 'success');
      setTimeout(() => window.location.href = `complaint-details.html?id=${data.complaint._id}`, 800);
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
});
