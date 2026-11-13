import React, { useId, useState } from 'react';
import './DynamicBookCover.css';

/**
 * Smart layout calculator for Devanagari titles on the 3D blank book
 */
function formatBookTitle(rawTitle) {
  if (!rawTitle || typeof rawTitle !== 'string') {
    return { lines: ['वेद'], fontSize: 80 };
  }
  const clean = rawTitle.trim();

  // If title explicitly has a newline
  if (clean.includes('\n')) {
    const lines = clean.split('\n').filter(Boolean);
    const maxLen = Math.max(...lines.map((l) => l.length));
    const fontSize = maxLen <= 8 ? 64 : maxLen <= 14 ? 48 : 38;
    return { lines, fontSize };
  }

  const len = clean.length;

  // 1. Very short single word (e.g., "शिक्षा", "कल्प", "छन्द", "वेद") -> Large & Prominent (82px)
  if (len <= 6) {
    return { lines: [clean], fontSize: 82 };
  }

  // 2. Short phrase or single word (e.g., "ऋग्वेद", "सामवेद", "निरुक्त", "ज्योतिष", "व्याकरण") -> (72px)
  if (len <= 9) {
    return { lines: [clean], fontSize: 72 };
  }

  // 3. Medium length (e.g., "ऋग्वेद अध्ययन", "सांख्य दर्शन", "सत्यार्थ प्रकाश") -> (56px)
  if (len <= 14) {
    return { lines: [clean], fontSize: 56 };
  }

  // 4. Single long compound word without spaces (e.g., "माण्डूक्योपनिषद्", "ऋग्वेदादिभाष्यभूमिका") -> (46px)
  if (len <= 19 && !clean.includes(' ')) {
    return { lines: [clean], fontSize: 46 };
  }

  // 5. Multi-word titles -> Split cleanly into 2 balanced lines
  const words = clean.split(/\s+/);
  if (words.length >= 2) {
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(' ');
    const line2 = words.slice(mid).join(' ');
    const maxLen = Math.max(line1.length, line2.length);
    const fontSize = maxLen <= 9 ? 56 : maxLen <= 14 ? 46 : 38;
    return { lines: [line1, line2], fontSize };
  }

  // Fallback scaled single line
  const autoSize = Math.max(34, Math.floor((560 / len) * 1.5));
  return { lines: [clean], fontSize: Math.min(60, autoSize) };
}

/**
 * DynamicBookCover Component
 * Renders the single blank book with the course title dynamically styled in 3D golden typography,
 * perfectly perspective-aligned to the front cover angle.
 */
const DynamicBookCover = ({
  title = '',
  image = '',
  alt = '',
  className = '',
  style = {},
  forceDynamic = false,
  badge = null,
}) => {
  const [imgError, setImgError] = useState(false);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  const isCustomImage =
    !forceDynamic &&
    image &&
    !image.includes('blank_book.jpg') &&
    (image.startsWith('http://') ||
      image.startsWith('https://') ||
      image.startsWith('data:') ||
      image.startsWith('/uploads/'));

  // If user provided an external custom image and it hasn't errored, show it
  if (isCustomImage && !imgError) {
    return (
      <div className={`dynamic-book-cover custom-cover ${className}`} style={style}>
        <img
          src={image}
          alt={alt || title}
          className="book-base-img"
          onError={() => setImgError(true)}
        />
        {badge && badge.text && (
          <div className={`course-badge ${badge.type || 'popular'}`}>{badge.text}</div>
        )}
      </div>
    );
  }

  const { lines, fontSize } = formatBookTitle(title);
  const lineHeight = Math.round(fontSize * 1.25);
  const totalH = lineHeight * lines.length;
  const startY = 380 - Math.round(totalH / 2) + Math.round(lineHeight / 2);

  const gradId = `goldGrad_${uid}`;

  return (
    <div className={`dynamic-book-cover ${className}`} style={style}>
      {/* Single Base Blank Book */}
      <img
        src="/images/blank_book.jpg"
        alt={alt || title}
        className="book-base-img"
        loading="lazy"
      />

      {/* Dynamic 3D Perspective Vector Text Overlay */}
      <svg
        className="book-title-svg"
        viewBox="0 0 1024 1024"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fae4a8" />
            <stop offset="35%" stopColor="#d8ab55" />
            <stop offset="70%" stopColor="#b8832a" />
            <stop offset="100%" stopColor="#dfb76c" />
          </linearGradient>
        </defs>

        {/* 
          Exact 3D Perspective transformation matching the cover of the blank book:
          - Center: (540, 380)
          - Top border slope: -2.8 degrees
          - Vertical spine skew: -7 degrees
        */}
        <g transform="translate(540, 380) rotate(-2.8) skewX(-7)">
          {lines.map((lineText, idx) => {
            const yPos = startY + idx * lineHeight - 380;
            return (
              <text
                key={idx}
                x="0"
                y={yPos}
                fontSize={fontSize}
                fill={`url(#${gradId})`}
                className="book-title-text"
              >
                {lineText}
              </text>
            );
          })}
        </g>
      </svg>

      {badge && badge.text && (
        <div className={`course-badge ${badge.type || 'popular'}`}>{badge.text}</div>
      )}
    </div>
  );
};

export default DynamicBookCover;

