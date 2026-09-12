const API_BASE = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('complaintToken');
}

function setToken(token) {
  localStorage.setItem('complaintToken', token);
}

function clearSession() {
  localStorage.removeItem('complaintToken');
  localStorage.removeItem('complaintUser');
}

function getCurrentUser() {
  const user = localStorage.getItem('complaintUser');
  return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
  localStorage.setItem('complaintUser', JSON.stringify(user));
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'success'} border-0`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  container.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
  bsToast.show();
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toastContainer';
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

async function apiRequest(url, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

function redirectByRole() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  if (user.role === 'admin') {
    window.location.href = 'admin-dashboard.html';
  } else if (user.role === 'staff') {
    window.location.href = 'staff-dashboard.html';
  } else {
    window.location.href = 'student-dashboard.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      try {
        const result = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        setToken(result.token);
        setCurrentUser(result.user);
        showToast('Login successful', 'success');
        setTimeout(() => redirectByRole(), 800);
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        rollNumber: document.getElementById('rollNumber').value.trim(),
        password: document.getElementById('password').value,
        role: 'student',
      };

      try {
        const result = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify(data),
        });

        setToken(result.token);
        setCurrentUser(result.user);
        showToast('Registration successful', 'success');
        setTimeout(() => redirectByRole(), 800);
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  }

  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      clearSession();
      window.location.href = 'login.html';
    });
  }

  const user = getCurrentUser();
  if (user && (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html') || window.location.pathname.endsWith('/index.html') || window.location.pathname === '/')) {
    redirectByRole();
  }
});
