import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '../App.css';
import '../Responsive.css';
import HeroStats from './HeroStats';
import { faPlayCircle, faVideo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import HeroVisual from './HeroVisual';

export default function Home({ onStartStudy, onViewCourses }) {
    const handleViewCourses = (e) => {
        e.preventDefault();
        if (onViewCourses) {
            onViewCourses();
        } else {
            const el = document.getElementById('courses');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleStartStudy = (e) => {
        e.preventDefault();
        if (onStartStudy) {
            onStartStudy();
        } else {
            const el = document.getElementById('courses');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <Container fluid className="home pb-lg-5" id="home">
            <Container>
                <Row>
                    <Col className="col-lg-6 col-md-12 order-lg-1 order-2">
                        <div className="hero-content">
                            <h1 className="hero-title">
                                <span className="sanskrit-text">आर्य पाठशाला</span>
                                <span className="subtitle">
                                    नमस्ते! आर्य पाठशाला में आपका हार्दिक स्वागत एवं अभिनन्दन है!
                                </span>
                            </h1>
                            <p className="hero-description">
                                आर्यावर्त की गौरवशाली शास्त्र परंपरा से सुसज्जित, आर्य पाठशाला एक ऐसा ऑनलाइन शिक्षण
                                संस्थान है जहाँ पाठकों को शास्त्र ज्ञान के साथ नैतिकता और जीवन मूल्यों की शिक्षा दी जाती
                                है। हमारा उद्देश्य आर्य विद्यार्थियों को बौद्धिक और मानसिक रूप से विकसित करना है।
                                वर्तमान में गुरुकुलीय परंपरा से गुरु के समक्ष उपस्थित होकर शास्त्र अध्ययन कर पाना कठिन
                                हो रहा है, अतः जो आर्य विद्यार्थी आधुनिक शिक्षा के साथ-साथ घर बैठे शास्त्र अध्ययन के
                                इच्छुक हैं, उनके लिए आर्य पाठशाला ने शास्त्र अध्ययन की एक अनोखी पहल आरंभ की है।
                            </p>
                        </div>
                        <HeroStats />

                        {/* Hero Action */}
                        <div className="auth-btn d-flex flex-wrap gap-3 mt-4">
                            <button
                                className="btn-login fw-bold fs-lg-5"
                                type="button"
                                onClick={handleStartStudy}
                            >
                                <FontAwesomeIcon icon={faPlayCircle} className="me-2" />
                                अध्ययन आरंभ करें
                            </button>
                            <button
                                className="btn-signup fw-bold fs-lg-5"
                                type="button"
                                onClick={handleViewCourses}
                            >
                                <FontAwesomeIcon icon={faVideo} className="me-2" />
                                पाठ्यक्रम देखें
                            </button>
                        </div>
                    </Col>
                    <div className="col-lg-6 col-md-12 order-lg-2 order-1 heroVisual">
                        <HeroVisual />
                    </div>
                </Row>
            </Container>
        </Container>
    );
}
