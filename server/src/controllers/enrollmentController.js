const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

const enrollInCourse = async (req, res, next) => {
  try {
    const { courseId, slug } = req.body;

    let targetCourseId = courseId;
    if (!targetCourseId && slug) {
      const course = await prisma.course.findUnique({ where: { slug } });
      if (course) targetCourseId = course.id;
    }

    if (!targetCourseId) {
      return errorResponse(res, "पाठ्यक्रम पहचानकर्ता (Course ID or Slug) आवश्यक है", 400);
    }

    const course = await prisma.course.findUnique({
      where: { id: parseInt(targetCourseId, 10) },
    });

    if (!course) {
      return errorResponse(res, "पाठ्यक्रम नहीं मिला", 404);
    }

    // Check if user is already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId: course.id,
        },
      },
    });

    if (existing) {
      return successResponse(
        res,
        "आप इस पाठ्यक्रम में पहले से नामांकित हैं। अपने डैशबोर्ड में अध्ययन जारी रखें।",
        existing
      );
    }

    // Database transaction to create enrollment and increment students count
    const [enrollment] = await prisma.$transaction([
      prisma.enrollment.create({
        data: {
          userId: req.user.id,
          courseId: course.id,
          status: "ACTIVE",
          progressPercent: 0,
        },
        include: {
          course: true,
        },
      }),
      prisma.course.update({
        where: { id: course.id },
        data: { studentsCount: { increment: 1 } },
      }),
    ]);

    return successResponse(
      res,
      `बधाई! '${course.title}' में आपका नामांकन सफलतापूर्वक सम्पन्न हुआ।`,
      enrollment,
      201
    );
  } catch (error) {
    next(error);
  }
};

const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.id },
      include: {
        course: true,
      },
      orderBy: { enrolledAt: "desc" },
    });

    return successResponse(res, "नामांकित पाठ्यक्रम प्राप्त हुए", enrollments);
  } catch (error) {
    next(error);
  }
};

const updateProgress = async (req, res, next) => {
  try {
    const { enrollmentId, progressPercent } = req.body;

    if (!enrollmentId || progressPercent === undefined) {
      return errorResponse(res, "नामांकन आईडी एवं प्रगति प्रतिशत आवश्यक हैं", 400);
    }

    const percent = Math.min(100, Math.max(0, parseInt(progressPercent, 10)));
    const isCompleted = percent === 100;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(enrollmentId, 10) },
    });

    if (!enrollment || enrollment.userId !== req.user.id) {
      return errorResponse(res, "नामांकन रिकॉर्ड नहीं मिला अथवा अनधिकृत", 404);
    }

    const updated = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progressPercent: percent,
        status: isCompleted ? "COMPLETED" : "ACTIVE",
        completedAt: isCompleted ? new Date() : null,
      },
      include: { course: true },
    });

    return successResponse(res, "प्रगति अद्यतन हुई", updated);
  } catch (error) {
    next(error);
  }
};

const getTeacherStudents = async (req, res, next) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            city: true,
            education: true,
            createdAt: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            instructor: true,
            durationHours: true,
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    const studentsList = enrollments.map((e) => ({
      id: e.id,
      studentId: e.user.id,
      name: e.user.name,
      email: e.user.email,
      phone: e.user.phone || "—",
      avatar: e.user.avatar || "🕉️",
      city: e.user.city || "—",
      education: e.user.education || "संस्कृत स्वाध्यायी",
      courseTitle: e.course.title,
      courseId: e.course.id,
      progress: e.progressPercent,
      status: e.status === "COMPLETED" ? "सम्पन्न" : "सक्रिय",
      enrolledAt: e.enrolledAt,
    }));

    return successResponse(res, "शिक्षार्थी सूची प्राप्त हुई", studentsList);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  updateProgress,
  getTeacherStudents,
};
