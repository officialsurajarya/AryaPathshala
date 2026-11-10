const rateLimit = require("express-rate-limit");

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "अत्यधिक अनुरोध। कृपया कुछ समय पश्चात पुनः प्रयास करें।",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 requests per 15 min window for login/register
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "लॉगिन अथवा पंजीकरण के अत्यधिक प्रयास। कृपया 15 मिनट बाद प्रयास करें।",
  },
});

const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "संदेश भेजने की सीमा समाप्त। कृपया 10 मिनट प्रतीक्षा करें।",
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  contactLimiter,
};
