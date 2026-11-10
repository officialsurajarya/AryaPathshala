import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBook,
    faBookOpen,
    faScroll,
    faSearch,
    faDownload,
    faEye,
    faHeart,
    faShare,
    faStar,
    faUser,
    faCalendar,
    faLanguage,
    faFileAlt,
    faTags,
    faChevronDown,
    faChevronUp
} from '@fortawesome/free-solid-svg-icons';

const LibrarySection = ({ scrollToCategory }) => {
    // const LibrarySection = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBook, setSelectedBook] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [favorites, setFavorites] = useState(new Set());
    const [expandedCards, setExpandedCards] = useState(new Set());
    const [sortBy, setSortBy] = useState('title');
    const [filterLanguage, setFilterLanguage] = useState('all');

    useEffect(() => {
        if (scrollToCategory && ['mainBook', 'VaykhyanBook', 'VidhwatLekh'].includes(scrollToCategory)) {
            setActiveCategory(scrollToCategory);
            const section = document.getElementById('library');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [scrollToCategory]);

    // Sample library data
    const libraryData = {
        mainBooks: [
            {
                id: 1,
                title: 'ऋग्वेद संहिता',
                titleEn: 'Rigveda Samhita',
                author: 'ऋषि मण्डल',
                authorEn: 'Rishi Mandal',
                category: 'mainBook',
                language: 'संस्कृत',
                description: 'वैदिक साहित्य का आदि ग्रन्थ, चार वेदों में प्रथम एवं प्राचीनतम',
                descriptionEn: 'The first and oldest of the four Vedas, foundational text of Vedic literature',
                pages: 1028,
                year: 'प्राचीन काल',
                rating: 5,
                views: 15420,
                downloads: 8932,
                tags: ['वेद', 'मन्त्र', 'यज्ञ', 'देवता'],
                fileSize: '45 MB',
                format: 'PDF',
                image: '/images/Rigveda.jpg'
            },
            {
                id: 2,
                title: 'श्रीमद्भगवद्गीता',
                titleEn: 'Shrimad Bhagavad Gita',
                author: 'महर्षि वेदव्यास',
                authorEn: 'Maharshi Vedvyas',
                category: 'mainBook',
                language: 'संस्कृत',
                description: 'कर्म, भक्ति और ज्ञान योग का अमूल्य ग्रन्थ, जीवन दर्शन की सम्पूर्ण शिक्षा',
                descriptionEn: 'Invaluable text on Karma, Bhakti and Gyan Yoga, complete teaching of life philosophy',
                pages: 700,
                year: 'द्वापर युग',
                rating: 5,
                views: 25670,
                downloads: 15432,
                tags: ['गीता', 'योग', 'धर्म', 'कृष्ण'],
                fileSize: '28 MB',
                format: 'PDF',
                image: '/images/BhagavadGita.jpg'
            },
            {
                id: 3,
                title: 'उपनिषद् संग्रह',
                titleEn: 'Upanishad Collection',
                author: 'विविध ऋषिगण',
                authorEn: 'Various Rishis',
                category: 'mainBook',
                language: 'संस्कृत',
                description: 'वेदान्त दर्शन के मूलभूत ग्रन्थ, आत्मा और ब्रह्म की गहन विवेचना',
                descriptionEn: 'Fundamental texts of Vedanta philosophy, deep analysis of Atman and Brahman',
                pages: 892,
                year: 'वैदिक काल',
                rating: 5,
                views: 12340,
                downloads: 7890,
                tags: ['उपनिषद्', 'वेदान्त', 'आत्मा', 'ब्रह्म'],
                fileSize: '52 MB',
                format: 'PDF',
                image: '/images/Ishopanishad.jpg'
            }
        ],
        commentaryBooks: [
            {
                id: 4,
                title: 'भगवद्गीता भाष्य',
                titleEn: 'Bhagavad Gita Bhashya',
                author: 'आचार्य शङ्कर',
                authorEn: 'Acharya Shankara',
                category: 'VaykhyanBook',
                language: 'संस्कृत',
                description: 'श्रीमद्भगवद्गीता की आद्य शङ्कराचार्य कृत प्रामाणिक व्याख्या',
                descriptionEn: 'Authentic commentary on Bhagavad Gita by Adi Shankaracharya',
                pages: 456,
                year: '8वीं शताब्दी',
                rating: 4.8,
                views: 8920,
                downloads: 5430,
                tags: ['भाष्य', 'शङ्कर', 'अद्वैत', 'वेदान्त'],
                fileSize: '35 MB',
                format: 'PDF',
                image: '/images/BhagavadGita.jpg'
            },
            {
                id: 5,
                title: 'ऋग्वेद पदपाठ भाष्य',
                titleEn: 'Rigveda Padapatha Bhashya',
                author: 'सायणाचार्य',
                authorEn: 'Sayanacharya',
                category: 'VaykhyanBook',
                language: 'संस्कृत',
                description: 'ऋग्वेद मन्त्रों की विस्तृत एवं प्रामाणिक व्याख्या',
                descriptionEn: 'Detailed and authentic commentary on Rigveda mantras',
                pages: 1234,
                year: '14वीं शताब्दी',
                rating: 4.9,
                views: 6780,
                downloads: 4210,
                tags: ['ऋग्वेद', 'पदपाठ', 'सायण', 'मन्त्र'],
                fileSize: '78 MB',
                format: 'PDF',
                image: '/images/Rigveda.jpg'
            }
        ],
        researchPapers: [
            {
                id: 6,
                title: 'वैदिक संस्कृति में नारी की स्थिति',
                titleEn: 'Status of Women in Vedic Culture',
                author: 'डॉ. सुमित्रा शर्मा',
                authorEn: 'Dr. Sumitra Sharma',
                category: 'VidhwatLekh',
                language: 'हिन्दी',
                description: 'वैदिक काल में महिलाओं की सामाजिक, धार्मिक और शैक्षणिक स्थिति का विश्लेषण',
                descriptionEn: 'Analysis of social, religious and educational status of women in Vedic period',
                pages: 85,
                year: '2023',
                rating: 4.5,
                views: 3240,
                downloads: 1890,
                tags: ['शोध', 'नारी', 'वैदिक', 'समाज'],
                fileSize: '12 MB',
                format: 'PDF',
                image: '/images/Manusmriti.jpg'
            },
            {
                id: 7,
                title: 'संस्कृत व्याकरण में छन्द विज्ञान',
                titleEn: 'Prosody in Sanskrit Grammar',
                author: 'प्रो. राजेश पाण्डेय',
                authorEn: 'Prof. Rajesh Pandey',
                category: 'VidhwatLekh',
                language: 'संस्कृत-हिन्दी',
                description: 'संस्कृत काव्य में छन्द की महत्ता एवं व्याकरणिक संरचना का अध्ययन',
                descriptionEn: 'Study of importance and grammatical structure of prosody in Sanskrit poetry',
                pages: 120,
                year: '2024',
                rating: 4.7,
                views: 2876,
                downloads: 1654,
                tags: ['व्याकरण', 'छन्द', 'काव्य', 'पिङ्गल'],
                fileSize: '18 MB',
                format: 'PDF',
                image: '/images/VyakaranVedang.jpg'
            }
        ]
    };

    // Flatten all books for search and filter
    const allBooks = [
        ...libraryData.mainBooks,
        ...libraryData.commentaryBooks,
        ...libraryData.researchPapers
    ];

    // Filter and search logic – show only 1st of each type in 'all' filter
    let filteredBooks;
    if (activeCategory === 'all') {
        // Only take first book of each type that matches search and language
        const bookGroups = [libraryData.mainBooks, libraryData.commentaryBooks, libraryData.researchPapers];
        filteredBooks = bookGroups
            .map(group => group.find(book => {
                const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    book.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    book.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
                const matchesLanguage = filterLanguage === 'all' || book.language.includes(filterLanguage);
                return matchesSearch && matchesLanguage;
            }))
            .filter(Boolean); // Remove undefined if not found in group
    } else {
        filteredBooks = allBooks.filter(book => {
            const matchesCategory = book.category === activeCategory;
            const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesLanguage = filterLanguage === 'all' || book.language.includes(filterLanguage);
            return matchesCategory && matchesSearch && matchesLanguage;
        });
    }

    // Sort books
    const sortedBooks = [...filteredBooks].sort((a, b) => {
        switch (sortBy) {
            case 'title':
                return a.title.localeCompare(b.title);
            case 'author':
                return a.author.localeCompare(b.author);
            case 'rating':
                return b.rating - a.rating;
            case 'views':
                return b.views - a.views;
            case 'downloads':
                return b.downloads - a.downloads;
            default:
                return 0;
        }
    });

    const toggleFavorite = (bookId) => {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(bookId)) {
            newFavorites.delete(bookId);
        } else {
            newFavorites.add(bookId);
        }
        setFavorites(newFavorites);
    };

    const toggleExpanded = (cardId) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(cardId)) {
            newExpanded.delete(cardId);
        } else {
            newExpanded.add(cardId);
        }
        setExpandedCards(newExpanded);
    };

    const handleBookClick = (book) => {
        setSelectedBook(book);
        setShowModal(true);
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <FontAwesomeIcon
                key={i}
                icon={faStar}
                className={i < Math.floor(rating) ? "text-warning" : "text-muted"}
                style={{ fontSize: '0.8rem' }}
            />
        ));
    };

    return (
        <section className='py-5 library' id="library" style={{
            background: 'var(--gradient-to-top)',
            paddingBottom: '80px'
        }}>
            <Container>
                {/* Section Header */}
                <div className="text-center mb-5 ">
                    <h1 className='LibraryHeading' style={{
                        fontFamily: "'Tiro Devanagari Sanskrit', serif",
                        fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
                        fontWeight: '600',
                        color: 'var(--primary-color)',
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, var(--primary-color), var(--main-color))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                    }}>
                        पुस्तकालय संग्रह
                        <span style={{
                            position: 'absolute',
                            bottom: '0',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '40%',            // Control underline length here
                            height: '4px',           // Thickness of underline
                            background: 'linear-gradient(135deg, var(--secondary-color),var(--primary-color))',
                            borderRadius: '2px'
                        }} />
                    </h1>
                    <br />
                    <br />
                    <br />
                    <Row>
                        <Col lg={6} md={10} className="mx-auto">
                            <p className='subtitle' style={{
                                // fontSize: '1.2rem',
                                margin: '0 auto !important',
                                lineHeight: '1.6',
                            }}>
                                प्राचीन ग्रन्थों से लेकर आधुनिक शोध पत्रों तक का विस्तृत संग्रह।
                                ज्ञान की अनमोल निधि को डिजिटल रूप में संजोया गया है।
                            </p>
                        </Col>
                    </Row>

                </div>

                {/* Search and Filter Controls */}
                <Row className="mb-4 justify-content-between">
                    <Col lg={6} md={12} className="mb-3 ">
                        <InputGroup className="LibrarySearchBar">
                            <InputGroup.Text style={{
                                background: 'white', border: '1px solid var(--border-color, #e2e8f0)',
                                borderRadius: '25px 0 0 25px'
                            }}>
                                <FontAwesomeIcon icon={faSearch} style={{ color: 'var(--ash)' }} />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="पुस्तक, लेखक या विषय खोजें..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    border: '1px solid var(--border-color, #e2e8f0)',
                                    borderLeft: 'none',
                                    fontSize: '1rem',
                                    padding: '0.75rem',
                                    borderRadius: '0 25px 25px 0'
                                }}
                            />
                        </InputGroup>
                    </Col>

                    <Col lg={4} md={12}>
                        <Row className="g-2 LibraryFilterBar">
                            <Col xs={4} >
                                <Form.Select
                                    value={activeCategory}
                                    onChange={(e) => setActiveCategory(e.target.value)}
                                    style={{
                                        border: '1px solid var(--primary-color)',
                                        fontSize: '0.9rem',
                                        padding: '0.75rem',
                                        borderRadius: '20px 0',
                                        backgroundColor: 'var(--light-bg)'

                                    }}
                                >
                                    <option value="all">सभी श्रेणियाँ</option>
                                    <option value="mainBook">मूल ग्रन्थ</option>
                                    <option value="VaykhyanBook">व्याख्यान ग्रन्थ</option>
                                    <option value="VidhwatLekh">शोध पत्र</option>
                                </Form.Select>
                            </Col>

                            <Col xs={4}>
                                <Form.Select
                                    value={filterLanguage}
                                    onChange={(e) => setFilterLanguage(e.target.value)}
                                    style={{
                                        border: '1px solid var(--primary-color)',
                                        fontSize: '0.9rem',
                                        padding: '0.75rem',
                                        borderRadius: '20px 0',
                                        backgroundColor: 'var(--light-bg)'

                                    }}
                                >
                                    <option value="all">सभी भाषाएँ</option>
                                    <option value="संस्कृत">संस्कृत</option>
                                    <option value="हिन्दी">हिन्दी</option>
                                </Form.Select>
                            </Col>

                            <Col xs={4}>
                                <Form.Select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={{
                                        border: '1px solid var(--primary-color)',
                                        fontSize: '0.9rem',
                                        padding: '0.75rem',
                                        borderRadius: '20px 0',
                                        backgroundColor: 'var(--light-bg)'


                                    }}
                                >
                                    <option value="title">शीर्षक से</option>
                                    <option value="author">लेखक से</option>
                                    <option value="rating">रेटिंग से</option>
                                    <option value="views">लोकप्रियता से</option>
                                    <option value="downloads">डाउनलोड से</option>
                                </Form.Select>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                {/* Results Summary */}
                <div className="mb-4">
                    <p style={{ color: 'var(--ash)', fontSize: '0.95rem' }}>
                        <strong>{sortedBooks.length}</strong> पुस्तकें मिलीं
                        {searchTerm && ` "${searchTerm}" के लिए`}
                        {activeCategory !== 'all' && ` ${activeCategory === 'mainBook' ? 'मूल ग्रन्थ' :
                            activeCategory === 'VaykhyanBook' ? 'व्याख्यान ग्रन्थ' : 'शोध पत्र'} श्रेणी में`}
                    </p>
                </div>

                {/* Books Grid */}
                <Row className="g-4">
                    {sortedBooks.map((book) => (
                        <Col key={book.id} lg={4} md={6} sm={12}>
                            <Card className="h-100 shadow-sm hover-card"
                                style={{
                                    border: '1px solid rgba(212, 175, 55, 0.2)',
                                    borderRadius: '15px',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    background: 'white'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(199, 54, 89, 0.15)';
                                    e.currentTarget.style.borderColor = 'var(--secondary-color)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                                }}
                            >
                                <div className="position-relative">
                                    <div style={{
                                        background: 'linear-gradient(135deg, var(--primary-color), var(--main-color))',
                                        height: '200px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '3rem'
                                    }}>
                                        <FontAwesomeIcon
                                            icon={book.category === 'mainBook' ? faBook :
                                                book.category === 'VaykhyanBook' ? faBookOpen : faScroll}
                                        />
                                    </div>

                                    {/* Category Badge */}
                                    <div className="position-absolute top-0 start-0 m-2">
                                        <span className="badge rounded-pill px-3 py-1" style={{
                                            background: 'rgba(255, 255, 255, 0.9)',
                                            color: 'var(--primary-color)',
                                            fontSize: '0.7rem',
                                            fontWeight: '600'
                                        }}>
                                            {book.category === 'mainBook' ? 'मूल ग्रन्थ' :
                                                book.category === 'VaykhyanBook' ? 'व्याख्यान' : 'शोध पत्र'}
                                        </span>
                                    </div>

                                    {/* Favorite Button */}
                                    <div className="position-absolute top-0 end-0 m-2">
                                        <button
                                            className="btn btn-sm rounded-circle"
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.9)',
                                                border: 'none',
                                                width: '35px',
                                                height: '35px'
                                            }}
                                            onClick={() => toggleFavorite(book.id)}
                                        >
                                            <FontAwesomeIcon
                                                icon={faHeart}
                                                style={{
                                                    color: favorites.has(book.id) ? 'var(--primary-color)' : 'var(--ash)'
                                                }}
                                            />
                                        </button>
                                    </div>
                                </div>

                                <Card.Body className="p-4">
                                    <div className="mb-3">
                                        <h5 style={{
                                            fontFamily: "'Tiro Devanagari Sanskrit', serif",
                                            fontWeight: '600',
                                            color: 'var(--text-color)',
                                            marginBottom: '0.5rem',
                                            lineHeight: '1.3'
                                        }}>
                                            {book.title}
                                        </h5>
                                        <p style={{
                                            fontSize: '0.85rem',
                                            color: 'var(--ash)',
                                            fontStyle: 'italic',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {book.titleEn}
                                        </p>

                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <FontAwesomeIcon icon={faUser} style={{ color: 'var(--ash)', fontSize: '0.8rem' }} />
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>
                                                {book.author}
                                            </span>
                                        </div>

                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <FontAwesomeIcon icon={faLanguage} style={{ color: 'var(--ash)', fontSize: '0.8rem' }} />
                                            <span style={{ fontSize: '0.85rem', color: 'var(--ash)' }}>
                                                {book.language}
                                            </span>
                                            <span className="mx-2">•</span>
                                            <FontAwesomeIcon icon={faFileAlt} style={{ color: 'var(--ash)', fontSize: '0.8rem' }} />
                                            <span style={{ fontSize: '0.85rem', color: 'var(--ash)' }}>
                                                {book.pages} पृष्ठ
                                            </span>
                                        </div>

                                        <div className="d-flex align-items-center gap-1 mb-2">
                                            {renderStars(book.rating)}
                                            <span style={{ fontSize: '0.8rem', color: 'var(--ash)', marginLeft: '0.5rem' }}>
                                                ({book.rating})
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <p style={{
                                            fontSize: '0.9rem',
                                            color: 'var(--text-color)',
                                            lineHeight: '1.5',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {expandedCards.has(book.id) ?
                                                book.description :
                                                `${book.description.substring(0, 80)}${book.description.length > 80 ? '...' : ''}`
                                            }
                                        </p>

                                        {book.description.length > 80 && (
                                            <button
                                                className="btn btn-link p-0"
                                                style={{
                                                    fontSize: '0.8rem',
                                                    color: 'var(--primary-color)',
                                                    textDecoration: 'none'
                                                }}
                                                onClick={() => toggleExpanded(book.id)}
                                            >
                                                {expandedCards.has(book.id) ? 'कम दिखाएं' : 'और पढ़ें'}
                                                <FontAwesomeIcon
                                                    icon={expandedCards.has(book.id) ? faChevronUp : faChevronDown}
                                                    className="ms-1"
                                                />
                                            </button>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    <div className="mb-3">
                                        <div className="d-flex flex-wrap gap-1">
                                            {book.tags.slice(0, 3).map((tag, index) => (
                                                <span key={index} className="badge rounded-pill px-2 py-1" style={{
                                                    background: 'rgba(168, 198, 108, 0.15)',
                                                    color: 'var(--accent-color)',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '500',
                                                    border: '1px solid rgba(168, 198, 108, 0.3)'
                                                }}>
                                                    {tag}
                                                </span>
                                            ))}
                                            {book.tags.length > 3 && (
                                                <span className="badge rounded-pill px-2 py-1" style={{
                                                    background: 'rgba(178, 178, 178, 0.15)',
                                                    color: 'var(--ash)',
                                                    fontSize: '0.7rem'
                                                }}>
                                                    +{book.tags.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="d-flex justify-content-between align-items-center mb-3 text-muted" style={{ fontSize: '0.8rem' }}>
                                        <div className="d-flex align-items-center gap-1">
                                            <FontAwesomeIcon icon={faEye} />
                                            <span>{book.views.toLocaleString()}</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-1">
                                            <FontAwesomeIcon icon={faDownload} />
                                            <span>{book.downloads.toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span>{book.fileSize}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="d-grid gap-2">
                                        <div className="btn-group">
                                            <button
                                                className="btn"
                                                style={{
                                                    background: 'linear-gradient(135deg, var(--primary-color), var(--main-color))',
                                                    border: 'none',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    borderRadius: '25px 0 0 25px'
                                                }}
                                                onClick={() => handleBookClick(book)}
                                            >
                                                <FontAwesomeIcon icon={faEye} className="me-2" />
                                                पूर्वावलोकन
                                            </button>
                                            <button
                                                className="btn"
                                                style={{
                                                    background: 'var(--secondary-color)',
                                                    border: 'none',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    borderRadius: '0 25px 25px 0'
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faDownload} className="me-2" />
                                                डाउनलोड
                                            </button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* No Results */}
                {sortedBooks.length === 0 && (
                    <div className="text-center py-5">
                        <FontAwesomeIcon
                            icon={faBook}
                            style={{ fontSize: '4rem', color: 'var(--ash)', marginBottom: '2rem' }}
                        />
                        <h3 style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>
                            कोई पुस्तक नहीं मिली
                        </h3>
                        <p style={{ color: 'var(--ash)' }}>
                            कृपया अपनी खोज को संशोधित करें या फ़िल्टर बदलें
                        </p>
                    </div>
                )}

                {/* Book Detail Modal */}
                <Modal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    size="lg"
                    centered
                >
                    {selectedBook && (
                        <>
                            <Modal.Header closeButton style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }}>
                                <Modal.Title style={{
                                    fontFamily: "'Tiro Devanagari Sanskrit', serif",
                                    color: 'var(--primary-color)'
                                }}>
                                    {selectedBook.title}
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row>
                                    <Col md={4} className="text-center mb-3">
                                        <div style={{
                                            background: 'linear-gradient(135deg, var(--primary-color), var(--main-color))',
                                            height: '250px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '4rem',
                                            borderRadius: '10px',
                                            marginBottom: '1rem'
                                        }}>
                                            <FontAwesomeIcon
                                                icon={selectedBook.category === 'mainBook' ? faBook :
                                                    selectedBook.category === 'VaykhyanBook' ? faBookOpen : faScroll}
                                            />
                                        </div>
                                    </Col>
                                    <Col md={8}>
                                        <h4 style={{
                                            fontFamily: "'Tiro Devanagari Sanskrit', serif",
                                            color: 'var(--text-color)',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {selectedBook.title}
                                        </h4>
                                        <p style={{
                                            fontSize: '1rem',
                                            color: 'var(--ash)',
                                            fontStyle: 'italic',
                                            marginBottom: '1rem'
                                        }}>
                                            {selectedBook.titleEn}
                                        </p>

                                        <div className="mb-3">
                                            <div className="row g-2">
                                                <div className="col-sm-6">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <FontAwesomeIcon icon={faUser} style={{ color: 'var(--ash)' }} />
                                                        <div>
                                                            <small style={{ color: 'var(--ash)' }}>लेखक</small>
                                                            <div style={{ fontWeight: '500', color: 'var(--text-color)' }}>
                                                                {selectedBook.author}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-sm-6">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <FontAwesomeIcon icon={faCalendar} style={{ color: 'var(--ash)' }} />
                                                        <div>
                                                            <small style={{ color: 'var(--ash)' }}>काल</small>
                                                            <div style={{ fontWeight: '500', color: 'var(--text-color)' }}>
                                                                {selectedBook.year}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-sm-6">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <FontAwesomeIcon icon={faLanguage} style={{ color: 'var(--ash)' }} />
                                                        <div>
                                                            <small style={{ color: 'var(--ash)' }}>भाषा</small>
                                                            <div style={{ fontWeight: '500', color: 'var(--text-color)' }}>
                                                                {selectedBook.language}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-sm-6">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <FontAwesomeIcon icon={faFileAlt} style={{ color: 'var(--ash)' }} />
                                                        <div>
                                                            <small style={{ color: 'var(--ash)' }}>पृष्ठ संख्या</small>
                                                            <div style={{ fontWeight: '500', color: 'var(--text-color)' }}>
                                                                {selectedBook.pages} पृष्ठ
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <div className="d-flex align-items-center gap-1 mb-2">
                                                {renderStars(selectedBook.rating)}
                                                <span style={{ fontSize: '0.9rem', color: 'var(--ash)', marginLeft: '0.5rem' }}>
                                                    ({selectedBook.rating} रेटिंग)
                                                </span>
                                            </div>

                                            <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.9rem' }}>
                                                <div className="d-flex align-items-center gap-1">
                                                    <FontAwesomeIcon icon={faEye} />
                                                    <span>{selectedBook.views.toLocaleString()} बार देखा गया</span>
                                                </div>
                                                <div className="d-flex align-items-center gap-1">
                                                    <FontAwesomeIcon icon={faDownload} />
                                                    <span>{selectedBook.downloads.toLocaleString()} डाउनलोड</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <hr style={{ borderColor: 'rgba(212, 175, 55, 0.2)', margin: '1rem 0' }} />

                                <div className="mb-4">
                                    <h6 style={{ color: 'var(--text-color)', marginBottom: '0.75rem' }}>विवरण</h6>
                                    <p style={{
                                        fontSize: '1rem',
                                        color: 'var(--text-color)',
                                        lineHeight: '1.6',
                                        marginBottom: '1rem'
                                    }}>
                                        {selectedBook.description}
                                    </p>
                                    <p style={{
                                        fontSize: '0.95rem',
                                        color: 'var(--ash)',
                                        lineHeight: '1.5',
                                        fontStyle: 'italic'
                                    }}>
                                        {selectedBook.descriptionEn}
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <h6 style={{ color: 'var(--text-color)', marginBottom: '0.75rem' }}>विषय टैग</h6>
                                    <div className="d-flex flex-wrap gap-2">
                                        {selectedBook.tags.map((tag, index) => (
                                            <span key={index} className="badge rounded-pill px-3 py-2" style={{
                                                background: 'rgba(168, 198, 108, 0.15)',
                                                color: 'var(--accent-color)',
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                border: '1px solid rgba(168, 198, 108, 0.3)'
                                            }}>
                                                <FontAwesomeIcon icon={faTags} className="me-1" />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <h6 style={{ color: 'var(--text-color)', marginBottom: '0.75rem' }}>फ़ाइल जानकारी</h6>
                                    <div className="row g-3">
                                        <div className="col-sm-4">
                                            <div className="text-center p-3 rounded" style={{ background: 'rgba(37, 99, 235, 0.1)' }}>
                                                <div style={{ color: 'var(--primary-color)', fontSize: '1.2rem', fontWeight: '600' }}>
                                                    {selectedBook.format}
                                                </div>
                                                <small style={{ color: 'var(--ash)' }}>फॉर्मेट</small>
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="text-center p-3 rounded" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                                                <div style={{ color: 'var(--secondary-color)', fontSize: '1.2rem', fontWeight: '600' }}>
                                                    {selectedBook.fileSize}
                                                </div>
                                                <small style={{ color: 'var(--ash)' }}>आकार</small>
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="text-center p-3 rounded" style={{ background: 'rgba(168, 198, 108, 0.1)' }}>
                                                <div style={{ color: 'var(--accent-color)', fontSize: '1.2rem', fontWeight: '600' }}>
                                                    {selectedBook.pages}
                                                </div>
                                                <small style={{ color: 'var(--ash)' }}>पृष्ठ</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Modal.Body>
                            <Modal.Footer style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)' }}>
                                <div className="d-flex w-100 gap-2">
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => toggleFavorite(selectedBook.id)}
                                        style={{
                                            borderColor: favorites.has(selectedBook.id) ? 'var(--primary-color)' : 'var(--ash)',
                                            color: favorites.has(selectedBook.id) ? 'var(--primary-color)' : 'var(--ash)'
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faHeart}
                                            className="me-2"
                                            style={{
                                                color: favorites.has(selectedBook.id) ? 'var(--primary-color)' : 'var(--ash)'
                                            }}
                                        />
                                        {favorites.has(selectedBook.id) ? 'पसंदीदा से हटाएं' : 'पसंदीदा में जोड़ें'}
                                    </Button>

                                    <Button
                                        onClick={() => {
                                            if (navigator.clipboard) {
                                                navigator.clipboard.writeText(`${selectedBook.title} - आर्य पाठशाला डिजिटल पुस्तकालय: ${window.location.origin}#library`);
                                                alert(`'${selectedBook.title}' का लिंक क्लिपबोर्ड पर कॉपी हो गया!`);
                                            }
                                        }}
                                        style={{
                                            background: 'var(--secondary-color)',
                                            border: 'none',
                                            color: 'white',
                                            fontWeight: '600'
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faShare} className="me-2" />
                                        साझा करें
                                    </Button>

                                    <Button
                                        onClick={() => {
                                            alert(`'${selectedBook.title}' का डिजिटल ग्रन्थ खोला जा रहा है...`);
                                            window.open('https://archive.org/details/RigVedaWithSayanaBhashya', '_blank');
                                        }}
                                        style={{
                                            background: 'linear-gradient(135deg, var(--primary-color), var(--main-color))',
                                            border: 'none',
                                            color: 'white',
                                            fontWeight: '600',
                                            flex: 1
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faDownload} className="me-2" />
                                        डाउनलोड करें ({selectedBook.fileSize})
                                    </Button>
                                </div>
                            </Modal.Footer>
                        </>
                    )}
                </Modal>
            </Container>

            {/* Custom CSS */}
            <style>{`
        .hover-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-card:hover {
          transform: translateY(-8px);
        }
        
        .btn-group .btn {
          transition: all 0.3s ease;
        }
        
        .btn-group .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .badge {
          transition: all 0.2s ease;
        }
        
        .badge:hover {
          transform: scale(1.05);
        }
        
        .modal-content {
          border-radius: 15px;
          border: 1px solid rgba(212, 175, 55, 0.2);
        }
        
        .modal-header {
          background: linear-gradient(135deg, rgba(253, 234, 168, 0.3), rgba(250, 244, 230, 0.3));
        }
        
        .form-control:focus,
        .form-select:focus {
          border-color: var(--secondary-color);
          box-shadow: 0 0 0 0.2rem rgba(212, 175, 55, 0.25);
        }
        
        @media (max-width: 768px) {
          .btn-group {
            flex-direction: column;
          }
          
          .btn-group .btn {
            border-radius: 25px !important;
            margin-bottom: 0.5rem;
          }
          
          .btn-group .btn:last-child {
            margin-bottom: 0;
          }
        }
        
        /* Loading animation for book cards */
        @keyframes bookCardLoad {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .hover-card {
          animation: bookCardLoad 0.5s ease-out forwards;
        }
        
        /* Responsive text sizing */
        @media (max-width: 576px) {
          .modal-dialog {
            margin: 1rem;
          }
          
          .row.g-3 > * {
            margin-bottom: 1rem;
          }
        }
      `}</style>
        </section>
    );
};

export default LibrarySection;