const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalCourses,
      totalEnrollments,
      completedEnrollments,
      totalBooks,
      unreadMessages,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: "COMPLETED" } }),
      prisma.libraryBook.count(),
      prisma.contactMessage.count({ where: { status: "UNREAD" } }),
    ]);

    const stats = {
      totalUsers,
      totalStudents,
      totalTeachers,
      totalCourses,
      totalEnrollments,
      completedEnrollments,
      totalBooks,
      unreadMessages,
    };

    return successResponse(res, "डैशबोर्ड सांख्यिकी प्राप्त हुई", stats);
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, limit = 20, page = 1 } = req.query;

    const where = {};
    if (role && role !== "ALL") {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        take,
        skip,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isVerified: true,
          avatar: true,
          lastLogin: true,
          createdAt: true,
          _count: {
            select: { enrollments: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return successResponse(res, "उपयोगकर्ता सूची प्राप्त हुई", {
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / take),
      users,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { role } = req.body;

    if (!["STUDENT", "TEACHER", "ADMIN"].includes(role)) {
      return errorResponse(res, "अमान्य भूमिका (Invalid role)", 400);
    }

    if (id === req.user.id && role !== "ADMIN") {
      return errorResponse(res, "आप अपनी स्वयं की व्यवस्थापक भूमिका नहीं हटा सकते", 400);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return successResponse(res, "उपयोगकर्ता भूमिका सफलतापूर्वक परिवर्तित हुई", updated);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (id === req.user.id) {
      return errorResponse(res, "आप अपने स्वयं के खाते को नहीं हटा सकते", 400);
    }

    await prisma.user.delete({ where: { id } });

    return successResponse(res, "उपयोगकर्ता खाता सफलतापूर्वक हटाया गया");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
};
