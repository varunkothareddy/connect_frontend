const API_BASE_URL = 'https://we-connect-you-backend.onrender.com/api';

// --- 1. Define Sub-Work Options ---
const SUB_WORK_OPTIONS = {
    plumber: ['Pipe Repair', 'Fixture Installation', 'Drain Cleaning'],
    electrician: ['Wiring', 'Switch/Socket Repair', 'Appliance Installation'],
    painter: ['Interior Painting', 'Exterior Painting', 'Wall Preparation'],
    carpenter: ['Furniture Repair', 'Custom Cabinets', 'Wood Flooring'],
    'day-laborer': ['Loading/Unloading', 'Site Cleaning', 'Masonry Help'],
    maid: ['Deep Cleaning', 'Regular Cleaning', 'Cooking'],
    driver: ['Heavy Vehicle', 'Light Vehicle', 'Taxi/Cab']
};

// --- 2. Dynamic Dropdown Logic ---
window.populateSubWork = function() {
    const workType = document.getElementById('join-work-type').value;
    const subWorkGroup = document.getElementById('sub-work-group');
    const subWorkSelect = document.getElementById('join-sub-work-type');

    subWorkSelect.innerHTML = '<option value="">-- Select specialization --</option>';

    if (workType && SUB_WORK_OPTIONS[workType]) {
        SUB_WORK_OPTIONS[workType].forEach(subWork => {
            const option = document.createElement('option');
            option.value = subWork;
            option.textContent = subWork;
            subWorkSelect.appendChild(option);
        });
        subWorkGroup.style.display = 'block';
        subWorkSelect.required = true;
    } else {
        subWorkGroup.style.display = 'none';
        subWorkSelect.required = false;
    }
}
// Run this on load to set up the form
document.addEventListener('DOMContentLoaded', populateSubWork);


// --- 3. Form Submission Logic ---
document.getElementById('join-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('join-msg');
    msg.textContent = ''; msg.className = 'form-message';
    
    const name = document.getElementById('join-name').value;
    const mobile = document.getElementById('join-mobile').value;
    const location = document.getElementById('join-location').value;
    const workType = document.getElementById('join-work-type').value;
    const subWorkType = document.getElementById('join-sub-work-type').value; // <-- NEW FIELD

    if (!/^[0-9]{10}$/.test(mobile)) { msg.textContent = 'Mobile number must be 10 digits.'; msg.classList.add('error'); return; }

    const token = localStorage.getItem('userToken');
    if (!token) { msg.textContent = 'Not logged in. Redirecting...'; msg.classList.add('error'); setTimeout(() => window.location.href = 'login.html', 2000); return; }

    try {
        const response = await fetch(`${API_BASE_URL}/join`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, 
            // SEND NEW FIELD
            body: JSON.stringify({ name, mobile, location, workType, subWorkType }) 
        });

        if (response.ok) {
            msg.textContent = 'Profile saved! Redirecting home...'; 
            msg.classList.add('success');
            setTimeout(() => { window.location.href = 'index.html'; }, 1000); 
            document.getElementById('join-form').reset();
        } else {
            let errorMessage = `Error: ${response.status} ${response.statusText}`; 
            try { const data = await response.json(); errorMessage = 'Error: ' + data.message; } catch (e) {} 
            msg.textContent = errorMessage; 
            msg.classList.add('error'); 
            if (response.status === 401) { setTimeout(() => window.location.href = 'login.html', 2000); }
        }
    } catch (err) { 
        console.error('Join Fetch Error:', err); 
        msg.textContent = 'Network Error: Cannot connect to server.';
        msg.classList.add('error'); 
    }
});
