const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env"), override: true });
const { PrismaClient } = require("@prisma/client");

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ["warn", "error"],
    });
  }
  prisma = global.prisma;
}

module.exports = prisma;
