import React, { useState, useEffect } from 'react';

const HeroVisual = () => {
    const [activeVeda, setActiveVeda] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const vedas = [
        {
            name: 'ऋग्वेद',
            english: 'Rig Veda',
            icon: '🕉️',
            description: 'Hymns of Knowledge',
            color: '#d4af37',
            image: './images/RigVeda.png'
        },
        {
            name: 'सामवेद',
            english: 'Sam Veda',
            icon: '🎵',
            description: 'Melodies of Devotion',
            color: '#c73659',
            image: './images/SamVeda.png'
        },
        {
            name: 'यजुर्वेद',
            english: 'Yajur Veda',
            icon: '🔥',
            description: 'Rituals of Worship',
            color: '#8b5a3c',
            image: './images/YajurVeda.png'
        },
        {
            name: 'अथर्ववेद',
            english: 'Atharva Veda',
            icon: '🌿',
            description: 'Wisdom of Life',
            color: '#2e7d32',
            image: './images/AtharvaVeda.png'
        }
    ];

    // Auto-cycle through vedas
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isHovered) {
                setActiveVeda((prev) => (prev + 1) % vedas.length);
            }
        }, 2000);
        return () => clearInterval(interval);
    });

    // Mouse tracking for parallax effect
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePosition({ x: x * 20, y: y * 20 });
    };

    return (
        <div className="col-lg-6 col-md-12 order-lg-2 order-1">
            <div
                className="hero-visual-container"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                    setIsHovered(false);
                    setMousePosition({ x: 0, y: 0 });
                }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    // overflow: 'hidden'
                    height: '420px',
                    marginBottom: '20px'

                }}
            >
                {/* Dynamic Background Particles */}
                <div
                    className="background-particles"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at ${50 + mousePosition.x}% ${50 + mousePosition.y}%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)`,
                        transition: 'all 0.3s ease'
                    }}
                />

                {/* Main Visual Container */}
                <div
                    className="visual-container"
                    style={{
                        position: 'relative',
                        width: '400px',
                        height: '400px',
                        // maxWidth: '90vw',
                        // maxHeight: '90vw',
                        transform: `perspective(1000px) rotateX(${mousePosition.y * 0.5}deg) rotateY(${mousePosition.x * 0.5}deg)`
                    }}
                >
                    {/* Floating Veda Elements - Z-index 1 */}
                    {vedas.map((veda, index) => {
                        const positions = [
                            { top: '20%', left: '20%' },
                            { top: '20%', right: '20%' },
                            { bottom: '20%', left: '15%' },
                            { bottom: '20%', right: '15%' }
                        ];

                        return (
                            <div
                                key={index}
                                className="floating-element"
                                onClick={() => setActiveVeda(index)}
                                style={{
                                    position: 'absolute',
                                    ...positions[index],
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                    animation: `float 6s ease-in-out infinite ${index}s`,
                                    transform: `scale(${activeVeda === index ? 1.2 : 1}) translateZ(${activeVeda === index ? '20px' : '0'})`,
                                    zIndex: 1,
                                }}
                            >
                                <img
                                    src={veda.image}
                                    alt={veda.english}
                                    style={{
                                        width: activeVeda === index ? '60px' : '40px',
                                        transition: 'all 0.3s ease',
                                        objectFit: 'cover',
                                    }}
                                />
                            </div>
                        );
                    })}

                    {/* Central Container with Images and Text */}
                    <div
                        className="main-visual"
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '250px',
                            height: '300px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {/* Rotating Backdrop */}
                        <div
                            className="visual-backdrop"
                            style={{
                                position: 'absolute',
                                overflow: 'hidden !important',
                                width: '100%',
                                height: '100%',
                                background: `linear-gradient(135deg, ${vedas[activeVeda].color}20, rgba(199, 54, 89, 0.1))`,
                                borderRadius: '50%',
                                border: `3px solid ${vedas[activeVeda].color}`,
                                animation: 'rotate 15s linear infinite',
                                transition: 'all 1s ease',
                                boxShadow: `0 0 50px ${vedas[activeVeda].color}30, inset 0 0 50px ${vedas[activeVeda].color}10`
                            }}
                        />

                        {/* Veda Images */}
                        <div
                            className="veda-images-container"
                            style={{
                                position: 'relative',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                zIndex: 1
                            }}
                        >
                        </div>

                        {/* Sanskrit Text - Z-index -1 (behind images) */}
                        <div style={{
                            fontFamily: "'Tiro Devanagari Sanskrit', serif",
                            fontSize: '7rem',
                            color: `${vedas[activeVeda].color}`,
                            paddingTop: '20px',
                            fontWeight: 600,
                            textAlign: 'center',
                            transition: 'color 1s ease'
                        }}>
                            वेद
                        </div>

                        {/* Active Veda Name Overlay */}
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '-40px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: `linear-gradient(135deg, ${vedas[activeVeda].color}, ${vedas[activeVeda].color}cc)`,
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                transition: 'all 1s ease',
                                boxShadow: `0 4px 15px ${vedas[activeVeda].color}40`,
                                backdropFilter: 'blur(5px)',
                                zIndex: 2
                            }}
                        >
                            {vedas[activeVeda].english}
                            <div style={{ fontSize: '12px', opacity: 0.9 }}>
                                {vedas[activeVeda].description}
                            </div>
                        </div>

                        {/* Pulsing Ring Effect */}
                        <div style={{
                            position: 'absolute',
                            inset: '-20px',
                            border: `2px solid ${vedas[activeVeda].color}40`,
                            borderRadius: '50%',
                            animation: 'pulse 2s ease-in-out infinite',
                            transition: 'border-color 1s ease',
                            zIndex: 0
                        }} />
                    </div>
                </div>

                {/* Navigation Dots */}
                <div style={{
                    position: 'absolute',
                    bottom: '0%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '12px',
                    zIndex: 2,
                }}>
                    {vedas.map((veda, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveVeda(index)}
                            style={{
                                width: activeVeda === index ? '40px' : '12px',
                                height: '12px',
                                background: activeVeda === index ? veda.color : 'rgba(255,255,255,0.3)',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: activeVeda === index ? `0 0 15px ${veda.color}60` : 'none'
                            }}
                        />
                    ))}
                </div>

                {/* CSS Animations */}
                <style jsx>{`
                    @keyframes rotate {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }

                    @keyframes float {
                        0%, 100% { transform: translateY(0) scale(1); }
                        50% { transform: translateY(-15px) scale(1.05); }
                    }

                    @keyframes pulse {
                        0%, 100% { transform: scale(1); opacity: 0.5; }
                        50% { transform: scale(1.05); opacity: 0.8; }
                    }

                    .floating-element:hover {
                        transform: scale(1.1) translateZ(10px) !important;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default HeroVisual;