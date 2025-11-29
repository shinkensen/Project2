const API_BASE_URL = "https://smartplateapi.onrender.com";

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const errorMessage = document.getElementById('errorMessage');

    if (!signupForm) {
        return;
    }

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const btn = signupForm.querySelector('button[type="submit"]');
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        errorMessage.style.display = 'none';
        btn.classList.add('btn-loading');
        btn.disabled = true;

        if (password !== confirmPassword) {
            showError('Passwords do not match.');
            resetButton(btn);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(parseServerError(payload, 'Unable to create your account right now.'));
            }

            if (payload.requiresVerification) {
                showError(payload.message || 'Account created. Please verify your email before signing in.');
                resetButton(btn);
                return;
            }

            if (!payload.token) {
                throw new Error('Signup succeeded but no session token was returned.');
            }

            localStorage.setItem('token', payload.token);
            localStorage.setItem('userEmail', email);
            if (fullName) {
                localStorage.setItem('userName', fullName);
            }

            window.location.href = 'dashboard.html';
        } catch (error) {
            showError(error.message || 'Unable to create your account.');
            resetButton(btn);
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function resetButton(btn) {
        btn.classList.remove('btn-loading');
        btn.disabled = false;
    }
});

function parseServerError(payload, fallbackMessage) {
    if (!payload) {
        return fallbackMessage;
    }

    if (typeof payload.error === 'string' && payload.error.trim().length > 0) {
        return payload.error;
    }

    if (payload.error && typeof payload.error.message === 'string') {
        return payload.error.message;
    }

    if (typeof payload.message === 'string' && payload.message.trim().length > 0) {
        return payload.message;
    }

    return fallbackMessage;
}