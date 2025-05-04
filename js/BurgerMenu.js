document.addEventListener('headerLoaded', () => {
    const navButton = document.querySelector('.nav-button');
    const navMenu = document.querySelector('.nav-menu');
    const navOverlay = document.querySelector('.nav-overlay');

    if (!navButton || !navMenu || !navOverlay) {
        console.error('Не удалось найти элементы для бургер-меню:', { navButton, navMenu, navOverlay });
        return;
    }

    navButton.addEventListener('click', () => {
        const isOpen = navMenu.style.display === 'block';
        navMenu.style.display = isOpen ? 'none' : 'block';
        navOverlay.style.display = isOpen ? 'none' : 'block';
        const currentColor = navButton.style.backgroundColor;

        if (currentColor === 'rgb(255, 190, 52)') {
            navButton.style.backgroundColor = '#091242';
        } else {
            navButton.style.backgroundColor = '#ffbe34';
        }
    });

    navOverlay.addEventListener('click', () => {
        navMenu.style.display = 'none';
        navOverlay.style.display = 'none';
    });

    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdownList = toggle.nextElementSibling;
            const isVisible = dropdownList.style.display === 'block';
            dropdownList.style.display = isVisible ? 'none' : 'block';
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-list').forEach(list => {
                list.style.display = 'none';
            });
        }
    });
});