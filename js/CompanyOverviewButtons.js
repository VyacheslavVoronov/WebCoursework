class TabController {
    constructor(containerSelector = '.tabs') {
      this.container = document.querySelector(containerSelector);
      if (!this.container) return;
  
      this.tabLinks = this.container.querySelectorAll('.tab-link');
      this.tabPanes = this.container.querySelectorAll('.tab-pane');
      this.init();
    }
  
    init() {
      this.tabLinks.forEach(link => {
        link.addEventListener('click', (e) => this.handleTabClick(e));
      });
  
      const activeTab = this.tabLinks[0];
      if (activeTab) {
        this.activateTab(activeTab);
      }
    }
  
    handleTabClick(e) {
      e.preventDefault();
      const tab = e.currentTarget;
      this.activateTab(tab);
    }
  
    activateTab(tab) {
      this.tabLinks.forEach(link => {
        link.classList.remove('current');
        link.setAttribute('aria-selected', 'false');
        link.setAttribute('tabindex', '-1');
      });
      this.tabPanes.forEach(pane => pane.classList.remove('tab-active'));
  
      tab.classList.add('current');
      tab.setAttribute('aria-selected', 'true');
      tab.setAttribute('tabindex', '0');
      const paneId = tab.getAttribute('data-tab');
      const pane = this.container.querySelector(`#${paneId}`);
      if (pane) {
        pane.classList.add('tab-active');
      }
  
      tab.focus();
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    new TabController();
  });