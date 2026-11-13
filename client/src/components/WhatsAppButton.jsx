import React, { useState } from "react";
import "./WhatsAppButton.css";

export default function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);

  const phoneNumber = "916284667127";
  const defaultMessage = encodeURIComponent(
    "नमस्ते! मुझे आर्य पाठशाला के पाठ्यक्रमों एवं शास्त्र अध्ययन के संबंध में जानकारी चाहिए।"
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <aside aria-label="WhatsApp सहायता" className="whatsapp-floating-container">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-floating-btn"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="WhatsApp पर संपर्क करें (+91 6284667127)"
        title="WhatsApp पर संपर्क करें (+91 6284667127)"
      >
        {/* Pulse Waves */}
        <span className="whatsapp-pulse-ring"></span>
        <span className="whatsapp-pulse-ring-delayed"></span>

        {/* WhatsApp Official Vector Icon */}
        <svg
          className="whatsapp-icon-svg"
          viewBox="0 0 32 32"
          width="34"
          height="34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16 3C8.82 3 3 8.82 3 16C3 18.54 3.73 20.91 5 22.92L3.25 28.75L9.23 27.04C11.19 28.24 13.52 28.94 16 28.94C23.18 28.94 29 23.12 29 15.94C29 8.76 23.18 3 16 3ZM16 26.69C13.8 26.69 11.75 26.06 10.01 24.97L9.58 24.7L5.67 25.82L6.81 22.01L6.53 21.56C5.35 19.8 4.7 17.96 4.7 16C4.7 9.77 9.77 4.7 16 4.7C22.23 4.7 27.3 9.77 27.3 16C27.3 22.23 22.23 26.69 16 26.69ZM22.14 19.33C21.8 19.16 20.14 18.34 19.83 18.23C19.52 18.12 19.3 18.06 19.07 18.4C18.85 18.74 18.22 19.48 18.03 19.7C17.84 19.93 17.65 19.96 17.31 19.79C16.97 19.62 15.88 19.26 14.59 18.11C13.58 17.21 12.9 16.1 12.71 15.77C12.52 15.43 12.69 15.25 12.86 15.08C13.01 14.93 13.2 14.69 13.37 14.49C13.54 14.29 13.6 14.15 13.71 13.92C13.82 13.7 13.77 13.5 13.68 13.33C13.6 13.16 12.97 11.62 12.71 11C12.46 10.4 12.21 10.48 12.02 10.47C11.84 10.46 11.64 10.46 11.44 10.46C11.24 10.46 10.92 10.53 10.64 10.84C10.36 11.15 9.56 11.9 9.56 13.43C9.56 14.96 10.67 16.44 10.83 16.65C10.99 16.86 13.02 19.99 16.13 21.33C16.87 21.65 17.45 21.84 17.9 21.98C18.64 22.22 19.32 22.18 19.85 22.1C20.45 22.01 21.68 21.35 21.94 20.62C22.2 19.89 22.2 19.27 22.12 19.14C22.04 19.01 21.84 19.33 22.14 19.33Z"
            fill="currentColor"
          />
        </svg>

        {/* Floating Tooltip Pill */}
        <span className={`whatsapp-tooltip ${isHovered ? "show" : ""}`}>
          <span className="whatsapp-tooltip-text">व्हाट्सएप पर सम्पर्क करें</span>
          <span className="whatsapp-tooltip-sub">+91 6284667127</span>
        </span>
      </a>
    </aside>
  );
}

