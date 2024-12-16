document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');

    // Переключение вкладок
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(btn => btn.classList.remove('active'));
            contents.forEach(content => content.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    const subTabs = document.querySelectorAll('.sub-tab-button');
    const subContents = document.querySelectorAll('.sub-tab-content');

    // Переключение подкатегорий (Завтрак, Обед, Ужин)
    subTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            subTabs.forEach(btn => btn.classList.remove('active'));
            subContents.forEach(content => content.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.subTab).classList.add('active');
        });
    });

    // Массив для хранения товаров в корзине
    let cart = [];

    // Обработчик для кнопок "Добавить в корзину"
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemName = button.dataset.name;
            const itemPrice = button.dataset.price;

            // Добавление товара в корзину
            cart.push({ name: itemName, price: itemPrice });

            // Обновление отображения корзины
            updateCart();
        });
    });

    // Функция для обновления корзины
    function updateCart() {
        const cartItemsContainer = document.getElementById('cart-items');

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Корзина пуста.</p>';
        } else {
            cartItemsContainer.innerHTML = ''; // Очистка корзины

            // Отображение всех товаров в корзине
            cart.forEach((item, index) => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');
                itemElement.innerHTML = `
                    <p>${item.name} - ${item.price} руб.</p>
                    <button class="remove-from-cart" data-index="${index}">Удалить</button>
                `;
                cartItemsContainer.appendChild(itemElement);
            });

            // Добавление кнопки "Оформить заказ"
            const orderButton = document.createElement('button');
            orderButton.textContent = 'Оформить заказ';
            orderButton.addEventListener('click', () => {
                handleOrder();
            });
            cartItemsContainer.appendChild(orderButton);
        }

        // Добавление обработчиков для кнопок "Удалить"
        const removeButtons = document.querySelectorAll('.remove-from-cart');
        removeButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const index = event.target.dataset.index;
                // Удаление товара из корзины по индексу
                cart.splice(index, 1);

                // Обновление корзины после удаления
                updateCart();
            });
        });
    }

    // Функция для обработки оформления заказа
    function handleOrder() {
        if (cart.length === 0) {
            alert('Корзина пуста! Добавьте товары в корзину.');
            return;
        }

        // Собираем информацию о заказанных товарах
        const orderDetails = cart.map(item => `${item.name} - ${item.price} руб.`).join('\n');

        // Отправка уведомлений в Telegram
        sendOrderNotification(orderDetails);

        // Очистка корзины после оформления
        cart = [];
        updateCart();
    }

    // Функция для отправки уведомлений через Telegram
    function sendTelegramMessage(chatId, message) {
        const TELEGRAM_BOT_TOKEN = '7236324013:AAFu_WXSd_LwyDNDkiqP3Gmu4gMP8Q66oHw';  // Замените на ваш токен
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log('Message sent to Telegram:', data);
            })
            .catch(error => {
                console.error('Error sending message to Telegram:', error);
            });
    }

    // Функция для отправки уведомлений о заказе
    function sendOrderNotification(orderDetails) {
        const chat_id_admin = '1131093139';  // Замените на chat_id администратора
        const chat_id_client = '900577029';  // Замените на chat_id клиента

        const adminMessage = `Новый заказ! \n\nДетали заказа: \n${orderDetails}`;
        const customerMessage = `Ваш заказ принят! \n\nДетали заказа: \n${orderDetails}`;

        // Отправить уведомление админу
        sendTelegramMessage(chat_id_admin, adminMessage);

        // Отправить уведомление клиенту
        sendTelegramMessage(chat_id_client, customerMessage);
    }

    // Обработка отправки формы "Оформление заказа"
    const orderForm = document.getElementById('order-form');
    orderForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Останавливаем отправку формы

        // Получаем данные из формы
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;

        if (name && email && phone) {
            const orderDetails = cart.map(item => `${item.name} - ${item.price} руб.`).join('\n');
            const customerMessage = `Ваш заказ принят! \n\nДетали заказа: \n${orderDetails}\n\nИмя: ${name}\nEmail: ${email}\nТелефон: ${phone}`;
            sendTelegramMessage('CLIENT_CHAT_ID', customerMessage); // Отправляем клиенту

            const adminMessage = `Новый заказ от ${name}! \n\nДетали заказа: \n${orderDetails}\n\nИмя: ${name}\nEmail: ${email}\nТелефон: ${phone}`;
            sendTelegramMessage('ADMIN_CHAT_ID', adminMessage); // Отправляем админу

            // Очищаем корзину после оформления
            cart = [];
            updateCart();
            orderForm.reset();
            alert('Ваш заказ оформлен! Мы свяжемся с вами скоро.');
        } else {
            alert('Пожалуйста, заполните все поля.');
        }
    });
});
