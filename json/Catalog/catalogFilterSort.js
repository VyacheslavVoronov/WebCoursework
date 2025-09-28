export class CatalogFilterSort {
    constructor() {
        this.items = [];
        this.filteredItems = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchQuery = '';
        this.itemsPerPage = 6;
    }

    init({ 
        categoryFilter, 
        priceFrom, 
        priceTo, 
        ratingFilter, 
        sortSelect, 
        resetFilters, 
        prevPageBtn, 
        nextPageBtn, 
        pageNumbersContainer, 
        renderCallback, 
        fetchItems, 
        searchInput, 
        searchBtn 
    }) {
        this.categoryFilter = categoryFilter;
        this.priceFrom = priceFrom;
        this.priceTo = priceTo;
        this.ratingFilter = ratingFilter;
        this.sortSelect = sortSelect;
        this.resetFilters = resetFilters;
        this.prevPageBtn = prevPageBtn;
        this.nextPageBtn = nextPageBtn;
        this.pageNumbersContainer = pageNumbersContainer;
        this.renderCallback = renderCallback;
        this.fetchItems = fetchItems;
        this.searchInput = searchInput;
        this.searchBtn = searchBtn;

        if (!this.prevPageBtn || !this.nextPageBtn || !this.pageNumbersContainer) {
            console.error('Pagination elements are not properly initialized');
            return;
        }

        this.setupEventListeners();
        this.updatePaginationControls();
    }

    setupEventListeners() {
        [this.categoryFilter, this.priceFrom, this.priceTo, this.ratingFilter, this.sortSelect].forEach(el => {
            if (el) el.addEventListener('change', () => this.fetchAndRender());
        });

        if (this.resetFilters) {
            this.resetFilters.addEventListener('click', () => {
                this.resetAllFilters();
                this.fetchAndRender();
            });
        }

        if (this.prevPageBtn) this.prevPageBtn.addEventListener('click', () => this.goToPrevPage());
        if (this.nextPageBtn) this.nextPageBtn.addEventListener('click', () => this.goToNextPage());

        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.debouncedFetchAndRender();
            });
        }

        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => {
                this.searchQuery = this.searchInput?.value.trim().toLowerCase() || '';
                this.fetchAndRender();
            });
        }

        this.debouncedFetchAndRender = this.debounce(() => this.fetchAndRender(), 300);
    }

    resetAllFilters() {
        if (this.categoryFilter) this.categoryFilter.value = 'all';
        if (this.priceFrom) this.priceFrom.value = '';
        if (this.priceTo) this.priceTo.value = '';
        if (this.ratingFilter) this.ratingFilter.value = '0';
        if (this.sortSelect) this.sortSelect.value = '';
        if (this.searchInput) this.searchInput.value = '';
        this.searchQuery = '';
        this.currentPage = 1;
    }

    debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }

    setItems(items) {
        this.items = items || [];
        this.filteredItems = [...this.items];
        this.totalPages = Math.ceil(this.items.length / this.itemsPerPage) || 1;
        console.log('Установлены items:', this.items, 'Total pages:', this.totalPages);
    }

    getFilteredItems() {
        return this.filteredItems;
    }

    async fetchAndRender() {
        try {
            const filters = {
                category: this.categoryFilter?.value || 'all',
                priceFrom: parseFloat(this.priceFrom?.value) || '',
                priceTo: parseFloat(this.priceTo?.value) || '',
                rating: parseFloat(this.ratingFilter?.value) || '',
                search: this.searchQuery || '',
                sort: this.sortSelect?.value || ''
            };
            console.log('Отправляем фильтры:', filters);
            const result = await this.fetchItems(this.currentPage, filters);
            console.log('Получен результат от fetchItems:', result);

            if (!result || !Array.isArray(result)) {
                console.error('fetchItems вернул некорректные данные:', result);
                this.items = [];
                this.filteredItems = [];
                this.totalPages = 1;
                await this.renderPage();
                return;
            }

            this.setItems(result);
            await this.renderPage();
        } catch (error) {
            console.error('Error in fetchAndRender:', error);
            await this.showErrorModal('Ошибка загрузки каталога. Попробуйте позже.');
            await this.renderPage();
        }
    }

    async renderPage() {
        const result = await this.renderCallback(this.currentPage);
        this.updatePaginationControls();
        console.log('Обновлены элементы пагинации, totalPages:', this.totalPages);
        return result;
    }

    async goToPrevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            await this.renderPage();
        }
    }

    async goToNextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            await this.renderPage();
        }
    }

    updatePaginationControls() {
        if (!this.pageNumbersContainer || !this.prevPageBtn || !this.nextPageBtn) {
            console.error('Pagination elements are missing in the DOM');
            return;
        }

        this.pageNumbersContainer.innerHTML = '';

        for (let i = 1; i <= this.totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = `page-number ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.addEventListener('click', async () => {
                this.currentPage = i;
                await this.renderPage();
            });
            this.pageNumbersContainer.appendChild(pageBtn);
        }

        this.prevPageBtn.disabled = this.currentPage <= 1;
        this.nextPageBtn.disabled = this.currentPage >= this.totalPages;
        console.log('Кнопки пагинации обновлены:', {
            prevDisabled: this.prevPageBtn.disabled,
            nextDisabled: this.nextPageBtn.disabled,
            currentPage: this.currentPage,
            totalPages: this.totalPages
        });
    }

    showErrorModal(message) {
        const language = localStorage.getItem('language') || 'ru';
        alert(language === 'en' ? message.replace('Попробуйте позже.', 'Please try again later.') : message);
    }
}