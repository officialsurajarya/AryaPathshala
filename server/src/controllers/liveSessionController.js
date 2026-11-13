const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

// GET /api/live-sessions - Get all live sessions (Public / Authenticated)
const getAllLiveSessions = async (req, res, next) => {
  try {
    const sessions = await prisma.liveSession.findMany({
      orderBy: { id: "asc" },
    });
    return successResponse(res, "लाइव सत्र प्राप्त हुए", sessions);
  } catch (error) {
    next(error);
  }
};

// POST /api/live-sessions - Create a live session (Teacher or Admin)
const createLiveSession = async (req, res, next) => {
  try {
    const { title, courseTitle, instructor, day, time, meetUrl, status } = req.body;

    if (!title || !courseTitle || !meetUrl) {
      return errorResponse(res, "शीर्षक, पाठ्यक्रम एवं मीट लिंक अनिवार्य हैं", 400);
    }

    const session = await prisma.liveSession.create({
      data: {
        title,
        courseTitle,
        instructor: instructor || (req.user ? req.user.name : "आचार्य"),
        day: day || "सोमवार",
        time: time || "प्रातः ०७:००",
        meetUrl,
        status: status || "आगामी",
      },
    });

    return successResponse(res, "लाइव कक्षा सफलता पूर्वक जोड़ी गई", session, 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/live-sessions/:id - Update live session (Teacher or Admin)
const updateLiveSession = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return errorResponse(res, "अवैध सत्र आईडी", 400);

    const existing = await prisma.liveSession.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, "लाइव सत्र नहीं मिला", 404);

    const { title, courseTitle, instructor, day, time, meetUrl, status } = req.body;

    const updated = await prisma.liveSession.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(courseTitle !== undefined && { courseTitle }),
        ...(instructor !== undefined && { instructor }),
        ...(day !== undefined && { day }),
        ...(time !== undefined && { time }),
        ...(meetUrl !== undefined && { meetUrl }),
        ...(status !== undefined && { status }),
      },
    });

    return successResponse(res, "सत्र अद्यतन हुआ", updated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/live-sessions/:id - Delete live session (Teacher or Admin)
const deleteLiveSession = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return errorResponse(res, "अवैध सत्र आईडी", 400);

    const existing = await prisma.liveSession.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, "लाइव सत्र नहीं मिला", 404);

    await prisma.liveSession.delete({ where: { id } });
    return successResponse(res, "लाइव कक्षा हटा दी गई");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLiveSessions,
  createLiveSession,
  updateLiveSession,
  deleteLiveSession,
};

