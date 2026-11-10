# 🕉️ आर्य पाठशाला (Arya Pathshala)

Comprehensive Vedic & Sanskrit Educational Portal — Full-Stack Architecture.

---

## 📁 Project Architecture

The project is cleanly separated into two distinct, decoupled applications:

```text
aryapathshalaCode/
├── client/                     # Frontend Application (React 19, Bootstrap, FontAwesome)
│   ├── public/                 # Static assets, course images, HTML template
│   ├── src/                    # Components, Pages, State, API Client
│   │   ├── api/                # Centralized API client (client.js)
│   │   ├── components/         # Header, Home, Courses, Library, AdminPanel, etc.
│   │   ├── context/            # Authentication Context (AuthContext.js)
│   │   ├── App.js              # Root component
│   │   └── index.js            # React entry
│   ├── .env                    # Client environment (API URL)
│   ├── .env.example            # Client env template
│   ├── package.json            # Frontend-only dependencies
│   └── README.md               # Frontend documentation
│
├── server/                     # Backend API Server (Node.js, Express, Prisma ORM, MySQL)
│   ├── prisma/                 # Database schema (schema.prisma) & seed script (seed.js)
│   ├── src/                    # Express controllers, routes, middleware, utilities
│   │   ├── config/             # Database connection (Prisma client)
│   │   ├── controllers/        # Auth, Courses, Library, Notices, Admin, etc.
│   │   ├── middleware/         # JWT auth, rate limiting, error handling
│   │   ├── routes/             # REST endpoints
│   │   ├── utils/              # JWT, Email, Response helpers
│   │   ├── app.js              # Express app setup & CORS configuration
│   │   └── server.js           # Server listen & lifecycle entry
│   ├── .env                    # Server environment (Database URL, JWT Secret)
│   ├── .env.example            # Server env template
│   ├── package.json            # Backend-only dependencies
│   └── README.md               # Backend API documentation
│
├── .gitignore                  # Monorepo-level gitignore
├── package.json                # Root workspace orchestrator scripts
└── README.md                   # This project guide
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MySQL / MariaDB**: Running locally (e.g. XAMPP, WAMP, or MySQL service) or on Hostinger.

### 2. Configure Environment Files
- **Server**: Check `server/.env` (or copy from `server/.env.example`):
  ```env
  PORT=5000
  DATABASE_URL="mysql://root:password@localhost:3306/aryapathshala"
  JWT_SECRET="your-secure-jwt-secret"
  ```
- **Client**: Check `client/.env` (or copy from `client/.env.example`):
  ```env
  PORT=3000
  REACT_APP_API_URL=http://localhost:5000/api
  ```

---

## 🏃 Running the Application

### Option A: From Root Directory (Recommended)
You can run client and server directly from the root using workspace scripts:

```bash
# Terminal 1 — Start Backend Server (runs on http://localhost:5000)
npm run server

# Terminal 2 — Start Frontend Client (runs on http://localhost:3000)
npm run client
```

### Option B: From Individual Folders

#### Start Server:
```bash
cd server
npm run dev      # or npm start
```

#### Start Client:
```bash
cd client
npm start
```

---

## 🗄️ Database Setup (Prisma + MySQL)

From root directory:
```bash
# Generate Prisma Client
npm run prisma:generate

# Seed 30+ Vedic Courses, Library Books, and Admin Account
npm run prisma:seed

# Launch Prisma Studio (Visual DB GUI)
npm run prisma:studio
```

**Default Test Accounts (from Seed):**
- **Admin**: `admin@aryapathshala.com` / `Admin@Arya2025!`
- **Student**: `student@aryapathshala.com` / `Student@Arya2025!`

---

## 📦 Production Build

```bash
# Build React client for production (creates client/build/)
npm run client:build
```
The generated `client/build/` directory can be deployed as static files directly to Hostinger's `public_html/`.

---

## 🛡️ License
Private project for Arya Pathshala. All rights reserved.
