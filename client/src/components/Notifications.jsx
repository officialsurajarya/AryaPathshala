import React, { useState, useEffect } from 'react';
import './Notifications.css';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullhorn,
  faExclamationTriangle,
  faBook,
  faGraduationCap,
  faCalendarAlt,
  faArrowRight,
  faBell,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { api } from '../api/client';

const getCategoryInfo = (category) => {
  switch (category) {
    case 'important':
      return {
        icon: faExclamationTriangle,
        iconClass: 'icon-important',
        priorityClass: 'priority-high',
        defaultLabel: 'महत्वपूर्ण सूचना',
      };
    case 'course':
      return {
        icon: faBook,
        iconClass: 'icon-course',
        priorityClass: 'priority-medium',
        defaultLabel: 'पाठ्यक्रम सूचना',
      };
    case 'exam':
      return {
        icon: faGraduationCap,
        iconClass: 'icon-exam',
        priorityClass: 'priority-high',
        defaultLabel: 'परीक्षा सूचना',
      };
    case 'update':
    default:
      return {
        icon: faBell,
        iconClass: 'icon-update',
        priorityClass: 'priority-low',
        defaultLabel: 'सामान्य सूचना',
      };
  }
};

const Notifications = () => {
    // 100% Dynamic — fetched only from live MySQL database
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotice, setSelectedNotice] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchNotices = () => {
            api.get('/notices')
                .then(res => {
                    if (isMounted) {
                        if (res?.data && Array.isArray(res.data)) {
                            setNotices(res.data.map(n => ({
                                id: n.id,
                                category: n.category || 'important',
                                type: n.type || 'सूचना',
                                date: n.dateText || (n.createdAt ? new Date(n.createdAt).toLocaleDateString("hi-IN") : 'अद्यतन'),
                                title: n.title,
                                content: n.content,
                                actionText: n.actionText || 'विस्तार से पढ़ें',
                                link: n.actionLink || '#courses'
                            })));
                        } else {
                            setNotices([]);
                        }
                        setLoading(false);
                    }
                })
                .catch(err => {
                    console.warn('[Notifications] DB fetch error:', err.message);
                    if (isMounted) setLoading(false);
                });
        };

        fetchNotices();

        // Listen for live database updates from Admin Panel actions
        window.addEventListener('noticesUpdated', fetchNotices);

        // Auto-refresh every 30 seconds
        const intervalId = setInterval(fetchNotices, 30000);

        return () => {
            isMounted = false;
            window.removeEventListener('noticesUpdated', fetchNotices);
            clearInterval(intervalId);
        };
    }, []);

    const handleActionClick = (notice) => {
        setSelectedNotice(notice);
    };

    return (
        <section id="notices">
            <div className="container">
                <div className="section-header">
                    <h1 className="section-title">
                        <FontAwesomeIcon icon={faBullhorn} className="me-3" />सूचनाएँ
                    </h1>
                    <p className="section-subtitle text-center m-auto">
                        संस्कृत शिक्षा एवं आर्य पाठशाला से संबंधित प्रामाणिक सूचनाएँ एवं घोषणाएं
                    </p>
                </div>

                <div className="notifications-container">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="danger" />
                            <p className="mt-3 text-muted">डेटाबेस से सूचनाएं लोड हो रही हैं...</p>
                        </div>
                    ) : notices.length > 0 ? (
                        <div className="notification-grid">
                            {notices.map(notification => {
                                const catInfo = getCategoryInfo(notification.category);
                                return (
                                    <div
                                        key={notification.id}
                                        className={`notification-card card-cat-${notification.category}`}
                                        data-category={notification.category}
                                        onClick={() => handleActionClick(notification)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleActionClick(notification);
                                            }
                                        }}
                                    >
                                        <div className={`notification-priority ${catInfo.priorityClass}`} title="प्राथमिकता स्तर" />

                                        <div className="notification-header">
                                            <div className={`notification-icon ${catInfo.iconClass}`}>
                                                <FontAwesomeIcon icon={catInfo.icon} />
                                            </div>
                                            <div className="notification-meta">
                                                <div className="notification-type-badge">
                                                    <span>{notification.type || catInfo.defaultLabel}</span>
                                                </div>
                                                <div className="notification-date">
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                                    <span>{notification.date}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className="notification-title">{notification.title}</h3>
                                        <div className="notification-content">{notification.content}</div>

                                        <div className="notification-actions">
                                            <button
                                                type="button"
                                                className="read-more-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleActionClick(notification);
                                                }}
                                            >
                                                <span>{notification.actionText || 'विस्तार से पढ़ें'}</span>
                                                <FontAwesomeIcon icon={faArrowRight} className="action-arrow" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-5 bg-white rounded-3 shadow-sm border p-4">
                            <div style={{ fontSize: "48px" }}>📢</div>
                            <h5 className="mt-3 text-muted">वर्तमान में कोई सूचना उपलब्ध नहीं है</h5>
                            <p className="small text-secondary">व्यवस्थापक (Admin) द्वारा नई सूचना प्रकाशित किए जाने पर यहाँ प्रदर्शित होगी।</p>
                        </div>
                    )}
                </div>

                {/* Notice Details Modal */}
                <Modal show={!!selectedNotice} onHide={() => setSelectedNotice(null)} centered className="notice-details-modal">
                    <Modal.Header closeButton className="notice-modal-header">
                        <Modal.Title className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={getCategoryInfo(selectedNotice?.category).icon} className="text-warning" />
                            <span>{selectedNotice?.type || 'सूचना विवरण'}</span>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="notice-modal-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="notice-modal-date">
                                <FontAwesomeIcon icon={faCalendarAlt} className="me-1 text-danger" />
                                {selectedNotice?.date}
                            </span>
                            <span className="notice-modal-cat-tag">
                                {getCategoryInfo(selectedNotice?.category).defaultLabel}
                            </span>
                        </div>
                        <h4 className="notice-modal-title">{selectedNotice?.title}</h4>
                        <div className="notice-modal-text">{selectedNotice?.content}</div>
                    </Modal.Body>
                    <Modal.Footer className="notice-modal-footer">
                        <Button variant="outline-secondary" onClick={() => setSelectedNotice(null)} className="notice-modal-close-btn">
                            बंद करें
                        </Button>
                        <Button
                            variant="danger"
                            className="notice-modal-action-btn"
                            onClick={() => {
                                const target = selectedNotice?.link;
                                setSelectedNotice(null);
                                if (target && target.startsWith('#')) {
                                    const el = document.querySelector(target);
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                        >
                            <span>संबंधित अनुभाग पर जाएं</span>
                            <FontAwesomeIcon icon={faChevronRight} className="ms-1" />
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </section>
    );
};

export default Notifications;
