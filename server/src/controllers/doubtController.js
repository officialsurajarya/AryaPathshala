const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

// GET /api/doubts - Get doubts
// Students get their own doubts; Teachers and Admins get all doubts
const getAllDoubts = async (req, res, next) => {
  try {
    let whereClause = {};
    if (req.user.role === "STUDENT") {
      whereClause = {
        OR: [
          { studentEmail: req.user.email },
          { studentId: req.user.id }
        ]
      };
    }

    const doubts = await prisma.studentDoubt.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return successResponse(res, "शंका सूची प्राप्त हुई", doubts);
  } catch (error) {
    next(error);
  }
};

// POST /api/doubts - Ask a doubt (Students or Authenticated Users)
const createDoubt = async (req, res, next) => {
  try {
    const { courseTitle, shlokaContext, question } = req.body;

    if (!question || !courseTitle) {
      return errorResponse(res, "पाठ्यक्रम एवं शंका प्रश्न अनिवार्य हैं", 400);
    }

    const doubt = await prisma.studentDoubt.create({
      data: {
        studentId: req.user.id,
        studentName: req.user.name,
        studentEmail: req.user.email,
        courseTitle,
        shlokaContext: shlokaContext || null,
        question,
        status: "PENDING",
      },
    });

    return successResponse(res, "आपकी शंका सफलता पूर्वक दर्ज हो गई है", doubt, 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/doubts/:id/reply - Reply to doubt (Teacher or Admin)
const replyDoubt = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return errorResponse(res, "अवैध शंका आईडी", 400);

    const { reply } = req.body;
    if (!reply) return errorResponse(res, "उत्तर दर्ज करना अनिवार्य है", 400);

    const existing = await prisma.studentDoubt.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, "शंका प्रश्न प्राप्त नहीं हुआ", 404);

    const updated = await prisma.studentDoubt.update({
      where: { id },
      data: {
        reply,
        status: "ANSWERED",
      },
    });

    return successResponse(res, "शंका का समाधान प्रेषित किया गया", updated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/doubts/:id - Delete doubt (Admin or Teacher)
const deleteDoubt = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return errorResponse(res, "अवैध शंका आईडी", 400);

    const existing = await prisma.studentDoubt.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, "शंका नहीं मिली", 404);

    await prisma.studentDoubt.delete({ where: { id } });
    return successResponse(res, "शंका हटा दी गई");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDoubts,
  createDoubt,
  replyDoubt,
  deleteDoubt,
};

