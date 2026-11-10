import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Nav, Button, Badge, ProgressBar, Form, Table, Alert, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faGraduationCap,
  faUser,
  faChartLine,
  faSignOutAlt,
  faHome,
  faEnvelope,
  faUsers,
  faKey,
  faTrash,
  faBullhorn,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

export default function Dashboard({ onBackToHome }) {
  const { user, logout, updateProfile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("myCourses");
  const [enrollments, setEnrollments] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [adminStats, setAdminStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [messagesList, setMessagesList] = useState([]);
  const [statusAlert, setStatusAlert] = useState(null);

  // Profile Form state
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || "🕉️");
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  // New notice form
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    type: "महत्वपूर्ण सूचना",
    priority: "MEDIUM",
  });

  // Modal for studying course
  const [activeStudyCourse, setActiveStudyCourse] = useState(null);

  const fetchEnrollments = useCallback(async () => {
    setLoadingCourses(true);
    try {
      const res = await api.get("/enrollments/my-courses");
      if (res && res.success && res.data) {
        setEnrollments(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch real enrollments:", err.message);
      // Fallback sample data if offline
      setEnrollments([
        {
          id: 1,
          progressPercent: 45,
          status: "ACTIVE",
          enrolledAt: new Date().toISOString(),
          course: {
            title: "ऋग्वेद अध्ययन",
            category: "ved",
            image: "/images/Rigveda.jpg",
            durationHours: 40,
            rating: 4.9,
            description: "ऋग्वेद के मूल मंत्रों का गहन अध्ययन और उनका अर्थ।",
          },
        },
      ]);
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  const fetchAdminData = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const [statsRes, usersRes, msgsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users?limit=30"),
        api.get("/contact?limit=20"),
      ]);
      if (statsRes?.data) setAdminStats(statsRes.data);
      if (usersRes?.data?.users) setUsersList(usersRes.data.users);
      if (msgsRes?.data?.messages) setMessagesList(msgsRes.data.messages);
    } catch (err) {
      console.warn("Admin data fetch error:", err.message);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchEnrollments();
    if (isAdmin) {
      fetchAdminData();
    }
  }, [fetchEnrollments, fetchAdminData, isAdmin]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setStatusAlert(null);
    try {
      await updateProfile({
        name: profileName,
        phone: profilePhone,
        avatar: profileAvatar,
      });
      setStatusAlert({ type: "success", text: "प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!" });
    } catch (err) {
      setStatusAlert({ type: "danger", text: err.message || "प्रोफ़ाइल अपडेट विफल रहा" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatusAlert({ type: "danger", text: "नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।" });
      return;
    }
    setChangingPass(true);
    setStatusAlert(null);
    try {
      await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setStatusAlert({ type: "success", text: "पासवर्ड सफलतापूर्वक परिवर्तित हो गया!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setStatusAlert({ type: "danger", text: err.message || "पासवर्ड परिवर्तन विफल रहा।" });
    } finally {
      setChangingPass(false);
    }
  };

  const handleProgressUpdate = async (enrollmentId, currentPercent) => {
    const nextPercent = Math.min(100, currentPercent + 20);
    try {
      await api.put("/enrollments/progress", {
        enrollmentId,
        progressPercent: nextPercent,
      });
      setEnrollments((prev) =>
        prev.map((item) =>
          item.id === enrollmentId
            ? {
                ...item,
                progressPercent: nextPercent,
                status: nextPercent === 100 ? "COMPLETED" : "ACTIVE",
              }
            : item
        )
      );
    } catch (err) {
      console.warn("Could not save progress to server:", err.message);
      // Optimistic update locally
      setEnrollments((prev) =>
        prev.map((item) =>
          item.id === enrollmentId
            ? { ...item, progressPercent: nextPercent }
            : item
        )
      );
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setStatusAlert({ type: "success", text: "उपयोगकर्ता भूमिका अद्यतन हुई" });
    } catch (err) {
      setStatusAlert({ type: "danger", text: err.message || "भूमिका परिवर्तन विफल" });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("क्या आप निश्चित रूप से इस उपयोगकर्ता को हटाना चाहते हैं?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsersList((prev) => prev.filter((u) => u.id !== userId));
      setStatusAlert({ type: "success", text: "उपयोगकर्ता खाता हटा दिया गया" });
    } catch (err) {
      setStatusAlert({ type: "danger", text: err.message || "हटाने में त्रुटि" });
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      await api.post("/notices", newNotice);
      setStatusAlert({ type: "success", text: "नवीन सूचना प्रकाशित हो गई!" });
      setNewNotice({ title: "", content: "", type: "महत्वपूर्ण सूचना", priority: "MEDIUM" });
    } catch (err) {
      setStatusAlert({ type: "danger", text: err.message || "सूचना प्रकाशन विफल" });
    }
  };

  return (
    <div className="dashboard-container" style={{ background: "#fdfbf7", minHeight: "100vh", paddingTop: "90px", paddingBottom: "60px" }}>
      <Container>
        {/* Top Header Card */}
        <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: "16px", background: "linear-gradient(135deg, #ffffff 0%, #fff8f0 100%)" }}>
          <Card.Body className="p-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: "65px", height: "65px", borderRadius: "50%", background: "linear-gradient(135deg, #d4af37, #fdeaa8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", boxShadow: "0 4px 10px rgba(212,175,55,0.3)" }}>
                  {user?.avatar || "🕉️"}
                </div>
                <div>
                  <h3 className="mb-1" style={{ color: "var(--primary-color, #c73659)", fontWeight: "bold" }}>
                    नमस्ते, {user?.name || "विद्यार्थी"}!
                  </h3>
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small">{user?.email}</span>
                    <Badge bg={isAdmin ? "danger" : "warning"} text={isAdmin ? "white" : "dark"}>
                      {isAdmin ? "व्यवस्थापक (Admin)" : user?.role === "TEACHER" ? "आचार्य (Teacher)" : "विद्यार्थी (Student)"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2">
                <Button variant="outline-secondary" className="d-flex align-items-center gap-2" onClick={onBackToHome}>
                  <FontAwesomeIcon icon={faHome} /> मुख्यपृष्ठ
                </Button>
                <Button variant="outline-danger" className="d-flex align-items-center gap-2" onClick={logout}>
                  <FontAwesomeIcon icon={faSignOutAlt} /> लॉग आउट
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {statusAlert && (
          <Alert variant={statusAlert.type} dismissible onClose={() => setStatusAlert(null)}>
            {statusAlert.text}
          </Alert>
        )}

        {/* Navigation Tabs */}
        <Nav variant="pills" className="mb-4 dashboard-tabs p-2 bg-white shadow-sm" style={{ borderRadius: "12px", border: "1px solid rgba(0,0,0,0.06)" }}>
          <Nav.Item>
            <Nav.Link
              active={activeTab === "myCourses"}
              onClick={() => setActiveTab("myCourses")}
              style={{ fontWeight: "600", cursor: "pointer", color: activeTab === "myCourses" ? "#fff" : "#444", background: activeTab === "myCourses" ? "var(--primary-color, #c73659)" : "transparent" }}
            >
              <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
              मेरे पाठ्यक्रम ({enrollments.length})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
              style={{ fontWeight: "600", cursor: "pointer", color: activeTab === "profile" ? "#fff" : "#444", background: activeTab === "profile" ? "var(--primary-color, #c73659)" : "transparent" }}
            >
              <FontAwesomeIcon icon={faUser} className="me-2" />
              मेरी प्रोफ़ाइल एवं सुरक्षा
            </Nav.Link>
          </Nav.Item>
          {isAdmin && (
            <Nav.Item>
              <Nav.Link
                active={activeTab === "adminPanel"}
                onClick={() => setActiveTab("adminPanel")}
                style={{ fontWeight: "600", cursor: "pointer", color: activeTab === "adminPanel" ? "#fff" : "#444", background: activeTab === "adminPanel" ? "#198754" : "transparent" }}
              >
                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                प्रशासन एवं प्रबंधन (Admin)
              </Nav.Link>
            </Nav.Item>
          )}
        </Nav>

        {/* Tab 1: My Courses */}
        {activeTab === "myCourses" && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 style={{ fontWeight: "bold", color: "#333" }}>अध्ययनरत पाठ्यक्रम</h4>
              <Button variant="outline-primary" size="sm" onClick={onBackToHome}>
                + नवीन पाठ्यक्रम खोजें
              </Button>
            </div>

            {loadingCourses ? (
              <div className="text-center py-5">
                <div className="spinner-border text-danger" role="status"></div>
                <p className="mt-2 text-muted">पाठ्यक्रम लोड हो रहे हैं...</p>
              </div>
            ) : enrollments.length === 0 ? (
              <Card className="text-center py-5 shadow-sm border-0">
                <Card.Body>
                  <div style={{ fontSize: "50px" }}>📖</div>
                  <h5 className="mt-3">आपने अभी तक किसी पाठ्यक्रम में नामांकन नहीं किया है।</h5>
                  <p className="text-muted">आर्य पाठशाला के प्राचीन वेद, दर्शन एवं उपनिषद् पाठ्यक्रमों में आज ही नामांकन करें।</p>
                  <Button variant="danger" onClick={onBackToHome}>
                    पाठ्यक्रम सूची देखें
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              <Row>
                {enrollments.map((item) => (
                  <Col lg={4} md={6} className="mb-4" key={item.id}>
                    <Card className="h-100 shadow-sm border-0 overflow-hidden" style={{ borderRadius: "14px" }}>
                      <div style={{ height: "170px", overflow: "hidden", position: "relative" }}>
                        <img
                          src={item.course?.image || "/images/Rigveda.jpg"}
                          alt={item.course?.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <Badge
                          bg={item.progressPercent === 100 ? "success" : "warning"}
                          text={item.progressPercent === 100 ? "white" : "dark"}
                          style={{ position: "absolute", top: "12px", right: "12px" }}
                        >
                          {item.progressPercent === 100 ? "पूर्ण (Completed)" : "सक्रिय (In Progress)"}
                        </Badge>
                      </div>

                      <Card.Body className="d-flex flex-column">
                        <h5 style={{ fontWeight: "bold", color: "#222" }}>{item.course?.title}</h5>
                        <p className="text-muted small mb-3">{item.course?.description}</p>

                        <div className="mt-auto">
                          <div className="d-flex justify-content-between small text-muted mb-1">
                            <span>अध्ययन प्रगति</span>
                            <span className="fw-bold">{item.progressPercent}%</span>
                          </div>
                          <ProgressBar
                            now={item.progressPercent}
                            variant={item.progressPercent === 100 ? "success" : "danger"}
                            style={{ height: "8px", borderRadius: "4px" }}
                            className="mb-3"
                          />

                          <div className="d-flex gap-2">
                            <Button
                              variant="danger"
                              className="w-100"
                              onClick={() => setActiveStudyCourse(item.course)}
                            >
                              <FontAwesomeIcon icon={faBook} className="me-1" /> अध्ययन जारी रखें
                            </Button>
                            {item.progressPercent < 100 && (
                              <Button
                                variant="outline-success"
                                title="20% पाठ पूर्ण दर्ज करें"
                                onClick={() => handleProgressUpdate(item.id, item.progressPercent)}
                              >
                                +20%
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        )}

        {/* Tab 2: Profile & Security */}
        {activeTab === "profile" && (
          <Row>
            <Col md={6} className="mb-4">
              <Card className="shadow-sm border-0 h-100" style={{ borderRadius: "14px" }}>
                <Card.Header className="bg-white py-3 border-0">
                  <h5 className="mb-0 fw-bold" style={{ color: "var(--primary-color, #c73659)" }}>
                    <FontAwesomeIcon icon={faUser} className="me-2" /> व्यक्तिगत विवरण
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleUpdateProfile}>
                    <Form.Group className="mb-3">
                      <Form.Label>अवतार प्रतीक (Avatar)</Form.Label>
                      <div className="d-flex gap-2 mb-2">
                        {["🕉️", "📚", "🧘‍♂️", "📜", "🎓", "🪔"].map((emoji) => (
                          <Button
                            key={emoji}
                            variant={profileAvatar === emoji ? "danger" : "outline-secondary"}
                            size="sm"
                            type="button"
                            onClick={() => setProfileAvatar(emoji)}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>पूर्ण नाम</Form.Label>
                      <Form.Control
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>ई-मेल पता (अपरिवर्तनीय)</Form.Label>
                      <Form.Control type="email" value={user?.email || ""} disabled readOnly />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>फ़ोन नंबर</Form.Label>
                      <Form.Control
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="जैसे: +91 9876543210"
                      />
                    </Form.Group>

                    <Button variant="danger" type="submit" disabled={savingProfile}>
                      {savingProfile ? "सहेजा जा रहा है..." : "विवरण सहेजें"}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card className="shadow-sm border-0 h-100" style={{ borderRadius: "14px" }}>
                <Card.Header className="bg-white py-3 border-0">
                  <h5 className="mb-0 fw-bold" style={{ color: "#d4af37" }}>
                    <FontAwesomeIcon icon={faKey} className="me-2" /> सुरक्षा एवं पासवर्ड परिवर्तन
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleChangePassword}>
                    <Form.Group className="mb-3">
                      <Form.Label>वर्तमान पासवर्ड</Form.Label>
                      <Form.Control
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>नया पासवर्ड (कम से कम 6 अक्षर)</Form.Label>
                      <Form.Control
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>नये पासवर्ड की पुष्टि</Form.Label>
                      <Form.Control
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Button variant="warning" type="submit" disabled={changingPass}>
                      {changingPass ? "बदला जा रहा है..." : "पासवर्ड बदलें"}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Tab 3: Admin & Management */}
        {isAdmin && activeTab === "adminPanel" && (
          <div>
            {/* Stats row */}
            <Row className="mb-4">
              <Col md={3} sm={6} className="mb-3">
                <Card className="shadow-sm border-0 text-center p-3" style={{ borderRadius: "12px", borderLeft: "4px solid #c73659" }}>
                  <h3 className="text-danger fw-bold">{adminStats?.totalUsers ?? usersList.length}</h3>
                  <span className="text-muted small">कुल पंजीकृत उपयोगकर्ता</span>
                </Card>
              </Col>
              <Col md={3} sm={6} className="mb-3">
                <Card className="shadow-sm border-0 text-center p-3" style={{ borderRadius: "12px", borderLeft: "4px solid #198754" }}>
                  <h3 className="text-success fw-bold">{adminStats?.totalEnrollments ?? enrollments.length}</h3>
                  <span className="text-muted small">सक्रिय नामांकन</span>
                </Card>
              </Col>
              <Col md={3} sm={6} className="mb-3">
                <Card className="shadow-sm border-0 text-center p-3" style={{ borderRadius: "12px", borderLeft: "4px solid #0d6efd" }}>
                  <h3 className="text-primary fw-bold">{adminStats?.totalCourses ?? 30}</h3>
                  <span className="text-muted small">उपलब्ध पाठ्यक्रम</span>
                </Card>
              </Col>
              <Col md={3} sm={6} className="mb-3">
                <Card className="shadow-sm border-0 text-center p-3" style={{ borderRadius: "12px", borderLeft: "4px solid #ffc107" }}>
                  <h3 className="text-warning fw-bold">{adminStats?.unreadMessages ?? messagesList.length}</h3>
                  <span className="text-muted small">अपठित शंका-संदेश</span>
                </Card>
              </Col>
            </Row>

            {/* Users Management */}
            <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: "14px" }}>
              <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                  <FontAwesomeIcon icon={faUsers} className="me-2 text-danger" />
                  उपयोगकर्ता प्रबंधन (Users Management)
                </h5>
                <Badge bg="secondary">{usersList.length} खाते</Badge>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>नाम</th>
                        <th>ई-मेल</th>
                        <th>फ़ोन</th>
                        <th>भूमिका (Role)</th>
                        <th>क्रियाएँ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((u) => (
                        <tr key={u.id}>
                          <td className="fw-bold">
                            <span className="me-2">{u.avatar || "👤"}</span>
                            {u.name}
                          </td>
                          <td>{u.email}</td>
                          <td>{u.phone || "—"}</td>
                          <td>
                            <Form.Select
                              size="sm"
                              value={u.role}
                              style={{ width: "130px" }}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            >
                              <option value="STUDENT">STUDENT</option>
                              <option value="TEACHER">TEACHER</option>
                              <option value="ADMIN">ADMIN</option>
                            </Form.Select>
                          </td>
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={u.id === user.id}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>

            {/* Contact Inquiries */}
            <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: "14px" }}>
              <Card.Header className="bg-white py-3 border-0">
                <h5 className="mb-0 fw-bold">
                  <FontAwesomeIcon icon={faEnvelope} className="me-2 text-primary" />
                  शंका समाधान संदेश इनबॉक्स (Contact Inquiries)
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>प्रेषक (Sender)</th>
                        <th>ई-मेल व फ़ोन</th>
                        <th>विषय</th>
                        <th>संदेश</th>
                        <th>स्थिति</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messagesList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-muted">
                            कोई संदेश उपलब्ध नहीं है।
                          </td>
                        </tr>
                      ) : (
                        messagesList.map((msg) => (
                          <tr key={msg.id}>
                            <td className="fw-bold">{msg.firstName} {msg.lastName || ""}</td>
                            <td>
                              <small>{msg.email}</small>
                              <br />
                              <small className="text-muted">{msg.phone || ""}</small>
                            </td>
                            <td><Badge bg="info">{msg.subject}</Badge></td>
                            <td style={{ maxWidth: "250px" }} className="text-truncate">{msg.message}</td>
                            <td>
                              <Badge bg={msg.status === "UNREAD" ? "danger" : "success"}>
                                {msg.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>

            {/* Notice Publisher */}
            <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: "14px" }}>
              <Card.Header className="bg-white py-3 border-0">
                <h5 className="mb-0 fw-bold">
                  <FontAwesomeIcon icon={faBullhorn} className="me-2 text-warning" />
                  नवीन सूचना प्रकाशित करें (Publish Notice)
                </h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleCreateNotice}>
                  <Row>
                    <Col md={8}>
                      <Form.Group className="mb-3">
                        <Form.Label>सूचना शीर्षक</Form.Label>
                        <Form.Control
                          type="text"
                          required
                          value={newNotice.title}
                          onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                          placeholder="जैसे: यूजीसी नेट परीक्षा समय सारिणी 2025"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>प्रकार</Form.Label>
                        <Form.Select
                          value={newNotice.type}
                          onChange={(e) => setNewNotice({ ...newNotice, type: e.target.value })}
                        >
                          <option value="महत्वपूर्ण सूचना">महत्वपूर्ण सूचना</option>
                          <option value="नवीन पाठ्यक्रम">नवीन पाठ्यक्रम</option>
                          <option value="परीक्षा सूचना">परीक्षा सूचना</option>
                          <option value="छात्रवृत्ति">छात्रवृत्ति</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>सूचना विवरण</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      required
                      value={newNotice.content}
                      onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                    />
                  </Form.Group>
                  <Button variant="danger" type="submit">
                    सूचना प्रकाशित करें
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        )}

        {/* Modal for studying */}
        <Modal show={!!activeStudyCourse} onHide={() => setActiveStudyCourse(null)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title style={{ color: "var(--primary-color)" }}>
              {activeStudyCourse?.title} — अध्ययन कक्ष
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center mb-4">
              <img
                src={activeStudyCourse?.image || "/images/Rigveda.jpg"}
                alt=""
                style={{ maxHeight: "200px", borderRadius: "10px" }}
              />
            </div>
            <h5>पाठ्यक्रम विवरण</h5>
            <p>{activeStudyCourse?.description}</p>
            <Alert variant="info">
              <strong>पाठ सामग्री:</strong> इस पाठ्यक्रम के डिजिटल नोट्स, उच्चारण अभ्यास, एवं मंत्र संकलन आपके अध्ययन हेतु उपलब्ध हैं।
            </Alert>
            <div className="p-3 bg-light rounded">
              <h6>अध्याय सूची:</h6>
              <ul className="mb-0">
                <li>प्रस्तावना एवं मंगलाचरण</li>
                <li>प्रथम मण्डल: मूल पाठ एवं अन्वय</li>
                <li>पारम्परिक भाष्य एवं आधुनिक संदर्भ</li>
                <li>अभ्यास प्रश्नमाला एवं स्व-मूल्यांकन</li>
              </ul>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setActiveStudyCourse(null)}>
              बंद करें
            </Button>
            <Button variant="success" onClick={() => { alert("अध्याय 1 प्रारंभ हो रहा है..."); setActiveStudyCourse(null); }}>
              पाठ 1 प्रारंभ करें
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}
