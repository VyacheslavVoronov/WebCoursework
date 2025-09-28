import { CatalogDataManager } from './catalogDataManager.js';
import { CatalogFilterSort } from './catalogFilterSort.js';
import { CatalogRenderer } from './catalogRenderer.js';
import { ServiceDataManager } from '../ServiceDetails/serviceDataManager.js';
import { api } from '../Api/api.js';

document.addEventListener("DOMContentLoaded", async () => {
    const catalogGrid = document.getElementById("catalog-grid");
    if (!catalogGrid) {
        console.error('Элемент catalog-grid не найден в DOM');
        return;
    }

    const uiElements = {
        categoryFilter: document.getElementById('category-filter'),
        priceFrom: document.getElementById('price-from'),
        priceTo: document.getElementById('price-to'),
        ratingFilter: document.getElementById('rating-filter'),
        sortSelect: document.getElementById('sort-select'),
        resetFilters: document.getElementById('reset-filters'),
        prevPageBtn: document.getElementById('prev-page'),
        nextPageBtn: document.getElementById('next-page'),
        pageNumbersContainer: document.getElementById('page-numbers'),
        searchInput: document.getElementById('search-input'),
        searchBtn: document.getElementById('search-btn')
    };

    Object.entries(uiElements).forEach(([key, el]) => {
        if (!el) {
            console.error(`Элемент ${key} не найден в DOM`);
        }
    });

    Object.values(uiElements).forEach(el => {
        if (el && el.value !== undefined) el.value = '';
    });

    const dataManager = new CatalogDataManager();
    const filterSort = new CatalogFilterSort();
    const serviceDataManager = new ServiceDataManager();
    let userId = localStorage.getItem('userId') || null;

    const renderCallback = async (page) => {
        const renderer = new CatalogRenderer(catalogGrid);
        const items = filterSort.getFilteredItems();
        const favorites = userId ? await serviceDataManager.getFavorites(userId) : [];
        return renderer.renderItems(items, page, favorites);
    };

    filterSort.init({
        ...uiElements,
        renderCallback,
        fetchItems: async (page, filters) => {
            const result = await api.getFilteredServices(page, filters);
            filterSort.setItems(result.items);
            return result;
        }
    });

    try {
        console.log('Инициализация каталога...');
        await filterSort.fetchAndRender();
        console.log('Каталог успешно инициализирован');

        catalogGrid.addEventListener('click', async (event) => {
            const target = event.target.closest('button');
            if (!target) return;

            const itemId = parseInt(target.dataset.id);
            if (target.classList.contains('add-to-cart-btn')) {
                if (!userId) {
                    const language = localStorage.getItem('language') || 'ru';
                    alert(language === 'en' ? 'Please log in to add to cart' : 'Пожалуйста, войдите в аккаунт для добавления в корзину');
                    return;
                }
                await serviceDataManager.addToCart(userId, itemId);
            } else if (target.classList.contains('favorite-btn')) {
                if (!userId) {
                    const language = localStorage.getItem('language') || 'ru';
                    alert(language === 'en' ? 'Please log in to add to favorites' : 'Пожалуйста, войдите в аккаунт для добавления в избранное');
                    return;
                }
                await serviceDataManager.toggleFavorite(userId, itemId);
                await filterSort.fetchAndRender();
            }
        });

        window.addEventListener('favoritesUpdated', () => filterSort.fetchAndRender());
        window.addEventListener('cartUpdated', () => filterSort.fetchAndRender());
        window.addEventListener('authChanged', async (event) => {
            userId = event.detail.userId;
            await filterSort.fetchAndRender();
        });
        window.addEventListener('languageChanged', async () => {
            await filterSort.fetchAndRender();
        });

    } catch (error) {
        console.error('Catalog initialization error:', error);
        const language = localStorage.getItem('language') || 'ru';
        catalogGrid.innerHTML = `<p>${language === 'en' ? 'Error loading catalog. Please try again later.' : 'Ошибка загрузки каталога. Пожалуйста, попробуйте позже.'}</p>`;
    }
});