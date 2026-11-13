import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Row, Col, Modal, Button, Form, ProgressBar, Alert, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faBookOpen,
  faScroll,
  faUser,
  faUserGraduate,
  faCheckCircle,
  faClock,
  faPlay,
  faCertificate,
  faBell,
  faKey,
  faSignOutAlt,
  faHome,
  faArrowLeft,
  faSearch,
  faHeart,
  faStar,
  faSpinner,
  faTimes,
  faBars,
  faAward,
  faFire,
  faPrint,
  faExternalLinkAlt,
  faShieldAlt,
  faVideo,
  faQuestionCircle
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import DynamicBookCover from "./DynamicBookCover";
import "./Dashboard.css";

// Gurukul daily inspirational Vedic shlokas
const VEDIC_SHLOKAS = [
  {
    shloka: "संगच्छध्वं संवदध्वं सं वो मनांसि जानताम्। देवा भागं यथा पूर्वे सञ्जानाना उपासते॥",
    source: "ऋग्वेद १०.१९१.२",
    meaning: "हम सब साथ चलें, मिलकर बोलें, और हमारे मन एक समान होकर ज्ञान व सत्य को ग्रहण करें।"
  },
  {
    shloka: "आ नो भद्राः क्रतवो यन्तु विश्वतोऽदब्धासो अपरीतास उद्भिदः।",
    source: "ऋग्वेद १.८९.१",
    meaning: "समस्त दिशाओं से हमारे पास कल्याणकारी, उदात्त और निष्पक्ष विचार निरन्तर आते रहें।"
  },
  {
    shloka: "विद्यां चाविद्यां च यस्तद्वेदोभयं सह। अविद्यया मृत्युं तीर्त्वा विद्ययाऽमृतमश्नुते॥",
    source: "ईशावास्योपनिषद् ११",
    meaning: "जो भौतिक एवं आत्मविद्या दोनों को साथ जानता है, वह कर्म से मृत्यु पार कर ज्ञान से अमरत्व पाता है।"
  },
  {
    shloka: "स्वाध्यायान्मा प्रमदः। सत्यं वद, धर्मं चर, स्वाध्यायान्मा प्रमदितव्यम्॥",
    source: "तैत्तिरीयोपनिषद् १.११",
    meaning: "स्वाध्याय में कभी प्रमाद न करो। सत्य बोलो, धर्म का आचरण करो और विद्याध्ययन में तत्पर रहो।"
  }
];

// Parse syllabus chapters directly from course syllabus in database
const getModulesForCourse = (course) => {
  if (!course) return [];
  if (course.syllabus && course.syllabus.trim()) {
    const lines = course.syllabus
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length > 0) {
      return lines.map((line, idx) => ({
        id: idx + 1,
        title: line,
      }));
    }
  }
  return [];
};

export default function Dashboard({ onBackToHome }) {
  const { user, logout, updateProfile } = useAuth();

  // Active Tab state synced with hash & localStorage
  const [activeTab, setActiveTab] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const hash = window.location.hash || "";
        const match = hash.match(/[?&]tab=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) return match[1];
        const saved = localStorage.getItem("arya_student_tab");
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

  // Data states
  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [savedBookIds, setSavedBookIds] = useState(() => {
    try {
      const saved = localStorage.getItem("arya_fav_books");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Filter & Search states
  const [courseFilter, setCourseFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Active Study Room state
  const [activeStudyCourse, setActiveStudyCourse] = useState(null);
  const [certificateCourse, setCertificateCourse] = useState(null);
  const [selectedNoticeModal, setSelectedNoticeModal] = useState(null);

  // Profile Form state
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || "🕉️");
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  // Global Alert banner
  const [statusAlert, setStatusAlert] = useState(null);

  // Daily Shloka index (changes based on date)
  const todayShloka = useMemo(() => {
    const day = new Date().getDate();
    return VEDIC_SHLOKAS[day % VEDIC_SHLOKAS.length];
  }, []);

  // Time-of-day Hindi greeting
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "सुप्रभातम् (Good Morning)";
    if (hour < 17) return "शुभ मध्याह्नम् (Good Afternoon)";
    return "शुभ सन्ध्या (Good Evening)";
  }, []);

  // Sync activeTab to localStorage and URL hash
  const handleNav = (tabKey) => {
    setActiveTab(tabKey);
    try {
      localStorage.setItem("arya_student_tab", tabKey);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `#dashboard?tab=${tabKey}`);
      }
    } catch (e) { }
    if (window.innerWidth < 992) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem("arya_student_tab", activeTab);
      if (typeof window !== "undefined" && !window.location.hash.includes(`tab=${activeTab}`)) {
        window.history.replaceState(null, "", `#dashboard?tab=${activeTab}`);
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

  // 1. Fetch Student Enrollments from API
  const fetchEnrollments = useCallback(async () => {
    setLoadingEnrollments(true);
    try {
      const res = await api.get("/enrollments/my-courses");
      if (res && res.success && Array.isArray(res.data)) {
        setEnrollments(res.data);
      } else if (Array.isArray(res)) {
        setEnrollments(res);
      } else {
        setEnrollments([]);
      }
    } catch (err) {
      console.warn("Could not fetch real enrollments:", err.message);
      setEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
    }
  }, []);

  // 2. Fetch Institute Notices for Students from MySQL
  const fetchNotices = useCallback(async () => {
    setLoadingNotices(true);
    try {
      const res = await api.get("/notices?limit=15");
      if (res?.data?.notices && Array.isArray(res.data.notices)) {
        setNotices(res.data.notices);
      } else if (Array.isArray(res?.data)) {
        setNotices(res.data);
      } else {
        setNotices([]);
      }
    } catch (err) {
      console.warn("Notices fetch error:", err.message);
      setNotices([]);
    } finally {
      setLoadingNotices(false);
    }
  }, []);

  // 3. Fetch Library Books to cross-reference saved books
  const fetchLibraryBooks = useCallback(async () => {
    try {
      const res = await api.get("/library?limit=100&all=false");
      if (res?.data?.books && Array.isArray(res.data.books)) {
        setLibraryBooks(res.data.books);
      }
    } catch (err) {
      console.warn("Library books fetch error:", err.message);
    }
  }, []);

  // 4. Fetch Live Lecture Schedules from MySQL
  const [liveSessions, setLiveSessions] = useState([]);
  const fetchLiveSessions = useCallback(async () => {
    try {
      const res = await api.get("/live-sessions");
      if (res?.data && Array.isArray(res.data)) {
        setLiveSessions(res.data);
      } else {
        setLiveSessions([]);
      }
    } catch (err) {
      console.warn("Live sessions fetch error:", err.message);
      setLiveSessions([]);
    }
  }, []);

  // 5. Fetch Student Doubts & Q&A from MySQL
  const [studentDoubts, setStudentDoubts] = useState([]);
  const fetchDoubts = useCallback(async () => {
    try {
      const res = await api.get("/doubts");
      if (res?.data && Array.isArray(res.data)) {
        setStudentDoubts(res.data);
      } else {
        setStudentDoubts([]);
      }
    } catch (err) {
      console.warn("Doubts fetch error:", err.message);
      setStudentDoubts([]);
    }
  }, []);

  // Dynamic modules derived from the current active study course
  // Filter live sessions for active study course from MySQL
  const courseLiveSessions = useMemo(() => {
    if (!activeStudyCourse || !Array.isArray(liveSessions)) return [];
    return liveSessions.filter(
      (s) =>
        s.courseId === activeStudyCourse.id ||
        (s.title && activeStudyCourse.title && s.title.toLowerCase().includes(activeStudyCourse.title.toLowerCase()))
    );
  }, [activeStudyCourse, liveSessions]);

  const currentModules = useMemo(() => {
    return getModulesForCourse(activeStudyCourse);
  }, [activeStudyCourse]);

  useEffect(() => {
    fetchEnrollments();
    fetchNotices();
    fetchLibraryBooks();
    fetchLiveSessions();
    fetchDoubts();

    // Listen for cross-component triggers
    const handleSync = () => {
      fetchEnrollments();
      fetchNotices();
      fetchLiveSessions();
      fetchDoubts();
    };
    window.addEventListener("coursesUpdated", handleSync);
    window.addEventListener("noticesUpdated", handleSync);
    window.addEventListener("libraryUpdated", fetchLibraryBooks);
    window.addEventListener("scheduleUpdated", fetchLiveSessions);
    window.addEventListener("doubtsUpdated", fetchDoubts);

    return () => {
      window.removeEventListener("coursesUpdated", handleSync);
      window.removeEventListener("noticesUpdated", handleSync);
      window.removeEventListener("libraryUpdated", fetchLibraryBooks);
      window.removeEventListener("scheduleUpdated", fetchLiveSessions);
      window.removeEventListener("doubtsUpdated", fetchDoubts);
    };
  }, [fetchEnrollments, fetchNotices, fetchLibraryBooks, fetchLiveSessions, fetchDoubts]);

  // Derived Saved Books from library
  const savedBooksList = useMemo(() => {
    if (savedBookIds.size === 0) {
      // If no book saved yet, show top 3 featured books as suggestions
      return libraryBooks.slice(0, 3);
    }
    return libraryBooks.filter((b) => savedBookIds.has(b.id));
  }, [libraryBooks, savedBookIds]);

  // Toggle saved book
  const toggleSaveBook = (bookId, e) => {
    if (e) e.stopPropagation();
    setSavedBookIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookId)) {
        next.delete(bookId);
      } else {
        next.add(bookId);
      }
      try {
        localStorage.setItem("arya_fav_books", JSON.stringify([...next]));
      } catch (err) { }
      return next;
    });
  };

  // Metrics Counters
  const totalEnrolled = enrollments.length;
  const completedCount = enrollments.filter((e) => e.progressPercent === 100 || e.status === "COMPLETED").length;
  const inProgressCount = totalEnrolled - completedCount;
  const savedBooksCount = savedBookIds.size;

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return enrollments.filter((item) => {
      const matchFilter =
        courseFilter === "all" ||
        (courseFilter === "active" && item.progressPercent < 100) ||
        (courseFilter === "completed" && item.progressPercent === 100);

      const matchSearch =
        !searchQuery ||
        (item.course?.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.course?.instructor || "").toLowerCase().includes(searchQuery.toLowerCase());

      return matchFilter && matchSearch;
    });
  }, [enrollments, courseFilter, searchQuery]);

  // Handle Progress update with live backend call
  const handleUpdateProgress = async (enrollmentId, currentPercent, increment = 25) => {
    const nextPercent = Math.min(100, Math.max(0, currentPercent + increment));
    try {
      await api.put("/enrollments/progress", {
        enrollmentId,
        progressPercent: nextPercent,
      });
      setEnrollments((prev) =>
        prev.map((item) =>
          item.id === enrollmentId
            ? {
              ...item,
              progressPercent: nextPercent,
              status: nextPercent === 100 ? "COMPLETED" : "ACTIVE",
              completedAt: nextPercent === 100 ? new Date().toISOString() : item.completedAt,
            }
            : item
        )
      );
      if (nextPercent === 100) {
        setStatusAlert({
          type: "success",
          text: "अभिनन्दन! आपने यह पाठ्यक्रम शत-प्रतिशत पूर्ण कर लिया है। आपका प्रमाण-पत्र तैयार है!",
        });
      } else {
        setStatusAlert({
          type: "success",
          text: `अध्ययन प्रगति अद्यतन: ${nextPercent}% पूर्ण`,
        });
      }
    } catch (err) {
      console.warn("Server progress update error:", err.message);
      // Optimistic update locally
      setEnrollments((prev) =>
        prev.map((item) =>
          item.id === enrollmentId
            ? {
              ...item,
              progressPercent: nextPercent,
              status: nextPercent === 100 ? "COMPLETED" : "ACTIVE",
            }
            : item
        )
      );
    }
  };

  // Open Study Room for a specific course
  const handleStartStudy = (course, enrollment) => {
    setActiveStudyCourse({ ...course, enrollment });
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
      setStatusAlert({ type: "success", text: "आपकी प्रोफ़ाइल सफलतापूर्वक अद्यतन कर दी गई है!" });
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
    <div className="student-portal-root">
      {/* Mobile Drawer Backdrop (only when mobile drawer is explicitly opened) */}
      {isMobile && sidebarOpen && (
        <div
          className="student-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          title="मेन्यू बंद करें"
        />
      )}

      {/* ── Left Sidebar ────────────────────────────────────────── */}
      <aside className={`student-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div className="student-sidebar-brand">
          <div className="student-brand-info">
            <img src="/logo.png" alt="Logo" className="student-brand-logo" onError={(e) => { e.target.style.display = "none"; }} />
            <div className="student-brand-titles">
              <h4>आर्य पाठशाला</h4>
              <span>विद्यार्थी पोर्टल (LMS)</span>
            </div>
          </div>
          <button
            type="button"
            className="student-sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close Sidebar"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Student Mini Profile Box */}
        <div className="student-sidebar-user-card">
          <div className="student-user-avatar">
            {user?.avatar || "🕉️"}
          </div>
          <div className="student-user-meta">
            <div className="student-user-name" title={user?.name || "विद्यार्थी"}>
              {user?.name || "विद्यार्थी"}
            </div>
            <span className="student-user-badge">
              <FontAwesomeIcon icon={faUserGraduate} /> आर्ष शिक्षार्थी
            </span>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="student-sidebar-nav">
          <div className="student-nav-group-title">अध्ययन केन्द्र (Learning)</div>

          <button
            type="button"
            className={`student-nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => handleNav("overview")}
          >
            <div className="student-nav-item-left">
              <FontAwesomeIcon icon={faHome} className="nav-icon" />
              <span>डैशबोर्ड अवलोकन</span>
            </div>
          </button>

          <button
            type="button"
            className={`student-nav-item ${activeTab === "courses" ? "active" : ""}`}
            onClick={() => handleNav("courses")}
          >
            <div className="student-nav-item-left">
              <FontAwesomeIcon icon={faGraduationCap} className="nav-icon" />
              <span>मेरे पाठ्यक्रम</span>
            </div>
            {totalEnrolled > 0 && <span className="student-nav-pill-count">{totalEnrolled}</span>}
          </button>

          <button
            type="button"
            className={`student-nav-item ${activeTab === "studyRoom" ? "active" : ""}`}
            onClick={() => handleNav("studyRoom")}
          >
            <div className="student-nav-item-left">
              <FontAwesomeIcon icon={faBookOpen} className="nav-icon" />
              <span>डिजिटल अध्ययन कक्ष</span>
            </div>
          </button>

          <button
            type="button"
            className={`student-nav-item ${activeTab === "savedBooks" ? "active" : ""}`}
            onClick={() => handleNav("savedBooks")}
          >
            <div className="student-nav-item-left">
              <FontAwesomeIcon icon={faScroll} className="nav-icon" />
              <span>सहेजे गए ग्रन्थ</span>
            </div>
            {savedBooksCount > 0 && <span className="student-nav-pill-count">{savedBooksCount}</span>}
          </button>

          <div className="student-nav-group-title">उपलब्धियां व सूचनाएं</div>

          <button
            type="button"
            className={`student-nav-item ${activeTab === "certificates" ? "active" : ""}`}
            onClick={() => handleNav("certificates")}
          >
            <div className="student-nav-item-left">
              <FontAwesomeIcon icon={faCertificate} className="nav-icon" />
              <span>प्रमाण-पत्र एवं पदक</span>
            </div>
            {completedCount > 0 && <span className="student-nav-pill-count">{completedCount}</span>}
          </button>

          <button
            type="button"
            className={`student-nav-item ${activeTab === "notices" ? "active" : ""}`}
            onClick={() => handleNav("notices")}
          >
            <div className="student-nav-item-left">
              <FontAwesomeIcon icon={faBell} className="nav-icon" />
              <span>संस्थान सूचनाएं</span>
            </div>
            {notices.length > 0 && <span className="student-nav-pill-count">{notices.length}</span>}
          </button>

          <div className="student-nav-group-title">खाता एवं सुरक्षा</div>

          <button
            type="button"
            className={`student-nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => handleNav("profile")}
          >
            <div className="student-nav-item-left">
              <FontAwesomeIcon icon={faUser} className="nav-icon" />
              <span>मेरी प्रोफ़ाइल एवं पहचान पत्र</span>
            </div>
          </button>

          <button
            type="button"
            className={`student-nav-item ${activeTab === "security" ? "active" : ""}`}
            onClick={() => handleNav("security")}
          >
            <div className="student-nav-item-left">
              <FontAwesomeIcon icon={faShieldAlt} className="nav-icon" />
              <span>सुरक्षा एवं पासवर्ड</span>
            </div>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="student-sidebar-footer">
          <button type="button" className="student-footer-btn" onClick={onBackToHome}>
            <FontAwesomeIcon icon={faArrowLeft} /> मुख्य वेबसाइट (Live Site)
          </button>
          <button type="button" className="student-footer-btn logout" onClick={logout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> लॉग आउट करें
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ───────────────────────────────────── */}
      <main className="student-main-content">
        {/* Top Sticky Bar */}
        <header className="student-topbar">
          <div className="student-topbar-left">
            <button
              type="button"
              className="student-mobile-menu-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open Menu"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
            <div className="student-topbar-title">
              <h3>
                {activeTab === "overview" && "डैशबोर्ड अवलोकन"}
                {activeTab === "courses" && "मेरे नामांकित पाठ्यक्रम"}
                {activeTab === "studyRoom" && "डिजिटल अध्ययन कक्ष"}
                {activeTab === "savedBooks" && "मेरी सहेजी गई ग्रन्थ सूची"}
                {activeTab === "certificates" && "प्रमाण-पत्र एवं शैक्षणिक उपलब्धियां"}
                {activeTab === "notices" && "संस्थान सूचनाएं एवं परिपत्र"}
                {activeTab === "profile" && "शिक्षार्थी प्रोफ़ाइल व परिचय पत्र"}
                {activeTab === "security" && "खाता सुरक्षा एवं पासवर्ड"}
              </h3>
            </div>
          </div>

          <div className="student-topbar-right">
            <div className="student-streak-badge" title="स्वाध्याय सातत्य">
              <FontAwesomeIcon icon={faFire} style={{ color: "#e67e22" }} />
              <span>७ दिन स्वाध्याय स्ट्रीक</span>
            </div>
            <button type="button" className="student-portal-btn-live" onClick={onBackToHome}>
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
        <div className="student-page-body">
          {/* ══════════════════════════════════════════════════════
              TAB 1: OVERVIEW DASHBOARD
             ══════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div>
              {/* Vedic Welcome Hero Banner */}
              <div className="student-welcome-hero">
                <div className="student-hero-ornament">🕉️</div>
                <div className="student-hero-content">
                  <div className="student-hero-greeting-pill">
                    <FontAwesomeIcon icon={faStar} />
                    <span>{timeGreeting} • दैनिक वैदिक स्वाध्याय संकल्प</span>
                  </div>
                  <h2 className="student-hero-title">
                    नमस्ते, {user?.name || "प्रिय शिक्षार्थी"}!
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.95rem", margin: 0 }}>
                    आर्य पाठशाला के पावन ज्ञान मन्दिर में आपका स्वागत है। नियमित स्वाध्याय और अभ्यास से आपका ज्ञान परिपक्व हो।
                  </p>

                  {/* Daily Shloka Box */}
                  <div className="student-hero-mantra-box">
                    <div className="student-hero-mantra-shloka">
                      "{todayShloka.shloka}"
                    </div>
                    <p className="student-hero-mantra-meaning">
                      — <strong>{todayShloka.source}</strong> : {todayShloka.meaning}
                    </p>
                  </div>

                  <div className="student-hero-actions">
                    {enrollments.length > 0 ? (
                      <button
                        type="button"
                        className="btn-hero-study"
                        onClick={() => {
                          const firstActive = enrollments.find((e) => e.progressPercent < 100) || enrollments[0];
                          handleStartStudy(firstActive.course, firstActive);
                          handleNav("studyRoom");
                        }}
                      >
                        <FontAwesomeIcon icon={faPlay} /> अध्ययन जारी रखें
                      </button>
                    ) : (
                      <button type="button" className="btn-hero-study" onClick={onBackToHome}>
                        <FontAwesomeIcon icon={faBookOpen} /> नवीन पाठ्यक्रम चुनें
                      </button>
                    )}
                    <button type="button" className="btn-hero-secondary" onClick={() => handleNav("courses")}>
                      समस्त पाठ्यक्रम देखें
                    </button>
                  </div>
                </div>
              </div>

              {/* KPI Stats Grid */}
              <div className="student-stats-row">
                <div className="student-stat-card">
                  <div className="student-stat-icon-wrap maroon">
                    <FontAwesomeIcon icon={faGraduationCap} />
                  </div>
                  <div>
                    <div className="student-stat-number">{totalEnrolled}</div>
                    <div className="student-stat-label">नामांकित पाठ्यक्रम</div>
                  </div>
                </div>

                <div className="student-stat-card">
                  <div className="student-stat-icon-wrap green">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                  <div>
                    <div className="student-stat-number">{completedCount}</div>
                    <div className="student-stat-label">पूर्ण पाठ्यक्रम</div>
                  </div>
                </div>

                <div className="student-stat-card">
                  <div className="student-stat-icon-wrap gold">
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                  <div>
                    <div className="student-stat-number">{inProgressCount}</div>
                    <div className="student-stat-label">अध्ययनरत (सक्रिय)</div>
                  </div>
                </div>

                <div className="student-stat-card">
                  <div className="student-stat-icon-wrap purple">
                    <FontAwesomeIcon icon={faScroll} />
                  </div>
                  <div>
                    <div className="student-stat-number">{savedBooksCount}</div>
                    <div className="student-stat-label">सहेजे गए ग्रन्थ</div>
                  </div>
                </div>

                <div className="student-stat-card">
                  <div className="student-stat-icon-wrap blue">
                    <FontAwesomeIcon icon={faCertificate} />
                  </div>
                  <div>
                    <div className="student-stat-number">{completedCount}</div>
                    <div className="student-stat-label">अर्जित प्रमाण-पत्र</div>
                  </div>
                </div>
              </div>

              {/* Quick Split: Enrolled Courses & Recent Circulars */}
              <Row className="g-4">
                <Col lg={7}>
                  <div className="student-section-heading">
                    <h4>
                      <FontAwesomeIcon icon={faGraduationCap} />
                      अध्ययनरत पाठ्यक्रम
                    </h4>
                    <span className="student-heading-tag">{enrollments.length} पाठ्यक्रम</span>
                  </div>

                  {loadingEnrollments ? (
                    <div className="text-center py-5 bg-white rounded-3 border">
                      <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-danger mb-2" />
                      <p className="text-muted fw-bold">पाठ्यक्रम लोड हो रहे हैं...</p>
                    </div>
                  ) : enrollments.length === 0 ? (
                    <div className="text-center py-5 bg-white rounded-3 border p-4">
                      <div style={{ fontSize: "42px" }}>📖</div>
                      <h5 className="mt-2 fw-bold">अभी कोई पाठ्यक्रम नामांकित नहीं है</h5>
                      <p className="text-muted small">वैदिक ज्ञान एवं उपनिषद् अध्ययन हेतु आज ही किसी पाठ्यक्रम में प्रवेश लें।</p>
                      <Button variant="danger" size="sm" onClick={onBackToHome}>
                        पाठ्यक्रम सूची देखें
                      </Button>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {enrollments.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="bg-white p-3 rounded-3 border d-flex align-items-center justify-content-between gap-3 shadow-sm"
                        >
                          <div className="d-flex align-items-center gap-3 min-w-0">
                            <div style={{ width: "54px", height: "64px", flexShrink: 0, borderRadius: "6px", overflow: "hidden" }}>
                              <DynamicBookCover title={item.course?.title} image={item.course?.image} style={{ width: "100%", height: "100%" }} />
                            </div>
                            <div className="min-w-0">
                              <h6 className="mb-1 text-truncate fw-bold" style={{ color: "var(--sp-primary)" }}>
                                {item.course?.title}
                              </h6>
                              <div className="small text-muted mb-2">
                                {item.course?.instructor || "आचार्य वेदप्रिय शास्त्री"} • {item.progressPercent}% पूर्ण
                              </div>
                              <div style={{ width: "180px", maxWidth: "100%" }}>
                                <ProgressBar
                                  now={item.progressPercent}
                                  variant={item.progressPercent === 100 ? "success" : "danger"}
                                  style={{ height: "6px" }}
                                />
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn-card-study"
                            style={{ padding: "8px 14px", flexShrink: 0 }}
                            onClick={() => {
                              handleStartStudy(item.course, item);
                              handleNav("studyRoom");
                            }}
                          >
                            <FontAwesomeIcon icon={faPlay} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Col>

                {/* Right: Notices & Announcements */}
                <Col lg={5}>
                  <div className="student-section-heading">
                    <h4>
                      <FontAwesomeIcon icon={faBell} />
                      नवीनतम सूचनाएं
                    </h4>
                    <span className="student-heading-tag">{notices.length} सूचनाएं</span>
                  </div>

                  <div className="bg-white p-3 rounded-3 border shadow-sm d-flex flex-column gap-3">
                    {loadingNotices ? (
                      <div className="text-center py-4">
                        <FontAwesomeIcon icon={faSpinner} spin className="text-muted" />
                      </div>
                    ) : notices.length === 0 ? (
                      <p className="text-muted text-center py-3 m-0 small">कोई नवीन सूचना नहीं है।</p>
                    ) : (
                      notices.slice(0, 4).map((n) => (
                        <div
                          key={n.id}
                          className="p-2 border-bottom cursor-pointer"
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedNoticeModal(n)}
                        >
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span className="badge bg-danger-subtle text-danger fw-bold" style={{ fontSize: "0.68rem" }}>
                              {n.type || "सूचना"}
                            </span>
                            <span className="small text-muted" style={{ fontSize: "0.72rem" }}>
                              {n.createdAt ? new Date(n.createdAt).toLocaleDateString("hi-IN") : ""}
                            </span>
                          </div>
                          <div className="fw-bold small text-dark text-truncate">{n.title}</div>
                        </div>
                      ))
                    )}
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm w-100 mt-1"
                      onClick={() => handleNav("notices")}
                    >
                      समस्त सूचनाएं देखें
                    </button>
                  </div>
                </Col>
              </Row>

              {/* Live Lectures & Class Schedule - 100% Live Database */}
              <div className="mt-4">
                <div className="student-section-heading">
                  <h4>
                    <FontAwesomeIcon icon={faVideo} />
                    आगामी एवं लाइव कक्षाएं (Live Lectures & Schedules)
                  </h4>
                  <span className="student-heading-tag">{liveSessions.length} सत्र</span>
                </div>

                {liveSessions.length === 0 ? (
                  <div className="bg-white p-4 rounded-3 border text-center text-muted small shadow-sm">
                    वर्तमान में कोई लाइव व्याख्यान निर्धारित नहीं है।
                  </div>
                ) : (
                  <div className="row g-3">
                    {liveSessions.map((s) => (
                      <div key={s.id} className="col-md-6 col-lg-4">
                        <div className="bg-white p-3 rounded-3 border shadow-sm h-100 d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className={`badge ${s.status === "लाइव" ? "bg-danger" : s.status === "सम्पन्न" ? "bg-secondary" : "bg-warning text-dark"}`}>
                                {s.status === "लाइव" ? "🔴 लाइव" : s.status || "आगामी"}
                              </span>
                              <span className="small text-muted fw-bold">{s.day}</span>
                            </div>
                            <h6 className="fw-bold mb-1 text-dark">{s.title}</h6>
                            <div className="small text-danger fw-semibold mb-1">{s.courseTitle}</div>
                            <div className="small text-muted mb-3">
                              <FontAwesomeIcon icon={faClock} className="me-1" /> {s.time} • {s.instructor || "आचार्य"}
                            </div>
                          </div>
                          <a
                            href={s.meetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-danger btn-sm w-100 d-inline-flex align-items-center justify-content-center gap-2"
                          >
                            <FontAwesomeIcon icon={faVideo} />
                            <span>{s.status === "लाइव" ? "कक्षा में तुरंत जुड़ें" : "मीट लिंक खोलें"}</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Student Q&A Doubts from Database */}
              {studentDoubts.length > 0 && (
                <div className="mt-4">
                  <div className="student-section-heading">
                    <h4>
                      <FontAwesomeIcon icon={faQuestionCircle} />
                      आपकी शंकाएं एवं आचार्य समाधान (My Doubts & Answers)
                    </h4>
                    <span className="student-heading-tag">{studentDoubts.length} प्रश्न</span>
                  </div>

                  <div className="d-flex flex-column gap-3">
                    {studentDoubts.map((d) => (
                      <div key={d.id} className="bg-white p-3 rounded-3 border shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold text-danger small">{d.courseTitle}</span>
                          <span className={`badge ${d.status === "ANSWERED" ? "bg-success" : "bg-warning text-dark"}`}>
                            {d.status === "ANSWERED" ? "समाधानित (Answered)" : "लम्बित (Pending)"}
                          </span>
                        </div>
                        <h6 className="fw-bold mb-1 text-dark">{d.question}</h6>
                        {d.shlokaContext && (
                          <div className="small text-muted mb-2">सन्दर्भ: {d.shlokaContext}</div>
                        )}
                        {d.reply && (
                          <div className="p-2 rounded bg-light border-start border-success border-3 mt-2">
                            <strong className="text-success small d-block">✨ आचार्य उत्तर:</strong>
                            <span className="small text-dark">{d.reply}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 2: MY COURSES
             ══════════════════════════════════════════════════════ */}
          {activeTab === "courses" && (
            <div>
              {/* Filter and Search Bar */}
              <div className="bg-white p-3 rounded-3 border shadow-sm mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className={`btn btn-sm ${courseFilter === "all" ? "btn-danger fw-bold" : "btn-outline-secondary"}`}
                    onClick={() => setCourseFilter("all")}
                  >
                    समस्त पाठ्यक्रम ({enrollments.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${courseFilter === "active" ? "btn-danger fw-bold" : "btn-outline-secondary"}`}
                    onClick={() => setCourseFilter("active")}
                  >
                    अध्ययनरत ({inProgressCount})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${courseFilter === "completed" ? "btn-danger fw-bold" : "btn-outline-secondary"}`}
                    onClick={() => setCourseFilter("completed")}
                  >
                    पूर्ण ({completedCount})
                  </button>
                </div>

                <div className="d-flex align-items-center gap-2" style={{ maxWidth: "260px", width: "100%" }}>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white">
                      <FontAwesomeIcon icon={faSearch} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="पाठ्यक्रम खोजें..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Courses Grid */}
              {loadingEnrollments ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-danger mb-2" />
                  <p className="text-muted fw-bold">पाठ्यक्रम लोड हो रहे हैं...</p>
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-3 border p-5">
                  <div style={{ fontSize: "52px" }}>🎓</div>
                  <h4 className="mt-3 fw-bold">कोई पाठ्यक्रम नहीं मिला</h4>
                  <p className="text-muted">
                    {courseFilter !== "all" || searchQuery
                      ? "फ़िल्टर या खोज शब्दावली रीसेट करें।"
                      : "आपने अभी तक किसी पाठ्यक्रम में नामांकन नहीं किया है।"}
                  </p>
                  <Button variant="danger" onClick={onBackToHome}>
                    नवीन पाठ्यक्रम खोजें
                  </Button>
                </div>
              ) : (
                <div className="student-courses-grid">
                  {filteredCourses.map((item) => {
                    const isDone = item.progressPercent === 100;

                    return (
                      <div key={item.id} className="student-course-card">
                        <div className="student-course-cover-stage">
                          <DynamicBookCover
                            title={item.course?.title}
                            image={item.course?.image}
                            alt={item.course?.title}
                            style={{ width: "100%", height: "100%" }}
                          />
                          <span className="student-course-category-badge">
                            {item.course?.category?.toUpperCase() || "VEDIC"}
                          </span>
                          <span className={`student-course-status-badge ${isDone ? "completed" : "in-progress"}`}>
                            {isDone ? "पूर्ण (Completed)" : `${item.progressPercent}% सक्रिय`}
                          </span>
                        </div>

                        <div className="student-course-body">
                          <h5 className="student-course-title">{item.course?.title}</h5>
                          <div className="student-course-instructor">
                            <FontAwesomeIcon icon={faUser} />
                            <span>{item.course?.instructor || "आचार्य वेदप्रिय शास्त्री"}</span>
                          </div>
                          <p className="student-course-desc">{item.course?.description}</p>

                          <div className="student-progress-wrapper">
                            <div className="student-progress-labels">
                              <span>अध्ययन प्रगति</span>
                              <span className="pct">{item.progressPercent}%</span>
                            </div>
                            <div className="student-progress-bar-bg">
                              <div
                                className={`student-progress-bar-fill ${isDone ? "completed" : ""}`}
                                style={{ width: `${item.progressPercent}%` }}
                              />
                            </div>
                          </div>

                          <div className="student-course-actions">
                            <button
                              type="button"
                              className="btn-card-study"
                              onClick={() => {
                                handleStartStudy(item.course, item);
                                handleNav("studyRoom");
                              }}
                            >
                              <FontAwesomeIcon icon={faPlay} />
                              <span>{isDone ? "पुनरावृत्ति करें" : "अध्ययन करें"}</span>
                            </button>

                            {!isDone && (
                              <button
                                type="button"
                                className="btn-card-quick-bump"
                                title="२५% पाठ पूर्ण चिह्नित करें"
                                onClick={() => handleUpdateProgress(item.id, item.progressPercent, 25)}
                              >
                                +२५%
                              </button>
                            )}

                            {isDone && (
                              <button
                                type="button"
                                className="btn-card-cert"
                                onClick={() => setCertificateCourse(item.course)}
                                title="प्रमाण-पत्र देखें"
                              >
                                <FontAwesomeIcon icon={faCertificate} />
                                <span>प्रमाण-पत्र</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 3: DIGITAL STUDY ROOM (LIVE COURSE STUDY)
             ══════════════════════════════════════════════════════ */}
          {activeTab === "studyRoom" && (
            <div>
              {!activeStudyCourse ? (
                <div className="text-center py-5 bg-white rounded-3 border p-5 shadow-sm">
                  <div style={{ fontSize: "52px" }}>📖</div>
                  <h4 className="mt-3 fw-bold" style={{ color: "var(--sp-primary)" }}>कृपया पहले कोई पाठ्यक्रम चुनें</h4>
                  <p className="text-muted">
                    डिजिटल अध्ययन कक्ष में स्वाध्याय प्रारम्भ करने के लिए अपने किसी नामांकित पाठ्यक्रम पर क्लिक करें।
                  </p>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (enrollments.length > 0) {
                        handleStartStudy(enrollments[0].course, enrollments[0]);
                      } else {
                        handleNav("courses");
                      }
                    }}
                  >
                    पाठ्यक्रम चुनें
                  </Button>
                </div>
              ) : (
                <div className="study-room-layout">
                  {/* Left Main Study Content */}
                  <div className="study-room-main">
                    <div className="study-room-lesson-header">
                      <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                        <span className="study-room-chapter-tag">{activeStudyCourse.title}</span>
                        {activeStudyCourse.enrollment && (
                          <Badge bg={activeStudyCourse.enrollment.progressPercent >= 100 ? "success" : "warning"} text="dark">
                            {activeStudyCourse.enrollment.progressPercent}% पूर्ण
                          </Badge>
                        )}
                      </div>
                      <h3 className="study-room-lesson-title">{activeStudyCourse.title}</h3>
                      <div className="d-flex align-items-center gap-3 small text-muted flex-wrap">
                        <span>
                          <FontAwesomeIcon icon={faClock} className="me-1" /> कुल अवधि: {activeStudyCourse.durationHours || 30} घंटे
                        </span>
                        <span>•</span>
                        <span>
                          <FontAwesomeIcon icon={faUser} className="me-1" /> आचार्य: {activeStudyCourse.instructor || "आचार्य वेदप्रिय"}
                        </span>
                        {activeStudyCourse.category && (
                          <>
                            <span>•</span>
                            <span>श्रेणी: {activeStudyCourse.category}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Real Course Overview and Details */}
                    <div className="bg-white p-4 rounded-3 border mb-4 shadow-sm">
                      <h5 className="fw-bold mb-3" style={{ color: "var(--sp-primary)" }}>
                        <FontAwesomeIcon icon={faBookOpen} className="me-2 text-warning" />
                        पाठ्यक्रम परिचय एवं अध्ययन रूपरेखा
                      </h5>
                      <p style={{ lineHeight: 1.8, color: "#333", fontSize: "0.95rem" }}>
                        {activeStudyCourse.description || "इस पाठ्यक्रम में वैदिक ज्ञान, मन्त्रोच्चार और दार्शनिक तत्त्वमीमांसा का प्रामाणिक अध्ययन कराया जाता है।"}
                      </p>

                      {/* Real Syllabus Chapters from DB if provided */}
                      {currentModules.length > 0 ? (
                        <div className="mt-4">
                          <h6 className="fw-bold text-dark mb-3">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-success me-2" />
                            निर्धारित पाठ्यचर्या एवं अध्याय (Syllabus & Modules)
                          </h6>
                          <div className="list-group list-group-flush">
                            {currentModules.map((m) => (
                              <div key={m.id} className="list-group-item px-0 py-2 d-flex align-items-start gap-2 border-bottom">
                                <span className="badge bg-danger-subtle text-danger mt-1">अध्याय {m.id}</span>
                                <span style={{ fontSize: "0.95rem", color: "#222" }}>{m.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 p-3 bg-light rounded-3 text-muted small border">
                          <FontAwesomeIcon icon={faScroll} className="me-2 text-secondary" />
                          इस पाठ्यक्रम का अध्ययन आचार्य के निर्देशन में निर्धारित समय-सारणी के अनुसार संचालित होता है।
                        </div>
                      )}
                    </div>

                    {/* Live Online Classes Connected to this Course */}
                    <div className="bg-white p-4 rounded-3 border mb-4 shadow-sm">
                      <h5 className="fw-bold mb-3" style={{ color: "var(--sp-primary)" }}>
                        <FontAwesomeIcon icon={faVideo} className="me-2 text-danger" />
                        ऑनलाइन कक्षा एवं लाइव व्याख्यान (Live Lectures)
                      </h5>
                      {courseLiveSessions.length === 0 ? (
                        <div className="p-3 bg-light rounded-3 text-muted small text-center border">
                          वर्तमान में इस पाठ्यक्रम का कोई लाइव व्याख्यान निर्धारित नहीं है। नया सत्र शेड्यूल होते ही यहाँ प्रदर्शित होगा।
                        </div>
                      ) : (
                        <div className="d-flex flex-column gap-3">
                          {courseLiveSessions.map((s) => (
                            <div key={s.id} className="p-3 rounded-3 border d-flex align-items-center justify-content-between flex-wrap gap-2">
                              <div>
                                <h6 className="fw-bold mb-1">{s.title}</h6>
                                <div className="small text-muted">
                                  <FontAwesomeIcon icon={faClock} className="me-1" />
                                  {s.date ? `${s.date} • ${s.time || ""}` : (s.time || "निर्धारित समय")} | आचार्य: {s.instructor || activeStudyCourse.instructor || "आचार्य"}
                                </div>
                              </div>
                              {s.meetLink && (
                                <a
                                  href={s.meetLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-danger px-3"
                                >
                                  <FontAwesomeIcon icon={faExternalLinkAlt} className="me-1" />
                                  कक्षा में जुड़ें (Join Class)
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Lesson Bottom Controls */}
                    <div className="study-lesson-bottom-nav">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleNav("courses")}
                      >
                        <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> सभी पाठ्यक्रम
                      </Button>

                      {activeStudyCourse.enrollment && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => {
                            handleUpdateProgress(
                              activeStudyCourse.enrollment.id,
                              activeStudyCourse.enrollment.progressPercent,
                              25
                            );
                          }}
                        >
                          <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                          स्वाध्याय प्रगति दर्ज करें (+25%)
                        </Button>
                      )}

                      {activeStudyCourse.enrollment && activeStudyCourse.enrollment.progressPercent >= 100 && (
                        <Button
                          variant="warning"
                          size="sm"
                          className="fw-bold"
                          onClick={() => setCertificateCourse(activeStudyCourse)}
                        >
                          <FontAwesomeIcon icon={faCertificate} className="me-1" />
                          प्रमाण-पत्र प्राप्त करें
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Right Curriculum / Course Details Drawer */}
                  <div className="study-room-curriculum">
                    <div className="study-curriculum-header">
                      <span>पाठ्यक्रम विवरण</span>
                      <span className="badge bg-danger-subtle text-danger">सक्रिय</span>
                    </div>

                    <div className="p-3 border-bottom bg-white">
                      <div className="text-muted small mb-1">नामांकन स्थिति:</div>
                      <div className="fw-bold text-success mb-2">
                        {activeStudyCourse.enrollment?.status === "COMPLETED" ? "सफलतापूर्वक पूर्ण" : "प्रगति पर (Active)"}
                      </div>

                      <div className="d-flex justify-content-between small text-muted mb-1">
                        <span>अध्ययन प्रगति</span>
                        <span className="fw-bold text-dark">{activeStudyCourse.enrollment?.progressPercent || 0}%</span>
                      </div>
                      <ProgressBar
                        now={activeStudyCourse.enrollment?.progressPercent || 0}
                        variant={activeStudyCourse.enrollment?.progressPercent >= 100 ? "success" : "danger"}
                        style={{ height: 8 }}
                      />
                    </div>

                    <div className="p-3">
                      <h6 className="fw-bold small mb-2 text-dark">
                        <FontAwesomeIcon icon={faQuestionCircle} className="me-1 text-danger" />
                        शंका समाधान (Ask Doubt)
                      </h6>
                      <p className="small text-muted mb-3" style={{ fontSize: "0.82rem", lineHeight: 1.6 }}>
                        पाठ्यक्रम सम्बन्धी किसी भी प्रश्न या जिज्ञासा के लिए आचार्य से सम्पर्क करें।
                      </p>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="w-100"
                        onClick={() => handleNav("overview")}
                      >
                        शंका समाधान सत्र देखें
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 4: SAVED LIBRARY BOOKS
             ══════════════════════════════════════════════════════ */}
          {activeTab === "savedBooks" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="student-section-heading m-0">
                  <h4>
                    <FontAwesomeIcon icon={faScroll} />
                    सहेजे गए ग्रन्थ एवं स्वाध्याय सूची
                  </h4>
                </div>
                <Button variant="outline-danger" size="sm" onClick={onBackToHome}>
                  + मुख्य ग्रन्थागार से और जोड़ें
                </Button>
              </div>

              {savedBooksList.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-3 border p-5">
                  <div style={{ fontSize: "52px" }}>📜</div>
                  <h4 className="mt-3 fw-bold">आपकी ग्रन्थ सूची रिक्त है</h4>
                  <p className="text-muted">
                    पुस्तकालय संग्रह में से अपने पसंदीदा वेदों व भाष्यों को सहेज कर यहाँ कभी भी स्वाध्याय करें।
                  </p>
                  <Button variant="danger" onClick={onBackToHome}>
                    पुस्तकालय संग्रह देखें
                  </Button>
                </div>
              ) : (
                <div className="student-saved-books-grid">
                  {savedBooksList.map((book) => {
                    const isSaved = savedBookIds.has(book.id);

                    return (
                      <div key={book.id} className="student-saved-book-card">
                        <div className="saved-book-cover-box">
                          <DynamicBookCover title={book.title} image={book.image} style={{ maxHeight: "150px" }} />
                        </div>
                        <h6 className="fw-bold mb-1 text-truncate" title={book.title}>
                          {book.title}
                        </h6>
                        <div className="small text-muted mb-2">{book.author}</div>
                        <div className="d-flex align-items-center gap-2 small mb-3">
                          <Badge bg="light" text="dark" className="border">
                            {book.language || "संस्कृत"}
                          </Badge>
                          {book.pages && (
                            <span className="text-muted small">
                              <FontAwesomeIcon icon={faBookOpen} /> {book.pages} पृष्ठ
                            </span>
                          )}
                        </div>

                        <div className="mt-auto d-flex gap-2">
                          <Button
                            variant="danger"
                            size="sm"
                            className="w-100"
                            onClick={() => {
                              const url = book.pdfUrl || "https://archive.org/details/RigVedaWithSayanaBhashya";
                              window.open(url, "_blank", "noopener,noreferrer");
                            }}
                          >
                            <FontAwesomeIcon icon={faExternalLinkAlt} className="me-1" /> पढ़ें
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            title={isSaved ? "सहेजे गए से हटाएं" : "सहेजें"}
                            onClick={(e) => toggleSaveBook(book.id, e)}
                          >
                            <FontAwesomeIcon icon={faHeart} className={isSaved ? "text-danger" : ""} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 5: CERTIFICATES & ACHIEVEMENTS
             ══════════════════════════════════════════════════════ */}
          {activeTab === "certificates" && (
            <div>
              <div className="student-section-heading">
                <h4>
                  <FontAwesomeIcon icon={faCertificate} />
                  अर्जित प्रमाण-पत्र एवं पदक
                </h4>
                <span className="student-heading-tag">{completedCount} प्रमाण-पत्र</span>
              </div>

              {/* Milestone Medals */}
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="p-3 bg-white rounded-3 border d-flex align-items-center gap-3 shadow-sm">
                    <div style={{ fontSize: "36px" }}>🥉</div>
                    <div>
                      <div className="fw-bold">जिज्ञासु पदक (Initiate)</div>
                      <div className="small text-muted">प्रथम पाठ्यक्रम में प्रवेश प्राप्त करने पर</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-white rounded-3 border d-flex align-items-center gap-3 shadow-sm">
                    <div style={{ fontSize: "36px" }}>🥈</div>
                    <div>
                      <div className="fw-bold">स्वाध्यायी पदक (Scholar)</div>
                      <div className="small text-muted">एक सम्पूर्ण पाठ्यक्रम शत-प्रतिशत पूर्ण करने पर</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-white rounded-3 border d-flex align-items-center gap-3 shadow-sm">
                    <div style={{ fontSize: "36px" }}>🥇</div>
                    <div>
                      <div className="fw-bold">विद्वान् पदक (Master)</div>
                      <div className="small text-muted">३ अथवा अधिक पाठ्यक्रमों में विशारद उपाधि पर</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Completed Courses Certificates List */}
              {completedCount === 0 ? (
                <div className="text-center py-5 bg-white rounded-3 border p-5">
                  <div style={{ fontSize: "52px" }}>🏆</div>
                  <h4 className="mt-3 fw-bold">अभी कोई प्रमाण-पत्र उपलब्ध नहीं है</h4>
                  <p className="text-muted">
                    जैसे ही आप किसी पाठ्यक्रम का अध्ययन १००% पूर्ण करेंगे, आपका आधिकारिक आर्य पाठशाला प्रमाण-पत्र यहाँ जारी हो जाएगा।
                  </p>
                  <Button variant="danger" onClick={() => handleNav("courses")}>
                    मेरे पाठ्यक्रम देखें
                  </Button>
                </div>
              ) : (
                <div className="row g-4">
                  {enrollments
                    .filter((e) => e.progressPercent === 100 || e.status === "COMPLETED")
                    .map((item) => (
                      <div key={item.id} className="col-md-6 col-lg-4">
                        <div className="bg-white p-4 rounded-3 border shadow-sm text-center h-100 d-flex flex-column">
                          <div style={{ fontSize: "48px", marginBottom: "8px" }}>📜</div>
                          <h5 className="fw-bold" style={{ color: "var(--sp-primary)" }}>
                            {item.course?.title}
                          </h5>
                          <p className="small text-muted mb-3">
                            आर्य पाठशाला वैदिक परीक्षा बोर्ड द्वारा सत्यापित
                          </p>
                          <div className="mt-auto">
                            <Button
                              variant="danger"
                              size="sm"
                              className="w-100"
                              onClick={() => setCertificateCourse(item.course)}
                            >
                              <FontAwesomeIcon icon={faCertificate} className="me-1" />
                              प्रमाण-पत्र देखें व डाउनलोड करें
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 6: NOTICES & CIRCULARS
             ══════════════════════════════════════════════════════ */}
          {activeTab === "notices" && (
            <div>
              <div className="student-section-heading">
                <h4>
                  <FontAwesomeIcon icon={faBell} />
                  संस्थान सूचनाएं एवं परिपत्र
                </h4>
                <span className="student-heading-tag">{notices.length} सूचनाएं</span>
              </div>

              {loadingNotices ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-danger" />
                </div>
              ) : notices.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-3 border p-4">
                  <p className="text-muted m-0">कोई सूचना उपलब्ध नहीं है।</p>
                </div>
              ) : (
                <div className="student-notices-container">
                  {notices.map((n) => (
                    <div
                      key={n.id}
                      className="student-notice-item"
                      onClick={() => setSelectedNoticeModal(n)}
                      style={{ cursor: "pointer" }}
                    >
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span
                            className={`badge ${n.priority === "HIGH" ? "bg-danger" : "bg-warning text-dark"
                              }`}
                          >
                            {n.type || "सूचना"}
                          </span>
                          <span className="fw-bold small text-muted">
                            {n.createdAt ? new Date(n.createdAt).toLocaleDateString("hi-IN") : ""}
                          </span>
                        </div>
                        <h5 className="student-notice-title">{n.title}</h5>
                        <p className="student-notice-body">{n.content}</p>
                      </div>
                      <Button variant="outline-secondary" size="sm" style={{ flexShrink: 0 }}>
                        विस्तार से पढ़ें
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 7: PROFILE & STUDENT ID CARD
             ══════════════════════════════════════════════════════ */}
          {activeTab === "profile" && (
            <div className="student-profile-layout">
              {/* Left: Visual Student ID Card */}
              <div className="student-id-card-preview">
                <div className="student-id-header">
                  <div className="fw-bold text-danger" style={{ fontSize: "1.1rem" }}>
                    आर्य पाठशाला गुरुकुल
                  </div>
                  <div className="small text-muted">आधिकारिक शिक्षार्थी परिचय पत्र</div>
                </div>

                <div className="student-id-photo-frame">
                  {profileAvatar || "🕉️"}
                </div>

                <h4 className="student-id-name">{profileName || user?.name || "विद्यार्थी"}</h4>
                <div className="student-id-role">आर्ष ज्ञान पिपासु (Student)</div>

                <table className="student-id-details-table">
                  <tbody>
                    <tr>
                      <td>विद्यार्थी आईडी:</td>
                      <td>AP-{user?.id ? String(user.id).padStart(4, "0") : "0108"}</td>
                    </tr>
                    <tr>
                      <td>ई-मेल पता:</td>
                      <td>{user?.email}</td>
                    </tr>
                    <tr>
                      <td>सम्पर्क सूत्र:</td>
                      <td>{profilePhone || user?.phone || "अनुपलब्ध"}</td>
                    </tr>
                    <tr>
                      <td>सत्र:</td>
                      <td>२०२६–२०२७</td>
                    </tr>
                    <tr>
                      <td>नामांकित पाठ्यक्रम:</td>
                      <td>{enrollments.length}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Right: Edit Profile Form */}
              <div className="bg-white p-4 rounded-3 border shadow-sm">
                <h5 className="fw-bold mb-3" style={{ color: "var(--sp-primary)" }}>
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  व्यक्तिगत विवरण सम्पादन
                </h5>

                <Form onSubmit={handleSaveProfile}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold small">अवतार प्रतीक (Avatar)</Form.Label>
                    <div className="d-flex gap-2 flex-wrap mb-2">
                      {["🕉️", "📚", "🧘‍♂️", "📜", "🎓", "🪔", "🚩", "🏛️", "☀️", "🪷"].map((emoji) => (
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
                    <Form.Label className="fw-bold small">पूर्ण नाम</Form.Label>
                    <Form.Control
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
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
                      placeholder="+91 9876543210"
                    />
                  </Form.Group>

                  <Button variant="danger" type="submit" disabled={savingProfile}>
                    {savingProfile ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                        सहेजा जा रहा है...
                      </>
                    ) : (
                      "विवरण सहेजें"
                    )}
                  </Button>
                </Form>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 8: SECURITY & PASSWORD
             ══════════════════════════════════════════════════════ */}
          {activeTab === "security" && (
            <div className="bg-white p-4 rounded-3 border shadow-sm" style={{ maxWidth: "600px" }}>
              <h5 className="fw-bold mb-3" style={{ color: "var(--sp-primary)" }}>
                <FontAwesomeIcon icon={faKey} className="me-2" />
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
                  {changingPass ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                      बदला जा रहा है...
                    </>
                  ) : (
                    "पासवर्ड बदलें"
                  )}
                </Button>
              </Form>
            </div>
          )}
        </div>
      </main>

      {/* ── Certificate of Completion Modal ───────────────────── */}
      <Modal
        show={!!certificateCourse}
        onHide={() => setCertificateCourse(null)}
        size="lg"
        centered
        className="certificate-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-danger">
            <FontAwesomeIcon icon={faAward} className="me-2 text-warning" />
            आर्य पाठशाला प्रमाण-पत्र
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {certificateCourse && (
            <div className="certificate-frame">
              <div className="cert-corner-ornament cert-tl" />
              <div className="cert-corner-ornament cert-tr" />
              <div className="cert-corner-ornament cert-bl" />
              <div className="cert-corner-ornament cert-br" />

              <div style={{ fontSize: "40px" }} className="mb-2">🕉️</div>
              <div className="cert-inst-name">आर्य पाठशाला गुरुकुल</div>
              <div className="cert-motto">कृण्वन्तो विश्वमार्यम् • सा विद्या या विमुक्तये</div>

              <div className="cert-title-big">प्रमाण-पत्रम् (Certificate of Completion)</div>

              <div className="cert-presented-to">यह प्रमाणित किया जाता है कि शिक्षार्थी</div>
              <div className="cert-student-name">{user?.name || "विद्यार्थी"}</div>

              <div className="cert-text">
                ने आर्य पाठशाला के अंतर्गत{" "}
                <span className="cert-course-name">"{certificateCourse.title}"</span>{" "}
                पाठ्यक्रम का सम्पूर्ण स्वाध्याय एवं निर्धारित पाठ्यचर्या सफलतापूर्वक पूर्ण की है।
              </div>

              <div className="cert-signatures">
                <div className="cert-sig-block">
                  <div style={{ fontStyle: "italic", fontWeight: 700, color: "#5d0f22" }}>
                    आचार्य वेदप्रिय
                  </div>
                  <div className="cert-sig-line">पाठ्यक्रम मार्गदर्शक</div>
                  <div className="cert-sig-title">आर्य पाठशाला</div>
                </div>

                <div className="cert-sig-block">
                  <div className="fw-bold" style={{ color: "#d4af37" }}>
                    प्रमाणीकरण कोड: AP-2026-{(certificateCourse.id || 101) * 73}
                  </div>
                  <div className="cert-sig-line">जारी दिनांक: {new Date().toLocaleDateString("hi-IN")}</div>
                  <div className="cert-sig-title">डिजिटल मुद्रांकित</div>
                </div>

                <div className="cert-sig-block">
                  <div style={{ fontStyle: "italic", fontWeight: 700, color: "#5d0f22" }}>
                    डॉ. धर्मपाल शास्त्री
                  </div>
                  <div className="cert-sig-line">कुलाधिपति / अध्यक्ष</div>
                  <div className="cert-sig-title">आर्ष विद्या सभा</div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 d-flex justify-content-between">
          <Button variant="outline-secondary" onClick={() => setCertificateCourse(null)}>
            बंद करें
          </Button>
          <Button variant="danger" onClick={() => window.print()}>
            <FontAwesomeIcon icon={faPrint} className="me-2" />
            प्रमाण-पत्र प्रिंट / डाउनलोड करें
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Notice Detail Modal ───────────────────────────────── */}
      <Modal show={!!selectedNoticeModal} onHide={() => setSelectedNoticeModal(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold" style={{ color: "var(--sp-primary)" }}>
            {selectedNoticeModal?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="badge bg-danger">{selectedNoticeModal?.type || "सूचना"}</span>
            <span className="small text-muted">
              {selectedNoticeModal?.createdAt
                ? new Date(selectedNoticeModal.createdAt).toLocaleDateString("hi-IN")
                : ""}
            </span>
          </div>
          <p style={{ lineHeight: 1.7, fontSize: "0.95rem" }}>{selectedNoticeModal?.content}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedNoticeModal(null)}>
            बंद करें
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
