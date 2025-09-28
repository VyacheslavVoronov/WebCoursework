document.addEventListener('DOMContentLoaded', () => {

    const hidePreloader = () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('hidden');
        } else {
            console.error('Элемент #preloader не найден');
        }
    };

    loadLayout()
        .then(() => {
            hidePreloader();
        })
        .catch(error => {
            console.error('Ошибка при загрузке layout:', error);
            hidePreloader();
        });
});
