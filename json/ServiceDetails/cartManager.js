import { ServiceDataManager } from './serviceDataManager.js';
import { api } from '../Api/api.js';

export class CartManager {
    constructor(userId) {
        this.userId = userId;
        this.dataManager = new ServiceDataManager();
        this.cartItems = [];
        this.services = [];
        this.cartItemsContainer = document.getElementById('cart-items');
        this.subtotalElement = document.getElementById('subtotal');
        this.shippingElement = document.getElementById('shipping');
        this.insuranceElement = document.getElementById('insurance');
        this.totalElement = document.getElementById('total');
        this.mobileTotalElement = document.getElementById('mobile-total');

        this.init();
        this.setupEventListeners();
    }

    async init() {
        console.log('Инициализация CartManager, userId:', this.userId);
        await this.loadCart();
        this.render();
    }

    async loadCart() {
        console.log('Загрузка корзины для userId:', this.userId);
        if (!this.userId) {
            console.warn('Пользователь не авторизован');
            this.cartItems = [];
            return;
        }

        try {
            const [cartItems, services] = await Promise.all([
                api.getCart(this.userId),
                api.getServices()
            ]);
            this.services = services.map(service => ({
                ...service,
                price: parseFloat(service.price) || 0
            }));
            console.log('Загруженные услуги:', this.services);

            const language = localStorage.getItem('language') || 'ru';
            this.cartItems = cartItems
                .filter(cartItem => {
                    const service = this.services.find(s => s.id === cartItem.serviceId);
                    if (!service) {
                        console.warn(`Услуга с id ${cartItem.serviceId} не найдена`);
                        return false;
                    }
                    return true;
                })
                .map(cartItem => {
                    const service = this.services.find(s => s.id === cartItem.serviceId);
                    return {
                        cartId: cartItem.id,
                        serviceId: cartItem.serviceId,
                        quantity: cartItem.quantity,
                        name: language === 'en' ? service.name_en : service.name,
                        description: language === 'en' ? service.description_en : service.description,
                        price: service.price,
                        image: service.image
                    };
                });
            console.log('Сопоставленные элементы корзины:', this.cartItems);
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
            this.cartItems = [];
        }
    }

    setupEventListeners() {
        window.addEventListener('cartUpdated', async () => {
            console.log('Получено событие cartUpdated');
            await this.loadCart();
            this.render();
        });

        window.addEventListener('authChanged', async (event) => {
            console.log('Событие authChanged, новый userId:', event.detail.userId);
            this.userId = event.detail.userId;
            await this.loadCart();
            this.render();
        });

        window.addEventListener('languageChanged', async () => {
            console.log('Событие languageChanged, обновление корзины');
            await this.loadCart();
            this.render();
        });

        document.querySelectorAll('.checkout-btn, .checkout-btn-mobile').forEach(btn => {
            btn.addEventListener('click', async () => {
                const language = localStorage.getItem('language') || 'ru';
                if (!this.userId) {
                    alert(language === 'en' ? 'Please log in to pay.' : 'Пожалуйста, войдите, чтобы оплатить.');
                    return;
                }

                try {
                    await api.clearCart(this.userId);
                    await this.loadCart();
                    this.render();

                    const title = language === 'en' ? 'Success!' : 'Успешно!';
                    const message = language === 'en' ? 'Payment completed successfully. Thank you!' : 'Оплата прошла успешно. Спасибо за покупку!';

                    const modal = document.getElementById('payment-success-modal');
                    if (modal) {
                        modal.querySelector('#modalTitle').textContent = title;
                        modal.querySelector('#modalMessage').textContent = message;
                        window.modalManager?.openModal('payment-success-modal');
                    } else {
                        alert(message);
                    }
                } catch (e) {
                    const errorMsg = language === 'en' ? 'Payment failed. Try again later.' : 'Не удалось выполнить оплату. Попробуйте позже.';
                    alert(errorMsg);
                }
            });
        });

        if (this.cartItemsContainer) {
            this.cartItemsContainer.addEventListener('click', async (event) => {
                const target = event.target;
                const cartId = parseInt(target.dataset.cartId);

                if (target.classList.contains('increase-btn')) {
                    await this.increaseQuantity(cartId);
                } else if (target.classList.contains('decrease-btn')) {
                    await this.decreaseQuantity(cartId);
                } else if (target.classList.contains('remove-btn')) {
                    await this.removeItem(cartId);
                } else if (target.classList.contains('details-btn')) {
                    window.location.href = `../pages/ServiceDetails.html?serviceId=${target.dataset.serviceId}`;
                }
            });
        }
    }

    async addToCart(serviceId) {
        console.log(`Добавление в корзину, ID: ${serviceId}`);
        await this.dataManager.addToCart(this.userId, serviceId);
        await this.loadCart();
        this.render();
    }

    async removeItem(cartId) {
        console.log(`Удаление записи с cartId: ${cartId}`);
        await api.removeFromCart(cartId);
        await this.loadCart();
        this.render();
    }

    async increaseQuantity(cartId) {
        console.log(`Увеличение количества для cartId: ${cartId}`);
        const item = this.cartItems.find(i => i.cartId === cartId);
        if (item) {
            await api.updateCartItemQuantity(cartId, item.quantity + 1);
            await this.loadCart();
            this.render();
        }
    }

    async decreaseQuantity(cartId) {
        console.log(`Уменьшение количества для cartId: ${cartId}`);
        const item = this.cartItems.find(i => i.cartId === cartId);
        if (item && item.quantity > 1) {
            await api.updateCartItemQuantity(cartId, item.quantity - 1);
            await this.loadCart();
            this.render();
        } else if (item) {
            await this.removeItem(cartId);
        }
    }

    render() {
        const language = localStorage.getItem('language') || 'ru';
        if (!this.cartItemsContainer) {
            console.error('Контейнер cart-items не найден');
            return;
        }

        console.log('Рендер корзины, товары:', this.cartItems);

        if (this.cartItems.length === 0) {
            this.cartItemsContainer.classList.add('is-empty');
            this.cartItemsContainer.innerHTML = `
                <div class="empty-cart-message">
                    <img src="../assets/icons/yellow_box_icon.svg" alt="Empty cart" width="80">
                    <h3 data-translate-key="empty_cart"></h3>
                    <p data-translate-key="empty_cart_text"></p>
                    <a href="../pages/Catalog.html" class="yellow-overlay-button inline-block">
                        <div data-translate-key="explore_services"></div>
                        <div class="yellow-button-hover"></div>
                    </a>
                </div>
            `;
            if (this.subtotalElement) this.subtotalElement.textContent = '$0.00';
            if (this.shippingElement) this.shippingElement.textContent = '$0.00';
            if (this.insuranceElement) this.insuranceElement.textContent = '$0.00';
            if (this.totalElement) this.totalElement.textContent = '$0.00';
            if (this.mobileTotalElement) this.mobileTotalElement.textContent = '$0.00';
            return;
        }

        this.cartItemsContainer.classList.remove('is-empty');
        this.cartItemsContainer.innerHTML = this.cartItems.map(item => {
            const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
            const subtotal = price * item.quantity;
            return `
                <div class="cart-item" data-cart-id="${item.cartId}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        <div class="cart-item-price">$${price.toFixed(2)}</div>
                        <div class="cart-item-quantity">
                            <button class="decrease-btn" data-cart-id="${item.cartId}">-</button>
                            <span>${item.quantity}</span>
                            <button class="increase-btn" data-cart-id="${item.cartId}">+</button>
                        </div>
                        <div class="cart-item-subtotal">$${subtotal.toFixed(2)}</div>
                        <button class="remove-btn" data-cart-id="${item.cartId}" data-translate-key="remove_btn">${language === 'en' ? 'Remove' : 'Удалить'}</button>
                        <button class="details-btn" data-service-id="${item.serviceId}&from=basket" data-translate-key="view_details">${language === 'en' ? 'View Details' : 'Посмотреть детали'}</button>
                    </div>
                </div>
            `;
        }).join('');

        const subtotal = this.cartItems.reduce((sum, item) => {
            const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
            return sum + price * item.quantity;
        }, 0);
        const shipping = this.cartItems.length > 0 ? 10 : 0;
        const insurance = this.cartItems.length > 0 ? 5 : 0;
        const total = subtotal + shipping + insurance;

        if (this.subtotalElement) this.subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        if (this.shippingElement) this.shippingElement.textContent = `$${shipping.toFixed(2)}`;
        if (this.insuranceElement) this.insuranceElement.textContent = `$${insurance.toFixed(2)}`;
        if (this.totalElement) this.totalElement.textContent = `$${total.toFixed(2)}`;
        if (this.mobileTotalElement) this.mobileTotalElement.textContent = `${total.toFixed(2)}`;
    }
}