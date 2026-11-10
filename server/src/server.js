require("dotenv").config();
const app = require("./app");
const prisma = require("./config/db");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🕉️  आर्य पाठशाला (Arya Pathshala) API Server`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`==================================================\n`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log("\n⚠️ Shutting down gracefully...");
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log("✅ Database disconnected.");
      process.exit(0);
    } catch (err) {
      console.error("Error disconnecting database:", err);
      process.exit(1);
    }
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
