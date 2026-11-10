const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `अनुरोधित मार्ग '${req.originalUrl}' उपलब्ध नहीं है (Endpoint Not Found)`,
  });
};

const errorHandler = (err, req, res, next) => {
  console.error("🔥 Error Handler:", err);

  // Prisma Uniqueness constraint violation
  if (err.code === "P2002") {
    const target = err.meta?.target || "फील्ड";
    return res.status(409).json({
      success: false,
      message: `यह विवरण (${target}) पहले से पंजीकृत है।`,
    });
  }

  // Prisma Record not found
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "अनुरोधित रिकॉर्ड प्राप्त नहीं हुआ।",
    });
  }

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.message || "आंतरिक सर्वर त्रुटि (Internal Server Error)";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
