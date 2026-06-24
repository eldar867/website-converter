# Website Converter

[![Maintainability](https://qlty.sh/gh/eldar867/projects/website-converter/maintainability.svg)](https://qlty.sh/gh/eldar867/projects/website-converter)

**Fullstack веб-сервис для парсинга и конвертации данных веб-страниц.**  
Приложение позволяет авторизованным пользователям извлекать структурированные данные (заголовки, ссылки, метаданные) с любых сайтов и конвертировать их в форматы **JSON**, **CSV** или **XML**. Результаты сохраняются в облачной базе данных и доступны в личной истории пользователя.

Проект представляет собой адаптацию браузерного расширения (Chrome Extension) в полноценное веб-приложение с системой аутентификации и серверной архитектурой.

---

## Демо

- **Рабочий сайт:** [https://converter-online.vercel.app](https://converter-online.vercel.app)
- **Видео-демонстрация:** [Google Drive](https://drive.google.com/file/d/15pZfyk6xv-ip6pReIc2_ZG6O_Udj8vDf/view?usp=sharing)

### Тестовые данные для входа

| Параметр | Значение |
|----------|----------|
| **Email** | `student@test.com` |
| **Пароль** | `Password123!` |

---

## Стек технологий

### Frontend
- **React 19.2.6** — UI-фреймворк
- **Vite** — сборщик и dev-сервер
- **Axios** — HTTP-клиент для API-запросов
- **React Router** — маршрутизация (страницы `/login` и `/convert`)
- **CSS3** — стилизация с адаптивной версткой

### Backend
- **Vercel Serverless Functions** (Node.js) — бессерверные API-эндпоинты
- **Cheerio** — парсинг HTML-документов
- **bcryptjs** — хэширование паролей
- **jsonwebtoken (JWT)** — аутентификация пользователей

### База данных
- **Neon PostgreSQL** — облачная реляционная СУБД
- **@vercel/postgres** — драйвер для подключения из Serverless Functions

### Инструменты качества кода
- **Qlty.sh (Code Climate)** — автоматический анализ качества кода
- **ESLint** — статический анализ JavaScript

---

## Как запустить локально

### 1. Клонируйте репозиторий
```bash
git clone https://github.com/eldar867/website-converter.git
cd website-converter/frontend
```

### 2. Установите зависимости
```bash
npm install
```

### 3. Настройте переменные окружения
Создайте файл `.env.local` в папке `frontend`:
```env
POSTGRES_URL=postgres://...
JWT_SECRET=your-secret-key
```
> Строку подключения можно получить в [Neon Console](https://console.neon.tech)

### 4. Создайте таблицы в базе данных
Выполните SQL-скрипт из файла `database-schema.sql` в консоли Neon.

### 5. Запустите dev-сервер
```bash
npm run dev
```
Откройте [http://localhost:5173](http://localhost:5173) в браузере.

---

## Структура проекта

```text
website-converter/
├── frontend/
│   ├── api/                      # Backend (Vercel Serverless Functions)
│   │   ├── auth/
│   │   │   ├── register.js       # POST /api/auth/register
│   │   │   └── login.js          # POST /api/auth/login
│   │   ├── convert.js            # POST /api/convert
│   │   └── history.js            # GET /api/history
│   ├── src/
│   │   ├── components/           # React-компоненты
│   │   │   ├── AuthForm.jsx      # Форма входа/регистрации
│   │   │   ├── Header.jsx        # Шапка с кнопкой "Выйти"
│   │   │   ├── ConvertForm.jsx   # Форма конвертации
│   │   │   ├── ResultDisplay.jsx # Отображение результата
│   │   │   └── HistoryPanel.jsx  # Панель истории
│   │   ├── hooks/                # Кастомные React-хуки
│   │   │   ├── useAuth.js        # Управление авторизацией
│   │   │   └── useHistory.js     # Загрузка истории
│   │   ├── App.jsx               # Главный компонент
│   │   └── App.css               # Стили
│   ├── database-schema.sql       # SQL-схема БД
│   ├── vercel.json               # Конфигурация Vercel
│   └── package.json
└── README.md
```

---

## 🔌 API-эндпоинты

| Метод | URL | Назначение |
|-------|-----|------------|
| `POST` | `/api/auth/register` | Регистрация нового пользователя |
| `POST` | `/api/auth/login` | Аутентификация, возврат JWT-токена |
| `POST` | `/api/convert` | Парсинг сайта (требует `Authorization: Bearer <token>`) |
| `GET` | `/api/history` | Получение истории конвертаций пользователя |

### Пример запроса к `/api/convert`:
```bash
curl -X POST https://converter-online.vercel.app/api/convert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ваш_токен>" \
  -d '{"url":"https://example.com","format":"json"}'
```

---

## Безопасность

- Пароли хэшируются через **bcryptjs** (10 раундов)
- JWT-токены со сроком действия 7 дней
- Конфиденциальные данные хранятся в переменных окружения Vercel
- Параметризованные SQL-запросы для защиты от SQL-инъекций
- Валидация входных данных (email, URL, формат)

---

##  Качество кода

Проект интегрирован с **Qlty.sh (Code Climate)** для автоматического анализа качества кода.

| Метрика | Оценка |
|---------|--------|
| **Maintainability** | **A** |
| **Security** | A |
| **Technical Debt** | < 1% |

---

## Лицензия

Учебный проект, разработанный в рамках производственной практики.

---

## Автор

**eldar867** — студент, веб-разработчик  
GitHub: [@eldar867](https://github.com/eldar867)
