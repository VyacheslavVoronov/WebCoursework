import { api } from '../Api/api.js';
import { generatePassword } from '../Utils/utils.js';
import { ServiceDataManager } from '../ServiceDetails/serviceDataManager.js';

export class UserRegistration {
    constructor(form, modalHandler) {
        this.form = form;
        this.modalHandler = modalHandler;
        this.firstNameInput = document.getElementById('firstName');
        this.lastNameInput = document.getElementById('lastName');
        this.middleNameInput = document.getElementById('middleName');
        this.phoneInput = document.getElementById('phone');
        this.emailInput = document.getElementById('email');
        this.birthdateInput = document.getElementById('birthdate');
        this.nicknameInput = document.getElementById('nicknameInput');
        this.manualPasswordInput = document.querySelector('input[name="password"]');
        this.confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');
        this.dataManager = new ServiceDataManager();
        this.isRegistering = false;
        console.log('UserRegistration constructor:', {
            form: !!form,
            modalHandler: !!modalHandler,
            inputs: {
                firstName: !!this.firstNameInput,
                lastName: !!this.lastNameInput,
                middleName: !!this.middleNameInput,
                phone: !!this.phoneInput,
                email: !!this.emailInput,
                birthdate: !!this.birthdateInput,
                nickname: !!this.nicknameInput,
                password: !!this.manualPasswordInput,
                confirmPassword: !!this.confirmPasswordInput
            }
        });
    }

    init() {
        if (!this.form) {
            console.error('Registration form not found');
            return;
        }
        console.log('UserRegistration init called');
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (this.isRegistering) {
                console.log('Registration already in progress, ignoring submit');
                return;
            }
            this.isRegistering = true;
            const submitButton = this.form.querySelector('button[type="submit"]');
            if (submitButton) submitButton.disabled = true;

            try {
                const isManualPassword = document.querySelector('input[name="passwordType"]:checked')?.value === 'manual';
                console.log('Submitting registration, password type:', isManualPassword ? 'manual' : 'auto');
                const userData = {
                    firstName: this.firstNameInput.value.trim(),
                    lastName: this.lastNameInput.value.trim(),
                    middleName: this.middleNameInput.value.trim(),
                    phone: this.phoneInput.value,
                    email: this.emailInput.value,
                    birthdate: this.birthdateInput.value,
                    nickname: this.nicknameInput.value,
                    password: isManualPassword ? this.manualPasswordInput.value : generatePassword(),
                    role: 'user',
                    cart: [],
                    favorites: []
                };
                console.log('User data:', { ...userData, password: '****' });

                const [existingEmail, allUsers] = await Promise.all([
                    api.getUserByEmail(userData.email),
                    api.getUsers()
                ]);

                if (existingEmail.length) throw new Error('Email already registered');
                if (allUsers.some(u => u.phone === userData.phone)) throw new Error('Phone already exists');

                const newUser = await api.createUser(userData);
                console.log('User created:', newUser);
                localStorage.setItem('userId', newUser.id);
                localStorage.setItem('userRole', newUser.role);
                localStorage.setItem('justRegistered', 'true');

                await this.dataManager.syncWithServer(newUser.id);
                console.log('syncWithServer completed');

                const successMessage = isManualPassword
                    ? '🎉 Registration successful!<br><br>Welcome to TransitFlow!<br>You will be redirected to the main page in a few seconds.'
                    : `🎉 Registration successful!<br><br>Welcome to TransitFlow!<br><br>Your generated password: <strong>${userData.password}</strong><br><br>Please save this password securely.<br>You will be redirected to the main page in a few seconds.`;
                this.modalHandler.showModal(successMessage, 'success');

                window.dispatchEvent(new CustomEvent('authChanged', { detail: { userId: newUser.id } }));
                
                setTimeout(() => {
                    window.location.href = '../pages/HomePage.html';
                }, 2000);
            } catch (error) {
                console.error('Registration error:', error);
                this.modalHandler.showModal(`Error: ${error.message}`, 'error');
            } finally {
                this.isRegistering = false;
                if (submitButton) submitButton.disabled = false;
            }
        });
    }
}