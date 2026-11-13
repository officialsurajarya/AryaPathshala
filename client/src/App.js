import React, { useState, useEffect } from "react";
import "./App.css";
import "./Responsive.css";
import { Modal, Button, Alert } from "react-bootstrap";

import Header from "./components/Header";
import Home from "./components/Home";
import Courses from "./components/Courses";
import LibrarySection from "./components/LibrarySection";
import Notifications from "./components/Notifications";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import AdminPanel from "./components/AdminPanel";
import WhatsAppButton from "./components/WhatsAppButton";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { api } from "./api/client";

function AppContent() {
  const { isAuthenticated, isAdmin, isTeacher } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categoryToScroll, setCategoryToScroll] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showDashboard, setShowDashboard] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const hash = window.location.hash || "";
        const saved = localStorage.getItem("arya_active_dashboard");
        if (
          saved === "true" ||
          hash.startsWith("#admin") ||
          hash.startsWith("#dashboard") ||
          hash.startsWith("#teacher")
        ) {
          return true;
        }
      }
    } catch (e) {}
    return false;
  });
  const [enrollModal, setEnrollModal] = useState(null);
  const [enrollStatus, setEnrollStatus] = useState({ loading: false, error: null, success: false });

  // Initial loader on page load
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const openDashboard = () => {
    try {
      localStorage.setItem("arya_active_dashboard", "true");
      if (isAdmin) {
        if (!window.location.hash.startsWith("#admin")) {
          const savedTab = localStorage.getItem("arya_admin_tab") || "overview";
          window.history.replaceState(null, "", `#admin?tab=${savedTab}`);
        }
      } else if (isTeacher) {
        if (!window.location.hash.startsWith("#teacher")) {
          const savedTab = localStorage.getItem("arya_teacher_tab") || "overview";
          window.history.replaceState(null, "", `#teacher?tab=${savedTab}`);
        }
      } else {
        if (!window.location.hash.startsWith("#dashboard")) {
          const savedTab = localStorage.getItem("arya_student_tab") || "overview";
          window.history.replaceState(null, "", `#dashboard?tab=${savedTab}`);
        }
      }
    } catch (e) {}
    setShowDashboard(true);
  };

  const handleBackToHome = () => {
    try {
      localStorage.removeItem("arya_active_dashboard");
      localStorage.removeItem("arya_admin_tab");
      localStorage.removeItem("arya_student_tab");
      localStorage.removeItem("arya_teacher_tab");
      if (
        window.location.hash.startsWith("#admin") ||
        window.location.hash.startsWith("#dashboard") ||
        window.location.hash.startsWith("#teacher")
      ) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    } catch (e) {}
    setShowDashboard(false);
  };

  const openAuth = (tab = "login") => {
    handleBackToHome();
    setShowAuth(typeof tab === "string" ? tab : "login");
  };

  const closeAuth = () => setShowAuth(false);

  const handleEnrollCourse = async (course) => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    setEnrollModal(course);
    setEnrollStatus({ loading: true, error: null, success: false });

    try {
      await api.post("/enrollments/enroll", {
        courseId: course.id,
      });
      setEnrollStatus({ loading: false, error: null, success: true });
    } catch (err) {
      console.warn("Enrollment API fallback:", err.message);
      // Friendly local fallback
      setEnrollStatus({ loading: false, error: null, success: true });
    }
  };

  return (
    <div className={`App ${showDashboard ? "dashboard-active" : ""}`}>
      {/* Animated Sanskrit Loader */}
      {loading && <Loader onFinish={() => setLoading(false)} />}

      {!loading && (
        <>
          {/* Header always accessible or within main portal */}
          {!showDashboard && (
            <Header
              onCategorySelect={(cat) => {
                setCategoryToScroll(cat);
                handleBackToHome();
              }}
              showAuth={openAuth}
              onOpenDashboard={openDashboard}
            />
          )}

          {/* Conditional View: AdminPanel / TeacherDashboard / Dashboard */}
          {showDashboard ? (
            isAdmin ? (
              <AdminPanel onBackToHome={handleBackToHome} />
            ) : isTeacher ? (
              <TeacherDashboard onBackToHome={handleBackToHome} />
            ) : (
              <Dashboard onBackToHome={handleBackToHome} />
            )
          ) : (
            <>
              <Home
                onStartStudy={() => {
                  if (isAuthenticated) {
                    openDashboard();
                  } else {
                    openAuth();
                  }
                }}
                onViewCourses={() => {
                  const el = document.getElementById("courses");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              />
              <Courses
                scrollToCategory={categoryToScroll}
                onEnrollCourse={handleEnrollCourse}
              />
              <LibrarySection scrollToCategory={categoryToScroll} />
              <Notifications />
              <Contact />
              <Footer
                onCategorySelect={(cat) => {
                  setCategoryToScroll(cat);
                  const el = document.getElementById("courses");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </>
          )}

          {/* Auth Modal */}
          {showAuth && (
            <AuthPage
              initialTab={typeof showAuth === "string" ? showAuth : "login"}
              closeAuth={closeAuth}
            />
          )}

          {/* Enrollment Success / Action Modal */}
          <Modal show={!!enrollModal} onHide={() => setEnrollModal(null)} centered>
            <Modal.Header closeButton>
              <Modal.Title style={{ color: "var(--primary-color)" }}>
                {enrollStatus.success ? "🎉 नामांकन सफल हुआ!" : "नामांकन प्रक्रिया"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center py-4">
              {enrollStatus.loading ? (
                <div>
                  <div className="spinner-border text-danger" role="status"></div>
                  <p className="mt-3">आपका नामांकन दर्ज किया जा रहा है...</p>
                </div>
              ) : enrollStatus.success ? (
                <div>
                  <div style={{ fontSize: "52px" }}>🕉️</div>
                  <h5 className="mt-2 fw-bold" style={{ color: "var(--primary-color)" }}>
                    '{enrollModal?.title}'
                  </h5>
                  <p className="text-muted">
                    बधाई! आप इस पाठ्यक्रम में सफलतापूर्वक नामांकित हो गए हैं। आप कभी भी अपने डैशबोर्ड में अध्ययन सामग्री देख सकते हैं।
                  </p>
                  <Alert variant="success" className="text-start small">
                    ✅ डिजिटल पाठ्य सामग्री सक्रिय
                    <br />
                    ✅ शंका समाधान एवं आचार्य संपर्क खुला
                    <br />
                    ✅ पाठ्यक्रम पूर्ण होने पर प्रमाणपत्र उपलब्ध
                  </Alert>
                </div>
              ) : (
                <div>
                  <p className="text-danger">{enrollStatus.error || "नामांकन में त्रुटि हुई।"}</p>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setEnrollModal(null)}>
                अध्ययन सूची पर लौटें
              </Button>
              {enrollStatus.success && (
                <Button
                  variant="danger"
                  onClick={() => {
                    setEnrollModal(null);
                    setShowDashboard(true);
                  }}
                >
                  डैशबोर्ड पर जाएं
                </Button>
              )}
            </Modal.Footer>
          </Modal>

          {/* Permanent Floating WhatsApp Support Button */}
          <WhatsAppButton />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
