document.addEventListener('DOMContentLoaded', () => {
    const joinForm = document.getElementById('join-form');
    const nameInput = document.getElementById('join-name');
    const mobileInput = document.getElementById('join-mobile');
    const msg = document.getElementById('join-msg');

    const workTypeSelect = document.getElementById('join-work-type');
    const skillsInput = document.getElementById('join-skills');
    const skillsContainer = document.getElementById('suggested-skills-container');

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

    // --- 1. DYNAMIC SKILLS LOGIC (Unchanged) ---
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
        
        skillsContainer.innerHTML = ''; 

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
                    skillsInput.value = currentSkills.join(', ') + ', '; 
                }
            });
            skillsContainer.appendChild(label);
        });
    }

    if (workTypeSelect) {
        workTypeSelect.addEventListener('change', updateSuggestedSkills);
        updateSuggestedSkills();
    }

    // --- 2. FORM SUBMISSION HANDLER ---
    if (joinForm) {
        joinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            msg.textContent = ''; msg.className = 'form-message';

            // Gather all fields, including the new 'experience' field
            const name = nameInput.value;
            const role = document.getElementById('join-role').value;
            const email = document.getElementById('join-email').value; 
            const mobile = mobileInput.value;
            // 🔑 NEW FIELD: Years of Experience, converted to a number
            const experience = parseInt(document.getElementById('join-experience').value, 10); 
            const location = document.getElementById('join-location').value;
            const workType = workTypeSelect.value;
            const bio = document.getElementById('join-bio').value;
            const isProfileComplete = document.getElementById('is-profile-complete').value; 
            
            // Skills as array
            const skills = document.getElementById('join-skills').value
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0); 
            
            // Basic Frontend validation check
            if (mobile.length !== 10) {
                msg.textContent = 'Mobile number must be 10 digits.'; 
                msg.classList.add('error'); 
                return; 
            }
            if (isNaN(experience) || experience < 0) {
                msg.textContent = 'Years of Experience must be a positive number.'; 
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
                    // CRITICAL: Sending ALL fields, including experience
                    body: JSON.stringify({ name, role, email, mobile, experience, location, workType, skills, bio, isProfileComplete }) 
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
