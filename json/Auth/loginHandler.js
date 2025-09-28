import { api } from '../Api/api.js';
import { ServiceDataManager } from '../ServiceDetails/serviceDataManager.js';
import { showError, hideError, clearUserData } from '../Utils/utils.js';

export class LoginHandler {
    constructor(form, modalHandler) {
        this.form = form;
        this.modalHandler = modalHandler;
        this.dataManager = new ServiceDataManager();
        this.uiElements = {
            emailInput: form.querySelector('input[name="email"]'),
            passwordInput: form.querySelector('input[name="password"]')
        };
        this.isLoggingIn = false;
    }

    init() {
        this.initializeAuthState();
        this.setupFormHandler();
        this.setupLogoutHandler();
        this.setupInputHandlers();
    }

    setupInputHandlers() {
        this.uiElements.emailInput.addEventListener('input', (e) => hideError(e.target));
        this.uiElements.passwordInput.addEventListener('input', (e) => hideError(e.target));
    }

    initializeAuthState() {
        const isLoggedIn = !!localStorage.getItem('userId');
        window.dispatchEvent(new CustomEvent('authChanged', {
            detail: { userId: isLoggedIn ? localStorage.getItem('userId') : null }
        }));
    }

    setupFormHandler() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (this.isLoggingIn) return;
            this.isLoggingIn = true;
            const submitButton = this.form.querySelector('button[type="submit"]');
            if (submitButton) submitButton.disabled = true;
            try {
                await this.handleLogin();
            } finally {
                this.isLoggingIn = false;
                if (submitButton) submitButton.disabled = false;
            }
        });
    }

    async handleLogin() {
        const email = this.uiElements.emailInput.value.trim();
        const password = this.uiElements.passwordInput.value.trim();
        
        if (!email || !password) {
            this.modalHandler.showModal('Пожалуйста, заполните все поля', 'error');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.modalHandler.showModal('Пожалуйста, введите корректный email адрес', 'error');
            return;
        }
        
        try {
            const user = await this.authenticateUser(email, password);
            await this.processSuccessfulLogin(user);
        } catch (error) {
            this.handleLoginError(error);
        }
    }

    async authenticateUser(email, password) {
        try {
            const users = await api.getUserByEmail(email);
            if (!users.length) throw new Error('Пользователь не найден');

            const user = users[0];
            if (user.password !== password) throw new Error('Неверный пароль');
            if (!user.role) throw new Error('Роль пользователя не определена');

            return user;
        } catch (error) {
            if (error.message.includes('Не удалось найти пользователя по email')) {
                throw new Error('Ошибка соединения с сервером. Проверьте подключение к интернету');
            }
            throw error;
        }
    }

    async processSuccessfulLogin(user) {
        const currentUserId = localStorage.getItem('userId');
        if (currentUserId && currentUserId !== user.id) {
            console.log('Смена пользователя: очищаем данные предыдущего пользователя');
            clearUserData();
        }
        
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('justLoggedIn', 'true');
        await this.dataManager.syncWithServer(user.id);
        this.modalHandler.showModal('Вход выполнен успешно!', 'success');
        window.dispatchEvent(new CustomEvent('authChanged', {
            detail: { userId: user.id }
        }));
        
        setTimeout(() => {
            window.location.href = '../pages/HomePage.html';
        }, 1500);
    }

    setupLogoutHandler() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#logout-button')) {
                this.handleLogout();
            }
        });
    }

    handleLogout() {
        clearUserData();
        
        window.dispatchEvent(new CustomEvent('authChanged', {
            detail: { userId: null }
        }));
        
        window.location.href = '../pages/LogIn.html';
    }

    handleLoginError(error) {
        let message = 'Произошла ошибка входа';
        
        if (error.message === 'Пользователь не найден') {
            message = 'Пользователь с таким email не найден';
        } else if (error.message === 'Неверный пароль') {
            message = 'Неверный пароль. Проверьте правильность введенных данных';
        } else if (error.message === 'Роль пользователя не определена') {
            message = 'Ошибка конфигурации пользователя. Обратитесь к администратору';
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            message = 'Ошибка соединения с сервером. Проверьте подключение к интернету';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            message = 'Сервер недоступен. Попробуйте позже';
        } else if (error.message.includes('timeout')) {
            message = 'Превышено время ожидания ответа сервера';
        } else if (error.status >= 500) {
            message = 'Ошибка сервера. Попробуйте позже';
        } else if (error.status >= 400 && error.status < 500) {
            message = 'Некорректный запрос. Проверьте введенные данные';
        } else if (error.message.includes('JSON')) {
            message = 'Ошибка обработки данных сервера';
        }
        
        this.modalHandler.showModal(message, 'error');
        setTimeout(() => this.modalHandler.hideModal(), 5000);
    }
}