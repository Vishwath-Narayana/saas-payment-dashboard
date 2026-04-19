# PayDash — SaaS Payment Analytics Dashboard

A full-stack SaaS payment dashboard simulation built for portfolio.
Mimics platforms like Stripe/Razorpay with real-time updates, RBAC, and MongoDB aggregation analytics.

![PayDash](https://img.shields.io/badge/Stack-MERN-indigo)
![License](https://img.shields.io/badge/License-MIT-green)

## Live Demo

- **Frontend:** (saas-payment-dashboard.vercel.app)
- **Backend:** (https://paydash-api.onrender.com](https://saas-payment-dashboard.onrender.com)

### Demo Accounts
| Role  | Email                  | Password |
|-------|------------------------|----------|
| Admin | admin@example.com      | 123456   |
| User  | arjun@example.com      | 123456   |

---

## Features

### User
- Signup / Login with JWT authentication
- Create simulated payments (card / UPI / wallet)
- View personal transaction history
- Filter by status, method, search by amount
- Real-time toast notifications via Socket.IO
- Personal analytics dashboard (revenue, success rate, trends)

### Admin
- View all users and transactions
- System-wide analytics and revenue metrics
- Activity logs with filtering
- Real-time dashboard updates

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, TailwindCSS, shadcn/ui |
| Charts    | Recharts                            |
| State     | TanStack Query (react-query)        |
| Backend   | Node.js, Express 5                  |
| Database  | MongoDB Atlas, Mongoose             |
| Auth      | JWT, httpOnly cookies               |
| Realtime  | Socket.IO                           |
| Deploy    | Vercel (FE), Render (BE)            |

---

## Project Structure
```text
saas-payment-dashboard/
├── client/          # React frontend
│   └── src/
│       ├── api/         # Axios API layer
│       ├── components/  # Reusable UI components
│       ├── context/     # Auth context
│       ├── hooks/       # Custom hooks
│       ├── pages/       # Page components
│       └── utils/       # Helpers
└── server/          # Express backend
    └── src/
        ├── config/      # DB, Socket.IO
        ├── controllers/ # Business logic
        ├── middleware/  # Auth, RBAC, errors
        ├── models/      # Mongoose schemas
        ├── routes/      # API endpoints
        └── utils/       # Helpers
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### 1. Clone
```bash
git clone https://github.com/yourusername/saas-payment-dashboard.git
cd saas-payment-dashboard
```

### 2. Server environment
```bash
cp server/.env.example server/.env
```

Fill in `server/.env`:
```env
PORT=5001
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/saas-dashboard
JWT_SECRET=your-random-32-char-secret-here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Client environment
```bash
cp client/.env.example client/.env
```

`client/.env`:
```env
VITE_API_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001
```

### 4. Install dependencies
```bash
npm install --prefix server
npm install --prefix client
npm install  # root (concurrently)
```

### 5. Seed database
```bash
npm run seed
```

Creates: 1 admin + 5 users + 120 transactions + logs.

### 6. Run
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:5001

---

## API Reference

### Auth
| Method | Endpoint          | Auth     | Description     |
|--------|-------------------|----------|-----------------|
| POST   | /api/auth/signup  | Public   | Create account  |
| POST   | /api/auth/login   | Public   | Login           |
| POST   | /api/auth/logout  | Required | Logout          |
| GET    | /api/auth/me      | Required | Get session     |

### Transactions
| Method | Endpoint                      | Auth       | Description          |
|--------|-------------------------------|------------|----------------------|
| POST   | /api/transactions             | User       | Create transaction   |
| GET    | /api/transactions             | User       | Get own transactions |
| GET    | /api/transactions/:id         | User       | Get single           |
| GET    | /api/transactions/admin/all   | Admin only | Get all              |

### Analytics
| Method | Endpoint                   | Auth       | Description        |
|--------|----------------------------|------------|--------------------|
| GET    | /api/analytics/summary     | Required   | Revenue + counts   |
| GET    | /api/analytics/daily       | Required   | Daily revenue      |
| GET    | /api/analytics/methods     | Required   | Payment breakdown  |
| GET    | /api/analytics/monthly     | Required   | Monthly trends     |
| GET    | /api/analytics/admin-stats | Admin only | User stats         |

### Admin
| Method | Endpoint              | Auth       | Description      |
|--------|-----------------------|------------|------------------|
| GET    | /api/admin/overview   | Admin only | System overview  |
| GET    | /api/admin/users      | Admin only | All users        |
| GET    | /api/admin/users/:id  | Admin only | User detail      |
| GET    | /api/admin/logs       | Admin only | Activity logs    |

---

## Key Engineering Decisions

**JWT in httpOnly cookies** — not localStorage. Prevents XSS token theft.

**Socket.IO with JWT handshake** — authenticated real-time. Every socket connection verifies JWT before joining rooms. Users only receive their own events.

**MongoDB aggregation pipelines** — analytics computed server-side with `$group`, `$match`, `$dateToString`. Not calculated in JS.

**TanStack Query** — handles caching, loading states, background refetch. No manual state management for server data.

**Express 5** — native async error handling. No asyncHandler wrapper needed.

**Compound indexes** — `{ userId: 1, createdAt: -1 }` on transactions. Covers 90% of query patterns.

---

## Screenshots

> Add screenshots after deploy

---

## License

MIT
