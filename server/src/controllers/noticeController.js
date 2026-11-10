const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

const getNotices = async (req, res, next) => {
  try {
    const notices = await prisma.notice.findMany({
      where: { isPublished: true },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });

    return successResponse(res, "सूचनाएं प्राप्त हुईं", notices);
  } catch (error) {
    next(error);
  }
};

const createNotice = async (req, res, next) => {
  try {
    const { title, content, type, category, dateText, actionText, actionLink, priority } = req.body;

    if (!title || !content || !type) {
      return errorResponse(res, "शीर्षक, सामग्री एवं प्रकार आवश्यक हैं", 400);
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        type,
        category: category || "important",
        dateText: dateText || "अद्यतन",
        actionText: actionText || "विस्तार से पढ़ें",
        actionLink: actionLink || "#courses",
        priority: priority || "MEDIUM",
      },
    });

    return successResponse(res, "सूचना सफलतापूर्वक प्रकाशित की गई", notice, 201);
  } catch (error) {
    next(error);
  }
};

const deleteNotice = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.notice.delete({ where: { id } });
    return successResponse(res, "सूचना हटाई गई");
  } catch (error) {
    next(error);
  }
};

const updateNotice = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updates = { ...req.body };
    const notice = await prisma.notice.update({ where: { id }, data: updates });
    return successResponse(res, "सूचना सफलतापूर्वक अपडेट की गई", notice);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotices,
  createNotice,
  deleteNotice,
  updateNotice,
};
