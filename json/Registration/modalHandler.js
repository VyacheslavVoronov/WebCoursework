export class ModalHandler {
    constructor(modalSelector) {
        this.modal = document.querySelector(modalSelector);
        this.modalId = this.modal ? this.modal.id : null;
        console.log('ModalHandler constructor:', { modalSelector, modal: this.modal, modalId: this.modalId });
        
        if (!this.modal) {
            console.error('Modal not found with selector:', modalSelector);
            return;
        }
        
        this.modalContent = this.modal.querySelector('#modalContent');
        this.modalMessage = this.modal.querySelector('#modalMessage');
        this.closeButton = this.modal.querySelector('#modalCloseBtn');
        this.closeIcon = this.modal.querySelector('.modal-close');
        
        console.log('Modal elements found:', {
            modalContent: this.modalContent,
            modalMessage: this.modalMessage,
            closeButton: this.closeButton,
            closeIcon: this.closeIcon
        });
        
        this.init();
    }

    init() {
        console.log('ModalHandler init called');
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.hideModal());
        } else {
            console.warn('Modal close button not found');
        }
        if (this.closeIcon) {
            this.closeIcon.addEventListener('click', () => this.hideModal());
        } else {
            console.warn('Modal close icon not found');
        }
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });
    }

    showModal(content, type) {
        if (!this.modal) {
            console.error('Modal not initialized');
            return;
        }
        
        if (!this.modalContent) {
            console.error('Modal content not found');
            return;
        }
        
        this.modalContent.innerHTML = '';
        
        this.modalContent.innerHTML = `
            <span class="modal-close">×</span>
            <p id="modalMessage"></p>
            <button id="modalCloseBtn" class="yellow-overlay-button" data-translate-key="close">Close</button>
        `;
        
        this.modalMessage = this.modalContent.querySelector('#modalMessage');
        this.closeButton = this.modalContent.querySelector('#modalCloseBtn');
        this.closeIcon = this.modalContent.querySelector('.modal-close');
        
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.hideModal());
        }
        if (this.closeIcon) {
            this.closeIcon.addEventListener('click', () => this.hideModal());
        }
        
        this.modalContent.className = 'modal-content';

        if (type === 'form') {
            this.modalContent.innerHTML = content;
        } else {
            if (this.modalMessage) {
                this.modalMessage.textContent = content;
            } else {
                console.error('Modal message element not found');
                return;
            }
            
            if (['success', 'error', 'info', 'warning'].includes(type)) {
                this.modalContent.classList.add(type);
            } else {
                this.modalContent.classList.add('info');
            }
        }

        this.applyTranslations();

        if (window.modalManager && this.modalId) {
            window.modalManager.openModal(this.modalId);
        } else {
            this.modal.style.display = 'flex';
            this.modal.classList.add('modal-open');
        }
    }

    hideModal() {
        if (window.modalManager && this.modalId) {
            window.modalManager.closeModal(this.modalId);
        } else {
            this.modal.style.display = 'none';
            this.modal.classList.remove('modal-open');
        }
        
        this.modalContent.innerHTML = `
            <span class="modal-close">×</span>
            <p id="modalMessage"></p>
            <button id="modalCloseBtn" class="yellow-overlay-button" data-translate-key="close">Close</button>
        `;
        
        this.modalMessage = this.modalContent.querySelector('#modalMessage');
        this.closeButton = this.modalContent.querySelector('#modalCloseBtn');
        this.closeIcon = this.modalContent.querySelector('.modal-close');
        
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.hideModal());
        }
        if (this.closeIcon) {
            this.closeIcon.addEventListener('click', () => this.hideModal());
        }
        
        this.modalContent.className = 'modal-content';
    }

    applyTranslations() {
        if (typeof window.translatePage === 'function') {
            window.translatePage();
        }
    }
}