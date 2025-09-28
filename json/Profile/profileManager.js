import { api } from '../Api/api.js';
import { LoginHandler } from '../Auth/loginHandler.js';

export class ProfileManager {
    constructor() {
        this.uiElements = {
            emailDisplay: document.getElementById('user-email'),
            nicknameDisplay: document.getElementById('user-nickname'),
            emailInput: document.getElementById('email-input'),
            nicknameInput: document.getElementById('nickname-input'),
            profileForm: document.getElementById('profile-form'),
            successMessage: document.getElementById('success-message'),
            logoutButton: document.getElementById('logout-button'),
            errorMessage: document.getElementById('error-message')
        };
        this.loginHandler = new LoginHandler(document.createElement('form'), {
            showModal: (message, type) => this.showMessage(message, type)
        });
        this.init();
    }

    async init() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            this.showMessage('Пожалуйста, войдите в аккаунт', 'error');
            setTimeout(() => {
                window.location.href = '../pages/Login.html';
            }, 2000);
            return;
        }
        await this.loadUserData();
        this.setupFormHandler();
        this.setupLogoutHandler();
    }

    async loadUserData() {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) throw new Error('Пользователь не авторизован');
            const user = await api.getUserById(userId);
            this.uiElements.emailDisplay.textContent = user.email;
            this.uiElements.nicknameDisplay.textContent = user.nickname || 'Не указан';
            this.uiElements.emailInput.value = user.email;
            this.uiElements.nicknameInput.value = user.nickname || '';
        } catch (error) {
            console.error('Ошибка загрузки данных пользователя:', error);
            this.showMessage('Не удалось загрузить данные профиля', 'error');
        }
    }

    setupFormHandler() {
        this.uiElements.profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleUpdateProfile();
        });
    }

    async handleUpdateProfile() {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) throw new Error('Пользователь не авторизован');
            const nickname = this.uiElements.nicknameInput.value.trim();
            if (!nickname) throw new Error('Никнейм не может быть пустым');
            await api.updateUser(userId, { nickname });
            this.uiElements.nicknameDisplay.textContent = nickname;
            this.showMessage('Изменения успешно сохранены!', 'success');
        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
            this.showMessage(error.message || 'Произошла ошибка при сохранении изменений', 'error');
        }
    }

    setupLogoutHandler() {
        this.uiElements.logoutButton.addEventListener('click', () => {
            this.loginHandler.handleLogout();
        });
    }

    showMessage(message, type) {
        const messageElement = type === 'success' ? this.uiElements.successMessage : this.uiElements.errorMessage;
        if (!messageElement) {
            console.warn(`Элемент для сообщений типа ${type} не найден, выводим через alert`);
            const language = localStorage.getItem('language') || 'ru';
            alert(language === 'en' ? message : message);
            return;
        }
        messageElement.textContent = message;
        messageElement.style.display = 'block';
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
});
