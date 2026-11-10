const { verifyToken } = require("../utils/jwt");
const prisma = require("../config/db");
const { errorResponse } = require("../utils/response");

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return errorResponse(res, "प्रवेश हेतु प्रमाणीकरण टोकन आवश्यक है (Authentication required)", 401);
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return errorResponse(res, "अमान्य अथवा समाप्त टोकन (Invalid token)", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        avatar: true,
      },
    });

    if (!user) {
      return errorResponse(res, "उपयोगकर्ता नहीं मिला (User not found)", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, "सत्र समाप्त हो गया है, कृपया पुनः लॉगिन करें", 401);
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, "इस संसाधन तक पहुँचने की अनुमति नहीं है (Access forbidden)", 403);
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.userId) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            avatar: true,
          },
        });
        if (user) req.user = user;
      }
    }
  } catch (err) {
    // Ignore invalid token in optional auth
  }
  next();
};

module.exports = {
  authenticateUser,
  authorizeRoles,
  optionalAuth,
};
