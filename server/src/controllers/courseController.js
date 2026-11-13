const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

const getCourses = async (req, res, next) => {
  try {
    const { category, search, limit = 100, page = 1, includeDrafts } = req.query;

    const where = {};
    if (includeDrafts !== "true" && includeDrafts !== true) {
      where.isPublished = true;
    }

    if (category && category !== "all") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { titleEn: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    const [total, rawCourses] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        take,
        skip,
        include: {
          _count: {
            select: { enrollments: true },
          },
        },
        orderBy: { id: "asc" },
      }),
    ]);

    const courses = rawCourses.map((c) => ({
      ...c,
      studentsCount: c._count ? c._count.enrollments : (c.studentsCount || 0),
    }));

    return successResponse(res, "पाठ्यक्रम सूची प्राप्त हुई", {
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / take),
      courses,
    });
  } catch (error) {
    next(error);
  }
};

const getPublicStats = async (req, res, next) => {
  try {
    const [totalStudents, totalCourses, totalBooks] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.libraryBook.count({ where: { isAvailable: true } }),
    ]);

    return successResponse(res, "सार्वजनिक आँकड़े प्राप्त हुए", {
      totalStudents,
      totalCourses,
      totalBooks,
    });
  } catch (error) {
    next(error);
  }
};

const getCourseBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      return errorResponse(res, "पाठ्यक्रम नहीं मिला", 404);
    }

    return successResponse(res, "पाठ्यक्रम विवरण प्राप्त हुआ", course);
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = [
      { key: "all", label: "सभी", icon: "fa-list" },
      { key: "ved", label: "वेद", icon: "fa-book-reader" },
      { key: "vedang", label: "वेदांग", icon: "fa-scroll" },
      { key: "upanishad", label: "उपनिषद्", icon: "fa-om" },
      { key: "darshan", label: "दर्शनशास्त्र", icon: "fa-brain" },
      { key: "aarshgrantha", label: "अन्य आर्षग्रन्थ", icon: "fa-brain" },
      { key: "netexam25", label: "राष्ट्रीय पात्रता परीक्षा (संस्कृत 25)", icon: "fa-graduation-cap" },
      { key: "netexam73", label: "राष्ट्रीय पात्रता परीक्षा (संस्कृत 73)", icon: "fa-graduation-cap" },
    ];

    return successResponse(res, "श्रेणियां प्राप्त हुईं", categories);
  } catch (error) {
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const {
      slug, category, title, titleEn, description, syllabus, instructor, image,
      originalPrice, currentPrice, rating, durationHours,
      studentsCount, hasCertificate, badgeText, badgeType, isPublished,
    } = req.body;

    if (!slug || !category || !title || !description) {
      return errorResponse(res, "slug, category, title और description आवश्यक हैं", 400);
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/\s+/g, "-");
    const existing = await prisma.course.findUnique({ where: { slug: cleanSlug } });
    if (existing) {
      return errorResponse(res, "इस Slug के साथ पाठ्यक्रम पहले से मौजूद है", 400);
    }

    const course = await prisma.course.create({
      data: {
        slug: cleanSlug,
        category,
        title,
        titleEn,
        description,
        syllabus: syllabus || "",
        instructor: instructor || "आचार्य",
        image: image || "/images/blank_book.jpg",
        originalPrice: originalPrice || "₹0",
        currentPrice: currentPrice || "₹0",
        rating: rating ? parseFloat(rating) : 4.8,
        durationHours: durationHours ? parseInt(durationHours, 10) : 30,
        studentsCount: studentsCount ? parseInt(studentsCount, 10) : 0,
        hasCertificate: hasCertificate !== undefined ? Boolean(hasCertificate) : true,
        badgeText: badgeText || "",
        badgeType: badgeType || "popular",
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      },
    });

    return successResponse(res, "पाठ्यक्रम सफलतापूर्वक बनाया गया", course, 201);
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updates = { ...req.body };
    if (updates.rating !== undefined) updates.rating = parseFloat(updates.rating);
    if (updates.durationHours !== undefined) updates.durationHours = parseInt(updates.durationHours, 10);
    if (updates.studentsCount !== undefined) updates.studentsCount = parseInt(updates.studentsCount, 10);
    if (updates.hasCertificate !== undefined) updates.hasCertificate = Boolean(updates.hasCertificate);
    if (updates.isPublished !== undefined) updates.isPublished = Boolean(updates.isPublished);

    const course = await prisma.course.update({ where: { id }, data: updates });
    return successResponse(res, "पाठ्यक्रम सफलतापूर्वक अपडेट किया गया", course);
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.course.delete({ where: { id } });
    return successResponse(res, "पाठ्यक्रम सफलतापूर्वक हटाया गया");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourseBySlug,
  getCategories,
  getPublicStats,
  createCourse,
  updateCourse,
  deleteCourse,
};
