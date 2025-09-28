import { ServiceDataManager } from './serviceDataManager.js';
import { ServiceRenderer } from './serviceDetails.js';

document.addEventListener('DOMContentLoaded', async () => {
    const serviceContainer = document.getElementById('service-details-content');
    if (!serviceContainer) {
        console.error('Контейнер услуги не найден. Проверьте, что в ServiceDetails.html есть элемент <div id="service-details-content">');
        document.body.innerHTML = '<p>Ошибка: контейнер услуги не найден. Проверьте HTML-структуру.</p>';
        return;
    }

    const serviceDataManager = new ServiceDataManager();
    const serviceRenderer = new ServiceRenderer(serviceContainer);
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = parseInt(urlParams.get('serviceId') || urlParams.get('id'));
    const userId = localStorage.getItem('userId') || null;
    const from = urlParams.get('from') || 'catalog';

    if (!serviceId) {
        console.error('ID услуги не указан в URL');
        serviceContainer.innerHTML = '<p>Услуга не найдена</p>';
        return;
    }

    try {
        const service = await serviceDataManager.fetchServiceDetails(serviceId);
        console.log('Загруженная услуга:', service);
        if (!service) {
            throw new Error('Услуга не найдена');
        }
        serviceRenderer.renderItem(service);

        const backButton = document.getElementById('back-to-catalog');
        if (backButton) {
            backButton.addEventListener('click', () => {
                if (from === 'favorites') {
                    window.location.href = '../pages/Favorites.html';
                } else if (from === 'cart' || from === 'basket') {
                    window.location.href = '../pages/Basket.html';
                } else {
                    window.location.href = '../pages/Catalog.html';
                }
            });

            const language = localStorage.getItem('language') || 'ru';
            if (from === 'favorites') {
                backButton.textContent = language === 'en' ? '← Back to Favorites' : '← Назад к избранному';
                backButton.setAttribute('data-translate-key', 'back_to_favorites');
            } else if (from === 'cart' || from === 'basket') {
                backButton.textContent = language === 'en' ? '← Back to Cart' : '← Назад к корзине';
                backButton.setAttribute('data-translate-key', 'back_to_basket');
            } else {
                backButton.textContent = language === 'en' ? '← Back to Catalog' : '← Назад к каталогу';
                backButton.setAttribute('data-translate-key', 'back_to_catalog');
            }
        }

        serviceContainer.addEventListener('click', async (event) => {
            const target = event.target.closest('button');
            if (!target) return;

            if (!userId) {
                const language = localStorage.getItem('language') || 'ru';
                alert(language === 'en' ? 'Please log in to perform this action' : 'Пожалуйста, войдите в аккаунт');
                return;
            }

            const itemId = parseInt(target.dataset.id);
            if (target.classList.contains('add-to-cart-btn')) {
                console.log(`Добавление в корзину, ID: ${itemId}`);
                await serviceDataManager.addToCart(userId, itemId);
            } else if (target.classList.contains('favorite-btn')) {
                console.log(`Переключение избранного, ID: ${itemId}`);
                await serviceDataManager.toggleFavorite(userId, itemId);
                serviceContainer.innerHTML = '';
                serviceRenderer.renderItem(service);
            }
        });

    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        serviceContainer.innerHTML = '<p>Ошибка загрузки услуги. Попробуйте позже.</p>';
    }
});