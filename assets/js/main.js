const map = L.map('map').setView([49.71932621701262, 35.859606525838416], 14);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

L.marker([49.71932621701262, 35.859606525838416]).addTo(map)
    .bindPopup('Хостел Нова Водолага')

const openModalButtons = document.querySelectorAll('.open-modal');
const modals = document.querySelectorAll('.modal');
const closeButtons = document.querySelectorAll('.modal .close');
const toast = document.getElementById('toast');

function showToast(message, isSuccess) {
    toast.textContent = message;
    toast.className = "show"; // Додаємо клас для відображення
    if (isSuccess) {
        toast.style.backgroundColor = "#28a745"; // Зелений фон для успіху
    } else {
        toast.style.backgroundColor = "#dc3545"; // Червоний фон для помилки
    }
    setTimeout(() => {
        toast.className = toast.className.replace("show", ""); // Приховуємо тост через 3 секунди
    }, 3000);
}


openModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modalId = button.dataset.modal;
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    });
});

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
    });
});

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) { // Перевірка класу
        event.target.style.display = 'none';
    }
};

function validatePhone(phoneInput, phoneError) {
    phoneError.textContent = '';
    const regex = /^(?:\+380|0|380)\d{9}$/;
    if (regex.test(phoneInput.value.replace(/\D/g, ''))) {
        return true;
    } else {
        phoneError.textContent = "Будь ласка, введіть коректний номер телефону у форматі +380XXXXXXXXX або 0XXXXXXXXX";
        return false;
    }
}

function handleFormSubmit(formId, isBookingForm) {
    const form = document.getElementById(formId);
    if (!form) return;

    const nameInputId = isBookingForm ? 'bookingName' : 'name';
    const phoneInputId = isBookingForm ? 'bookingPhone' : 'phone';
    const nameInput = form.querySelector(`#${nameInputId}`);
    const phoneInput = form.querySelector(`#${phoneInputId}`);
    const phoneError = form.querySelector(isBookingForm ? '#booking-phone-error' : '#phone-error'); // Виправляємо селектор помилки
    const modal = form.closest('.modal');
    const roomType = form.querySelector('#roomType');
    const dateFrom = form.querySelector('#date_from');
    const dateTo = form.querySelector('#date_to');

    function clearFormAndCloseModal() {
        form.reset();
        phoneError.textContent = '';
        if (modal) {
            modal.style.display = 'none';
        }
    }

    const closeButton = modal.querySelector('.close');
    if (closeButton) {
        closeButton.addEventListener('click', clearFormAndCloseModal);
    }
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            clearFormAndCloseModal();
        }
    });

    phoneInput.addEventListener('input', (e) => {
        let phone = e.target.value.replace(/\D/g, ''); // Видаляємо всі нецифрові символи
    
        if (phone.startsWith('380')) {
            phone = phone.substring(0, 12); // Максимальна довжина для +380
            let formattedPhone = "+380";
            if (phone.length > 3) formattedPhone += "-" + phone.substring(3, 6);
            if (phone.length > 6) formattedPhone += "-" + phone.substring(6, 9);
            if (phone.length > 9) formattedPhone += "-" + phone.substring(9); // Залишок цифр
            e.target.value = formattedPhone;
        } else if (phone.startsWith('0')) {
            phone = phone.substring(0, 10); // Максимальна довжина для 0
            let formattedPhone = "0";
            if (phone.length > 1) formattedPhone += "-" + phone.substring(1, 4);
            if (phone.length > 4) formattedPhone += "-" + phone.substring(4, 7);
            if (phone.length > 7) formattedPhone += "-" + phone.substring(7); // Залишок цифр
            e.target.value = formattedPhone;
        }
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        if (!validatePhone(phoneInput, phoneError)) return;

        if (!nameInput.value.trim() || !phoneInput.value.trim()) {
            phoneError.textContent = "Будь ласка, заповніть всі поля.";
            return;
        }

        let message = `Ім'я: ${nameInput.value}\r\nТелефон: ${phoneInput.value}`;

        if (isBookingForm) {
            message += `\r\nТип кімнати: ${roomType.value}`;
            message += `\r\nДата з: ${dateFrom.value}\r\nДата по: ${dateTo.value}`;
        }

        
        const CHAT_ID = '-1002473880835'; // Замініть на свій chat ID
        const BOT_TOKEN = '7184836066:AAGq8e3gZPbf8DNbw48sgtTxKfneiXZHTzE'; // Замініть на токен вашого бота
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURI(message)}`;

        fetch(url, { method: 'post' })
            .then(resp => {
              if (!resp.ok) {
                return resp.json().then(err => {throw new Error(`HTTP error ${resp.status}: ${err.description || resp.statusText}`)});
              }
              return resp.json();
            })
            .then(data => {
                showToast('Повідомлення успішно відправлено!', true);
                nameInput.value = '';
                phoneInput.value = '';
                if (isBookingForm) {
                    roomType.selectedIndex = 0;
                    dateFrom.value = '';
                    dateTo.value = '';
                }
                setTimeout(() => {
                    if (modal) {
                        modal.style.display = 'none';
                    }
                }, 100);
            })
    });
}

handleFormSubmit('callbackForm', false);
handleFormSubmit('bookingForm', true);
