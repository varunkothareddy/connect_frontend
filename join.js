document.getElementById('join-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('join-msg');
    msg.textContent = ''; msg.className = 'form-message';
    const name = document.getElementById('join-name').value;
    const mobile = document.getElementById('join-mobile').value;
    const location = document.getElementById('join-location').value;
    const workType = document.getElementById('join-work-type').value;

    if (!/^[0-9]{10}$/.test(mobile)) { msg.textContent = 'Mobile number must be 10 digits.'; msg.classList.add('error'); return; }

    const token = localStorage.getItem('userToken');
    if (!token) { msg.textContent = 'Not logged in. Redirecting...'; msg.classList.add('error'); setTimeout(() => window.location.href = 'login.html', 2000); return; }

    try {
        const response = await fetch('https://we-connect-you-backend.onrender.com/api/join', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify({ name, mobile, location, workType }) });
        if (response.ok) {
            const data = await response.json(); msg.textContent = 'Profile saved! Redirecting home...'; msg.classList.add('success');
            setTimeout(() => { window.location.href = 'index.html'; }, 2000); document.getElementById('join-form').reset();
        } else {
            let errorMessage = `Error: ${response.status} ${response.statusText}`; try { const data = await response.json(); errorMessage = 'Error: ' + data.message; } catch (e) {} msg.textContent = errorMessage; msg.classList.add('error'); if (response.status === 401) { setTimeout(() => window.location.href = 'login.html', 2000); }
        }
    } catch (err) { console.error('Join Fetch Error:', err); msg.textContent = 'SERVER DOWN? Connection error.'; msg.classList.add('error'); }
});