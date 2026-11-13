import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faBookOpen,
  faScroll,
  faSearch,
  faDownload,
  faHeart,
  faShareAlt,
  faUser,
  faLanguage,
  faTimes,
  faExternalLinkAlt,
  faSpinner,
  faCheck,
  faFilePdf,
  faLayerGroup,
  faInfoCircle,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { api } from '../api/client';
import DynamicBookCover from './DynamicBookCover';
import './LibrarySection.css';

const CATEGORIES = [
  { key: 'all', label: 'समग्र संग्रह', icon: faLayerGroup },
  { key: 'mainBook', label: 'मूल ग्रन्थ', icon: faBook },
  { key: 'VaykhyanBook', label: 'व्याख्यान ग्रन्थ', icon: faBookOpen },
  { key: 'VidhwatLekh', label: 'विद्वत् लेख व शोध', icon: faScroll },
];

export default function LibrarySection({ scrollToCategory }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage, setBooksPerPage] = useState(4);

  // Modal & Selection State
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  // Favorites in localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('arya_fav_books');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Save favorites to localStorage
  const toggleFavorite = (bookId, e) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(bookId)) {
        next.delete(bookId);
      } else {
        next.add(bookId);
      }
      try {
        localStorage.setItem('arya_fav_books', JSON.stringify([...next]));
      } catch (err) {
        console.warn('Favorite storage error:', err);
      }
      return next;
    });
  };

  // 1. Live DB Fetch from MySQL
  const fetchLiveBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/library?limit=150&all=false');
      if (res?.data?.books && Array.isArray(res.data.books)) {
        setBooks(res.data.books);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.warn('[LibrarySection] DB fetch error:', err.message);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveBooks();

    // Auto-sync when Admin adds, updates, or deletes books in the Admin Panel
    window.addEventListener('libraryUpdated', fetchLiveBooks);
    return () => {
      window.removeEventListener('libraryUpdated', fetchLiveBooks);
    };
  }, [fetchLiveBooks]);

  // Handle category navigation if passed via props
  useEffect(() => {
    if (scrollToCategory && ['mainBook', 'VaykhyanBook', 'VidhwatLekh'].includes(scrollToCategory)) {
      setActiveCategory(scrollToCategory);
      const section = document.getElementById('library');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [scrollToCategory]);

  // Dynamic counts per category
  const categoryCounts = useMemo(() => {
    const counts = { all: books.length, mainBook: 0, VaykhyanBook: 0, VidhwatLekh: 0 };
    books.forEach((b) => {
      if (counts[b.category] !== undefined) {
        counts[b.category]++;
      }
    });
    return counts;
  }, [books]);

  // Search & Filter & Sort Pipeline
  const filteredAndSortedBooks = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    const result = books.filter((book) => {
      // Category filter
      if (activeCategory !== 'all' && book.category !== activeCategory) {
        return false;
      }

      // Language filter
      if (filterLanguage !== 'all') {
        const lang = (book.language || '').toLowerCase();
        if (!lang.includes(filterLanguage.toLowerCase())) return false;
      }

      // Search query filter
      if (q) {
        const matchTitle = (book.title || '').toLowerCase().includes(q);
        const matchTitleEn = (book.titleEn || '').toLowerCase().includes(q);
        const matchAuthor = (book.author || '').toLowerCase().includes(q);
        const matchAuthorEn = (book.authorEn || '').toLowerCase().includes(q);
        const matchTags = (book.tags || '').toLowerCase().includes(q);
        const matchDesc = (book.description || '').toLowerCase().includes(q);
        if (!matchTitle && !matchTitleEn && !matchAuthor && !matchAuthorEn && !matchTags && !matchDesc) {
          return false;
        }
      }

      return true;
    });

    // Sorting (Rating removed)
    return result.sort((a, b) => {
      switch (sortBy) {
        case 'author':
          return (a.author || '').localeCompare(b.author || '', 'hi');
        case 'latest':
          return (b.id || 0) - (a.id || 0);
        case 'title':
        default:
          return (a.title || '').localeCompare(b.title || '', 'hi');
      }
    });
  }, [books, activeCategory, filterLanguage, searchTerm, sortBy]);

  // Reset to page 1 on filter, search or per-page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeCategory, filterLanguage, sortBy, booksPerPage]);

  const effectivePerPage = booksPerPage === 'all' ? 9999 : Number(booksPerPage);
  const totalBooksCount = filteredAndSortedBooks.length;
  const totalPages = Math.max(1, Math.ceil(totalBooksCount / effectivePerPage));
  const startIndex = (currentPage - 1) * effectivePerPage;

  const paginatedBooks = useMemo(() => {
    return filteredAndSortedBooks.slice(startIndex, startIndex + effectivePerPage);
  }, [filteredAndSortedBooks, startIndex, effectivePerPage]);

  // Pagination numbers strictly following: First page number ... current Page no. ... last page no.
  // Example: Total page 20 current page 8 => < 1 ... 8 ... 20 >
  // Example: Total page 4 current page 3  => < 1 ... 3 ... 4 >
  const paginationItems = useMemo(() => {
    if (totalPages <= 1) return [1];
    if (totalPages === 2) return [1, 2];

    // When on page 1: 1 ... last
    if (currentPage === 1) {
      return [1, 'dots-end', totalPages];
    }

    // When on last page: 1 ... last
    if (currentPage === totalPages) {
      return [1, 'dots-start', totalPages];
    }

    // When on any intermediate page (e.g. 1 ... current ... total)
    return [1, 'dots-start', currentPage, 'dots-end', totalPages];
  }, [currentPage, totalPages]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    const el = document.getElementById('library-books-grid') || document.getElementById('library');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Open Book Modal & Record View
  const handleOpenBookModal = (book) => {
    setSelectedBook(book);
    setShowModal(true);
    setCopyToast(false);

    // Call View counter endpoint in DB (non-blocking)
    if (book?.id) {
      api.post(`/library/${book.id}/view`)
        .then((res) => {
          if (res?.data?.views) {
            setBooks((prev) =>
              prev.map((b) => (b.id === book.id ? { ...b, views: res.data.views } : b))
            );
            setSelectedBook((prev) => (prev ? { ...prev, views: res.data.views } : prev));
          }
        })
        .catch(() => { });
    }
  };

  // Handle Download action
  const handleDownloadBook = (book, e) => {
    if (e) e.stopPropagation();
    if (!book) return;

    // Call Download counter in DB
    if (book.id) {
      api.post(`/library/${book.id}/download`)
        .then((res) => {
          if (res?.data?.downloads) {
            setBooks((prev) =>
              prev.map((b) => (b.id === book.id ? { ...b, downloads: res.data.downloads } : b))
            );
            if (selectedBook && selectedBook.id === book.id) {
              setSelectedBook((prev) => ({ ...prev, downloads: res.data.downloads }));
            }
          }
        })
        .catch(() => { });
    }

    // Trigger download or open PDF link
    const link = book.pdfUrl || 'https://archive.org/details/RigVedaWithSayanaBhashya';
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  // Handle Share action
  const handleShareBook = (book) => {
    const shareText = `${book.title} — आर्य पाठशाला वैदिक डिजिटल पुस्तकालय`;
    const shareUrl = `${window.location.origin}#library`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2500);
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'mainBook':
        return 'मूल ग्रन्थ';
      case 'VaykhyanBook':
        return 'व्याख्यान ग्रन्थ';
      case 'VidhwatLekh':
        return 'विद्वत् शोध पत्र';
      default:
        return 'वैदिक ग्रन्थ';
    }
  };

  return (
    <section className="library-section" id="library" aria-label="आर्य पाठशाला डिजिटल पुस्तकालय">
      {/* Background Sanskrit Calligraphy Decor */}
      <div className="library-bg-decor" aria-hidden="true">ॐ</div>

      <Container className="library-container">
        {/* Section Header */}
        <div className="library-header">
          <div className="library-heading-badge">
            <FontAwesomeIcon icon={faBookOpen} />
            <span>आर्ष डिजिटल ग्रन्थागार</span>
          </div>

          <h2 className="library-title">
            पुस्तकालय संग्रह
            <span className="library-title-underline" />
          </h2>

          <p className="library-subtitle">
            प्राचीन आर्ष एवं वैदिक ग्रन्थों से लेकर आधुनिक शास्त्रीय शोध पत्रों तक का समृद्ध डिजिटल संग्रह।
            ज्ञान की अनमोल निधि को आपके अध्ययन हेतु सहेज कर प्रस्तुत किया गया है।
          </p>

          {/* Library Features Strip */}
          <div className="library-features-strip">
            <div className="library-feature-item">
              <span className="feature-icon">📜</span>
              <div className="feature-text">
                <strong>प्रामाणिक आर्ष ग्रन्थ</strong>
                <span>वेद, उपनिषद्, दर्शन व शोध</span>
              </div>
            </div>
            <div className="library-feature-item">
              <span className="feature-icon">📥</span>
              <div className="feature-text">
                <strong>निःशुल्क PDF डाउनलोड</strong>
                <span>सम्पूर्ण प्रतियां एक-क्लिक में</span>
              </div>
            </div>
            <div className="library-feature-item">
              <span className="feature-icon">👁️</span>
              <div className="feature-text">
                <strong>डिजिटल पठन कक्ष</strong>
                <span>ऑनलाइन अध्ययन व सन्दर्भ</span>
              </div>
            </div>
            <div className="library-feature-item">
              <span className="feature-icon">🔍</span>
              <div className="feature-text">
                <strong>स्मार्ट विषय खोज</strong>
                <span>शीर्षक, मन्त्र व लेखक फ़िल्टर</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="library-categories-wrapper">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={`library-cat-tab ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              <FontAwesomeIcon icon={cat.icon} />
              <span>{cat.label}</span>
              <span className="tab-count">{categoryCounts[cat.key] || 0}</span>
            </button>
          ))}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="library-toolbar">
          {/* Search Box */}
          <div className="library-search-box">
            <FontAwesomeIcon icon={faSearch} className="library-search-icon" />
            <input
              type="text"
              className="library-search-input"
              placeholder="ग्रन्थ, लेखक, विषय या मन्त्र खोजें..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="library-search-clear"
                onClick={() => setSearchTerm('')}
                title="खोज रिक्त करें"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="library-dropdowns">
            {/* Language Filter */}
            <div className="library-select-wrapper">
              <FontAwesomeIcon icon={faLanguage} />
              <select
                className="library-select"
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                aria-label="भाषा फ़िल्टर"
              >
                <option value="all">समस्त भाषाएँ</option>
                <option value="संस्कृत">संस्कृत</option>
                <option value="हिन्दी">हिन्दी</option>
                <option value="संस्कृत-हिन्दी">संस्कृत-हिन्दी</option>
              </select>
            </div>

            {/* Sort Dropdown (Rating removed) */}
            <div className="library-select-wrapper">
              <span>क्रम:</span>
              <select
                className="library-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="क्रमबद्ध करें"
              >
                <option value="title">वर्णमाला (अ - ह)</option>
                <option value="author">लेखक नाम</option>
                <option value="latest">नवीनतम ग्रन्थ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active View & Pagination Stats Bar */}
        <div className="library-view-stats-row">
          <div className="library-count-text">
            <FontAwesomeIcon icon={faBookOpen} />
            <span>
              प्रदर्शित ग्रन्थ: <strong>{totalBooksCount === 0 ? 0 : `${startIndex + 1}–${Math.min(startIndex + effectivePerPage, totalBooksCount)}`}</strong> / कुल <strong>{totalBooksCount}</strong>
            </span>
          </div>

          <div className="library-per-page-selector">
            <span className="per-page-label">प्रति पृष्ठ देखें:</span>
            {[4, 8, 12, 'all'].map((opt) => (
              <button
                key={opt}
                type="button"
                className={`btn-per-page ${booksPerPage === opt ? 'active' : ''}`}
                onClick={() => {
                  setBooksPerPage(opt);
                  setCurrentPage(1);
                }}
              >
                {opt === 'all' ? 'सभी' : opt}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="text-center py-5">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-secondary mb-3" />
            <p className="text-muted fw-bold">पुस्तकालय ग्रन्थ लोड हो रहे हैं...</p>
          </div>
        ) : filteredAndSortedBooks.length > 0 ? (
          <>
            <div className="library-books-grid" id="library-books-grid">
              {paginatedBooks.map((book) => {
                const isFav = favorites.has(book.id);

                return (
                  <div key={book.id} className="library-book-card">
                    {/* Book Cover Container with Integrated Badges */}
                    <div
                      className="library-card-cover-stage"
                      onClick={() => handleOpenBookModal(book)}
                      role="button"
                      tabIndex={0}
                      title={`${book.title} का विस्तृत विवरण देखें`}
                    >
                      {/* Category Badge */}
                      <span className="library-card-badge">
                        {getCategoryLabel(book.category)}
                      </span>

                      {/* Favorite Bookmark Button */}
                      <button
                        type="button"
                        className={`library-fav-btn ${isFav ? 'favorited' : ''}`}
                        onClick={(e) => toggleFavorite(book.id, e)}
                        title={isFav ? 'पसंदीदा से हटाएं' : 'पसंदीदा में जोड़ें'}
                      >
                        <FontAwesomeIcon icon={faHeart} />
                      </button>

                      {/* Dynamic 3D Book Cover fills natural space */}
                      <DynamicBookCover
                        title={book.title}
                        alt={book.title}
                        className="library-card-cover-img"
                      />
                    </div>

                    {/* Card Content (NO RATING) */}
                    <div className="library-card-body">
                      <h3
                        className="library-card-title"
                        onClick={() => handleOpenBookModal(book)}
                      >
                        {book.title}
                      </h3>

                      <div className="library-card-author">
                        <FontAwesomeIcon icon={faUser} className="text-muted" />
                        <span>{book.author}</span>
                      </div>

                      <p className="library-card-desc">
                        {book.description}
                      </p>

                      {/* Metadata Chips */}
                      <div className="library-meta-chips">
                        <span className="library-chip">
                          <FontAwesomeIcon icon={faLanguage} />
                          {book.language || 'संस्कृत'}
                        </span>
                        {book.pages && (
                          <span className="library-chip">
                            <FontAwesomeIcon icon={faBookOpen} />
                            {book.pages} पृष्ठ
                          </span>
                        )}
                        <span className="library-chip">
                          <FontAwesomeIcon icon={faFilePdf} />
                          {book.format || 'PDF'}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="library-card-actions">
                        <button
                          type="button"
                          className="btn-library-view"
                          onClick={() => handleOpenBookModal(book)}
                        >
                          <FontAwesomeIcon icon={faInfoCircle} />
                          <span>विवरण एवं अध्ययन</span>
                        </button>

                        <button
                          type="button"
                          className="btn-library-dl"
                          onClick={(e) => handleDownloadBook(book, e)}
                          title="ग्रन्थ डाउनलोड करें (Download PDF)"
                        >
                          <FontAwesomeIcon icon={faDownload} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls — Always Visible for clear navigation */}
            {totalBooksCount > 0 && (
              <div className="library-pagination-wrapper">
                <div className="library-pagination">
                  <button
                    type="button"
                    className="library-page-nav-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    title="पिछला पृष्ठ"
                    aria-label="Previous Page"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>

                  <div className="library-page-numbers">
                    {paginationItems.map((item, idx) => {
                      if (typeof item === 'string') {
                        return (
                          <span key={`dots-${idx}`} className="library-page-dots" aria-hidden="true">
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={item}
                          type="button"
                          className={`library-page-btn ${item === currentPage ? 'active' : ''}`}
                          onClick={() => handlePageChange(item)}
                          title={`पृष्ठ ${item}`}
                          aria-current={item === currentPage ? 'page' : undefined}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="library-page-nav-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    title="अगला पृष्ठ"
                    aria-label="Next Page"
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>

                <div className="library-pagination-info">
                  पृष्ठ {currentPage} / {totalPages} (प्रदर्शित ग्रन्थ: {totalBooksCount === 0 ? 0 : `${startIndex + 1}–${Math.min(startIndex + effectivePerPage, totalBooksCount)}`} / कुल {totalBooksCount} ग्रन्थ)
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="library-empty-state">
            <FontAwesomeIcon icon={faBook} className="library-empty-icon" />
            <h4 className="library-empty-title">कोई ग्रन्थ प्राप्त नहीं हुआ</h4>
            <p className="library-empty-subtitle">
              कृपया अपनी खोज शब्दावली बदलें अथवा फ़िल्टर को रीसेट करें।
            </p>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('all');
                setFilterLanguage('all');
              }}
            >
              समस्त फ़िल्टर हटाएं
            </Button>
          </div>
        )}
      </Container>

      {/* ── Interactive Book Details & Study Modal ──────────── */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        className="library-modal"
      >
        {selectedBook && (
          <>
            <Modal.Header closeButton className="library-modal-header">
              <Modal.Title className="d-flex align-items-center gap-2 text-white">
                <FontAwesomeIcon icon={faBookOpen} className="text-warning" />
                <span>ग्रन्थ अध्ययन एवं विवरण कक्ष</span>
              </Modal.Title>
            </Modal.Header>

            <Modal.Body className="library-modal-body">
              <Row className="g-4 align-items-center">
                {/* 3D Book Cover View */}
                <Col md={5}>
                  <div className="library-modal-cover-box">
                    <div style={{ width: '100%', maxWidth: '240px' }}>
                      <DynamicBookCover
                        title={selectedBook.title}
                        alt={selectedBook.title}
                        className="w-100"
                      />
                    </div>
                  </div>
                </Col>

                {/* Detailed Information (NO RATING) */}
                <Col md={7}>
                  <div className="library-modal-details">
                    <h3 className="library-modal-title">{selectedBook.title}</h3>
                    {selectedBook.titleEn && (
                      <p className="library-modal-title-en">{selectedBook.titleEn}</p>
                    )}

                    <table className="library-meta-table">
                      <tbody>
                        <tr>
                          <td>लेखक / सम्पादक:</td>
                          <td><strong>{selectedBook.author}</strong></td>
                        </tr>
                        <tr>
                          <td>श्रेणी:</td>
                          <td>{getCategoryLabel(selectedBook.category)}</td>
                        </tr>
                        <tr>
                          <td>भाषा:</td>
                          <td>{selectedBook.language || 'संस्कृत'}</td>
                        </tr>
                        {selectedBook.pages && (
                          <tr>
                            <td>पृष्ठ संख्या:</td>
                            <td>{selectedBook.pages} पृष्ठ</td>
                          </tr>
                        )}
                        {selectedBook.year && (
                          <tr>
                            <td>रचना काल / वर्ष:</td>
                            <td>{selectedBook.year}</td>
                          </tr>
                        )}
                        <tr>
                          <td>प्रारूप / आकार:</td>
                          <td>{selectedBook.format || 'PDF'} ({selectedBook.fileSize || 'उपलब्ध'})</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="library-modal-desc-heading">ग्रन्थ परिचय एवं वैशिष्ट्य:</div>
                    <p className="library-modal-desc">
                      {selectedBook.description}
                    </p>

                    {/* Tags */}
                    {selectedBook.tags && (
                      <div className="library-modal-tags">
                        {selectedBook.tags.split(',').map((tag, i) => (
                          <span key={i} className="library-tag-pill">
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="library-modal-actions">
                      <button
                        type="button"
                        className="btn-modal-dl"
                        onClick={() => handleDownloadBook(selectedBook)}
                      >
                        <FontAwesomeIcon icon={faDownload} />
                        <span>ग्रन्थ डाउनलोड करें (PDF)</span>
                      </button>

                      <button
                        type="button"
                        className="btn-modal-read"
                        onClick={() => {
                          const url = selectedBook.pdfUrl || 'https://archive.org/details/RigVedaWithSayanaBhashya';
                          window.open(url, '_blank', 'noopener,noreferrer');
                          if (selectedBook.id) {
                            api.post(`/library/${selectedBook.id}/view`).catch(() => { });
                          }
                        }}
                      >
                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                        <span>ऑनलाइन पढ़ें</span>
                      </button>

                      <button
                        type="button"
                        className="btn-modal-share"
                        onClick={() => handleShareBook(selectedBook)}
                        title="लिंक कॉपी करें"
                      >
                        <FontAwesomeIcon icon={copyToast ? faCheck : faShareAlt} />
                        <span>{copyToast ? 'कॉपी हुआ!' : 'साझा करें'}</span>
                      </button>
                    </div>
                  </div>
                </Col>
              </Row>
            </Modal.Body>
          </>
        )}
      </Modal>
    </section>
  );
}
