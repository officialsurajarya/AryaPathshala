import React, { useRef } from 'react';

const CourseFilter = ({ tabs, active, onChange }) => {
  const containerRef = useRef(null);

  const handleTabClick = (filter, e) => {
    onChange(filter);
    if (e && e.currentTarget && containerRef.current) {
      e.currentTarget.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  };

  return (
    <div className="course-filters-wrapper">
      <div className="course-filters" ref={containerRef}>
        {tabs.map((tab) => (
          <button
            key={tab.filter}
            className={`filter-btn ${active === tab.filter ? 'active' : ''}`}
            data-filter={tab.filter}
            onClick={(e) => handleTabClick(tab.filter, e)}
            type="button"
          >
            <i className={`fas ${tab.icon} me-1`}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CourseFilter;
