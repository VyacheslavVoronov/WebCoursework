document.addEventListener('DOMContentLoaded', function () {
  const swiper = new Swiper('.comments-slider', {
      slidesPerView: 1,
      spaceBetween: 36,
      loop: false,
      navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
      },
      pagination: {
          el: '.swiper-pagination',
          clickable: true,
      },
  });
});
