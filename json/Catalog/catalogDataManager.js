import { api } from '../Api/api.js';

export class CatalogDataManager {
    constructor() {
        this.items = [];
        this.setupLanguageListener();
    }

    setupLanguageListener() {
        window.addEventListener('languageChanged', () => {
            this.fetchItems();
        });
    }

    async fetchItems() {
        try {
            const { items } = await api.getServices();
            this.items = items;
            localStorage.setItem('services', JSON.stringify({ items, timestamp: Date.now() }));
            return this.items;
        } catch (error) {
            console.error('Ошибка загрузки каталога:', error);
            const cached = JSON.parse(localStorage.getItem('services'));
            if (cached && cached.items && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
                this.items = cached.items;
            } else {
                this.items = [];
            }
            return this.items;
        }
    }

    getItems() {
        return this.items;
    }
}
