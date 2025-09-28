document.addEventListener('DOMContentLoaded', () => {
    const toggles = document.querySelectorAll('.faq-question');

    if (toggles.length === 0) {
        console.warn('Вопросы не найдены');
        return;
    }

    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.getAttribute('aria-controls');
            const content = document.getElementById(targetId);
            const isOpen = toggle.getAttribute('aria-expanded') === 'true';

            toggles.forEach(item => {
                if (item !== toggle) {
                    const otherContent = document.getElementById(item.getAttribute('aria-controls'));
                    item.setAttribute('aria-expanded', 'false');
                    otherContent.setAttribute('aria-hidden', 'true');
                    otherContent.style.maxHeight = '0';
                }
            });

            if (!isOpen) {
                content.setAttribute('aria-hidden', 'false');
                content.style.maxHeight = content.scrollHeight + 'px';
                toggle.setAttribute('aria-expanded', 'true');
            } else {
                content.setAttribute('aria-hidden', 'true');
                content.style.maxHeight = '0';
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
});