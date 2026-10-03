# RaiderOk - Delivery App MVP

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- npm or yarn

### Start with Docker

```bash
docker-compose up -d
```

API будет доступен на `http://localhost:3000`

### Local Development

```bash
cd backend
npm install
npm run start:dev
```

## API Endpoints

### Auth
- `POST /auth/register` - Регистрация по номеру телефона
- `POST /auth/verify-otp` - Подтверждение кода и вход

### Orders
- `POST /orders` - ��оздать заказ
- `GET /orders` - Получить все открытые заказы
- `GET /orders/customer/my-orders` - Мои заказы
- `GET /orders/:id` - Детали заказа
- `PATCH /orders/:id/status` - Обновить статус
- `POST /orders/:id/select-courier` - Выбрать курьера
- `POST /orders/:id/complete` - Завершить заказ

### Couriers
- `POST /couriers/apply` - Стать курьером
- `GET /couriers/applications/pending` - Заявки (админ)
- `POST /couriers/applications/:id/approve` - Одобрить заявку
- `POST /couriers/applications/:id/reject` - Отклонить заявку

### Offers
- `POST /offers` - Сделать предложение
- `GET /offers/order/:orderId` - Предложения по заказу
- `GET /offers/courier/my-offers` - Мои предложения

### Reviews
- `POST /reviews` - Оставить отзыв
- `GET /reviews/user/:userId` - Отзывы пользователя
- `POST /reviews/complaints` - Пожаловаться на отзыв

### Support
- `POST /support/ticket` - Создать обращение
- `GET /support/tickets` - Все обращения (модератор)
- `POST /support/tickets/:id/resolve` - Разрешить обращение

### Admin
- `GET /admin/dashboard` - Админ-панель
- `GET /admin/logs` - Журнал действий

## Super Admin

Номер: `+380938926388`

## Roles

- `customer` - Заказчик
- `courier` - Курьер
- `moderator` - Модератор
- `admin` - Администратор
- `super_admin` - Главный администратор

## Database

PostgreSQL запускается в Docker. Данные хранятся в томе `postgres_data`.

## Deployment

Для продакшена:
1. Измени переменные окружения в `docker-compose.yml`
2. Используй production Dockerfile
3. Настрой SMS-провайдера (Twilio, SMSAero и т.д.)
4. Включи HTTPS
5. Настрой reverse proxy (nginx)

