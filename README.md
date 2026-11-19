# Furniro – simple e-commerce

React + Vite frontend, Express + **MySQL** backend (raw SQL via `mysql2`, no ORM). Products come from the free [DummyJSON](https://dummyjson.com) API, fetched and cached by the backend. Currency rates come from the free open.er-api.com service.

## 1. Create the database
Run the contents of [`backend/database/schema.sql`](backend/database/schema.sql) in your MySQL client (Workbench, phpMyAdmin, the `mysql>` prompt, ...). It creates the `furniro` database and the `users`, `orders` and `order_items` tables. Use the same file when deploying.

## 2. Configure
```bash
cd backend && cp .env.example .env     # then fill in DB_USER / DB_PASSWORD / DB_NAME / DB_HOST
# frontend/.env -> VITE_API_URL=http://localhost:4010
```

## 3. Run
```bash
cd backend && npm install && npm run dev     # http://localhost:4010
cd frontend && npm install && npm run dev    # http://localhost:5173
```

## Notes
- **Payment:** after checkout the customer lands on a test payment page and presses *"I've made payment"*, which marks the order Paid. No payment gateway is used.
- **Currency:** prices are stored in USD; the header selector converts what is displayed. Each order records the currency and rate used at checkout.
- **Order status:** Pending → Paid (button) → Delivered (automatic, `DELIVERY_DELAY_MINUTES` after payment, since there is no admin).
