document.addEventListener('DOMContentLoaded', () => {
    const joinForm = document.getElementById('join-form');
    const nameInput = document.getElementById('join-name');
    const mobileInput = document.getElementById('join-mobile');
    const locationInput = document.getElementById('join-location');
    const workTypeSelect = document.getElementById('join-work-type');
    const msg = document.getElementById('join-msg');

    // --- 0. Initial Setup ---
    function initializeForm() {
        const token = localStorage.getItem('userToken');
        if (!token) {
            msg.textContent = 'Session expired. Please log in.';
            msg.classList.add('error');
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        }
    }

    // --- 1. FORM SUBMISSION HANDLER ---
    if (joinForm) {
        joinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            msg.textContent = ''; msg.className = 'form-message';

            // Gather ONLY the FOUR fields required by the WorkerSchema
            const name = nameInput.value.trim();
            const mobile = mobileInput.value.trim();
            const location = locationInput.value.trim();
            const workType = workTypeSelect.value.trim();
            
            // 🔑 CRITICAL: Comprehensive Client-Side Validation
            if (!name) {
                msg.textContent = 'Full Name is required.'; msg.classList.add('error'); return;
            }
            if (!mobile || mobile.length !== 10) {
                msg.textContent = 'Mobile number must be 10 digits.'; msg.classList.add('error'); return;
            }
            if (!location) {
                msg.textContent = 'Location/Town is required.'; msg.classList.add('error'); return;
            }
            if (!workType) {
                msg.textContent = 'Kind of Work must be selected.'; msg.classList.add('error'); return;
            }

            const token = localStorage.getItem('userToken');
            if (!token) { 
                msg.textContent = 'Not logged in. Redirecting...'; 
                msg.classList.add('error'); 
                localStorage.setItem('intendedDestination', 'join.html');
                setTimeout(() => window.location.href = 'login.html', 2000); 
                return; 
            }

            try {
                const response = await fetch('https://we-connect-you-backend.onrender.com/api/join', { 
                    method: 'POST', 
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': 'Bearer ' + token 
                    }, 
                    // Send ONLY the four required fields
                    body: JSON.stringify({ name, mobile, location, workType }) 
                });

                if (response.ok) {
                    const data = await response.json(); 
                    msg.textContent = 'Profile saved! Redirecting home...'; 
                    msg.classList.add('success');
                    setTimeout(() => { window.location.href = 'index.html'; }, 2000); 
                } else {
                    let errorMessage = `Error: ${response.status} ${response.statusText}`; 
                    try { 
                        const data = await response.json(); 
                        // The error message from the backend is captured here
                        errorMessage = 'Error: ' + (data.message || 'Validation failed. Check database connection/permissions.'); 
                    } catch (e) {} 
                    
                    msg.textContent = errorMessage; 
                    msg.classList.add('error'); 
                }
            } catch (err) { 
                console.error('Join Fetch Error:', err); 
                msg.textContent = 'SERVER DOWN? Connection error.'; 
                msg.classList.add('error'); 
            }
        });
    }

    initializeForm();
});
