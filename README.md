# Barbershop

Fullstack-приложение для сайта и системы онлайн-записи барбершопа.

## Структура

```text
apps/
  web/  React + Vite клиентская часть
  api/  Node.js + Express API
```

Корень проекта используется как npm workspace и хранит общие команды.

## Команды

```bash
npm run dev:web
npm run dev:api
npm run build
npm run lint
```

API healthcheck после запуска бэкенда:

```text
GET http://localhost:4000/api/health
```
