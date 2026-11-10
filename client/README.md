# 🕉️ Arya Pathshala — Client Application

React 19 single-page application for the **Arya Pathshala** Vedic & Sanskrit educational portal.

---

## 📁 Directory Overview

```text
client/
├── public/                 # HTML shell, favicon, manifests, Vedic course images
├── src/
│   ├── api/                # Centralized API client (`client.js`)
│   ├── components/         # UI components (Header, Home, Courses, Dashboard, AdminPanel, etc.)
│   ├── context/            # AuthContext & State management
│   ├── App.js              # Main application root
│   ├── App.css             # Core design system & Vedic colors
│   └── index.js            # React entry point
├── .env                    # Local environment config (API URL)
├── .env.example            # Template for environment variables
└── package.json            # Frontend dependencies and scripts
```

---

## 🚀 Running the Client

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Check or copy `.env.example` to `.env`:
```env
PORT=3000
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm start
```
The client will open in your browser at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```
Generates an optimized static bundle in the `build/` directory ready for deployment on Hostinger or any static hosting service.

