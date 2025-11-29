const API_BASE_URL = "https://smartplateapi.onrender.com";

document.addEventListener('DOMContentLoaded', () => {
    const signinForm = document.getElementById('signinForm');
    const errorMessage = document.getElementById('errorMessage');

    if (!signinForm) {
        return;
    }

    const submitButton = signinForm.querySelector('button[type="submit"]');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (localStorage.getItem('userEmail')) {
        emailInput.value = localStorage.getItem('userEmail');
    }

    validateExistingSession();

    signinForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideError();
        setLoading(true);

        const credentials = {
            email: emailInput.value.trim(),
            password: passwordInput.value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(parseServerError(payload, 'Invalid email or password.'));
            }

            if (!payload.token) {
                throw new Error('Login succeeded but no session token was returned.');
            }

            localStorage.setItem('token', payload.token);
            localStorage.setItem('userEmail', credentials.email);

            window.location.href = 'dashboard.html';
        } catch (error) {
            showError(error.message || 'Unable to sign in right now.');
            setLoading(false);
        }
    });

    async function validateExistingSession() {
        const token = localStorage.getItem('token');
        if (!token) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                window.location.href = 'dashboard.html';
                return;
            }

            localStorage.removeItem('token');
        } catch (error) {
            localStorage.removeItem('token');
        }
    }

    function setLoading(isLoading) {
        submitButton.classList.toggle('btn-loading', isLoading);
        submitButton.disabled = isLoading;
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function hideError() {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
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

    return fallbackMessage;
}