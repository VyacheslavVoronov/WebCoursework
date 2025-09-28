document.addEventListener('headerLoaded', () => {
    const initBurgerMenu = () => {
        const navButton = document.querySelector('.nav-button');
        const navMenu = document.querySelector('.nav-menu');
        const navOverlay = document.querySelector('.nav-overlay');

        if (!navButton || !navMenu || !navOverlay) {
            console.warn('Burger menu elements not found:', { navButton, navMenu, navOverlay });
            return;
        }

        navButton.style.backgroundColor = 'black';

        const toggleMenu = (isOpen) => {
            if (isOpen) {
                navMenu.classList.add('active');
                navOverlay.style.display = 'block';
            } else {
                navMenu.classList.remove('active');
                navOverlay.style.display = 'none';
            }
            navButton.style.backgroundColor = isOpen ? '#ffbe34' : 'black';
        };

        navButton.addEventListener('click', () => {
            const isOpen = navMenu.classList.contains('active');
            toggleMenu(!isOpen);
        });

        navOverlay.addEventListener('click', () => toggleMenu(false));

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

    };

    initBurgerMenu();
});
