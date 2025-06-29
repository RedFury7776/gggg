document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const loginUsernameInput = document.getElementById("loginUsername");
    const loginPasswordInput = document.getElementById("loginPassword");
    const loginMessage = document.getElementById("loginMessage");
    const homeBtn = document.getElementById("homeBtn");
    const registerTab = document.getElementById("registerTab"); // Для перемикання вкладок
    const loginTab = document.getElementById("loginTab"); // Для перемикання вкладок

    // Обробник переходу на головну сторінку
    if (homeBtn) {
        homeBtn.addEventListener("click", () => {
            window.location.href = "../index.html"; // Відносний шлях до index.html з папки register
        });
    }

    // Обробник переходу на вкладку реєстрації
    if (registerTab) {
        registerTab.addEventListener("click", () => {
            window.location.href = "register.html"; // Перехід на register.html в тій же папці
        });
    }

    // Обробник переходу на вкладку входу (для активної кнопки)
    if (loginTab) {
        loginTab.addEventListener("click", () => {
            // Ми вже на сторінці login.html, тому просто переконаємося, що вкладка активна
            loginTab.classList.add("active");
            if (registerTab) registerTab.classList.remove("active");
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault(); // Запобігаємо стандартній відправці форми

            const username = loginUsernameInput.value;
            const password = loginPasswordInput.value;

            // Отримуємо зареєстрованих користувачів з localStorage
            const users = JSON.parse(localStorage.getItem("roboWeatherUsers")) || [];

            // Шукаємо користувача за іменем
            const user = users.find(u => u.username === username);

            if (user && user.password === password) {
                // Успішний вхід
                localStorage.setItem("roboWeatherUserLoggedIn", "true"); // Встановлюємо статус входу
                localStorage.setItem("roboWeatherUsername", username); // Зберігаємо ім'я користувача
                localStorage.setItem("justLoggedIn", "true"); // Встановлюємо прапорець, що користувач тільки що увійшов
                loginMessage.textContent = "Вхід успішний! Перенаправлення...";
                loginMessage.style.color = "green";
                // Затримка перед перенаправленням на головну сторінку
                setTimeout(() => {
                    window.location.href = "../index.html"; // Відносний шлях до index.html
                }, 1000);
            } else {
                // Невдалий вхід
                loginMessage.textContent = "Невірне ім'я користувача або пароль.";
                loginMessage.style.color = "red";
            }
        });
    }
});