// js/signin.js
document.addEventListener('DOMContentLoaded', function() {
    const signinForm = document.getElementById('signinForm');
    const errorMessage = document.getElementById('errorMessage');

    signinForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Prevent page reload
        
        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            rememberMe: document.getElementById('rememberMe').checked
        };

        // Show loading state
        const btn = this.querySelector('button[type="submit"]');
        btn.classList.add('btn-loading');
        btn.disabled = true;
        errorMessage.style.display = 'none';

        try {
            // Simulate authentication
            const user = await simulateSignin(formData);
            
            // Store user data in localStorage
            localStorage.setItem('currentUser', JSON.stringify({
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                token: user.token
            }));
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        } finally {
            btn.classList.remove('btn-loading');
            btn.disabled = false;
        }
    });

    // Simulate API call - replace with actual authentication
    async function simulateSignin(credentials) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Check if user exists (from signup)
                const tempUser = JSON.parse(localStorage.getItem('tempUser') || '{}');
                
                if (!credentials.email || !credentials.password) {
                    reject(new Error('Please fill in all fields'));
                    return;
                }

                // For demo purposes, accept any credentials that match the temp user
                // or use demo credentials
                const demoUsers = [
                    { email: 'demo@smartplate.com', password: 'demo123', fullName: 'Demo User', id: '1' },
                    { email: 'test@smartplate.com', password: 'test123', fullName: 'Test User', id: '2' }
                ];

                const user = demoUsers.find(u => u.email === credentials.email && u.password === credentials.password) ||
                            (tempUser.email === credentials.email ? { ...tempUser, id: '3', token: 'demo-token' } : null);

                if (user) {
                    resolve({
                        id: user.id,
                        email: user.email,
                        fullName: user.fullName,
                        token: 'demo-jwt-token-' + Date.now()
                    });
                } else {
                    reject(new Error('Invalid email or password'));
                }
            }, 1000);
        });
    }

    // Check if user is already logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        window.location.href = 'dashboard.html';
    }
});