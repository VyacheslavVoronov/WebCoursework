document.addEventListener('DOMContentLoaded', () => {
    const protectedPaths = [
        '/pages/Catalog.html',
        '/pages/Favorites.html',
        '/pages/Basket.html',
        '/pages/Profile.html'
    ];

    const uiElements = {
        loginLink: null,
        registerLink: null,
        cartLink: null,
        profileLink: null,
        instagramLink: null,
        adminLink: null
    };

    function isLoggedIn() {
        const userId = localStorage.getItem('userId');
        const userRole = localStorage.getItem('userRole');
        const isAuthenticated = userId && (userRole === 'user' || userRole === 'admin');
        console.log('isLoggedIn:', { userId, userRole, isAuthenticated });
        return isAuthenticated;
    }

    function updateElements() {
        uiElements.loginLink = document.getElementById('login-link');
        uiElements.registerLink = document.getElementById('register-link');
        uiElements.cartLink = document.getElementById('cart-link');
        uiElements.profileLink = document.getElementById('profile-link');
        uiElements.instagramLink = document.getElementById('instagram-link');
        uiElements.adminLink = document.getElementById('admin-link');
        console.log('authGuard: updated elements:', uiElements);
    }

    function updateUI(isLoggedIn) {
        updateElements();
        if (!uiElements.loginLink || !uiElements.profileLink || !uiElements.cartLink) {
            console.warn('Required header elements not found');
            return;
        }
        uiElements.loginLink.style.display = isLoggedIn ? 'none' : 'block';
        if (uiElements.registerLink) {
            uiElements.registerLink.style.display = isLoggedIn ? 'none' : 'block';
        }
        uiElements.cartLink.style.display = isLoggedIn ? 'block' : 'none';
        uiElements.profileLink.style.display = isLoggedIn ? 'block' : 'none';
        

        if (uiElements.instagramLink && uiElements.adminLink) {
            const userRole = localStorage.getItem('userRole');
            if (isLoggedIn && userRole === 'admin') {
                uiElements.instagramLink.style.display = 'none';
                uiElements.adminLink.style.display = 'inline-flex';
            } else {
                uiElements.instagramLink.style.display = 'inline-flex';
                uiElements.adminLink.style.display = 'none';
            }
        }
    }

    function setupObserver() {
        const observer = new MutationObserver(() => {
            updateElements();
            if (uiElements.loginLink && uiElements.cartLink && uiElements.profileLink) {
                updateUI(isLoggedIn());
            }

            const header = document.getElementById('header-content');
            if (header) {
                const links = header.querySelectorAll('a');
                links.forEach(link => {
                    try {
                        const absolutePath = new URL(link.href, window.location.origin).pathname;
                        if (protectedPaths.includes(absolutePath)) {
                            link.addEventListener('click', (e) => {
                                if (!isLoggedIn()) {
                                    e.preventDefault();
                                    console.log('Blocked header link navigation to:', absolutePath);
                                    localStorage.setItem('redirectAfterLogin', absolutePath);
                                    window.location.href = '/pages/LogIn.html';
                                }
                            });
                        }
                    } catch (error) {
                        console.error('Недействительный URL:', link.href);
                    }
                });
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function initAuthGuard() {
        updateElements();
        setupObserver();
        updateUI(isLoggedIn());

        window.addEventListener('authChanged', (event) => {
            console.log('authGuard: authChanged, userId:', event.detail.userId);
            updateUI(!!event.detail.userId);
            if (event.detail.userId && window.location.pathname === '/pages/LogIn.html') {
                console.log('Redirecting after login to Profile.html');
                localStorage.removeItem('justLoggedIn');
                const redirectPath = localStorage.getItem('redirectAfterLogin') || '/pages/Profile.html';
                localStorage.removeItem('redirectAfterLogin');
                window.location.href = redirectPath;
            }
        });

        if (protectedPaths.includes(window.location.pathname) && !isLoggedIn() && !localStorage.getItem('justLoggedIn')) {
        console.log('Redirecting to login from:', window.location.pathname);
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = '/pages/LogIn.html';
    }

    document.addEventListener('click', (e) => {
        const target = e.target.closest('a');
        if (target) {
            try {
                const absolutePath = new URL(target.href, window.location.origin).pathname;
                if (protectedPaths.includes(absolutePath)) {
                    if (!isLoggedIn()) {
                        e.preventDefault();
                        console.log('Blocked navigation to:', absolutePath);
                        localStorage.setItem('redirectAfterLogin', absolutePath);
                        window.location.href = '/pages/LogIn.html';
                    }
                }
            } catch (error) {
                console.error('Недействительный URL:', target.href);
            }
        }
    });
}})