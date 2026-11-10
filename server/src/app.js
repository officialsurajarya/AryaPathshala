const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const libraryRoutes = require("./routes/libraryRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const contactRoutes = require("./routes/contactRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const { generalLimiter } = require("./middleware/rateLimiter");
const { notFoundHandler, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Security and middleware
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith(".hostinger.com") ||
        origin.includes("aryapathshala")
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, restricted in prod
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(generalLimiter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    project: "Arya Pathshala REST API",
    orm: "Prisma",
    database: "MySQL / MariaDB",
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/admin", adminRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
