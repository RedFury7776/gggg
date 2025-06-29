    document.addEventListener("DOMContentLoaded", () => {
        // --- Функція для створення сніжинок ---
        function createSnowflakes(count = 50) {
            // Видаляємо існуючі сніжинки, щоб уникнути дублювання при повторному виклику
            document.querySelectorAll('.snowflake').forEach(s => s.remove());

            for (let i = 0; i < count; i++) {
                const snowflake = document.createElement("div");
                snowflake.classList.add("snowflake");

                const size = Math.random() * 10 + 5; // Розмір сніжинки від 5px до 15px
                snowflake.style.width = `${size}px`;
                snowflake.style.height = `${size}px`;
                snowflake.style.left = `${Math.random() * 100}vw`; // Випадкова горизонтальна позиція
                snowflake.style.top = `${Math.random() * -20}vh`; // Починаються трохи вище екрану

                const animationDuration = Math.random() * 10 + 5; // Тривалість анімації від 5s до 15s
                snowflake.style.animationDuration = `${animationDuration}s`;

                const animationDelay = Math.random() * 10; // Затримка перед початком анімації
                snowflake.style.animationDelay = `${animationDelay}s`;

                document.body.appendChild(snowflake);
            }
        }
        createSnowflakes(); // Викликаємо функцію створення сніжинок при завантаженні DOM


        const apiKey = "38849e94be1447e3b65133101253005"; // Ваш API ключ

        const getWeather = (city, days) => {
            // Формуємо URL для запиту до WeatherAPI
            const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=${days}&aqi=no&alerts=no`;

            fetch(apiUrl)
                .then(response => {
                    // Перевіряємо, чи успішний запит (статус 200)
                    if (!response.ok) {
                        throw new Error("Місто не знайдено"); // Генеруємо помилку, якщо місто не знайдено
                    }
                    return response.json(); // Парсимо відповідь у форматі JSON
                })
                .then(data => {
                    // Оновлюємо відображення назви поточного міста
                    document.getElementById("currentCityDisplay").textContent = data.location.name;

                    // Оновлення мапи відповідно до координат отриманого міста
                    const lat = data.location.lat;
                    const lon = data.location.lon;
                    const mapFrame = document.querySelector(".map-wrapper iframe");
                    const delta = 0.05; // Дельта для збільшення області відображення на карті
                    if (mapFrame) { // Перевірка на існування елемента, бо він може бути неактивним
                        mapFrame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - delta}%2C${lat - delta}%2C${lon + delta}%2C${lat + delta}&amp;layer=mapnik`;
                    }


                    const forecastDiv = document.getElementById("forecast");
                    forecastDiv.innerHTML = ""; // Очищаємо попередній прогноз перед додаванням нового

                    // Перебираємо прогноз погоди для кожного дня
                    data.forecast.forecastday.forEach(day => {
                        const date = new Date(day.date);
                        // Форматуємо дату для відображення
                        const options = { weekday: "short", day: "numeric", month: "short" };
                        const formattedDate = date.toLocaleDateString("uk-UA", options);

                        // Створюємо елемент для відображення прогнозу на один день
                        const dayBlock = document.createElement("div");
                        dayBlock.className = "day-forecast"; // Застосовуємо CSS клас для стилізації

                        // Заповнюємо dayBlock даними про погоду
                        dayBlock.innerHTML = `
                            <div class="day-date">${formattedDate}</div>
                            <img class="day-icon" src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" />
                            <div class="day-temp">
                                <div>Макс: ${day.day.maxtemp_c}°C</div>
                                <div>Мін: ${day.day.mintemp_c}°C</div>
                                <div>${day.day.condition.text}</div>
                            </div>
                        `;

                        forecastDiv.appendChild(dayBlock); // Додаємо блок дня до контейнера прогнозу
                    });
                })
                .catch(error => {
                    // Обробка помилок (наприклад, якщо API ключ недійсний або місто не знайдено)
                    alert("Помилка: " + error.message);
                    console.error(error);
                });
        };

        // --- Логіка для навігаційного меню ---
        const navButtons = document.querySelectorAll(".nav-item");
        const sections = document.querySelectorAll(".content-section");

        // Функція для активації потрібної секції контенту
        const activateSection = (sectionId) => {
            sections.forEach(section => section.classList.add("hidden")); // Приховуємо всі секції
            document.getElementById(sectionId).classList.remove("hidden"); // Показуємо потрібну секцію
        };

        navButtons.forEach(button => {
            button.addEventListener("click", () => {
                // Знімаємо активний клас з усіх кнопок навігації
                navButtons.forEach(btn => btn.classList.remove("active"));
                button.classList.add("active"); // Додаємо активний клас до натиснутої кнопки

                const targetSectionId = button.dataset.section + "-section"; // Визначаємо ID секції для активації
                activateSection(targetSectionId); // Активація секції

                // Якщо переходимо на вкладку "Збережені локації", оновлюємо їх список
                if (button.dataset.section === "saved-locations") {
                    displaySavedLocations();
                }
            });
        });

        // --- Функціонал збережених локацій ---
        // Змінено: ключ для localStorage тепер залежить від імені користувача
        const getUserSavedLocationsKey = (username) => `roboWeatherSavedLocations_${username}`;
        const savedLocationsList = document.getElementById("savedLocationsList");
        const noLocationsMessage = document.querySelector(".no-locations-message");
        const saveLocationBtn = document.getElementById("saveLocationBtn");

        // Функція для отримання збережених локацій поточного користувача з localStorage
        const getSavedLocations = () => {
            const username = localStorage.getItem("roboWeatherUsername");
            if (!username) {
                return []; // Якщо користувач не увійшов, повертаємо порожній масив
            }
            const locationsString = localStorage.getItem(getUserSavedLocationsKey(username));
            return locationsString ? JSON.parse(locationsString) : [];
        };

        // Функція для збереження локацій поточного користувача у localStorage
        const saveLocations = (locations) => {
            const username = localStorage.getItem("roboWeatherUsername");
            if (username) {
                localStorage.setItem(getUserSavedLocationsKey(username), JSON.stringify(locations));
                displaySavedLocations(); // Оновлюємо відображення після збереження
            }
        };

        // Функція для відображення збережених локацій в інтерфейсі
        const displaySavedLocations = () => {
            const locations = getSavedLocations();
            savedLocationsList.innerHTML = ""; // Очищаємо список перед додаванням нових елементів

            if (locations.length === 0) {
                noLocationsMessage.style.display = "block"; // Показуємо повідомлення, якщо локацій немає
            } else {
                noLocationsMessage.style.display = "none"; // Приховуємо повідомлення
                locations.forEach(location => {
                    const locationItem = document.createElement("div");
                    locationItem.className = "saved-location-item";
                    locationItem.innerHTML = `
                        <span class="location-name">${location}</span>
                        <button class="remove-location-btn" data-location="${location}">Видалити</button>
                    `;
                    savedLocationsList.appendChild(locationItem);
                });
            }
        };

        // Обробник натискання кнопки "Зберегти локацію"
        if (saveLocationBtn) { // Перевірка на існування елемента
            saveLocationBtn.addEventListener("click", () => {
                const isLoggedIn = localStorage.getItem("roboWeatherUserLoggedIn") === "true";
                if (!isLoggedIn) {
                    alert("Будь ласка, увійдіть або зареєструйтесь, щоб зберігати локації.");
                    window.location.href = "register/login.html"; // Перенаправлення на сторінку входу
                    return;
                }

                const cityToSave = document.getElementById("cityInput").value.trim();
                if (cityToSave === "") {
                    alert("Будь ласка, введіть місто, щоб зберегти його.");
                    return;
                }

                let locations = getSavedLocations();
                if (!locations.includes(cityToSave)) { // Перевіряємо, чи місто вже не збережено
                    locations.push(cityToSave); // Додаємо нове місто
                    saveLocations(locations); // Зберігаємо оновлений список
                    alert(`Місто "${cityToSave}" збережено!`);
                } else {
                    alert(`Місто "${cityToSave}" вже збережено.`);
                }
            });
        }


        // Обробник кліків на списку збережених локацій (для вибору або видалення)
        if (savedLocationsList) { // Перевірка на існування елемента
            savedLocationsList.addEventListener("click", (event) => {
                if (event.target.classList.contains("location-name")) {
                    // Якщо клікнули на назву локації, встановлюємо її в поле вводу та отримуємо погоду
                    const city = event.target.textContent;
                    document.getElementById("cityInput").value = city;
                    document.querySelector('.nav-item[data-section="weather"]').click(); // Переключаємо на вкладку "Прогноз"
                    document.getElementById("getWeatherBtn").click(); // Ініціюємо запит погоди
                } else if (event.target.classList.contains("remove-location-btn")) {
                    // Якщо клікнули на кнопку "Видалити", видаляємо локацію
                    const cityToRemove = event.target.dataset.location;
                    let locations = getSavedLocations();
                    locations = locations.filter(loc => loc !== cityToRemove); // Фільтруємо масив, залишаючи всі, крім видаленого
                    saveLocations(locations); // Зберігаємо оновлений список
                    alert(`Місто "${cityToRemove}" видалено.`);
                }
            });
        }

        // --- Функціонал входу/виходу для головної сторінки ---
        const userLoggedInKey = "roboWeatherUserLoggedIn"; // Ключ для статусу входу
        const usernameKey = "roboWeatherUsername"; // Ключ для імені користувача
        const justLoggedInFlag = "justLoggedIn"; // Прапорець для перевірки, чи користувач тільки що увійшов

        const loginRegisterBtn = document.getElementById("loginRegisterBtn");
        const userGreeting = document.getElementById("userGreeting");
        const usernameDisplay = document.getElementById("usernameDisplay");
        const logoutBtn = document.getElementById("logoutBtn");

        const navWeather = document.querySelector('.nav-item[data-section="weather"]');
        const navSavedLocations = document.querySelector('.nav-item[data-section="saved-locations"]');


        // Функція для оновлення елементів інтерфейсу залежно від статусу входу
        const updateMainUI = () => {
            const isLoggedIn = localStorage.getItem(userLoggedInKey) === "true"; // Перевіряємо статус входу
            const username = localStorage.getItem(usernameKey); // Отримуємо ім'я користувача

            if (isLoggedIn) {
                if (loginRegisterBtn) loginRegisterBtn.classList.add("hidden");
                if (userGreeting) userGreeting.classList.remove("hidden");
                if (usernameDisplay) usernameDisplay.textContent = username;

                if (navSavedLocations) navSavedLocations.classList.remove("hidden");
                if (saveLocationBtn) saveLocationBtn.classList.remove("hidden");

                // Завантажуємо погоду, якщо місто "Київ" (дефолт) або якщо користувач тільки що увійшов
                if (localStorage.getItem(justLoggedInFlag) === "true" || document.getElementById("currentCityDisplay").textContent === "Київ") {
                    getWeather("Kyiv", document.getElementById("daysSelect").value);
                    localStorage.removeItem(justLoggedInFlag); // Видаляємо прапорець після завантаження погоди
                }

            } else {
                if (loginRegisterBtn) loginRegisterBtn.classList.remove("hidden");
                if (userGreeting) userGreeting.classList.add("hidden");

                if (navSavedLocations) navSavedLocations.classList.add("hidden");
                if (saveLocationBtn) saveLocationBtn.classList.add("hidden");

                // Якщо користувач вийшов і був на вкладці "Збережені локації", переключаємо на "Прогноз"
                if (document.getElementById("saved-locations-section") && document.getElementById("saved-locations-section").classList.contains("active")) {
                    activateSection("weather-section");
                    if (navSavedLocations) navSavedLocations.classList.remove("active");
                    if (navWeather) navWeather.classList.add("active");
                }

                // Очищаємо список збережених локацій при виході
                if (savedLocationsList) savedLocationsList.innerHTML = "";
                if (noLocationsMessage) noLocationsMessage.style.display = "block";
            }
        };

        // Обробник натискання кнопки "Вийти"
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                localStorage.removeItem(userLoggedInKey); // Видаляємо статус входу
                localStorage.removeItem(usernameKey); // Видаляємо ім'я користувача
                updateMainUI(); // Оновлюємо UI після виходу
                alert("Ви успішно вийшли з акаунта.");
            });
        }

        // Обробник натискання кнопки "Увійти" / "Зареєструватися"
        if (loginRegisterBtn) {
            loginRegisterBtn.addEventListener("click", () => {
                // Перенаправлення на сторінку входу
                window.location.href = "register/login.html"; // Відносний шлях з index.html до login.html
            });
        }


        // Автоматично завантажуємо погоду для Києва при першому завантаженні або якщо місто не визначене
        const cityInput = document.getElementById("cityInput");
        if (cityInput) {
            // Перевіряємо, чи є вже збережене місто або якщо поле порожнє, встановлюємо "Kyiv"
            if (!cityInput.value || localStorage.getItem("currentCity") === null) {
                cityInput.value = "Kyiv"; // Встановлюємо Kyiv як дефолтне місто
                localStorage.setItem("currentCity", "Kyiv");
                getWeather("Kyiv", document.getElementById("daysSelect").value);
            } else {
                // Якщо місто вже є в localStorage, завантажуємо погоду для нього
                cityInput.value = localStorage.getItem("currentCity");
                getWeather(localStorage.getItem("currentCity"), document.getElementById("daysSelect").value);
            }
        }
        updateMainUI(); // Перше оновлення UI при завантаженні сторінки

        // --- Логіка перемикання тем ---
        const body = document.body;
        const themeToggle = document.getElementById("themeToggle");

        const setTheme = (isDark) => {
            if (isDark) {
                body.classList.add("dark-theme");
                localStorage.setItem("theme", "dark");
            } else {
                body.classList.remove("dark-theme");
                localStorage.setItem("theme", "light");
            }
        };

        // Обробник натискання на перемикач теми
        if (themeToggle) {
            themeToggle.addEventListener("click", () => {
                const currentThemeIsDark = body.classList.contains("dark-theme");
                setTheme(!currentThemeIsDark); // Переключаємо тему на протилежну
            });
        }

        // Встановлюємо тему при завантаженні сторінки з localStorage
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setTheme(true);
        } else {
            setTheme(false);
        }

        // Обробник натискання кнопки "Отримати погоду"
        const getWeatherBtn = document.getElementById("getWeatherBtn");
        if (getWeatherBtn) {
            getWeatherBtn.addEventListener("click", () => {
                const cityValue = document.getElementById("cityInput").value.trim();
                const daysSelect = document.getElementById("daysSelect").value;
                if (cityValue) {
                    getWeather(cityValue, daysSelect);
                    localStorage.setItem("currentCity", cityValue); // Зберігаємо останнє шукане місто
                } else {
                    alert("Будь ласка, введіть назву міста.");
                }
            });
        }
    });