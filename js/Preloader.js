document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, начинаем загрузку layout');
    loadLayout()
        .then(() => {
            console.log('Layout загружен, скрываем прелоадер');
            const preloader = document.getElementById('preloader');
            if (!preloader) {
                console.error('Элемент #preloader не найден');
                return;
            }
            preloader.classList.add('hidden');
        })
        .catch(error => {
            console.error('Ошибка при загрузке layout:', error);
            const preloader = document.getElementById('preloader');
            if (preloader) {
                preloader.classList.add('hidden');
            }
        });
});