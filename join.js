document.addEventListener('DOMContentLoaded', () => {
    const joinForm = document.getElementById('join-form');
    const nameInput = document.getElementById('join-name');
    const mobileInput = document.getElementById('join-mobile');
    const msg = document.getElementById('join-msg');
    const locationInput = document.getElementById('join-location');
    const workTypeSelect = document.getElementById('join-work-type');
    
    // NOTE: All dynamic logic (skills, experience, bio) is removed as the backend doesn't support those fields.

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

    // --- 1. DYNAMIC SKILLS LOGIC (Removed - Backend doesn't support it) ---

    // --- 2. FORM SUBMISSION HANDLER ---
    if (joinForm) {
        joinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            msg.textContent = ''; msg.className = 'form-message';

            // Gather ONLY the FOUR fields required by the WorkerSchema
            const name = nameInput.value;
            const mobile = mobileInput.value;
            const location = locationInput.value;
            const workType = workTypeSelect.value;
            
            // Basic Frontend validation check
            if (mobile.length !== 10) {
                msg.textContent = 'Mobile number must be 10 digits.'; 
                msg.classList.add('error'); 
                return; 
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
                    // Send ONLY the FOUR required fields
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
                        errorMessage = 'Error: ' + (data.message || 'Validation failed. Check backend logs.'); 
                    } catch (e) {} 
                    
                    msg.textContent = errorMessage; 
                    msg.classList.add('error'); 
                    
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
    }

    initializeForm();
});
