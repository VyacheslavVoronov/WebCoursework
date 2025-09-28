(function() {
    
    const setupResetButton = () => {
        const resetButton = document.getElementById('reset-settings-btn');
        if (resetButton) {
            resetButton.addEventListener('click', resetAllSettings);
        } else {
            setTimeout(setupResetButton, 100);
        }
    };

    const resetAllSettings = () => {
        
        const confirmed = confirm(getTranslation('confirm_reset_settings') || 'Вы уверены, что хотите сбросить все настройки?');
        if (!confirmed) {
            return;
        }

        try {
            resetLanguageSettings();
            
            resetThemeSettings();
            
            resetAccessibilitySettings();
            
            clearLocalStorage();
            
            showResetNotification();
            
        } catch (error) {
            console.error('Ошибка при сбросе настроек:', error);
        }
    };

    const resetLanguageSettings = () => {
        
        const defaultLanguage = 'ru';
        setLanguage(defaultLanguage);
        
        const languageRadios = document.querySelectorAll("input[name='language']");
        languageRadios.forEach(radio => {
            radio.checked = (radio.value === defaultLanguage);
        });
    };

    const resetThemeSettings = () => {
        
        const defaultTheme = 'light';
        
        const themeToggle = document.getElementById('theme-mode');
        if (themeToggle) {
            themeToggle.checked = false;
        }
        
        document.body.classList.remove('dark-theme');
        
        try {
            localStorage.setItem('theme', defaultTheme);
        } catch (e) {
            console.error('Ошибка сохранения темы в localStorage:', e);
        }
    };

    const resetAccessibilitySettings = () => {
        
        document.documentElement.style.fontSize = '';
        document.body.classList.remove('large-font-mode', 'small-font-mode');
        
        document.body.classList.remove(
            'color-scheme-dark-white',
            'color-scheme-dark-green',
            'color-scheme-white-black',
            'color-scheme-beige-brown',
            'color-scheme-blue-darkblue',
            'images-disabled'
        );
        
        const fontButtons = document.querySelectorAll('.font-size-buttons button');
        fontButtons.forEach(btn => btn.classList.remove('active'));
        const mediumFontBtn = document.querySelector('.font-size-buttons button[data-font-size="medium"]');
        if (mediumFontBtn) {
            mediumFontBtn.classList.add('active');
        }
        
        const colorButtons = document.querySelectorAll('.color-scheme-buttons button');
        colorButtons.forEach(btn => btn.classList.remove('active'));
        const whiteBlackBtn = document.querySelector('.color-scheme-buttons button[data-scheme="white-black"]');
        if (whiteBlackBtn) {
            whiteBlackBtn.classList.add('active');
        }
        
        document.querySelectorAll('.image-alt-text').forEach(el => el.remove());
        
        const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, li');
        textElements.forEach(element => {
            element.style.wordWrap = '';
            element.style.overflowWrap = '';
            element.style.wordBreak = '';
        });
        
        const grids = document.querySelectorAll('.layout-grid, .service-grid, .about-grid, .home-team-grid, .features-icon-list');
        grids.forEach(grid => {
            grid.style.gridTemplateColumns = '';
            grid.style.gap = '';
        });
        
        const cards = document.querySelectorAll('.service-card, .team-card, .blog-wrap');
        cards.forEach(card => {
            card.style.flexDirection = '';
            card.style.alignItems = '';
            card.style.width = '';
            card.style.maxWidth = '';
        });
        
        const containers = document.querySelectorAll('.container, .container-large, .container-small');
        containers.forEach(container => {
            container.style.maxWidth = '';
            container.style.minWidth = '';
        });
        
        document.body.offsetHeight;
    };

    const clearLocalStorage = () => {
        
        try {
            const keysToRemove = ['theme', 'language', 'accessibility-font-size', 'accessibility-color-scheme', 'accessibility-images-disabled'];
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (e) {
            console.error('Ошибка очистки localStorage:', e);
        }
    };

    const showResetNotification = () => {
        const notification = document.createElement('div');
        const zIndex = window.modalManager ? window.modalManager.currentZIndex + 100 : 10000;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--primary-color);
            color: #23212a;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: "Krub-Medium", sans-serif;
            font-size: 14px;
            font-weight: 500;
            z-index: ${zIndex};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        notification.textContent = getTranslation('settings_reset_success') || 'Настройки успешно сброшены!';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    };

    const getTranslation = (key) => {
        const currentLang = localStorage.getItem('language') || 'ru';
        const translations = {
            ru: {
                confirm_reset_settings: 'Вы уверены, что хотите сбросить все настройки?',
                settings_reset_success: 'Настройки успешно сброшены!'
            },
            en: {
                confirm_reset_settings: 'Are you sure you want to reset all settings?',
                settings_reset_success: 'Settings successfully reset!'
            }
        };
        return translations[currentLang]?.[key] || translations.ru[key];
    };

    const setLanguage = (lang) => {
        try {
            localStorage.setItem("language", lang);
            if (window.applyTranslations) {
                window.applyTranslations(lang);
            }
            window.dispatchEvent(new Event('languageChanged'));
        } catch (e) {
            console.error('Ошибка установки языка:', e);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupResetButton);
    } else {
        setupResetButton();
    }

    document.addEventListener('headerLoaded', setupResetButton, { once: true });

    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE && 
                        (node.id === 'reset-settings-btn' || node.querySelector('#reset-settings-btn'))) {
                        setupResetButton();
                    }
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();

