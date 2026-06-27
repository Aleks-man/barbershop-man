# Gentleman's Room Barbershop

Это мой fullstack-проект для барбершопа. Я делал его не как обычный лендинг, а как рабочую систему: публичный сайт, онлайн-запись, личный кабинет администратора и кабинет мастера.

Идея простая: клиент заходит на сайт, выбирает услугу, мастера, дату и свободное время. Регистрация клиенту не нужна, достаточно имени и телефона. Запись сохраняется в базе, админ видит ее в панели, а уведомление о новой записи приходит в Telegram.

## Что уже есть

- Публичный сайт барбершопа: главная, услуги, мастера, работы, зал и контакты.
- Онлайн-запись без сторонних сервисов.
- Выбор услуги, мастера, даты и свободного времени.
- Расчет свободных слотов с учетом длительности услуги, занятых записей и закрытых периодов.
- Админка по адресу `/admin`, без ссылок из публичной навигации.
- Вход по ролям: администратор и мастер.
- Администратор видит всех мастеров, клиентов, записи, расписание и уведомления.
- Мастер видит только свои записи, свое расписание и свои уведомления.
- Создание мастера через админку: анкета, телефон, фото, специализация, опыт, описание.
- Временный пароль для нового мастера и обязательная смена пароля при первом входе.
- Смена пароля админа и мастера через защищенную форму.
- Пароли хранятся только в виде hash.
- Перенос и отмена записей.
- Закрытие периода от записи: отпуск, личные дела, занятость.
- Список клиентов с поиском по имени и телефону.
- Telegram-уведомления админу о новых записях.
- PWA-иконка для добавления сайта на экран телефона.
- Защита базовых тестовых аккаунтов от удаления и смены пароля через `PROTECT_DEFAULT_STAFF`.

## Стек

- Frontend: React, Vite, TypeScript
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Monorepo: npm workspaces
- Deploy: Vercel для frontend/admin, Render для backend и PostgreSQL

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

Создать PostgreSQL базу, например `barbershop`, и добавить `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/barbershop?schema=public"
ADMIN_PASSWORD="admin123"
ADMIN_TOKEN_SECRET="change-this-secret"
CORS_ORIGIN="http://localhost:5173,https://your-vercel-domain.vercel.app"
PROTECT_DEFAULT_STAFF=true
TELEGRAM_BOT_TOKEN=""
ADMIN_TELEGRAM_CHAT_ID=""
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

Запустить только frontend:

```bash
npm run dev:web
```

Запустить только backend:

```bash
npm run dev:api
```

Запустить frontend и backend:

```bash
npm run dev:all
```

Запустить так, чтобы можно было открыть сайт с телефона в одной Wi-Fi сети:

```bash
npm run dev:all:host
```

Проверить код:

```bash
npm run lint
```

Собрать проект:

```bash
npm run build
```

Собрать отдельно frontend или backend:

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

то базового админа и четырех начальных мастеров нельзя случайно сломать через интерфейс: нельзя сменить им пароль, скрыть или удалить базовых мастеров. Новые мастера, созданные через админку, остаются обычными: их можно тестировать, скрывать и удалять.

## Пароли

Пароли админа и мастеров не хранятся открытым текстом. В базе лежит только hash, поэтому пароль нельзя просто посмотреть и узнать обратно.

Когда админ создает нового мастера, backend генерирует временный пароль. Админ видит его один раз, копирует и передает мастеру. При первом входе мастер обязан сменить временный пароль на постоянный.

## Telegram-уведомления

Сейчас подключен минимальный вариант Telegram-уведомлений: при новой записи backend отправляет сообщение админу.

Чтобы это работало, нужно:

1. Создать бота через `@BotFather`.
2. Нажать `Start` в чате с ботом.
3. Узнать свой `chat id`.
4. Добавить в `apps/api/.env`:

```env
TELEGRAM_BOT_TOKEN="token-from-botfather"
ADMIN_TELEGRAM_CHAT_ID="admin-chat-id"
```

На Render эти переменные тоже нужно добавить в Environment Variables backend-сервиса.

Уведомления мастерам пока не подключены. Для этого следующим этапом нужно хранить `telegramChatId` у каждого мастера в базе, добавить привязку Telegram в кабинете мастера или через админку и при создании записи отправлять сообщение не только админу, но и конкретному мастеру.

## Backend

Backend по умолчанию работает на:

```text
http://localhost:4000
```

Health check:

```text
GET http://localhost:4000/api/health
```

Во время разработки frontend проксирует `/api` и `/uploads` на backend, поэтому обычно достаточно открыть `http://localhost:5173`.

## Деплой

Я использую такую схему:

```text
Frontend + Admin: Vercel
Backend API: Render
Database: PostgreSQL
```

### Render: PostgreSQL

1. Создать PostgreSQL database на Render.
2. Скопировать `DATABASE_URL`.
3. Добавить этот URL в Environment Variables backend-сервиса.

### Render: Backend API

Создать Web Service из репозитория.

Настройки:

```text
Root Directory: .
Runtime: Node
Build Command: npm install --include=dev && npm run prisma:deploy && npm run prisma:generate && npm run build:api
Start Command: npm run start --workspace @barbershop/api
```

Environment Variables:

```env
DATABASE_URL="postgresql://..."
ADMIN_PASSWORD="admin123"
ADMIN_TOKEN_SECRET="long-random-secret"
CORS_ORIGIN="https://your-vercel-domain.vercel.app"
PROTECT_DEFAULT_STAFF=true
TELEGRAM_BOT_TOKEN="telegram-bot-token"
ADMIN_TELEGRAM_CHAT_ID="telegram-admin-chat-id"
NODE_ENV="production"
```

После первого деплоя можно один раз заполнить базу через Render Shell:

```bash
npm run prisma:seed
```

Проверить backend:

```text
https://your-render-api.onrender.com/api/health
```

### Vercel: Frontend + Admin

Frontend собирается из `apps/web`.

В Vercel нужно добавить:

```env
VITE_API_BASE_URL="https://your-render-api.onrender.com"
```

После изменения переменной нужно сделать redeploy frontend.

Публичный сайт и админка будут доступны так:

```text
https://your-vercel-domain.vercel.app
https://your-vercel-domain.vercel.app/admin
```

Важно: `VITE_API_BASE_URL` подставляется во frontend во время сборки. Если backend URL изменился, нужно обновить переменную на Vercel и пересобрать frontend.

## Заметки

Проект еще можно развивать дальше: подключить Telegram для мастеров, добавить SMS, расширить статистику, сделать более подробные настройки расписания и историю клиентов. Но базовая система уже работает как цельное приложение: сайт, запись, база, админка, роли и уведомления.
