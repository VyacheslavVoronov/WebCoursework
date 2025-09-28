import { CartManager } from './CartManager.js';

document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId') || null;
    const cartManager = new CartManager(userId);

    window.addEventListener('languageChanged', () => {
        cartManager.render();
    });
});