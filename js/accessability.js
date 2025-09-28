(function() {
    
    const baseFontSize = parseInt(getComputedStyle(document.documentElement).fontSize) || 16;
    let currentFontSize = baseFontSize;
    
    const setupAccessibility = () => {
        document.querySelector('.accessibility-icon-toggle')?.addEventListener('click', openModal);
        
        document.getElementById('close-accessibility-modal')?.addEventListener('click', closeModal);
        
        document.querySelectorAll('.font-size-buttons button').forEach(button => {
            button.addEventListener('click', function() {
                setFontSize(this.dataset.fontSize);
            });
        });

        document.querySelectorAll('.color-scheme-buttons button').forEach(button => {
            button.addEventListener('click', function() {
                setColorScheme(this.dataset.scheme);
            });
        });

        document.getElementById('toggle-images')?.addEventListener('click', toggleImages);
        
        document.getElementById('reset-accessibility')?.addEventListener('click', resetSettings);
    };

    const openModal = () => {
        if (window.modalManager) {
            window.modalManager.openModal('accessibility-modal');
        } else {
            document.getElementById('accessibility-modal').style.display = 'flex';
        }
    };

    const closeModal = () => {
        if (window.modalManager) {
            window.modalManager.closeModal('accessibility-modal');
        } else {
            document.getElementById('accessibility-modal').style.display = 'none';
        }
    };

    const setFontSize = (size) => {
        document.querySelector('.font-size-buttons button.active')?.classList.remove('active');
        document.querySelector(`.font-size-buttons button[data-font-size="${size}"]`).classList.add('active');
        
        switch(size) {
            case 'small':
                currentFontSize = baseFontSize - 2;
                document.body.classList.remove('large-font-mode');
                document.body.classList.add('small-font-mode');
                break;
            case 'medium':
                currentFontSize = baseFontSize;
                document.body.classList.remove('large-font-mode', 'small-font-mode');
                break;
            case 'large':
                currentFontSize = baseFontSize + 4;
                document.body.classList.remove('small-font-mode');
                document.body.classList.add('large-font-mode');
                break;
        }
        
        document.documentElement.style.fontSize = `${currentFontSize}px`;
        
        updateTextWrapping();
    };

    const setColorScheme = (scheme) => {
        document.querySelector('.color-scheme-buttons button.active')?.classList.remove('active');
        document.querySelector(`.color-scheme-buttons button[data-scheme="${scheme}"]`).classList.add('active');
        
        document.body.classList.remove(
            'color-scheme-dark-white',
            'color-scheme-dark-green',
            'color-scheme-white-black',
            'color-scheme-beige-brown',
            'color-scheme-blue-darkblue'
        );
        
        document.body.classList.add(`color-scheme-${scheme}`);
        
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
        
        document.body.offsetHeight;
    };

    const toggleImages = () => {
        document.body.classList.toggle('images-disabled');
        
        if (document.body.classList.contains('images-disabled')) {
            document.querySelectorAll('img[alt]').forEach(img => {
                const altText = document.createElement('div');
                altText.className = 'image-alt-text';
                altText.textContent = img.alt;
                
                const parent = img.parentNode;
                if (parent.classList.contains('blog-image-wrap') || 
                    parent.classList.contains('about-image') || 
                    parent.classList.contains('features-image') ||
                    parent.classList.contains('home-service-icon-wrap')) {
                    parent.innerHTML = '';
                    parent.appendChild(altText);
                } else {
                    img.parentNode.insertBefore(altText, img.nextSibling);
                }
            });
        } else {
            document.querySelectorAll('.image-alt-text').forEach(el => el.remove());
            
            const specialContainers = document.querySelectorAll('.blog-image-wrap, .about-image, .features-image, .home-service-icon-wrap');
            specialContainers.forEach(container => {
                if (container.children.length === 0) {
                    const placeholder = document.createElement('div');
                    placeholder.style.width = '100%';
                    placeholder.style.height = '100px';
                    placeholder.style.backgroundColor = 'var(--background-color)';
                    placeholder.style.border = '1px solid var(--content-color)';
                    placeholder.style.borderRadius = '4px';
                    placeholder.style.display = 'flex';
                    placeholder.style.alignItems = 'center';
                    placeholder.style.justifyContent = 'center';
                    placeholder.textContent = 'Изображение';
                    container.appendChild(placeholder);
                }
            });
        }
    };

    const updateTextWrapping = () => {
        const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, li');
        textElements.forEach(element => {
            element.style.wordWrap = 'break-word';
            element.style.overflowWrap = 'break-word';
            element.style.wordBreak = 'break-word';
            element.style.whiteSpace = 'normal';
        });
        
        const problemContainers = document.querySelectorAll('.about-content, .space-top-sm, .footer-text, .service-card, .blog-content-wrap, .blog-wrap, .blog-image-wrap');
        problemContainers.forEach(container => {
            container.style.wordWrap = 'break-word';
            container.style.overflowWrap = 'break-word';
            container.style.wordBreak = 'break-word';
        });
        
        const blogContentWraps = document.querySelectorAll('.blog-content-wrap');
        blogContentWraps.forEach(wrap => {
            wrap.style.minWidth = '0';
            wrap.style.maxWidth = '100%';
        });
        
        const blogWraps = document.querySelectorAll('.blog-wrap');
        blogWraps.forEach(wrap => {
            wrap.style.flexWrap = 'wrap';
            wrap.style.gap = '1rem';
        });
        
        const blogImageWraps = document.querySelectorAll('.blog-image-wrap');
        blogImageWraps.forEach(wrap => {
            wrap.style.maxWidth = '100%';
            wrap.style.minWidth = '0';
        });
        
        if (window.innerWidth <= 362) {
            const grids = document.querySelectorAll('.layout-grid, .service-grid, .about-grid, .home-team-grid, .features-icon-list');
            grids.forEach(grid => {
                grid.style.gridTemplateColumns = '1fr';
                grid.style.gap = '1rem';
            });
            
            const cards = document.querySelectorAll('.service-card, .team-card, .blog-wrap');
            cards.forEach(card => {
                card.style.flexDirection = 'column';
                card.style.alignItems = 'stretch';
                card.style.width = '100%';
                card.style.maxWidth = '100%';
            });
            
            const containers = document.querySelectorAll('.container, .container-large, .container-small');
            containers.forEach(container => {
                container.style.maxWidth = '100%';
                container.style.minWidth = '0';
            });
        } else {
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
        }
    };

    const resetSettings = () => {
        document.documentElement.style.fontSize = '';
        currentFontSize = baseFontSize;
        
        document.body.classList.remove('large-font-mode', 'small-font-mode');
        
        document.querySelectorAll('.font-size-buttons button.active, .color-scheme-buttons button.active').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelector('.font-size-buttons button[data-font-size="medium"]').classList.add('active');
        document.querySelector('.color-scheme-buttons button[data-scheme="white-black"]').classList.add('active');
        
        document.body.classList.remove(
            'color-scheme-dark-white',
            'color-scheme-dark-green',
            'color-scheme-white-black',
            'color-scheme-beige-brown',
            'color-scheme-blue-darkblue',
            'images-disabled'
        );
        
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
        
        document.querySelectorAll('.image-alt-text').forEach(el => el.remove());
        
        const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, li');
        textElements.forEach(element => {
            element.style.wordWrap = '';
            element.style.overflowWrap = '';
            element.style.wordBreak = '';
        });
        
        document.body.offsetHeight;
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupAccessibility);
    } else {
        setupAccessibility();
    }

    document.addEventListener('headerLoaded', setupAccessibility, { once: true });
    
    window.addEventListener('resize', () => {
        if (document.body.classList.contains('large-font-mode')) {
            updateTextWrapping();
        }
    });
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                setupAccessibility();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
