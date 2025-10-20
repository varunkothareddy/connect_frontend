document.addEventListener('DOMContentLoaded', () => {
    const loggedOutNav = document.getElementById('nav-logged-out');
    const loggedInNav = document.getElementById('nav-logged-in');
    const usernameSpan = document.getElementById('nav-username');
    const logoutBtn = document.getElementById('logout-btn');
    const searchCard = document.getElementById('search-card');
    const joinCard = document.getElementById('join-card');

    const userToken = localStorage.getItem('userToken');
    const userName = localStorage.getItem('loggedInUser');

    if (userToken && userName) {
        loggedInNav.style.display = 'flex'; loggedOutNav.style.display = 'none'; usernameSpan.textContent = 'Welcome, ' + userName;
    } else {
        loggedInNav.style.display = 'none'; loggedOutNav.style.display = 'flex';
    }

    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('userToken'); localStorage.removeItem('loggedInUser'); window.location.href = 'index.html';
        });
    }

    function protectLink(element) {
        if (element) {
            element.addEventListener('click', (event) => {
                if (!userToken) {
                    event.preventDefault(); localStorage.setItem('intendedDestination', element.href); window.location.href = 'login.html';
                }
            });
        }
    }
    protectLink(searchCard);
    protectLink(joinCard);
});