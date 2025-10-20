document.getElementById('search-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('search-msg');
    msg.textContent = ''; msg.className = 'form-message';
    const location = document.getElementById('search-location').value;
    const workType = document.getElementById('search-work-type').value;

    const token = localStorage.getItem('userToken');
    if (!token) { msg.textContent = 'Not logged in. Redirecting...'; msg.classList.add('error'); setTimeout(() => window.location.href = 'login.html', 2000); return; }

    try {
        const response = await fetch(`https://we-connect-you-backend.onrender.com/api/search?location=${location}&workType=${workType}`, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token } });
        if (response.ok) {
            const data = await response.json(); msg.textContent = `Found ${data.length} worker(s)! Redirecting...`; msg.classList.add('success');
            sessionStorage.setItem('searchResults', JSON.stringify(data));
            setTimeout(() => window.location.href = 'results.html', 1000);
        } else {
            let errorMessage = `Error: ${response.status} ${response.statusText}`; try { const data = await response.json(); errorMessage = 'Error: ' + data.message; } catch (e) {} msg.textContent = errorMessage; msg.classList.add('error');
        }
    } catch (err) { console.error('Search Fetch Error:', err); msg.textContent = 'SERVER DOWN? Connection error.'; msg.classList.add('error'); }
});