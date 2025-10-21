// --- 1. TAB SWITCHING LOGIC & GRAB ELEMENTS ---
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
    }
}

// --- Event Listeners for Forgot/Back Links ---
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    showForm('reset'); // This works to show the Reset Password form
});

backToLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showForm('login'); // This works to return to the Login form
});


// --- 2. REGISTRATION FORM HANDLER ---
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        registerMsg.textContent = '';
        registerMsg.className = 'form-message';

        const name = document.getElementById('reg-name').value;
        const mobile = document.getElementById('reg-mobile').value;
        const password = document.getElementById('reg-password').value;
        const confirmPass = document.getElementById('reg-password-confirm').value;

        if (!/^[0-9]{10}$/.test(mobile)) {
            registerMsg.textContent = 'Mobile number must be 10 digits.';
            registerMsg.classList.add('error');
            return;
        }
        if (password !== confirmPass) {
            registerMsg.textContent = 'Passwords do not match.';
            registerMsg.classList.add('error');
            return;
        }

        try {
            // Sends data to the stable backend for DB storage
            const response = await fetch('https://we-connect-you-backend.onrender.com/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, mobile, password })
            });

            if (response.ok) {
                // Shows success message and redirects to login after 2 seconds
                registerMsg.textContent = 'Registration successful! Please log in.';
                registerMsg.classList.add('success');
                setTimeout(() => showForm('login'), 2000); 
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
} else {
    console.error("Could not find registration form element.");
}

// --- 3. LOGIN FORM HANDLER ---
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginMsg.textContent = '';
        loginMsg.className = 'form-message';

        const mobile = document.getElementById('login-mobile').value;
        const password = document.getElementById('login-password').value;

        try {
            // Sends data to the stable backend for login verification
            const response = await fetch('https://we-connect-you-backend.onrender.com/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile, password })
            });

            if (response.ok) {
                const data = await response.json();
                loginMsg.textContent = 'Login successful! Redirecting...';
                loginMsg.classList.add('success');

                // Stores token for future authorized requests
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('loggedInUser', data.name);

                const intendedDest = localStorage.getItem('intendedDestination');

                // Redirects to the main page (or intended destination)
                setTimeout(() => {
                    if (intendedDest) {
                        localStorage.removeItem('intendedDestination');
                        window.location.href = intendedDest;
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1000);

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
} else {
    console.error("Could not find login form element.");
}

// --- 4. RESET PASSWORD FORM HANDLER (Forgot Password) ---
if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        resetMsg.textContent = '';
        resetMsg.className = 'form-message';

        const mobile = document.getElementById('reset-mobile').value;
        const newPassword = document.getElementById('reset-new-password').value;
        const confirmPassword = document.getElementById('reset-confirm-password').value;

        // Validation logic
        if (!/^[0-9]{10}$/.test(mobile)) { /* ... */ return; }
        if (newPassword !== confirmPassword) { /* ... */ return; }
        if (newPassword.length < 6) { /* ... */ return; }

        try {
            // Sends request to backend to change password in DB
            const response = await fetch('https://we-connect-you-backend.onrender.com/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile, newPassword })
            });

            if (response.ok) {
                // Shows success message and redirects to login after 3 seconds
                resetMsg.textContent = 'Password updated successfully! You can now log in.';
                resetMsg.classList.add('success');
                setTimeout(() => {
                    showForm('login');
                    resetPasswordForm.reset();
                }, 3000);
            } else {
                // ... Error handling
            }
        } catch (err) {
            // ... Network Error handling
        }
    });
} else {
    console.error("Could not find reset password form element.");
}

// Show the login form by default when the page loads
showForm('login');
