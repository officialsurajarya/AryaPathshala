# Arya Pathshala — Project Audit & Implementation Plan

## 1. Audit Summary of Existing Codebase

### 1.1 Architecture & Stack
- **Frontend Framework**: React 19 (`react-scripts 5.0.1` / Create React App setup).
- **Styling**: Bootstrap 5, custom CSS (`App.css`, `Responsive.css`, component-specific stylesheets).
- **Icons**: FontAwesome and React Icons (`react-icons`).
- **Slider/Carousel**: Swiper.js.
- **Backend Status**: An unintegrated, commented-out monolithic file `server.js` (MongoDB/Mongoose based, ~1600 lines) was previously placed in the root directory.
- **Database Status**: No active MySQL database or ORM is currently configured; MongoDB was previously drafted, which violates project requirements.
- **Routing**: Currently a single-page conditional state model (`App.js`), lacking a structured router or dedicated route state for Dashboard and Email Verification.

---

### 1.2 Component-by-Component Audit

| Component | Current State | Deficiencies & Issues Found | Action Required |
| :--- | :--- | :--- | :--- |
| **`Header.js`** | Functional visual navbar with Sanskrit branding | Auth state is static; login/signup buttons do not reflect logged-in user profile, avatar, or link to Dashboard. Dropdowns use hardcoded category hashes. | Add AuthContext integration, dynamic profile dropdown/logout, and responsive mobile nav behavior. |
| **`Home.js` & `HeroVisual.js`** | High-quality Vedic hero visual and statistics counter | "अध्ययन आरंभ करें" and "पाठ्यक्रम देखें" buttons link to `#signin` and `#signup` dead anchors. | Wire buttons to interactive course scroll and dynamic Auth/Enrollment triggers. |
| **`Courses.js` & `CourseCard.jsx`** | Swiper carousel with 8 categories and rich Vedic images | "अभी नामांकन करें" (Enroll Now) button has no `onClick` handler; no enrollment flow or backend API integration. | Implement course enrollment flow, backend API integration, and enrollment modal. |
| **`LibrarySection.js`** | Extensive catalogue with search, category filtering, and modal | "डाउनलोड करें" (Download) and "साझा करें" (Share) buttons are inactive; placeholder image paths (`/api/placeholder/...`); `<style jsx>` tag used improperly in CRA. | Connect view/download handlers, real image fallbacks, clipboard copy for sharing, and link to backend. |
| **`Notifications.jsx`** | Styled notification cards for UGC NET, courses, exams | Action buttons ("विस्तार से पढ़ें", etc.) have no handlers or modal display; data is static. | Implement notice detail modal and backend API integration. |
| **`Contact.jsx`** | Good layout with contact cards and FAQ accordion | Form uses hardcoded external Web3Forms action with raw API keys; lacks React controlled inputs, validation feedback, and backend storage. | Replace with controlled React form connecting to backend `/api/contact` with database storage and feedback. |
| **`AuthPage.js`** | Modal with Login, Signup, and Forgot Password tabs | Uses dummy `setTimeout` calls; no real JWT authentication, token storage, or backend API communication. | Connect to backend `/api/auth` endpoints with token management and profile persistence. |
| **`Dashboard.js`** | Exists but entirely commented out (~575 lines) | Commented out due to missing dependencies; not accessible from UI; lacks backend data hooks. | Re-enable and rebuild as a responsive Student & Admin portal with course progress, enrollment list, contact messages, and user management. |
| **`Loader.jsx`** | Animated Sanskrit loader | Contains ESLint exhaustive-deps warning for `loadingTexts`. | Clean up dependency warning and optimize transition timing. |
| **`Footer.js`** | Styled footer with quick links and social links | Dead links (`href="#"`) causing ESLint accessibility warnings; course links not linked to category selectors. | Update links to valid triggers and category scroll handlers. |

---

## 2. Backend & Database Architectural Plan

### 2.1 Backend Architecture (`backend/`)
We will create a clean, modular Express.js backend using Prisma ORM with MySQL/MariaDB:
```
backend/
├── prisma/
│   ├── schema.prisma         # Normalized database models & relationships
│   └── seed.js               # Seed script with 30+ Vedic courses, books, notices, admin
├── src/
│   ├── config/
│   │   └── db.js             # Prisma Client instance & connection management
│   ├── controllers/
│   │   ├── authController.js       # Register, login, verify email, reset password, profile
│   │   ├── courseController.js     # Get courses, get by slug/id, category filter
│   │   ├── libraryController.js    # Books catalog, search, record download/view
│   │   ├── noticeController.js     # Public & admin notice management
│   │   ├── contactController.js    # Contact message submission & admin inquiry management
│   │   ├── enrollmentController.js # Course enrollment, progress tracking, user enrollments
│   │   └── adminController.js      # System analytics, user roles, stats
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT verification & role authorization (ADMIN, TEACHER, STUDENT)
│   │   ├── errorMiddleware.js      # Centralized error handler & 404 handler
│   │   └── rateLimiter.js          # Security rate limiting for auth & contact endpoints
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── libraryRoutes.js
│   │   ├── noticeRoutes.js
│   │   ├── contactRoutes.js
│   │   ├── enrollmentRoutes.js
│   │   └── adminRoutes.js
│   ├── validators/
│   │   └── schemas.js              # Request validation helpers
│   ├── utils/
│   │   ├── email.js                # Nodemailer email sender & Vedic HTML templates
│   │   └── jwt.js                  # Token generation and verification
│   ├── app.js                      # Express app with CORS, Helmet, Morgan, JSON parsing
│   └── server.js                   # Server bootstrap & graceful shutdown
├── .env.example                    # Hostinger and local environment configuration
├── package.json
└── README.md                       # Backend development and Hostinger deployment guide
```

### 2.2 Database Schema (MySQL with Prisma ORM)
1. **User**: `id`, `name`, `email` (unique), `phone`, `password`, `role` (STUDENT, TEACHER, ADMIN), `isVerified`, `verificationToken`, `resetPasswordToken`, `resetPasswordExpires`, `lastLogin`, `createdAt`, `updatedAt`
2. **Course**: `id`, `slug` (unique), `category`, `title`, `titleEn`, `description`, `image`, `originalPrice`, `currentPrice`, `rating`, `durationHours`, `studentsCount`, `hasCertificate`, `badgeText`, `badgeType`, `isPublished`, `createdAt`, `updatedAt`
3. **Enrollment**: `id`, `userId`, `courseId`, `status` (PENDING, ACTIVE, COMPLETED), `progressPercent`, `enrolledAt`, `completedAt` (Foreign keys to User and Course with unique `[userId, courseId]`)
4. **LibraryBook**: `id`, `title`, `titleEn`, `author`, `authorEn`, `category`, `language`, `description`, `descriptionEn`, `pages`, `year`, `rating`, `views`, `downloads`, `image`, `pdfUrl`, `tags`, `fileSize`, `format`, `isAvailable`, `createdAt`, `updatedAt`
5. **Notice**: `id`, `title`, `content`, `type`, `category`, `dateText`, `actionText`, `actionLink`, `priority`, `isPublished`, `createdAt`, `updatedAt`
6. **ContactMessage**: `id`, `firstName`, `lastName`, `email`, `phone`, `subject`, `message`, `status` (UNREAD, READ, REPLIED), `createdAt`, `updatedAt`
7. **SystemSetting**: `id`, `key` (unique), `value`, `updatedAt`

---

## 3. Prioritized Implementation Checklist

- [ ] **Step 1: Backend Foundation & Prisma MySQL Setup**
  - Initialize `backend/package.json` with required dependencies (express, prisma, @prisma/client, bcryptjs, jsonwebtoken, cors, helmet, morgan, dotenv, nodemailer, express-rate-limit).
  - Write `prisma/schema.prisma` with all normalized models.
  - Create `prisma/seed.js` with comprehensive initial Vedic dataset.
  - Implement controllers, routes, auth middleware, and error handling.
- [ ] **Step 2: Frontend API Client & State Management**
  - Create centralized API client (`src/api/client.js`) and environment-based baseURL (`REACT_APP_API_URL`).
  - Create `AuthContext.js` for persistent JWT authentication state and role access.
- [ ] **Step 3: Complete Frontend Integrations & Missing Features**
  - Integrate real Auth in `AuthPage.js` (Login, Register, Forgot Password, Reset Password).
  - Update `Header.js` to show user profile, avatar, role badge, dashboard toggle, and logout.
  - Connect `Contact.jsx` to submit directly to `/api/contact` with validation and feedback states.
  - Implement Enrollment handling on `CourseCard.jsx` and course detail display.
  - Enhance `LibrarySection.js` with functional download, share, search, and view tracking.
  - Implement Notice detail modal in `Notifications.jsx`.
  - Fix dead anchor links, button handlers, and ESLint warnings.
- [ ] **Step 4: Re-enable & Polish Dashboard**
  - Implement full responsive Student & Admin Dashboard (`src/components/Dashboard.js`).
  - Student Tab: Enrolled courses, study material, profile settings.
  - Admin Tab: User role management, contact message inbox, analytics overview.
- [ ] **Step 5: Hostinger Production Deployment Package**
  - Create `.env.example` with Hostinger MySQL connection string format.
  - Provide production build scripts and `.htaccess` for static frontend + Node.js Express backend deployment on Hostinger.
  - Verify complete production build (`npm run build`).
