import { authService } from '../services/authService.js';

const form = document.getElementById('signupForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validate passwords match
  if (password !== confirmPassword) {
    showError('Passwords do not match');
    return;
  }

  try {
    errorMessage.style.display = 'none';
    
    await authService.signUp(email, password, fullName);
    
    showSuccess('Account created! Please check your email to verify your account.');
    
    // Redirect to sign in after 2 seconds
    setTimeout(() => {
      window.location.href = 'signin.html';
    }, 2000);
  } catch (error) {
    showError(error.message || 'Failed to create account');
  }
});

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  successMessage.style.display = 'none';
}

function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.style.display = 'block';
  errorMessage.style.display = 'none';
}
