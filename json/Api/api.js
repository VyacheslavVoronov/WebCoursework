const API_URL = 'http://localhost:3000';

async function fetchWithErrorHandling(url, options, errorMessage) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options?.headers,
                'Cache-Control': 'no-cache'
            }
        });
        if (!response.ok) {
            throw new Error(`${errorMessage}: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(`Ответ от ${url}:`, { data });
        return data;
    } catch (error) {
        console.error(`Ошибка в ${errorMessage}:`, error);
        throw error;
    }
}

export const api = {
    async getFavorites(userId) {
        console.log('Запрос избранного для userId:', userId);
        const data = await fetchWithErrorHandling(
            `${API_URL}/favorites?userId=${userId}`,
            {},
            'Не удалось получить избранное'
        );
        return data.map(item => item.serviceId);
    },

    async addToFavorites(userId, serviceId) {
        const data = await fetchWithErrorHandling(
            `${API_URL}/favorites`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, serviceId })
            },
            'Не удалось добавить в избранное'
        );
        return data;
    },

    async removeFromFavorites(userId, serviceId) {
        const data = await fetchWithErrorHandling(
            `${API_URL}/favorites?userId=${userId}&serviceId=${serviceId}`,
            {},
            'Не удалось найти запись избранного'
        );
        if (data.length === 0) {
            throw new Error('Запись избранного не найдена');
        }
        const favoriteId = data[0].id;
        await fetchWithErrorHandling(
            `${API_URL}/favorites/${favoriteId}`,
            { method: 'DELETE' },
            'Не удалось удалить из избранного'
        );
    },

    async getServiceById(serviceId) {
        const data = await fetchWithErrorHandling(
            `${API_URL}/services/${serviceId}`,
            {},
            'Не удалось получить услугу'
        );
        const language = localStorage.getItem('language') || 'ru';
        return {
            ...data,
            price: parseFloat(data.price) || 0,
            rating: parseFloat(data.rating) || 0,
            name: language === 'en' ? data.name_en : data.name,
            description: language === 'en' ? data.description_en : data.description,
            extendedDescription: language === 'en' ? data.extendedDescription_en : data.extendedDescription,
            attributes: language === 'en' ? data.attributes_en : data.attributes
        };
    },

    async getUserById(userId) {
        const data = await fetchWithErrorHandling(
            `${API_URL}/users/${userId}`,
            {},
            'Не удалось получить данные пользователя'
        );
        return {
            ...data,
            email: data.email || '',
            nickname: data.nickname || '',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phone: data.phone || '',
            birthdate: data.birthdate || '',
            role: data.role || 'user',
            middleName: data.middleName || ''
        };
    },

    async getUserByEmail(email) {
        const data = await fetchWithErrorHandling(
            `${API_URL}/users?email=${encodeURIComponent(email)}`,
            {},
            'Не удалось найти пользователя по email'
        );
        return data.map(user => ({
            ...user,
            email: user.email || '',
            nickname: user.nickname || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
            birthdate: user.birthdate || '',
            role: user.role || 'user',
            middleName: user.middleName || ''
        }));
    },

    async getUsers() {
        const data = await fetchWithErrorHandling(
            `${API_URL}/users`,
            {},
            'Не удалось получить список пользователей'
        );
        return data.map(user => ({
            ...user,
            email: user.email || '',
            nickname: user.nickname || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
            birthdate: user.birthdate || '',
            role: user.role || 'user',
            middleName: user.middleName || ''
        }));
    },

    async createUser(userData) {
        const data = await fetchWithErrorHandling(
            `${API_URL}/users`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            },
            'Не удалось создать пользователя'
        );
        return data;
    },

    async updateUser(userId, updates) {
        const data = await fetchWithErrorHandling(
            `${API_URL}/users/${userId}`,
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            },
            'Не удалось обновить данные пользователя'
        );
        return data;
    },

    async deleteUser(userId) {
        await fetchWithErrorHandling(
            `${API_URL}/users/${userId}`,
            { method: 'DELETE' },
            'Не удалось удалить пользователя'
        );
    },

    async getServices() {
        const language = localStorage.getItem('language') || 'ru';
        const data = await fetchWithErrorHandling(
            `${API_URL}/services`,
            {},
            'Не удалось получить услуги'
        );
        console.log('Данные от getServices:', data);
        const transformedServices = data.map(item => ({
            ...item,
            price: parseFloat(item.price) || 0,
            rating: parseFloat(item.rating) || 0,
            name: language === 'en' ? item.name_en : item.name,
            description: language === 'en' ? item.description_en : item.description,
            extendedDescription: language === 'en' ? item.extendedDescription_en : item.extendedDescription,
            attributes: language === 'en' ? item.attributes_en : item.attributes
        }));
        return transformedServices;
    },

    async createService(serviceData) {
        const data = await fetchWithErrorHandling(
            `${API_URL}/services`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(serviceData)
            },
            'Не удалось создать услугу'
        );
        return data;
    },

    async updateService(serviceId, updates) {
        const data = await fetchWithErrorHandling(
            `${API_URL}/services/${serviceId}`,
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            },
            'Не удалось обновить услугу'
        );
        return data;
    },

    async deleteService(serviceId) {
        await fetchWithErrorHandling(
            `${API_URL}/services/${serviceId}`,
            { method: 'DELETE' },
            'Не удалось удалить услугу'
        );
    },

    async getFilteredServices(page, filters) {
        const language = localStorage.getItem('language') || 'ru';
        const queryParams = new URLSearchParams();
        if (filters.category && filters.category !== 'all') queryParams.append('category', filters.category);
        if (filters.priceFrom) queryParams.append('price_gte', filters.priceFrom);
        if (filters.priceTo) queryParams.append('price_lte', filters.priceTo);
        if (filters.rating) queryParams.append('rating_gte', filters.rating);
        if (filters.search) queryParams.append('q', filters.search);
        if (filters.sort) {
            const [field, order] = filters.sort.split('-');
            queryParams.append('_sort', field);
            queryParams.append('_order', order || 'asc');
        }

        const url = `${API_URL}/services?${queryParams}`;
        const data = await fetchWithErrorHandling(
            url,
            {},
            'Не удалось получить отфильтрованные услуги'
        );

        console.log('Запрос:', url);
        console.log('Данные от getFilteredServices:', data);

        const transformedServices = data.map(item => ({
            ...item,
            price: parseFloat(item.price) || 0,
            rating: parseFloat(item.rating) || 0,
            name: language === 'en' ? item.name_en : item.name,
            description: language === 'en' ? item.description_en : item.description,
            extendedDescription: language === 'en' ? item.extendedDescription_en : item.extendedDescription,
            attributes: language === 'en' ? item.attributes_en : item.attributes
        }));

        return transformedServices;
    },

    async addToCart(userId, serviceId) {
        const data = await fetchWithErrorHandling(
            `${API_URL}/cart`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, serviceId, quantity: 1 })
            },
            'Не удалось добавить в корзину'
        );
        return data;
    },

    async getCart(userId) {
        const data = await fetchWithErrorHandling(
            `${API_URL}/cart?userId=${userId}`,
            {},
            'Не удалось получить корзину'
        );
        return data;
    },

    async removeFromCart(cartId) {
        await fetchWithErrorHandling(
            `${API_URL}/cart/${cartId}`,
            { method: 'DELETE' },
            'Не удалось удалить из корзины'
        );
    },

    async updateCartItemQuantity(cartId, quantity) {
        await fetchWithErrorHandling(
            `${API_URL}/cart/${cartId}`,
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity })
            },
            'Не удалось обновить количество'
        );
    },

    async clearCart(userId) {
        const items = await fetchWithErrorHandling(
            `${API_URL}/cart?userId=${userId}`,
            {},
            'Не удалось получить корзину для очистки'
        );
        await Promise.all(items.map(item => fetchWithErrorHandling(
            `${API_URL}/cart/${item.id}`,
            { method: 'DELETE' },
            'Не удалось удалить товар из корзины'
        )));
    }
};
