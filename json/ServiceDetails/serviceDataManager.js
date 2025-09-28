import { api } from '../Api/api.js';

export class ServiceDataManager {
    constructor() {
        this.api = api;
    }

    async getFavorites(userId) {
        try {
            if (!userId) return [];
            const favorites = await this.api.getFavorites(userId);
            return favorites;
        } catch (error) {
            console.error('Ошибка получения избранного:', error);
            return [];
        }
    }

    async fetchServiceDetails(serviceId) {
        const language = localStorage.getItem('language') || 'ru';
        try {
            const service = await this.api.getServiceById(serviceId);
            if (!service) {
                throw new Error(`Услуга с ID ${serviceId} не найдена`);
            }
            return {
                ...service,
                price: parseFloat(service.price) || 0,
                rating: parseFloat(service.rating) || 0,
                name: language === 'en' ? service.name_en : service.name,
                description: language === 'en' ? service.description_en : service.description,
                extendedDescription: language === 'en' ? service.extendedDescription_en : service.extendedDescription,
                attributes: language === 'en' ? service.attributes_en : service.attributes
            };
        } catch (error) {
            console.error(`Ошибка загрузки услуги ${serviceId}:`, error);
            return null;
        }
    }

    async addToCart(userId, serviceId) {
        if (!userId) {
            throw new Error('Пользователь не авторизован');
        }
        try {
            const cartItems = await this.api.getCart(userId);
            const existingItem = cartItems.find(item => item.serviceId === serviceId);

            if (existingItem) {
                await this.api.updateCartItemQuantity(existingItem.id, existingItem.quantity + 1);
            } else {
                await this.api.addToCart(userId, serviceId);
            }
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        } catch (error) {
            console.error('Ошибка добавления в корзину:', error);
            throw error;
        }
    }

    async removeFromFavorites(userId, serviceId) {
        if (!userId) {
            throw new Error('Пользователь не авторизован');
        }
        try {
            await this.api.removeFromFavorites(userId, serviceId);
            window.dispatchEvent(new CustomEvent('favoritesUpdated'));
        } catch (error) {
            console.error('Ошибка удаления из избранного:', error);
            throw error;
        }
    }

    async toggleFavorite(userId, serviceId) {
        if (!userId) {
            throw new Error('Пользователь не авторизован');
        }
        try {
            const favorites = await this.getFavorites(userId);
            if (favorites.includes(serviceId)) {
                await this.removeFromFavorites(userId, serviceId);
            } else {
                await this.api.addToFavorites(userId, serviceId);
                window.dispatchEvent(new CustomEvent('favoritesUpdated'));
            }
        } catch (error) {
            console.error('Ошибка переключения избранного:', error);
            throw error;
        }
    }

    async syncWithServer(userId) {
        if (!userId) {
            console.warn('syncWithServer: userId не предоставлен');
            return;
        }
        try {
            const favorites = await this.getFavorites(userId);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            
            const cart = await this.api.getCart(userId);
            localStorage.setItem('cart', JSON.stringify(cart));
            
            console.log('Данные пользователя синхронизированы с сервером');
        } catch (error) {
            console.error('Ошибка синхронизации с сервером:', error);
        }
    }
}