
export class UserAgreementModal {
    constructor() {
        this.modalId = 'userAgreementModal';
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        
        const modal = document.getElementById(this.modalId);
        if (!modal) {
            console.error('UserAgreementModal: Modal element not found');
            return;
        }

        this.setupEventListeners();
        this.loadAgreementContent();
        this.isInitialized = true;
    }

    setupEventListeners() {
        const agreementLink = document.querySelector('a[data-translate-key="user_agreement"]');
        if (agreementLink) {
            agreementLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal();
            });
        }

        const closeButtons = document.querySelectorAll(`#${this.modalId} .modal-close, #${this.modalId} #userAgreementCloseBtn`);
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.hideModal();
            });
        });

        window.addEventListener('languageChanged', () => {
            this.loadAgreementContent();
        });
    }

    loadAgreementContent() {
        const contentElement = document.getElementById('userAgreementContent');
        const titleElement = document.querySelector(`#${this.modalId} .modal-title`);
        
        if (!contentElement) return;

        const currentLanguage = localStorage.getItem('language') || 'ru';
        
        const translations = window.translations || {};
        const langData = translations[currentLanguage] || translations.ru;
        
        if (titleElement && langData && langData.user_agreement_title) {
            titleElement.textContent = langData.user_agreement_title;
        }
        
        if (langData && langData.user_agreement_content) {
            contentElement.innerHTML = langData.user_agreement_content;
        } else {
            contentElement.innerHTML = '<h4>1. Общие положения</h4><p>1.1. Использование сайта TransitFlow означает безоговорочное согласие Пользователя с настоящим Соглашением и указанными в нем условиями.</p><p>1.2. В случае несогласия с условиями Соглашения Пользователь должен прекратить использование сайта.</p><h4>2. Предмет соглашения</h4><p>2.1. Администрация предоставляет Пользователю услуги по использованию сайта TransitFlow на условиях, являющихся предметом настоящего Соглашения.</p><p>2.2. Сайт TransitFlow предоставляет информационные услуги в области логистики и грузоперевозок.</p><h4>3. Права и обязанности сторон</h4><p>3.1. Пользователь имеет право использовать функциональные возможности сайта в соответствии с его назначением.</p><p>3.2. Пользователь обязуется не нарушать права третьих лиц при использовании сайта.</p><p>3.3. Администрация обязуется обеспечивать работоспособность сайта в пределах разумного.</p><h4>4. Ответственность</h4><p>4.1. Администрация не несет ответственности за временные технические сбои и перерывы в работе сайта.</p><p>4.2. Пользователь несет полную ответственность за достоверность предоставляемой информации.</p><h4>5. Заключительные положения</h4><p>5.1. Администрация оставляет за собой право в одностороннем порядке изменять условия настоящего Соглашения.</p><p>5.2. Настоящее Соглашение регулируется и толкуется в соответствии с законодательством Республики Беларусь.</p>';
        }
    }

    showModal() {
        if (window.modalManager) {
            window.modalManager.openModal(this.modalId);
        } else {
            console.error('ModalManager not available');
        }
    }

    hideModal() {
        if (window.modalManager) {
            window.modalManager.closeModal(this.modalId);
        } else {
            console.error('ModalManager not available');
        }
    }

    isVisible() {
        return window.modalManager ? window.modalManager.isModalOpen(this.modalId) : false;
    }

    toggleModal() {
        if (this.isVisible()) {
            this.hideModal();
        } else {
            this.showModal();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const userAgreementModal = new UserAgreementModal();
    userAgreementModal.init();
    
    window.userAgreementModal = userAgreementModal;
});

export default UserAgreementModal;
