const API_BASE_URL = 'https://we-connect-you-backend.onrender.com/api';

// --- 1. Define Sub-Work Options (Same as join.js) ---
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
window.populateSubWorkSearch = function() {
    const workType = document.getElementById('search-work-type').value;
    const subWorkGroup = document.getElementById('sub-work-group-search');
    const subWorkSelect = document.getElementById('search-sub-work-type');

    // Default option for search is 'Any'
    subWorkSelect.innerHTML = '<option value="">-- Any specialization --</option>';

    if (workType && SUB_WORK_OPTIONS[workType]) {
        SUB_WORK_OPTIONS[workType].forEach(subWork => {
            const option = document.createElement('option');
            option.value = subWork;
            option.textContent = subWork;
            subWorkSelect.appendChild(option);
        });
        subWorkGroup.style.display = 'block';
    } else {
        subWorkGroup.style.display = 'none';
    }
}
document.addEventListener('DOMContentLoaded', populateSubWorkSearch);

// --- 3. Form Submission Logic ---
document.getElementById('search-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('search-msg');
    msg.textContent = ''; msg.className = 'form-message';
    
    const location = document.getElementById('search-location').value;
    const workType = document.getElementById('search-work-type').value;
    const subWorkType = document.getElementById('search-sub-work-type').value; // <-- NEW FIELD

    const token = localStorage.getItem('userToken');
    if (!token) { msg.textContent = 'Not logged in. Redirecting...'; msg.classList.add('error'); setTimeout(() => window.location.href = 'login.html', 2000); return; }

    try {
        // Construct the URL with all parameters
        const url = new URL(`${API_BASE_URL}/search`);
        url.searchParams.append('location', location);
        url.searchParams.append('workType', workType);
        
        // Add subWorkType only if it has a value (not the default empty string)
        if (subWorkType) {
            url.searchParams.append('subWorkType', subWorkType);
        }

        const response = await fetch(url.toString(), { 
            method: 'GET', 
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token } 
        });

        if (response.ok) {
            const data = await response.json(); 
            msg.textContent = `Found ${data.length} worker(s)! Redirecting...`; 
            msg.classList.add('success');
            sessionStorage.setItem('searchResults', JSON.stringify(data));
            setTimeout(() => window.location.href = 'results.html', 500);
        } else {
            let errorMessage = `Error: ${response.status} ${response.statusText}`; 
            try { const data = await response.json(); errorMessage = 'Error: ' + data.message; } catch (e) {} 
            msg.textContent = errorMessage; 
            msg.classList.add('error');
        }
    } catch (err) { 
        console.error('Search Fetch Error:', err);
        msg.textContent = 'Network Error: Cannot connect to server.';
        msg.classList.add('error'); 
    }
});
