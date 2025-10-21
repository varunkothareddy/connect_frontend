// --- 1. TAB SWITCHING LOGIC & GRAB ELEMENTS ---
const API_BASE_URL = 'https://we-connect-you-backend.onrender.com/api';

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const resetPasswordForm = document.getElementById('reset-password-form');
const loginTabs = document.querySelector('.login-tabs');

const loginMsg = document.getElementById('login-msg');
const registerMsg = document.getElementById('register-msg');
const resetMsg = document.getElementById('reset-msg');

const forgotPasswordLink = document.getElementById('forgot-password-link');
const backToLoginLink = document.getElementById('back-to-login-link');

function showForm(formName) {
    const tabBtns = document.querySelectorAll('.tab-btn');

    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    resetPasswordForm.style.display = 'none';
    loginTabs.style.display = 'none';

    tabBtns.forEach(btn => btn.classList.remove('active'));

    if (formName === 'login') {
        loginForm.style.display = 'block';
        loginTabs.style.display = 'flex';
        tabBtns[0].classList.add('active');
    } else if (formName === 'register') {
        registerForm.style.display = 'block';
        loginTabs.style.display = 'flex';
        tabBtns[1].classList.add('active');
    } else if (formName === 'reset') {
        resetPasswordForm.style.display = 'block';
        // Note: The reset form doesn't use the tabs, so they remain hidden.
    }
}

// Event listeners for switching between login/reset
if (forgotPasswordLink) { forgotPasswordLink.addEventListener('click', (e) => { e.preventDefault(); showForm('reset'); }); }
if (backToLoginLink) { backToLoginLink.addEventListener('click', (e) => { e.preventDefault(); showForm('login'); }); }

// Show the login form by default when the page loads
document.addEventListener('DOMContentLoaded', () => showForm('login'));

// --- 2. LOGIN FORM SUBMISSION LOGIC ---
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginMsg.textContent = ''; loginMsg.className = 'form-message';

        const mobile = document.getElementById('login-mobile').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile, password })
            });

            if (response.ok) {
                const data = await response.json();
                
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('loggedInUser', data.name); // Store name for display
                
                loginMsg.textContent = 'Login successful! Redirecting to home...';
                loginMsg.classList.add('success');
                
                // Check for intended destination
                const intendedDestination = localStorage.getItem('intendedDestination');
                if (intendedDestination) {
                    localStorage.removeItem('intendedDestination');
                    setTimeout(() => window.location.href = intendedDestination, 1000);
                } else {
                    setTimeout(() => window.location.href = 'index.html', 1000);
                }

            } else {
                let errorMessage = `Error: ${response.status} ${response.statusText}`;
                try { const data = await response.json(); errorMessage = 'Error: ' + data.message; } catch (e) {}
                loginMsg.textContent = errorMessage;
                loginMsg.classList.add('error');
            }
        } catch (err) {
            console.error('Login Fetch Error:', err);
            loginMsg.textContent = 'Network Error: Cannot connect to server.';
            loginMsg.classList.add('error');
        }
    });
}

// --- 3. REGISTER FORM SUBMISSION LOGIC ---
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        registerMsg.textContent = '';
        registerMsg.className = 'form-message';

        const name = document.getElementById('register-name').value;
        const mobile = document.getElementById('register-mobile').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (password !== confirmPassword) {
            registerMsg.textContent = 'Error: Passwords do not match.';
            registerMsg.classList.add('error');
            return;
        }

        if (!/^[0-9]{10}$/.test(mobile)) {
             registerMsg.textContent = 'Error: Mobile number must be 10 digits.';
             registerMsg.classList.add('error');
             return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, mobile, password })
            });

            if (response.ok) {
                const data = await response.json();
                
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('loggedInUser', data.name); // Store name for display
                
                registerMsg.textContent = 'Registration successful! Redirecting to home...';
                registerMsg.classList.add('success');
                
                const intendedDestination = localStorage.getItem('intendedDestination');
                if (intendedDestination) {
                    localStorage.removeItem('intendedDestination');
                    setTimeout(() => window.location.href = intendedDestination, 1000);
                } else {
                    setTimeout(() => window.location.href = 'index.html', 1000);
                }

            } else {
                let errorMessage = `Error: ${response.status} ${response.statusText}`;
                try { const data = await response.json(); errorMessage = 'Error: ' + data.message; } catch (e) {}
                registerMsg.textContent = errorMessage;
                registerMsg.classList.add('error');
            }
        } catch (err) {
            console.error('Register Fetch Error:', err);
            registerMsg.textContent = 'Network Error: Cannot connect to server.';
            registerMsg.classList.add('error');
        }
    });
}

// --- 4. PASSWORD RESET FORM SUBMISSION LOGIC ---
if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        resetMsg.textContent = '';
        resetMsg.className = 'form-message';

        const mobile = document.getElementById('reset-mobile').value;
        const newPassword = document.getElementById('reset-new-password').value;
        const confirmPassword = document.getElementById('reset-confirm-password').value;

        if (newPassword !== confirmPassword) {
            resetMsg.textContent = 'Error: New passwords do not match.';
            resetMsg.classList.add('error');
            return;
        }
        
        if (!/^[0-9]{10}$/.test(mobile)) {
             resetMsg.textContent = 'Error: Mobile number must be 10 digits.';
             resetMsg.classList.add('error');
             return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile, newPassword })
            });

            if (response.ok) {
                resetMsg.textContent = 'Password updated successfully! You can now log in.';
                resetMsg.classList.add('success');
                setTimeout(() => {
                    showForm('login'); // Redirect back to the login form
                    resetPasswordForm.reset();
                }, 1500);
            } else {
                let errorMessage = `Error: ${response.status} ${response.statusText}`;
                try { const data = await response.json(); errorMessage = 'Error: ' + data.message; } catch (e) {}
                resetMsg.textContent = errorMessage;
                resetMsg.classList.add('error');
            }
        } catch (err) {
            console.error('Reset Fetch Error:', err);
            resetMsg.textContent = 'Network Error: Cannot connect to server.';
            resetMsg.classList.add('error');
        }
    });
}
