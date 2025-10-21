document.addEventListener('DOMContentLoaded', () => {
    const joinForm = document.getElementById('join-form');
    const nameInput = document.getElementById('join-name');
    const mobileInput = document.getElementById('join-mobile');
    const msg = document.getElementById('join-msg');

    // --- Dynamic Skill Logic Elements ---
    const workTypeSelect = document.getElementById('join-work-type');
    const skillsInput = document.getElementById('join-skills');
    const skillsContainer = document.getElementById('suggested-skills-container');

    // --- 0. Initial Setup ---
    function initializeForm() {
        const token = localStorage.getItem('userToken');
        const loggedInUser = localStorage.getItem('loggedInUser');
        const mobile = localStorage.getItem('loggedInMobile'); // Assuming you store mobile on login

        if (!token) {
            msg.textContent = 'Session expired. Please log in.';
            msg.classList.add('error');
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        }

        // Pre-fill basic details (assuming these are stored in localStorage after login)
        nameInput.value = loggedInUser || '';
        mobileInput.value = mobile || 'Not Available'; 
    }

    // --- 1. DYNAMIC SKILLS LOGIC ---
    const skillSuggestions = {
        'Plumber': ['Pipe Fitting', 'Drain Cleaning', 'Water Heater Repair', 'Fixture Installation', 'Leak Detection'],
        'Electrician': ['House Wiring', 'Circuit Breakers', 'Troubleshooting', 'Solar Installation', 'Appliance Repair'],
        'Carpenter': ['Cabinet Making', 'Framing', 'Furniture Repair', 'Laminate Flooring', 'Drywall'],
        'Cleaner': ['Deep Cleaning', 'Commercial Cleaning', 'Window Washing', 'Floor Scrubbing', 'Sanitization'],
        'Welder': ['MIG Welding', 'TIG Welding', 'Fabrication', 'Blueprint Reading', 'Structural Steel'],
        'Mechanic': ['Engine Repair', 'Brake Systems', 'Oil Change', 'Diagnostics', 'Tire Rotation'],
    };

    function updateSuggestedSkills() {
        const selectedWorkType = workTypeSelect.value;
        const suggestions = skillSuggestions[selectedWorkType] || [];
        
        skillsContainer.innerHTML = ''; // Clear previous suggestions

        if (!selectedWorkType) {
            skillsContainer.innerHTML = '<p style="font-size:0.9em; color:#999;">Select a profession above to see suggestions.</p>';
            return;
        }

        suggestions.forEach(skill => {
            const label = document.createElement('span');
            label.className = 'skill-label';
            label.textContent = skill;
            label.addEventListener('click', () => {
                let currentSkills = skillsInput.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
                
                if (!currentSkills.includes(skill)) {
                    currentSkills.push(skill);
                    // Add the new skill, ensuring a comma is only added if other skills exist
                    skillsInput.value = currentSkills.join(', ') + ', '; 
                }
            });
            skillsContainer.appendChild(label);
        });
    }

    // Attach the listener to the work type selector
    if (workTypeSelect) {
        workTypeSelect.addEventListener('change', updateSuggestedSkills);
    }

    // --- 2. FORM SUBMISSION HANDLER ---
    if (joinForm) {
        joinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            msg.textContent = ''; msg.className = 'form-message';

            // Gather all fields (including new ones)
            const name = nameInput.value;
            const mobile = mobileInput.value;
            const location = document.getElementById('join-location').value;
            const workType = workTypeSelect.value;
            const bio = document.getElementById('join-bio').value;
            
            // Split skills input by comma, trim whitespace, and filter empty strings
            const skills = document.getElementById('join-skills').value.split(',').map(s => s.trim()).filter(s => s.length > 0);
            
            // Frontend validation check
            if (skills.length === 0) {
                msg.textContent = 'Please enter at least one skill.'; 
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
                    // CRITICAL: Send ALL required fields to satisfy the backend schema
                    body: JSON.stringify({ name, mobile, location, workType, skills, bio }) 
                });

                if (response.ok) {
                    const data = await response.json(); 
                    msg.textContent = 'Profile saved! Redirecting home...'; 
                    msg.classList.add('success');
                    
                    // Final Success Redirect
                    setTimeout(() => { 
                        window.location.href = 'index.html'; 
                    }, 2000); 
                } else {
                    let errorMessage = `Error: ${response.status} ${response.statusText}`; 
                    try { 
                        const data = await response.json(); 
                        errorMessage = 'Error: ' + (data.message || 'Validation failed.'); 
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

    // Call initialization on load
    initializeForm();
});
