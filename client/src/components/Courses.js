import React, { useState, useEffect } from 'react'; // ✅ React and hooks
import coursesData from './coursesData';           // ✅ Your course data
import CourseCard from './CourseCard';            // ✅ CourseCard component
import CourseFilter from './CourseFilter';        // ✅ Filter component
import './Courses.css';

// Swiper core and required modules
import { Swiper, SwiperSlide } from 'swiper/react'; // ✅ Swiper components
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';       // ✅ Navigation module
import { Autoplay } from 'swiper/modules'; // ✅ Import Autoplay

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

    const featuredCategories = ['ved', 'vedang', 'upanishad', 'darshan'];

    const featuredCourses = activeFilter === 'all'
        ? featuredCategories.map(cat => coursesData.find(course => course.category === cat))
            .filter(course => course !== undefined)
        : [];

    const filteredCourses = activeFilter === 'all'
        ? []
        : coursesData.filter(course => course.category === activeFilter);

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

                <Swiper
                    modules={[Navigation, Autoplay]} // ✅ Add Autoplay module
                    navigation
                    autoplay={{
                        delay: 2000,           // ✅ Slide every 3 seconds
                        disableOnInteraction: false,
                    }}
                    spaceBetween={15}
                    centeredSlides={true}     // ✅ Center the active slide
                    breakpoints={{
                        0: {
                            slidesPerView: 1.2, // ✅ Show 100% + 20% from next slide
                            spaceBetween: 15,
                        },
                        576: {
                            slidesPerView: 2.2, // ✅ Show more slides on bigger screens
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
            </div>
        </section>
    );
};

export default Courses;
