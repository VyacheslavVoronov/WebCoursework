import { ServiceDataManager } from './serviceDataManager.js';

export class FavoritesManager {
    constructor(userId) {
        this.userId = userId;
        this.dataManager = new ServiceDataManager();
    }

    async getFavorites() {
        return await this.dataManager.getFavorites(this.userId);
    }

    async toggleFavorite(itemId, button) {
        await this.dataManager.toggleFavorite(this.userId, itemId, button);
        const isFavorite = (await this.getFavorites()).includes(itemId);
        alert(isFavorite ? 'Товар добавлен в избранное!' : 'Товар удалён из избранного!');
    }

    async removeFromFavorites(itemId) {
        await this.dataManager.removeFromFavorites(this.userId, itemId);
    }
}