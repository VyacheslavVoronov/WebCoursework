function loadLayout() {
    return new Promise((resolve, reject) => {
        const header = document.getElementById('header');
        const footer = document.getElementById('footer');
        if (!header || !footer) {
            const error = new Error('Элементы header или footer не найдены в DOM');
            console.error(error);
            showErrorModal('Ошибка загрузки страницы. Убедитесь, что страница содержит элементы header и footer.');
            reject(error);
            return;
        }

        fetch('../components/layout.html')
            .then(response => {
                if (!response.ok) throw new Error(`Ошибка загрузки layout: ${response.status}`);
                return response.text();
            })
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const headerContent = doc.getElementById('header-content');
                const footerContent = doc.getElementById('footer-content');
                if (!headerContent || !footerContent) {
                    throw new Error('Элементы header-content или footer-content не найдены в layout.html');
                }
                header.innerHTML = headerContent.innerHTML;
                footer.innerHTML = footerContent.innerHTML;
                initAuthState();
                document.dispatchEvent(new Event('headerLoaded'));
                resolve();
            })
            .catch(error => {
                console.error('Layout loading error:', error);
                showErrorModal('Ошибка загрузки макета страницы. Попробуйте обновить.');
                reject(error);
            });
    });
}

function initAuthState() {
    const userId = localStorage.getItem('userId');
    updateAuthUI(userId);
    const event = new CustomEvent('authChanged', { detail: { userId } });
    document.dispatchEvent(event);
}

function updateAuthUI(userId) {
    const loginLink = document.getElementById('login-link');
    const cartLink = document.getElementById('cart-link');
    const profileLink = document.getElementById('profile-link');
    const instagramLink = document.getElementById('instagram-link');
    const adminLink = document.getElementById('admin-link');
    
    if (loginLink && cartLink && profileLink) {
        loginLink.style.display = userId ? 'none' : 'block';
        cartLink.style.display = userId ? 'block' : 'none';
        profileLink.style.display = userId ? 'block' : 'none';
    } else {
        console.warn('Auth UI elements not found:', { loginLink, cartLink, profileLink });
    }
    
    if (instagramLink && adminLink) {
        const userRole = localStorage.getItem('userRole');
        if (userId && userRole === 'admin') {
            instagramLink.style.display = 'none';
            adminLink.style.display = 'inline-flex';
        } else {
            instagramLink.style.display = 'inline-flex';
            adminLink.style.display = 'none';
        }
    } else {
        console.warn('Social media elements not found:', { instagramLink, adminLink });
    }
}

function setupAuthListener() {
    document.addEventListener('authChanged', ({ detail }) => {
        updateAuthUI(detail.userId);
    });
}

function showErrorModal(message) {
    const modal = document.createElement('div');
    modal.className = 'error-modal';
    modal.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ffe6e6; padding: 15px; border: 1px solid #ff3333; z-index: 1000; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);';
    modal.innerHTML = `<p>${message}</p><button style="margin-top: 10px; background: #ff3333; color: #fff; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Закрыть</button>`;
    modal.querySelector('button').addEventListener('click', () => modal.remove());
    document.body.appendChild(modal);
}

document.addEventListener('DOMContentLoaded', () => {
    setupAuthListener();

    const hidePreloader = () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('hidden');
            setTimeout(() => preloader.remove(), 500);
        } else {
            console.error('Элемент #preloader не найден');
        }
    };

    loadLayout()
        .then(() => {
            hidePreloader();
        })
        .catch(error => {
            console.error('Ошибка при загрузке layout:', error);
            hidePreloader();
        });
});
