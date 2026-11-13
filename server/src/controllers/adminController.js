const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const { successResponse, errorResponse } = require("../utils/response");

// 1. Live Dashboard Statistics
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalAdmins,
      totalCourses,
      activeCourses,
      totalEnrollments,
      completedEnrollments,
      activeEnrollments,
      totalNotices,
      publishedNotices,
      totalBooks,
      unreadMessages,
      recentUsers,
      recentEnrollments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.course.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: "COMPLETED" } }),
      prisma.enrollment.count({ where: { status: "ACTIVE" } }),
      prisma.notice.count(),
      prisma.notice.count({ where: { isPublished: true } }),
      prisma.libraryBook.count(),
      prisma.contactMessage.count({ where: { status: "UNREAD" } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          avatar: true,
        },
      }),
      prisma.enrollment.findMany({
        take: 5,
        orderBy: { enrolledAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          course: { select: { id: true, title: true, category: true } },
        },
      }),
    ]);

    const stats = {
      totalUsers,
      totalStudents,
      totalTeachers,
      totalAdmins,
      totalCourses,
      activeCourses,
      totalEnrollments,
      completedEnrollments,
      activeEnrollments,
      totalNotices,
      publishedNotices,
      totalBooks,
      unreadMessages,
      recentUsers,
      recentEnrollments,
    };

    return successResponse(res, "डैशबोर्ड सांख्यिकी प्राप्त हुई", stats);
  } catch (error) {
    next(error);
  }
};

// 2. Get All Users / Students (with search, role filter & pagination)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, limit = 50, page = 1 } = req.query;

    const where = {};
    if (role && role !== "ALL") {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { city: { contains: search } },
        { education: { contains: search } },
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
          fatherName: true,
          dob: true,
          education: true,
          city: true,
          state: true,
          pincode: true,
          idDocumentType: true,
          idDocumentNumber: true,
          academicNotes: true,
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

// 3. Get Single User / Student with full academic & enrollment details
const getUserById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                titleEn: true,
                category: true,
                image: true,
                currentPrice: true,
              },
            },
          },
          orderBy: { enrolledAt: "desc" },
        },
      },
    });

    if (!user) {
      return errorResponse(res, "उपयोगकर्ता नहीं मिला", 404);
    }

    // Do not return password hash
    const { password, ...safeUser } = user;
    return successResponse(res, "उपयोगकर्ता विवरण प्राप्त हुआ", safeUser);
  } catch (error) {
    next(error);
  }
};

// 4. Create New Student / User directly from Admin Panel
const createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role = "STUDENT",
      isVerified = true,
      fatherName,
      dob,
      education,
      address,
      city,
      state,
      pincode,
      idDocumentType,
      idDocumentNumber,
      academicNotes,
    } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, "नाम, ईमेल और पासवर्ड आवश्यक हैं", 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return errorResponse(res, "इस ईमेल के साथ पहले से खाता मौजूद है", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        phone,
        password: hashedPassword,
        role: ["STUDENT", "TEACHER", "ADMIN"].includes(role) ? role : "STUDENT",
        isVerified: Boolean(isVerified),
        fatherName,
        dob,
        education,
        address,
        city,
        state,
        pincode,
        idDocumentType,
        idDocumentNumber,
        academicNotes,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        education: true,
        city: true,
        createdAt: true,
      },
    });

    return successResponse(res, "विद्यार्थी खाता सफलतापूर्वक बनाया गया", newUser, 201);
  } catch (error) {
    next(error);
  }
};

// 5. Update Student / User Information & Academic Details
const updateUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      name,
      email,
      phone,
      role,
      isVerified,
      password,
      fatherName,
      dob,
      education,
      address,
      city,
      state,
      pincode,
      idDocumentType,
      idDocumentNumber,
      academicNotes,
    } = req.body;

    const data = {};
    if (name) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (role && ["STUDENT", "TEACHER", "ADMIN"].includes(role)) {
      if (id === req.user.id && role !== "ADMIN") {
        return errorResponse(res, "आप अपनी स्वयं की व्यवस्थापक भूमिका नहीं हटा सकते", 400);
      }
      data.role = role;
    }
    if (isVerified !== undefined) data.isVerified = Boolean(isVerified);
    if (fatherName !== undefined) data.fatherName = fatherName;
    if (dob !== undefined) data.dob = dob;
    if (education !== undefined) data.education = education;
    if (address !== undefined) data.address = address;
    if (city !== undefined) data.city = city;
    if (state !== undefined) data.state = state;
    if (pincode !== undefined) data.pincode = pincode;
    if (idDocumentType !== undefined) data.idDocumentType = idDocumentType;
    if (idDocumentNumber !== undefined) data.idDocumentNumber = idDocumentNumber;
    if (academicNotes !== undefined) data.academicNotes = academicNotes;

    if (password && password.trim().length >= 6) {
      data.password = await bcrypt.hash(password.trim(), 10);
    }

    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      const existing = await prisma.user.findFirst({
        where: { email: cleanEmail, NOT: { id } },
      });
      if (existing) {
        return errorResponse(res, "यह ईमेल किसी अन्य खाते द्वारा उपयोग में है", 400);
      }
      data.email = cleanEmail;
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        fatherName: true,
        dob: true,
        education: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        idDocumentType: true,
        idDocumentNumber: true,
        academicNotes: true,
        updatedAt: true,
      },
    });

    return successResponse(res, "विद्यार्थी विवरण सफलतापूर्वक अपडेट किया गया", updated);
  } catch (error) {
    next(error);
  }
};

// 6. Delete User / Student
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

// 7. Update User Role
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

// 8. Enroll Student in Course (Directly from Admin)
const enrollStudentInCourse = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { courseId, status = "ACTIVE", progressPercent = 0, notes } = req.body;

    if (!courseId) {
      return errorResponse(res, "courseId आवश्यक है", 400);
    }

    const cId = parseInt(courseId, 10);
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: cId } },
    });

    if (existing) {
      return errorResponse(res, "विद्यार्थी पहले से ही इस पाठ्यक्रम में नामांकित है", 400);
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId: cId,
        status: ["ACTIVE", "COMPLETED", "PENDING", "CANCELLED"].includes(status) ? status : "ACTIVE",
        progressPercent: parseInt(progressPercent, 10) || 0,
        notes,
      },
      include: {
        course: { select: { id: true, title: true, category: true } },
      },
    });

    return successResponse(res, "पाठ्यक्रम में नामांकन सफल रहा", enrollment, 201);
  } catch (error) {
    next(error);
  }
};

// 9. Update Enrollment (Progress, Status, Notes)
const updateEnrollment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, progressPercent, notes } = req.body;

    const data = {};
    if (status) data.status = status;
    if (progressPercent !== undefined) {
      data.progressPercent = parseInt(progressPercent, 10);
      if (data.progressPercent >= 100) {
        data.status = "COMPLETED";
        data.completedAt = new Date();
      }
    }
    if (notes !== undefined) data.notes = notes;

    const updated = await prisma.enrollment.update({
      where: { id },
      data,
      include: {
        course: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return successResponse(res, "नामांकन विवरण अपडेट हुआ", updated);
  } catch (error) {
    next(error);
  }
};

// 10. Delete Enrollment (Unenroll)
const deleteEnrollment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.enrollment.delete({ where: { id } });
    return successResponse(res, "नामांकन हटाया गया");
  } catch (error) {
    next(error);
  }
};

// 11. Get All Enrollments
const getAllEnrollments = async (req, res, next) => {
  try {
    const { status, search, limit = 50, page = 1 } = req.query;

    const where = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { course: { title: { contains: search } } },
      ];
    }

    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    const [total, enrollments] = await Promise.all([
      prisma.enrollment.count({ where }),
      prisma.enrollment.findMany({
        where,
        take,
        skip,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true,
              education: true,
              city: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              category: true,
              currentPrice: true,
              image: true,
            },
          },
        },
        orderBy: { enrolledAt: "desc" },
      }),
    ]);

    return successResponse(res, "नामांकन सूची प्राप्त हुई", {
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / take),
      enrollments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  enrollStudentInCourse,
  updateEnrollment,
  deleteEnrollment,
  getAllEnrollments,
};
