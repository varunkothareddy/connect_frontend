document.addEventListener('DOMContentLoaded', () => {
    const joinForm = document.getElementById('join-form');
    if (!joinForm) {
        console.error("Join form not found. Ensure join.html has an element with id='join-form'.");
        return;
    }

    joinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('join-msg');
        msg.textContent = ''; msg.className = 'form-message';

        // --- 1. Gather Form Data ---
        const name = document.getElementById('join-name').value;
        const mobile = document.getElementById('join-mobile').value;
        const location = document.getElementById('join-location').value;
        const workType = document.getElementById('join-work-type').value;

        // --- 2. Basic Validation ---
        if (!/^[0-9]{10}$/.test(mobile)) { 
            msg.textContent = 'Mobile number must be 10 digits.'; 
            msg.classList.add('error'); 
            return; 
        }

        // --- 3. Authorization Check ---
        const token = localStorage.getItem('userToken');
        if (!token) { 
            msg.textContent = 'Not logged in. Redirecting to login...'; 
            msg.classList.add('error'); 
            // Save the intended destination so user comes back here after login
            localStorage.setItem('intendedDestination', 'join.html');
            setTimeout(() => window.location.href = 'login.html', 2000); 
            return; 
        }

        try {
            // --- 4. API Call to Backend ---
            const response = await fetch('https://we-connect-you-backend.onrender.com/api/join', { 
                method: 'POST', 
                headers: { 
                    'Content-Type': 'application/json', 
                    // CRITICAL: Sending the JWT token for authentication
                    'Authorization': 'Bearer ' + token 
                }, 
                body: JSON.stringify({ name, mobile, location, workType }) 
            });

            // --- 5. Handle Response ---
            if (response.ok) {
                // Success: Profile updated
                const data = await response.json(); 
                msg.textContent = 'Profile saved! Redirecting home...'; 
                msg.classList.add('success');
                
                // Redirect to homepage after success
                setTimeout(() => { 
                    window.location.href = 'index.html'; 
                }, 2000); 
                joinForm.reset();
            } else {
                // Failure: Display Backend Error Message
                let errorMessage = `Error: ${response.status} ${response.statusText}`; 
                try { 
                    const data = await response.json(); 
                    errorMessage = 'Error: ' + data.message; 
                } catch (e) {} 
                
                msg.textContent = errorMessage; 
                msg.classList.add('error'); 
                
                // If unauthorized, force re-login
                if (response.status === 401) { 
                    setTimeout(() => window.location.href = 'login.html', 2000); 
                }
            }
        } catch (err) { 
            console.error('Join Fetch Error:', err); 
            msg.textContent = 'SERVER DOWN? Connection error.'; 
            msg.classList.add('error'); 
        }
    });
});
