export class CatalogRenderer {
    constructor(container) {
        this.container = container;
    }

    renderItems(items, page, favorites = []) {
        console.log('Рендеринг элементов:', items, 'Страница:', page);
        this.container.innerHTML = '';
        const itemsPerPage = 6;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = items.slice(start, end);
        console.log('Пагинированные элементы:', paginatedItems);

        if (paginatedItems.length === 0) {
            const language = localStorage.getItem('language') || 'ru';
            this.container.innerHTML = `
                <div class="empty-catalog-message">
                    <img src="../assets/icons/yellow_box_icon.svg" alt="${language === 'en' ? 'Empty catalog' : 'Пустой каталог'}">
                    <h3>${language === 'en' ? 'No items found' : 'Товары не найдены'}</h3>
                    <p>${language === 'en' ? 'Try changing filters or adding new services' : 'Попробуйте изменить фильтры или добавить новые услуги'}</p>
                </div>
            `;
            return { totalPages: Math.ceil(items.length / itemsPerPage) || 1 };
        }

        paginatedItems.forEach(item => {
            const isFavorite = favorites.includes(item.id);
            const card = document.createElement('div');
            card.className = 'catalog-card';
            const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
            const language = localStorage.getItem('language') || 'ru';
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="catalog-item-image">
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${item.id}">
                    <img src="../assets/icons/yellow_favorite_filled_icon.svg" alt="${language === 'en' ? 'Favorite' : 'Избранное'}" class="favorite-icon">
                    <img src="../assets/icons/yellow_favorite_unfilled_icon.svg" alt="${language === 'en' ? 'Not in favorites' : 'Не в избранном'}" class="favorite-icon">
                </button>
                <div class="catalog-item-details">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="price">$${price.toFixed(2)}</div>
                    <div class="card-actions">
                        <a href="../pages/ServiceDetails.html?id=${item.id}&from=catalog" class="view-details-btn">${language === 'en' ? 'View details' : 'Просмотреть детали'}</a>
                        <button class="add-to-cart-btn" data-id="${item.id}">${language === 'en' ? 'Add to cart' : 'В корзину'}</button>
                    </div>
                </div>
            `;
            this.container.appendChild(card);
        });

        return { totalPages: Math.ceil(items.length / itemsPerPage) || 1 };
    }
}