document.addEventListener('DOMContentLoaded', () => {
    const loggedOutNav = document.getElementById('nav-logged-out');
    const loggedInNav = document.getElementById('nav-logged-in');
    const usernameSpan = document.getElementById('nav-username');
    const logoutBtn = document.getElementById('logout-btn');
    // Assuming searchCard and joinCard are anchors <a>
    const searchCard = document.getElementById('search-card'); 
    const joinCard = document.getElementById('join-card');

    const userToken = localStorage.getItem('userToken');
    const userName = localStorage.getItem('loggedInUser'); // Now correctly set by login.js

    if (userToken && userName) {
        loggedInNav.style.display = 'flex'; 
        loggedOutNav.style.display = 'none'; 
        usernameSpan.textContent = 'Welcome, ' + userName; // FIX IS COMPLETE
    } else {
        loggedInNav.style.display = 'none'; 
        loggedOutNav.style.display = 'flex';
    }

    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('userToken'); 
            localStorage.removeItem('loggedInUser'); 
            window.location.href = 'index.html';
        });
    }

    function protectLink(element) {
        if (element) {
            element.addEventListener('click', (event) => {
                if (!userToken) {
                    event.preventDefault(); 
                    // Store the intended destination before redirecting to login
                    localStorage.setItem('intendedDestination', element.href); 
                    window.location.href = 'login.html';
                }
            });
        }
    }
    // Protect the cards on index.html
    protectLink(searchCard);
    protectLink(joinCard);
});
