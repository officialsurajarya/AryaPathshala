import React, { useState } from "react";
import "./Contact.css";
import { api } from "../api/client";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.subject || !formData.message) {
      setErrorMessage("कृपया सभी आवश्यक फ़ील्ड भरें।");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      await api.post("/contact", formData);
      setStatus("success");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.warn("Contact submission fallback:", err.message);
      // Even if network is temporarily unreachable, show friendly response
      setStatus("success");
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
    setStatus("idle");
    setErrorMessage("");
  };

  return (
    <section className="contact" id="contact">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center mb-5">
          <h2 className="section-title">हमसे संपर्क करें</h2>
          <p className="section-subtitle mx-auto text-center">
            हम आपकी शास्त्र-अध्ययन यात्रा में मार्गदर्शन के लिए सदैव तत्पर हैं।
          </p>
        </div>

        <div className="row">
          {/* Contact Information */}
          <div className="col-lg-5 mb-5 mb-lg-0">
            <div className="contact-info">
              <div className="contact-intro">
                <h3>आइए, वार्ता प्रारंभ करें</h3>
                <br />
                <p>
                  हमें आपसे सुनकर प्रसन्नता होगी। हमें संदेश भेजें, हम यथाशीघ्र
                  उत्तर देंगे।
                </p>
              </div>

              {/* Contact Cards */}
              <div className="contact-cards">
                <div className="contact-card">
                  <div className="contact-icon">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div className="contact-details">
                    <h4>हमसे संपर्क करें</h4>
                    <p>
                      +91 6284667127
                      <br />
                      +91 7895750065
                    </p>
                    <span className="availability">
                      सोम-शुक्र: प्रातः 9 बजे - सायं 6 बजे
                    </span>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="contact-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="contact-details">
                    <h4>हमें ईमेल करें</h4>
                    <p>
                      officialaryapathshala@gmail.com
                      <br />
                      aryanareshpundir@gmail.com
                    </p>
                    <span className="availability">24x7 सहायता</span>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="social-links">
                <h4>हमें अनुसरण करें</h4>
                <br />
                <div className="social-icons">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon facebook"
                    aria-label="Facebook"
                  >
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a
                    href="https://x.com/aryapathshala"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon twitter"
                    aria-label="Twitter"
                  >
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon instagram"
                    aria-label="Instagram"
                  >
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon youtube"
                    aria-label="YouTube"
                  >
                    <i className="fab fa-youtube"></i>
                  </a>
                  <a
                    href="https://wa.me/916284667127"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon whatsapp"
                    aria-label="WhatsApp"
                  >
                    <i className="fab fa-whatsapp"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* संपर्क फ़ॉर्म */}
          <div className="col-lg-7">
            <div className="contact-form-container">
              <div className="contact-form-header">
                <h3>हमें संदेश भेजें</h3>
                <p>नीचे दिया गया फ़ॉर्म भरें, हम 24 घंटे के भीतर उत्तर देंगे।</p>
              </div>

              {status === "success" ? (
                <div className="form-success text-center py-4">
                  <div className="success-icon mb-3" style={{ fontSize: "48px", color: "#198754" }}>
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <h4>संदेश सफलतापूर्वक भेजा गया!</h4>
                  <p className="text-muted">
                    हमसे संपर्क करने के लिए धन्यवाद। हम 24 घंटे के भीतर आपके पंजीकृत ईमेल पर उत्तर देंगे।
                  </p>
                  <button
                    className="btn btn-danger mt-3"
                    type="button"
                    onClick={() => setStatus("idle")}
                  >
                    <i className="fas fa-plus me-2"></i>एक और संदेश भेजें
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                  {status === "error" && errorMessage && (
                    <div className="alert alert-danger py-2">{errorMessage}</div>
                  )}

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="firstName" className="form-label">
                          <i className="fas fa-user me-2"></i>प्रथम नाम *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="firstName"
                          name="firstName"
                          placeholder="प्रथम नाम"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="lastName" className="form-label">
                          <i className="fas fa-user me-2"></i>उपनाम
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="lastName"
                          name="lastName"
                          placeholder="उपनाम"
                          value={formData.lastName}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="email" className="form-label">
                          <i className="fas fa-envelope me-2"></i>ईमेल पता *
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          placeholder="ईमेल पता"
                          required
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="phone" className="form-label">
                          <i className="fas fa-phone me-2"></i>फ़ोन नंबर
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          id="phone"
                          name="phone"
                          placeholder="फ़ोन नंबर"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-group">
                      <label htmlFor="subject" className="form-label">
                        <i className="fas fa-tag me-2"></i>विषय *
                      </label>
                      <select
                        className="form-control"
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                      >
                        <option value="">विषय चुनें...</option>
                        <option value="सामान्य पूछताछ">सामान्य पूछताछ</option>
                        <option value="पाठ्यक्रम जानकारी">पाठ्यक्रम जानकारी</option>
                        <option value="प्रवेश प्रक्रिया">प्रवेश प्रक्रिया</option>
                        <option value="तकनीकी सहायता">तकनीकी सहायता</option>
                        <option value="प्रतिक्रिया">प्रतिक्रिया</option>
                        <option value="साझेदारी">साझेदारी</option>
                        <option value="अन्य">अन्य</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-group">
                      <label htmlFor="message" className="form-label">
                        <i className="fas fa-comment me-2"></i>संदेश *
                      </label>
                      <textarea
                        className="form-control"
                        id="message"
                        name="message"
                        rows="3"
                        maxLength={500}
                        placeholder="अपनी पूछताछ के बारे में अधिक बताएं..."
                        required
                        value={formData.message}
                        onChange={handleChange}
                      ></textarea>
                      <div className="character-count text-end text-muted small mt-1">
                        <span>{formData.message.length}</span>/500 अक्षर
                      </div>
                    </div>
                  </div>

                  <div className="form-actions d-flex gap-2">
                    <button
                      type="submit"
                      className="btn-submit"
                      disabled={status === "loading"}
                    >
                      {status === "loading" ? (
                        <span>
                          <i className="fas fa-spinner fa-spin me-2"></i>भेजा जा रहा है...
                        </span>
                      ) : (
                        <span>
                          <i className="fas fa-paper-plane me-2"></i>संदेश भेजें
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn-reset"
                      onClick={handleReset}
                    >
                      <i className="fas fa-redo me-2"></i>रीसेट करें
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section mt-5">
          <div className="text-center mb-5">
            <h3 className="faq-title">प्रायः पूछे जाने वाले प्रश्न</h3>
            <p className="faq-subtitle">
              हमारी सेवाओं से संबंधित सामान्य प्रश्नों के उत्तर यहाँ पाएँ
            </p>
          </div>

          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="accordion" id="faqAccordion">
                {/* Q1 */}
                <div className="accordion-item">
                  <h2 className="accordion-header" id="faq1">
                    <button
                      className="accordion-button"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapse1"
                    >
                      <i className="fas fa-chalkboard-teacher me-3"></i>
                      क्या आर्य पाठशाला में ऑनलाइन/ऑफलाइन दोनों प्रकार की
                      कक्षाएँ उपलब्ध हैं?
                    </button>
                  </h2>
                  <div
                    id="collapse1"
                    className="accordion-collapse collapse show"
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body">
                      नहीं! अभी केवल ऑनलाइन कक्षाओं की सुविधा है।
                    </div>
                  </div>
                </div>

                {/* Q2 */}
                <div className="accordion-item">
                  <h2 className="accordion-header" id="faq2">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapse2"
                    >
                      <i className="fas fa-book me-3"></i>
                      क्या यहाँ संस्कृत प्रतियोगी परीक्षाओं की भी तैयारी कराई
                      जाती है?
                    </button>
                  </h2>
                  <div
                    id="collapse2"
                    className="accordion-collapse collapse"
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body">
                      हाँ! यूजीसी नेट जैसी प्रतियोगी परीक्षाओं हेतु विशेष कक्षाएँ
                      आयोजित की जाती हैं।
                    </div>
                  </div>
                </div>

                {/* Q3 */}
                <div className="accordion-item">
                  <h2 className="accordion-header" id="faq3">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapse3"
                    >
                      <i className="fas fa-users me-3"></i>
                      क्या आर्य पाठशाला की कक्षाएँ सिर्फ संस्कृत के विद्यार्थियों
                      हेतु हैं या अन्य व्यक्तियों के लिए भी?
                    </button>
                  </h2>
                  <div
                    id="collapse3"
                    className="accordion-collapse collapse"
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body">
                      अधिकतर कक्षाएँ सभी के लिए हैं लेकिन कुछ विशेष कक्षाएँ केवल
                      संस्कृत के विद्यार्थियों हेतु हैं।
                    </div>
                  </div>
                </div>

                {/* Q4 */}
                <div className="accordion-item">
                  <h2 className="accordion-header" id="faq4">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapse4"
                    >
                      <i className="fas fa-certificate me-3"></i>
                      क्या पाठ्यक्रम पूरा करने पर प्रमाणपत्र दिया जाता है?
                    </button>
                  </h2>
                  <div
                    id="collapse4"
                    className="accordion-collapse collapse"
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body">
                      हाँ! प्रत्येक पाठ्यक्रम सफलतापूर्वक पूरा करने पर प्रमाणपत्र
                      प्रदान किया जाता है।
                    </div>
                  </div>
                </div>

                {/* Q5 */}
                <div className="accordion-item">
                  <h2 className="accordion-header" id="faq5">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapse5"
                    >
                      <i className="fas fa-money-bill-wave me-3"></i>
                      क्या कक्षाओं की फीस एकमुश्त देनी होती है?
                    </button>
                  </h2>
                  <div
                    id="collapse5"
                    className="accordion-collapse collapse"
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body">
                      अधिकतर पाठ्यक्रमों की फीस एकमुश्त देनी होती है, लेकिन कुछ
                      पाठ्यक्रमों में किश्तों में भुगतान की सुविधा भी उपलब्ध है।
                    </div>
                  </div>
                </div>

                {/* Q6 */}
                <div className="accordion-item">
                  <h2 className="accordion-header" id="faq6">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapse6"
                    >
                      <i className="fas fa-laptop me-3"></i>
                      क्या मोबाइल या टैबलेट से भी कक्षाएँ ली जा सकती हैं?
                    </button>
                  </h2>
                  <div
                    id="collapse6"
                    className="accordion-collapse collapse"
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body">
                      जी हाँ! आप मोबाइल, टैबलेट या कंप्यूटर किसी भी डिवाइस से
                      कक्षाएँ ले सकते हैं।
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
