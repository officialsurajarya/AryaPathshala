import React, { useState, useEffect } from "react";
import "./AnnouncementBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faEnvelope,
  faBullhorn,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "../api/client";

export default function AnnouncementBar() {
  const phoneNumber = "+91 6284667127";
  const email = "officialaryapathshala@gmail.com";

  // 100% Dynamic — fetched only from live MySQL database
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLiveNotices = async () => {
      try {
        const res = await api.get("/notices");
        if (isMounted) {
          if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
            const liveList = res.data.map((n) => {
              const prefix = n.type ? `[${n.type}] ` : "";
              if (n.content && n.content.length > 0) {
                const snippet =
                  n.content.length > 75
                    ? `${n.content.slice(0, 75)}...`
                    : n.content;
                return `${prefix}${n.title}: ${snippet}`;
              }
              return `${prefix}${n.title}`;
            });
            setNotices(liveList);
          } else {
            setNotices([]);
          }
          setLoading(false);
        }
      } catch (err) {
        console.warn("[AnnouncementBar] DB notice fetch error:", err.message);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLiveNotices();

    // Auto-update when Admin adds, edits, deletes or toggles notice visibility in Admin Panel
    window.addEventListener("noticesUpdated", fetchLiveNotices);

    // Periodic live sync with MySQL DB every 30 seconds
    const intervalId = setInterval(fetchLiveNotices, 30000);

    return () => {
      isMounted = false;
      window.removeEventListener("noticesUpdated", fetchLiveNotices);
      clearInterval(intervalId);
    };
  }, []);

  // Duplicate items for a seamless continuous marquee loop
  const displayItems =
    notices.length === 0
      ? []
      : notices.length < 3
        ? notices.concat(notices).concat(notices)
        : notices.concat(notices);

  // Mobile Scroll Down Detection — Hide Notification Panel when scrolling down in Phone Mode
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  useEffect(() => {
    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

          // Always visible at the very top of the page
          if (currentScrollY <= 25) {
            setIsScrolledDown(false);
          } else if (currentScrollY > lastScrollY && currentScrollY > 40) {
            // Scrolling down past 40px -> hide notification panel
            setIsScrolledDown(true);
          } else if (currentScrollY < lastScrollY - 10) {
            // Scrolling up by at least 10px -> reveal notification panel
            setIsScrolledDown(false);
          }

          lastScrollY = Math.max(0, currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`announcement-bar ${isScrolledDown ? "scrolled-down-hide" : ""}`}
      role="region"
      aria-label="शीर्ष लाइव सूचना एवं संपर्क पट्टी"
    >
      <div className="announcement-container">
        {/* Left Side: Contact Number */}
        <div className="announcement-left">
          <a
            href={`tel:${phoneNumber.replace(/\s+/g, "")}`}
            className="announcement-link phone-link"
            title="संपर्क सूत्र (Call)"
          >
            <span className="announcement-icon-bubble">
              <FontAwesomeIcon icon={faPhone} />
            </span>
            {/* <span className="contact-label d-none d-md-inline">संपर्क:</span> */}
            <span className="contact-value">{phoneNumber}</span>
          </a>
        </div>

        {/* Mid: Auto-Scrolling Live Notification Ticker from DB */}
        <div
          className="announcement-center"
          title="लाइव सूचनाएँ (माउस ले जाने पर रुकेगी)"
        >
          <span className="announcement-tag">
            <FontAwesomeIcon icon={faBullhorn} className="me-1" /> लाइव सूचना
          </span>

          <div className="ticker-viewport">
            {loading ? (
              <span className="ticker-item loading-text">
                <FontAwesomeIcon icon={faSpinner} spin className="me-1" />{" "}
                डेटाबेस से सूचनाएं लोड हो रही हैं...
              </span>
            ) : displayItems.length > 0 ? (
              <div className="ticker-track">
                {displayItems.map((notice, idx) => (
                  <span
                    key={`${idx}-${notice.slice(0, 12)}`}
                    className="ticker-item"
                  >
                    {notice}
                    <span className="ticker-bullet">✦</span>
                  </span>
                ))}
              </div>
            ) : (
              <span className="ticker-item text-muted">
                वर्तमान में कोई सक्रिय सूचना प्रकाशित नहीं है। (Admin Panel से सूचना प्रकाशित करें)
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Email */}
        <div className="announcement-right">
          <a
            href={`mailto:${email}`}
            className="announcement-link email-link"
            title="ई-मेल करें"
          >
            <span className="announcement-icon-bubble">
              <FontAwesomeIcon icon={faEnvelope} />
            </span>
            {/* <span className="email-label d-none d-md-inline">ईमेल:</span> */}
            <span className="email-value">{email}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
