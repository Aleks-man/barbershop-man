# Gentleman's Room Barbershop

Fullstack-приложение для сайта барбершопа и собственной системы онлайн-записи.

Проект постепенно развивается из лендинга в рабочую систему управления барбершопом: клиент выбирает услугу, мастера, дату и свободное время прямо на сайте, а администратор и мастера работают с записями через защищенную админку.

## Структура проекта

```text
apps/
  web/  React + Vite frontend
  api/  Node.js + Express backend
```

Корень проекта используется как npm workspace. Основные команды запускаются из корня, чтобы не переходить вручную в `apps/web` или `apps/api`.

## Что уже есть

- клиентская часть на React + Vite;
- backend на Node.js + Express;
- PostgreSQL + Prisma;
- форма онлайн-записи без регистрации;
- расчет доступного времени с учетом мастера, даты, услуги и длительности услуги;
- защищенная страница `/admin`;
- вход администратора и вход мастера;
- администратор видит всех мастеров и записи;
- мастер видит только свои записи и статистику;
- управление мастерами из админки;
- перенос и отмена записей;
- отдельное отображение ожидающих и выполненных записей.

## Команды запуска

Установить зависимости:

```bash
npm install
```

Запустить только frontend:

```bash
npm run dev:web
```

Запустить только backend:

```bash
npm run dev:api
```

Запустить frontend и backend одной командой:

```bash
npm run dev:all
```

Запустить frontend и backend так, чтобы frontend можно было открыть с телефона в той же Wi-Fi сети:

```bash
npm run dev:all:host
```

После этого сайт обычно доступен на компьютере по адресу:

```text
http://localhost:5173
```

С телефона нужно открыть адрес компьютера в локальной сети, например:

```text
http://10.1.30.68:5173
```

Адрес может отличаться. Его Vite показывает в терминале после запуска команды с `host`.

## Проверки и сборка

Проверить код линтером:

```bash
npm run lint
```

Собрать frontend и backend:

```bash
npm run build
```

Собрать только frontend:

```bash
npm run build:web
```

Собрать только backend:

```bash
npm run build:api
```

## Backend и база данных

Backend по умолчанию запускается на порту `4000`.

Проверка backend после запуска:

```text
GET http://localhost:4000/api/health
```

По умолчанию Prisma использует подключение:

```text
postgresql://postgres:postgres@localhost:5432/barbershop?schema=public
```

Для локальной разработки можно создать файл `.env` в корне проекта или в `apps/api` и указать свои значения:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/barbershop?schema=public"
ADMIN_PASSWORD="admin"
ADMIN_TOKEN_SECRET="change-this-local-secret"
PORT=4000
```

## Prisma

Сгенерировать Prisma Client:

```bash
npm run prisma:generate
```

Применить миграции к базе:

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

## Админка

Админка доступна по адресу:

```text
http://localhost:5173/admin
```

Ссылки на нее нет в обычной навигации сайта. Обычные посетители заходят только на публичные страницы и форму записи.

Администратор управляет мастерами, видит все записи и общую загрузку. Мастер входит под своей ролью и видит только свои записи.

