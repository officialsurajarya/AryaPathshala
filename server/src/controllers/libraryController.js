const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

const getBooks = async (req, res, next) => {
  try {
    const {
      category,
      search,
      language,
      sortBy = "title",
      limit = 50,
      page = 1,
    } = req.query;

    const where = { isAvailable: true };

    if (category && category !== "all") {
      where.category = category;
    }

    if (language && language !== "all") {
      where.language = { contains: language };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { titleEn: { contains: search } },
        { author: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    let orderBy = { title: "asc" };
    if (sortBy === "rating") orderBy = { rating: "desc" };
    if (sortBy === "views") orderBy = { views: "desc" };
    if (sortBy === "downloads") orderBy = { downloads: "desc" };
    if (sortBy === "author") orderBy = { author: "asc" };

    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    const [total, books] = await Promise.all([
      prisma.libraryBook.count({ where }),
      prisma.libraryBook.findMany({
        where,
        take,
        skip,
        orderBy,
      }),
    ]);

    return successResponse(res, "पुस्तकालय ग्रन्थ सूची प्राप्त हुई", {
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / take),
      books,
    });
  } catch (error) {
    next(error);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return errorResponse(res, "अवैध पुस्तक आईडी", 400);

    const book = await prisma.libraryBook.findUnique({
      where: { id },
    });

    if (!book) return errorResponse(res, "ग्रन्थ प्राप्त नहीं हुआ", 404);

    return successResponse(res, "ग्रन्थ विवरण प्राप्त हुआ", book);
  } catch (error) {
    next(error);
  }
};

const recordDownload = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return errorResponse(res, "अवैध पुस्तक आईडी", 400);

    const updated = await prisma.libraryBook.update({
      where: { id },
      data: {
        downloads: { increment: 1 },
      },
      select: { id: true, downloads: true },
    });

    return successResponse(res, "डाउनलोड दर्ज किया गया", updated);
  } catch (error) {
    next(error);
  }
};

const recordView = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return errorResponse(res, "अवैध पुस्तक आईडी", 400);

    const updated = await prisma.libraryBook.update({
      where: { id },
      data: {
        views: { increment: 1 },
      },
      select: { id: true, views: true },
    });

    return successResponse(res, "दृश्य (View) दर्ज किया गया", updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBooks,
  getBookById,
  recordDownload,
  recordView,
};
