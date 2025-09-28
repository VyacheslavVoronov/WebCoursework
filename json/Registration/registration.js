import { ModalHandler } from './modalHandler.js';
import { FormValidator } from './formValidator.js';
import { NicknameGenerator } from './nicknameGenerator.js';
import { UserRegistration } from './userRegistration.js';

window.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    if (userId && (userRole === 'user' || userRole === 'admin')) {
        console.log('User already registered, redirecting to HomePage.html');
        window.location.href = '../pages/HomePage.html';
        return;
    }

    const waitForElement = (selector, callback) => {
        const el = document.querySelector(selector);
        if (el) return callback(el);
        const observer = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el) {
                observer.disconnect();
                callback(el);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    };

    waitForElement('#registrationForm', (form) => {
        const modalHandler = new ModalHandler('#customModal');
        const formValidator = new FormValidator(form);
        const nicknameGenerator = new NicknameGenerator(form);
        const userRegistration = new UserRegistration(form, modalHandler);

        formValidator.init();
        nicknameGenerator.init();
        userRegistration.init();
    });
});
