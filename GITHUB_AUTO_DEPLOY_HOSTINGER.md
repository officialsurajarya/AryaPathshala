# 🚀 Arya Pathshala — GitHub ➔ Hostinger Auto-Deployment Guide

अब आप जब भी अपने कंप्यूटर से **GitHub पर कोड पुश (`git push`) करेंगे**, आपकी वेबसाइट **Hostinger पर स्वतः (Automatically) डिप्लॉय** हो जाएगी।

---

## 📌 दो बेहतरीन तरीके (Two Deployment Methods)

| तरीका | उपयुक्तता | विवरण |
| :--- | :--- | :--- |
| **तरीका १ (अनुशंसित): Hostinger hPanel Git Auto-Deploy** | सबसे सरल एवं डायरेक्ट | Hostinger के इन-बिल्ट Git और Webhook फीचर से कनेक्ट होता है। |
| **तरीका २: GitHub Actions CI/CD Pipeline** | सर्वाधिक सुरक्षित एवं तेज़ | React का बिल्ड GitHub के सुपरफ़ास्ट 7GB RAM सर्वर पर बनता है और FTP द्वारा Hostinger पर अपलोड होता है। |

---

## 🛠️ तरीका १: Hostinger hPanel Git Auto-Deploy (Webhook)

Hostinger में Git Auto-Deployment सेट करने के चरण:

### चरण १: Hostinger hPanel में Git रिपोजिटरी कनेक्ट करें
1. [Hostinger hPanel](https://hpanel.hostinger.com) में लॉगिन करें।
2. अपने डोमेन (`aryapathshala.com`) के **Manage (प्रबंधन)** पर क्लिक करें।
3. बाईं ओर के मेन्यू में **Advanced** पर जाएँ और **Git** पर क्लिक करें।
4. निम्नलिखित विवरण भरें:
   - **Repository:** `https://github.com/officialsurajarya/aryapathshalaCode.git`
   - **Branch:** `main`
   - **Install Path:** खाली छोड़ें (या रूट फोल्डर रहने दें)
   - **Auto Deployment:** चेकबॉक्स को **Tick (Enable)** करें ✅
5. **Create (बनाएँ)** बटन पर क्लिक करें।

### चरण २: GitHub में Webhook URL जोड़ें
1. Hostinger आपको एक **Webhook URL** देगा (उदाहरण: `https://srvXXX.main-hosting.eu/git-deploy?id=...`)।
2. इस Webhook URL को कॉपी कर लें।
3. अब अपने GitHub Repository पर जाएँ:
   `https://github.com/officialsurajarya/aryapathshalaCode/settings/hooks`
4. **Add webhook** बटन पर क्लिक करें।
5. विवरण दर्ज करें:
   - **Payload URL:** Hostinger से कॉपी किया गया Webhook URL पेस्ट करें।
   - **Content type:** `application/json` चुनें।
   - **Which events would you like to trigger this webhook?:** `Just the push event` चुनें।
   - **Active:** ✅ चेक करें।
6. **Add webhook** दबाएँ।

> 🎯 **परिणाम:** अब जब भी आप `git push origin main` करेंगे, GitHub तुरंत Hostinger को सिग्नल भेजेगा और Hostinger नया कोड अपने आप पुल (Pull) और अपडेट कर लेगा!

---

## 🛠️ तरीका २: GitHub Actions CI/CD (स्वचालित बिल्ड + FTP)

हमने आपके प्रोजेक्ट में `.github/workflows/deploy.yml` फाइल तैयार कर दी है।

### चरण १: Hostinger से FTP क्रेडेंशियल्स प्राप्त करें
1. Hostinger hPanel में **Files ➔ FTP Accounts** पर जाएँ।
2. आपको ३ चीज़ें मिलेंगी:
   - **FTP Host / Server** (जैसे `ftp.aryapathshala.com` या `185.xxx.xxx.xxx`)
   - **FTP Username** (जैसे `u505758403`)
   - **FTP Password** (आपका FTP पासवर्ड)

### चरण २: GitHub Secrets में क्रेडेंशियल्स जोड़ें
1. GitHub Repository पर जाएँ:
   `https://github.com/officialsurajarya/aryapathshalaCode/settings/secrets/actions`
2. **New repository secret** बटन दबाकर ये ३ सीक्रेट्स जोड़ें:
   - Name: `HOSTINGER_FTP_SERVER` ➔ Value: (आपका FTP होस्ट)
   - Name: `HOSTINGER_FTP_USER` ➔ Value: (आपका FTP यूज़रनेम)
   - Name: `HOSTINGER_FTP_PASSWORD` ➔ Value: (आपका FTP पासवर्ड)

> 🎯 **परिणाम:** कोड पुश होते ही GitHub का Ubuntu सर्वर खुद React को कंपाइल करेगा और तैयार फाइलों को Hostinger के `public_html/` में लाइव कर देगा!

---

## 🔐 Hostinger Environment Variables (`.env`)

Hostinger सर्वर पर `server/.env` फाइल में निम्नलिखित सेटिंग्स अवश्य रखें:

```env
PORT=5000
NODE_ENV=production
DATABASE_URL="mysql://u505758403_arya:YOUR_PASSWORD@localhost:3306/u505758403_aryapathshala"
JWT_SECRET="AryaPathshala_SuperSecure_SecretKey_2025"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="https://aryapathshala.com"
```

---

## 💻 अब कोड कैसे पुश करें? (How to Push Code)

जब भी आप कोई बदलाव करें, टर्मिनल में केवल ये ३ कमांड चलाएँ:

```powershell
git add .
git commit -m "Update Arya Pathshala"
git push origin main
```

इसके बाद आपकी वेबसाइट Hostinger पर स्वतः अपडेट हो जाएगी! 🕉️
