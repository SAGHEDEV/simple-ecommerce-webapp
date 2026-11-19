# Furniro – simple e-commerce

A small full-stack online shop: browse products, add them to a cart, sign up, check out and view your order history. There is no admin dashboard; product data comes from a free public API.

| Layer    | Tech |
|----------|------|
| Frontend | React 19, TypeScript, Vite, React Router (plain CSS) |
| Backend  | Node.js, Express 5, TypeScript, **MySQL** with raw SQL via `mysql2` (no ORM) |
| Data     | Products from [DummyJSON](https://dummyjson.com) · exchange rates from [open.er-api.com](https://open.er-api.com) (both free, no API key) |

---

## Running it locally

### Prerequisites
- **Node.js 22+** (and npm)
- **MySQL 8+** (or MariaDB 10.5+) running locally or reachable over the network
- Internet access (the backend fetches products and exchange rates)

### 1. Get the code and install dependencies
```bash
git clone <repo-url> simple-e-commerce
cd simple-e-commerce

cd backend  && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Create the database
Run the contents of [`backend/database/schema.sql`](backend/database/schema.sql) in any MySQL client (MySQL Workbench, phpMyAdmin, DBeaver, the `mysql>` prompt…). It creates a database called `furniro` and three tables: `users`, `orders`, `order_items`.

The statements use `IF NOT EXISTS`, so running them twice is harmless. If you want a different database name, change it in the first two statements and in `DB_NAME` below.

### 3. Configure the environment

**Backend** – copy the template and fill in your MySQL details:
```bash
cd backend
cp .env.example .env
```

| Variable | Meaning | Default |
|----------|---------|---------|
| `PORT` | Port the API listens on | `4010` |
| `JWT_SECRET` | Secret used to sign login tokens – **change it** | `change-me` |
| `FRONTEND_URL` | Comma-separated list of allowed frontend origins (CORS). Must match the URL you open in the browser | `http://localhost:5173,http://127.0.0.1:5173` |
| `DB_HOST` / `DB_PORT` | MySQL host and port | `localhost` / `3306` |
| `DB_USER` / `DB_PASSWORD` | MySQL credentials | – |
| `DB_NAME` | Database name | `furniro` |
| `DELIVERY_DELAY_MINUTES` | Minutes after payment before an order becomes "Delivered" | `3` |

**Frontend** – `frontend/.env` (a template is in `frontend/.env.example`):
```
VITE_API_URL=http://localhost:4010
```
This must point to where the backend is running. If you change the backend `PORT`, change it here too. Restart the Vite dev server after editing `.env`.

### 4. Start both servers (two terminals)
```bash
# Terminal 1 – API on http://localhost:4010
cd backend
npm run dev

# Terminal 2 – website on http://localhost:5173
cd frontend
npm run dev
```
Open http://localhost:5173. The first product load takes a few seconds while the backend downloads the catalogue; after that it is cached for an hour.

### Troubleshooting
| Symptom | Likely cause |
|---------|--------------|
| Backend exits with `Could not connect to MySQL (...)` | Wrong `DB_*` values in `backend/.env`, MySQL not running, or the schema hasn't been created |
| Browser shows "Request failed" / CORS error | `VITE_API_URL` is wrong, the backend isn't running, or your browser URL isn't listed in `FRONTEND_URL` |
| Products never appear | The backend can't reach `dummyjson.com` (check your internet/proxy) |
| `Access denied for user` | The MySQL user in `.env` lacks privileges on the `furniro` database |

### Other commands
```bash
# backend
npm run build && npm start      # compile to dist/ and run the compiled server
# frontend
npm run build                   # type-check and produce a production bundle in dist/
npm run lint
```

---

## How the application works

### Storefront
- **Catalogue** – the backend downloads products from DummyJSON, groups them into five categories (Furniture, Home Decor, Kitchen, Clothing, Accessories), and caches them in memory for an hour. The frontend only ever talks to our own API.
- **Search, filter, sort, pagination** – handled by `GET /api/products` using query params (`search`, `category`, `sort`, `page`, `limit`). The shop page keeps these in the URL so links are shareable.
- **Product page** – bigger image gallery, description, rating and stock status (In stock / Only N left / Out of stock).
- **Cart** – a slide-out drawer. It lives in the browser (`localStorage`), so it survives refreshes. Product cards show a clear "In cart" state with a quantity stepper once an item has been added.
- **Currency** – prices are stored and returned in USD. The currency selector in the header converts what you *see* using live rates (cached 12 h; fixed fallback rates if the rates service is down). The chosen currency is remembered in `localStorage`.

### Accounts
- Sign up / sign in with email + password. Passwords are hashed with bcrypt; the server returns a JWT (valid 7 days) which the frontend stores in `localStorage` and sends as `Authorization: Bearer …`.
- Checkout and order history require being signed in; you are redirected to the sign-in page and brought back afterwards.

### Checkout and orders
1. **Place order** – the browser sends only product ids, quantities, shipping details and the chosen currency. The server looks up the real prices and stock itself (it never trusts prices from the browser), computes the total, and saves the order (status **Pending**) with its items in a database transaction. The currency and exchange rate used are stored with the order so history always shows what the customer saw.
2. **Pay** – this project deliberately has no payment gateway. The customer lands on a payment page and presses **"I've made payment"**, which marks the order **Paid**. Orders left unpaid stay Pending and show a "Complete payment" link in the order list.
3. **Deliver** – since there is no admin to ship orders, a Paid order automatically becomes **Delivered** `DELIVERY_DELAY_MINUTES` after payment. This is purely to demonstrate the full Pending → Paid → Delivered lifecycle.
4. **History** – the Orders page lists the signed-in user's orders with items, totals (in the currency used at checkout) and status badges.

### API overview
All routes are under `/api`.

| Method & path | Auth | Purpose |
|---------------|------|---------|
| `GET /categories` | – | Category names |
| `GET /products` | – | List/search/filter/sort/paginate products |
| `GET /products/:id` | – | One product |
| `GET /currencies` | – | Supported currencies and rates (base USD) |
| `POST /auth/signup` · `POST /auth/signin` | – | Create account / log in, returns `{ token, user }` |
| `GET /auth/me` | ✔ | Current user |
| `POST /orders` | ✔ | Create a pending order |
| `GET /orders` · `GET /orders/:id` | ✔ | Your orders |
| `POST /orders/:id/pay` | ✔ | Confirm payment (marks the order Paid) |

---

## Project structure

```
backend/
├── database/schema.sql        # MySQL schema (run this to set up the DB)
├── .env.example               # environment template
└── src/
    ├── server.ts              # checks the DB connection, starts the HTTP server
    ├── app.ts                 # Express setup: CORS, JSON, routes, error handling
    ├── config/                # env.ts (settings), db.ts (MySQL pool + query helpers)
    ├── routes/                # URL → controller mapping
    ├── controllers/           # read the request, call a service, send the response
    ├── services/              # business logic: products, auth, orders, currency
    ├── middleware/            # auth (JWT guard), error handling
    ├── validators/            # zod request schemas
    └── utils/httpError.ts     # errors that map to HTTP status codes

frontend/
├── .env.example               # VITE_API_URL
└── src/
    ├── main.tsx · App.tsx     # entry point and route table
    ├── api.ts                 # fetch wrapper (adds token, uses VITE_API_URL) + money formatting
    ├── store.tsx              # auth, cart and currency state (React context)
    ├── components/            # Layout (header/footer), CartDrawer, ProductCard, Banner, icons
    └── pages/                 # Home, Shop, ProductPage, Auth, Checkout, Pay, OrderConfirm, Orders
```

**Request flow:** React page → `api()` → Express route → controller → service → `config/db.ts` (raw SQL with `?` placeholders, so values are always parameterised) → MySQL. Errors thrown in services as `HttpError` are turned into JSON `{ "error": "..." }` responses by a single error handler.

---

## Deploying
1. Run `backend/database/schema.sql` on your production MySQL server.
2. Backend: set the env vars from the table above (use a strong `JWT_SECRET`, set `FRONTEND_URL` to your site's origin), then `npm run build && npm start`.
3. Frontend: set `VITE_API_URL` to the public backend URL, run `npm run build` and serve `frontend/dist/` from any static host.
