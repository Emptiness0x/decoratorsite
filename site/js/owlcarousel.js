// Перша карусель
$(".slide-one").owlCarousel({
  items: 6, // Кількість елементів, що відображаються одночасно
  stagePadding: 20, // Відступи на сцені каруселі
  loop: false, // Вимкнути циклічний режим
  margin: 5, // Відступи між елементами
  nav: false, // Вимкнути навігаційні кнопки
  responsiveClass: true, // Використовувати класи адаптивності
  responsive: {
    0: {
      items: 1, // Кількість елементів на екранах шириною менше 600px
      nav: false, // Вимкнути навігаційні кнопки на маленьких екранах
    },
    600: {
      items: 2, // Кількість елементів на екранах шириною від 600px до 999px
      nav: false, // Вимкнути навігаційні кнопки на середніх екранах
    },
    1000: {
      items: 6, // Кількість елементів на екранах шириною 1000px і більше
      nav: false, // Вимкнути навігаційні кнопки на великих екранах
      loop: false, // Вимкнути циклічний режим на великих екранах
    },
  },
});

// Кнопки для першої каруселі
const owl = $(".slide-one");
$(".customNextBtn").click(function () {
  owl.trigger("next.owl.carousel"); // Перехід до наступного слайда
});
$(".customPreviousBtn").click(function () {
  owl.trigger("prev.owl.carousel", [300]); // Перехід до попереднього слайда з тривалістю анімації 300 мс
});

// Друга карусель
$('.slide-two').owlCarousel({
  items: 4,
  stagePadding: 20,
  loop:true,
  margin:32,
  nav:false,
  responsiveClass:true,
  responsive:{
      0:{
          items:1,
          nav:false
      },
      600:{
          items:2,
          nav:false
      },
      1000:{
          items:4,
          nav:false,
          loop:true
      }
  }
})

// Кнопки для другої каруселі
const owlTwo = $('.slide-two');
$('.customNextBtnTwo').click(function() {
  owlTwo.trigger('next.owl.carousel');
 });
 $('.customPreviousBtnTwo').click(function() {
  owlTwo.trigger('prev.owl.carousel', [300]);
});

// Третя карусель
$('.slide-three').owlCarousel({
  items: 4,
  stagePadding: 20,
  loop:true,
  margin:48,
  nav:false,
  responsiveClass:true,
  responsive:{
      0:{
          items:1,
          nav:false
      },
      600:{
          items:2,
          nav:false
      },
      1000:{
          items:4,
          nav:false,
          loop:true
      }
  }
})

// Кнопки для третьої каруселі
const owlThree = $('.slide-three');
$('.customNextBtnThree').click(function() {
  owlThree.trigger('next.owl.carousel');
 });
 $('.customPreviousBtnThree').click(function() {
  owlThree.trigger('prev.owl.carousel', [300]);
});

// Четверта карусель
$('.slide-four').owlCarousel({
  items: 3,
  stagePadding: 20,
  loop:false,
  margin:50,
  nav:false,
  responsiveClass:true,
  responsive:{
      0:{
          items:1,
          nav:false,
          loop:true
      },
      600:{
          items:2,
          nav:false,
          nav:false
      },
      1000:{
          items:3,
          nav:false,
          loop:false
      }
  }
})

// Кнопки для четвертої каруселі
const owlFour = $('.slide-four');
$('.customNextBtnFour').click(function() {
  owlFour.trigger('next.owl.carousel');
 });
 $('.customPreviousBtnFour').click(function() {
  owlFour.trigger('prev.owl.carousel', [300]);
});