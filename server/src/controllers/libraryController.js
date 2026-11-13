const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

const getBooks = async (req, res, next) => {
  try {
    const {
      category,
      search,
      language,
      sortBy = "title",
      limit = 100,
      page = 1,
      all = false,
    } = req.query;

    const where = {};

    // For public users, only return available books; for admin/all query, include all
    if (all !== "true" && all !== true) {
      where.isAvailable = true;
    }

    if (category && category !== "all") {
      where.category = category;
    }

    if (language && language !== "all") {
      where.language = { contains: language };
    }

    if (search && search.trim() !== "") {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { titleEn: { contains: q } },
        { author: { contains: q } },
        { authorEn: { contains: q } },
        { tags: { contains: q } },
        { description: { contains: q } },
      ];
    }

    let orderBy = { title: "asc" };
    if (sortBy === "rating") orderBy = { rating: "desc" };
    if (sortBy === "views") orderBy = { views: "desc" };
    if (sortBy === "downloads") orderBy = { downloads: "desc" };
    if (sortBy === "author") orderBy = { author: "asc" };
    if (sortBy === "newest") orderBy = { createdAt: "desc" };

    const take = parseInt(limit, 10) || 100;
    const skip = ((parseInt(page, 10) || 1) - 1) * take;

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
      page: parseInt(page, 10) || 1,
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

/**
 * Admin CRUD: Create Book
 */
const createBook = async (req, res, next) => {
  try {
    const {
      title,
      titleEn,
      author,
      authorEn,
      category = "mainBook",
      language = "संस्कृत",
      description,
      descriptionEn,
      pages = 100,
      year,
      rating = 5.0,
      image = "/images/blank_book.jpg",
      pdfUrl,
      tags,
      fileSize,
      format = "PDF",
      isAvailable = true,
    } = req.body;

    if (!title || !author || !description) {
      return errorResponse(
        res,
        "शीर्षक (Title), लेखक (Author) एवं विवरण (Description) अनिवार्य हैं",
        400
      );
    }

    const newBook = await prisma.libraryBook.create({
      data: {
        title: title.trim(),
        titleEn: titleEn ? titleEn.trim() : null,
        author: author.trim(),
        authorEn: authorEn ? authorEn.trim() : null,
        category: category || "mainBook",
        language: language || "संस्कृत",
        description: description.trim(),
        descriptionEn: descriptionEn ? descriptionEn.trim() : null,
        pages: parseInt(pages, 10) || 100,
        year: year ? String(year).trim() : null,
        rating: parseFloat(rating) || 5.0,
        views: 0,
        downloads: 0,
        image: image || "/images/blank_book.jpg",
        pdfUrl: pdfUrl ? pdfUrl.trim() : null,
        tags: tags ? String(tags).trim() : null,
        fileSize: fileSize ? String(fileSize).trim() : null,
        format: format || "PDF",
        isAvailable: isAvailable !== false,
      },
    });

    return successResponse(res, "नवीन ग्रन्थ सफलतापूर्वक पुस्तकालय में जोड़ा गया", newBook, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin CRUD: Update Book
 */
const updateBook = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return errorResponse(res, "अवैध पुस्तक आईडी", 400);

    const existing = await prisma.libraryBook.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, "ग्रन्थ प्राप्त नहीं हुआ", 404);

    const {
      title,
      titleEn,
      author,
      authorEn,
      category,
      language,
      description,
      descriptionEn,
      pages,
      year,
      rating,
      image,
      pdfUrl,
      tags,
      fileSize,
      format,
      isAvailable,
      views,
      downloads,
    } = req.body;

    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (titleEn !== undefined) data.titleEn = titleEn ? titleEn.trim() : null;
    if (author !== undefined) data.author = author.trim();
    if (authorEn !== undefined) data.authorEn = authorEn ? authorEn.trim() : null;
    if (category !== undefined) data.category = category;
    if (language !== undefined) data.language = language;
    if (description !== undefined) data.description = description.trim();
    if (descriptionEn !== undefined) data.descriptionEn = descriptionEn ? descriptionEn.trim() : null;
    if (pages !== undefined) data.pages = parseInt(pages, 10) || 0;
    if (year !== undefined) data.year = year ? String(year).trim() : null;
    if (rating !== undefined) data.rating = parseFloat(rating) || 5.0;
    if (image !== undefined) data.image = image;
    if (pdfUrl !== undefined) data.pdfUrl = pdfUrl ? pdfUrl.trim() : null;
    if (tags !== undefined) data.tags = tags ? String(tags).trim() : null;
    if (fileSize !== undefined) data.fileSize = fileSize ? String(fileSize).trim() : null;
    if (format !== undefined) data.format = format;
    if (isAvailable !== undefined) data.isAvailable = Boolean(isAvailable);
    if (views !== undefined) data.views = parseInt(views, 10) || 0;
    if (downloads !== undefined) data.downloads = parseInt(downloads, 10) || 0;

    const updated = await prisma.libraryBook.update({
      where: { id },
      data,
    });

    return successResponse(res, "ग्रन्थ विवरण सफलतापूर्वक अद्यतित किया गया", updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin CRUD: Delete Book
 */
const deleteBook = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return errorResponse(res, "अवैध पुस्तक आईडी", 400);

    const existing = await prisma.libraryBook.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, "ग्रन्थ प्राप्त नहीं हुआ", 404);

    await prisma.libraryBook.delete({ where: { id } });

    return successResponse(res, "ग्रन्थ सफलतापूर्वक पुस्तकालय से हटाया गया", { id });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin CRUD: Toggle Availability
 */
const toggleBookAvailability = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return errorResponse(res, "अवैध पुस्तक आईडी", 400);

    const existing = await prisma.libraryBook.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, "ग्रन्थ प्राप्त नहीं हुआ", 404);

    const updated = await prisma.libraryBook.update({
      where: { id },
      data: { isAvailable: !existing.isAvailable },
    });

    return successResponse(
      res,
      `ग्रन्थ की स्थिति को ${updated.isAvailable ? "उपलब्ध" : "स्थगित"} किया गया`,
      updated
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBooks,
  getBookById,
  recordDownload,
  recordView,
  createBook,
  updateBook,
  deleteBook,
  toggleBookAvailability,
};
