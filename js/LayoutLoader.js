function loadLayout() {
    return fetch('../components/layout.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки layout.html: ' + response.status);
            }
            return response.text();
        })
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            
            const headerContent = doc.querySelector('#header-content').innerHTML;
            document.getElementById('header').innerHTML = headerContent;

            const footerContent = doc.querySelector('#footer-content').innerHTML;
            document.getElementById('footer').innerHTML = footerContent;

            const event = new Event('headerLoaded');
            document.dispatchEvent(event);
        })
        .catch(error => {
            console.error('Не удалось загрузить layout:', error);
            throw error;
        });
}

document.addEventListener('DOMContentLoaded', loadLayout);