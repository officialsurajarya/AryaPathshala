const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

const getCourses = async (req, res, next) => {
  try {
    const { category, search, limit = 50, page = 1 } = req.query;

    const where = { isPublished: true };

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

    const [total, courses] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        take,
        skip,
        orderBy: { id: "asc" },
      }),
    ]);

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
      slug, category, title, titleEn, description, image,
      originalPrice, currentPrice, rating, durationHours,
      studentsCount, hasCertificate, badgeText, badgeType, isPublished,
    } = req.body;

    if (!slug || !category || !title || !description) {
      return errorResponse(res, "slug, category, title और description आवश्यक हैं", 400);
    }

    const course = await prisma.course.create({
      data: {
        slug, category, title, titleEn, description,
        image: image || "/images/default.jpg",
        originalPrice: originalPrice || "₹0",
        currentPrice: currentPrice || "₹0",
        rating: rating ? parseFloat(rating) : 4.8,
        durationHours: durationHours ? parseInt(durationHours) : 30,
        studentsCount: studentsCount ? parseInt(studentsCount) : 0,
        hasCertificate: hasCertificate !== undefined ? hasCertificate : true,
        badgeText, badgeType,
        isPublished: isPublished !== undefined ? isPublished : true,
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
    if (updates.rating) updates.rating = parseFloat(updates.rating);
    if (updates.durationHours) updates.durationHours = parseInt(updates.durationHours);
    if (updates.studentsCount) updates.studentsCount = parseInt(updates.studentsCount);

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
    return successResponse(res, "पाठ्यक्रम हटाया गया");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourseBySlug,
  getCategories,
  createCourse,
  updateCourse,
  deleteCourse,
};
