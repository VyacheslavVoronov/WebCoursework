import { validatePhone, validateEmail, validateAge, validatePassword, showError, hideError } from '../Utils/utils.js';
import { api } from '../Api/api.js';

export class FormValidator {
    constructor(form) {
        this.form = form;
        this.firstNameInput = document.getElementById('firstName');
        this.lastNameInput = document.getElementById('lastName');
        this.phoneInput = document.getElementById('phone');
        this.emailInput = document.getElementById('email');
        this.birthdateInput = document.getElementById('birthdate');
        this.nicknameInput = document.getElementById('nicknameInput');
        this.manualPasswordInput = document.querySelector('input[name="password"]');
        this.confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');
        this.agreementCheckbox = document.getElementById('agreement');
        this.submitButton = form.querySelector('button[type="submit"]');
        
        this.emailExists = false;
        this.phoneExists = false;
        
        this.emailCheckTimer = null;
        this.phoneCheckTimer = null;
        
        console.log('FormValidator constructor:', {
            form: !!form,
            inputs: {
                firstName: !!this.firstNameInput,
                lastName: !!this.lastNameInput,
                phone: !!this.phoneInput,
                email: !!this.emailInput,
                birthdate: !!this.birthdateInput,
                nickname: !!this.nicknameInput,
                password: !!this.manualPasswordInput,
                confirmPassword: !!this.confirmPasswordInput,
                agreement: !!this.agreementCheckbox,
                submitButton: !!this.submitButton
            }
        });
    }

    init() {
        document.querySelectorAll('input[name="passwordType"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const manualDiv = document.getElementById('manualPassword');
                const isManual = radio.value === 'manual';
                manualDiv.style.display = isManual ? 'block' : 'none';
                this.manualPasswordInput.required = isManual;
                this.confirmPasswordInput.required = isManual;
                this.validateForm();
            });
        });

        [this.firstNameInput, this.lastNameInput, this.phoneInput, this.emailInput, this.birthdateInput,
         this.nicknameInput, this.manualPasswordInput, this.confirmPasswordInput, this.agreementCheckbox]
         .filter(input => input !== null)
         .forEach(input => {
            input.addEventListener('input', () => {
                this.validateField(input);
                this.validateForm();
            });
        });
        
        this.validateAllFields();
        this.validateForm();
    }

    async validateAllFields() {
        const fields = [
            this.firstNameInput, this.lastNameInput, this.phoneInput, this.emailInput, 
            this.birthdateInput, this.nicknameInput, this.manualPasswordInput, 
            this.confirmPasswordInput, this.agreementCheckbox
        ].filter(field => field !== null);
        
        for (const field of fields) {
            await this.validateField(field);
        }
    }

    async validateField(input) {
        if (!input) return;
        
        hideError(input);
        if (input === this.firstNameInput && !input.value.trim()) {
            showError(input, 'First name is required');
        } else if (input === this.lastNameInput && !input.value.trim()) {
            showError(input, 'Last name is required');
        } else if (input === this.phoneInput) {
            this.phoneExists = false;
            if (!validatePhone(input.value)) {
                showError(input, 'Invalid phone format: +375XXXXXXXXX');
            } else {
                this.debouncedCheckPhone(input.value);
            }
        } else if (input === this.emailInput) {
            this.emailExists = false;
            if (!validateEmail(input.value)) {
                showError(input, 'Invalid email format');
            } else {
                this.debouncedCheckEmail(input.value);
            }
        } else if (input === this.birthdateInput && !validateAge(input.value)) {
            showError(input, 'Must be 16+ years old');
        } else if (input === this.nicknameInput && !input.value.trim()) {
            showError(input, 'Nickname is required');
        } else if (input === this.manualPasswordInput && document.querySelector('input[name="passwordType"]:checked').value === 'manual') {
            if (!input.value) {
                showError(input, 'Password is required');
            } else if (input.value.length < 8) {
                showError(input, 'Password must be at least 8 characters');
            } else if (input.value.length > 20) {
                showError(input, 'Password must not exceed 20 characters');
            } else if (!/[A-Z]/.test(input.value)) {
                showError(input, 'Password must contain at least one uppercase letter');
            } else if (!/[a-z]/.test(input.value)) {
                showError(input, 'Password must contain at least one lowercase letter');
            } else if (!/\d/.test(input.value)) {
                showError(input, 'Password must contain at least one number');
            } else if (!/[!@#$%^&*()]/.test(input.value)) {
                showError(input, 'Password must contain at least one special character (!@#$%^&*())');
            } else {
                const passwordValidation = await validatePassword(input.value);
                if (!passwordValidation.isValid) {
                    showError(input, passwordValidation.errors[0]);
                }
            }
        } else if (input === this.confirmPasswordInput && document.querySelector('input[name="passwordType"]:checked').value === 'manual') {
            if (input.value !== this.manualPasswordInput.value) {
                showError(input, 'Passwords do not match');
            }
        } else if (input === this.agreementCheckbox && !input.checked) {
            showError(input, 'Accept agreement required');
        }
    }

    async validateForm() {
        if (!this.submitButton) return;
        
        const isManualPassword = document.querySelector('input[name="passwordType"]:checked')?.value === 'manual';
        const isPasswordValid = !isManualPassword || await this.checkPasswordValidity();

        this.submitButton.disabled = !(
            this.firstNameInput?.value?.trim() &&
            this.lastNameInput?.value?.trim() &&
            validatePhone(this.phoneInput?.value || '') &&
            !this.phoneExists &&
            validateEmail(this.emailInput?.value || '') &&
            !this.emailExists &&
            validateAge(this.birthdateInput?.value || '') &&
            this.nicknameInput?.value?.trim() &&
            this.agreementCheckbox?.checked &&
            isPasswordValid
        );
        this.submitButton.classList.toggle('active', !this.submitButton.disabled);
    }

    async checkEmailExists(email) {
        try {
            const existingUsers = await api.getUserByEmail(email);
            if (existingUsers.length > 0) {
                this.emailExists = true;
                showError(this.emailInput, 'Email already registered');
            } else {
                this.emailExists = false;
            }
            this.validateForm();
        } catch (error) {
            console.error('Error checking email:', error);
            this.emailExists = false;
        }
    }

    debouncedCheckEmail(email) {
        if (this.emailCheckTimer) {
            clearTimeout(this.emailCheckTimer);
        }
        this.emailCheckTimer = setTimeout(() => {
            this.checkEmailExists(email);
        }, 500);
    }

    debouncedCheckPhone(phone) {
        if (this.phoneCheckTimer) {
            clearTimeout(this.phoneCheckTimer);
        }
        this.phoneCheckTimer = setTimeout(() => {
            this.checkPhoneExists(phone);
        }, 500);
    }

    async checkEmailExists(email) {
        try {
            const existingUsers = await api.getUserByEmail(email);
            if (existingUsers.length > 0) {
                this.emailExists = true;
                showError(this.emailInput, 'Email already registered');
            } else {
                this.emailExists = false;
            }
            this.validateForm();
        } catch (error) {
            console.error('Error checking email:', error);
            this.emailExists = false;
        }
    }

    async checkPhoneExists(phone) {
        try {
            const allUsers = await api.getUsers();
            const existingUser = allUsers.find(user => user.phone === phone);
            if (existingUser) {
                this.phoneExists = true;
                showError(this.phoneInput, 'Phone number already exists');
            } else {
                this.phoneExists = false;
            }
            this.validateForm();
        } catch (error) {
            console.error('Error checking phone:', error);
            this.phoneExists = false;
        }
    }

    async checkPasswordValidity() {
        if (!this.manualPasswordInput?.value) return false;
        
        const passwordValidation = await validatePassword(this.manualPasswordInput.value);
        const passwordsMatch = this.manualPasswordInput.value === this.confirmPasswordInput?.value;
        
        return passwordValidation.isValid && passwordsMatch;
    }
}