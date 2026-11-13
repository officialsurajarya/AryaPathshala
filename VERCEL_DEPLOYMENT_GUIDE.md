# 🚀 आर्य पाठशाला — Vercel Production Deployment Guide
*(Complete Step-by-Step Manual for Deploying on Vercel)*

---

## 📌 विषय-सूची (Table of Contents)
1. [वास्तुकला एवं सर्वोत्तम दृष्टिकोण (Architecture Overview)](#1-वास्तुकला-एवं-सर्वोत्तम-दृष्टिकोण)
2. [विधि 1 (अनुशंसित): Vercel पर React Frontend + Cloud/VPS पर Backend](#2-विधि-1-अनुशंसित-frontend-on-vercel--backend-on-cloud)
   - [2.1 Vercel पर Frontend प्रोजेक्ट सेटअप (Dashboard Walkthrough)](#21-vercel-पर-frontend-प्रोजेक्ट-सेटअप)
   - [2.2 Environment Variables कॉन्फ़िगरेशन](#22-environment-variables-कॉन्फ़िगरेशन)
   - [2.3 SPA Routing & Page Refresh (404 Prevention)](#23-spa-routing--page-refresh-404-prevention)
3. [विधि 2: Vercel CLI द्वारा सीधा डिप्लॉयमेंट (Terminal Deploy)](#3-विधि-2-vercel-cli-द्वारा-सीधा-डिप्लॉयमेंट)
4. [विधि 3: सम्पूर्ण फुल-स्टैक मोनोरेपो Vercel पर (Serverless Express)](#4-विधि-3-सम्पूर्ण-फुल-स्टैक-मोनोरेपो-vercel-पर)
5. [कस्टम डोमेन एवं निःशुल्क SSL (Custom Domain & SSL)](#5-कस्टम-डोमेन-एवं-निःशुल्क-ssl)
6. [समस्या निवारण एवं एफएक्यू (Troubleshooting FAQ)](#6-समस्या-निवारण-एवं-एफएक्यू)

---

## 1. वास्तुकला एवं सर्वोत्तम दृष्टिकोण

फुल-स्टैक ऍप्लिकेशन्स (React + Node.js/Express + Prisma MySQL) के लिए Vercel पर **दो प्रमुख दृष्टिकोण** उपलब्ध हैं:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    दृष्टिकोण 1 (Industry Standard & Best Practice)          │
│                                                                              │
│  [React Client] ────────► Vercel Global Edge CDN (Ultra Fast & Auto SSL)     │
│  (UI / Pages)             - https://aryapathshala.vercel.app                 │
│                           - Custom Domain: https://aryapathshala.com         │
│                                                                              │
│  [Express REST API] ────► Hostinger / Render / Railway / AWS VPS             │
│  (Database & Logic)       - https://api.aryapathshala.com                    │
│                           - Persistent Node.js + Prisma Connection Pool      │
│                                                                              │
│  [MySQL Database] ──────► Hostinger / Aiven / Railway Cloud MySQL            │
└──────────────────────────────────────────────────────────────────────────────┘
```

> **💡 Vercel की विशेषता:** Vercel दुनिया का सबसे तेज़ और आधुनिक फ्रंटएंड होस्टिंग प्लेटफॉर्म है। यह गिटहब (GitHub) से कनेक्ट होकर प्रत्येक `git push` पर स्वतः नया प्रोडक्शन बिल्ड बना देता है और निःशुल्क ग्लोबल CDN व SSL प्रदान करता है।

---

## 2. विधि 1 (अनुशंसित): Frontend on Vercel + Backend on Cloud

### 2.1 Vercel पर Frontend प्रोजेक्ट सेटअप

1. **Vercel** (`https://vercel.com`) पर जाएँ और अपने **GitHub** खाते से साइन इन करें।
2. **Dashboard** में **"Add New..."** > **"Project"** पर क्लिक करें।
3. अपनी रिपॉजिटरी (`aryapathshalaCode`) को **Import** करें।
4. **Configure Project** स्क्रीन पर निम्नलिखित सेटिंग्स ध्यानपूर्वक चुनें:

| सेटिंग (Setting) | मान (Value) | विवरण |
|---|---|---|
| **Framework Preset** | `Create React App` | Vercel इसे स्वतः पहचान लेता है |
| **Root Directory** | `client` | **Edit** पर क्लिक करें और `client` सेलेक्ट करें |
| **Build Command** | `npm run build` | डिफॉल्ट रहने दें |
| **Output Directory** | `build` | डिफॉल्ट रहने दें |
| **Install Command** | `npm install` | डिफॉल्ट रहने दें |

---

### 2.2 Environment Variables कॉन्फ़िगरेशन

उसी स्क्रीन पर **Environment Variables** सेक्शन खोलें और अपना बैकएंड API URL जोड़ें:

```env
REACT_APP_API_URL=https://api.yourdomain.com/api
```
*(यदि आपका बैकएंड Render/Railway पर है, तो उदा. `https://arya-backend.onrender.com/api`)*

> **⚠️ महत्वपूर्ण नियम:** Create React App में सभी कस्टम एनवायरनमेंट वेरिएबल्स का नाम **`REACT_APP_`** से शुरू होना अनिवार्य है, अन्यथा ब्राउज़र उन्हें सुरक्षा कारणों से इग्नोर कर देता है।

---

### 2.3 SPA Routing & Page Refresh (404 Prevention)

React एक Single Page Application (SPA) है। जब यूजर किसी इंटरनल लिंक जैसे `https://yourdomain.com/dashboard` पर पेज रीफ्रेश करता है, तो Vercel को `index.html` सर्व करने का निर्देश देना आवश्यक होता है।

इसके लिए `client/vercel.json` फाइल बनाएं (या सुनिश्चित करें कि रूट में मौजूद है):

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 3. विधि 2: Vercel CLI द्वारा सीधा डिप्लॉयमेंट

यदि आप GitHub के बिना अपने कंप्यूटर के टर्मिनल से सीधे 1-कमांड में Vercel पर डिप्लॉय करना चाहते हैं:

### चरण 1: Vercel CLI इंस्टॉल करें
```bash
npm install -g vercel
```

### चरण 2: Vercel में लॉगिन करें
```bash
vercel login
```
*(ब्राउज़र खुलेगा, ईमेल या GitHub से ऑथेंटिकेट करें)*

### चरण 3: Client डायरेक्टरी से डिप्लॉय करें
```bash
cd e:\aryapathshalaCode\client
vercel --prod
```
टर्मिनल पर पूछे जाने वाले प्रश्नों के उत्तर:
- `Set up and deploy “client”?` → **Y**
- `Which scope?` → *(अपना Vercel अकाउंट चुनें)*
- `Link to existing project?` → **N**
- `What’s your project’s name?` → **aryapathshala**
- `In which directory is your code located?` → **./**
- `Want to modify settings?` → **N**

कुछ ही सेकंडों में आपको लाइव प्रोडक्शन URL मिल जाएगा:
👉 `https://aryapathshala.vercel.app`

---

## 4. विधि 3: सम्पूर्ण फुल-स्टैक मोनोरेपो Vercel पर

यदि आप फ्रंटएंड और बैकएंड दोनों को एक ही Vercel प्रोजेक्ट में सर्वरलेस फंक्शन के रूप में चलाना चाहते हैं:

### 4.1 रूट डायरेक्टरी में `vercel.json` कॉन्फ़िगरेशन
प्रोजेक्ट की रूट डायरेक्टरी में `vercel.json` का प्रारूप:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    },
    {
      "src": "server/src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/src/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "client/$1"
    }
  ]
}
```

### 4.2 सर्वरलेस एनवायरनमेंट में Prisma जनरेशन
`server/package.json` की `scripts` में जोड़ें:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```
इससे Vercel बिल्ड के दौरान लिनक्स सर्वरलेस एनवायरनमेंट के लिए Prisma Client बाइनरी स्वतः जनरेट हो जाती है।

---

## 5. कस्टम डोमेन एवं निःशुल्क SSL (Custom Domain & SSL)

अपना स्वयं का डोमेन (उदा. `aryapathshala.com` या `www.aryapathshala.com`) जोड़ने के लिए:

1. **Vercel Dashboard** > अपने प्रोजेक्ट में जाएँ > **Settings** > **Domains** पर क्लिक करें।
2. अपना डोमेन नाम दर्ज करें: `aryapathshala.com` और **Add** पर क्लिक करें।
3. Vercel आपको DNS रिकॉर्ड्स देगा:
   - **A Record:**
     - Type: `A`
     - Name: `@`
     - Value: `76.76.21.21`
   - **CNAME Record:**
     - Type: `CNAME`
     - Name: `www`
     - Value: `cname.vercel-dns.com`
4. अपने डोमेन रजिस्ट्रार (Hostinger / GoDaddy / Namecheap) के DNS Management में ये रिकॉर्ड्स जोड़ें।
5. 5 से 10 मिनट में DNS वेरीफाई हो जाएगा और Vercel स्वतः **Lifetime Free SSL** (HTTPS) एक्टिवेट कर देगा।

---

## 6. समस्या निवारण एवं एफएक्यू (Troubleshooting FAQ)

### ❓ 1. CORS Error (Cross-Origin Resource Sharing)
**समस्या:** ब्राउज़र कंसोल में `Access to XMLHttpRequest blocked by CORS policy` दिखता है।  
**समाधान:** बैकएंड के `.env` में `FRONTEND_URL` को अपने Vercel डोमेन पर सेट करें:
```env
FRONTEND_URL=https://aryapathshala.vercel.app
```
*(⚠️ ध्यान रहे: अंत में कोई स्लैश `/` न लगाएँ)*

### ❓ 2. पेज रीफ्रेश करने पर 404 Not Found (Page Refresh Error)
**समस्या:** सीधे होमपेज खुलता है लेकिन `#dashboard` या किसी अन्य रूट पर F5 दबाने पर Vercel 404 दिखाता है।  
**समाधान:** सुनिश्चित करें कि `client/vercel.json` में SPA Rewrite नियम मौजूद है:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### ❓ 3. Prisma Engine Binary Error on Vercel
**समस्या:** `Query engine binary for debian-openssl-xxx not found`.  
**समाधान:** `server/prisma/schema.prisma` में `binaryTargets` जोड़ें:
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x", "debian-openssl-3.0.x"]
}
```
और `npx prisma generate` चलाएँ।

---

## 7. चेकलिस्ट (Pre-Deployment Checklist)

- [x] क्लाइंट कोड में कोई अनयूज्ड वेरिएबल्स या ESLint एरर नहीं है (`npm run build` सफल है)।
- [x] सभी डमी और मॉक डेटा हटाकर वास्तविक MySQL डेटाबेस से कनेक्टेड हैं।
- [x] Vercel Environment Variables में `REACT_APP_API_URL` सही API एंडपॉइंट को पॉइंट कर रहा है।
- [x] Vercel SPA Rewrite कॉन्फ़िगरेशन सक्रिय है।

---
*आर्य पाठशाला — वैदिक ज्ञान एवं भारतीय संस्कृति की डिजिटल धरोहर* 🕉️
