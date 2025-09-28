

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

export const validatePhone = (phone) => {
    const phoneRegex = /^\+375\d{9}$/;
    return phoneRegex.test(phone.trim());
};

export const validateAge = (birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    return (
        age > 16 ||
        (age === 16 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
    );
};

export const validatePasswordAgainstTop100 = async (password) => {
    const top100Passwords = [
        '123456', 'password', '123456789', '12345678', '12345', '1234567',
        '1234567890', 'qwerty', 'abc123', '111111', '123123', 'admin',
        'letmein', 'welcome', 'monkey', '1234', 'dragon', 'password123',
        'master', 'hello', 'freedom', 'whatever', 'qazwsx', 'trustno1',
        '654321', 'jordan', 'harley', 'ranger', 'iwantu', 'jennifer',
        'hunter', 'fuck', '2000', 'test', 'tigger', 'sunshine', 'iloveyou',
        '2001', 'charlie', 'robert', 'thomas', 'hockey', 'daniel',
        'starwars', 'klaster', '112233', 'george', 'asshole', 'computer',
        'michelle', 'jessica', 'pepper', 'zaq1zaq1', 'dallas', 'joshua',
        'andrew', 'password1', 'superman', 'michael', 'football', 'shadow',
        'baseball', 'princess', 'login', 'pass', '123', 'root', 'guest',
        'user', 'demo', 'sample', 'qwerty123', 'qwertyuiop', 'asdfgh',
        'asdfghjkl', 'zxcvbn', 'zxcvbnm', '1q2w3e', '1q2w3e4r', 'qwe123',
        'qweasd', 'qweasdzxc', 'asd123', 'asd123456', 'zxc123', 'abc123456',
        'abcd1234', 'abcd123456', 'abcd1234567890', 'password1', 'password123',
        'admin123', 'root123', 'guest123', 'user123', 'test123', 'demo123',
        'sample123', 'qwertyui', 'asdfghjk', 'zxcvbnm1', '1q2w3e4r5t',
        'qweasdzxc', 'asd123456', 'zxc123456', 'abc123456789', 'abcd1234567890',
        'password12', 'admin12', 'root12', 'guest12', 'user12', 'test12',
        'password01', 'admin01', 'root01', 'guest01', 'user01', 'test01',
        'password00', 'admin00', 'root00', 'guest00', 'user00', 'test00',
        'password99', 'admin99', 'root99', 'guest99', 'user99', 'test99',
        'password88', 'admin88', 'root88', 'guest88', 'user88', 'test88',
        'password77', 'admin77', 'root77', 'guest77', 'user77', 'test77',
        'password66', 'admin66', 'root66', 'guest66', 'user66', 'test66',
        'password55', 'admin55', 'root55', 'guest55', 'user55', 'test55'
    ];

    console.log('Checking password against TOP-100:', password);
    const isInTop100 = top100Passwords.includes(password.toLowerCase());
    if (isInTop100) {
        console.warn('Password found in TOP-100 list');
    }
    return isInTop100;
};

export const validatePassword = async (password) => {
    const result = {
        isValid: true,
        errors: [],
        strength: 'weak'
    };

    if (password.length < 8) {
        result.isValid = false;
        result.errors.push('Пароль должен содержать минимум 8 символов');
    }

    if (!/[A-Z]/.test(password)) {
        result.isValid = false;
        result.errors.push('Пароль должен содержать заглавные буквы');
    }

    if (!/[a-z]/.test(password)) {
        result.isValid = false;
        result.errors.push('Пароль должен содержать строчные буквы');
    }

    if (!/\d/.test(password)) {
        result.isValid = false;
        result.errors.push('Пароль должен содержать цифры');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        result.isValid = false;
        result.errors.push('Пароль должен содержать специальные символы');
    }

    const isInTop100 = await validatePasswordAgainstTop100(password);
    if (isInTop100) {
        result.isValid = false;
        result.errors.push('Пароль слишком простой, выберите более сложный');
    }

    if (result.isValid) {
        if (password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            result.strength = 'strong';
        } else if (password.length >= 10) {
            result.strength = 'medium';
        }
    }

    return result;
}


export const generatePassword = (length = 12) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

export const generateNickname = () => {
    const adjectives = ['Cool', 'Swift', 'Bright', 'Bold', 'Wise', 'Smart', 'Fast', 'Strong', 'Brave', 'Kind'];
    const nouns = ['Fox', 'Wolf', 'Eagle', 'Bear', 'Lion', 'Tiger', 'Dragon', 'Phoenix', 'Falcon', 'Panther'];
    const randomNum = Math.floor(Math.random() * 1000);
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adjective}${noun}${randomNum}`;
};


export const showError = (element, message) => {
    const errorElement = element.parentElement.querySelector('.error-message');
    if (!errorElement) return;
    errorElement.textContent = message;
    errorElement.style.display = 'block';
};

export const hideError = (element) => {
    const errorElement = element.parentElement.querySelector('.error-message');
    if (!errorElement) return;
    errorElement.style.display = 'none';
    errorElement.textContent = '';
};


export function clearUserData() {
    console.log('Очистка пользовательских данных из localStorage');
    
    const userDataKeys = [
        'userId',
        'userRole', 
        'favorites',
        'cart',
        'justLoggedIn',
        'justRegistered',
        'redirectAfterLogin',
        'services'
    ];
    
    const systemKeys = [
        'theme',
        'language', 
        'accessibility-font-size',
        'accessibility-color-scheme',
        'accessibility-images-disabled'
    ];
    
    try {
        const systemSettings = {};
        systemKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value !== null) {
                systemSettings[key] = value;
            }
        });
        
        localStorage.clear();
        
        Object.entries(systemSettings).forEach(([key, value]) => {
            localStorage.setItem(key, value);
        });
        
        console.log('Пользовательские данные очищены, системные настройки сохранены');
    } catch (error) {
        console.error('Ошибка при очистке пользовательских данных:', error);
    }
}

export const formatPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 12 && cleaned.startsWith('375')) {
        return `+${cleaned.slice(0, 3)} (${cleaned.slice(3, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8, 10)}-${cleaned.slice(10, 12)}`;
    }
    return phone;
};

export const validateRegistrationForm = async (formData) => {
    const errors = {};
    
    if (!formData.email || !validateEmail(formData.email)) {
        errors.email = 'Введите корректный email адрес';
    }
    
    if (formData.password) {
        const passwordValidation = await validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            errors.password = passwordValidation.errors[0];
        }
    } else {
        errors.password = 'Пароль обязателен';
    }
    
    if (!formData.phone || !validatePhone(formData.phone)) {
        errors.phone = 'Введите корректный номер телефона (+375XXXXXXXXX)';
    }
    
    if (!formData.birthdate || !validateAge(formData.birthdate)) {
        errors.birthdate = 'Вам должно быть не менее 16 лет';
    }
    
    if (!formData.firstName || formData.firstName.trim().length < 2) {
        errors.firstName = 'Имя должно содержать минимум 2 символа';
    }
    
    if (!formData.lastName || formData.lastName.trim().length < 2) {
        errors.lastName = 'Фамилия должна содержать минимум 2 символа';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const validateLoginForm = (formData) => {
    const errors = {};
    
    if (!formData.email || !validateEmail(formData.email)) {
        errors.email = 'Введите корректный email адрес';
    }
    
    if (!formData.password || formData.password.length < 1) {
        errors.password = 'Введите пароль';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
