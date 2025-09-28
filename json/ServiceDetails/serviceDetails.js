import { ServiceDataManager } from './serviceDataManager.js';

export class ServiceRenderer {
    constructor(container) {
        this.container = container;
        this.dataManager = new ServiceDataManager();
    }

    async renderItem(item) {
        this.container.innerHTML = '';
        
        const price = this.formatPrice(item.price);
        const rating = this.formatRating(item.rating);
        const stars = this.generateStars(rating.value);
        const userId = localStorage.getItem('userId');
        const isFavorite = userId ? await this.checkIfFavorite(userId, item.id) : false;
        const language = localStorage.getItem('language') || 'ru';

        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = this.generateCardHTML(item, price, rating, stars, isFavorite, language);
        this.container.appendChild(card);

        this.addEventListeners(card, item.id);
    }

    async checkIfFavorite(userId, itemId) {
        try {
            const favorites = await this.dataManager.getFavorites(userId);
            return favorites.includes(itemId);
        } catch (error) {
            console.error('Error checking favorites:', error);
            return false;
        }
    }

    formatPrice(price) {
        const numericPrice = typeof price === 'number' ? price : parseFloat(price) || 0;
        return {
            value: numericPrice,
            formatted: numericPrice.toFixed(2)
        };
    }

    formatRating(rating) {
        const numericRating = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
        return {
            value: numericRating,
            formatted: numericRating.toFixed(1)
        };
    }

    generateCardHTML(item, price, rating, stars, isFavorite, language) {
        return `
            <div class="service-image-container">
                <img src="${item.image}" alt="${item.name}" class="service-image" loading="lazy">
            </div>
            <div class="service-details">
                <div class="service-header">
                    <h2 class="service-title">${item.name}</h2>
                    <div class="service-price">$${price.formatted}</div>
                </div>
                
                <div class="service-rating">
                    <div class="rating-stars">${stars}</div>
                    <span class="rating-value">${rating.formatted}</span>
                </div>
                
                <p class="service-description">${item.description}</p>
                
                ${this.generateAttributesHTML(item.attributes, language)}
                ${this.generateExpandedDescriptionHTML(item, language)}
                
                <div class="service-actions">
                    <button class="add-to-cart-btn" data-id="${item.id}" data-translate-key="add_to_cart">
                        ${language === 'en' ? 'Add to Cart' : 'В корзину'}
                    </button>
                    <button class="favorite-btn ${isFavorite ? 'is-favorite' : ''}" data-id="${item.id}" 
                            data-translate-key="${isFavorite ? 'remove_from_favorites' : 'add_to_favorites'}">
                        <img src="${isFavorite ? '../assets/icons/yellow_favorite_filled_icon.svg' : '../assets/icons/yellow_favorite_unfilled_icon.svg'}" 
                             alt="Favorite" class="favorite-icon">
                        ${language === 'en' ? (isFavorite ? 'In Favorites' : 'Add to Favorites') : (isFavorite ? 'В избранном' : 'В избранное')}
                    </button>
                </div>
            </div>
        `;
    }

    generateStars(ratingValue) {
        const fullStars = Math.floor(ratingValue);
        const hasHalfStar = ratingValue % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return `
            ${'<span class="star full">★</span>'.repeat(fullStars)}
            ${hasHalfStar ? '<span class="star half">★</span>' : ''}
            ${'<span class="star empty">☆</span>'.repeat(emptyStars)}
        `;
    }

    generateExpandedDescriptionHTML(item, language) {
        const description = language === 'en' ? item.extendedDescription_en : item.extendedDescription;
        if (!description) return '';

        return `
            <div class="expanded-description">
                <h3 data-translate-key="details">${language === 'en' ? 'Details' : 'Детали'}</h3>
                <p>${description}</p>
            </div>
        `;
    }

    generateAttributesHTML(attributes, language) {
        if (!attributes || typeof attributes !== 'object') return '';
        
        const attributesArray = Object.entries(attributes);
        if (attributesArray.length === 0) return '';

        return `
            <div class="service-attributes">
                ${attributesArray.map(([key, value]) => `
                    <div class="attribute">
                        <span class="attribute-title">${this.formatAttributeName(key, language)}</span>
                        <span class="attribute-value">${value}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    formatAttributeName(key, language) {
        const translations = {
            'deliveryTime': { en: 'Delivery Time', ru: 'Срок доставки' },
            'maxWeight': { en: 'Max Weight', ru: 'Макс. вес' },
            'coverage': { en: 'Coverage', ru: 'Покрытие' }
        };
        
        return translations[key]?.[language] || key;
    }

    addEventListeners(card, itemId) {
        const addToCartBtn = card.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', async () => {
                const userId = localStorage.getItem('userId');
                if (!userId) {
                    alert(localStorage.getItem('language') === 'en' ? 
                        'Please log in to add items to cart' : 
                        'Пожалуйста, войдите, чтобы добавлять товары в корзину');
                    return;
                }
                
                try {
                    await this.dataManager.addToCart(userId, itemId);
                    addToCartBtn.textContent = localStorage.getItem('language') === 'en' ? 
                        'Added to Cart!' : 'Добавлено в корзину!';
                    setTimeout(() => {
                        addToCartBtn.textContent = localStorage.getItem('language') === 'en' ? 
                            'Add to Cart' : 'В корзину';
                    }, 2000);
                } catch (error) {
                    console.error('Error adding to cart:', error);
                }
            });
        }

        const favoriteBtn = card.querySelector('.favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', async () => {
                const userId = localStorage.getItem('userId');
                if (!userId) {
                    alert(localStorage.getItem('language') === 'en' ? 
                        'Please log in to manage favorites' : 
                        'Пожалуйста, войдите, чтобы управлять избранным');
                    return;
                }
                
                try {
                    const isCurrentlyFavorite = favoriteBtn.classList.contains('is-favorite');
                    if (isCurrentlyFavorite) {
                        await this.dataManager.removeFromFavorites(userId, itemId);
                    } else {
                        await this.dataManager.addToFavorites(userId, itemId);
                    }
                    
                    favoriteBtn.classList.toggle('is-favorite');
                    const language = localStorage.getItem('language') || 'ru';
                    
                    if (favoriteBtn.classList.contains('is-favorite')) {
                        favoriteBtn.innerHTML = `
                            <img src="../assets/icons/yellow_favorite_filled_icon.svg" alt="Favorite" class="favorite-icon">
                            ${language === 'en' ? 'In Favorites' : 'В избранном'}
                        `;
                        favoriteBtn.setAttribute('data-translate-key', 'remove_from_favorites');
                    } else {
                        favoriteBtn.innerHTML = `
                            <img src="../assets/icons/yellow_favorite_unfilled_icon.svg" alt="Favorite" class="favorite-icon">
                            ${language === 'en' ? 'Add to Favorites' : 'В избранное'}
                        `;
                        favoriteBtn.setAttribute('data-translate-key', 'add_to_favorites');
                    }
                } catch (error) {
                    console.error('Error toggling favorite:', error);
                }
            });
        }
    }
}
