import { api } from '../Api/api.js';
import { ModalHandler } from '../Registration/modalHandler.js';
import { validateEmail, validatePhone, validateAge, showError, hideError } from '../Utils/utils.js';

export class AdminPanel {
    constructor() {
        this.modalHandler = new ModalHandler('#customModal');
        this.usersTableBody = document.querySelector('#users-table tbody');
        this.servicesTableBody = document.querySelector('#services-table tbody');
        this.addUserBtn = document.getElementById('add-user-btn');
        this.addServiceBtn = document.getElementById('add-service-btn');
        this.userSearch = document.getElementById('user-search');
        this.serviceSearch = document.getElementById('service-search');
        this.userSort = document.getElementById('user-sort');
        this.serviceSort = document.getElementById('service-sort');
        this.tabs = document.querySelectorAll('.admin-nav-item');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.allUsers = [];
        this.allServices = [];
    }

    async init() {
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'admin') {
            window.location.href = '../pages/HomePage.html';
            return;
        }
        try {
            this.setupEventListeners();
            await Promise.all([this.loadUsers(), this.loadServices()]);
            this.switchTab('users');
        } catch (error) {
            this.modalHandler.showModal(`Ошибка инициализации: ${error.message}`, 'error');
        }
    }

    setupEventListeners() {
        this.addUserBtn.addEventListener('click', () => this.showAddUserModal());
        this.addServiceBtn.addEventListener('click', () => this.showAddServiceModal());
        this.userSearch.addEventListener('input', () => this.filterUsers());
        this.serviceSearch.addEventListener('input', () => this.filterServices());
        this.userSort.addEventListener('change', () => this.sortUsers());
        this.serviceSort.addEventListener('change', () => this.sortServices());
        this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(tab.dataset.tab);
            });
        });
    }

    switchTab(tabId) {
        this.tabs.forEach(tab => tab.classList.remove('active'));
        this.tabContents.forEach(content => content.style.display = 'none');
        const selectedTab = document.querySelector(`[data-tab="${tabId}"]`);
        const selectedContent = document.getElementById(`${tabId}-tab`);
        if (selectedTab && selectedContent) {
            selectedTab.classList.add('active');
            selectedContent.style.display = 'block';
        }
    }

    async loadUsers() {
        try {
            this.allUsers = await api.getUsers();
            this.renderUsersTable(this.allUsers);
        } catch (error) {
            this.modalHandler.showModal(`Ошибка загрузки пользователей: ${error.message}`, 'error');
        }
    }

    async loadServices() {
        try {
            this.allServices = await api.getServices();
            this.renderServicesTable(this.allServices);
        } catch (error) {
            this.modalHandler.showModal(`Ошибка загрузки услуг: ${error.message}`, 'error');
        }
    }

    renderTable(tableBody, data, { type, colSpan, method }) {
        const language = localStorage.getItem('language') || 'ru';
        tableBody.innerHTML = data.length === 0
            ? `<tr><td colspan="${colSpan.length + 1}" data-translate-key="no_data">${language === 'en' ? 'No data' : 'Нет данных'}</td></tr>`
            : data.map(item => `
                <tr data-id="${item.id}">
                    ${colSpan.map(col => `<td>${col.format ? col.format(item[col.field]) : (item[col.field + (language === 'en' ? '_en' : '')] || item[col.field] || '')}</td>`).join('')}
                    <td>
                        <button class="btn btn-primary edit-${type}" data-id="${item.id}" data-translate-key="edit">Изменить</button>
                        <button class="btn btn-danger delete-${type}" data-id="${item.id}" data-translate-key="delete">Удалить</button>
                    </td>
                </tr>
            `).join('');
        this[method]();
    }

    renderUsersTable(users) {
        this.renderTable(this.usersTableBody, users, {
            type: 'user',
            colSpan: [
                { field: 'id' }, { field: 'email' }, { field: 'firstName' }, { field: 'lastName' },
                { field: 'middleName' }, { field: 'phone' }, { field: 'birthdate' }, { field: 'nickname' }, { field: 'role' }
            ],
            method: 'setupUserTableEventDelegation'
        });
    }

    renderServicesTable(services) {
        this.renderTable(this.servicesTableBody, services, {
            type: 'service',
            colSpan: [
                { field: 'id' },
                { field: 'name' },
                { field: 'price', format: price => `$${parseFloat(price).toFixed(2)}` },
                { field: 'description' }
            ],
            method: 'setupServiceTableEventDelegation'
        });
    }

    setupUserTableEventDelegation() {
        this.usersTableBody.removeEventListener('click', this.handleUserTableClick);
        this.handleUserTableClick = async (e) => {
            const target = e.target;
            const userId = target.dataset.id;
            if (target.classList.contains('edit-user')) {
                try {
                    const user = await api.getUserById(userId);
                    this.showEditUserModal(user);
                } catch (error) {
                    this.modalHandler.showModal(`Ошибка: ${error.message}`, 'error');
                }
            } else if (target.classList.contains('delete-user')) {
                const language = localStorage.getItem('language') || 'ru';
                if (confirm(language === 'en' ? 'Are you sure you want to delete this user?' : 'Вы уверены, что хотите удалить этого пользователя?')) {
                    try {
                        await api.deleteUser(userId);
                        this.modalHandler.showModal(language === 'en' ? 'User successfully deleted' : 'Пользователь успешно удален', 'success');
                        await this.loadUsers();
                    } catch (error) {
                        this.modalHandler.showModal(`Ошибка: ${error.message}`, 'error');
                    }
                }
            }
        };
        this.usersTableBody.addEventListener('click', this.handleUserTableClick);
    }

    setupServiceTableEventDelegation() {
        this.servicesTableBody.removeEventListener('click', this.handleServiceTableClick);
        this.handleServiceTableClick = async (e) => {
            const target = e.target;
            const serviceId = target.dataset.id;
            if (target.classList.contains('edit-service')) {
                try {
                    const service = await api.getServiceById(serviceId);
                    this.showEditServiceModal(service);
                } catch (error) {
                    this.modalHandler.showModal(`Ошибка: ${error.message}`, 'error');
                }
            } else if (target.classList.contains('delete-service')) {
                const language = localStorage.getItem('language') || 'ru';
                if (confirm(language === 'en' ? 'Are you sure you want to delete this service?' : 'Вы уверены, что хотите удалить эту услугу?')) {
                    try {
                        await api.deleteService(serviceId);
                        this.modalHandler.showModal(language === 'en' ? 'Service successfully deleted' : 'Услуга успешно удалена', 'success');
                        await this.loadServices();
                    } catch (error) {
                        this.modalHandler.showModal(`Ошибка: ${error.message}`, 'error');
                    }
                }
            }
        };
        this.servicesTableBody.addEventListener('click', this.handleServiceTableClick);
    }

    createFormHTML({ title, formId, fields, isEdit = false, data = {} }) {
        const language = localStorage.getItem('language') || 'ru';
        return `
            <h3>${title}</h3>
            <form class="modal-form" id="${formId}" ${isEdit ? `data-id="${data.id}"` : ''}>
                ${fields.map(field => `
                    <div class="form-group">
                        <label for="${field.name}">${field.label}</label>
                        ${field.type === 'select' ? `
                            <select id="${field.name}" name="${field.name}">
                                ${field.options.map(opt => `
                                    <option value="${opt.value}" ${data[field.name] === opt.value ? 'selected' : ''}>
                                        ${opt.label}
                                    </option>
                                `).join('')}
                            </select>
                        ` : `
                            <${field.type === 'textarea' ? 'textarea' : 'input'}
                                ${field.type !== 'textarea' ? `type="${field.name === 'password' ? 'text' : field.type}"` : ''}
                                id="${field.name}"
                                name="${field.name}"
                                ${field.required ? 'required' : ''}
                                ${field.type !== 'textarea' && data[field.name] ? `value="${data[field.name]}"` : ''}>
                                ${field.type === 'textarea' ? (data[field.name] || '') : ''}
                            ${field.type === 'textarea' ? '</textarea>' : ''}
                        `}
                        <span class="error-message"></span>
                    </div>
                `).join('')}
                <button type="submit" class="yellow-overlay-button" data-translate-key="save">${language === 'en' ? 'Save' : 'Сохранить'}</button>
            </form>
        `;
    }

    showAddUserModal() {
        const language = localStorage.getItem('language') || 'ru';
        const modalContent = this.createFormHTML({
            title: language === 'en' ? 'Add User' : 'Добавить пользователя',
            formId: 'add-user-form',
            fields: [
                { name: 'email', label: language === 'en' ? 'Email' : 'Email', type: 'email', required: true },
                { name: 'password', label: language === 'en' ? 'Password' : 'Пароль', type: 'password', required: true },
                { name: 'firstName', label: language === 'en' ? 'First Name' : 'Имя', type: 'text', required: true },
                { name: 'lastName', label: language === 'en' ? 'Last Name' : 'Фамилия', type: 'text', required: true },
                { name: 'middleName', label: language === 'en' ? 'Middle Name' : 'Отчество', type: 'text' },
                { name: 'phone', label: language === 'en' ? 'Phone' : 'Телефон', type: 'tel', required: true },
                { name: 'birthdate', label: language === 'en' ? 'Birthdate' : 'Дата рождения', type: 'date', required: true },
                { name: 'nickname', label: language === 'en' ? 'Nickname' : 'Никнейм', type: 'text', required: true },
                {
                    name: 'role',
                    label: language === 'en' ? 'Role' : 'Роль',
                    type: 'select',
                    options: [
                        { value: 'user', label: language === 'en' ? 'User' : 'Пользователь' },
                        { value: 'admin', label: language === 'en' ? 'Admin' : 'Администратор' }
                    ]
                }
            ]
        });
        this.modalHandler.showModal(modalContent, 'form');
        requestAnimationFrame(() => this.setupFormValidation('add-user-form', [
            { name: 'email', validate: validateEmail, error: language === 'en' ? 'Invalid email format' : 'Неверный формат email' },
            { name: 'password', validate: value => value.length >= 8, error: language === 'en' ? 'Password must be at least 8 characters' : 'Пароль должен быть минимум 8 символов' },
            { name: 'firstName', validate: value => value.trim().length > 0, error: language === 'en' ? 'First name is required' : 'Имя обязательно' },
            { name: 'lastName', validate: value => value.trim().length > 0, error: language === 'en' ? 'Last name is required' : 'Фамилия обязательна' },
            { name: 'middleName', validate: () => true, error: '' },
            { name: 'phone', validate: validatePhone, error: language === 'en' ? 'Invalid phone format' : 'Неверный формат телефона' },
            { name: 'birthdate', validate: validateAge, error: language === 'en' ? 'Age must be 16+' : 'Возраст должен быть 16+' },
            { name: 'nickname', validate: value => value.trim().length > 0, error: language === 'en' ? 'Nickname is required' : 'Никнейм обязателен' }
        ], api.createUser, language === 'en' ? 'User successfully created' : 'Пользователь успешно создан'));
    }

    showEditUserModal(user) {
        const language = localStorage.getItem('language') || 'ru';
        const modalContent = this.createFormHTML({
            title: language === 'en' ? `Edit User (ID: ${user.id})` : `Изменить пользователя (ID: ${user.id})`,
            formId: 'edit-user-form',
            isEdit: true,
            data: user,
            fields: [
                { name: 'email', label: language === 'en' ? 'Email' : 'Email', type: 'email', required: true },
                { name: 'password', label: language === 'en' ? 'Password' : 'Пароль', type: 'password', required: false },
                { name: 'firstName', label: language === 'en' ? 'First Name' : 'Имя', type: 'text', required: true },
                { name: 'lastName', label: language === 'en' ? 'Last Name' : 'Фамилия', type: 'text', required: true },
                { name: 'middleName', label: language === 'en' ? 'Middle Name' : 'Отчество', type: 'text' },
                { name: 'phone', label: language === 'en' ? 'Phone' : 'Телефон', type: 'tel', required: true },
                { name: 'birthdate', label: language === 'en' ? 'Birthdate' : 'Дата рождения', type: 'date', required: true },
                { name: 'nickname', label: language === 'en' ? 'Nickname' : 'Никнейм', type: 'text', required: true },
                {
                    name: 'role',
                    label: language === 'en' ? 'Role' : 'Роль',
                    type: 'select',
                    options: [
                        { value: 'user', label: language === 'en' ? 'User' : 'Пользователь' },
                        { value: 'admin', label: language === 'en' ? 'Admin' : 'Администратор' }
                    ]
                }
            ]
        });
        this.modalHandler.showModal(modalContent, 'form');
        requestAnimationFrame(() => this.setupFormValidation('edit-user-form', [
            { name: 'email', validate: validateEmail, error: language === 'en' ? 'Invalid email format' : 'Неверный формат email' },
            { name: 'password', validate: value => !value || value.length >= 8, error: language === 'en' ? 'Password must be at least 8 characters' : 'Пароль должен быть минимум 8 символов' },
            { name: 'firstName', validate: value => value.trim().length > 0, error: language === 'en' ? 'First name is required' : 'Имя обязательно' },
            { name: 'lastName', validate: value => value.trim().length > 0, error: language === 'en' ? 'Last name is required' : 'Фамилия обязательна' },
            { name: 'middleName', validate: () => true, error: '' },
            { name: 'phone', validate: validatePhone, error: language === 'en' ? 'Invalid phone format' : 'Неверный формат телефона' },
            { name: 'birthdate', validate: validateAge, error: language === 'en' ? 'Age must be 16+' : 'Возраст должен быть 16+' },
            { name: 'nickname', validate: value => value.trim().length > 0, error: language === 'en' ? 'Nickname is required' : 'Никнейм обязателен' }
        ], api.updateUser, language === 'en' ? 'User successfully updated' : 'Пользователь успешно обновлен', true));
    }

    showAddServiceModal() {
        const language = localStorage.getItem('language') || 'ru';
        const modalContent = this.createFormHTML({
            title: language === 'en' ? 'Add Service' : 'Добавить услугу',
            formId: 'add-service-form',
            fields: [
                {
                    name: 'category',
                    label: language === 'en' ? 'Category' : 'Категория',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'transport', label: language === 'en' ? 'Transport' : 'Транспорт' },
                        { value: 'logistics', label: language === 'en' ? 'Logistics' : 'Логистика' },
                        { value: 'equipment', label: language === 'en' ? 'Equipment' : 'Оборудование' },
                        { value: 'technology', label: language === 'en' ? 'Technology' : 'Технологии' },
                        { value: 'safety', label: language === 'en' ? 'Safety' : 'Безопасность' },
                        { value: 'specialized', label: language === 'en' ? 'Specialized' : 'Специализированные' },
                        { value: 'additional', label: language === 'en' ? 'Additional' : 'Дополнительные' }
                    ]
                },
                { name: 'name', label: language === 'en' ? 'Name (RU)' : 'Название (RU)', type: 'text', required: true },
                { name: 'name_en', label: language === 'en' ? 'Name (EN)' : 'Название (EN)', type: 'text', required: true },
                { name: 'description', label: language === 'en' ? 'Description (RU)' : 'Описание (RU)', type: 'textarea', required: true },
                { name: 'description_en', label: language === 'en' ? 'Description (EN)' : 'Описание (EN)', type: 'textarea', required: true },
                { name: 'price', label: language === 'en' ? 'Price' : 'Цена', type: 'number', required: true },
                { name: 'rating', label: language === 'en' ? 'Rating' : 'Рейтинг', type: 'number', required: true },
                { name: 'image', label: language === 'en' ? 'Image Path' : 'Путь к изображению', type: 'text', required: true },
                { name: 'deliveryTime', label: language === 'en' ? 'Delivery Time (RU)' : 'Время доставки (RU)', type: 'text', required: true },
                { name: 'deliveryTime_en', label: language === 'en' ? 'Delivery Time (EN)' : 'Время доставки (EN)', type: 'text', required: true },
                { name: 'maxWeight', label: language === 'en' ? 'Max Weight (RU)' : 'Макс. вес (RU)', type: 'text', required: true },
                { name: 'maxWeight_en', label: language === 'en' ? 'Max Weight (EN)' : 'Макс. вес (EN)', type: 'text', required: true },
                { name: 'coverage', label: language === 'en' ? 'Coverage (RU)' : 'Зона покрытия (RU)', type: 'text', required: true },
                { name: 'coverage_en', label: language === 'en' ? 'Coverage (EN)' : 'Зона покрытия (EN)', type: 'text', required: true },
                { name: 'extendedDescription', label: language === 'en' ? 'Extended Description (RU)' : 'Расширенное описание (RU)', type: 'textarea', required: true },
                { name: 'extendedDescription_en', label: language === 'en' ? 'Extended Description (EN)' : 'Расширенное описание (EN)', type: 'textarea', required: true }
            ]
        });
        this.modalHandler.showModal(modalContent, 'form');
        requestAnimationFrame(() => this.setupFormValidation('add-service-form', [
            { name: 'category', validate: value => value.trim().length > 0, error: language === 'en' ? 'Category is required' : 'Категория обязательна' },
            { name: 'name', validate: value => value.trim().length > 0, error: language === 'en' ? 'Name (RU) is required' : 'Название (RU) обязательно' },
            { name: 'name_en', validate: value => value.trim().length > 0, error: language === 'en' ? 'Name (EN) is required' : 'Название (EN) обязательно' },
            { name: 'description', validate: value => value.trim().length > 0, error: language === 'en' ? 'Description (RU) is required' : 'Описание (RU) обязательно' },
            { name: 'description_en', validate: value => value.trim().length > 0, error: language === 'en' ? 'Description (EN) is required' : 'Описание (EN) обязательно' },
            { name: 'price', validate: value => parseFloat(value) > 0, error: language === 'en' ? 'Price must be greater than 0' : 'Цена должна быть больше 0' },
            { name: 'rating', validate: value => parseFloat(value) >= 0 && parseFloat(value) <= 5, error: language === 'en' ? 'Rating must be between 0 and 5' : 'Рейтинг должен быть от 0 до 5' },
            { name: 'image', validate: value => /^\.\.\/assets\/.*\.(jpg|jpeg|png|svg)$/.test(value), error: language === 'en' ? 'Invalid image path (jpg, jpeg, png, svg)' : 'Неверный путь изображения (jpg, jpeg, png, svg)' },
            { name: 'deliveryTime', validate: value => value.trim().length > 0, error: language === 'en' ? 'Delivery Time (RU) is required' : 'Время доставки (RU) обязательно' },
            { name: 'deliveryTime_en', validate: value => value.trim().length > 0, error: language === 'en' ? 'Delivery Time (EN) is required' : 'Время доставки (EN) обязательно' },
            { name: 'maxWeight', validate: value => value.trim().length > 0, error: language === 'en' ? 'Max Weight (RU) is required' : 'Макс. вес (RU) обязателен' },
            { name: 'maxWeight_en', validate: value => value.trim().length > 0, error: language === 'en' ? 'Max Weight (EN) is required' : 'Макс. вес (EN) обязателен' },
            { name: 'coverage', validate: value => value.trim().length > 0, error: language === 'en' ? 'Coverage (RU) is required' : 'Зона покрытия (RU) обязательна' },
            { name: 'coverage_en', validate: value => value.trim().length > 0, error: language === 'en' ? 'Coverage (EN) is required' : 'Зона покрытия (EN) обязательна' },
            { name: 'extendedDescription', validate: value => value.trim().length > 0, error: language === 'en' ? 'Extended Description (RU) is required' : 'Расширенное описание (RU) обязательно' },
            { name: 'extendedDescription_en', validate: value => value.trim().length > 0, error: language === 'en' ? 'Extended Description (EN) is required' : 'Расширенное описание (EN) обязательно' }
        ], (data) => api.createService({
            ...data,
            attributes: {
                deliveryTime: data.deliveryTime,
                maxWeight: data.maxWeight,
                coverage: data.coverage
            },
            attributes_en: {
                deliveryTime: data.deliveryTime_en,
                maxWeight: data.maxWeight_en,
                coverage: data.coverage_en
            }
        }), language === 'en' ? 'Service successfully created' : 'Услуга успешно создана'));
    }

    showEditServiceModal(service) {
        const language = localStorage.getItem('language') || 'ru';
        const modalContent = this.createFormHTML({
            title: language === 'en' ? `Edit Service (ID: ${service.id})` : `Изменить услугу (ID: ${service.id})`,
            formId: 'edit-service-form',
            isEdit: true,
            data: {
                ...service,
                deliveryTime: service.attributes?.deliveryTime || '',
                deliveryTime_en: service.attributes_en?.deliveryTime || '',
                maxWeight: service.attributes?.maxWeight || '',
                maxWeight_en: service.attributes_en?.maxWeight || '',
                coverage: service.attributes?.coverage || '',
                coverage_en: service.attributes_en?.coverage || ''
            },
            fields: [
                {
                    name: 'category',
                    label: language === 'en' ? 'Category' : 'Категория',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'transport', label: language === 'en' ? 'Transport' : 'Транспорт' },
                        { value: 'logistics', label: language === 'en' ? 'Logistics' : 'Логистика' },
                        { value: 'equipment', label: language === 'en' ? 'Equipment' : 'Оборудование' },
                        { value: 'technology', label: language === 'en' ? 'Technology' : 'Технологии' },
                        { value: 'safety', label: language === 'en' ? 'Safety' : 'Безопасность' },
                        { value: 'specialized', label: language === 'en' ? 'Specialized' : 'Специализированные' },
                        { value: 'additional', label: language === 'en' ? 'Additional' : 'Дополнительные' }
                    ]
                },
                { name: 'name', label: language === 'en' ? 'Name (RU)' : 'Название (RU)', type: 'text', required: true },
                { name: 'name_en', label: language === 'en' ? 'Name (EN)' : 'Название (EN)', type: 'text', required: true },
                { name: 'description', label: language === 'en' ? 'Description (RU)' : 'Описание (RU)', type: 'textarea', required: true },
                { name: 'description_en', label: language === 'en' ? 'Description (EN)' : 'Описание (EN)', type: 'textarea', required: true },
                { name: 'price', label: language === 'en' ? 'Price' : 'Цена', type: 'number', required: true },
                { name: 'rating', label: language === 'en' ? 'Rating' : 'Рейтинг', type: 'number', required: true },
                { name: 'image', label: language === 'en' ? 'Image Path' : 'Путь к изображению', type: 'text', required: true },
                { name: 'deliveryTime', label: language === 'en' ? 'Delivery Time (RU)' : 'Время доставки (RU)', type: 'text', required: true },
                { name: 'deliveryTime_en', label: language === 'en' ? 'Delivery Time (EN)' : 'Время доставки (EN)', type: 'text', required: true },
                { name: 'maxWeight', label: language === 'en' ? 'Max Weight (RU)' : 'Макс. вес (RU)', type: 'text', required: true },
                { name: 'maxWeight_en', label: language === 'en' ? 'Max Weight (EN)' : 'Макс. вес (EN)', type: 'text', required: true },
                { name: 'coverage', label: language === 'en' ? 'Coverage (RU)' : 'Зона покрытия (RU)', type: 'text', required: true },
                { name: 'coverage_en', label: language === 'en' ? 'Coverage (EN)' : 'Зона покрытия (EN)', type: 'text', required: true },
                { name: 'extendedDescription', label: language === 'en' ? 'Extended Description (RU)' : 'Расширенное описание (RU)', type: 'textarea', required: true },
                { name: 'extendedDescription_en', label: language === 'en' ? 'Extended Description (EN)' : 'Расширенное описание (EN)', type: 'textarea', required: true }
            ]
        });
        this.modalHandler.showModal(modalContent, 'form');
        requestAnimationFrame(() => this.setupFormValidation('edit-service-form', [
            { name: 'category', validate: value => value.trim().length > 0, error: language === 'en' ? 'Category is required' : 'Категория обязательна' },
            { name: 'name', validate: value => value.trim().length > 0, error: language === 'en' ? 'Name (RU) is required' : 'Название (RU) обязательно' },
            { name: 'name_en', validate: value => value.trim().length > 0, error: language === 'en' ? 'Name (EN) is required' : 'Название (EN) обязательно' },
            { name: 'description', validate: value => value.trim().length > 0, error: language === 'en' ? 'Description (RU) is required' : 'Описание (RU) обязательно' },
            { name: 'description_en', validate: value => value.trim().length > 0, error: language === 'en' ? 'Description (EN) is required' : 'Описание (EN) обязательно' },
            { name: 'price', validate: value => parseFloat(value) > 0, error: language === 'en' ? 'Price must be greater than 0' : 'Цена должна быть больше 0' },
            { name: 'rating', validate: value => parseFloat(value) >= 0 && parseFloat(value) <= 5, error: language === 'en' ? 'Rating must be between 0 and 5' : 'Рейтинг должен быть от 0 до 5' },
            { name: 'image', validate: value => /^\.\.\/assets\/.*\.(jpg|jpeg|png|svg)$/.test(value), error: language === 'en' ? 'Invalid image path (jpg, jpeg, png, svg)' : 'Неверный путь изображения (jpg, jpeg, png, svg)' },
            { name: 'deliveryTime', validate: value => value.trim().length > 0, error: language === 'en' ? 'Delivery Time (RU) is required' : 'Время доставки (RU) обязательно' },
            { name: 'deliveryTime_en', validate: value => value.trim().length > 0, error: language === 'en' ? 'Delivery Time (EN) is required' : 'Время доставки (EN) обязательно' },
            { name: 'maxWeight', validate: value => value.trim().length > 0, error: language === 'en' ? 'Max Weight (RU) is required' : 'Макс. вес (RU) обязателен' },
            { name: 'maxWeight_en', validate: value => value.trim().length > 0, error: language === 'en' ? 'Max Weight (EN) is required' : 'Макс. вес (EN) обязателен' },
            { name: 'coverage', validate: value => value.trim().length > 0, error: language === 'en' ? 'Coverage (RU) is required' : 'Зона покрытия (RU) обязательна' },
            { name: 'coverage_en', validate: value => value.trim().length > 0, error: language === 'en' ? 'Coverage (EN) is required' : 'Зона покрытия (EN) обязательна' },
            { name: 'extendedDescription', validate: value => value.trim().length > 0, error: language === 'en' ? 'Extended Description (RU) is required' : 'Расширенное описание (RU) обязательно' },
            { name: 'extendedDescription_en', validate: value => value.trim().length > 0, error: language === 'en' ? 'Extended Description (EN) is required' : 'Расширенное описание (EN) обязательно' }
        ], (data) => api.updateService(service.id, {
            ...data,
            attributes: {
                deliveryTime: data.deliveryTime,
                maxWeight: data.maxWeight,
                coverage: data.coverage
            },
            attributes_en: {
                deliveryTime: data.deliveryTime_en,
                maxWeight: data.maxWeight_en,
                coverage: data.coverage_en
            }
        }), language === 'en' ? 'Service successfully updated' : 'Услуга успешно обновлена', true));
    }

    setupFormValidation(formId, fields, apiMethod, successMessage, isEdit = false) {
        const form = document.getElementById(formId);
        if (!form) {
            this.modalHandler.showModal(`Ошибка: форма ${formId} не найдена`, 'error');
            return;
        }

        fields.forEach(field => {
            const input = form.querySelector(`[name="${field.name}"]`);
            if (input) {
                input.addEventListener('input', () => {
                    hideError(input);
                    if (!field.validate(input.value)) showError(input, field.error);
                });
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {};
            let isValid = true;

            fields.forEach(field => {
                const input = form.querySelector(`[name="${field.name}"]`);
                if (input) {
                    if (!field.validate(input.value)) {
                        showError(input, field.error);
                        isValid = false;
                    }
                    formData[field.name] = input.value;
                }
            });

            if (formId.includes('user')) {
                formData.role = form.querySelector('[name="role"]')?.value;
                formData.cart = formData.cart || [];
                formData.favorites = formData.favorites || [];
            }

            if (!isValid) {
                const language = localStorage.getItem('language') || 'ru';
                this.modalHandler.showModal(language === 'en' ? 'Please correct the errors in the form' : 'Исправьте ошибки в данных', 'error');
                return;
            }

            try {
                if (formId.includes('user')) {
                    const allUsers = await api.getUsers();
                    const emailInput = form.querySelector('[name="email"]');
                    const phoneInput = form.querySelector('[name="phone"]');
                    const language = localStorage.getItem('language') || 'ru';
                    if (isEdit) {
                        const userId = parseInt(form.dataset.id);
                        if (allUsers.some(user => user.email === formData.email && user.id !== userId)) {
                            showError(emailInput, language === 'en' ? 'User with this email already exists' : 'Пользователь с таким email уже существует');
                            return;
                        }
                        if (allUsers.some(user => user.phone === formData.phone && user.id !== userId)) {
                            showError(phoneInput, language === 'en' ? 'User with this phone number already exists' : 'Пользователь с таким номером телефона уже существует');
                            return;
                        }
                    } else {
                        if (allUsers.some(user => user.email === formData.email)) {
                            showError(emailInput, language === 'en' ? 'User with this email already exists' : 'Пользователь с таким email уже существует');
                            return;
                        }
                        if (allUsers.some(user => user.phone === formData.phone)) {
                            showError(phoneInput, language === 'en' ? 'User with this phone number already exists' : 'Пользователь с таким номером телефона уже существует');
                            return;
                        }
                    }
                }

                const method = isEdit && formId.includes('user') ? apiMethod.bind(api, parseInt(form.dataset.id), formData) : apiMethod.bind(api, formData);
                await method();
                this.modalHandler.showModal(successMessage, 'success');
                await (formId.includes('user') ? this.loadUsers() : this.loadServices());
                this.modalHandler.hideModal();
            } catch (error) {
                this.modalHandler.showModal(`Ошибка: ${error.message}`, 'error');
            }
        });
    }

    filterUsers() {
        const query = this.userSearch.value.toLowerCase();
        const filteredUsers = this.allUsers.filter(user =>
            Object.values(user).some(value =>
                String(value).toLowerCase().includes(query)
            )
        );
        this.renderUsersTable(filteredUsers);
    }

    filterServices() {
        const query = this.serviceSearch.value.toLowerCase();
        const filteredServices = this.allServices.filter(service =>
            Object.values(service).some(value =>
                String(value).toLowerCase().includes(query)
            )
        );
        this.renderServicesTable(filteredServices);
    }

    sortTable(tableBody, data, sortBy, type) {
        const rows = [...data];
        rows.sort((a, b) => {
            const fields = {
                user: {
                    id: { field: 'id', parse: parseInt },
                    email: { field: 'email', parse: null },
                    firstName: { field: 'firstName', parse: null }
                },
                service: {
                    id: { field: 'id', parse: parseInt },
                    name: { field: 'name', parse: null },
                    price: { field: 'price', parse: parseFloat }
                }
            };
            const { field, parse } = fields[type][sortBy] || { field: 'id', parse: parseInt };
            const aValue = parse ? parse(a[field]) || 0 : a[field];
            const bValue = parse ? parse(b[field]) || 0 : b[field];
            return parse ? aValue - bValue : aValue.localeCompare(bValue);
        });
        return rows;
    }

    sortUsers() {
        const sortedUsers = this.sortTable(this.usersTableBody, this.allUsers, this.userSort.value, 'user');
        this.renderUsersTable(sortedUsers);
    }

    sortServices() {
        const sortedServices = this.sortTable(this.servicesTableBody, this.allServices, this.serviceSort.value, 'service');
        this.renderServicesTable(sortedServices);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const adminPanel = new AdminPanel();
    await adminPanel.init();
});
