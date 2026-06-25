# Gentleman's Room Barbershop

Fullstack-приложение для барбершопа с публичным сайтом, собственной онлайн-записью и защищенной административной панелью.

Проект сделан как коммерческий прототип системы управления барбершопом: клиент выбирает услугу, мастера, дату и свободное время прямо на сайте, а администратор и мастера работают с записями через отдельный кабинет.

## Возможности

- Публичный сайт барбершопа: главная, услуги, мастера, работы, зал и контакты.
- Онлайн-запись без регистрации: клиент указывает имя и телефон.
- Выбор услуги, мастера, даты и доступного времени.
- Расчет свободных слотов с учетом длительности услуги, занятых записей и закрытых периодов.
- Админка по адресу `/admin`, без ссылок из публичной навигации.
- Разные роли входа: администратор и мастер.
- Администратор видит всех мастеров, клиентов, записи и уведомления.
- Мастер видит только свои записи, расписание и уведомления.
- Создание мастеров с анкетой, телефоном, фото и временным паролем.
- Обязательная смена временного пароля при первом входе мастера.
- Смена пароля админа и мастера через защищенную форму.
- Пароли хранятся в базе только в виде hash.
- Перенос, отмена и просмотр записей.
- Закрытие периода от записи: отпуск, личные дела, занятость.
- Уведомления о новых записях.
- Защита базовых тестовых аккаунтов от удаления и смены пароля через `PROTECT_DEFAULT_STAFF`.

## Стек

- Frontend: React, Vite, TypeScript
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Монорепозиторий: npm workspaces

## Структура

```text
apps/
  web/  frontend на React + Vite
  api/  backend на Node.js + Express
```

Основные команды запускаются из корня проекта.

## Быстрый старт

Установить зависимости:

```bash
npm install
```

Создать базу PostgreSQL, например `barbershop`, и указать подключение в `.env` для backend:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/barbershop?schema=public"
ADMIN_PASSWORD="admin123"
ADMIN_TOKEN_SECRET="change-this-secret"
PROTECT_DEFAULT_STAFF=true
PORT=4000
```

Применить миграции и заполнить базу начальными данными:

```bash
npm run prisma:migrate
npm run prisma:seed
```

Запустить frontend и backend вместе:

```bash
npm run dev:all
```

Открыть сайт:

```text
http://localhost:5173
```

Админка:

```text
http://localhost:5173/admin
```

## Команды

Запуск только frontend:

```bash
npm run dev:web
```

Запуск только backend:

```bash
npm run dev:api
```

Запуск frontend и backend:

```bash
npm run dev:all
```

Запуск с доступом к frontend с телефона в одной Wi-Fi сети:

```bash
npm run dev:all:host
```

Проверка кода:

```bash
npm run lint
```

Сборка проекта:

```bash
npm run build
```

Сборка отдельно:

```bash
npm run build:web
npm run build:api
```

## Prisma

Сгенерировать Prisma Client:

```bash
npm run prisma:generate
```

Применить миграции:

```bash
npm run prisma:migrate
```

Заполнить базу начальными данными:

```bash
npm run prisma:seed
```

Создать тестовые записи:

```bash
npm run prisma:seed:appointments
```

Открыть Prisma Studio:

```bash
npm run prisma:studio
```

## Тестовые доступы

Администратор:

```text
Пароль: admin123
```

Мастера:

```text
Пароль: 111111
```

Если включено:

```env
PROTECT_DEFAULT_STAFF=true
```

то базового админа и четырех начальных мастеров нельзя сломать через интерфейс: нельзя сменить им пароль, скрыть или удалить базовых мастеров. Новые мастера, созданные через админку, остаются обычными: их можно тестировать, скрывать и удалять.

## Важно про пароли

Пароли мастеров и администратора не хранятся открытым текстом. В базе сохраняется только hash. Это значит, что пароль нельзя просто посмотреть в базе и узнать обратно.

При создании нового мастера backend генерирует временный пароль. Администратор видит его один раз, копирует и передает мастеру. При первом входе мастер обязан сменить временный пароль на постоянный.

## Backend

Backend по умолчанию запускается на порту:

```text
http://localhost:4000
```

Проверка health endpoint:

```text
GET http://localhost:4000/api/health
```

Frontend в разработке проксирует API-запросы на backend, поэтому обычно достаточно открыть `http://localhost:5173`.

## Деплой

Рекомендуемая схема:

```text
Frontend + Admin: Vercel
Backend API: Render
Database: PostgreSQL
```

### Render: PostgreSQL

1. Создать PostgreSQL database на Render.
2. Скопировать `DATABASE_URL`.
3. Использовать этот URL в backend-сервисе Render.

### Render: Backend API

Создать Web Service из репозитория.

Основные настройки:

```text
Root Directory: .
Runtime: Node
Build Command: npm install && npm run prisma:deploy && npm run prisma:generate && npm run build:api
Start Command: npm run start --workspace @barbershop/api
```

Environment variables:

```env
DATABASE_URL="postgresql://..."
ADMIN_PASSWORD="admin123"
ADMIN_TOKEN_SECRET="long-random-secret"
PROTECT_DEFAULT_STAFF=true
NODE_ENV="production"
```

После первого деплоя можно один раз заполнить базу начальными данными через Render Shell:

```bash
npm run prisma:seed
```

Проверка backend:

```text
https://your-render-api.onrender.com/api/health
```

### Vercel: Frontend + Admin

Frontend уже собирается из `apps/web`.

В Vercel нужно добавить environment variable:

```env
VITE_API_BASE_URL="https://your-render-api.onrender.com"
```

После изменения переменной нужно сделать redeploy frontend.

Публичный сайт и админка будут доступны на Vercel:

```text
https://your-vercel-domain.vercel.app
https://your-vercel-domain.vercel.app/admin
```

Важно: `VITE_API_BASE_URL` подставляется во frontend во время сборки. Если backend URL изменился, нужно обновить переменную на Vercel и пересобрать frontend.
