const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma = require("../config/db");
const { generateToken } = require("../utils/jwt");
const { successResponse, errorResponse } = require("../utils/response");
const {
  sendEmail,
  getVerificationTemplate,
  getResetPasswordTemplate,
} = require("../utils/email");

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, "नाम, ई-मेल एवं पासवर्ड आवश्यक हैं", 400);
    }

    if (confirmPassword && password !== confirmPassword) {
      return errorResponse(res, "पासवर्ड मेल नहीं खाते", 400);
    }

    if (password.length < 6) {
      return errorResponse(res, "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए", 400);
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return errorResponse(res, "यह ई-मेल पहले से पंजीकृत है। कृपया लॉगिन करें।", 409);
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : null,
        password: hashedPassword,
        role: "STUDENT",
        isVerified: false,
        verificationToken,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Send verification email in background
    sendEmail({
      to: cleanEmail,
      subject: "आर्य पाठशाला — खाता सत्यापन",
      html: getVerificationTemplate(user.name, verificationToken),
    }).catch((err) => console.error("Email send error:", err.message));

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse(
      res,
      "पंजीकरण सफल! आपका स्वागत है।",
      { user, token },
      201
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "ई-मेल और पासवर्ड आवश्यक हैं", 400);
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return errorResponse(res, "अवैध ई-मेल या पासवर्ड", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, "अवैध ई-मेल या पासवर्ड", 401);
    }

    // Update lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    return successResponse(res, "सफलतापूर्वक प्रवेश (लॉगिन) हो गए!", {
      user: sanitizedUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return errorResponse(res, "सत्यापन टोकन आवश्यक है", 400);
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return errorResponse(res, "अमान्य अथवा समाप्त सत्यापन टोकन", 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    return successResponse(res, "ई-मेल सफलतापूर्वक सत्यापित हो गया!");
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, "ई-मेल आवश्यक है", 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      // Don't leak whether email exists
      return successResponse(
        res,
        "यदि यह ई-मेल पंजीकृत है, तो पासवर्ड रीसेट लिंक भेज दिया गया है।"
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: expires,
      },
    });

    sendEmail({
      to: cleanEmail,
      subject: "आर्य पाठशाला — पासवर्ड रीसेट लिंक",
      html: getResetPasswordTemplate(user.name, resetToken),
    }).catch((err) => console.error("Reset email send error:", err.message));

    return successResponse(
      res,
      "पासवर्ड रीसेट लिंक आपके ई-मेल पर भेज दिया गया है।"
    );
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password) {
      return errorResponse(res, "टोकन एवं नया पासवर्ड आवश्यक हैं", 400);
    }

    if (confirmPassword && password !== confirmPassword) {
      return errorResponse(res, "पासवर्ड मेल नहीं खाते", 400);
    }

    if (password.length < 6) {
      return errorResponse(res, "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए", 400);
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return errorResponse(res, "अमान्य अथवा समाप्त हो चुका रीसेट लिंक", 400);
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return successResponse(res, "पासवर्ड सफलतापूर्वक परिवर्तित हो गया! अब लॉगिन करें।");
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        avatar: true,
        createdAt: true,
        enrollments: {
          include: {
            course: true,
          },
          orderBy: { enrolledAt: "desc" },
        },
      },
    });

    return successResponse(res, "प्रोफ़ाइल प्राप्त हुई", user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
        ...(avatar && { avatar }),
      },
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

    return successResponse(res, "प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!", updated);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, "वर्तमान और नया पासवर्ड आवश्यक हैं", 400);
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return errorResponse(res, "नया पासवर्ड मेल नहीं खाता", 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, "नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return errorResponse(res, "वर्तमान पासवर्ड सही नहीं है", 400);
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return successResponse(res, "पासवर्ड सफलतापूर्वक बदल दिया गया!");
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  return successResponse(res, "सफलतापूर्वक लॉग आउट हो गए!");
};

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  logout,
};
