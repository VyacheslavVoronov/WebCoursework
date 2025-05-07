document.addEventListener('DOMContentLoaded', function () {
    const swiper = new Swiper('.testimonial-swiper', {
        loop: true,
        autoplay: false,
        allowTouchMove: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        slidesPerView: 1,
        spaceBetween: 25,
        watchOverflow: false,
    });
});
