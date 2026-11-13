import React, { useState, useEffect, useRef } from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import "../App.css";
import "../Responsive.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBook,
  faBullhorn,
  faEnvelope,
  faTimes,
  faBars,
  faUser,
  faUserPlus,
  faSignInAlt,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import AnnouncementBar from "./AnnouncementBar";

export default function Header({ onCategorySelect, showAuth, onOpenDashboard }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const navRef = useRef();

  // Close navbar if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navRef]);

  // Handle category click
  const handleCategoryClick = (category) => {
    onCategorySelect(category);
    setExpanded(false);
  };

  return (
    <header className="site-header fixed-top" ref={navRef}>
      {/* Top Announcement Bar with Contact & Email */}
      <AnnouncementBar />

      <Navbar
        expand="lg"
        expanded={expanded}
        className="p-0 navbar"
      >
      <Container className="NavContainer">
        <Navbar.Brand href="#" className="p-0 navBrand">
          <img src="./logo.png" width="80" alt="Arya Pathshala Logo" />
        </Navbar.Brand>

        <h1 className="m-0 mt-2">Arya Pathshala</h1>

        <Navbar.Toggle
          aria-controls="my-nav"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <FontAwesomeIcon icon={faTimes} size="lg" />
          ) : (
            <FontAwesomeIcon icon={faBars} size="lg" />
          )}
        </Navbar.Toggle>

        <Navbar.Collapse id="my-nav">
          <Nav className="m-auto fw-bold text-center gap-2 myNav">
            <Nav.Link href="#home" onClick={() => setExpanded(false)}>
              <FontAwesomeIcon icon={faHome} className="navIcon" /> मुखपृष्ठ
            </Nav.Link>

            <NavDropdown
              title={
                <>
                  <FontAwesomeIcon icon={faBook} /> पाठ्यक्रम
                </>
              }
              id="coursesDropdown"
              show={coursesOpen}
              onMouseEnter={() => setCoursesOpen(true)}
              onMouseLeave={() => setCoursesOpen(false)}
              onClick={() => setCoursesOpen(!coursesOpen)}
            >
              <NavDropdown.Item onClick={() => handleCategoryClick("ved")}>
                वेद
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => handleCategoryClick("vedang")}>
                वेदांग
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => handleCategoryClick("upanishad")}
              >
                उपनिषद्
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => handleCategoryClick("darshan")}>
                दर्शनशास्त्र
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => handleCategoryClick("aarshgrantha")}
              >
                अन्य आर्षग्रन्थ
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => handleCategoryClick("netexam25")}
              >
                राष्ट्रीय पात्रता परीक्षा (संस्कृत 25)
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => handleCategoryClick("netexam73")}
              >
                राष्ट्रीय पात्रता परीक्षा (संस्कृत 73)
              </NavDropdown.Item>
            </NavDropdown>

            <NavDropdown
              title={
                <>
                  <FontAwesomeIcon icon={faBook} /> पुस्तकालय
                </>
              }
              id="libraryDropdown"
              show={libraryOpen}
              onMouseEnter={() => setLibraryOpen(true)}
              onMouseLeave={() => setLibraryOpen(false)}
              onClick={() => setLibraryOpen(!libraryOpen)}
            >
              <NavDropdown.Item onClick={() => handleCategoryClick("mainBook")}>
                मूल ग्रन्थ
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => handleCategoryClick("VaykhyanBook")}
              >
                व्याख्यान ग्रन्थ
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => handleCategoryClick("VidhwatLekh")}
              >
                विद्वत्-लेख एवं शोध पत्र
              </NavDropdown.Item>
            </NavDropdown>

            <Nav.Link href="#notices" onClick={() => setExpanded(false)}>
              <FontAwesomeIcon icon={faBullhorn} className="navIcon" /> सूचनाएँ
            </Nav.Link>

            <Nav.Link href="#contact" onClick={() => setExpanded(false)}>
              <FontAwesomeIcon icon={faEnvelope} className="navIcon" /> शंका
              समाधान एवं सम्पर्क
            </Nav.Link>
          </Nav>

          <div className="auth-btn d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <>
                <button
                  className="btn-login d-flex align-items-center gap-1"
                  type="button"
                  onClick={() => {
                    setExpanded(false);
                    if (onOpenDashboard) onOpenDashboard();
                  }}
                  title={user?.name ? `${user.name} — डैशबोर्ड खोलें` : "डैशबोर्ड खोलें"}
                >
                  <FontAwesomeIcon icon={faUser} className="me-1" />
                  <span style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user?.name || "विद्यार्थी"}
                  </span>
                </button>
                <button
                  className="btn-signup d-flex align-items-center gap-1"
                  type="button"
                  onClick={() => {
                    setExpanded(false);
                    logout();
                  }}
                  title="लॉग आउट"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-1" /> निर्गमन (Logout)
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn-login"
                  type="button"
                  onClick={() => {
                    setExpanded(false);
                    showAuth("login");
                  }}
                >
                  <FontAwesomeIcon icon={faSignInAlt} className="me-1" /> प्रवेशः
                </button>
                <button
                  className="btn-signup"
                  type="button"
                  onClick={() => {
                    setExpanded(false);
                    showAuth("signup");
                  }}
                >
                  <FontAwesomeIcon icon={faUserPlus} className="me-1" /> पञ्जीकरणम्
                </button>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    </header>
  );
}
