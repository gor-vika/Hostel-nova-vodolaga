"use strict";

var map = L.map('map').setView([49.71932621701262, 35.859606525838416], 14);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
L.marker([49.71932621701262, 35.859606525838416]).addTo(map).bindPopup('Хостел Нова Водолага');
var openModalButtons = document.querySelectorAll('.open-modal');
var modals = document.querySelectorAll('.modal');
var closeButtons = document.querySelectorAll('.modal .close');
var toast = document.getElementById('toast');

function showToast(message, isSuccess) {
  toast.textContent = message;
  toast.className = "show"; // Додаємо клас для відображення

  if (isSuccess) {
    toast.style.backgroundColor = "#28a745"; // Зелений фон для успіху
  } else {
    toast.style.backgroundColor = "#dc3545"; // Червоний фон для помилки
  }

  setTimeout(function () {
    toast.className = toast.className.replace("show", ""); // Приховуємо тост через 3 секунди
  }, 3000);
}

openModalButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    var modalId = button.dataset.modal;
    var modal = document.getElementById(modalId);

    if (modal) {
      modal.style.display = 'block';
    }
  });
});
closeButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    var modal = button.closest('.modal');

    if (modal) {
      modal.style.display = 'none';
    }
  });
});

window.onclick = function (event) {
  if (event.target.classList.contains('modal')) {
    // Перевірка класу
    event.target.style.display = 'none';
  }
};

function validatePhone(phoneInput, phoneError) {
  phoneError.textContent = '';
  var regex = /^(?:\+380|0|380)\d{9}$/;

  if (regex.test(phoneInput.value.replace(/\D/g, ''))) {
    return true;
  } else {
    phoneError.textContent = "Будь ласка, введіть коректний номер телефону у форматі +380XXXXXXXXX або 0XXXXXXXXX";
    return false;
  }
}

function handleFormSubmit(formId, isBookingForm) {
  var form = document.getElementById(formId);
  if (!form) return;
  var nameInputId = isBookingForm ? 'bookingName' : 'name';
  var phoneInputId = isBookingForm ? 'bookingPhone' : 'phone';
  var nameInput = form.querySelector("#".concat(nameInputId));
  var phoneInput = form.querySelector("#".concat(phoneInputId));
  var phoneError = form.querySelector(isBookingForm ? '#booking-phone-error' : '#phone-error'); // Виправляємо селектор помилки

  var modal = form.closest('.modal');
  var roomType = form.querySelector('#roomType');
  var dateFrom = form.querySelector('#date_from');
  var dateTo = form.querySelector('#date_to');

  function clearFormAndCloseModal() {
    form.reset();
    phoneError.textContent = '';

    if (modal) {
      modal.style.display = 'none';
    }
  }

  var closeButton = modal.querySelector('.close');

  if (closeButton) {
    closeButton.addEventListener('click', clearFormAndCloseModal);
  }

  window.addEventListener('click', function (event) {
    if (event.target === modal) {
      clearFormAndCloseModal();
    }
  });
  phoneInput.addEventListener('input', function (e) {
    var phone = e.target.value.replace(/\D/g, ''); // Видаляємо всі нецифрові символи

    if (phone.startsWith('380')) {
      phone = phone.substring(0, 12); // Максимальна довжина для +380

      var formattedPhone = "+380";
      if (phone.length > 3) formattedPhone += "-" + phone.substring(3, 6);
      if (phone.length > 6) formattedPhone += "-" + phone.substring(6, 9);
      if (phone.length > 9) formattedPhone += "-" + phone.substring(9); // Залишок цифр

      e.target.value = formattedPhone;
    } else if (phone.startsWith('0')) {
      phone = phone.substring(0, 10); // Максимальна довжина для 0

      var _formattedPhone = "0";
      if (phone.length > 1) _formattedPhone += "-" + phone.substring(1, 4);
      if (phone.length > 4) _formattedPhone += "-" + phone.substring(4, 7);
      if (phone.length > 7) _formattedPhone += "-" + phone.substring(7); // Залишок цифр

      e.target.value = _formattedPhone;
    }
  });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!validatePhone(phoneInput, phoneError)) return;

    if (!nameInput.value.trim() || !phoneInput.value.trim()) {
      phoneError.textContent = "Будь ласка, заповніть всі поля.";
      return;
    }

    var message = "\u0406\u043C'\u044F: ".concat(nameInput.value, "\r\n\u0422\u0435\u043B\u0435\u0444\u043E\u043D: ").concat(phoneInput.value);

    if (isBookingForm) {
      message += "\r\n\u0422\u0438\u043F \u043A\u0456\u043C\u043D\u0430\u0442\u0438: ".concat(roomType.value);
      message += "\r\n\u0414\u0430\u0442\u0430 \u0437: ".concat(dateFrom.value, "\r\n\u0414\u0430\u0442\u0430 \u043F\u043E: ").concat(dateTo.value);
    }

    var CHAT_ID = '-1002473880835'; // Замініть на свій chat ID

    var BOT_TOKEN = '7184836066:AAGq8e3gZPbf8DNbw48sgtTxKfneiXZHTzE'; // Замініть на токен вашого бота

    var url = "https://api.telegram.org/bot".concat(BOT_TOKEN, "/sendMessage?chat_id=").concat(CHAT_ID, "&text=").concat(encodeURI(message));
    fetch(url, {
      method: 'post'
    }).then(function (resp) {
      if (!resp.ok) {
        return resp.json().then(function (err) {
          throw new Error("HTTP error ".concat(resp.status, ": ").concat(err.description || resp.statusText));
        });
      }

      return resp.json();
    }).then(function (data) {
      showToast('Повідомлення успішно відправлено!', true);
      clearFormAndCloseModal();
    })["catch"](function (error) {
      console.error('Fetch error:', error);
      showToast("\u041F\u043E\u043C\u0438\u043B\u043A\u0430 \u0432\u0456\u0434\u043F\u0440\u0430\u0432\u043A\u0438: ".concat(error.message), false);
    });
  });
}

handleFormSubmit('callbackForm', false);
handleFormSubmit('bookingForm', true);