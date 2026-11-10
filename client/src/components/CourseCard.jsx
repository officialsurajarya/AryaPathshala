import React from 'react';

const CourseCard = ({
  id, image, badge, category, rating, title, description,
  stats, originalPrice, currentPrice, onEnroll
}) => (
  <div className="course-card">
    <div className="course-image">
      <div className="img-border"></div>
      <img src={image} alt={title} width="100%" />
      {badge && <div className={`course-badge ${badge.type}`}>{badge.text}</div>}
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
          className="btn-enroll"
          type="button"
          onClick={() => onEnroll && onEnroll({ id, title, image, category, currentPrice })}
        >
          <i className="fas fa-play me-2"></i>अभी नामांकन करें
        </button>
      </div>
    </div>
  </div>
);
export default CourseCard;
