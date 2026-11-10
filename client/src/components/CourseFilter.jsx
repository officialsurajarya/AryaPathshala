const CourseFilter = ({ tabs, active, onChange }) => (
  <div className="course-filters text-center mb-5">
    {tabs.map(tab => (
      <button
        key={tab.filter}
        className={`filter-btn ${active === tab.filter ? 'active' : ''}`}
        data-filter={tab.filter}
        onClick={() => onChange(tab.filter)}
      >
        <i className={`fas ${tab.icon} me-2`}></i>{tab.label}
      </button>
    ))}
  </div>
);
export default CourseFilter;
