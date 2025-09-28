import { ModalHandler } from '../Registration/modalHandler.js';
import { LoginHandler } from './loginHandler.js';
import { showError, hideError } from '../Utils/utils.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing auth...');
    
    const form = document.querySelector('.login-form');
    if (!form) {
        console.error('Login form not found');
        return;
    }

    const modal = document.querySelector('#customModal');
    if (!modal) {
        console.error('Modal not found');
        return;
    }
    
    console.log('Form and modal found, creating handlers...');
    const modalHandler = new ModalHandler('#customModal');
    const loginHandler = new LoginHandler(form, modalHandler);
    loginHandler.init();

    form.querySelector('input[name="email"]')
        .addEventListener('input', (e) => hideError(e.target));
    form.querySelector('input[name="password"]')
        .addEventListener('input', (e) => hideError(e.target));
});
