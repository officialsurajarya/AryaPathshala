const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

const submitMessage = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, subject, message } = req.body;

    if (!firstName || !email || !subject || !message) {
      return errorResponse(res, "कृपया सभी आवश्यक फ़ील्ड (नाम, ईमेल, विषय और संदेश) भरें।", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, "कृपया एक मान्य ई-मेल पता दर्ज करें।", 400);
    }

    const contact = await prisma.contactMessage.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName ? lastName.trim() : null,
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
        subject: subject.trim(),
        message: message.trim(),
        status: "UNREAD",
      },
    });

    return successResponse(
      res,
      "आपका संदेश सफलतापूर्वक प्राप्त हो गया है। हमारी टीम 24 घंटे के भीतर आपसे संपर्क करेगी। धन्यवाद!",
      { id: contact.id },
      201
    );
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;

    const where = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    const [total, messages] = await Promise.all([
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return successResponse(res, "संदेश सूची प्राप्त हुई", {
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / take),
      messages,
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, replyNotes } = req.body;

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(replyNotes && { replyNotes }),
      },
    });

    return successResponse(res, "संदेश स्थिति अपडेट हो गई", updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitMessage,
  getMessages,
  updateStatus,
};
