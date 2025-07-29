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

document.addEventListener('DOMContentLoaded', function() {
    // Course Filtering Functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const courseItems = document.querySelectorAll('.course-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
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
    
    loadMoreBtn.addEventListener('click', function() {
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
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.course-icon i');
            icon.style.transform = 'scale(1.1) rotate(5deg)';
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.course-icon i');
            icon.style.transform = 'scale(1) rotate(0deg)';
        });
    });
    
    // Enroll button functionality
    document.addEventListener('click', function(e) {
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
    
    const observer = new IntersectionObserver(function(entries) {
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
    document.addEventListener('mouseenter', function(e) {
        if (e.target.closest('.course-price')) {
            const currentPrice = e.target.closest('.course-price').querySelector('.current-price');
            currentPrice.style.transform = 'scale(1.1)';
            currentPrice.style.color = 'var(--main-color)';
        }
    }, true);
    
    document.addEventListener('mouseleave', function(e) {
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