import React, { useState, useEffect } from "react";
import "./AuthPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faUser,
  faPhone,
  faEye,
  faEyeSlash,
  faSignInAlt,
  faUserPlus,
  faUserShield,
  faTimes,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faSpinner,
  faBook,
  faGraduationCap,
  faAward,
  faLaptop,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ closeAuth, initialTab = "login" }) {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState(
    typeof initialTab === "string" ? initialTab : "login"
  );
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState({
    login: false,
    signup: false,
    signupConfirm: false,
  });

  // Close on Escape key and prevent body scroll while modal is active
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && closeAuth) {
        closeAuth();
      }
    };

    // Prevent background page scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow || "unset";
    };
  }, [closeAuth]);

  const togglePassword = (field) =>
    setPasswordVisible((prev) => ({ ...prev, [field]: !prev[field] }));

  const clearMessage = () => setMessage(null);

  const showTab = (tab) => {
    setActiveTab(tab);
    clearMessage();
  };

  // Demo accounts helper
  const fillDemo = (role) => {
    clearMessage();
    if (role === "admin") {
      setLoginData({
        email: "admin@aryapathshala.com",
        password: "Admin@Arya2025!",
      });
      setMessage({
        text: "व्यवस्थापक (Admin) क्रेडेंशियल्स भरे गए। अब 'प्रवेश करें' दबाएँ।",
        type: "info",
      });
    } else {
      setLoginData({
        email: "student@aryapathshala.com",
        password: "Student@Arya2025!",
      });
      setMessage({
        text: "विद्यार्थी (Student) क्रेडेंशियल्स भरे गए। अब 'प्रवेश करें' दबाएँ।",
        type: "info",
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessage();

    if (!loginData.email || !loginData.password) {
      setMessage({ text: "कृपया ई-मेल और पासवर्ड दोनों दर्ज करें।", type: "error" });
      return;
    }

    setLoading(true);

    try {
      await login(loginData.email.trim(), loginData.password);
      setMessage({
        text: "सफलतापूर्वक प्रवेश हो गए! स्वागतम्।",
        type: "success",
      });
      setTimeout(() => {
        if (closeAuth) closeAuth();
      }, 600);
    } catch (err) {
      setMessage({
        text: err.message || "लॉगिन विफल रहा। कृपया ई-मेल एवं पासवर्ड पुनः जाँचें।",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    clearMessage();

    if (signupData.password !== signupData.confirmPassword) {
      setMessage({ text: "पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।", type: "error" });
      return;
    }
    if (signupData.password.length < 6) {
      setMessage({
        text: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      await register({
        name: signupData.name.trim(),
        email: signupData.email.trim(),
        phone: signupData.phone.trim(),
        password: signupData.password,
      });
      setMessage({
        text: "पंजीकरण सफल हुआ! आर्य पाठशाला में आपका स्वागत है।",
        type: "success",
      });
      setTimeout(() => {
        if (closeAuth) closeAuth();
      }, 800);
    } catch (err) {
      setMessage({
        text: err.message || "पंजीकरण विफल रहा। यह ईमेल पहले से पंजीकृत हो सकता है।",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContactAdmin = () => {
    const phone = "916284667127";
    const text = "नमस्ते आर्य पाठशाला! 🙏\nमुझे अपने खाते में लॉगिन / पासवर्ड सहायता हेतु व्यवस्थापक (Admin) से संपर्क करना है।\n\nकृपया सहायता प्रदान करें।";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    setMessage({
      text: "व्यवस्थापक (Admin) से संपर्क करें: WhatsApp (+91 62846-67127) अथवा ई-मेल: officialaryapathshala@gmail.com",
      type: "info",
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="auth-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && closeAuth) closeAuth();
      }}
    >
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Accent top stripe */}
        <div className="auth-top-accent" />

        {/* Close Button */}
        {closeAuth && (
          <button
            className="auth-close-btn"
            onClick={closeAuth}
            aria-label="Close"
            title="बंद करें (Esc)"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}

        <div className="auth-split-body">
          {/* Left Column: Vedic Heritage & Features */}
          <div className="auth-hero-pane">
            <div>
              <div className="auth-brand-badge">
                <div className="auth-om-icon">🕉️</div>
                <div className="auth-brand-text">
                  <h2>आर्य पाठशाला</h2>
                  <p>शास्त्र ज्ञान एवं वैदिक संस्कृति का केंद्र</p>
                </div>
              </div>

              <div className="auth-hero-lead">
                आर्यावर्त की गौरवशाली शास्त्र परंपरा से सुसज्जित, घर बैठे प्रमाणिक वेद, उपनिषद् एवं दर्शनशास्त्र अध्ययन की आधुनिक पहल।
              </div>

              <ul className="auth-feature-list">
                <li>
                  <div className="auth-feat-icon">
                    <FontAwesomeIcon icon={faBook} />
                  </div>
                  <span>वेद, उपनिषद्, दर्शन एवं आर्षग्रन्थों का मूल अध्ययन</span>
                </li>
                <li>
                  <div className="auth-feat-icon">
                    <FontAwesomeIcon icon={faGraduationCap} />
                  </div>
                  <span>अनुभवी आचार्यों द्वारा प्रत्यक्ष मार्गदर्शन एवं शंका समाधान</span>
                </li>
                <li>
                  <div className="auth-feat-icon">
                    <FontAwesomeIcon icon={faAward} />
                  </div>
                  <span>डिजिटल अध्ययन सामग्री एवं प्रमाणित प्रमाणपत्र</span>
                </li>
                <li>
                  <div className="auth-feat-icon">
                    <FontAwesomeIcon icon={faLaptop} />
                  </div>
                  <span>कहीं भी, कभी भी — मोबाइल व कंप्यूटर पर उपलब्ध</span>
                </li>
              </ul>
            </div>

            <div className="auth-hero-footer">
              © {new Date().getFullYear()} आर्य पाठशाला • सर्वाधिकार सुरक्षित
            </div>
          </div>

          {/* Right Column: Forms */}
          <div className="auth-form-pane">
            {/* Mobile Header (Shown on phone view, hidden on desktop) */}
            <div className="auth-mobile-header">
              <div className="auth-mobile-om">🕉️</div>
              <div className="auth-mobile-title-wrap">
                <h3 className="auth-mobile-title">आर्य पाठशाला</h3>
                <span className="auth-mobile-sub">शास्त्र ज्ञान एवं संस्कृति</span>
              </div>
            </div>

            {/* Tabs Bar */}
            <div className="auth-tabs-bar">
              <button
                type="button"
                className={`auth-tab-btn ${activeTab === "login" ? "active" : ""}`}
                onClick={() => showTab("login")}
              >
                <FontAwesomeIcon icon={faSignInAlt} /> प्रवेशः (Login)
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${activeTab === "signup" ? "active" : ""}`}
                onClick={() => showTab("signup")}
              >
                <FontAwesomeIcon icon={faUserPlus} /> पञ्जीकरणम् (Signup)
              </button>
            </div>

            {/* Quick Demo Credentials Bar (Login tab only) */}
            {/* {activeTab === "login" && (
              <div className="auth-demo-bar">
                <span className="auth-demo-label">⚡ त्वरित परीक्षण (Quick Test):</span>
                <div className="auth-demo-actions">
                  <button
                    type="button"
                    className="auth-demo-chip"
                    onClick={() => fillDemo("admin")}
                  >
                    👑 व्यवस्थापक (Admin)
                  </button>
                  <button
                    type="button"
                    className="auth-demo-chip"
                    onClick={() => fillDemo("student")}
                  >
                    🎓 विद्यार्थी (Student)
                  </button>
                </div>
              </div>
            )} */}

            {/* Notification / Alert */}
            {message && (
              <div className={`auth-alert ${message.type}`}>
                <FontAwesomeIcon
                  icon={
                    message.type === "success"
                      ? faCheckCircle
                      : message.type === "error"
                        ? faExclamationTriangle
                        : faInfoCircle
                  }
                />
                <span style={{ flex: 1 }}>{message.text}</span>
              </div>
            )}

            {/* 1. LOGIN FORM */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin}>
                <div className="auth-input-group">
                  <label className="auth-input-label">ई-मेल पता *</label>
                  <div className="auth-input-wrapper">
                    <FontAwesomeIcon icon={faEnvelope} className="auth-field-icon" />
                    <input
                      type="email"
                      className="auth-input-field"
                      placeholder="admin@aryapathshala.com"
                      required
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      autoFocus
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="auth-input-label">पासवर्ड *</label>
                  <div className="auth-input-wrapper">
                    <FontAwesomeIcon icon={faLock} className="auth-field-icon" />
                    <input
                      type={passwordVisible.login ? "text" : "password"}
                      className="auth-input-field"
                      placeholder="पासवर्ड दर्ज करें"
                      required
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => togglePassword("login")}
                      title={passwordVisible.login ? "पासवर्ड छुपाएँ" : "पासवर्ड देखें"}
                    >
                      <FontAwesomeIcon
                        icon={passwordVisible.login ? faEyeSlash : faEye}
                      />
                    </button>
                  </div>
                </div>

                <div className="auth-forgot-row">
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={handleContactAdmin}
                    title="पासवर्ड सहायता अथवा रीसेट हेतु व्यवस्थापक से संपर्क करें"
                  >
                    <FontAwesomeIcon icon={faUserShield} className="me-1" />
                    Contact to Admin
                  </button>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin /> प्रवेश हो रहा है...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSignInAlt} /> प्रवेश करें (Login)
                    </>
                  )}
                </button>

                <div className="auth-switch-footer">
                  नया खाता बनाना चाहते हैं?{" "}
                  <button type="button" onClick={() => showTab("signup")}>
                    यहाँ पञ्जीकरण करें
                  </button>
                </div>
              </form>
            )}

            {/* 2. SIGNUP FORM */}
            {activeTab === "signup" && (
              <form onSubmit={handleSignup}>
                <div className="auth-input-group">
                  <label className="auth-input-label">पूरा नाम *</label>
                  <div className="auth-input-wrapper">
                    <FontAwesomeIcon icon={faUser} className="auth-field-icon" />
                    <input
                      type="text"
                      className="auth-input-field"
                      placeholder="आर्य विद्यार्थी"
                      required
                      value={signupData.name}
                      onChange={(e) =>
                        setSignupData({ ...signupData, name: e.target.value })
                      }
                      autoFocus
                    />
                  </div>
                </div>

                <div className="auth-grid-2">
                  <div className="auth-input-group">
                    <label className="auth-input-label">ई-मेल पता *</label>
                    <div className="auth-input-wrapper">
                      <FontAwesomeIcon icon={faEnvelope} className="auth-field-icon" />
                      <input
                        type="email"
                        className="auth-input-field"
                        placeholder="student@example.com"
                        required
                        value={signupData.email}
                        onChange={(e) =>
                          setSignupData({ ...signupData, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label className="auth-input-label">मोबाइल नंबर</label>
                    <div className="auth-input-wrapper">
                      <FontAwesomeIcon icon={faPhone} className="auth-field-icon" />
                      <input
                        type="tel"
                        className="auth-input-field"
                        placeholder="+91 9876543210"
                        value={signupData.phone}
                        onChange={(e) =>
                          setSignupData({ ...signupData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="auth-grid-2">
                  <div className="auth-input-group">
                    <label className="auth-input-label">पासवर्ड *</label>
                    <div className="auth-input-wrapper">
                      <FontAwesomeIcon icon={faLock} className="auth-field-icon" />
                      <input
                        type={passwordVisible.signup ? "text" : "password"}
                        className="auth-input-field"
                        placeholder="कम से कम 6 अक्षर"
                        required
                        value={signupData.password}
                        onChange={(e) =>
                          setSignupData({ ...signupData, password: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        className="auth-eye-btn"
                        onClick={() => togglePassword("signup")}
                      >
                        <FontAwesomeIcon
                          icon={passwordVisible.signup ? faEyeSlash : faEye}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label className="auth-input-label">पासवर्ड की पुष्टि *</label>
                    <div className="auth-input-wrapper">
                      <FontAwesomeIcon icon={faLock} className="auth-field-icon" />
                      <input
                        type={passwordVisible.signupConfirm ? "text" : "password"}
                        className="auth-input-field"
                        placeholder="पुनः दर्ज करें"
                        required
                        value={signupData.confirmPassword}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            confirmPassword: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        className="auth-eye-btn"
                        onClick={() => togglePassword("signupConfirm")}
                      >
                        <FontAwesomeIcon
                          icon={passwordVisible.signupConfirm ? faEyeSlash : faEye}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin /> पञ्जीकरण हो रहा है...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faUserPlus} /> पञ्जीकरण करें (Register)
                    </>
                  )}
                </button>

                <div className="auth-switch-footer">
                  पहले से खाता है?{" "}
                  <button type="button" onClick={() => showTab("login")}>
                    यहाँ प्रवेश करें
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
