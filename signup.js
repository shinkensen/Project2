// js/signup.js
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const errorMessage = document.getElementById('errorMessage');

    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Prevent page reload
        
        const formData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        // Show loading state
        const btn = this.querySelector('button[type="submit"]');
        btn.classList.add('btn-loading');
        btn.disabled = true;
        errorMessage.style.display = 'none';

        try {
            // For now, we'll simulate successful signup
            // In production, you'd call your backend API here
            await simulateSignup(formData);
            
            // Store user data and redirect to signin
            localStorage.setItem('tempUser', JSON.stringify({
                email: formData.email,
                fullName: formData.fullName
            }));
            
            // Redirect to signin page
            window.location.href = 'signin-new.html';
            
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        } finally {
            btn.classList.remove('btn-loading');
            btn.disabled = false;
        }
    });

    // Simulate API call - replace with actual Supabase/auth0/your backend
    async function simulateSignup(userData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simple validation
                if (!userData.email || !userData.password) {
                    reject(new Error('Please fill in all fields'));
                    return;
                }
                
                if (userData.password.length < 6) {
                    reject(new Error('Password must be at least 6 characters'));
                    return;
                }

                // Simulate successful signup
                console.log('User signed up:', userData);
                resolve({ success: true, user: userData });
            }, 1000);
        });
    }
});