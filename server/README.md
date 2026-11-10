# Arya Pathshala — Server API Documentation

A production-ready REST API for the **Arya Pathshala** platform built with Node.js, Express.js, Prisma ORM, and MySQL/MariaDB (optimized for Hostinger).

---

## 1. Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **ORM**: Prisma ORM
- **Database**: MySQL / MariaDB (Hostinger-ready)
- **Authentication**: JWT & bcryptjs
- **Security**: Helmet, CORS, Express-Rate-Limit

---

## 2. Environment Variables

Create `.env` inside `server/` from `.env.example`:

```bash
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Hostinger MySQL Database URL format:
# mysql://<db_user>:<db_password>@127.0.0.1:3306/<db_name>
DATABASE_URL="mysql://root:root@localhost:3306/aryapathshala"

JWT_SECRET="replace-with-a-secure-random-64-character-string"
JWT_EXPIRE="7d"

EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER="officialaryapathshala@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="Arya Pathshala <officialaryapathshala@gmail.com>"
```

---

## 3. Database Migration & Seeding

### 3.1 Install Dependencies
```bash
cd server
npm install
```

### 3.2 Generate Prisma Client
```bash
npm run prisma:generate
```

### 3.3 Run Database Migrations
For local development:
```bash
npx prisma migrate dev --name init
```

For production (Hostinger):
```bash
npx prisma migrate deploy
```

### 3.4 Seed Initial Data (30+ Vedic Courses, Library Books, Admin Account)
```bash
npm run prisma:seed
```

**Default Seed Credentials:**
- **Admin**: `admin@aryapathshala.com` / `Admin@Arya2025!`
- **Student**: `student@aryapathshala.com` / `Student@Arya2025!`

---

## 4. API Endpoints

### 4.1 Health Check
- `GET /api/health` — Status and database provider

### 4.2 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register student account
- `POST /api/auth/login` — Login with email and password
- `POST /api/auth/verify-email` — Verify account with email token
- `POST /api/auth/forgot-password` — Request password reset email
- `POST /api/auth/reset-password` — Reset password using token
- `GET /api/auth/profile` — Get authenticated user details & enrollments (Bearer Token)
- `PUT /api/auth/profile` — Update name, phone, or avatar
- `PUT /api/auth/change-password` — Change password
- `POST /api/auth/logout` — Invalidate session

### 4.3 Courses (`/api/courses`)
- `GET /api/courses` — List courses (filter by `category`, `search`, `page`, `limit`)
- `GET /api/courses/categories` — Get 8 canonical categories
- `GET /api/courses/:slug` — Get single course details

### 4.4 Library (`/api/library`)
- `GET /api/library` — List books and research papers
- `GET /api/library/:id` — Get book details
- `POST /api/library/:id/download` — Increment download counter
- `POST /api/library/:id/view` — Increment view counter

### 4.5 Notifications (`/api/notices`)
- `GET /api/notices` — List announcements & alerts
- `POST /api/notices` — Create notice (Admin only)
- `DELETE /api/notices/:id` — Delete notice (Admin only)

### 4.6 Contact Inquiries (`/api/contact`)
- `POST /api/contact` — Submit inquiry message (Stored directly in database)
- `GET /api/contact` — View messages (Admin only)
- `PUT /api/contact/:id/status` — Update inquiry status (Admin only)

### 4.7 Course Enrollments (`/api/enrollments`)
- `POST /api/enrollments/enroll` — Enroll authenticated user into a course
- `GET /api/enrollments/my-courses` — View my enrolled courses and progress
- `PUT /api/enrollments/progress` — Update course completion percentage

### 4.8 Admin Operations (`/api/admin`)
- `GET /api/admin/stats` — System analytics overview
- `GET /api/admin/users` — User list with role filtering
- `PUT /api/admin/users/:id/role` — Promote/demote user role (STUDENT, TEACHER, ADMIN)
- `DELETE /api/admin/users/:id` — Delete user account
