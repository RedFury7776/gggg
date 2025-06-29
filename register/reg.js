document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const regUsernameInput = document.getElementById("regUsername");
    const regPasswordInput = document.getElementById("regPassword");
    const regConfirmPasswordInput = document.getElementById("regConfirmPassword");
    const registerMessage = document.getElementById("registerMessage");
    const homeBtn = document.getElementById("homeBtn");
    const loginTab = document.getElementById("loginTab");
    const registerTab = document.getElementById("registerTab");

    // Обробник переходу на головну сторінку
    if (homeBtn) {
        homeBtn.addEventListener("click", () => {
            window.location.href = "../index.html"; // Відносний шлях до index.html з папки register
        });
    }

    // Обробник переходу на вкладку входу
    if (loginTab) {
        loginTab.addEventListener("click", () => {
            window.location.href = "login.html"; // Перехід на login.html в тій же папці
        });
    }

    // Обробник переходу на вкладку реєстрації (для активної кнопки)
    if (registerTab) {
        registerTab.addEventListener("click", () => {
            // Ми вже на сторінці register.html, тому просто переконаємося, що вкладка активна
            registerTab.classList.add("active");
            if (loginTab) loginTab.classList.remove("active");
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault(); // Запобігаємо стандартній відправці форми

            const username = regUsernameInput.value;
            const password = regPasswordInput.value;
            const confirmPassword = regConfirmPasswordInput.value;

            // Прості перевірки
            if (password !== confirmPassword) {
                registerMessage.textContent = "Паролі не співпадають.";
                registerMessage.style.color = "red";
                return;
            }

            // *** ВИПРАВЛЕННЯ ТУТ: Забезпечуємо, що users завжди буде масивом ***
            let users = [];
            try {
                const storedUsers = localStorage.getItem("roboWeatherUsers");
                if (storedUsers) {
                    users = JSON.parse(storedUsers);
                    // Додаткова перевірка: якщо розпарсений об'єкт не є масивом, скидаємо його
                    if (!Array.isArray(users)) {
                        users = [];
                    }
                }
            } catch (error) {
                console.error("Помилка парсингу даних користувачів з localStorage:", error);
                users = []; // У випадку помилки парсингу, ініціалізуємо як порожній масив
            }
            // ***************************************************************

            // Перевіряємо, чи існує користувач з таким ім'ям
            if (users.some(user => user.username === username)) { // Рядок 51
                registerMessage.textContent = "Користувач з таким ім'ям вже існує.";
                registerMessage.style.color = "red";
                return;
            }

            // Додаємо нового користувача
            users.push({ username, password });
            localStorage.setItem("roboWeatherUsers", JSON.stringify(users));

            registerMessage.textContent = "Реєстрація успішна! Перенаправлення на сторінку входу...";
            registerMessage.style.color = "green";

            // Затримка перед перенаправленням на сторінку входу
            setTimeout(() => {
                window.location.href = "login.html"; // Перенаправлення на login.html
            }, 1500);
        });
    } else {
        console.error("Елемент з id 'registerForm' не знайдено на сторінці.");
    }
});