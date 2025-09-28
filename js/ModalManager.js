class ModalManager {
    constructor() {
        this.activeModals = new Set();
        this.modalStack = [];
        this.zIndexBase = 10000;
        this.currentZIndex = this.zIndexBase;
        
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTopModal();
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('modal-backdrop')) {
                this.closeTopModal();
            }
        });

    }

    openModal(modalId, options = {}) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Модальное окно с ID "${modalId}" не найдено`);
            return false;
        }

        if (!options.allowMultiple) {
            this.closeAllModals();
        }

        this.currentZIndex += 10;
        modal.style.zIndex = this.currentZIndex;
        modal.style.display = 'flex';

        this.activeModals.add(modalId);
        this.modalStack.push(modalId);

        modal.classList.add('modal-open');

        this.lockBodyScroll();

        return true;
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Модальное окно с ID "${modalId}" не найдено`);
            return false;
        }

        this.activeModals.delete(modalId);
        
        const index = this.modalStack.indexOf(modalId);
        if (index > -1) {
            this.modalStack.splice(index, 1);
        }

        modal.style.display = 'none';
        modal.classList.remove('modal-open');

        if (this.activeModals.size === 0) {
            this.unlockBodyScroll();
        }

        return true;
    }

    closeTopModal() {
        if (this.modalStack.length > 0) {
            const topModalId = this.modalStack[this.modalStack.length - 1];
            this.closeModal(topModalId);
        }
    }

    closeAllModals() {
        const modalsToClose = [...this.activeModals];
        modalsToClose.forEach(modalId => {
            this.closeModal(modalId);
        });
    }

    lockBodyScroll() {
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = this.getScrollbarWidth() + 'px';
    }

    unlockBodyScroll() {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }

    getScrollbarWidth() {
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        outer.style.msOverflowStyle = 'scrollbar';
        document.body.appendChild(outer);

        const inner = document.createElement('div');
        outer.appendChild(inner);

        const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
        outer.parentNode.removeChild(outer);

        return scrollbarWidth;
    }

    isModalOpen(modalId) {
        return this.activeModals.has(modalId);
    }

    getActiveModalsCount() {
        return this.activeModals.size;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.modalManager = new ModalManager();
    });
} else {
    window.modalManager = new ModalManager();
}

export { ModalManager };
