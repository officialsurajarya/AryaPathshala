// Add smooth scrolling and active nav highlighting
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();

        // Remove active class from all links
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

        // Add active class to clicked link
        this.classList.add('active');

        // Close mobile menu if open
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (navbarCollapse.classList.contains('show')) {
            const bsCollapse = new bootstrap.Collapse(navbarCollapse);
            bsCollapse.hide();
        }
    });
});

// Initialize Bootstrap carousel with custom interval
const carouselElement = document.querySelector('#carouselExampleControls');
const carousel = new bootstrap.Carousel(carouselElement, {
    interval: 2000, // 4 seconds
    ride: 'carousel'
});


// Add scroll effect to navbar
window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(253, 234, 168, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.backgroundColor = '';
        navbar.style.backdropFilter = '';
    }
});



// Courses Section JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Course Filtering Functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const courseItems = document.querySelectorAll('.course-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            const filter = this.getAttribute('data-filter');

            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Filter courses with animation
            courseItems.forEach((item, index) => {
                const category = item.getAttribute('data-category');

                if (filter === 'all' || category === filter) {
                    // Show item with delay for staggered animation
                    setTimeout(() => {
                        item.classList.remove('hidden');
                        item.classList.add('fade-in');
                    }, index * 100);
                } else {
                    // Hide item
                    item.classList.add('hidden');
                    item.classList.remove('fade-in');
                }
            });
        });
    });

    // Load More Functionality
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    let isLoading = false;

    loadMoreBtn.addEventListener('click', function () {
        if (isLoading) return;

        isLoading = true;

        // Change button text and add loading state
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
        this.style.pointerEvents = 'none';

        // Simulate loading delay
        setTimeout(() => {
            // Add new course cards (you can replace this with actual data loading)
            addMoreCourses();

            // Reset button
            this.innerHTML = originalText;
            this.style.pointerEvents = 'auto';
            isLoading = false;
        }, 1500);
    });

    // Function to add more courses (simulation)
    function addMoreCourses() {
        const courseGrid = document.getElementById('courseGrid');
        const moreCourses = [
            {
                category: 'science',
                icon: 'fas fa-microscope',
                badge: 'New',
                badgeClass: 'new',
                subject: 'Science',
                title: 'Biology Essentials',
                description: 'Explore the fascinating world of biology with comprehensive study materials.',
                rating: '4.7',
                hours: '25 Hours',
                students: '1,450 Students',
                originalPrice: '₹2,699',
                currentPrice: '₹1,799'
            },
            {
                category: 'mathematics',
                icon: 'fas fa-chart-line',
                badge: 'Popular',
                badgeClass: '',
                subject: 'Mathematics',
                title: 'Statistics & Probability',
                description: 'Master statistical concepts and probability theory with practical examples.',
                rating: '4.8',
                hours: '28 Hours',
                students: '1,120 Students',
                originalPrice: '₹3,099',
                currentPrice: '₹2,199'
            },
            {
                category: 'english',
                icon: 'fas fa-quote-left',
                badge: 'Trending',
                badgeClass: '',
                subject: 'English',
                title: 'Creative Writing Workshop',
                description: 'Develop your creative writing skills with expert guidance and feedback.',
                rating: '4.6',
                hours: '20 Hours',
                students: '850 Students',
                originalPrice: '₹2,399',
                currentPrice: '₹1,599'
            }
        ];

        moreCourses.forEach((course, index) => {
            const courseCard = createCourseCard(course);
            courseGrid.appendChild(courseCard);

            // Add fade-in animation with delay
            setTimeout(() => {
                courseCard.classList.add('fade-in');
            }, index * 200);
        });
    }

    // Function to create course card element
    function createCourseCard(course) {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-lg-4 col-md-6 mb-4 course-item';
        colDiv.setAttribute('data-category', course.category);
        colDiv.style.opacity = '0';
        colDiv.style.transform = 'translateY(30px)';

        colDiv.innerHTML = `
            <div class="course-card">
                <div class="course-image">
                    <div class="course-icon">
                        <i class="${course.icon}"></i>
                    </div>
                    <div class="course-badge ${course.badgeClass}">${course.badge}</div>
                </div>
                <div class="course-content">
                    <div class="course-meta">
                        <span class="course-category">${course.subject}</span>
                        <div class="course-rating">
                            <i class="fas fa-star"></i>
                            <span>${course.rating}</span>
                        </div>
                    </div>
                    <h4 class="course-title">${course.title}</h4>
                    <p class="course-description">${course.description}</p>
                    <div class="course-stats">
                        <div class="stat-item">
                            <i class="fas fa-clock"></i>
                            <span>${course.hours}</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-users"></i>
                            <span>${course.students}</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-certificate"></i>
                            <span>Certificate</span>
                        </div>
                    </div>
                    <div class="course-footer">
                        <div class="course-price">
                            <span class="original-price">${course.originalPrice}</span>
                            <span class="current-price">${course.currentPrice}</span>
                        </div>
                        <button class="btn-enroll">
                            <i class="fas fa-play me-2"></i>Enroll Now
                        </button>
                    </div>
                </div>
            </div>
        `;

        return colDiv;
    }

    // Course card hover effects
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            const icon = this.querySelector('.course-icon i');
            icon.style.transform = 'scale(1.1) rotate(5deg)';
        });

        card.addEventListener('mouseleave', function () {
            const icon = this.querySelector('.course-icon i');
            icon.style.transform = 'scale(1) rotate(0deg)';
        });
    });

    // Enroll button functionality
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-enroll') || e.target.closest('.btn-enroll')) {
            const button = e.target.classList.contains('btn-enroll') ? e.target : e.target.closest('.btn-enroll');
            const courseTitle = button.closest('.course-card').querySelector('.course-title').textContent;

            // Add click animation
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);

            // Show enrollment modal or redirect (you can customize this)
            showEnrollmentModal(courseTitle);
        }
    });

    // Function to show enrollment modal (placeholder)
    function showEnrollmentModal(courseTitle) {
        // You can replace this with actual modal or redirect logic
        alert(`Enrollment initiated for: ${courseTitle}\n\nThis would typically redirect to enrollment page or show a modal.`);
    }

    // Smooth scroll animation for course cards on page load
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all course items for scroll animation
    courseItems.forEach(item => {
        observer.observe(item);
    });

    // Search functionality (if you want to add a search feature)
    function searchCourses(searchTerm) {
        const term = searchTerm.toLowerCase();

        courseItems.forEach(item => {
            const title = item.querySelector('.course-title').textContent.toLowerCase();
            const description = item.querySelector('.course-description').textContent.toLowerCase();
            const category = item.querySelector('.course-category').textContent.toLowerCase();

            if (title.includes(term) || description.includes(term) || category.includes(term)) {
                item.style.display = 'block';
                item.classList.add('fade-in');
            } else {
                item.style.display = 'none';
                item.classList.remove('fade-in');
            }
        });
    }

    // Price animation on hover
    document.addEventListener('mouseenter', function (e) {
        if (e.target.closest('.course-price')) {
            const currentPrice = e.target.closest('.course-price').querySelector('.current-price');
            currentPrice.style.transform = 'scale(1.1)';
            currentPrice.style.color = 'var(--main-color)';
        }
    }, true);

    document.addEventListener('mouseleave', function (e) {
        if (e.target.closest('.course-price')) {
            const currentPrice = e.target.closest('.course-price').querySelector('.current-price');
            currentPrice.style.transform = 'scale(1)';
            currentPrice.style.color = 'var(--primary-color)';
        }
    }, true);

    // Counter animation for course stats (optional enhancement)
    function animateCounter(element, targetValue) {
        const startValue = 0;
        const duration = 1000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);

            element.textContent = currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }

        requestAnimationFrame(updateCounter);
    }

    // Initialize tooltips (if using Bootstrap tooltips)
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    if (typeof bootstrap !== 'undefined') {
        const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
});



// Videos Section JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Video data for simulation
    const videoData = {
        'featured': {
            title: 'Understanding Newton\'s Laws of Motion',
            description: 'Comprehensive explanation of Newton\'s three laws of motion with real-world examples and practical applications.'
        },
        'chemistry-basics': {
            title: 'Organic Chemistry Fundamentals',
            description: 'Learn the basic concepts of organic chemistry with detailed explanations and molecular structures.'
        },
        'calculus-tutorial': {
            title: 'Calculus Step-by-Step Tutorial',
            description: 'Master calculus with our comprehensive step-by-step tutorial series covering derivatives and integrals.'
        },
        'physics-experiment': {
            title: 'Electromagnetic Induction Experiment',
            description: 'Hands-on experiment demonstrating electromagnetic induction principles with practical demonstrations.'
        },
        'math-solutions': {
            title: 'Advanced Algebra Problem Solutions',
            description: 'Detailed solutions to complex algebra problems with multiple approaches and explanations.'
        },
        'english-literature': {
            title: 'Shakespeare\'s Literary Genius',
            description: 'Explore the works of Shakespeare and understand his profound impact on English literature.'
        },
        'history-tutorial': {
            title: 'Indian Independence Movement',
            description: 'Comprehensive overview of India\'s struggle for independence and key historical figures.'
        }
    };

    // Video Filtering Functionality
    const videoFilterButtons = document.querySelectorAll('.video-filter-btn');
    const videoItems = document.querySelectorAll('.video-item');

    videoFilterButtons.forEach(button => {
        button.addEventListener('click', function () {
            const filter = this.getAttribute('data-filter');

            // Remove active class from all buttons
            videoFilterButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Filter videos with animation
            videoItems.forEach((item, index) => {
                const category = item.getAttribute('data-category');

                if (filter === 'all' || category === filter) {
                    // Show item with delay for staggered animation
                    setTimeout(() => {
                        item.classList.remove('hidden');
                        item.classList.add('fade-in');
                    }, index * 100);
                } else {
                    // Hide item
                    item.classList.add('hidden');
                    item.classList.remove('fade-in');
                }
            });
        });
    });

    // Video Modal Functionality
    const videoModal = document.getElementById('videoModal');
    const modalVideoPlayer = document.getElementById('modalVideoPlayer');
    const modalVideoTitle = document.getElementById('modalVideoTitle');
    const modalVideoDescription = document.getElementById('modalVideoDescription');
    const closeVideoModal = document.getElementById('closeVideoModal');

    // Play button click handlers
    document.addEventListener('click', function (e) {
        const playButton = e.target.closest('.play-button, .play-overlay');
        if (playButton) {
            const videoId = playButton.getAttribute('data-video');
            openVideoModal(videoId);
        }
    });

    // Watch Now button handler
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-watch-now') || e.target.closest('.btn-watch-now')) {
            openVideoModal('featured');
        }
    });

    // Function to open video modal
    function openVideoModal(videoId) {
        const video = videoData[videoId];
        if (video) {
            modalVideoTitle.textContent = video.title;
            modalVideoDescription.textContent = video.description;

            // Simulate video loading
            modalVideoPlayer.innerHTML = `
                <div class="video-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading video...</p>
                </div>
            `;

            videoModal.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Simulate video load after 2 seconds
            setTimeout(() => {
                modalVideoPlayer.innerHTML = `
                    <div style="width: 100%; height: 100%; background: linear-gradient(135deg, var(--primary-color), var(--main-color)); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem;">
                        <div style="text-align: center;">
                            <i class="fas fa-play-circle" style="font-size: 4rem; margin-bottom: 20px;"></i>
                            <p>Video Player Placeholder</p>
                            <p style="font-size: 1rem; opacity: 0.8;">Actual video player would be integrated here</p>
                        </div>
                    </div>
                `;
            }, 2000);
        }
    }

    // Close modal functionality
    closeVideoModal.addEventListener('click', closeModal);
    videoModal.addEventListener('click', function (e) {
        if (e.target === videoModal) {
            closeModal();
        }
    });

    // ESC key to close modal
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && videoModal.classList.contains('active')) {
            closeModal();
        }
    });

    function closeModal() {
        videoModal.classList.remove('active');
        document.body.style.overflow = '';
        modalVideoPlayer.innerHTML = `
            <div class="video-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading video...</p>
            </div>
        `;
    }

    // Load More Videos Functionality
    const loadMoreVideosBtn = document.getElementById('loadMoreVideos');
    let isLoadingVideos = false;

    loadMoreVideosBtn.addEventListener('click', function () {
        if (isLoadingVideos) return;

        isLoadingVideos = true;

        // Change button text and add loading state
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading Videos...';
        this.style.pointerEvents = 'none';

        // Simulate loading delay
        setTimeout(() => {
            // Add new video cards
            addMoreVideos();

            // Reset button
            this.innerHTML = originalText;
            this.style.pointerEvents = 'auto';
            isLoadingVideos = false;
        }, 1500);
    });

    // Function to add more videos
    function addMoreVideos() {
        const videoGrid = document.getElementById('videoGrid');
        const moreVideos = [
            {
                category: 'lectures',
                thumbnail: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'225\' viewBox=\'0 0 400 225\'%3E%3Crect width=\'400\' height=\'225\' fill=\'%23B22222\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dominant-baseline=\'middle\' fill=\'white\' font-size=\'16\' font-family=\'Arial\'%3EBiology Lecture%3C/text%3E%3C/svg%3E',
                subject: 'Biology',
                title: 'Cell Structure and Function',
                description: 'Detailed study of cell organelles and their functions in living organisms.',
                rating: '4.7',
                views: '78K views',
                duration: '32:15',
                likes: '2.8K',
                quality: 'HD',
                videoId: 'biology-lecture'
            },
            {
                category: 'tutorials',
                thumbnail: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'225\' viewBox=\'0 0 400 225\'%3E%3Crect width=\'400\' height=\'225\' fill=\'%23D4AF37\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dominant-baseline=\'middle\' fill=\'white\' font-size=\'16\' font-family=\'Arial\'%3EGeometry Tutorial%3C/text%3E%3C/svg%3E',
                subject: 'Mathematics',
                title: 'Coordinate Geometry Mastery',
                description: 'Master coordinate geometry with practical examples and problem-solving techniques.',
                rating: '4.9',
                views: '142K views',
                duration: '24:30',
                likes: '5.1K',
                quality: '4K',
                videoId: 'geometry-tutorial'
            },
            {
                category: 'experiments',
                thumbnail: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'225\' viewBox=\'0 0 400 225\'%3E%3Crect width=\'400\' height=\'225\' fill=\'%23A8C66C\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dominant-baseline=\'middle\' fill=\'white\' font-size=\'16\' font-family=\'Arial\'%3EChemistry Lab%3C/text%3E%3C/svg%3E',
                subject: 'Chemistry',
                title: 'Acid-Base Titration Experiment',
                description: 'Step-by-step laboratory experiment demonstrating acid-base titration methods.',
                rating: '4.6',
                views: '67K views',
                duration: '16:20',
                likes: '1.9K',
                quality: 'HD',
                videoId: 'chemistry-experiment'
            }
        ];

        moreVideos.forEach((video, index) => {
            const videoCard = createVideoCard(video);
            videoGrid.appendChild(videoCard);

            // Add to video data for modal functionality
            videoData[video.videoId] = {
                title: video.title,
                description: video.description
            };

            // Add fade-in animation with delay
            setTimeout(() => {
                videoCard.classList.add('fade-in');
            }, index * 200);
        });
    }

    // Function to create video card element
    function createVideoCard(video) {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-lg-4 col-md-6 mb-4 video-item';
        colDiv.setAttribute('data-category', video.category);
        colDiv.style.opacity = '0';
        colDiv.style.transform = 'translateY(30px)';

        colDiv.innerHTML = `
            <div class="video-card">
                <div class="video-thumbnail-container">
                    <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail">
                    <div class="play-overlay" data-video="${video.videoId}">
                        <i class="fas fa-play"></i>
                    </div>
                    <div class="video-duration">${video.duration}</div>
                    <div class="video-quality">${video.quality}</div>
                </div>
                <div class="video-info">
                    <div class="video-meta">
                        <span class="video-category">${video.subject}</span>
                        <div class="video-rating">
                            <i class="fas fa-star"></i>
                            <span>${video.rating}</span>
                        </div>
                    </div>
                    <h4 class="video-title">${video.title}</h4>
                    <p class="video-description">${video.description}</p>
                    <div class="video-stats">
                        <span><i class="fas fa-eye me-1"></i>${video.views}</span>
                        <span><i class="fas fa-clock me-1"></i>${video.duration}</span>
                        <span><i class="fas fa-thumbs-up me-1"></i>${video.likes}</span>
                    </div>
                </div>
            </div>
        `;

        return colDiv;
    }

    // Add to Playlist functionality
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-add-playlist') || e.target.closest('.btn-add-playlist')) {
            const button = e.target.classList.contains('btn-add-playlist') ? e.target : e.target.closest('.btn-add-playlist');

            // Add animation
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);

            // Show success message (you can replace with actual functionality)
            showPlaylistMessage();
        }
    });

    function showPlaylistMessage() {
        // Create temporary success message
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-color);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            font-weight: 600;
            box-shadow: 0 5px 15px rgba(168, 198, 108, 0.3);
            animation: slideInRight 0.3s ease;
        `;
        message.innerHTML = '<i class="fas fa-check me-2"></i>Added to playlist!';

        document.body.appendChild(message);

        setTimeout(() => {
            message.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => {
                document.body.removeChild(message);
            }, 300);
        }, 2000);
    }

    // Counter Animation for Stats
    function animateCounters() {
        const statNumbers = document.querySelectorAll('.stat-number');

        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const increment = target / 100;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }

                // Format number with commas for large numbers
                stat.textContent = Math.floor(current).toLocaleString();
            }, 20);
        });
    }

    // Intersection Observer for counter animation
    const statsSection = document.querySelector('.video-stats-section');
    const statsObserver = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    // Smooth scroll animation for video cards on page load
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all video items for scroll animation
    videoItems.forEach(item => {
        observer.observe(item);
    });

    // Video card hover effects
    document.addEventListener('mouseenter', function (e) {
        const videoCard = e.target.closest('.video-card');
        if (videoCard) {
            const playOverlay = videoCard.querySelector('.play-overlay');
            if (playOverlay) {
                playOverlay.style.opacity = '1';
                playOverlay.style.transform = 'translate(-50%, -50%) scale(1.1)';
            }
        }
    }, true);

    document.addEventListener('mouseleave', function (e) {
        const videoCard = e.target.closest('.video-card');
        if (videoCard) {
            const playOverlay = videoCard.querySelector('.play-overlay');
            if (playOverlay) {
                playOverlay.style.opacity = '0';
                playOverlay.style.transform = 'translate(-50%, -50%) scale(1)';
            }
        }
    }, true);

    // Search functionality for videos (if needed)
    function searchVideos(searchTerm) {
        const term = searchTerm.toLowerCase();

        videoItems.forEach(item => {
            const title = item.querySelector('.video-title').textContent.toLowerCase();
            const description = item.querySelector('.video-description').textContent.toLowerCase();
            const category = item.querySelector('.video-category').textContent.toLowerCase();

            if (title.includes(term) || description.includes(term) || category.includes(term)) {
                item.style.display = 'block';
                item.classList.add('fade-in');
            } else {
                item.style.display = 'none';
                item.classList.remove('fade-in');
            }
        });
    }

    // Add CSS animations for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    `;
    document.head.appendChild(style);
});