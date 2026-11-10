import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ closeAuth }) {
  const { login, register, forgotPassword } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState({
    login: false,
    signup: false,
    signupConfirm: false,
  });

  const togglePassword = (field) =>
    setPasswordVisible((prev) => ({ ...prev, [field]: !prev[field] }));

  const clearMessage = () => setMessage(null);

  const showTab = (tab) => {
    setActiveTab(tab);
    clearMessage();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessage();
    setLoading(true);
    setMessage({ text: "लॉग इन हो रहा है...", type: "info" });

    try {
      await login(loginData.email, loginData.password);
      setMessage({ text: "सफलतापूर्वक प्रवेश हो गए! स्वागतम्।", type: "success" });
      setTimeout(() => {
        if (closeAuth) closeAuth();
      }, 700);
    } catch (err) {
      setMessage({
        text: err.message || "लॉग इन विफल रहा। कृपया विवरण पुनः जांचें।",
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
      setMessage({ text: "पासवर्ड मेल नहीं खाते।", type: "error" });
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
    setMessage({ text: "पंजीकरण हो रहा है...", type: "info" });

    try {
      await register(signupData);
      setMessage({
        text: "पंजीकरण सफल! आपका स्वागत है।",
        type: "success",
      });
      setTimeout(() => {
        if (closeAuth) closeAuth();
      }, 1000);
    } catch (err) {
      setMessage({
        text: err.message || "पंजीकरण विफल रहा।",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    clearMessage();
    if (!forgotEmail) {
      setMessage({ text: "कृपया ई-मेल दर्ज करें।", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "रीसेट लिंक भेजा जा रहा है...", type: "info" });

    try {
      const res = await forgotPassword(forgotEmail);
      setMessage({
        text: res.message || "रीसेट लिंक आपके ई-मेल पर भेज दिया गया है।",
        type: "success",
      });
    } catch (err) {
      setMessage({
        text: err.message || "अनुरोध भेजने में त्रुटि हुई।",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setMessage({
      text: `${provider} प्रमाणीकरण शीघ्र ही उपलब्ध होगा। कृपया ई-मेल द्वारा प्रवेश करें।`,
      type: "info",
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <style jsx>{`
        :root {
          --primary-color: #c73659;
          --secondary-color: #d4af37;
          --accent-color: #a8c66c;
          --main-color: #b22222;
          --ash: #a89a8c;
          --background-color: #fdeaa8;
          --text-color: #2e2e2e;
          --light-bg: #faf4e6;
          --white: #ffffff;
          --error-color: #e74c3c;
          --success-color: #27ae60;
        }

        .auth-container {
          background: linear-gradient(
            135deg,
            var(--background-color) 0%,
            var(--light-bg) 50%,
            var(--background-color) 100%
          );
          position: relative;
          overflow: hidden;
        }

        .auth-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 25px;
          box-shadow: 0 20px 60px rgba(199, 54, 89, 0.15);
          border: 2px solid var(--secondary-color);
          padding: 2rem;
          width: 100%;
          max-width: 1200px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: fadeInUp 0.8s ease-out;
          transition: all 0.5s ease;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .auth-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(
            90deg,
            var(--primary-color),
            var(--secondary-color),
            var(--accent-color)
          );
          border-radius: 25px 25px 0 0;
        }

        .auth-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: start;
        }

        .auth-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 500px;
          padding: 2rem;
          background: linear-gradient(
            135deg,
            rgba(199, 54, 89, 0.05),
            rgba(212, 175, 55, 0.05)
          );
          border-radius: 20px;
          border: 2px solid rgba(212, 175, 55, 0.2);
        }

        .logo {
          width: 80px;
          height: 80px;
          object-fit: contain;
          margin: 0 auto 1rem;
          background: var(--secondary-color);
          border-radius: 50%;
          padding: 10px;
        }

        .auth-left h1 {
          font-family: "Tiro Devanagari Sanskrit", serif;
          font-size: 2.5rem;
          font-weight: 600;
          background: linear-gradient(
            135deg,
            var(--primary-color),
            var(--main-color)
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .auth-left > p {
          font-size: 1.1rem;
          color: var(--primary-color);
          margin-bottom: 2rem;
          font-weight: 500;
          text-align: center;
        }

        .features-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .features-list li {
          display: flex;
          align-items: center;
          padding: 0.75rem 0;
          font-size: 1rem;
          color: var(--text-color);
        }

        .feature-icon {
          color: var(--primary-color);
          margin-right: 1rem;
          font-size: 1.2rem;
          min-width: 20px;
        }

        .tab-navigation {
          display: flex;
          margin-bottom: 2rem;
          background: var(--light-bg);
          border-radius: 15px;
          padding: 0.25rem;
        }

        .tab-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          border-radius: 12px;
          color: var(--ash);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-btn.active {
          background: var(--primary-color);
          color: white;
          box-shadow: 0 4px 15px rgba(199, 54, 89, 0.3);
        }

        .message {
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .message.success {
          background: rgba(39, 174, 96, 0.1);
          border: 1px solid var(--success-color);
          color: var(--success-color);
        }

        .message.error {
          background: rgba(231, 76, 60, 0.1);
          border: 1px solid var(--error-color);
          color: var(--error-color);
        }

        .message.info {
          background: rgba(52, 152, 219, 0.1);
          border: 1px solid #3498db;
          color: #3498db;
        }

        .form-group {
          margin-bottom: 1.5rem;
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 1rem 1.25rem;
          padding-left: 3rem;
          border: 2px solid #e5e5e5;
          border-radius: 15px;
          font-size: 1rem;
          background: var(--white);
          transition: all 0.3s ease;
          color: var(--text-color);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(199, 54, 89, 0.15);
          transform: translateY(-2px) scale(1.02);
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--ash);
          pointer-events: none;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--ash);
          cursor: pointer;
          font-size: 1.1rem;
          transition: color 0.3s ease;
        }

        .password-toggle:hover {
          color: var(--primary-color);
        }

        .btn-primary {
          width: 100%;
          background: linear-gradient(
            135deg,
            var(--primary-color),
            var(--main-color)
          );
          border: none;
          color: white;
          padding: 1rem 2rem;
          border-radius: 15px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(199, 54, 89, 0.3);
          margin-bottom: 1rem;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(199, 54, 89, 0.4);
        }

        .btn-secondary {
          width: 100%;
          background: transparent;
          border: 2px solid var(--secondary-color);
          color: var(--secondary-color);
          padding: 1rem 2rem;
          border-radius: 15px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .btn-secondary:hover {
          background: var(--secondary-color);
          color: white;
          transform: translateY(-3px);
        }

        .social-buttons {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .btn-social {
          flex: 1;
          padding: 0.75rem;
          border: 2px solid #e5e5e5;
          background: var(--white);
          border-radius: 12px;
          color: var(--text-color);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-social:hover {
          border-color: var(--primary-color);
          background: rgba(199, 54, 89, 0.05);
        }

        .btn-social.google {
          color: #ea4335;
        }

        .btn-social.facebook {
          color: #1877f2;
        }

        .divider {
          margin: 2rem 0;
          text-align: center;
          position: relative;
        }

        .divider::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e5e5e5;
        }

        .divider span {
          background: var(--white);
          padding: 0 1rem;
          color: var(--ash);
          font-size: 0.9rem;
        }

        .switch-link {
          text-align: center;
          margin-top: 1rem;
          color: var(--text-color);
        }

        .switch-link span {
          color: var(--primary-color);
          cursor: pointer;
          text-decoration: underline;
        }

        .auth-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 2rem;
          color: var(--ash);
          cursor: pointer;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .auth-close:hover {
          background: var(--primary-color);
          color: white;
        }

        .forgot-password {
          text-align: right;
          margin-bottom: 1.5rem;
        }

        .forgot-password a {
          color: var(--primary-color);
          text-decoration: none;
          font-size: 0.9rem;
        }

        .forgot-password a:hover {
          text-decoration: underline;
        }

        @media (max-width: 1024px) {
          .auth-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .auth-left {
            order: 2;
          }
          .auth-right {
            order: 1;
          }
        }

        @media (max-width: 768px) {
          .auth-card {
            padding: 2rem 1.5rem;
            margin: 1rem;
            border-radius: 20px;
          }
          .auth-content {
            gap: 1.5rem;
          }
          .auth-left h1 {
            font-size: 2rem;
          }
          .social-buttons {
            flex-direction: column;
          }
          .tab-navigation {
            flex-direction: column;
          }
          .tab-btn {
            margin-bottom: 0.25rem;
          }
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 1.5rem 1rem;
          }
          .auth-left h1 {
            font-size: 1.8rem;
          }
        }
      `}</style>

      <div className="auth-card">
        <div className="auth-content">
          {/* Left section with welcome info */}
          <div className="auth-left">
            <div className="logo">🕉️</div>
            <h1>आर्य पाठशाला</h1>
            <p>शास्त्र ज्ञान एवं आध्यात्म का केंद्र</p>
            <ul className="features-list">
              <li>
                <span className="feature-icon">📚</span>
                वेद, उपनिषद् और दर्शनशास्त्र का गहन अध्ययन
              </li>
              <li>
                <span className="feature-icon">👥</span>
                अनुभवी आचार्यों से प्रत्यक्ष शिक्षा
              </li>
              <li>
                <span className="feature-icon">🎓</span>
                प्रमाणित पाठ्यक्रम एवं परीक्षा तैयारी
              </li>
              <li>
                <span className="feature-icon">⏰</span>
                अपनी सुविधानुसार समय में अध्ययन
              </li>
              <li>
                <span className="feature-icon">📱</span>
                मोबाइल एवं कंप्यूटर पर उपलब्ध
              </li>
            </ul>
          </div>

          {/* Right section with forms */}
          <div className="auth-right">
            <div className="tab-navigation">
              <button
                className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
                onClick={() => showTab("login")}
              >
                🔑 प्रवेश
              </button>
              <button
                className={`tab-btn ${activeTab === "signup" ? "active" : ""}`}
                onClick={() => showTab("signup")}
              >
                👤 पञ्जीकरण
              </button>
              <button
                className={`tab-btn ${activeTab === "forgot" ? "active" : ""}`}
                onClick={() => showTab("forgot")}
              >
                🔄 रीसेट
              </button>
            </div>

            {/* Message */}
            {message && (
              <div className={`message ${message.type}`}>
                {message.type === "success" && "✅"}
                {message.type === "error" && "❌"}
                {message.type === "info" && "ℹ️"}
                {message.text}
              </div>
            )}

            {/* Login Form */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="auth-form">
                <div className="form-group">
                  <input
                    className="form-input"
                    type="email"
                    placeholder="ई-मेल पता"
                    required
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                  />
                  <span className="input-icon">✉️</span>
                </div>
                <div className="form-group">
                  <input
                    className="form-input"
                    type={passwordVisible.login ? "text" : "password"}
                    placeholder="पासवर्ड"
                    required
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                  />
                  <span className="input-icon">🔒</span>
                  <span
                    className="password-toggle"
                    onClick={() => togglePassword("login")}
                  >
                    {passwordVisible.login ? "🙈" : "👁️"}
                  </span>
                </div>
                <div className="forgot-password">
                  <button
                    type="button"
                    style={{ background: "none", border: "none", color: "var(--primary-color)", cursor: "pointer", padding: 0 }}
                    onClick={() => showTab("forgot")}
                  >
                    पासवर्ड भूल गए?
                  </button>
                </div>
                <button className="btn-primary" type="submit" disabled={loading}>
                  {loading ? "प्रवेश हो रहा है..." : "🔑 प्रवेश करें"}
                </button>

                <div className="divider">
                  <span>या</span>
                </div>

                <div className="social-buttons">
                  <button
                    type="button"
                    className="btn-social google"
                    onClick={() => handleSocialLogin("Google")}
                  >
                    📧 Google
                  </button>
                  <button
                    type="button"
                    className="btn-social facebook"
                    onClick={() => handleSocialLogin("Facebook")}
                  >
                    📘 Facebook
                  </button>
                </div>

                <p className="switch-link">
                  कोई खाता नहीं है?{" "}
                  <span onClick={() => showTab("signup")}>पंजीकरण करें</span>
                </p>
              </form>
            )}

            {/* Signup Form */}
            {activeTab === "signup" && (
              <form onSubmit={handleSignup} className="auth-form">
                <div className="form-group">
                  <input
                    className="form-input"
                    type="text"
                    placeholder="पूरा नाम"
                    required
                    value={signupData.name}
                    onChange={(e) =>
                      setSignupData({ ...signupData, name: e.target.value })
                    }
                  />
                  <span className="input-icon">👤</span>
                </div>
                <div className="form-group">
                  <input
                    className="form-input"
                    type="email"
                    placeholder="ई-मेल पता"
                    required
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({ ...signupData, email: e.target.value })
                    }
                  />
                  <span className="input-icon">✉️</span>
                </div>
                <div className="form-group">
                  <input
                    className="form-input"
                    type="tel"
                    placeholder="मोबाइल नंबर"
                    required
                    value={signupData.phone}
                    onChange={(e) =>
                      setSignupData({ ...signupData, phone: e.target.value })
                    }
                  />
                  <span className="input-icon">📱</span>
                </div>
                <div className="form-group">
                  <input
                    className="form-input"
                    type={passwordVisible.signup ? "text" : "password"}
                    placeholder="पासवर्ड"
                    required
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({ ...signupData, password: e.target.value })
                    }
                  />
                  <span className="input-icon">🔒</span>
                  <span
                    className="password-toggle"
                    onClick={() => togglePassword("signup")}
                  >
                    {passwordVisible.signup ? "🙈" : "👁️"}
                  </span>
                </div>
                <div className="form-group">
                  <input
                    className="form-input"
                    type={passwordVisible.signupConfirm ? "text" : "password"}
                    placeholder="पासवर्ड की पुष्टि"
                    required
                    value={signupData.confirmPassword}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                  <span className="input-icon">🔒</span>
                  <span
                    className="password-toggle"
                    onClick={() => togglePassword("signupConfirm")}
                  >
                    {passwordVisible.signupConfirm ? "🙈" : "👁️"}
                  </span>
                </div>
                <button className="btn-primary" type="submit" disabled={loading}>
                  {loading ? "पंजीकरण हो रहा है..." : "👤 पञ्जीकरण करें"}
                </button>

                <div className="divider">
                  <span>या</span>
                </div>

                <div className="social-buttons">
                  <button
                    type="button"
                    className="btn-social google"
                    onClick={() => handleSocialLogin("Google")}
                  >
                    📧 Google
                  </button>
                  <button
                    type="button"
                    className="btn-social facebook"
                    onClick={() => handleSocialLogin("Facebook")}
                  >
                    📘 Facebook
                  </button>
                </div>

                <p className="switch-link">
                  पहले से खाता है?{" "}
                  <span onClick={() => showTab("login")}>लॉग इन करें</span>
                </p>
              </form>
            )}

            {/* Forgot Password Form */}
            {activeTab === "forgot" && (
              <form onSubmit={handleForgotPassword} className="auth-form">
                <div className="form-group">
                  <input
                    className="form-input"
                    type="email"
                    placeholder="अपना ई-मेल पता डालें"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                  <span className="input-icon">✉️</span>
                </div>
                <button className="btn-primary" type="submit" disabled={loading}>
                  {loading ? "भेजा जा रहा है..." : "🔄 रीसेट लिंक भेजें"}
                </button>
                <p className="switch-link">
                  <span onClick={() => showTab("login")}>
                    लॉग इन पर वापस जाएं
                  </span>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Close button */}
        {closeAuth && (
          <button className="auth-close" onClick={closeAuth}>
            &times;
          </button>
        )}
      </div>
    </div>
  );
}
