# 🕉️ आर्य पाठशाला — Hostinger Production Deployment Guide
*(Complete Step-by-Step Deployment Manual for Hostinger hPanel & VPS)*

---

## 📌 विषय-सूची (Table of Contents)
1. [वास्तुकला एवं अवलोकन (Architecture Overview)](#1-वास्तुकला-एवं-अवलोकन-architecture-overview)
2. [चरण 1: Hostinger MySQL डेटाबेस सेटअप (Database Setup)](#2-चरण-1-hostinger-mysql-डेटाबेस-सेटअप)
3. [चरण 2: बैकएंड डिप्लॉयमेंट (Express + Prisma + Node.js)](#3-चरण-2-बैकएंड-डिप्लॉयमेंट-express--prisma)
   - [विकल्प A: Hostinger hPanel (Cloud / Business Hosting)](#विकल्प-a-hostinger-hpanel-के-माध्यम-से-nodejs-ऐप)
   - [विकल्प B: Hostinger VPS (Ubuntu + Nginx + PM2)](#विकल्प-b-hostinger-vps-सर्वर-के-माध्यम-से)
4. [चरण 3: फ्रंटएंड बिल्ड एवं अपलोड (React Build Deployment)](#4-चरण-3-फ्रंटएंड-बिल्ड-एवं-अपलोड)
5. [चरण 4: SSL (HTTPS) एवं डोमेन कॉन्फ़िगरेशन](#5-चरण-4-ssl-https-एवं-डोमेन-कॉन्फ़िगरेशन)
6. [चरण 5: समस्या निवारण एवं टिप्स (Troubleshooting FAQ)](#6-चरण-5-समस्या-निवारण-एवं-टिप्स)

---

## 1. वास्तुकला एवं अवलोकन (Architecture Overview)

```
                            ┌───────────────────────────────────────────────┐
                            │               HOSTINGER SERVER                │
                            │                                               │
   [उपयोगकर्ता / ब्राउज़र] ───► │  1. Frontend: public_html/ (React SPA)        │
   (yourdomain.com)         │     - index.html, static/js, static/css       │
                            │     - .htaccess (LiteSpeed / Apache Rewrite)  │
                            │                                               │
   [API Requests] ────────► │  2. Backend: Node.js Express API (Port 5000)  │
   (api.yourdomain.com      │     - Node.js v18 / v20 (src/server.js)       │
    or yourdomain.com/api)  │     - Prisma Client ORM                       │
                            │                                               │
                            │  3. Database: Hostinger MySQL / MariaDB       │
                            │     - Database: uXXXXXXX_aryapathshala        │
                            │     - Port: 3306 (localhost / 127.0.0.1)      │
                            └───────────────────────────────────────────────┘
```

---

## 2. चरण 1: Hostinger MySQL डेटाबेस सेटअप

### 1.1 डेटाबेस बनाना (Create MySQL Database)
1. **Hostinger hPanel** (`https://hpanel.hostinger.com`) में लॉगिन करें।
2. **Databases** > **MySQL Databases** पर जाएँ।
3. नया डेटाबेस विवरण भरें:
   - **Database Name:** `uXXXXXXXX_aryapathshala` *(उपसर्ग स्वतः जुड़ता है)*
   - **Username:** `uXXXXXXXX_aryaadmin`
   - **Password:** एक मजबूत पासवर्ड बनाएँ (उदा. `AryaSecurePass#2026`)
4. **Create** बटन दबाएँ।

### 1.2 Prisma Connection URL तैयार करना
Hostinger पर MySQL लोकलहोस्ट (`127.0.0.1:3306`) पर चलता है। आपका `DATABASE_URL` इस प्रकार बनेगा:
```
DATABASE_URL="mysql://uXXXXXXXX_aryaadmin:PASSWORD@127.0.0.1:3306/uXXXXXXXX_aryapathshala"
```
> **⚠️ ध्यान दें:** यदि आपके पासवर्ड में विशेष वर्ण (जैसे `#`, `@`, `%`) हैं, तो उन्हें URL-encode करें (जैसे `#` की जगह `%23` या `@` की जगह `%40`)।

---

## 3. चरण 2: बैकएंड डिप्लॉयमेंट (Express + Prisma)

### विकल्प A: Hostinger hPanel के माध्यम से (Node.js ऐप)

#### 1. Node.js एप्लीकेशन बनाना:
1. **hPanel** में **Advanced** > **Node.js** पर जाएँ (अथवा सबडोमेन `api.yourdomain.com` बनाएँ)।
2. **Create Application** पर क्लिक करें:
   - **Node.js Version:** `18.x` या `20.x`
   - **Application Mode:** `Production`
   - **Application Root:** `backend` (या `public_html/api`)
   - **Application Startup File:** `src/server.js`
3. **Create** पर क्लिक करें।

#### 2. बैकएंड फाइलें अपलोड करना:
Hostinger File Manager अथवा FTP (FileZilla) से अपने प्रोजेक्ट के `server/` फोल्डर की निम्नलिखित फाइलें अपलोड करें:
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
*(⚠️ `node_modules` फोल्डर को अपलोड न करें — यह सर्वर पर इंस्टॉल होगा।)*

#### 3. प्रोडक्शन पर्यावरण चर (`.env`) बनाना:
`backend/` फोल्डर के अंदर `.env` फाइल बनाएँ:
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com

DATABASE_URL="mysql://uXXXXXXXX_aryaadmin:PASSWORD@127.0.0.1:3306/uXXXXXXXX_aryapathshala"

JWT_SECRET="arya-pathshala-production-jwt-ultra-secure-key-2026"
JWT_EXPIRE="7d"

EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER="officialaryapathshala@gmail.com"
EMAIL_PASS="your-gmail-app-password"
EMAIL_FROM="Arya Pathshala <officialaryapathshala@gmail.com>"

BCRYPT_ROUNDS=12
```

#### 4. SSH एक्सेस से डिपेंडेंसी और डेटाबेस माइग्रेशन चलाना:
1. hPanel में **Advanced** > **SSH Access** को इनेबल करें।
2. टर्मिनल या PuTTY से सर्वर से कनेक्ट करें:
   ```bash
   ssh -p 65002 uXXXXXXXX@your-server-ip
   ```
3. बैकएंड डायरेक्टरी में जाएँ:
   ```bash
   cd ~/domains/yourdomain.com/public_html/api   # (या आपकी backend डायरेक्टरी)
   ```
4. पैकेज इंस्टॉल करें एवं डेटाबेस स्कीमा डिप्लॉय करें:
   ```bash
   npm install --production=false
   npx prisma generate
   npx prisma migrate deploy
   ```
5. प्रारंभिक वास्तविक डेटा (कोर्सेज, पुस्तकालय ग्रन्थ, एडमिन खाता) लोड करने के लिए सीड चलाएँ:
   ```bash
   node prisma/seed.js
   ```
6. hPanel में जाकर **Restart Application** दबाएँ।

---

### विकल्प B: Hostinger VPS सर्वर के माध्यम से

यदि आपके पास Hostinger VPS (Ubuntu) है:
```bash
# 1. सिस्टम अपडेट एवं Node.js 20 LTS इंस्टॉलेशन
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx mysql-server git

# 2. PM2 प्रोसेस मैनेजर इंस्टॉल करें
sudo npm install -g pm2

# 3. प्रोजेक्ट क्लोन करें या फाइलें /var/www/aryapathshala में रखें
cd /var/www/aryapathshala/server
npm install
npx prisma generate
npx prisma migrate deploy
node prisma/seed.js

# 4. PM2 द्वारा बैकएंड प्रारंभ करें
pm2 start src/server.js --name "arya-api"
pm2 save
pm2 startup
```

---

## 4. चरण 3: फ्रंटएंड बिल्ड एवं अपलोड

### 4.1 प्रोडक्शन बिल्ड तैयार करना
अपने लोकल कंप्यूटर पर `client` डायरेक्टरी में:
1. `client/.env.production` फाइल बनाएँ (या चेक करें):
   ```env
   REACT_APP_API_URL=https://api.yourdomain.com/api
   # अथवा यदि एक ही डोमेन पर रिवर्स प्रॉक्सी है:
   # REACT_APP_API_URL=/api
   ```
2. प्रोडक्शन बिल्ड कमांड चलाएँ:
   ```bash
   cd client
   npm run build
   ```
   यह `client/build/` फोल्डर में ऑप्टिमाइज़्ड फाइल्स जनरेट करेगा।

### 4.2 Hostinger `public_html/` में अपलोड करना
1. Hostinger **File Manager** खोलें।
2. अपने मुख्य डोमेन के `public_html/` में जाएँ।
3. `client/build/` के अंदर की सभी सामग्री को सीधे `public_html/` में अपलोड करें:
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

### 4.3 `.htaccess` कॉन्फ़िगरेशन (SPA पेज रिफ्रेश 404 फिक्स)
सुनिश्चित करें कि `public_html/.htaccess` फाइल में निम्नलिखित कोड मौजूद है (यह पहले से आपके `client/public/.htaccess` में शामिल है):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # यदि API उसी डोमेन पर रिवर्स प्रॉक्सी द्वारा चलानी हो:
  # RewriteRule ^api/(.*)$ http://127.0.0.1:5000/api/$1 [P,L]

  # React SPA रूटिंग (रिफ्रेश करने पर 404 न आए)
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Gzip कम्प्रेशन और ब्राउज़र कैशिंग
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

---

## 5. चरण 4: SSL (HTTPS) एवं डोमेन कॉन्फ़िगरेशन

1. Hostinger hPanel में **Security** > **SSL** पर जाएँ।
2. अपने डोमेन (`yourdomain.com`) तथा सबडोमेन (`api.yourdomain.com`) दोनों के लिए **Free Lifetime SSL** इंस्टॉल करें।
3. **Force HTTPS** को **ON** करें।
4. ब्राउज़र में इनकॉग्निटो मोड (Private Window) खोलकर चेक करें:
   - `https://yourdomain.com` (मुख्य वेबसाइट एवं डैशबोर्ड)
   - `https://api.yourdomain.com/api/health` (बैकएंड हेल्थ चेक — `{"status":"healthy"}` आना चाहिए)

---

## 6. चरण 5: समस्या निवारण एवं टिप्स (Troubleshooting FAQ)

| समस्या (Issue) | कारण (Cause) | समाधान (Solution) |
|---|---|---|
| **रिफ्रेश करने पर 404 Not Found** | Apache/LiteSpeed SPA रूटिंग मिसिंग | `public_html` में `.htaccess` फाइल चेक करें। |
| **CORS Error** | `FRONTEND_URL` मिसमैच | बैकएंड `.env` में `FRONTEND_URL=https://yourdomain.com` (बिना ट्रेलिंग स्लैश `/`) सेट करें। |
| **Prisma Engine Binary Error** | Linux बाइनरी जनरेट नहीं हुई | सर्वर पर SSH से जाकर `npx prisma generate` चलाएँ। |
| **Database Connection Refused** | गलत होस्ट या पोर्ट | Hostinger पर हमेशा `127.0.0.1` या `localhost` का उपयोग करें, रिमोट IP नहीं। |
| **500 Internal Server Error** | Node.js क्रैश या मिसिंग `.env` | hPanel में **Node.js** > **View Logs** चेक करें कि क्या एरर आ रहा है। |

---

## 7. बैकअप एवं सुरक्षा (Backups)

1. **MySQL डेटाबेस बैकअप:**
   - hPanel > **Databases** > **phpMyAdmin** > **Export** > **Quick** > **Go** (.sql फाइल डाउनलोड करें)।
2. **सप्ताह में एक बार बैकअप:**
   - Hostinger के स्वचालित **Daily/Weekly Backups** फीचर को ऑन रखें।

---
*आर्य पाठशाला — वैदिक शिक्षा एवं भारतीय संस्कृति की डिजिटल धरोहर* 🕉️
