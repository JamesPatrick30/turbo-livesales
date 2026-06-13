<div align="center">

# 🧾 LiveSales

**A real-time order management demo built for speed and clarity.**

![Stack](https://img.shields.io/badge/Frontend-React.js%20%2B%20Vite-61DAFB?style=flat-square&logo=react)
![Stack](https://img.shields.io/badge/Backend-NestJS-E0234E?style=flat-square&logo=nestjs)
![Stack](https://img.shields.io/badge/Monorepo-Turborepo-EF4444?style=flat-square&logo=turborepo)
![Stack](https://img.shields.io/badge/Package%20Manager-pnpm-F69220?style=flat-square&logo=pnpm)
![Stack](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E5A0?style=flat-square&logo=postgresql)
![Status](https://img.shields.io/badge/Status-Demo-yellow?style=flat-square)

> ⚠️ **Demo Project** — LiveSales is scoped as a portfolio demonstration focused on real-time order management. It is not intended for production use.

</div>

---

## 📌 What is LiveSales?

LiveSales is a lightweight, real-time order management system designed to simulate a live sales floor — think a small restaurant or counter-service shop where orders need to flow from cashier to kitchen instantly.

The app is intentionally **scoped down** to keep things clean and focused:

- ✅ Place and manage orders
- ✅ Real-time order status updates via WebSockets
- ✅ Role-based views (Cashier, Cook, Admin)
- ❌ No inventory management
- ❌ No ingredient tracking

---

## 🗂️ Project Structure

This is a **Turborepo monorepo** managed with **pnpm workspaces**.

```
livesales/
├── apps/
│   ├── web/          # React.js + Vite — Customer & Staff Frontend
│   └── api/          # NestJS — REST API + WebSocket Server
├── packages/
│   └── shared/       # Shared types, DTOs, and constants
├── turbo.json        # Turborepo pipeline config
├── pnpm-workspace.yaml
└── package.json
```

---

## 🧰 Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | React.js, Vite, TailwindCSS         |
| Backend      | NestJS, TypeScript                  |
| Real-time    | Socket.IO                           |
| Database     | PostgreSQL via **Neon** *(coming soon)* |
| ORM          | Prisma *(planned)*                  |
| Monorepo     | Turborepo                           |
| Package Mgr  | pnpm                                |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18+
- **pnpm** v8+

```bash
npm install -g pnpm
```

### 1. Clone the repository

```bash
git clone https://github.com/JamesPatrick30/livesales.git
cd livesales
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Copy the example env files for each app:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

> 🔌 **Database:** Neon free-tier PostgreSQL support is coming soon. Once set up, add your `DATABASE_URL` to `apps/api/.env`.

### 4. Run the development servers

```bash
pnpm dev
```

Turborepo will spin up both the frontend and backend in parallel:

| App      | URL                    |
|----------|------------------------|
| Frontend | http://localhost:5173  |
| Backend  | http://localhost:3000  |

---

## 👥 Demo Accounts

The app ships with pre-seeded demo accounts so you can explore each role immediately:

| Role     | Email               | Password   |
|----------|---------------------|------------|
| Admin    | admin@demo.com      | demo1234   |
| Cashier  | cashier@demo.com    | demo1234   |
| Cook     | cook@demo.com       | demo1234   |

> Run `pnpm seed` inside `apps/api/` to populate the database with demo data.

---

## 🔄 Order Flow

```
Cashier places order
        │
        ▼
  Order created (status: PENDING)
        │
        ▼  [Socket.IO broadcast]
        │
        ▼
  Cook receives order on their screen
        │
        ▼
  Cook marks order as PREPARING → READY
        │
        ▼  [Socket.IO broadcast]
        │
        ▼
  Cashier / Admin sees live status update
```

---

## 📡 API Overview

Base URL: `http://localhost:3000/api`

| Method | Endpoint              | Description              | Auth Required |
|--------|-----------------------|--------------------------|---------------|
| POST   | `/auth/login`         | Login and get JWT token  | ❌            |
| GET    | `/orders`             | Fetch all orders         | ✅            |
| POST   | `/orders`             | Create a new order       | ✅ Cashier    |
| PATCH  | `/orders/:id/status`  | Update order status      | ✅ Cook       |
| GET    | `/orders/:id`         | Get a single order       | ✅            |

### WebSocket Events

| Event              | Direction         | Payload              |
|--------------------|-------------------|----------------------|
| `order:created`    | Server → Clients  | New order object     |
| `order:updated`    | Server → Clients  | Updated order object |

---

## 🗺️ Roadmap

- [x] Project scaffold (Turborepo + pnpm)
- [x] NestJS API with authentication
- [x] React frontend with role-based views
- [x] Real-time updates with Socket.IO
- [ ] Connect Neon PostgreSQL (free tier)
- [ ] Prisma schema + seed script
- [ ] Order history view
- [ ] Admin dashboard with basic stats
- [ ] Deploy to Vercel (web) + Railway/Render (api)

---

## 🧑‍💻 Author

**James Patrick** — [@JamesPatrick30](https://github.com/JamesPatrick30)

Portfolio: [patricksnchz.vercel.app](https://patricksnchz.vercel.app)

---

<div align="center">

Built as a portfolio demo · Not for production use

</div>