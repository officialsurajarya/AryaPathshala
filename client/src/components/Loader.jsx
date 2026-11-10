import React, { useEffect, useRef, useState } from 'react';
import './Loader.css';

const loadingTexts = [
    'लोड हो रहा है...',
    'शास्त्राणि लोड हो रहा है...',
    'ज्ञान तैयार हो रहा है...',
    'पूर्ण हो गया!'
];

const Loader = ({ onFinish }) => { // ✅ Accept onFinish to inform parent when done
    const progressFillRef = useRef(null);
    const progressPercentRef = useRef(null);
    const loadingTextRef = useRef(null);

    const [progress, setProgress] = useState(0);
    const [textIndex, setTextIndex] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        let intervalId;

        const updateProgress = () => {
            setProgress(prev => {
                let increment = Math.random() * 15 + 5;
                let next = prev + increment;
                if (next > 100) next = 100;
                return next;
            });
        };

        intervalId = setInterval(updateProgress, 300);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (progressFillRef.current && progressPercentRef.current && loadingTextRef.current) {
            progressFillRef.current.style.width = `${progress}%`;
            progressPercentRef.current.textContent = `${Math.floor(progress)}%`;

            if (progress > 25 && textIndex === 0) {
                loadingTextRef.current.textContent = loadingTexts[1];
                setTextIndex(1);
            } else if (progress > 60 && textIndex === 1) {
                loadingTextRef.current.textContent = loadingTexts[2];
                setTextIndex(2);
            } else if (progress >= 100 && textIndex === 2) {
                loadingTextRef.current.textContent = loadingTexts[3];
                setTextIndex(3);
            }

            if (progress >= 100) {
                setTimeout(() => {
                    setFadeOut(true);
                    setTimeout(() => {
                        if (onFinish) {
                            onFinish(); // ✅ Notify parent to hide loader
                        }
                    }, 800);
                }, 1000);
            }
        }
    }, [progress, textIndex, onFinish]);

    useEffect(() => {
    let start = null;

    const animate = timestamp => {
        if (!start) start = timestamp;
        const progressTime = timestamp - start;
        const duration = 2000; // 2 seconds total
        const next = Math.min((progressTime / duration) * 100, 100);
        setProgress(next);

        if (next < 100) {
            requestAnimationFrame(animate);
        }
    };

    requestAnimationFrame(animate);

    return () => {};
}, []);


    return (
        <div id="loader" className={`loader-container ${fadeOut ? 'fade-out' : ''}`}>
            <div className="loader-content">
                <div className="loader-logo">
                    <div className="logo-circle">
                        <div className="om-symbol">ॐ</div>
                        <div className="rotating-ring"></div>
                        <div className="pulsing-dots">
                            <div className="dot dot-1"></div>
                            <div className="dot dot-2"></div>
                            <div className="dot dot-3"></div>
                            <div className="dot dot-4"></div>
                        </div>
                    </div>
                </div>



                <div className="loader-brand">
                    <h1 className="sanskrit-title">आर्य पाठशाला</h1>
                    <p className="english-subtitle">Arya Pathshala</p>
                </div>

                <div className="progress-container">
                    <div className="progress-bar">
                        <div className="progress-fill" ref={progressFillRef}></div>
                    </div>
                    <div className="progress-text">
                        <span className="loading-text" ref={loadingTextRef}>लोड हो रहा है...</span>
                        <span className="progress-percent" ref={progressPercentRef}>0%</span>
                    </div>
                </div>

                <div className="floating-elements">
                    <div className="float-element elem-1">
                        <i className="fas fa-book-open"></i>
                    </div>
                    <div className="float-element elem-2">
                        <i className="fas fa-scroll"></i>
                    </div>
                    <div className="float-element elem-3">
                        <i className="fas fa-graduation-cap"></i>
                    </div>
                    <div className="float-element elem-4">
                        <i className="fas fa-lotus"></i>
                    </div>
                </div>

                <div className="quote-section">
                    <p className="sanskrit-quote">विद्या ददाति विनयं</p>
                    <p className="quote-translation">Knowledge bestows humility</p>
                </div>
            </div>
        </div>
    );
};

export default Loader;
