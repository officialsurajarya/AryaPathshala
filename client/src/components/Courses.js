import React, { useState, useEffect, useCallback } from 'react';
import CourseCard from './CourseCard';
import CourseFilter from './CourseFilter';
import { api } from '../api/client';
import { Spinner } from 'react-bootstrap';
import './Courses.css';

// Swiper core and required modules
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation, Autoplay } from 'swiper/modules';

const filterTabs = [
    { label: 'सभी', filter: 'all', icon: 'fa-list' },
    { label: 'वेद', filter: 'ved', icon: 'fa-book-reader' },
    { label: 'वेदांग', filter: 'vedang', icon: 'fa-scroll' },
    { label: 'उपनिषद्', filter: 'upanishad', icon: 'fa-om' },
    { label: 'दर्शनशास्त्र', filter: 'darshan', icon: 'fa-brain' },
    { label: 'अन्य आर्षग्रन्थ', filter: 'aarshgrantha', icon: 'fa-brain' },
    { label: 'राष्ट्रीय पात्रता परीक्षा (संस्कृत 25)', filter: 'netexam25', icon: 'fa-graduation-cap' },
    { label: 'राष्ट्रीय पात्रता परीक्षा (संस्कृत 73)', filter: 'netexam73', icon: 'fa-graduation-cap' }
];

const Courses = ({ scrollToCategory, onEnrollCourse }) => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [coursesList, setCoursesList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch live courses directly from MySQL Database
    const fetchLiveCourses = useCallback(() => {
        setLoading(true);
        api.get('/courses?limit=100')
            .then(res => {
                if (res?.data?.courses && Array.isArray(res.data.courses)) {
                    const formatted = res.data.courses.map(c => ({
                        id: c.id,
                        category: c.category,
                        image: c.image || '/images/blank_book.jpg',
                        badge: c.badge || (c.badgeText ? { type: c.badgeType || 'popular', text: c.badgeText } : null),
                        rating: c.rating || 5.0,
                        title: c.title,
                        description: c.description,
                        stats: c.stats || [
                            { icon: 'fas fa-clock', label: `${c.durationHours || 30} घंटे` },
                            { icon: 'fas fa-users', label: `${(c.studentsCount ?? 0).toLocaleString('hi-IN')} छात्र` },
                            { icon: 'fas fa-certificate', label: c.hasCertificate ? 'प्रमाणपत्र' : 'अध्ययन सामग्री' }
                        ],
                        originalPrice: c.originalPrice || '₹2,999',
                        currentPrice: c.currentPrice || '₹1,499'
                    }));
                    setCoursesList(formatted);
                } else {
                    setCoursesList([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.warn("[Courses] DB fetch error:", err.message);
                setCoursesList([]);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchLiveCourses();

        // Listen for live database updates from Admin Panel actions
        window.addEventListener('coursesUpdated', fetchLiveCourses);
        return () => {
            window.removeEventListener('coursesUpdated', fetchLiveCourses);
        };
    }, [fetchLiveCourses]);

    const featuredCourses = activeFilter === 'all'
        ? coursesList
        : [];

    const filteredCourses = activeFilter === 'all'
        ? []
        : coursesList.filter(course => course.category === activeFilter);

    const coursesToShow = activeFilter === 'all' ? featuredCourses : filteredCourses;

    useEffect(() => {
        if (scrollToCategory) {
            setActiveFilter(scrollToCategory);
            const section = document.getElementById('courses');
            if (section) section.scrollIntoView({ behavior: 'smooth' });
        }
    }, [scrollToCategory]);

    return (
        <section className="courses" id="courses">
            <div className="container">
                <div className="section-header text-center mb-4">
                    <h2 className="section-title">पाठ्यक्रम</h2>
                    <p className="section-subtitle mx-auto text-center">
                        हमारे संस्कृत एवं अन्य शास्त्रीय विषयों के व्यापक पाठ्यक्रमों को जानिए
                    </p>
                </div>

                <div className="cources-heading">
                    <CourseFilter
                        tabs={filterTabs}
                        active={activeFilter}
                        onChange={setActiveFilter}
                    />
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="danger" />
                        <p className="mt-3 text-muted">डेटाबेस से पाठ्यक्रम लोड हो रहे हैं...</p>
                    </div>
                ) : coursesToShow.length === 0 ? (
                    <div className="text-center py-5">
                        <p className="text-muted">इस श्रेणी में कोई सक्रिय पाठ्यक्रम उपलब्ध नहीं है।</p>
                    </div>
                ) : (
                    <Swiper
                        modules={[Navigation, Autoplay]}
                        navigation
                        autoplay={{
                            delay: 2500,
                            disableOnInteraction: false,
                        }}
                        spaceBetween={15}
                        centeredSlides={coursesToShow.length === 1}
                        breakpoints={{
                            0: {
                                slidesPerView: 1.2,
                                spaceBetween: 15,
                            },
                            576: {
                                slidesPerView: 2.2,
                                spaceBetween: 20,
                            },
                            768: {
                                slidesPerView: 3,
                                spaceBetween: 25,
                                centeredSlides: false,
                            },
                            992: {
                                slidesPerView: 4,
                                spaceBetween: 30,
                                centeredSlides: false,
                            },
                        }}
                    >
                        {coursesToShow.map(course => (
                            <SwiperSlide key={course.id} style={{ width: 'auto' }}>
                                <CourseCard {...course} onEnroll={onEnrollCourse} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}
            </div>
        </section>
    );
};

export default Courses;
