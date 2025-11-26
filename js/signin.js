import { authService } from '../services/authService.js';

const form = document.getElementById('signinForm');
const errorMessage = document.getElementById('errorMessage');

// Check if already logged in
checkAuth();

async function checkAuth() {
  try {
    const session = await authService.getSession();
    if (session) {
      window.location.href = 'dashboard.html';
    }
  } catch (error) {
    console.log('Not logged in');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    errorMessage.style.display = 'none';
    
    await authService.signIn(email, password);
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
  } catch (error) {
    showError(error.message || 'Invalid email or password');
  }
});

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}
