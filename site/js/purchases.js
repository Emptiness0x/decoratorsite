$.ajax({
  url: "http://zxcmc.fun:3000/purchases",
  type: "GET",
  data: { token: getCookie('token') },
  success: function () {
    const mainElement = document.querySelector("main");
    mainElement.style.visibility = "visible";
    // Якщо запит пройшов успішно, добавляємо отриманий HTML-код в контейнер
    postPurchase("new");
    // Отримуємо всі радіокнопки
    const radios = document.querySelectorAll('input[name="select"]');

    // Прослухуємо подію "change" радіокнопок
    radios.forEach((radio) => {
      radio.addEventListener("change", function () {
        // Отримаємо вибране значення та записуємо як статус замовлень
        const status = this.value;
        // Відправляємо AJAX-запит
        postPurchase(status);
      });
    });
  },
  error: function (jqXHR, textStatus, errorThrown) {
    // Якщо виникла помилка, виводимо повідомлення в консоль
    window.location.href = "/auth";
  },
});

function postPurchase(statusRadioBtn) {
  // Відправляємо AJAX-запит
  $.ajax({
    url: "http://zxcmc.fun:3000/purchase",
    type: "GET",
    data: { status: statusRadioBtn },
    success: function (data) {
      // Якщо запит пройшов успішно, добавляємо отриманий HTML-код в контейнер
      $("#purchase__container").html(data);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // Якщо виникла помилка, виводимо повідомлення в консоль
      console.log("[!] Помилка: " + errorThrown);
    },
  });
}

// Функція для отримання значення cookie за ім'ям
function getCookie(name) {
  const cookieArr = document.cookie.split(';');
  for (let i = 0; i < cookieArr.length; i++) {
    const cookiePair = cookieArr[i].split('=');
    const cookieName = cookiePair[0].trim();
    if (cookieName === name) {
      return decodeURIComponent(cookiePair[1]);
    }
  }
  return null;
}

function deleteOrder(id) {
  if (confirm("Ви дійсно хочете видалити це замовлення?")) {
    fetch("http://zxcmc.fun:3000/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    })
      .then((response) => {
        if (response.status === 200) {
          const orderCard = document.querySelector(`[data-order-id="${id}"]`)
            .parentElement.parentElement;
          orderCard.remove();
        } else {
          return response.json();
        }
      })
      .then((data) => {
        if (data && !data.success) {
          alert(data.error);
        }
      })
      .catch((error) => {
        console.error("[!] Помилка при видалені замовлення:", error);
        alert("[!] Помилка при видалені замовлення!");
      });
  }
}

function doneOrder(id) {
  if (confirm("Це замовлення дійсно виконане?")) {
    fetch("http://zxcmc.fun:3000/done", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    })
      .then((response) => {
        if (response.status === 200) {
          const orderCard = document.querySelector(`[data-order-id="${id}"]`)
            .parentElement.parentElement;
          orderCard.remove();
        } else {
          return response.json();
        }
      })
      .then((data) => {
        if (data && !data.success) {
          alert(data.error);
        }
      })
      .catch((error) => {
        console.error("[!] Помилка при виконані замовлення:", error);
        alert("[!] Помилка при виконані замовлення!");
      });
  }
}
