import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Row, Col, Modal, Button, Form, ProgressBar, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChalkboardTeacher,
  faBookOpen,
  faGraduationCap,
  faUsers,
  faCalendarAlt,
  faQuestionCircle,
  faBell,
  faUser,
  faShieldAlt,
  faSignOutAlt,
  faHome,
  faArrowLeft,
  faPlus,
  faClock,
  faVideo,
  faSearch,
  faSpinner,
  faBars,
  faTimes,
  faReply,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import DynamicBookCover from "./DynamicBookCover";
import "./TeacherDashboard.css";

export default function TeacherDashboard({ onBackToHome }) {
  const { user, logout, updateProfile } = useAuth();

  // Active Tab state synced with hash & localStorage
  const [activeTab, setActiveTab] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const hash = window.location.hash || "";
        const match = hash.match(/[?&]tab=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) return match[1];
        const saved = localStorage.getItem("arya_teacher_tab");
        if (saved) return saved;
      }
    } catch (e) { }
    return "overview";
  });

  const [isMobile, setIsMobile] = useState(() => {
    return typeof window !== "undefined" ? window.innerWidth < 992 : false;
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return typeof window !== "undefined" ? window.innerWidth >= 992 : false;
  });

  // Data states - 100% Live from MySQL Database
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [doubts, setDoubts] = useState([]);
  const [loadingDoubts, setLoadingDoubts] = useState(true);
  const [schedule, setSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [notices, setNotices] = useState([]);
  const [statusAlert, setStatusAlert] = useState(null);

  // Search & Filter
  const [studentSearch, setStudentSearch] = useState("");
  const [doubtFilter, setDoubtFilter] = useState("all");

  // Modals
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    titleEn: "",
    category: "ved",
    durationHours: 30,
    instructor: user?.name || "आचार्य",
    description: "",
    price: 0
  });

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: "",
    courseTitle: "ऋग्वेद संहिता अध्ययन",
    day: "सोमवार एवं गुरुवार",
    time: "प्रातः ०७:०० - ०८:००",
    meetUrl: "https://meet.google.com/new"
  });

  const [replyDoubtModal, setReplyDoubtModal] = useState(null);
  const [replyText, setReplyText] = useState("");

  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    type: "कक्षा सूचना",
    priority: "HIGH"
  });

  // Profile Form state
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || "🧘‍♂️");
  const [profileTitle, setProfileTitle] = useState("वेदाचार्य एवं दर्शन प्रवक्ता");
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  // Tab navigation handler
  const handleNav = (tabKey) => {
    setActiveTab(tabKey);
    try {
      localStorage.setItem("arya_teacher_tab", tabKey);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `#teacher?tab=${tabKey}`);
      }
    } catch (e) { }
    if (window.innerWidth < 992) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem("arya_teacher_tab", activeTab);
      if (typeof window !== "undefined" && !window.location.hash.includes(`tab=${activeTab}`)) {
        window.history.replaceState(null, "", `#teacher?tab=${activeTab}`);
      }
    } catch (e) { }
  }, [activeTab]);

  // Window resize auto-collapse sidebar & sync mobile state
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize(); // Execute immediately on mount to prevent any false backdrop
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1. Fetch Courses from MySQL
  const fetchCourses = useCallback(async () => {
    setLoadingCourses(true);
    try {
      const res = await api.get("/courses?limit=50");
      if (res?.data?.courses && Array.isArray(res.data.courses)) {
        setCourses(res.data.courses);
      } else if (Array.isArray(res?.data)) {
        setCourses(res.data);
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.warn("Could not fetch courses:", err.message);
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  // 2. Fetch Notices from MySQL
  const fetchNotices = useCallback(async () => {
    try {
      const res = await api.get("/notices?limit=15");
      if (res?.data?.notices && Array.isArray(res.data.notices)) {
        setNotices(res.data.notices);
      } else {
        setNotices([]);
      }
    } catch (err) {
      console.warn("Could not fetch notices:", err.message);
      setNotices([]);
    }
  }, []);

  // 3. Fetch Real Enrolled Students from MySQL
  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const res = await api.get("/enrollments/teacher-students");
      if (res?.data && Array.isArray(res.data)) {
        setStudents(res.data);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.warn("Could not fetch students:", err.message);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  // 4. Fetch Live Lecture Schedules from MySQL
  const fetchSchedule = useCallback(async () => {
    setLoadingSchedule(true);
    try {
      const res = await api.get("/live-sessions");
      if (res?.data && Array.isArray(res.data)) {
        setSchedule(res.data);
      } else {
        setSchedule([]);
      }
    } catch (err) {
      console.warn("Could not fetch schedule:", err.message);
      setSchedule([]);
    } finally {
      setLoadingSchedule(false);
    }
  }, []);

  // 5. Fetch Student Doubts & Q&A from MySQL
  const fetchDoubts = useCallback(async () => {
    setLoadingDoubts(true);
    try {
      const res = await api.get("/doubts");
      if (res?.data && Array.isArray(res.data)) {
        setDoubts(res.data);
      } else {
        setDoubts([]);
      }
    } catch (err) {
      console.warn("Could not fetch doubts:", err.message);
      setDoubts([]);
    } finally {
      setLoadingDoubts(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchNotices();
    fetchStudents();
    fetchSchedule();
    fetchDoubts();

    const handleSync = () => {
      fetchCourses();
      fetchNotices();
      fetchStudents();
      fetchSchedule();
      fetchDoubts();
    };

    window.addEventListener("coursesUpdated", handleSync);
    window.addEventListener("noticesUpdated", handleSync);
    window.addEventListener("scheduleUpdated", handleSync);
    window.addEventListener("doubtsUpdated", handleSync);

    return () => {
      window.removeEventListener("coursesUpdated", handleSync);
      window.removeEventListener("noticesUpdated", handleSync);
      window.removeEventListener("scheduleUpdated", handleSync);
      window.removeEventListener("doubtsUpdated", handleSync);
    };
  }, [fetchCourses, fetchNotices, fetchStudents, fetchSchedule, fetchDoubts]);

  // Metrics
  const totalCoursesCount = courses.length;
  const totalStudentsCount = students.length;
  const pendingDoubtsCount = doubts.filter((d) => d.status === "PENDING").length;

  // Filtered Students
  const filteredStudents = useMemo(() => {
    if (!studentSearch) return students;
    const q = studentSearch.toLowerCase();
    return students.filter(
      (s) =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.courseTitle && s.courseTitle.toLowerCase().includes(q))
    );
  }, [students, studentSearch]);

  // Filtered Doubts
  const filteredDoubts = useMemo(() => {
    if (doubtFilter === "all") return doubts;
    return doubts.filter((d) => d.status === doubtFilter.toUpperCase());
  }, [doubts, doubtFilter]);

  // Create Course Handler
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post("/courses", newCourse);
      setStatusAlert({ type: "success", text: "नवीन पाठ्यक्रम प्रस्ताव सफलतापूर्वक जोड़ दिया गया!" });
      setShowAddCourseModal(false);
      setNewCourse({
        title: "",
        titleEn: "",
        category: "ved",
        durationHours: 30,
        instructor: user?.name || "आचार्य",
        description: "",
        price: 0
      });
      fetchCourses();
      window.dispatchEvent(new CustomEvent("coursesUpdated"));
    } catch (err) {
      setStatusAlert({ type: "danger", text: "पाठ्यक्रम निर्माण विफल: " + (err.message || "त्रुटि") });
    }
  };

  // Add Live Session Schedule Handler - 100% Live DB
  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.post("/live-sessions", newSchedule);
      setStatusAlert({ type: "success", text: "नवीन व्याख्यान सत्र सफलतापूर्वक निर्धारित हो गया!" });
      setShowScheduleModal(false);
      setNewSchedule({
        title: "",
        courseTitle: courses[0]?.title || "ऋग्वेद संहिता अध्ययन",
        day: "सोमवार एवं गुरुवार",
        time: "प्रातः ०७:०० - ०८:००",
        meetUrl: "https://meet.google.com/new"
      });
      fetchSchedule();
      window.dispatchEvent(new CustomEvent("scheduleUpdated"));
    } catch (err) {
      setStatusAlert({ type: "danger", text: "सत्र निर्धारण विफल: " + (err.message || "त्रुटि") });
    }
  };

  // Reply Doubt Handler - 100% Live DB
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyDoubtModal || !replyText.trim()) return;
    try {
      await api.put(`/doubts/${replyDoubtModal.id}/reply`, { reply: replyText });
      setStatusAlert({ type: "success", text: "शंका समाधान का उत्तर सफलतापूर्वक प्रेषित कर दिया गया!" });
      setReplyDoubtModal(null);
      setReplyText("");
      fetchDoubts();
      window.dispatchEvent(new CustomEvent("doubtsUpdated"));
    } catch (err) {
      setStatusAlert({ type: "danger", text: "उत्तर प्रेषण विफल: " + (err.message || "त्रुटि") });
    }
  };

  // Toggle Live Session Status Handler
  const handleToggleLiveStatus = async (s) => {
    const nextStatus = s.status === "लाइव" ? "सम्पन्न" : s.status === "आगामी" ? "लाइव" : "आगामी";
    try {
      await api.put(`/live-sessions/${s.id}`, { status: nextStatus });
      fetchSchedule();
      window.dispatchEvent(new CustomEvent("scheduleUpdated"));
    } catch (err) {
      console.warn("Status toggle error:", err);
    }
  };

  // Publish Notice Handler
  const handlePublishNotice = async (e) => {
    e.preventDefault();
    try {
      await api.post("/notices", newNotice);
      setStatusAlert({ type: "success", text: "कक्षा सूचना सफलतापूर्वक प्रकाशित हो गई!" });
      setShowNoticeModal(false);
      setNewNotice({ title: "", content: "", type: "कक्षा सूचना", priority: "HIGH" });
      fetchNotices();
      window.dispatchEvent(new CustomEvent("noticesUpdated"));
    } catch (err) {
      setStatusAlert({ type: "danger", text: err.message || "सूचना प्रकाशन विफल" });
    }
  };

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setStatusAlert(null);
    try {
      await updateProfile({
        name: profileName,
        phone: profilePhone,
        avatar: profileAvatar,
      });
      setStatusAlert({ type: "success", text: "आचार्य प्रोफ़ाइल विवरण सफलतापूर्वक अद्यतन हो गया!" });
    } catch (err) {
      setStatusAlert({ type: "danger", text: err.message || "प्रोफ़ाइल अद्यतन विफल रहा" });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatusAlert({ type: "danger", text: "नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते हैं।" });
      return;
    }
    setChangingPass(true);
    setStatusAlert(null);
    try {
      await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setStatusAlert({ type: "success", text: "पासवर्ड सफलतापूर्वक परिवर्तित हो गया!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setStatusAlert({ type: "danger", text: err.message || "पासवर्ड परिवर्तन विफल रहा।" });
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="teacher-portal-root">
      {/* Mobile Drawer Backdrop (only when mobile drawer is explicitly opened) */}
      {isMobile && sidebarOpen && (
        <div
          className="teacher-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          title="मेन्यू बंद करें"
        />
      )}

      {/* ── Left Sidebar Navigation ────────────────────────────────── */}
      <aside className={`teacher-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div className="teacher-sidebar-brand">
          <div className="teacher-brand-info">
            <img src="/logo.png" alt="Logo" className="teacher-brand-logo" onError={(e) => { e.target.style.display = "none"; }} />
            <div className="teacher-brand-titles">
              <h4>आर्य पाठशाला</h4>
              <span>आचार्य पोर्टल (Teacher LMS)</span>
            </div>
          </div>
          <button
            type="button"
            className="teacher-sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close Sidebar"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Teacher Mini Profile in Sidebar */}
        <div className="teacher-sidebar-user-card">
          <div className="teacher-user-avatar">
            {user?.avatar || "🧘‍♂️"}
          </div>
          <div className="teacher-user-meta">
            <div className="teacher-user-name" title={user?.name || "आचार्य"}>
              {user?.name || "आचार्य"}
            </div>
            <span className="teacher-user-badge">
              <FontAwesomeIcon icon={faChalkboardTeacher} /> आर्ष व्याख्याता
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="teacher-sidebar-nav">
          <div className="teacher-nav-group-title">अध्यापन एवं कक्षाएं</div>

          <button
            type="button"
            className={`teacher-nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => handleNav("overview")}
          >
            <div className="teacher-nav-item-left">
              <FontAwesomeIcon icon={faHome} className="nav-icon" />
              <span>डैशबोर्ड अवलोकन</span>
            </div>
          </button>

          <button
            type="button"
            className={`teacher-nav-item ${activeTab === "courses" ? "active" : ""}`}
            onClick={() => handleNav("courses")}
          >
            <div className="teacher-nav-item-left">
              <FontAwesomeIcon icon={faBookOpen} className="nav-icon" />
              <span>संचालित पाठ्यक्रम</span>
            </div>
            {totalCoursesCount > 0 && <span className="teacher-nav-pill-count">{totalCoursesCount}</span>}
          </button>

          <button
            type="button"
            className={`teacher-nav-item ${activeTab === "students" ? "active" : ""}`}
            onClick={() => handleNav("students")}
          >
            <div className="teacher-nav-item-left">
              <FontAwesomeIcon icon={faUsers} className="nav-icon" />
              <span>शिक्षार्थी सूची व प्रगति</span>
            </div>
            <span className="teacher-nav-pill-count">{totalStudentsCount}</span>
          </button>

          <button
            type="button"
            className={`teacher-nav-item ${activeTab === "schedule" ? "active" : ""}`}
            onClick={() => handleNav("schedule")}
          >
            <div className="teacher-nav-item-left">
              <FontAwesomeIcon icon={faCalendarAlt} className="nav-icon" />
              <span>कक्षा समय-सारणी व लाइव</span>
            </div>
          </button>

          <div className="teacher-nav-group-title">अकादमिक कार्य</div>

          <button
            type="button"
            className={`teacher-nav-item ${activeTab === "qaDesk" ? "active" : ""}`}
            onClick={() => handleNav("qaDesk")}
          >
            <div className="teacher-nav-item-left">
              <FontAwesomeIcon icon={faQuestionCircle} className="nav-icon" />
              <span>शंका समाधान मंच</span>
            </div>
            {pendingDoubtsCount > 0 && (
              <span className="teacher-nav-pill-count" style={{ background: "#e74c3c" }}>
                {pendingDoubtsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`teacher-nav-item ${activeTab === "notices" ? "active" : ""}`}
            onClick={() => handleNav("notices")}
          >
            <div className="teacher-nav-item-left">
              <FontAwesomeIcon icon={faBell} className="nav-icon" />
              <span>शिक्षार्थी सूचनाएं</span>
            </div>
            {notices.length > 0 && <span className="teacher-nav-pill-count">{notices.length}</span>}
          </button>

          <div className="teacher-nav-group-title">खाता व परिचय</div>

          <button
            type="button"
            className={`teacher-nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => handleNav("profile")}
          >
            <div className="teacher-nav-item-left">
              <FontAwesomeIcon icon={faUser} className="nav-icon" />
              <span>आचार्य प्रोफ़ाइल व परिचय</span>
            </div>
          </button>

          <button
            type="button"
            className={`teacher-nav-item ${activeTab === "security" ? "active" : ""}`}
            onClick={() => handleNav("security")}
          >
            <div className="teacher-nav-item-left">
              <FontAwesomeIcon icon={faShieldAlt} className="nav-icon" />
              <span>सुरक्षा एवं पासवर्ड</span>
            </div>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="teacher-sidebar-footer">
          <button type="button" className="teacher-footer-btn" onClick={onBackToHome}>
            <FontAwesomeIcon icon={faArrowLeft} /> मुख्य वेबसाइट (Live Site)
          </button>
          <button type="button" className="teacher-footer-btn logout" onClick={logout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> लॉग आउट करें
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ───────────────────────────────────── */}
      <main className="teacher-main-content">
        {/* Top Sticky Bar */}
        <header className="teacher-topbar">
          <div className="teacher-topbar-left">
            <button
              type="button"
              className="teacher-mobile-menu-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open Menu"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
            <div className="teacher-topbar-title">
              <h3>
                {activeTab === "overview" && "आचार्य डैशबोर्ड अवलोकन"}
                {activeTab === "courses" && "संचालित पाठ्यक्रम प्रबंधन"}
                {activeTab === "students" && "नामांकित शिक्षार्थी एवं अध्ययन प्रगति"}
                {activeTab === "schedule" && "कक्षा समय-सारणी एवं लाइव व्याख्यान"}
                {activeTab === "qaDesk" && "शिक्षार्थी शंका समाधान मंच"}
                {activeTab === "notices" && "कक्षा सूचनाएं एवं परिपत्र"}
                {activeTab === "profile" && "आचार्य परिचय एवं परिचय पत्र"}
                {activeTab === "security" && "खाता सुरक्षा एवं पासवर्ड"}
              </h3>
            </div>
          </div>

          <div className="teacher-topbar-right">
            <div className="teacher-status-pill">
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>सक्रिय अध्यापन सत्र</span>
            </div>
            <button type="button" className="teacher-portal-btn-live" onClick={onBackToHome}>
              <FontAwesomeIcon icon={faHome} />
              <span>वेबसाइट देखें</span>
            </button>
          </div>
        </header>

        {/* Alert Notification Toast */}
        {statusAlert && (
          <div className="px-4 pt-3">
            <Alert variant={statusAlert.type} dismissible onClose={() => setStatusAlert(null)}>
              {statusAlert.text}
            </Alert>
          </div>
        )}

        {/* ── Page Body ─────────────────────────────────────────── */}
        <div className="teacher-page-body">
          {/* ══════════════════════════════════════════════════════
              TAB 1: OVERVIEW DASHBOARD
             ══════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div>
              {/* Acharya Welcome Banner */}
              <div className="teacher-welcome-hero">
                <div className="teacher-hero-ornament">🪔</div>
                <div className="teacher-hero-content">
                  <div className="teacher-hero-pill">
                    <FontAwesomeIcon icon={faChalkboardTeacher} />
                    <span>वैदिक गुरुकुल आचार्य पीठ</span>
                  </div>
                  <h2 className="teacher-hero-title">
                    प्रणाम आचार्य {user?.name || ""}!
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.92)", fontSize: "0.95rem", margin: 0 }}>
                    आर्य पाठशाला में आपके ज्ञान एवं मार्गदर्शन से शिक्षार्थी आर्ष विद्या के गूढ़ मन्त्रों को आत्मसात् कर रहे हैं।
                  </p>

                  <div className="teacher-hero-mantra-box">
                    <div className="teacher-hero-mantra-shloka">
                      "अखण्डमण्डलाकारं व्याप्तं येन चराचरम्। तत्पदं दर्शितं येन तस्मै श्रीगुरवे नमः॥"
                    </div>
                    <p className="teacher-hero-mantra-meaning">
                      — गुरु ही अज्ञान रूपी अन्धकार को दूर कर परमतत्व का साक्षात् प्रकाश प्रदान करने वाले हैं।
                    </p>
                  </div>

                  <div className="teacher-hero-actions">
                    <button
                      type="button"
                      className="btn-teacher-primary"
                      onClick={() => setShowScheduleModal(true)}
                    >
                      <FontAwesomeIcon icon={faPlus} /> नवीन व्याख्यान सत्र निर्धारित करें
                    </button>
                    <button
                      type="button"
                      className="btn-teacher-secondary"
                      onClick={() => handleNav("qaDesk")}
                    >
                      <FontAwesomeIcon icon={faQuestionCircle} /> शंका समाधान ({pendingDoubtsCount} लम्बित)
                    </button>
                  </div>
                </div>
              </div>

              {/* KPI Metrics Cards */}
              <div className="teacher-stats-row">
                <div className="teacher-stat-card">
                  <div className="teacher-stat-icon-wrap ochre">
                    <FontAwesomeIcon icon={faBookOpen} />
                  </div>
                  <div>
                    <div className="teacher-stat-number">{totalCoursesCount}</div>
                    <div className="teacher-stat-label">संचालित पाठ्यक्रम</div>
                  </div>
                </div>

                <div className="teacher-stat-card">
                  <div className="teacher-stat-icon-wrap maroon">
                    <FontAwesomeIcon icon={faUsers} />
                  </div>
                  <div>
                    <div className="teacher-stat-number">{totalStudentsCount}</div>
                    <div className="teacher-stat-label">सक्रिय शिक्षार्थी</div>
                  </div>
                </div>

                <div className="teacher-stat-card">
                  <div className="teacher-stat-icon-wrap green">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                  </div>
                  <div>
                    <div className="teacher-stat-number">{schedule.length}</div>
                    <div className="teacher-stat-label">साप्ताहिक व्याख्यान</div>
                  </div>
                </div>

                <div className="teacher-stat-card">
                  <div className="teacher-stat-icon-wrap blue">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                  </div>
                  <div>
                    <div className="teacher-stat-number">{pendingDoubtsCount}</div>
                    <div className="teacher-stat-label">अनुत्तरित शंकाएं</div>
                  </div>
                </div>

                <div className="teacher-stat-card">
                  <div className="teacher-stat-icon-wrap purple">
                    <FontAwesomeIcon icon={faGraduationCap} />
                  </div>
                  <div>
                    <div className="teacher-stat-number">८२%</div>
                    <div className="teacher-stat-label">औसत पूर्णता दर</div>
                  </div>
                </div>
              </div>

              {/* Split Row: Upcoming Classes & Pending Doubts */}
              <Row className="g-4">
                <Col lg={7}>
                  <div className="teacher-section-heading">
                    <h4>
                      <FontAwesomeIcon icon={faCalendarAlt} /> आगामी व्याख्यान सत्र (Schedule)
                    </h4>
                    <Button variant="outline-warning" size="sm" onClick={() => setShowScheduleModal(true)}>
                      + नया सत्र
                    </Button>
                  </div>

                  <div className="d-flex flex-column gap-3">
                    {schedule.slice(0, 3).map((s) => (
                      <div
                        key={s.id}
                        className="bg-white p-3 rounded-3 border d-flex align-items-center justify-content-between gap-3 shadow-sm"
                      >
                        <div className="min-w-0">
                          <span className="badge bg-warning-subtle text-warning-emphasis fw-bold mb-1" style={{ fontSize: "0.72rem" }}>
                            {s.day} • {s.time}
                          </span>
                          <h6 className="fw-bold text-truncate mb-1" style={{ color: "var(--tp-primary)" }}>
                            {s.title}
                          </h6>
                          <div className="small text-muted">{s.courseTitle}</div>
                        </div>

                        <a
                          href={s.meetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-2"
                          style={{ flexShrink: 0 }}
                        >
                          <FontAwesomeIcon icon={faVideo} />
                          <span>कक्षा में प्रवेश</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </Col>

                <Col lg={5}>
                  <div className="teacher-section-heading">
                    <h4>
                      <FontAwesomeIcon icon={faQuestionCircle} /> शिक्षार्थी शंकाएं (Doubt Q&A)
                    </h4>
                    <span className="teacher-heading-tag">{pendingDoubtsCount} लम्बित</span>
                  </div>

                  <div className="bg-white p-3 rounded-3 border shadow-sm d-flex flex-column gap-3">
                    {doubts.slice(0, 3).map((d) => (
                      <div key={d.id} className="p-2 border-bottom">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="small fw-bold text-danger">{d.studentName}</span>
                          <span className={`badge ${d.status === "ANSWERED" ? "bg-success" : "bg-warning text-dark"}`} style={{ fontSize: "0.68rem" }}>
                            {d.status === "ANSWERED" ? "उत्तरित" : "लम्बित"}
                          </span>
                        </div>
                        <div className="small text-dark fw-bold text-truncate mb-1">{d.question}</div>
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <span className="text-muted" style={{ fontSize: "0.72rem" }}>{d.date}</span>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            style={{ fontSize: "0.75rem", padding: "2px 8px" }}
                            onClick={() => {
                              setReplyDoubtModal(d);
                              setReplyText(d.answer || "");
                            }}
                          >
                            <FontAwesomeIcon icon={faReply} className="me-1" />
                            {d.status === "ANSWERED" ? "उत्तर देखें" : "उत्तर दें"}
                          </Button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm w-100"
                      onClick={() => handleNav("qaDesk")}
                    >
                      समस्त शंकाएं देखें
                    </button>
                  </div>
                </Col>
              </Row>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 2: COURSES MANAGEMENT
             ══════════════════════════════════════════════════════ */}
          {activeTab === "courses" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div className="teacher-section-heading m-0">
                  <h4>
                    <FontAwesomeIcon icon={faBookOpen} />
                    संचालित पाठ्यक्रम सूची ({courses.length})
                  </h4>
                </div>
                <Button variant="danger" size="sm" onClick={() => setShowAddCourseModal(true)}>
                  <FontAwesomeIcon icon={faPlus} className="me-1" /> नवीन पाठ्यक्रम प्रस्ताव जोड़ें
                </Button>
              </div>

              {loadingCourses ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-danger mb-2" />
                  <p className="text-muted fw-bold">पाठ्यक्रम लोड हो रहे हैं...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-3 border p-5">
                  <h5>कोई पाठ्यक्रम उपलब्ध नहीं है</h5>
                </div>
              ) : (
                <Row className="g-4">
                  {courses.map((c) => (
                    <Col lg={4} md={6} key={c.id}>
                      <div className="bg-white rounded-3 border shadow-sm overflow-hidden h-100 d-flex flex-column">
                        <div style={{ height: "160px", position: "relative" }}>
                          <DynamicBookCover title={c.title} image={c.image} style={{ width: "100%", height: "100%" }} />
                          <span
                            className="badge bg-danger position-absolute"
                            style={{ top: "12px", right: "12px", fontSize: "0.72rem" }}
                          >
                            {c.category?.toUpperCase() || "VED"}
                          </span>
                        </div>

                        <div className="p-3 d-flex flex-column flex-1">
                          <h6 className="fw-bold mb-1 text-truncate" title={c.title} style={{ color: "var(--tp-primary)" }}>
                            {c.title}
                          </h6>
                          <div className="small text-muted mb-2">
                            <FontAwesomeIcon icon={faClock} className="me-1" />
                            {c.durationHours || 30} घण्टे • {c.instructor || user?.name || "आचार्य"}
                          </div>
                          <p className="small text-muted mb-3" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {c.description}
                          </p>

                          <div className="mt-auto d-flex gap-2">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="w-100"
                              onClick={() => {
                                handleNav("students");
                              }}
                            >
                              <FontAwesomeIcon icon={faUsers} className="me-1" /> शिक्षार्थी देखें
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 3: STUDENTS PROGRESS ROSTER
             ══════════════════════════════════════════════════════ */}
          {activeTab === "students" && (
            <div>
              <div className="bg-white p-3 rounded-3 border shadow-sm mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div className="teacher-section-heading m-0">
                  <h4 className="m-0">
                    <FontAwesomeIcon icon={faUsers} />
                    नामांकित शिक्षार्थी प्रगति रोस्टर
                  </h4>
                </div>

                <div className="input-group input-group-sm" style={{ maxWidth: "260px" }}>
                  <span className="input-group-text bg-white">
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="शिक्षार्थी या पाठ्यक्रम खोजें..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="teacher-table-responsive">
                <table className="teacher-custom-table">
                  <thead>
                    <tr>
                      <th>शिक्षार्थी नाम</th>
                      <th>ई-मेल</th>
                      <th>पाठ्यक्रम</th>
                      <th>अध्ययन प्रगति</th>
                      <th>स्थिति</th>
                      <th>नामांकन तिथि</th>
                      <th>कार्यवाही</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s) => {
                      const prog = s.progressPercent ?? s.progress ?? 0;
                      const isComp = s.status === "COMPLETED" || s.status === "सम्पन्न" || prog === 100;
                      const dateStr = s.enrolledDate || (s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString("hi-IN") : "अद्यतन");
                      return (
                        <tr key={s.id}>
                          <td className="fw-bold">
                            <span className="me-2">{s.avatar || "🕉️"}</span>
                            {s.name}
                          </td>
                          <td className="text-muted small">{s.email}</td>
                          <td className="fw-semibold text-danger small">{s.courseTitle}</td>
                          <td style={{ minWidth: "150px" }}>
                            <div className="d-flex justify-content-between small fw-bold mb-1">
                              <span>प्रगति</span>
                              <span>{prog}%</span>
                            </div>
                            <ProgressBar
                              now={prog}
                              variant={prog === 100 ? "success" : "warning"}
                              style={{ height: "6px" }}
                            />
                          </td>
                          <td>
                            <span className={`badge ${isComp ? "bg-success" : "bg-warning text-dark"}`}>
                              {isComp ? "सम्पन्न (100%)" : "अध्ययनरत"}
                            </span>
                          </td>
                          <td className="small text-muted">{dateStr}</td>
                          <td>
                            {prog === 100 ? (
                              <Button
                                variant="outline-success"
                                size="sm"
                                style={{ fontSize: "0.75rem" }}
                                onClick={() => {
                                  setStatusAlert({
                                    type: "success",
                                    text: `${s.name} का प्रमाण-पत्र सत्यापित एवं अनुमोदित है!`
                                  });
                                }}
                              >
                                <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                प्रमाण-पत्र अनुमोदित
                              </Button>
                            ) : (
                              <span className="small text-muted">अध्ययन जारी ({prog}%)</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-4">
                          {loadingStudents ? "डेटाबेस से शिक्षार्थी लोड हो रहे हैं..." : "कोई शिक्षार्थी रिकॉर्ड प्राप्त नहीं हुआ"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 4: DOUBT Q&A DESK
             ══════════════════════════════════════════════════════ */}
          {activeTab === "qaDesk" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div className="teacher-section-heading m-0">
                  <h4>
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    शिक्षार्थी शंका समाधान मंच
                  </h4>
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className={`btn btn-sm ${doubtFilter === "all" ? "btn-danger fw-bold" : "btn-outline-secondary"}`}
                    onClick={() => setDoubtFilter("all")}
                  >
                    समस्त शंकाएं ({doubts.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${doubtFilter === "pending" ? "btn-danger fw-bold" : "btn-outline-secondary"}`}
                    onClick={() => setDoubtFilter("pending")}
                  >
                    लम्बित ({pendingDoubtsCount})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${doubtFilter === "answered" ? "btn-danger fw-bold" : "btn-outline-secondary"}`}
                    onClick={() => setDoubtFilter("answered")}
                  >
                    समाधानित ({doubts.length - pendingDoubtsCount})
                  </button>
                </div>
              </div>

              <div className="teacher-qa-list">
                {filteredDoubts.map((d) => {
                  const replyContent = d.reply || d.answer;
                  const contextContent = d.shlokaContext || d.context;
                  return (
                    <div key={d.id} className="teacher-qa-card">
                      <div className="teacher-qa-header">
                        <div className="teacher-qa-student">
                          <FontAwesomeIcon icon={faUser} />
                          <span>{d.studentName}</span>
                          <span className="text-muted fw-normal">• {d.courseTitle}</span>
                        </div>
                        <span className={`badge ${d.status === "ANSWERED" ? "bg-success" : "bg-warning text-dark"}`}>
                          {d.status === "ANSWERED" ? "उत्तरित (Resolved)" : "लम्बित (Pending)"}
                        </span>
                      </div>

                      <h5 className="teacher-qa-question">{d.question}</h5>
                      {contextContent && (
                        <div className="teacher-qa-context">
                          <strong>सन्दर्भ:</strong> {contextContent}
                        </div>
                      )}

                      {replyContent ? (
                        <div className="teacher-qa-reply-box">
                          <div className="small fw-bold text-success mb-1">
                            <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                            आचार्य उत्तर:
                          </div>
                          <p className="small text-dark mb-0">{replyContent}</p>
                        </div>
                      ) : (
                        <div className="text-end mt-2">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setReplyDoubtModal(d);
                              setReplyText("");
                            }}
                          >
                            <FontAwesomeIcon icon={faReply} className="me-1" /> उत्तर लिखें
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {filteredDoubts.length === 0 && (
                  <div className="text-center text-muted py-5 bg-white rounded border">
                    {loadingDoubts ? "शंका समाधान सूची लोड हो रही है..." : "वर्तमान में कोई अनुत्तरित शंका लम्बित नहीं है।"}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 5: SCHEDULE & LIVE SESSIONS
             ══════════════════════════════════════════════════════ */}
          {activeTab === "schedule" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div className="teacher-section-heading m-0">
                  <h4>
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    साप्ताहिक व्याख्यान समय-सारणी
                  </h4>
                </div>
                <Button variant="danger" size="sm" onClick={() => setShowScheduleModal(true)}>
                  <FontAwesomeIcon icon={faPlus} className="me-1" /> नवीन लाइव कक्षा निर्धारित करें
                </Button>
              </div>

              <div className="teacher-schedule-grid">
                {schedule.map((s) => (
                  <div key={s.id} className="teacher-session-card">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="session-date-pill">
                        <FontAwesomeIcon icon={faClock} />
                        <span>{s.day}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleLiveStatus(s)}
                        className={`badge border-0 ${s.status === "लाइव" ? "bg-danger" : s.status === "सम्पन्न" ? "bg-secondary" : "bg-warning text-dark"}`}
                        title="स्थिति बदलने हेतु क्लिक करें"
                        style={{ cursor: "pointer" }}
                      >
                        {s.status === "लाइव" ? "🔴 लाइव" : s.status || "आगामी"}
                      </button>
                    </div>
                    <h5 className="session-title">{s.title}</h5>
                    <div className="session-course-tag">{s.courseTitle}</div>
                    <div className="small text-muted mb-3">
                      <strong>समय:</strong> {s.time}
                    </div>

                    <div className="mt-auto">
                      <a
                        href={s.meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-danger btn-sm w-100 d-inline-flex align-items-center justify-content-center gap-2"
                      >
                        <FontAwesomeIcon icon={faVideo} />
                        <span>लाइव सत्र प्रारम्भ करें</span>
                      </a>
                    </div>
                  </div>
                ))}
                {schedule.length === 0 && (
                  <div className="text-center text-muted py-5 bg-white rounded border w-100" style={{ gridColumn: "1 / -1" }}>
                    {loadingSchedule ? "समय-सारणी लोड हो रही है..." : "कोई लाइव व्याख्यान सत्र निर्धारित नहीं है। 'नवीन लाइव कक्षा निर्धारित करें' पर क्लिक करें।"}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 6: NOTICES TO STUDENTS
             ══════════════════════════════════════════════════════ */}
          {activeTab === "notices" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div className="teacher-section-heading m-0">
                  <h4>
                    <FontAwesomeIcon icon={faBell} />
                    शिक्षार्थी सूचनाएं एवं परिपत्र
                  </h4>
                </div>
                <Button variant="danger" size="sm" onClick={() => setShowNoticeModal(true)}>
                  <FontAwesomeIcon icon={faPlus} className="me-1" /> नवीन कक्षा सूचना प्रकाशित करें
                </Button>
              </div>

              <div className="d-flex flex-column gap-3">
                {notices.map((n) => (
                  <div key={n.id} className="bg-white p-3 rounded-3 border shadow-sm">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className={`badge ${n.priority === "HIGH" ? "bg-danger" : "bg-warning text-dark"}`}>
                        {n.type || "सूचना"}
                      </span>
                      <span className="small text-muted">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString("hi-IN") : ""}
                      </span>
                    </div>
                    <h5 className="fw-bold mb-1" style={{ color: "var(--tp-primary)" }}>{n.title}</h5>
                    <p className="small text-muted m-0" style={{ lineHeight: 1.6 }}>{n.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 7: ACHARYA PROFILE & ID
             ══════════════════════════════════════════════════════ */}
          {activeTab === "profile" && (
            <Row className="g-4">
              <Col md={5}>
                <div className="teacher-id-card">
                  <div className="teacher-id-header">
                    <div className="fw-bold text-danger" style={{ fontSize: "1.1rem" }}>
                      आर्य पाठशाला गुरुकुल
                    </div>
                    <div className="small text-muted">आधिकारिक आचार्य परिचय पत्र</div>
                  </div>

                  <div className="teacher-id-avatar-stage">
                    {profileAvatar || "🧘‍♂️"}
                  </div>

                  <h4 className="teacher-id-name">{profileName || user?.name || "आचार्य"}</h4>
                  <div className="teacher-id-title">{profileTitle}</div>

                  <table className="teacher-id-details-table">
                    <tbody>
                      <tr>
                        <td>आचार्य कोड:</td>
                        <td>AP-ACH-0{user?.id || 12}</td>
                      </tr>
                      <tr>
                        <td>ई-मेल:</td>
                        <td>{user?.email}</td>
                      </tr>
                      <tr>
                        <td>सम्पर्क:</td>
                        <td>{profilePhone || user?.phone || "+91 98765 43210"}</td>
                      </tr>
                      <tr>
                        <td>अध्यापन अनुभव:</td>
                        <td>१२+ वर्ष</td>
                      </tr>
                      <tr>
                        <td>मार्गदर्शित छात्र:</td>
                        <td>{students.length * 15}+</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Col>

              <Col md={7}>
                <div className="bg-white p-4 rounded-3 border shadow-sm">
                  <h5 className="fw-bold mb-3" style={{ color: "var(--tp-primary)" }}>
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    आचार्य व्यक्तिगत विवरण सम्पादन
                  </h5>

                  <Form onSubmit={handleSaveProfile}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold small">अवतार प्रतीक (Avatar)</Form.Label>
                      <div className="d-flex gap-2 flex-wrap mb-2">
                        {["🧘‍♂️", "🕉️", "📚", "🪔", "📜", "🎓", "🚩", "🏛️"].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            className={`btn btn-sm ${profileAvatar === emoji ? "btn-danger" : "btn-outline-secondary"
                              }`}
                            onClick={() => setProfileAvatar(emoji)}
                            style={{ fontSize: "1.2rem", padding: "4px 10px" }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold small">आचार्य पूर्ण नाम</Form.Label>
                      <Form.Control
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold small">शास्त्रीय उपाधि / पदनाम</Form.Label>
                      <Form.Control
                        type="text"
                        value={profileTitle}
                        onChange={(e) => setProfileTitle(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold small">पंजीकृत ई-मेल (अपरिवर्तनीय)</Form.Label>
                      <Form.Control type="email" value={user?.email || ""} disabled readOnly />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold small">सम्पर्क फ़ोन नम्बर</Form.Label>
                      <Form.Control
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </Form.Group>

                    <Button variant="danger" type="submit" disabled={savingProfile}>
                      {savingProfile ? "सहेजा जा रहा है..." : "विवरण सहेजें"}
                    </Button>
                  </Form>
                </div>
              </Col>
            </Row>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 8: SECURITY & PASSWORD
             ══════════════════════════════════════════════════════ */}
          {activeTab === "security" && (
            <div className="bg-white p-4 rounded-3 border shadow-sm" style={{ maxWidth: "600px" }}>
              <h5 className="fw-bold mb-3" style={{ color: "var(--tp-primary)" }}>
                <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
                सुरक्षा एवं पासवर्ड परिवर्तन
              </h5>

              <Form onSubmit={handleChangePassword}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">वर्तमान पासवर्ड</Form.Label>
                  <Form.Control
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">नया पासवर्ड (कम से कम ६ अक्षर)</Form.Label>
                  <Form.Control
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold small">नये पासवर्ड की पुष्टि करें</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button variant="warning" type="submit" disabled={changingPass} className="fw-bold">
                  {changingPass ? "बदला जा रहा है..." : "पासवर्ड बदलें"}
                </Button>
              </Form>
            </div>
          )}
        </div>
      </main>

      {/* ── Modal: Add Course Proposal ────────────────────────── */}
      <Modal show={showAddCourseModal} onHide={() => setShowAddCourseModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-danger">नवीन पाठ्यक्रम प्रस्ताव जोड़ें</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateCourse}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">पाठ्यक्रम शीर्षक (हिन्दी)</Form.Label>
              <Form.Control
                type="text"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                placeholder="जैसे: ऋग्वेद सूक्त भाष्य"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">श्रेणी</Form.Label>
              <Form.Select
                value={newCourse.category}
                onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
              >
                <option value="ved">वेद (Veda)</option>
                <option value="upanishad">उपनिषद् (Upanishad)</option>
                <option value="darshan">दर्शन (Darshan)</option>
                <option value="grammar">व्याकरण (Grammar)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">अवधि (घण्टों में)</Form.Label>
              <Form.Control
                type="number"
                value={newCourse.durationHours}
                onChange={(e) => setNewCourse({ ...newCourse, durationHours: parseInt(e.target.value, 10) || 10 })}
                min={1}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">पाठ्यक्रम संक्षिप्त विवरण</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                placeholder="पाठ्यक्रम के प्रमुख विषय व अध्ययन बिन्दु..."
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddCourseModal(false)}>
              रद्द करें
            </Button>
            <Button variant="danger" type="submit">
              प्रस्तावित करें
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ── Modal: Add Live Session Schedule ─────────────────── */}
      <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-danger">नवीन लाइव व्याख्यान सत्र निर्धारित करें</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddSchedule}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">सत्र विषय / अध्याय</Form.Label>
              <Form.Control
                type="text"
                value={newSchedule.title}
                onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                placeholder="जैसे: ऋग्वेद प्रथम मण्डल सस्वर पाठ"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">सम्बद्ध पाठ्यक्रम</Form.Label>
              <Form.Control
                type="text"
                value={newSchedule.courseTitle}
                onChange={(e) => setNewSchedule({ ...newSchedule, courseTitle: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">दिन (Days)</Form.Label>
              <Form.Control
                type="text"
                value={newSchedule.day}
                onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value })}
                placeholder="जैसे: सोमवार एवं गुरुवार"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">समय (Time Slot)</Form.Label>
              <Form.Control
                type="text"
                value={newSchedule.time}
                onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                placeholder="जैसे: प्रातः ०७:०० - ०८:००"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">गूगल मीट / ज़ूम लिंक</Form.Label>
              <Form.Control
                type="url"
                value={newSchedule.meetUrl}
                onChange={(e) => setNewSchedule({ ...newSchedule, meetUrl: e.target.value })}
                placeholder="https://meet.google.com/..."
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>
              रद्द करें
            </Button>
            <Button variant="danger" type="submit">
              सत्र सुरक्षित करें
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ── Modal: Reply to Student Doubt ────────────────────── */}
      <Modal show={!!replyDoubtModal} onHide={() => setReplyDoubtModal(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-danger">शंका समाधान उत्तर प्रेषित करें</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSendReply}>
          <Modal.Body>
            {replyDoubtModal && (
              <>
                <div className="mb-3 p-2 bg-light rounded border">
                  <div className="small fw-bold text-danger">{replyDoubtModal.studentName}</div>
                  <div className="fw-semibold text-dark mt-1">{replyDoubtModal.question}</div>
                  <div className="small text-muted mt-1">{replyDoubtModal.context}</div>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">आचार्य का प्रामाणिक उत्तर (हिन्दी / संस्कृत)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="विस्तृत शास्त्रीय उत्तर लिखें..."
                    required
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setReplyDoubtModal(null)}>
              रद्द करें
            </Button>
            <Button variant="danger" type="submit">
              उत्तर प्रेषित करें
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ── Modal: Publish Notice to Students ────────────────── */}
      <Modal show={showNoticeModal} onHide={() => setShowNoticeModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-danger">नवीन कक्षा सूचना प्रकाशित करें</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePublishNotice}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">सूचना का शीर्षक</Form.Label>
              <Form.Control
                type="text"
                value={newNotice.title}
                onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                placeholder="जैसे: आगामी मन्त्रोच्चार परीक्षा सूचना"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">प्राथमिकता</Form.Label>
              <Form.Select
                value={newNotice.priority}
                onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
              >
                <option value="HIGH">अति आवश्यक (HIGH)</option>
                <option value="MEDIUM">सामान्य (MEDIUM)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">सूचना का विस्तृत विवरण</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={newNotice.content}
                onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                placeholder="समस्त शिक्षार्थियों के लिए सूचना सन्देश..."
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowNoticeModal(false)}>
              रद्द करें
            </Button>
            <Button variant="danger" type="submit">
              प्रकाशित करें
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
