import { ServiceDataManager } from '../ServiceDetails/serviceDataManager.js';

document.addEventListener("DOMContentLoaded", async () => {
    console.log('Инициализация favoritesLoader.js');
    const favoritesGrid = document.getElementById("favorites-grid");
    if (!favoritesGrid) {
        console.error("Контейнер избранного не найден");
        return;
    }

    const serviceDataManager = new ServiceDataManager();
    let userId = localStorage.getItem('userId') || null;

    const renderFavorites = async () => {
        const language = localStorage.getItem('language') || 'ru';
        console.log('Рендер избранного, userId:', userId);

        favoritesGrid.innerHTML = '';

        if (!userId) {
            favoritesGrid.innerHTML = `
                <div class="empty-favorites-message">
                    <img src="../assets/icons/yellow_box_icon.svg" alt="Пустое избранное" width="80">
                    <h3 data-translate-key="login_required">${language === 'en' ? 'Please Log In' : 'Войдите в аккаунт'}</h3>
                    <p data-translate-key="login_to_view_favorites">${language === 'en' ? 'Log in to view your favorites' : 'Авторизуйтесь, чтобы просматривать избранное'}</p>
                </div>
            `;
            return;
        }

        try {
            const favoriteIds = await serviceDataManager.getFavorites(userId);
            console.log('Избранное IDs:', favoriteIds);

            const favoriteItems = [];
            for (const itemId of favoriteIds) {
                const item = await serviceDataManager.fetchServiceDetails(itemId);
                if (item) {
                    favoriteItems.push(item);
                }
            }
            console.log('Избранные товары:', favoriteItems);

            if (favoriteItems.length === 0) {
                favoritesGrid.innerHTML = `
                    <div class="empty-favorites-message">
                        <img src="../assets/icons/yellow_box_icon.svg" alt="Пустое избранное" width="80">
                        <h3 data-translate-key="favorite_services_empty">${language === 'en' ? 'Favorites Empty' : 'Избранное пусто'}</h3>
                        <p data-translate-key="favorite_services_empty_text">${language === 'en' ? 'Add items to favorites from the catalog' : 'Добавьте товары в избранное из каталога'}</p>
                    </div>
                `;
                return;
            }

            favoriteItems.forEach(item => {
                const card = document.createElement('div');
                card.className = 'favorite-card';
                const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
                card.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="favorite-item-image">
                    <button class="remove-favorite-btn" data-id="${item.id}">
                        <img src="../assets/icons/yellow_favorite_filled_icon.svg" alt="${language === 'en' ? 'Remove from Favorites' : 'Удалить из избранного'}" class="favorite-icon">
                    </button>
                    <div class="favorite-item-details">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        <div class="price">$${price.toFixed(2)}</div>
                        <div class="card-actions">
                            <a href="../pages/ServiceDetails.html?id=${item.id}&from=favorites" class="view-details-btn" data-translate-key="view_details">${language === 'en' ? 'View Details' : 'Просмотреть детали'}</a>
                            <button class="add-to-cart-btn" data-id="${item.id}" data-translate-key="add_to_cart">${language === 'en' ? 'Add to Cart' : 'В корзину'}</button>
                        </div>
                    </div>
                `;
                favoritesGrid.appendChild(card);
            });
        } catch (error) {
            console.error('Ошибка рендеринга избранного:', error);
            favoritesGrid.innerHTML = `
                <p data-translate-key="error_loading_favorites">${language === 'en' ? 'Error loading favorites.' : 'Ошибка загрузки избранного.'}</p>
            `;
        }
    };

    await renderFavorites();

    favoritesGrid.addEventListener('click', async (event) => {
        const target = event.target.closest('button');
        if (!target) return;

        if (!userId) {
            const language = localStorage.getItem('language') || 'ru';
            alert(language === 'en' ? 'Please log in to manage favorites' : 'Пожалуйста, войдите в аккаунт для управления избранным');
            return;
        }

        const itemId = parseInt(target.dataset.id);
        if (target.classList.contains('remove-favorite-btn')) {
            console.log(`Удаление из избранного, ID: ${itemId}`);
            await serviceDataManager.removeFromFavorites(userId, itemId);
            await renderFavorites();
        } else if (target.classList.contains('add-to-cart-btn')) {
            console.log(`Добавление в корзину из избранного, ID: ${itemId}`);
            await serviceDataManager.addToCart(userId, itemId);
            await renderFavorites();
        }
    });

    window.addEventListener('favoritesUpdated', async () => {
        console.log('Событие favoritesUpdated');
        await renderFavorites();
    });

    window.addEventListener('authChanged', async (event) => {
        console.log('Событие authChanged, новый userId:', event.detail.userId);
        userId = event.detail.userId;
        await renderFavorites();
    });

    window.addEventListener('languageChanged', async () => {
        console.log('Событие languageChanged, обновление избранного');
        await renderFavorites();
    });
});