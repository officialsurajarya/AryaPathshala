import React from 'react';
import DynamicBookCover from './DynamicBookCover';

const CourseCard = ({
  id, image, badge, category, rating, title, description,
  stats, originalPrice, currentPrice, onEnroll
}) => {
  const handleWhatsAppOrder = (e) => {
    if (e) e.stopPropagation();
    const phone = "916284667127";
    const text = `नमस्ते आर्य पाठशाला! 🙏\nमुझे आपके "${title}" पाठ्यक्रम में नामांकन एवं भुगतान की जानकारी चाहिए।\n\n📌 पाठ्यक्रम: ${title}\n💰 शुल्क: ${currentPrice || "उपलब्ध नहीं"}\n\nकृपया मुझे भुगतान (Payment) विकल्प एवं कोर्स विवरण प्रदान करें। धन्यवाद!`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="course-card">
      <div className="course-image">
        <div className="img-border"></div>
        <DynamicBookCover title={title} image={image} alt={title} badge={badge} />
      </div>
      <div className="course-content">
        <div className="course-meta">
          <span className="course-category">{category}</span>
          <div className="course-rating">
            <i className="fas fa-star"></i>
            <span>{rating}</span>
          </div>
        </div>
        <h4 className="course-title">{title}</h4>
        <p className="course-description">{description}</p>
        {stats && (
          <div className="course-stats">
            {stats.map((stat, idx) => (
              <div className="stat-item" key={idx}>
                <i className={stat.icon}></i>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        )}
        <div className="course-footer">
          <div className="course-price">
            <span className="original-price">{originalPrice}</span>
            <span className="current-price">{currentPrice}</span>
          </div>
          <button
            className="btn-enroll btn-whatsapp-order"
            type="button"
            onClick={handleWhatsAppOrder}
            title="व्हाट्सएप द्वारा ऑर्डर / नामांकन करें (+91 6284667127)"
          >
            <i className="fab fa-whatsapp me-2"></i>व्हाट्सएप द्वारा ऑर्डर करें
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
