// --- FIX: The base URL must stop at /api ---
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
    // CRITICAL: Prevent the default form submission (the page reload)
    e.preventDefault(); 
    
    const msg = document.getElementById('search-msg');
    msg.textContent = ''; msg.className = 'form-message';
    
    // Get values, trim whitespace
    const location = document.getElementById('search-location').value.trim();
    const workType = document.getElementById('search-work-type').value.trim();
    // Use optional chaining just in case the element isn't fully set up (though it should be)
    const subWorkType = document.getElementById('search-sub-work-type')?.value.trim() || ''; 

    const token = localStorage.getItem('userToken');
    if (!token) { msg.textContent = 'Not logged in. Redirecting...'; msg.classList.add('error'); setTimeout(() => window.location.href = 'login.html', 2000); return; }

    // --- Robustly build the query string ---
    const searchParams = new URLSearchParams();

    if (location) {
        searchParams.append('location', location);
    } else {
        msg.textContent = 'Error: Location is required for search.';
        msg.classList.add('error');
        return;
    }

    if (workType && workType !== 'all' && workType !== '-- Select work --') {
        searchParams.append('workType', workType);
    }
    
    if (subWorkType && subWorkType !== 'all' && subWorkType !== '-- Any specialization --') {
        searchParams.append('subWorkType', subWorkType);
    }
    
    try {
        const url = `${API_BASE_URL}/search?${searchParams.toString()}`;

        const response = await fetch(url, { 
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
            try { 
                const data = await response.json(); 
                errorMessage = 'Search Error: ' + data.message; 
            } catch (e) {} 
            msg.textContent = errorMessage; 
            msg.classList.add('error');
        }
    } catch (err) { 
        console.error('Search Fetch Error:', err);
        msg.textContent = 'Network Error: Cannot connect to server.';
        msg.classList.add('error'); 
    }
});
