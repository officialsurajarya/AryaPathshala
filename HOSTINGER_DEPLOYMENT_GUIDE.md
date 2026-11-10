# Arya Pathshala — Hostinger Production Deployment Guide

This guide provides step-by-step instructions for deploying the **Arya Pathshala** full-stack application (React frontend + Express Node.js backend + Prisma ORM + Hostinger MySQL/MariaDB database) on Hostinger.

---

## 1. Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │            HOSTINGER SERVER            │
                      │                                        │
[User Browser] ──────►│  public_html/ (React Static Build)     │
                      │  - index.html, JS/CSS bundles          │
                      │  - .htaccess (LiteSpeed/Apache Rewrite)│
                      │                                        │
                      │  Node.js App (api.aryapathshala.com    │
                      │  or /backend on Node.js port 5000)     │
                      │  - Express REST API                    │
                      │  - Prisma Client ORM                   │
                      │                                        │
                      │  Hostinger MySQL / MariaDB Database    │
                      │  - Database: uXXXXXXXX_aryapathshala   │
                      │  - User: uXXXXXXXX_admin               │
                      └────────────────────────────────────────┘
```

---

## 2. Phase 1 — Create Hostinger MySQL Database

1. Log in to **Hostinger hPanel** (`https://hpanel.hostinger.com`).
2. Navigate to **Databases** > **MySQL Databases**.
3. Create a new database:
   - **MySQL Database Name**: `u123456789_aryapathshala`
   - **MySQL Username**: `u123456789_aryaadmin`
   - **Password**: Create a strong password (e.g. `AryaDbPass#2025!`)
4. Note the connection parameters:
   - **Host**: `127.0.0.1` (or `localhost`)
   - **Port**: `3306`
   - **Database Name**: `u123456789_aryapathshala`
   - **Database User**: `u123456789_aryaadmin`
5. Formulate your **Prisma Connection URL**:
   ```
   mysql://u123456789_aryaadmin:AryaDbPass%232025!@127.0.0.1:3306/u123456789_aryapathshala
   ```
   *(Note: URL-encode special characters like `#` as `%23` or `@` as `%40`)*

---

## 3. Phase 2 — Deploy the Express Backend on Hostinger

### Step 3.1: Enable Node.js in Hostinger
1. In **hPanel**, go to **Advanced** > **Node.js** (or create a subdomain e.g. `api.yourdomain.com`).
2. Click **Create Application**:
   - **Node.js version**: `18.x` or `20.x`
   - **Application mode**: `Production`
   - **Application root**: `backend` (or `public_html/api`)
   - **Application startup file**: `src/server.js`
3. Click **Create**.

### Step 3.2: Upload Backend Files
Upload the following files to the backend application root:
```
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── package.json
└── package-lock.json
```
*(Do NOT upload `node_modules` — they will be installed on the server).*

### Step 3.3: Configure Production Environment Variables
Create a file named `.env` inside the `backend/` folder on Hostinger:
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com

DATABASE_URL="mysql://u123456789_aryaadmin:YourPassword@127.0.0.1:3306/u123456789_aryapathshala"

JWT_SECRET="replace-with-a-64-character-random-hex-string"
JWT_EXPIRE="7d"

EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER="officialaryapathshala@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="Arya Pathshala <officialaryapathshala@gmail.com>"

BCRYPT_ROUNDS=12
```

### Step 3.4: Install Dependencies & Run Database Migrations via SSH
1. In **hPanel**, go to **Advanced** > **SSH Access** and enable SSH.
2. Connect to your server using PuTTY or Terminal:
   ```bash
   ssh -p 65002 u123456789@your-server-ip
   ```
3. Navigate to your backend directory:
   ```bash
   cd ~/domains/yourdomain.com/public_html/api   # (or wherever backend is located)
   ```
4. Install dependencies:
   ```bash
   npm install --production=false
   ```
5. Generate the Prisma Client and deploy the database schema:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
6. Seed the initial Vedic courses, library books, notices, and admin account:
   ```bash
   node prisma/seed.js
   ```
7. In Hostinger hPanel under **Node.js**, click **Restart Application**.
8. Test the health endpoint in your browser:
   `https://api.yourdomain.com/api/health`
   Should return: `{"status":"healthy","project":"Arya Pathshala REST API",...}`

---

## 4. Phase 3 — Build and Deploy Frontend

### Step 4.1: Build with Production API URL
On your local machine or build pipeline, set the production API URL in `.env.production`:
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
```
Run the production build:
```bash
npm run build
```
This generates optimized static files inside `build/`.

### Step 4.2: Upload to `public_html/`
1. In **hPanel**, go to **Files** > **File Manager**.
2. Open the `public_html` directory of your primary domain.
3. Upload all contents of the `build/` folder directly into `public_html/`:
   ```
   public_html/
   ├── static/
   │   ├── css/
   │   └── js/
   ├── images/
   ├── .htaccess
   ├── favicon.ico
   ├── index.html
   ├── logo.png
   └── manifest.json
   ```
4. Verify that `.htaccess` is present in `public_html/` (this ensures page refreshes work and don't trigger 404s).

---

## 5. Phase 4 — Security & SSL Verification

1. In **hPanel**, go to **Security** > **SSL**.
2. Ensure **Lifetime Free SSL** is installed for both:
   - Primary domain (`yourdomain.com`)
   - API subdomain (`api.yourdomain.com`)
3. Enable **Force HTTPS**.
4. Test the website:
   - Open `https://yourdomain.com` in a private browsing window.
   - Verify course enrollment, login, registration, contact inquiry submission, and library downloads.

---

## 6. Phase 5 — Database Backup & Restore

### Backup Database
Via Hostinger hPanel:
1. Go to **Databases** > **phpMyAdmin** > click **Enter phpMyAdmin**.
2. Select `u123456789_aryapathshala` > click **Export** > **Quick** > **Go** (saves `.sql` file).

Via SSH:
```bash
mysqldump -u u123456789_aryaadmin -p u123456789_aryapathshala > arya_backup_$(date +%F).sql
```

### Restore Database
Via phpMyAdmin:
1. Select the database > click **Import** > select your `.sql` file > **Go**.

---

## 7. Rollback Procedures

If an issue occurs during production update:
1. **Frontend Rollback**: Replace files in `public_html/` with the previous zip archive of the `build/` folder.
2. **Backend Rollback**: Run `git checkout <previous_commit_tag>` in the backend directory and restart the Node.js application from hPanel.
3. **Database Rollback**: Restore the SQL backup taken prior to the update.
