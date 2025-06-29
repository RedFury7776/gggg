const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;

// Функція для визначення типу контенту (MIME-типу) файлу
function getContentType(filePath) {
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };
    return mimeTypes[extname] || 'application/octet-stream';
}

// Створюємо HTTP-сервер
const server = http.createServer((req, res) => {
    let requestUrl = req.url; // Отримуємо запитуваний URL

    // Логування для відладки: показує, який URL запитує браузер
    console.log(`Запит на URL: ${requestUrl}`);

    let filePath;

    // Обробка кореневого URL
    if (requestUrl === '/') {
        filePath = './index.html';
    }
    // Якщо запит на "/register" або "/register.html" або щось з папки register/
    else if (requestUrl.startsWith('/register')) {
        // Якщо запит на саму папку /register, ведемо до /register/register.html
        if (requestUrl === '/register' || requestUrl === '/register/') {
            filePath = './register/register.html';
        }
        // Якщо це запит на файл всередині папки register (наприклад, /register/register.html або /register/reg.js)
        else {
            filePath = '.' + requestUrl; // Шлях вже включає "register/..."
        }
    }
    // Обробка запитів до файлів в корені (style.css, script.js, 404.html)
    else {
        filePath = '.' + requestUrl;
    }

    // Додаткова перевірка для старих посилань на /auth.html
    if (requestUrl === '/auth.html') {
        filePath = './register/register.html'; // Якщо було "/auth.html", ведемо до нової сторінки
    }


    console.log(`Очікуваний шлях файлу: ${filePath}`); // Для відладки

    fs.readFile(filePath, (error, content) => {
        if (error) {
            // Логування для відладки: показує помилку, якщо файл не знайдено
            console.error(`Помилка читання файлу ${filePath}: ${error.code}`);

            if (error.code === 'ENOENT') { // Файл не знайдено
                fs.readFile('./404.html', (error404, content404) => {
                    if (error404) {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('404 Not Found\n');
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(content404, 'utf-8');
                    }
                });
            } else { // Інші помилки сервера
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        } else { // Файл успішно знайдено
            res.writeHead(200, { 'Content-Type': getContentType(filePath) });
            res.end(content, 'utf-8');
        }
    });
});

// Запускаємо сервер і слухаємо запити на вказаному порту
server.listen(port, () => {
    console.log(`Сервер працює за адресою: http://localhost:${port}/`);
    console.log('Натисніть Ctrl+C, щоб зупинити сервер.');
});