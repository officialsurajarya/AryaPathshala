import React, { useState, useEffect, useCallback } from "react";
import "./AdminPanel.css";
import DynamicBookCover from "./DynamicBookCover";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome, faBook, faBullhorn, faEnvelope, faChartBar,
  faBars, faTimes, faPlus, faEdit, faTrash, faEye, faSignOutAlt,
  faArrowLeft, faSearch, faCheck, faSave, faExclamationTriangle,
  faGraduationCap, faLayerGroup, faCheckCircle, faToggleOn, faToggleOff,
  faKey, faUser, faShieldAlt, faClock, faInbox, faSync, faUserGraduate,
  faBookOpen, faChalkboardTeacher, faCalendarAlt, faCertificate, faVideo,
  faQuestionCircle, faAward, faIdCard, faPrint
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

/* helpers */
const fmt = (d) => d ? new Date(d).toLocaleDateString("hi-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtDT = (d) => d ? new Date(d).toLocaleString("hi-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

function useAlert() {
  const [alert, setAlert] = useState(null);
  const show = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000); };
  return [alert, show];
}

function AdminAlert({ alert }) {
  if (!alert) return null;
  return (
    <div className={"admin-alert " + alert.type}>
      <FontAwesomeIcon icon={alert.type === "success" ? faCheckCircle : faExclamationTriangle} />
      {" "}{alert.msg}
    </div>
  );
}

function Spinner() {
  return <div className="admin-spinner"><div className="spinner-ring" /></div>;
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className={"stat-card " + color}>
      <div className="stat-icon"><FontAwesomeIcon icon={icon} /></div>
      <div>
        <div className="stat-value">{value ?? "—"}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

const CATEGORY_OPTIONS = [
  { value: "ved", label: "वेद" },
  { value: "vedang", label: "वेदांग" },
  { value: "upanishad", label: "उपनिषद्" },
  { value: "darshan", label: "दर्शनशास्त्र" },
  { value: "aarshgrantha", label: "अन्य आर्षग्रन्थ" },
  { value: "netexam25", label: "NET संस्कृत (25)" },
  { value: "netexam73", label: "NET संस्कृत (73)" },
];

const EMPTY_COURSE = {
  slug: "", category: "ved", title: "", titleEn: "",
  description: "", syllabus: "", instructor: "आचार्य", image: "/images/Rigveda.jpg",
  originalPrice: "₹3,999", currentPrice: "₹2,499",
  rating: "4.8", durationHours: "30", studentsCount: "0",
  hasCertificate: true, badgeText: "", badgeType: "popular", isPublished: true,
};

const EMPTY_NOTICE = {
  title: "", content: "", type: "महत्वपूर्ण सूचना", category: "important",
  dateText: "अद्यतन", actionText: "विस्तार से पढ़ें", actionLink: "#courses",
  priority: "MEDIUM", isPublished: true,
};

const EMPTY_STUDENT = {
  name: "", email: "", password: "", phone: "", role: "STUDENT",
  isVerified: true, avatar: "🕉️",
  fatherName: "", dob: "", education: "", address: "", city: "", state: "", pincode: "",
  idDocumentType: "Aadhaar", idDocumentNumber: "", academicNotes: ""
};

const EMPTY_TEACHER = {
  name: "", email: "", password: "", phone: "", role: "TEACHER",
  isVerified: true, avatar: "🧘‍♂️",
  fatherName: "", dob: "", education: "आचार्य - सम्पूर्णानन्द संस्कृत विश्वविद्यालय",
  specialization: "ऋग्वेद, सांख्य दर्शन, पाणिनीय व्याकरण",
  address: "", city: "", state: "", pincode: "",
  idDocumentType: "Aadhaar", idDocumentNumber: "",
  academicNotes: "वेदाचार्य एवं वरिष्ठ आर्ष व्याख्याता"
};

const NAV_ITEMS = [
  { key: "overview", label: "अवलोकन (Dashboard)", icon: faChartBar, section: "मुख्य" },
  { key: "courses", label: "पाठ्यक्रम प्रबंधन", icon: faBook, section: "सामग्री" },
  { key: "library", label: "पुस्तकालय ग्रन्थ", icon: faBookOpen, section: "सामग्री" },
  { key: "notices", label: "सूचना प्रबंधन", icon: faBullhorn, section: "सामग्री" },
  { key: "users", label: "विद्यार्थी प्रबंधन", icon: faUserGraduate, section: "प्रबंधन" },
  { key: "teachers", label: "आचार्य / शिक्षक", icon: faChalkboardTeacher, section: "प्रबंधन" },
  { key: "liveSessions", label: "लाइव कक्षाएं व सत्र", icon: faCalendarAlt, section: "प्रबंधन" },
  { key: "enrollments", label: "नामांकन व प्रमाण-पत्र", icon: faGraduationCap, section: "प्रबंधन" },
  { key: "messages", label: "शंका समाधान व संवाद", icon: faEnvelope, section: "प्रबंधन", badge: "unreadMessages" },
  { key: "settings", label: "व्यवस्थापक सेटिंग्स", icon: faUser, section: "खाता" },
];

const SECTION_TITLES = {
  overview: "डैशबोर्ड अवलोकन",
  courses: "पाठ्यक्रम प्रबंधन",
  library: "पुस्तकालय ग्रन्थ प्रबंधन",
  notices: "सूचना प्रबंधन",
  users: "विद्यार्थी प्रबंधन",
  teachers: "आचार्य एवं शिक्षक प्रबंधन",
  liveSessions: "लाइव कक्षाएं एवं समय-सारणी प्रबंधन",
  enrollments: "नामांकन एवं प्रमाण-पत्र प्रबंधन",
  messages: "शंका समाधान एवं संवाद केंद्र",
  settings: "व्यवस्थापक सेटिंग्स",
};


/* ─── Confirm Delete Modal ─── */
function DeleteModal({ title, body, onConfirm, onCancel }) {
  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal" style={{ maxWidth: 420 }}>
        <div className="admin-modal-header">
          <h5>⚠️ {title}</h5>
          <button className="admin-modal-close" onClick={onCancel}><FontAwesomeIcon icon={faTimes} /></button>
        </div>
        <div className="admin-modal-body"><p style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>{body}</p></div>
        <div className="admin-modal-footer">
          <button className="btn-admin btn-admin-outline" onClick={onCancel}>रद्द करें</button>
          <button className="btn-admin btn-admin-danger" onClick={onConfirm}><FontAwesomeIcon icon={faTrash} /> हाँ, हटाएँ</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   1. OVERVIEW (DASHBOARD MANAGEMENT)
════════════════════════════════════════════════════════ */
function OverviewSection({ stats, onTabChange }) {
  const tot = Math.max(stats?.totalUsers || 1, 1);
  const enroll = Math.max(stats?.totalEnrollments || 1, 1);

  return (
    <div>
      <div className="stat-cards-grid">
        <StatCard icon={faUserGraduate} value={stats?.totalStudents} label="कुल विद्यार्थी" color="blue" />
        <StatCard icon={faChalkboardTeacher} value={stats?.totalTeachers ?? 0} label="आचार्य / शिक्षक" color="teal" />
        <StatCard icon={faBook} value={stats?.activeCourses} label="सक्रिय पाठ्यक्रम" color="gold" />
        <StatCard icon={faBullhorn} value={stats?.publishedNotices} label="प्रकाशित सूचनाएँ" color="red" />
        <StatCard icon={faLayerGroup} value={stats?.totalEnrollments} label="कुल नामांकन" color="green" />
        <StatCard icon={faCheckCircle} value={stats?.completedEnrollments} label="पूर्ण पाठ्यक्रम" color="purple" />
        <StatCard icon={faInbox} value={stats?.unreadMessages} label="अपठित संदेश" color="orange" />
      </div>

      <div className="mini-chart-row">
        <div className="mini-chart-card">
          <h6>🕉️ उपयोगकर्ता वितरण (Live Database)</h6>
          {[
            { label: "विद्यार्थी (Students)", val: stats?.totalStudents ?? 0, pct: Math.round(((stats?.totalStudents ?? 0) / tot) * 100), cls: "blue" },
            { label: "शिक्षक (Teachers)", val: stats?.totalTeachers ?? 0, pct: Math.round(((stats?.totalTeachers ?? 0) / tot) * 100), cls: "gold" },
            { label: "व्यवस्थापक (Admins)", val: stats?.totalAdmins ?? 1, pct: Math.round(((stats?.totalAdmins ?? 1) / tot) * 100), cls: "red" },
          ].map(r => (
            <div key={r.label} className="progress-row">
              <span className="pr-label">{r.label}</span>
              <div className="pr-bar"><div className={"pr-fill " + r.cls} style={{ width: `${r.pct}%` }} /></div>
              <span className="pr-val">{r.val} ({r.pct}%)</span>
            </div>
          ))}
        </div>

        <div className="mini-chart-card">
          <h6>📚 नामांकन स्थिति (Live Enrollment Stats)</h6>
          {[
            {
              label: "सक्रिय (In Progress)", val: stats?.activeEnrollments ?? 0,
              pct: Math.round(((stats?.activeEnrollments ?? 0) / enroll) * 100), cls: "blue"
            },
            {
              label: "पूर्ण (Completed)", val: stats?.completedEnrollments ?? 0,
              pct: Math.round(((stats?.completedEnrollments ?? 0) / enroll) * 100), cls: "green"
            },
          ].map(r => (
            <div key={r.label} className="progress-row">
              <span className="pr-label">{r.label}</span>
              <div className="pr-bar"><div className={"pr-fill " + r.cls} style={{ width: `${r.pct}%` }} /></div>
              <span className="pr-val">{r.val}</span>
            </div>
          ))}
        </div>

        <div className="mini-chart-card">
          <h6>⚡ त्वरित प्रशासनिक क्रियाएँ (Quick Actions)</h6>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            <button className="btn-admin btn-admin-primary" style={{ justifyContent: "center" }} onClick={() => onTabChange("courses")}>
              <FontAwesomeIcon icon={faPlus} /> नया पाठ्यक्रम जोड़ें
            </button>
            <button className="btn-admin btn-admin-success" style={{ justifyContent: "center" }} onClick={() => onTabChange("users")}>
              <FontAwesomeIcon icon={faUserGraduate} /> नया विद्यार्थी जोड़ें
            </button>
            <button className="btn-admin btn-admin-gold" style={{ justifyContent: "center" }} onClick={() => onTabChange("notices")}>
              <FontAwesomeIcon icon={faBullhorn} /> नवीन सूचना प्रकाशित करें
            </button>
            <button className="btn-admin btn-admin-primary" style={{ justifyContent: "center", background: "#841b3a" }} onClick={() => onTabChange("library")}>
              <FontAwesomeIcon icon={faBookOpen} /> पुस्तकालय ग्रन्थ प्रबंधित करें
            </button>
            <button className="btn-admin btn-admin-outline" style={{ justifyContent: "center" }} onClick={() => onTabChange("teachers")}>
              <FontAwesomeIcon icon={faChalkboardTeacher} /> आचार्य / शिक्षक प्रबंधन
            </button>
            <button className="btn-admin btn-admin-outline" style={{ justifyContent: "center" }} onClick={() => onTabChange("liveSessions")}>
              <FontAwesomeIcon icon={faCalendarAlt} /> लाइव कक्षाएं व समय-सारणी
            </button>
            <button className="btn-admin btn-admin-outline" style={{ justifyContent: "center" }} onClick={() => onTabChange("enrollments")}>
              <FontAwesomeIcon icon={faGraduationCap} /> नामांकन प्रबंधन देखें
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="mini-chart-row" style={{ marginTop: 20 }}>
        <div className="mini-chart-card hidee" style={{ flex: 1 }}>
          <h6>👤 हाल ही में पंजीकृत विद्यार्थी (Recent Students)</h6>
          <div className="admin-table-wrap" style={{ marginTop: 10 }}>
            <table className="admin-table">
              <thead><tr><th>विद्यार्थी</th><th>ईमेल</th><th>भूमिका</th><th>पंजीकरण</th></tr></thead>
              <tbody>
                {(stats?.recentUsers || []).map(u => (
                  <tr key={u.id}>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div className="user-thumb" style={{ width: 32, height: 32, fontSize: 16 }}>{u.avatar || "🕉️"}</div><strong>{u.name}</strong></div></td>
                    <td style={{ fontSize: 12 }}>{u.email}</td>
                    <td><span className={"role-badge " + u.role}>{u.role}</span></td>
                    <td style={{ fontSize: 11, color: "#888" }}>{fmt(u.createdAt)}</td>
                  </tr>
                ))}
                {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                  <tr><td colSpan={4} className="text-center text-muted">कोई रिकॉर्ड नहीं</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mini-chart-card hidee" style={{ flex: 1 }}>
          <h6>🎓 नवीनतम नामांकन (Recent Enrollments)</h6>
          <div className="admin-table-wrap" style={{ marginTop: 10 }}>
            <table className="admin-table">
              <thead><tr><th>विद्यार्थी</th><th>पाठ्यक्रम</th><th>श्रेणी</th><th>दिनांक</th></tr></thead>
              <tbody>
                {(stats?.recentEnrollments || []).map(e => (
                  <tr key={e.id}>
                    <td><strong>{e.user?.name || "विद्यार्थी"}</strong></td>
                    <td style={{ fontSize: 13, color: "var(--primary-color)" }}>{e.course?.title}</td>
                    <td><span className="priority-badge MEDIUM">{e.course?.category}</span></td>
                    <td style={{ fontSize: 11, color: "#888" }}>{fmt(e.enrolledAt)}</td>
                  </tr>
                ))}
                {(!stats?.recentEnrollments || stats.recentEnrollments.length === 0) && (
                  <tr><td colSpan={4} className="text-center text-muted">कोई नामांकन नहीं</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   2. COURSE MANAGEMENT (FULL CRUD)
════════════════════════════════════════════════════════ */
function CoursesSection() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_COURSE);
  const [saving, setSaving] = useState(false);
  const [alert, showAlert] = useAlert();
  const [delConfirm, setDelConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/courses?limit=100&includeDrafts=true");
      setCourses(r?.data?.courses || []);
    } catch {
      showAlert("error", "पाठ्यक्रम लोड नहीं हुए");
    }
    setLoading(false);
  }, []); // eslint-disable-line
  useEffect(() => { load(); }, [load]);

  const filtered = courses.filter(c => {
    const ms = !search || (c.title || "").toLowerCase().includes(search.toLowerCase()) || (c.titleEn || "").toLowerCase().includes(search.toLowerCase());
    return ms && (catFilter === "all" || c.category === catFilter);
  });

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const openAdd = () => { setForm(EMPTY_COURSE); setModal({ mode: "add" }); };
  const openEdit = (c) => {
    setForm({
      ...c,
      rating: String(c.rating || "4.8"),
      durationHours: String(c.durationHours || "30"),
      studentsCount: String(c.studentsCount || "0"),
      syllabus: c.syllabus || "",
      instructor: c.instructor || "आचार्य",
    });
    setModal({ mode: "edit", id: c.id });
  };

  const handleSave = async () => {
    if (!form.slug || !form.title || !form.description) {
      showAlert("error", "Slug, शीर्षक और विवरण आवश्यक हैं");
      return;
    }
    setSaving(true);
    try {
      if (modal.mode === "add") {
        await api.post("/courses", form);
        showAlert("success", "पाठ्यक्रम सफलतापूर्वक जोड़ा गया");
      } else {
        await api.put("/courses/" + modal.id, form);
        showAlert("success", "पाठ्यक्रम सफलतापूर्वक अपडेट हुआ");
      }
      setModal(null);
      load();
    } catch (e) {
      showAlert("error", e.message || "त्रुटि");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete("/courses/" + id);
      showAlert("success", "पाठ्यक्रम हटाया गया");
      setDelConfirm(null);
      load();
    } catch {
      showAlert("error", "हटाने में त्रुटि");
    }
  };

  const togglePublish = async (c) => {
    try {
      await api.put("/courses/" + c.id, { isPublished: !c.isPublished });
      showAlert("success", c.isPublished ? "पाठ्यक्रम निष्क्रिय किया गया" : "पाठ्यक्रम प्रकाशित किया गया");
      load();
    } catch {
      showAlert("error", "अपडेट विफल");
    }
  };

  return (
    <div>
      <AdminAlert alert={alert} />
      <div className="admin-section">
        <div className="admin-section-header">
          <h5><FontAwesomeIcon icon={faBook} className="section-icon" /> पाठ्यक्रम प्रबंधन ({filtered.length})</h5>
          <button className="btn-admin btn-admin-primary" onClick={openAdd}>
            <FontAwesomeIcon icon={faPlus} /> नया पाठ्यक्रम जोड़ें
          </button>
        </div>
        <div className="admin-section-body">
          <div className="filter-row">
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <FontAwesomeIcon icon={faSearch} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 13 }} />
              <input className="filter-input" style={{ paddingLeft: 34, width: "100%" }} placeholder="पाठ्यक्रम खोजें (शीर्षक, Slug)..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="all">सभी श्रेणियाँ</option>
              {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {loading ? <Spinner /> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>पाठ्यक्रम</th><th>श्रेणी</th><th>शुल्क (Fees)</th><th>अवधि</th><th>प्रवक्ता</th><th>स्थिति</th><th>क्रियाएँ</th></tr></thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <img src={c.image} alt="" className="course-thumb" onError={e => { e.target.style.display = "none"; }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{c.title}</div>
                            <div style={{ fontSize: 11, color: "#888" }}>{c.titleEn || c.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 12 }}><span className="priority-badge MEDIUM">{CATEGORY_OPTIONS.find(x => x.value === c.category)?.label || c.category}</span></td>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#27AE60" }}>{c.currentPrice}</div>
                        <div style={{ fontSize: 11, color: "#aaa", textDecoration: "line-through" }}>{c.originalPrice}</div>
                      </td>
                      <td>{c.durationHours} घंटे</td>
                      <td style={{ fontSize: 12 }}>{c.instructor || "आचार्य"}</td>
                      <td>
                        <button
                          onClick={() => togglePublish(c)}
                          title={c.isPublished ? "प्रकाशित (क्लिक करके निष्क्रिय करें)" : "अप्रकाशित (क्लिक करके प्रकाशित करें)"}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22 }}
                        >
                          <FontAwesomeIcon icon={c.isPublished ? faToggleOn : faToggleOff} style={{ color: c.isPublished ? "#27AE60" : "#aaa" }} />
                        </button>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-admin btn-admin-success btn-admin-sm" title="संपादित करें" onClick={() => openEdit(c)}><FontAwesomeIcon icon={faEdit} /></button>
                          <button className="btn-admin btn-admin-danger btn-admin-sm" title="हटाएँ" onClick={() => setDelConfirm(c)}><FontAwesomeIcon icon={faTrash} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">📚</div><p>कोई पाठ्यक्रम नहीं मिला</p></div></td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="admin-modal" style={{ maxWidth: 680 }}>
            <div className="admin-modal-header">
              <h5>🕉️ {modal.mode === "add" ? "नया पाठ्यक्रम जोड़ें (Add Course)" : "पाठ्यक्रम संपादित करें (Edit Course)"}</h5>
              <button className="admin-modal-close" onClick={() => setModal(null)}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="form-grid-2">
                <div className="admin-form-group"><label>शीर्षक *</label><input className="admin-input" value={form.title} onChange={e => setF("title", e.target.value)} placeholder="ऋग्वेद अध्ययन" /></div>
                <div className="admin-form-group"><label>English Title</label><input className="admin-input" value={form.titleEn || ""} onChange={e => setF("titleEn", e.target.value)} placeholder="Rigveda Study" /></div>
                <div className="admin-form-group"><label>Slug (अद्वितीय URL) *</label><input className="admin-input" value={form.slug} onChange={e => setF("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} placeholder="rigveda-adhyayan" /></div>
                <div className="admin-form-group"><label>श्रेणी (Category)</label>
                  <select className="admin-select" value={form.category} onChange={e => setF("category", e.target.value)}>
                    {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="admin-form-group"><label>मूल शुल्क (Original Price)</label><input className="admin-input" value={form.originalPrice} onChange={e => setF("originalPrice", e.target.value)} /></div>
                <div className="admin-form-group"><label>रियायती शुल्क (Current Price)</label><input className="admin-input" value={form.currentPrice} onChange={e => setF("currentPrice", e.target.value)} /></div>
                <div className="admin-form-group"><label>अवधि (घंटे)</label><input className="admin-input" type="number" value={form.durationHours} onChange={e => setF("durationHours", e.target.value)} /></div>
                <div className="admin-form-group"><label>प्रवक्ता / आचार्य (Instructor)</label><input className="admin-input" value={form.instructor || ""} onChange={e => setF("instructor", e.target.value)} placeholder="आचार्य श्री" /></div>
                <div className="admin-form-group"><label>रेटिंग (0–5)</label><input className="admin-input" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setF("rating", e.target.value)} /></div>
                <div className="admin-form-group"><label>इमेज पथ (Image URL / Path)</label><input className="admin-input" value={form.image} onChange={e => setF("image", e.target.value)} /></div>
                <div className="admin-form-group"><label>बैज प्रकार (Badge)</label>
                  <select className="admin-select" value={form.badgeType || ""} onChange={e => setF("badgeType", e.target.value)}>
                    <option value="">कोई नहीं</option>
                    <option value="popular">लोकप्रिय (popular)</option>
                    <option value="new">नया (new)</option>
                    <option value="trending">ट्रेंडिंग (trending)</option>
                    <option value="special">विशेष (special)</option>
                  </select>
                </div>
                <div className="admin-form-group" style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 8 }}><input type="checkbox" checked={form.hasCertificate} onChange={e => setF("hasCertificate", e.target.checked)} /> प्रमाणपत्र उपलब्ध</label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 8 }}><input type="checkbox" checked={form.isPublished} onChange={e => setF("isPublished", e.target.checked)} /> लाइव प्रकाशित</label>
                </div>
              </div>
              <div className="admin-form-group"><label>संक्षिप्त विवरण (Description) *</label><textarea className="admin-input admin-textarea" rows={3} value={form.description} onChange={e => setF("description", e.target.value)} /></div>
              <div className="admin-form-group"><label>पाठ्यक्रम रूपरेखा / सिलेबस (Syllabus & Modules)</label><textarea className="admin-input admin-textarea" rows={4} value={form.syllabus || ""} onChange={e => setF("syllabus", e.target.value)} placeholder="अध्याय 1: प्रस्तावना एवं मंगलाचरण&#10;अध्याय 2: मन्त्र भाष्य एवं अन्वय..." /></div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={() => setModal(null)}>रद्द करें</button>
              <button className="btn-admin btn-admin-primary" onClick={handleSave} disabled={saving}><FontAwesomeIcon icon={faSave} /> {saving ? "सहेजा जा रहा है..." : "सहेजें (Save Course)"}</button>
            </div>
          </div>
        </div>
      )}

      {delConfirm && (
        <DeleteModal
          title="पाठ्यक्रम हटाएँ?"
          body={`क्या आप पाठ्यक्रम "${delConfirm.title}" को डेटाबेस से स्थायी रूप से हटाना चाहते हैं?`}
          onConfirm={() => handleDelete(delConfirm.id)}
          onCancel={() => setDelConfirm(null)}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   2.5 LIBRARY BOOKS MANAGEMENT (FULL CRUD)
════════════════════════════════════════════════════════ */
const EMPTY_BOOK = {
  title: "",
  titleEn: "",
  author: "",
  authorEn: "",
  category: "mainBook",
  language: "संस्कृत",
  description: "",
  descriptionEn: "",
  pages: "100",
  year: "प्राचीन काल",
  rating: "5.0",
  image: "/images/blank_book.jpg",
  pdfUrl: "",
  tags: "वेद,ग्रन्थ",
  fileSize: "25 MB",
  format: "PDF",
  isAvailable: true,
};

const LIBRARY_CATEGORY_MAP = {
  mainBook: "मूल ग्रन्थ",
  VaykhyanBook: "व्याख्यान ग्रन्थ",
  VidhwatLekh: "विद्वत् शोध पत्र",
};

function LibraryAdminSection() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_BOOK);
  const [saving, setSaving] = useState(false);
  const [alert, showAlert] = useAlert();
  const [delConfirm, setDelConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/library?limit=150&all=true");
      setBooks(r?.data?.books || []);
    } catch {
      showAlert("error", "पुस्तकालय ग्रन्थ लोड करने में विफल");
    }
    setLoading(false);
  }, []); // eslint-disable-line
  useEffect(() => { load(); }, [load]);

  const filtered = books.filter((b) => {
    const q = search.toLowerCase();
    const ms = !search ||
      (b.title || "").toLowerCase().includes(q) ||
      (b.titleEn || "").toLowerCase().includes(q) ||
      (b.author || "").toLowerCase().includes(q) ||
      (b.tags || "").toLowerCase().includes(q);
    return ms && (catFilter === "all" || b.category === catFilter);
  });

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const openAdd = () => {
    setForm(EMPTY_BOOK);
    setModal({ mode: "add" });
  };

  const openEdit = (b) => {
    setForm({
      ...b,
      pages: String(b.pages || "100"),
      rating: String(b.rating || "5.0"),
      tags: b.tags || "",
      pdfUrl: b.pdfUrl || "",
      fileSize: b.fileSize || "25 MB",
      format: b.format || "PDF",
      isAvailable: Boolean(b.isAvailable),
    });
    setModal({ mode: "edit", id: b.id });
  };

  const handleSave = async () => {
    if (!form.title || !form.author || !form.description) {
      showAlert("error", "ग्रन्थ शीर्षक, लेखक एवं विवरण आवश्यक हैं");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        pages: parseInt(form.pages, 10) || 100,
        rating: parseFloat(form.rating) || 5.0,
        image: form.image?.trim() || "/images/blank_book.jpg",
      };
      if (modal.mode === "add") {
        await api.post("/library", payload);
        showAlert("success", "नवीन ग्रन्थ सफलतापूर्वक पुस्तकालय में जोड़ा गया");
      } else {
        await api.put("/library/" + modal.id, payload);
        showAlert("success", "ग्रन्थ विवरण सफलतापूर्वक अद्यतित हुआ");
      }
      setModal(null);
      load();
      window.dispatchEvent(new CustomEvent("libraryUpdated"));
    } catch (e) {
      showAlert("error", e.message || "त्रुटि");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete("/library/" + id);
      showAlert("success", "ग्रन्थ पुस्तकालय से हटाया गया");
      setDelConfirm(null);
      load();
      window.dispatchEvent(new CustomEvent("libraryUpdated"));
    } catch {
      showAlert("error", "हटाने में त्रुटि");
    }
  };

  const toggleAvailability = async (b) => {
    try {
      if (typeof api.patch === "function") {
        await api.patch("/library/" + b.id + "/toggle");
      } else {
        await api.put("/library/" + b.id, { isAvailable: !b.isAvailable });
      }
      showAlert("success", b.isAvailable ? "ग्रन्थ को स्थगित किया गया" : "ग्रन्थ को उपलब्ध किया गया");
      load();
      window.dispatchEvent(new CustomEvent("libraryUpdated"));
    } catch (err) {
      console.warn("Patch toggle failed, falling back to PUT update:", err);
      try {
        await api.put("/library/" + b.id, { isAvailable: !b.isAvailable });
        showAlert("success", b.isAvailable ? "ग्रन्थ को स्थगित किया गया" : "ग्रन्थ को उपलब्ध किया गया");
        load();
        window.dispatchEvent(new CustomEvent("libraryUpdated"));
      } catch (e2) {
        showAlert("error", "स्थिति परिवर्तन विफल");
      }
    }
  };

  return (
    <div>
      <AdminAlert alert={alert} />

      <div className="admin-section">
        <div className="admin-section-header">
          <h5>
            <FontAwesomeIcon icon={faBookOpen} className="section-icon" />
            पुस्तकालय ग्रन्थ प्रबंधन ({filtered.length})
          </h5>
          <button className="btn-admin btn-admin-primary" onClick={openAdd}>
            <FontAwesomeIcon icon={faPlus} /> नया ग्रन्थ जोड़ें
          </button>
        </div>

        <div className="admin-section-body">
          <div className="filter-row">
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <FontAwesomeIcon
                icon={faSearch}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#aaa",
                  fontSize: 13,
                }}
              />
              <input
                className="filter-input"
                style={{ paddingLeft: 34, width: "100%" }}
                placeholder="ग्रन्थ खोजें (शीर्षक, लेखक, टैग्स)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
            >
              <option value="all">सभी श्रेणियाँ</option>
              <option value="mainBook">मूल ग्रन्थ</option>
              <option value="VaykhyanBook">व्याख्यान ग्रन्थ</option>
              <option value="VidhwatLekh">विद्वत् शोध पत्र</option>
            </select>
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ग्रन्थ विवरण</th>
                    <th>लेखक / सम्पादक</th>
                    <th>श्रेणी</th>
                    <th>भाषा / पृष्ठ</th>
                    <th>पाठक आंकड़े</th>
                    <th>उपलब्धता</th>
                    <th>क्रियाएँ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <DynamicBookCover
                            title={b.title}
                            image={b.image}
                            className="course-thumb-cover"
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "#5d0f22" }}>
                              {b.title}
                            </div>
                            <div style={{ fontSize: 11, color: "#888" }}>
                              {b.titleEn || b.year || "वैदिक ग्रन्थ"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, fontWeight: 500 }}>{b.author}</td>
                      <td>
                        <span className="priority-badge MEDIUM">
                          {LIBRARY_CATEGORY_MAP[b.category] || b.category}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>
                        <div>{b.language || "संस्कृत"}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>{b.pages ? `${b.pages} पृष्ठ` : "—"}</div>
                      </td>
                      <td style={{ fontSize: 12 }}>
                        <div style={{ color: (b.views || 0) > 0 ? "#333" : "#888" }}>
                          👁️ {(b.views || 0).toLocaleString()} दृश्य
                        </div>
                        <div style={{ color: (b.downloads || 0) > 0 ? "#27AE60" : "#888", fontWeight: (b.downloads || 0) > 0 ? 600 : 400 }}>
                          📥 {(b.downloads || 0).toLocaleString()} डाउनलोड
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => toggleAvailability(b)}
                          title={b.isAvailable ? "उपलब्ध (क्लिक करके स्थगित करें)" : "स्थगित (क्लिक करके उपलब्ध करें)"}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22 }}
                        >
                          <FontAwesomeIcon
                            icon={b.isAvailable ? faToggleOn : faToggleOff}
                            style={{ color: b.isAvailable ? "#27AE60" : "#aaa" }}
                          />
                        </button>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="btn-admin btn-admin-success btn-admin-sm"
                            title="संपादित करें"
                            onClick={() => openEdit(b)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            className="btn-admin btn-admin-danger btn-admin-sm"
                            title="हटाएँ"
                            onClick={() => setDelConfirm(b)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-state">
                          <div className="empty-icon">📖</div>
                          <p>कोई ग्रन्थ नहीं मिला</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Book Modal */}
      {modal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 680 }}>
            <div className="admin-modal-header">
              <h5>{modal.mode === "add" ? "📖 नवीन ग्रन्थ जोड़ें" : "✏️ ग्रन्थ विवरण संपादित करें"}</h5>
              <button className="admin-modal-close" onClick={() => setModal(null)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="admin-form-group">
                  <label>ग्रन्थ शीर्षक (Title) *</label>
                  <input
                    className="admin-input"
                    value={form.title}
                    onChange={(e) => setF("title", e.target.value)}
                    placeholder="उदा. ऋग्वेद संहिता"
                  />
                </div>
                <div className="admin-form-group">
                  <label>अंग्रेजी शीर्षक (Title En)</label>
                  <input
                    className="admin-input"
                    value={form.titleEn}
                    onChange={(e) => setF("titleEn", e.target.value)}
                    placeholder="उदा. Rigveda Samhita"
                  />
                </div>
                <div className="admin-form-group">
                  <label>लेखक / सम्पादक (Author) *</label>
                  <input
                    className="admin-input"
                    value={form.author}
                    onChange={(e) => setF("author", e.target.value)}
                    placeholder="उदा. महर्षि दयानन्द सरस्वती"
                  />
                </div>
                <div className="admin-form-group">
                  <label>लेखक नाम (English)</label>
                  <input
                    className="admin-input"
                    value={form.authorEn}
                    onChange={(e) => setF("authorEn", e.target.value)}
                    placeholder="उदा. Maharshi Dayanand Saraswati"
                  />
                </div>
                <div className="admin-form-group">
                  <label>श्रेणी (Category) *</label>
                  <select
                    className="admin-select"
                    value={form.category}
                    onChange={(e) => setF("category", e.target.value)}
                  >
                    <option value="mainBook">मूल ग्रन्थ (Foundational)</option>
                    <option value="VaykhyanBook">व्याख्यान ग्रन्थ (Commentary)</option>
                    <option value="VidhwatLekh">विद्वत् शोध पत्र (Research Paper)</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>भाषा (Language)</label>
                  <select
                    className="admin-select"
                    value={form.language}
                    onChange={(e) => setF("language", e.target.value)}
                  >
                    <option value="संस्कृत">संस्कृत</option>
                    <option value="हिन्दी">हिन्दी</option>
                    <option value="संस्कृत-हिन्दी">संस्कृत-हिन्दी</option>
                    <option value="अन्य">अन्य</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>पृष्ठ संख्या (Pages)</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={form.pages}
                    onChange={(e) => setF("pages", e.target.value)}
                    placeholder="उदा. 450"
                  />
                </div>
                <div className="admin-form-group">
                  <label>रचना काल / प्रकाशन वर्ष</label>
                  <input
                    className="admin-input"
                    value={form.year}
                    onChange={(e) => setF("year", e.target.value)}
                    placeholder="उदा. प्राचीन काल या 1875 ई."
                  />
                </div>
                <div className="admin-form-group">
                  <label>रेटिंग (1.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    className="admin-input"
                    value={form.rating}
                    onChange={(e) => setF("rating", e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>प्रारूप (Format) एवं आकार</label>
                  <input
                    className="admin-input"
                    value={form.fileSize}
                    onChange={(e) => setF("fileSize", e.target.value)}
                    placeholder="उदा. 25 MB"
                  />
                </div>
                <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>PDF / ग्रन्थ डाउनलोड लिंक (URL)</label>
                  <input
                    className="admin-input"
                    value={form.pdfUrl}
                    onChange={(e) => setF("pdfUrl", e.target.value)}
                    placeholder="https://archive.org/details/..."
                  />
                </div>
                <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>टैग्स (Comma-separated)</label>
                  <input
                    className="admin-input"
                    value={form.tags}
                    onChange={(e) => setF("tags", e.target.value)}
                    placeholder="उदा. वेद,उपनिषद्,संस्कृत,अध्ययन"
                  />
                </div>
                <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>विस्तृत विवरण एवं वैशिष्ट्य (Description) *</label>
                  <textarea
                    rows={4}
                    className="admin-textarea"
                    value={form.description}
                    onChange={(e) => setF("description", e.target.value)}
                    placeholder="ग्रन्थ की सामग्री, अध्याय एवं महत्ता का विस्तृत विवरण..."
                  />
                </div>
                <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.isAvailable}
                      onChange={(e) => setF("isAvailable", e.target.checked)}
                    />
                    <span>यह ग्रन्थ पुस्तकालय में विद्यार्थियों हेतु उपलब्ध (Live) रहे</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={() => setModal(null)}>रद्द करें</button>
              <button className="btn-admin btn-admin-primary" disabled={saving} onClick={handleSave}>
                <FontAwesomeIcon icon={faSave} /> {saving ? "सहेज रहे हैं..." : "सहेजें (Save)"}
              </button>
            </div>
          </div>
        </div>
      )}

      {delConfirm && (
        <DeleteModal
          title="ग्रन्थ हटाने की पुष्टि"
          body={`क्या आप वास्तव में "${delConfirm.title}" को पुस्तकालय से हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।`}
          onConfirm={() => handleDelete(delConfirm.id)}
          onCancel={() => setDelConfirm(null)}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   3. STUDENT & USER MANAGEMENT (FULL CRUD & INFO)
════════════════════════════════════════════════════════ */
function UsersSection() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [modal, setModal] = useState(null); // { mode: 'add' | 'edit' }
  const [form, setForm] = useState(EMPTY_STUDENT);
  const [saving, setSaving] = useState(false);
  const [alert, showAlert] = useAlert();
  const [delConfirm, setDelConfirm] = useState(null);
  const [viewUser, setViewUser] = useState(null);

  // Quick enroll modal from view profile
  const [enrollModalUser, setEnrollModalUser] = useState(null);
  const [coursesList, setCoursesList] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [enrollSaving, setEnrollSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ limit: 50 });
      if (roleFilter !== "ALL") p.set("role", roleFilter);
      if (search) p.set("search", search);
      const r = await api.get("/admin/users?" + p.toString());
      setUsers(r?.data?.users || []);
      setTotal(r?.data?.total || 0);
    } catch {
      showAlert("error", "उपयोगकर्ता लोड नहीं हुए");
    }
    setLoading(false);
  }, [search, roleFilter]); // eslint-disable-line
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  // Load courses list for enrollment picker
  useEffect(() => {
    api.get("/courses?limit=100").then(r => setCoursesList(r?.data?.courses || [])).catch(() => { });
  }, []);

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => {
    setForm(EMPTY_STUDENT);
    setModal({ mode: "add" });
  };

  const openEdit = (u) => {
    setForm({
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      role: u.role || "STUDENT",
      isVerified: Boolean(u.isVerified),
      avatar: u.avatar || "🕉️",
      fatherName: u.fatherName || "",
      dob: u.dob || "",
      education: u.education || "",
      address: u.address || "",
      city: u.city || "",
      state: u.state || "",
      pincode: u.pincode || "",
      idDocumentType: u.idDocumentType || "Aadhaar",
      idDocumentNumber: u.idDocumentNumber || "",
      academicNotes: u.academicNotes || "",
      password: "", // empty unless updating
    });
    setModal({ mode: "edit", id: u.id });
  };

  const openViewProfile = async (u) => {
    try {
      const r = await api.get("/admin/users/" + u.id);
      setViewUser(r?.data || u);
    } catch {
      setViewUser(u);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      showAlert("error", "नाम और ईमेल आवश्यक हैं");
      return;
    }
    if (modal.mode === "add" && !form.password) {
      showAlert("error", "पासवर्ड आवश्यक है");
      return;
    }

    setSaving(true);
    try {
      if (modal.mode === "add") {
        await api.post("/admin/users", form);
        showAlert("success", "नया विद्यार्थी सफलतापूर्वक जोड़ा गया");
      } else {
        await api.put("/admin/users/" + modal.id, form);
        showAlert("success", "विद्यार्थी विवरण सफलतापूर्वक अपडेट हुआ");
      }
      setModal(null);
      load();
    } catch (e) {
      showAlert("error", e.message || "त्रुटि");
    }
    setSaving(false);
  };

  const changeRole = async (id, role) => {
    try {
      await api.put("/admin/users/" + id + "/role", { role });
      showAlert("success", "भूमिका अपडेट हो गई");
      load();
    } catch {
      showAlert("error", "अपडेट विफल");
    }
  };

  const deleteUser = async (id) => {
    if (id === currentAdmin?.id) {
      showAlert("error", "आप अपना स्वयं का व्यवस्थापक (Admin) खाता नहीं हटा सकते!");
      return;
    }
    try {
      await api.delete("/admin/users/" + id);
      showAlert("success", "उपयोगकर्ता खाता हटाया गया");
      setDelConfirm(null);
      if (viewUser?.id === id) setViewUser(null);
      load();
    } catch (e) {
      showAlert("error", e.response?.data?.message || e.message || "हटाने में त्रुटि");
    }
  };

  // Direct enroll from student view
  const handleDirectEnroll = async () => {
    if (!selectedCourseId || !enrollModalUser) return;
    setEnrollSaving(true);
    try {
      await api.post(`/admin/users/${enrollModalUser.id}/enroll`, {
        courseId: selectedCourseId,
        status: "ACTIVE",
        progressPercent: 0,
      });
      showAlert("success", "पाठ्यक्रम में नामांकन सफल रहा!");
      setEnrollModalUser(null);
      setSelectedCourseId("");
      openViewProfile(enrollModalUser); // refresh details
      load();
    } catch (e) {
      showAlert("error", e.message || "नामांकन विफल");
    }
    setEnrollSaving(false);
  };

  return (
    <div>
      <AdminAlert alert={alert} />
      <div className="admin-section">
        <div className="admin-section-header">
          <h5><FontAwesomeIcon icon={faUserGraduate} className="section-icon" /> विद्यार्थी एवं प्रयोक्ता प्रबंधन ({total})</h5>
          <button className="btn-admin btn-admin-primary" onClick={openAdd}>
            <FontAwesomeIcon icon={faPlus} /> नया विद्यार्थी जोड़ें (Add Student)
          </button>
        </div>
        <div className="admin-section-body">
          <div className="filter-row">
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <FontAwesomeIcon icon={faSearch} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 13 }} />
              <input className="filter-input" style={{ paddingLeft: 34, width: "100%" }} placeholder="नाम, ईमेल, फ़ोन, शहर, योग्यता खोजें..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="ALL">सभी भूमिकाएँ</option>
              <option value="STUDENT">विद्यार्थी (Students)</option>
              <option value="TEACHER">शिक्षक (Teachers)</option>
              <option value="ADMIN">व्यवस्थापक (Admins)</option>
            </select>
          </div>

          {loading ? <Spinner /> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>विद्यार्थी / नाम</th><th>संपर्क विवरण</th><th>भूमिका</th><th>योग्यता / शहर</th><th>नामांकन</th><th>स्थिति</th><th>क्रियाएँ</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="user-thumb">{u.avatar || "🕉️"}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                              {u.name}
                              {u.id === currentAdmin?.id && (
                                <span style={{ fontSize: 10, background: "#C73659", color: "#fff", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                                  स्वयं (You)
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: "#888" }}>ID: #{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13 }}>{u.email}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>{u.phone || "—"}</div>
                      </td>
                      <td>
                        <select
                          className="role-select-inline"
                          value={u.role}
                          disabled={u.id === currentAdmin?.id}
                          title={u.id === currentAdmin?.id ? "आप अपनी स्वयं की व्यवस्थापक भूमिका नहीं बदल सकते" : "भूमिका बदलें"}
                          style={u.id === currentAdmin?.id ? { opacity: 0.75, cursor: "not-allowed" } : {}}
                          onChange={e => changeRole(u.id, e.target.value)}
                        >
                          <option value="STUDENT">STUDENT</option>
                          <option value="TEACHER">TEACHER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td style={{ fontSize: 12 }}>
                        <div>{u.education || "—"}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>{u.city || "—"}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: "var(--primary-color)", fontSize: 15 }}>
                          {u._count?.enrollments ?? 0}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: u.isVerified ? "#27AE60" : "#aaa", fontSize: 13 }}>
                          <FontAwesomeIcon icon={u.isVerified ? faCheckCircle : faClock} /> {u.isVerified ? "सत्यापित" : "लंबित"}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-admin btn-admin-primary btn-admin-sm" title="प्रोफाइल व नामांकन देखें" onClick={() => openViewProfile(u)}><FontAwesomeIcon icon={faEye} /></button>
                          <button className="btn-admin btn-admin-success btn-admin-sm" title="जानकारी संपादित करें" onClick={() => openEdit(u)}><FontAwesomeIcon icon={faEdit} /></button>
                          <button
                            className="btn-admin btn-admin-danger btn-admin-sm"
                            title={u.id === currentAdmin?.id ? "आप अपना स्वयं का व्यवस्थापक (Admin) खाता नहीं हटा सकते" : "हटाएँ"}
                            disabled={u.id === currentAdmin?.id}
                            style={u.id === currentAdmin?.id ? { opacity: 0.35, cursor: "not-allowed", pointerEvents: "all" } : {}}
                            onClick={() => {
                              if (u.id === currentAdmin?.id) {
                                showAlert("error", "आप अपना स्वयं का व्यवस्थापक खाता नहीं हटा सकते!");
                                return;
                              }
                              setDelConfirm(u);
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">👤</div><p>कोई विद्यार्थी नहीं मिला</p></div></td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {modal && (
        <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="admin-modal" style={{ maxWidth: 660 }}>
            <div className="admin-modal-header">
              <h5>👤 {modal.mode === "add" ? "नया विद्यार्थी जोड़ें (Register Student)" : "विद्यार्थी विवरण संपादित करें (Edit Profile)"}</h5>
              <button className="admin-modal-close" onClick={() => setModal(null)}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <div className="admin-modal-body">
              <h6 style={{ color: "var(--primary-color)", fontWeight: 700, marginBottom: 12 }}>1. व्यक्तिगत एवं संपर्क जानकारी</h6>
              <div className="form-grid-2">
                <div className="admin-form-group"><label>पूर्ण नाम *</label><input className="admin-input" value={form.name} onChange={e => setF("name", e.target.value)} placeholder="आर्य विद्यार्थी" /></div>
                <div className="admin-form-group"><label>ईमेल पता *</label><input className="admin-input" type="email" value={form.email} onChange={e => setF("email", e.target.value)} placeholder="student@example.com" /></div>
                <div className="admin-form-group"><label>फ़ोन नंबर</label><input className="admin-input" value={form.phone} onChange={e => setF("phone", e.target.value)} placeholder="+91 9876543210" /></div>
                <div className="admin-form-group">
                  <label>{modal.mode === "add" ? "पासवर्ड *" : "नया पासवर्ड (यदि बदलना हो)"}</label>
                  <input className="admin-input" type="password" value={form.password} onChange={e => setF("password", e.target.value)} placeholder="कम से कम 6 अक्षर" />
                </div>
                <div className="admin-form-group"><label>भूमिका (Role)</label>
                  <select className="admin-select" value={form.role} onChange={e => setF("role", e.target.value)}>
                    <option value="STUDENT">विद्यार्थी (STUDENT)</option>
                    <option value="TEACHER">शिक्षक (TEACHER)</option>
                    <option value="ADMIN">व्यवस्थापक (ADMIN)</option>
                  </select>
                </div>
                <div className="admin-form-group" style={{ display: "flex", alignItems: "flex-end" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 10 }}>
                    <input type="checkbox" checked={form.isVerified} onChange={e => setF("isVerified", e.target.checked)} /> खाता सत्यापित (Verified)
                  </label>
                </div>
              </div>

              <h6 style={{ color: "var(--primary-color)", fontWeight: 700, marginTop: 16, marginBottom: 12 }}>2. शैक्षणिक एवं पारिवारिक विवरण</h6>
              <div className="form-grid-2">
                <div className="admin-form-group"><label>पिता / अभिभावक का नाम</label><input className="admin-input" value={form.fatherName} onChange={e => setF("fatherName", e.target.value)} /></div>
                <div className="admin-form-group"><label>जन्म तिथि (DOB)</label><input className="admin-input" type="date" value={form.dob} onChange={e => setF("dob", e.target.value)} /></div>
                <div className="admin-form-group"><label>उच्चतम शैक्षणिक योग्यता</label><input className="admin-input" value={form.education} onChange={e => setF("education", e.target.value)} placeholder="शास्त्री / आचार्य / स्नातक" /></div>
                <div className="admin-form-group"><label>शहर (City)</label><input className="admin-input" value={form.city} onChange={e => setF("city", e.target.value)} /></div>
                <div className="admin-form-group"><label>राज्य (State)</label><input className="admin-input" value={form.state} onChange={e => setF("state", e.target.value)} /></div>
                <div className="admin-form-group"><label>पिनकोड (Pincode)</label><input className="admin-input" value={form.pincode} onChange={e => setF("pincode", e.target.value)} /></div>
              </div>
              <div className="admin-form-group"><label>स्थायी पता (Postal Address)</label><textarea className="admin-input admin-textarea" rows={2} value={form.address} onChange={e => setF("address", e.target.value)} /></div>

              <h6 style={{ color: "var(--primary-color)", fontWeight: 700, marginTop: 16, marginBottom: 12 }}>3. पहचान दस्तावेज़ एवं प्रशासनिक टिप्पणी</h6>
              <div className="form-grid-2">
                <div className="admin-form-group"><label>दस्तावेज़ प्रकार</label>
                  <select className="admin-select" value={form.idDocumentType} onChange={e => setF("idDocumentType", e.target.value)}>
                    <option value="Aadhaar">आधार कार्ड (Aadhaar)</option>
                    <option value="Voter ID">मतदाता पहचान पत्र (Voter ID)</option>
                    <option value="College ID">विद्यार्थी पहचान पत्र (College ID)</option>
                    <option value="Passport">पासपोर्ट (Passport)</option>
                  </select>
                </div>
                <div className="admin-form-group"><label>दस्तावेज़ क्रमांक (ID Number)</label><input className="admin-input" value={form.idDocumentNumber} onChange={e => setF("idDocumentNumber", e.target.value)} placeholder="XXXX-XXXX-XXXX" /></div>
              </div>
              <div className="admin-form-group"><label>प्रशासनिक / शैक्षणिक टिप्पणी (Notes)</label><textarea className="admin-input admin-textarea" rows={2} value={form.academicNotes} onChange={e => setF("academicNotes", e.target.value)} placeholder="विशेष योग्यता, छात्रवृत्ति, या अन्य विवरण..." /></div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={() => setModal(null)}>रद्द करें</button>
              <button className="btn-admin btn-admin-primary" onClick={handleSave} disabled={saving}><FontAwesomeIcon icon={faSave} /> {saving ? "सहेजा जा रहा है..." : "सहेजें (Save)"}</button>
            </div>
          </div>
        </div>
      )}

      {/* View Student Full Profile Modal */}
      {viewUser && (
        <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setViewUser(null); }}>
          <div className="admin-modal" style={{ maxWidth: 640 }}>
            <div className="admin-modal-header">
              <h5>👤 विद्यार्थी संपूर्ण प्रोफ़ाइल (Student Full Profile)</h5>
              <button className="admin-modal-close" onClick={() => setViewUser(null)}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <div className="admin-modal-body">
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 56 }}>{viewUser.avatar || "🕉️"}</div>
                <h4 style={{ margin: "8px 0 4px", color: "#2E2E2E", fontWeight: 700 }}>{viewUser.name}</h4>
                <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                  <span className={"role-badge " + viewUser.role}>{viewUser.role}</span>
                  <span style={{ fontSize: 13, color: viewUser.isVerified ? "#27AE60" : "#E67E22", fontWeight: 600 }}>
                    {viewUser.isVerified ? "✅ सत्यापित खाता" : "⏳ असत्यापित"}
                  </span>
                </div>
              </div>

              <div className="form-grid-2" style={{ fontSize: 13, background: "#fcf8f2", padding: 16, borderRadius: 10, marginBottom: 16 }}>
                <div><strong>ईमेल:</strong> {viewUser.email}</div>
                <div><strong>फ़ोन:</strong> {viewUser.phone || "—"}</div>
                <div><strong>पिता का नाम:</strong> {viewUser.fatherName || "—"}</div>
                <div><strong>जन्म तिथि:</strong> {viewUser.dob || "—"}</div>
                <div><strong>योग्यता:</strong> {viewUser.education || "—"}</div>
                <div><strong>शहर / राज्य:</strong> {viewUser.city ? `${viewUser.city}, ${viewUser.state || ""}` : "—"}</div>
                <div><strong>पहचान पत्र:</strong> {viewUser.idDocumentType ? `${viewUser.idDocumentType}: ${viewUser.idDocumentNumber || "—"}` : "—"}</div>
                <div><strong>पंजीकरण तिथि:</strong> {fmt(viewUser.createdAt)}</div>
              </div>

              {viewUser.academicNotes && (
                <div style={{ background: "#f5ede0", padding: 12, borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                  <strong>प्रशासनिक टिप्पणी:</strong> {viewUser.academicNotes}
                </div>
              )}

              {/* Enrolled Courses Section */}
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <h6 style={{ fontWeight: 700, margin: 0, color: "var(--primary-color)" }}>
                    <FontAwesomeIcon icon={faGraduationCap} /> नामांकित पाठ्यक्रम ({viewUser.enrollments?.length || 0})
                  </h6>
                  <button
                    className="btn-admin btn-admin-primary btn-admin-sm"
                    onClick={() => setEnrollModalUser(viewUser)}
                  >
                    <FontAwesomeIcon icon={faPlus} /> नवीन नामांकन करें
                  </button>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table" style={{ fontSize: 12 }}>
                    <thead><tr><th>पाठ्यक्रम</th><th>प्रगति</th><th>स्थिति</th><th>तिथि</th></tr></thead>
                    <tbody>
                      {(viewUser.enrollments || []).map(en => (
                        <tr key={en.id}>
                          <td><strong>{en.course?.title}</strong></td>
                          <td style={{ width: 140 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div className="pr-bar" style={{ height: 6, flex: 1 }}>
                                <div className="pr-fill green" style={{ width: `${en.progressPercent}%` }} />
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700 }}>{en.progressPercent}%</span>
                            </div>
                          </td>
                          <td><span className={"status-badge " + en.status}>{en.status}</span></td>
                          <td style={{ fontSize: 11, color: "#888" }}>{fmt(en.enrolledAt)}</td>
                        </tr>
                      ))}
                      {(!viewUser.enrollments || viewUser.enrollments.length === 0) && (
                        <tr><td colSpan={4} className="text-center text-muted">कोई सक्रिय नामांकन नहीं</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-admin btn-admin-success" onClick={() => { const u = viewUser; setViewUser(null); openEdit(u); }}>
                <FontAwesomeIcon icon={faEdit} /> जानकारी संपादित करें
              </button>
              <button className="btn-admin btn-admin-outline" onClick={() => setViewUser(null)}>बंद करें</button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Enroll Modal */}
      {enrollModalUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 440 }}>
            <div className="admin-modal-header">
              <h5>🎓 पाठ्यक्रम में नामांकन करें</h5>
              <button className="admin-modal-close" onClick={() => setEnrollModalUser(null)}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <div className="admin-modal-body">
              <p>विद्यार्थी: <strong>{enrollModalUser.name}</strong> ({enrollModalUser.email})</p>
              <div className="admin-form-group">
                <label>पाठ्यक्रम चुनें *</label>
                <select className="admin-select" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}>
                  <option value="">-- पाठ्यक्रम चुनें --</option>
                  {coursesList.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.category}) - {c.currentPrice}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={() => setEnrollModalUser(null)}>रद्द करें</button>
              <button className="btn-admin btn-admin-primary" onClick={handleDirectEnroll} disabled={!selectedCourseId || enrollSaving}>
                {enrollSaving ? "नामांकित हो रहा है..." : "नामांकन करें"}
              </button>
            </div>
          </div>
        </div>
      )}

      {delConfirm && (
        <DeleteModal
          title="विद्यार्थी खाता हटाएँ?"
          body={`क्या आप विद्यार्थी "${delConfirm.name}" का खाता और उनके सभी नामांकन रिकॉर्ड स्थायी रूप से हटाना चाहते हैं?`}
          onConfirm={() => deleteUser(delConfirm.id)}
          onCancel={() => setDelConfirm(null)}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   3.5 TEACHERS & ACHARYAS MANAGEMENT (FULL CRUD & DOSSIER)
════════════════════════════════════════════════════════ */
function TeachersSection() {
  const { user: currentAdmin } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_TEACHER);
  const [saving, setSaving] = useState(false);
  const [alert, showAlert] = useAlert();
  const [delConfirm, setDelConfirm] = useState(null);
  const [viewTeacher, setViewTeacher] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ limit: 50, role: "TEACHER" });
      if (search) p.set("search", search);
      const r = await api.get("/admin/users?" + p.toString());
      setTeachers(r?.data?.users || []);
      setTotal(r?.data?.total || 0);
    } catch {
      showAlert("error", "आचार्य सूची लोड नहीं हुई");
    }
    setLoading(false);
  }, [search]); // eslint-disable-line

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  const openAdd = () => {
    setForm(EMPTY_TEACHER);
    setModal({ mode: "add" });
  };

  const openEdit = (t) => {
    setForm({
      name: t.name || "",
      email: t.email || "",
      phone: t.phone || "",
      role: "TEACHER",
      isVerified: Boolean(t.isVerified),
      avatar: t.avatar || "🧘‍♂️",
      fatherName: t.fatherName || "",
      dob: t.dob || "",
      education: t.education || "आचार्य - सम्पूर्णानन्द संस्कृत विश्वविद्यालय",
      specialization: t.idDocumentNumber || "ऋग्वेद, सांख्य दर्शन, पाणिनीय व्याकरण",
      address: t.address || "",
      city: t.city || "",
      state: t.state || "",
      pincode: t.pincode || "",
      idDocumentType: t.idDocumentType || "Aadhaar",
      idDocumentNumber: t.idDocumentNumber || "",
      academicNotes: t.academicNotes || "वेदाचार्य एवं वरिष्ठ आर्ष व्याख्याता",
      password: "",
    });
    setModal({ mode: "edit", id: t.id });
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      showAlert("error", "आचार्य का नाम और ईमेल आवश्यक हैं");
      return;
    }
    if (modal.mode === "add" && !form.password) {
      showAlert("error", "पासवर्ड आवश्यक है");
      return;
    }

    setSaving(true);
    try {
      if (modal.mode === "add") {
        await api.post("/admin/users", { ...form, role: "TEACHER" });
        showAlert("success", "नवीन आचार्य खाता सफलतापूर्वक बनाया गया");
      } else {
        await api.put(`/admin/users/${modal.id}`, form);
        showAlert("success", "आचार्य विवरण सफलतापूर्वक अपडेट किया गया");
      }
      setModal(null);
      load();
    } catch (e) {
      showAlert("error", e.message || "सहेजने में विफल");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      showAlert("success", "आचार्य खाता सफलतापूर्वक हटाया गया");
      setDelConfirm(null);
      load();
    } catch {
      showAlert("error", "हटाने में त्रुटि");
    }
  };

  const handlePromoteRole = async (t, newRole) => {
    try {
      await api.put(`/admin/users/${t.id}/role`, { role: newRole });
      showAlert("success", `भूमिका परिवर्तित की गई: ${newRole}`);
      load();
    } catch (e) {
      showAlert("error", e.message || "भूमिका परिवर्तन विफल");
    }
  };

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <AdminAlert alert={alert} />

      <div className="admin-section">
        <div className="admin-section-header">
          <h5><FontAwesomeIcon icon={faChalkboardTeacher} className="section-icon" /> आचार्य एवं शिक्षक प्रबंधन ({total})</h5>
          <button className="btn-admin btn-admin-gold" onClick={openAdd}>
            <FontAwesomeIcon icon={faPlus} /> नवीन आचार्य जोड़ें (Add Acharya)
          </button>
        </div>

        <div className="admin-section-body">
          <div className="filter-row">
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <FontAwesomeIcon icon={faSearch} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 13 }} />
              <input
                className="filter-input"
                style={{ paddingLeft: 34, width: "100%" }}
                placeholder="आचार्य का नाम, ईमेल, उपाधि या विषय खोजें..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? <Spinner /> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>आचार्य (Name & Profile)</th>
                    <th>पदवी एवं उपाधि</th>
                    <th>संपर्क (Email & Phone)</th>
                    <th>विशेषज्ञता / विषय</th>
                    <th>भूमिका (Role)</th>
                    <th>क्रियाएँ</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map(t => (
                    <tr key={t.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="user-thumb" style={{ fontSize: 20, background: "#fef3c7" }}>
                            {t.avatar || "🧘‍♂️"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                            <div style={{ fontSize: 11, color: "#888" }}>पंजीकरण: {fmt(t.createdAt)}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#78172c" }}>
                          {t.academicNotes || "वेदाचार्य"}
                        </div>
                        <div style={{ fontSize: 11, color: "#666" }}>{t.education || "आचार्य - संस्कृत विश्वविद्यालय"}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12 }}>{t.email}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>{t.phone || "—"}</div>
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {t.specialization || t.idDocumentNumber || "वैदिक वाङ्मय एवं दर्शन"}
                      </td>
                      <td>
                        <select
                          className="role-select-inline"
                          value={t.role}
                          onChange={e => handlePromoteRole(t, e.target.value)}
                        >
                          <option value="TEACHER">TEACHER (आचार्य)</option>
                          <option value="ADMIN">ADMIN (व्यवस्थापक)</option>
                          <option value="STUDENT">STUDENT (शिक्षार्थी)</option>
                        </select>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="btn-admin btn-admin-gold btn-admin-sm"
                            title="आचार्य परिचय पत्र (Dossier)"
                            onClick={() => setViewTeacher(t)}
                          >
                            <FontAwesomeIcon icon={faIdCard} />
                          </button>
                          <button
                            className="btn-admin btn-admin-success btn-admin-sm"
                            title="संपादित करें"
                            onClick={() => openEdit(t)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            className="btn-admin btn-admin-danger btn-admin-sm"
                            title={t.id === currentAdmin?.id ? "आप अपना स्वयं का खाता नहीं हटा सकते" : "हटाएँ"}
                            disabled={t.id === currentAdmin?.id}
                            style={t.id === currentAdmin?.id ? { opacity: 0.35, cursor: "not-allowed", pointerEvents: "all" } : {}}
                            onClick={() => {
                              if (t.id === currentAdmin?.id) {
                                showAlert("error", "आप अपना स्वयं का खाता नहीं हटा सकते!");
                                return;
                              }
                              setDelConfirm(t);
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {teachers.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">
                          <div className="empty-icon">🧘‍♂️</div>
                          <p>कोई आचार्य / शिक्षक नहीं मिला। 'नवीन आचार्य जोड़ें' बटन से नया आचार्य जोड़ें।</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="admin-modal" style={{ maxWidth: 650 }}>
            <div className="admin-modal-header">
              <h5>🧘‍♂️ {modal.mode === "add" ? "नवीन आचार्य जोड़ें (Add Acharya)" : "आचार्य विवरण संपादित करें (Edit Acharya)"}</h5>
              <button className="admin-modal-close" onClick={() => setModal(null)}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="form-grid-2">
                <div className="admin-form-group">
                  <label>आचार्य का पूरा नाम *</label>
                  <input className="admin-input" value={form.name} onChange={e => setF("name", e.target.value)} placeholder="जैसे: आचार्य सत्यपाल शास्त्री" />
                </div>
                <div className="admin-form-group">
                  <label>ईमेल (Email) *</label>
                  <input className="admin-input" type="email" value={form.email} onChange={e => setF("email", e.target.value)} placeholder="acharya@aryapathshala.in" />
                </div>
                <div className="admin-form-group">
                  <label>{modal.mode === "add" ? "पासवर्ड *" : "नया पासवर्ड (परिवर्तन के लिए)"}</label>
                  <input className="admin-input" type="password" value={form.password} onChange={e => setF("password", e.target.value)} placeholder="न्यूनतम 6 अक्षर" />
                </div>
                <div className="admin-form-group">
                  <label>मोबाइल / WhatsApp नंबर</label>
                  <input className="admin-input" value={form.phone} onChange={e => setF("phone", e.target.value)} placeholder="+91 98765 43210" />
                </div>
                <div className="admin-form-group">
                  <label>पदवी / आचार्य सम्मान (Title)</label>
                  <input className="admin-input" value={form.academicNotes} onChange={e => setF("academicNotes", e.target.value)} placeholder="वेदाचार्य एवं दर्शन प्रवक्ता" />
                </div>
                <div className="admin-form-group">
                  <label>शैक्षणिक उपाधि (Qualification)</label>
                  <input className="admin-input" value={form.education} onChange={e => setF("education", e.target.value)} placeholder="आचार्य - सम्पूर्णानन्द संस्कृत विश्वविद्यालय" />
                </div>
                <div className="admin-form-group">
                  <label>मुख्य विशेषज्ञता / विषय (Specialization)</label>
                  <input className="admin-input" value={form.specialization} onChange={e => setF("specialization", e.target.value)} placeholder="ऋग्वेद, सांख्य दर्शन, पाणिनीय व्याकरण" />
                </div>
                <div className="admin-form-group">
                  <label>अवतार प्रतीक (Avatar)</label>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 4 }}>
                    {["🧘‍♂️", "🕉️", "📜", "🏛️", "🪔", "🚩"].map(sym => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => setF("avatar", sym)}
                        style={{
                          fontSize: 22,
                          padding: "4px 8px",
                          borderRadius: 8,
                          border: form.avatar === sym ? "2px solid #C73659" : "1px solid #ddd",
                          background: form.avatar === sym ? "#fdeaa8" : "#fff",
                          cursor: "pointer"
                        }}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="admin-form-group">
                <label>निवास स्थान / गुरुकुल पता (Address & City)</label>
                <input className="admin-input" value={form.address} onChange={e => setF("address", e.target.value)} placeholder="गुरुकुल प्रभात आश्रम, मेरठ, उत्तर प्रदेश" />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={() => setModal(null)}>रद्द करें</button>
              <button className="btn-admin btn-admin-primary" onClick={handleSave} disabled={saving}>
                <FontAwesomeIcon icon={faSave} /> {saving ? "सहेजा जा रहा है..." : "आचार्य विवरण सहेजें"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewTeacher && (
        <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setViewTeacher(null); }}>
          <div className="admin-modal" style={{ maxWidth: 540 }}>
            <div className="admin-modal-header">
              <h5>🪪 आचार्य परिचय पत्र (Acharya Identity Dossier)</h5>
              <button className="admin-modal-close" onClick={() => setViewTeacher(null)}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <div className="admin-modal-body">
              <div style={{ textAlign: "center", padding: "16px 0", borderBottom: "1px solid #eee" }}>
                <div style={{ width: 80, height: 80, fontSize: 40, margin: "0 auto 12px", background: "linear-gradient(135deg, #e67e22, #f39c12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #fff", boxShadow: "0 4px 14px rgba(230, 126, 34, 0.3)" }}>
                  {viewTeacher.avatar || "🧘‍♂️"}
                </div>
                <h4 style={{ fontWeight: 800, color: "#6b1426", margin: "0 0 4px" }}>{viewTeacher.name}</h4>
                <div style={{ color: "#c25e00", fontWeight: 700, fontSize: 14 }}>{viewTeacher.academicNotes || "वेदाचार्य"}</div>
                <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>आर्य पाठशाला — आर्ष विद्यापीठ संकाय</div>
              </div>

              <div style={{ marginTop: 16 }}>
                <table style={{ width: "100%", fontSize: 13 }}>
                  <tbody>
                    <tr><td style={{ padding: "6px 0", color: "#888", width: "40%" }}>ईमेल:</td><td style={{ fontWeight: 600 }}>{viewTeacher.email}</td></tr>
                    <tr><td style={{ padding: "6px 0", color: "#888" }}>मोबाइल:</td><td style={{ fontWeight: 600 }}>{viewTeacher.phone || "—"}</td></tr>
                    <tr><td style={{ padding: "6px 0", color: "#888" }}>शैक्षणिक योग्यता:</td><td style={{ fontWeight: 600 }}>{viewTeacher.education || "आचार्य - सम्पूर्णानन्द संस्कृत विश्वविद्यालय"}</td></tr>
                    <tr><td style={{ padding: "6px 0", color: "#888" }}>विशेषज्ञता:</td><td style={{ fontWeight: 600 }}>{viewTeacher.specialization || viewTeacher.idDocumentNumber || "वैदिक साहित्य एवं दर्शन"}</td></tr>
                    <tr><td style={{ padding: "6px 0", color: "#888" }}>पंजीकरण तिथि:</td><td style={{ fontWeight: 600 }}>{fmt(viewTeacher.createdAt)}</td></tr>
                    <tr><td style={{ padding: "6px 0", color: "#888" }}>पता / गुरुकुल:</td><td style={{ fontWeight: 600 }}>{viewTeacher.address || viewTeacher.city || "भारत"}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={() => setViewTeacher(null)}>बंद करें</button>
            </div>
          </div>
        </div>
      )}

      {delConfirm && (
        <DeleteModal
          title="आचार्य खाता हटाएँ?"
          body={`क्या आप आचार्य "${delConfirm.name}" का खाता हटाना चाहते हैं?`}
          onConfirm={() => handleDelete(delConfirm.id)}
          onCancel={() => setDelConfirm(null)}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   3.6 LIVE SESSIONS & CLASS SCHEDULE (FULL CRUD & SYNC)
════════════════════════════════════════════════════════ */
function LiveSessionsSection() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    title: "",
    courseTitle: "ऋग्वेद संहिता अध्ययन",
    instructor: "आचार्य सत्यपाल शास्त्री",
    day: "सोमवार एवं गुरुवार",
    time: "प्रातः ०७:०० - ०८:००",
    meetUrl: "https://meet.google.com/new",
    status: "आगामी",
  });
  const [alert, showAlert] = useAlert();
  const [delConfirm, setDelConfirm] = useState(null);
  const [coursesList, setCoursesList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/live-sessions");
      setSessions(r?.data || []);
    } catch {
      showAlert("error", "लाइव सत्र लोड नहीं हुए");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    loadSessions();
    const handleSync = () => loadSessions();
    window.addEventListener("scheduleUpdated", handleSync);
    return () => window.removeEventListener("scheduleUpdated", handleSync);
  }, [loadSessions]);

  useEffect(() => {
    api.get("/courses?limit=50").then(r => setCoursesList(r?.data?.courses || [])).catch(() => { });
    api.get("/admin/users?role=TEACHER&limit=50").then(r => setTeachersList(r?.data?.users || [])).catch(() => { });
  }, []);

  const openAdd = () => {
    setForm({
      title: "",
      courseTitle: coursesList[0]?.title || "ऋग्वेद संहिता अध्ययन",
      instructor: teachersList[0]?.name || "आचार्य सत्यपाल शास्त्री",
      day: "सोमवार एवं गुरुवार",
      time: "प्रातः ०७:०० - ०८:००",
      meetUrl: "https://meet.google.com/new",
      status: "आगामी",
    });
    setModal({ mode: "add" });
  };

  const openEdit = (s) => {
    setForm({ ...s });
    setModal({ mode: "edit", id: s.id });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.courseTitle) {
      showAlert("error", "सत्र शीर्षक एवं पाठ्यक्रम आवश्यक हैं");
      return;
    }

    try {
      if (modal.mode === "add") {
        await api.post("/live-sessions", form);
        showAlert("success", "नवीन लाइव व्याख्यान सत्र निर्धारित हो गया");
      } else {
        await api.put("/live-sessions/" + modal.id, form);
        showAlert("success", "सत्र समय-सारणी अद्यतन हो गई");
      }
      setModal(null);
      loadSessions();
      window.dispatchEvent(new CustomEvent("scheduleUpdated"));
    } catch (err) {
      showAlert("error", "सत्र सुरक्षित करने में त्रुटि: " + (err.message || "त्रुटि"));
    }
  };

  const toggleStatus = async (session, newStatus) => {
    try {
      await api.put("/live-sessions/" + session.id, { status: newStatus });
      showAlert("success", `सत्र स्थिति: ${newStatus}`);
      loadSessions();
      window.dispatchEvent(new CustomEvent("scheduleUpdated"));
    } catch {
      showAlert("error", "स्थिति परिवर्तन विफल");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete("/live-sessions/" + id);
      showAlert("success", "लाइव सत्र हटा दिया गया");
      setDelConfirm(null);
      loadSessions();
      window.dispatchEvent(new CustomEvent("scheduleUpdated"));
    } catch {
      showAlert("error", "हटाने में त्रुटि");
    }
  };

  const filtered = sessions.filter(s => {
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.courseTitle.toLowerCase().includes(search.toLowerCase()) || (s.instructor || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <AdminAlert alert={alert} />

      <div className="admin-section">
        <div className="admin-section-header">
          <h5><FontAwesomeIcon icon={faCalendarAlt} className="section-icon" /> लाइव कक्षाएं एवं समय-सारणी प्रबंधन ({filtered.length})</h5>
          <button className="btn-admin btn-admin-primary" onClick={openAdd}>
            <FontAwesomeIcon icon={faPlus} /> नवीन सत्र निर्धारित करें (Schedule Class)
          </button>
        </div>

        <div className="admin-section-body">
          <div className="filter-row">
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <FontAwesomeIcon icon={faSearch} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 13 }} />
              <input
                className="filter-input"
                style={{ paddingLeft: 34, width: "100%" }}
                placeholder="सत्र विषय, पाठ्यक्रम या आचार्य का नाम खोजें..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="ALL">सभी सत्र (All Sessions)</option>
              <option value="आगामी">आगामी (Upcoming)</option>
              <option value="लाइव">🔴 लाइव (Live Now)</option>
              <option value="सम्पन्न">सम्पन्न (Completed)</option>
            </select>
          </div>

          {loading ? <Spinner /> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>सत्र विषय (Topic)</th>
                    <th>सम्बद्ध पाठ्यक्रम</th>
                    <th>प्रवक्ता / आचार्य</th>
                    <th>दिन एवं समय</th>
                    <th>स्थिति</th>
                    <th>लाइव लिंक</th>
                    <th>क्रियाएँ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: "#2b2520" }}>
                          {s.title}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--primary-color)" }}>
                          {s.courseTitle}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12, color: "#6b1426", fontWeight: 600 }}>
                          {s.instructor || "आचार्य"}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{s.day}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>{s.time}</div>
                      </td>
                      <td>
                        <span className={`live-status-badge ${s.status === "लाइव" ? "live" : s.status === "सम्पन्न" ? "completed" : "upcoming"}`}>
                          {s.status === "लाइव" ? "🔴 लाइव" : s.status}
                        </span>
                      </td>
                      <td>
                        <a
                          href={s.meetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-admin btn-admin-outline btn-admin-sm"
                          style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11 }}
                        >
                          <FontAwesomeIcon icon={faVideo} /> जुड़ें
                        </a>
                      </td>
                      <td>
                        <div className="action-btns">
                          {s.status !== "लाइव" ? (
                            <button
                              className="btn-admin btn-admin-success btn-admin-sm"
                              title="लाइव आरम्भ करें"
                              onClick={() => toggleStatus(s, "लाइव")}
                              style={{ fontSize: 11, padding: "2px 6px" }}
                            >
                              🔴 लाइव करें
                            </button>
                          ) : (
                            <button
                              className="btn-admin btn-admin-outline btn-admin-sm"
                              title="सत्र सम्पन्न चिह्नित करें"
                              onClick={() => toggleStatus(s, "सम्पन्न")}
                              style={{ fontSize: 11, padding: "2px 6px" }}
                            >
                              सम्पन्न
                            </button>
                          )}
                          <button
                            className="btn-admin btn-admin-sm btn-admin-outline"
                            title="संपादित करें"
                            onClick={() => openEdit(s)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            className="btn-admin btn-admin-danger btn-admin-sm"
                            title="हटाएँ"
                            onClick={() => setDelConfirm(s)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-state">
                          <div className="empty-icon">📅</div>
                          <p>कोई लाइव व्याख्यान सत्र निर्धारित नहीं है</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="admin-modal" style={{ maxWidth: 580 }}>
            <div className="admin-modal-header">
              <h5>🎥 {modal.mode === "add" ? "नवीन लाइव सत्र निर्धारित करें" : "लाइव सत्र संपादित करें"}</h5>
              <button className="admin-modal-close" onClick={() => setModal(null)}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>सत्र का मुख्य विषय / शीर्षक *</label>
                  <input
                    className="admin-input"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="जैसे: ऋग्वेद प्रथम मण्डल: अग्नि सूक्त सस्वर पाठ"
                    required
                  />
                </div>
                <div className="form-grid-2">
                  <div className="admin-form-group">
                    <label>सम्बद्ध पाठ्यक्रम *</label>
                    <select
                      className="admin-select"
                      value={form.courseTitle}
                      onChange={e => setForm({ ...form, courseTitle: e.target.value })}
                      required
                    >
                      {coursesList.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
                      <option value="ऋग्वेद संहिता अध्ययन">ऋग्वेद संहिता अध्ययन</option>
                      <option value="सांख्य दर्शन स्वाध्याय">सांख्य दर्शन स्वाध्याय</option>
                      <option value="पाणिनीय व्याकरण प्रवेशिका">पाणिनीय व्याकरण प्रवेशिका</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>प्रवक्ता / आचार्य *</label>
                    <input
                      className="admin-input"
                      value={form.instructor}
                      onChange={e => setForm({ ...form, instructor: e.target.value })}
                      placeholder="आचार्य सत्यपाल शास्त्री"
                      required
                    />
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="admin-form-group">
                    <label>कक्षा दिन (Day) *</label>
                    <input
                      className="admin-input"
                      value={form.day}
                      onChange={e => setForm({ ...form, day: e.target.value })}
                      placeholder="जैसे: सोमवार एवं गुरुवार"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>समय (Time) *</label>
                    <input
                      className="admin-input"
                      value={form.time}
                      onChange={e => setForm({ ...form, time: e.target.value })}
                      placeholder="जैसे: प्रातः ०७:०० - ०८:००"
                      required
                    />
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="admin-form-group">
                    <label>लाइव मीट लिंक (Google Meet / Zoom URL) *</label>
                    <input
                      className="admin-input"
                      value={form.meetUrl}
                      onChange={e => setForm({ ...form, meetUrl: e.target.value })}
                      placeholder="https://meet.google.com/..."
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>स्थिति</label>
                    <select
                      className="admin-select"
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="आगामी">आगामी (Upcoming)</option>
                      <option value="लाइव">🔴 लाइव (Live Now)</option>
                      <option value="सम्पन्न">सम्पन्न (Completed)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-admin btn-admin-outline" onClick={() => setModal(null)}>रद्द करें</button>
                <button type="submit" className="btn-admin btn-admin-primary">
                  <FontAwesomeIcon icon={faSave} /> सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {delConfirm && (
        <DeleteModal
          title="लाइव सत्र हटाएँ?"
          body={`क्या आप सत्र "${delConfirm.title}" को समय-सारणी से हटाना चाहते हैं?`}
          onConfirm={() => handleDelete(delConfirm.id)}
          onCancel={() => setDelConfirm(null)}
        />
      )}
    </div>
  );
}


/* ════════════════════════════════════════════════════════
   4. ENROLLMENT MANAGEMENT (FULL CRUD & CERTIFICATES)
════════════════════════════════════════════════════════ */
function EnrollmentsSection() {
  const [enrollments, setEnrollments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [alert, showAlert] = useAlert();
  const [delConfirm, setDelConfirm] = useState(null);
  const [certModal, setCertModal] = useState(null);

  // New enrollment modal
  const [addModal, setAddModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ userId: "", courseId: "", status: "ACTIVE", progressPercent: 0, notes: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ limit: 50 });
      if (statusFilter !== "ALL") p.set("status", statusFilter);
      if (search) p.set("search", search);
      const r = await api.get("/admin/enrollments?" + p.toString());
      setEnrollments(r?.data?.enrollments || []);
      setTotal(r?.data?.total || 0);
    } catch {
      showAlert("error", "नामांकन लोड नहीं हुए");
    }
    setLoading(false);
  }, [search, statusFilter]); // eslint-disable-line
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  const openAddModal = async () => {
    try {
      const [uRes, cRes] = await Promise.all([
        api.get("/admin/users?limit=100"),
        api.get("/courses?limit=100"),
      ]);
      setStudents(uRes?.data?.users || []);
      setCourses(cRes?.data?.courses || []);
      setForm({ userId: "", courseId: "", status: "ACTIVE", progressPercent: 0, notes: "" });
      setAddModal(true);
    } catch {
      showAlert("error", "डेटा लोड नहीं हुआ");
    }
  };

  const handleCreateEnrollment = async () => {
    if (!form.userId || !form.courseId) {
      showAlert("error", "विद्यार्थी और पाठ्यक्रम दोनों चुनें");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/admin/users/${form.userId}/enroll`, {
        courseId: form.courseId,
        status: form.status,
        progressPercent: form.progressPercent,
        notes: form.notes,
      });
      showAlert("success", "नामांकन सफलतापूर्वक किया गया");
      setAddModal(false);
      load();
    } catch (e) {
      showAlert("error", e.message || "नामांकन विफल");
    }
    setSaving(false);
  };

  const handleProgressBump = async (en, amount = 20) => {
    const nextVal = Math.min(100, (en.progressPercent || 0) + amount);
    try {
      await api.put(`/admin/enrollments/${en.id}`, {
        progressPercent: nextVal,
        status: nextVal === 100 ? "COMPLETED" : en.status,
      });
      showAlert("success", `प्रगति ${nextVal}% दर्ज हुई`);
      load();
    } catch {
      showAlert("error", "प्रगति अद्यतन विफल");
    }
  };

  const handleStatusChange = async (en, nextStatus) => {
    try {
      await api.put(`/admin/enrollments/${en.id}`, { status: nextStatus });
      showAlert("success", "स्थिति अपडेट हुई");
      load();
    } catch {
      showAlert("error", "अद्यतन विफल");
    }
  };

  const handleCertify = async (en) => {
    try {
      await api.put(`/admin/enrollments/${en.id}`, {
        progressPercent: 100,
        status: "COMPLETED",
      });
      showAlert("success", `अभिनन्दन! "${en.user?.name}" के लिए प्रमाण-पत्र सफलतापूर्वक जारी किया गया`);
      load();
    } catch {
      showAlert("error", "प्रमाण-पत्र जारी करने में त्रुटि");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/enrollments/${id}`);
      showAlert("success", "नामांकन हटाया गया");
      setDelConfirm(null);
      load();
    } catch {
      showAlert("error", "हटाने में त्रुटि");
    }
  };

  return (
    <div>
      <AdminAlert alert={alert} />
      <div className="admin-section">
        <div className="admin-section-header">
          <h5><FontAwesomeIcon icon={faGraduationCap} className="section-icon" /> नामांकन एवं प्रमाण-पत्र प्रबंधन ({total})</h5>
          <button className="btn-admin btn-admin-primary" onClick={openAddModal}>
            <FontAwesomeIcon icon={faPlus} /> नवीन नामांकन (New Enrollment)
          </button>
        </div>
        <div className="admin-section-body">
          <div className="filter-row">
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <FontAwesomeIcon icon={faSearch} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 13 }} />
              <input className="filter-input" style={{ paddingLeft: 34, width: "100%" }} placeholder="विद्यार्थी या पाठ्यक्रम खोजें..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="ALL">सभी स्थितियाँ (All Status)</option>
              <option value="ACTIVE">सक्रिय (ACTIVE)</option>
              <option value="COMPLETED">पूर्ण / प्रमाणित (COMPLETED)</option>
              <option value="PENDING">लंबित (PENDING)</option>
              <option value="CANCELLED">रद्द (CANCELLED)</option>
            </select>
          </div>

          {loading ? <Spinner /> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>विद्यार्थी</th><th>पाठ्यक्रम</th><th>प्रगति (Progress)</th><th>स्थिति (Status)</th><th>नामांकन तिथि</th><th>क्रियाएँ</th></tr></thead>
                <tbody>
                  {enrollments.map(en => (
                    <tr key={en.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="user-thumb">{en.user?.avatar || "🕉️"}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{en.user?.name}</div>
                            <div style={{ fontSize: 11, color: "#888" }}>{en.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--primary-color)" }}>{en.course?.title}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>{en.course?.category} • {en.course?.currentPrice}</div>
                      </td>
                      <td style={{ minWidth: 160 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="pr-bar" style={{ flex: 1, height: 8 }}>
                            <div className={"pr-fill " + (en.progressPercent === 100 ? "green" : "blue")} style={{ width: `${en.progressPercent}%` }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, minWidth: 35 }}>{en.progressPercent}%</span>
                          {en.progressPercent < 100 && (
                            <button
                              className="btn-admin btn-admin-outline btn-admin-sm"
                              title="+20% प्रगति दर्ज करें"
                              onClick={() => handleProgressBump(en, 20)}
                              style={{ padding: "2px 6px", fontSize: 11 }}
                            >
                              +20%
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <select
                          className="role-select-inline"
                          value={en.status}
                          onChange={e => handleStatusChange(en, e.target.value)}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="PENDING">PENDING</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td style={{ fontSize: 12, color: "#888" }}>{fmt(en.enrolledAt)}</td>
                      <td>
                        <div className="action-btns">
                          {en.progressPercent === 100 || en.status === "COMPLETED" ? (
                            <button
                              className="btn-admin btn-admin-gold btn-admin-sm"
                              title="प्रमाण-पत्र पूर्वावलोकन (Certificate Preview)"
                              onClick={() => setCertModal(en)}
                              style={{ fontSize: 11, padding: "3px 8px" }}
                            >
                              <FontAwesomeIcon icon={faCertificate} /> प्रमाण-पत्र
                            </button>
                          ) : (
                            <button
                              className="btn-admin btn-admin-outline btn-admin-sm"
                              title="१००% पूर्ण कर प्रमाण-पत्र जारी करें"
                              onClick={() => handleCertify(en)}
                              style={{ color: "#27ae60", borderColor: "#27ae60", fontSize: 11, padding: "3px 8px" }}
                            >
                              <FontAwesomeIcon icon={faAward} /> प्रमाणित करें
                            </button>
                          )}
                          <button
                            className="btn-admin btn-admin-danger btn-admin-sm"
                            title="नामांकन रद्द करें"
                            onClick={() => setDelConfirm(en)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {enrollments.length === 0 && <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">🎓</div><p>कोई नामांकन नहीं मिला</p></div></td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Certificate Preview Modal */}
      {certModal && (
        <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setCertModal(null); }}>
          <div className="admin-modal" style={{ maxWidth: 650 }}>
            <div className="admin-modal-header">
              <h5>📜 प्रमाण-पत्र पूर्वावलोकन (Certificate Preview)</h5>
              <button className="admin-modal-close" onClick={() => setCertModal(null)}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-cert-frame">
                <div className="admin-cert-ornament">🕉️</div>
                <div className="admin-cert-header">
                  <h3>आर्य पाठशाला</h3>
                  <p>वैदिक एवं संस्कृत उच्च अध्ययन संस्थान (राष्ट्रीय ई-लर्निंग पीठ)</p>
                </div>
                <div className="admin-cert-title">विद्या निष्णात प्रमाण-पत्र</div>
                <p style={{ margin: "10px 0 4px", fontSize: 13, color: "#777" }}>
                  प्रमाणित किया जाता है कि यशस्वी शिक्षार्थी
                </p>
                <div className="admin-cert-student">{certModal.user?.name || "शिक्षार्थी"}</div>
                <p style={{ margin: "4px 0", fontSize: 13, color: "#777" }}>
                  ने आर्ष पद्धति एवं निष्ठापूर्वक निम्नलिखित पाठ्यक्रम शत-प्रतिशत पूर्ण किया है:
                </p>
                <div className="admin-cert-course">{certModal.course?.title || "वैदिक स्वाध्याय"}</div>
                <div className="admin-cert-shloka">
                  "विद्यां चाविद्यां च यस्तद्वेदोभयं सह। अविद्यया मृत्युं तीर्त्वा विद्ययाऽमृतमश्नुते॥"
                </div>
                <div className="admin-cert-footer">
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 11, color: "#666" }}>
                      प्रमाण-पत्र क्रमांक: AP-{(certModal.id + 1000).toString(16).toUpperCase()}-VEDA
                    </div>
                    <div style={{ fontSize: 11, color: "#666" }}>
                      जारी दिनांक: {fmt(certModal.completedAt || certModal.enrolledAt)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, color: "#5d0f22", fontSize: 15, fontFamily: "'Tiro Devanagari Sanskrit', serif" }}>
                      आचार्य परिषद
                    </div>
                    <div className="admin-cert-sign-title">अधिकृत हस्ताक्षर एवं वैदिक मुहर</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer" style={{ display: "flex", justifyContent: "space-between" }}>
              <button className="btn-admin btn-admin-primary" onClick={() => window.print()}>
                <FontAwesomeIcon icon={faPrint} /> प्रिंट / PDF डाउनलोड करें
              </button>
              <button className="btn-admin btn-admin-outline" onClick={() => setCertModal(null)}>
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Enrollment Modal */}
      {addModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 480 }}>
            <div className="admin-modal-header">
              <h5>🎓 नया नामांकन जोड़ें (New Enrollment)</h5>
              <button className="admin-modal-close" onClick={() => setAddModal(false)}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label>विद्यार्थी चुनें *</label>
                <select className="admin-select" value={form.userId} onChange={e => setForm(p => ({ ...p, userId: e.target.value }))}>
                  <option value="">-- विद्यार्थी चुनें --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label>पाठ्यक्रम चुनें *</label>
                <select className="admin-select" value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))}>
                  <option value="">-- पाठ्यक्रम चुनें --</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.category})</option>)}
                </select>
              </div>
              <div className="form-grid-2">
                <div className="admin-form-group">
                  <label>स्थिति</label>
                  <select className="admin-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>आरंभिक प्रगति (%)</label>
                  <input className="admin-input" type="number" min="0" max="100" value={form.progressPercent} onChange={e => setForm(p => ({ ...p, progressPercent: e.target.value }))} />
                </div>
              </div>
              <div className="admin-form-group">
                <label>नामांकन टिप्पणी (Notes)</label>
                <textarea className="admin-input admin-textarea" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="छात्रवृत्ति, विशेष बैच, या अन्य..." />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={() => setAddModal(false)}>रद्द करें</button>
              <button className="btn-admin btn-admin-primary" onClick={handleCreateEnrollment} disabled={saving}>
                {saving ? "सहेजा जा रहा है..." : "नामांकन सहेजें"}
              </button>
            </div>
          </div>
        </div>
      )}

      {delConfirm && (
        <DeleteModal
          title="नामांकन रद्द करें?"
          body={`क्या आप विद्यार्थी "${delConfirm.user?.name}" का "${delConfirm.course?.title}" पाठ्यक्रम से नामांकन हटाना चाहते हैं?`}
          onConfirm={() => handleDelete(delConfirm.id)}
          onCancel={() => setDelConfirm(null)}
        />
      )}
    </div>
  );
}


/* ════════════════════════════════════════════════════════
   5. NOTICE MANAGEMENT (FULL CRUD)
════════════════════════════════════════════════════════ */
function NoticesSection() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_NOTICE);
  const [saving, setSaving] = useState(false);
  const [alert, showAlert] = useAlert();
  const [delConfirm, setDelConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/notices?all=true");
      setNotices(r?.data || []);
    } catch {
      showAlert("error", "सूचनाएँ लोड नहीं हुईं");
    }
    setLoading(false);
  }, []); // eslint-disable-line
  useEffect(() => { load(); }, [load]);

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const openAdd = () => { setForm(EMPTY_NOTICE); setModal({ mode: "add" }); };
  const openEdit = (n) => { setForm({ ...n }); setModal({ mode: "edit", id: n.id }); };

  const handleSave = async () => {
    if (!form.title || !form.content) {
      showAlert("error", "शीर्षक और सामग्री आवश्यक हैं");
      return;
    }
    setSaving(true);
    try {
      if (modal.mode === "add") {
        await api.post("/notices", form);
        showAlert("success", "सूचना सफलतापूर्वक प्रकाशित हुई");
      } else {
        await api.put("/notices/" + modal.id, form);
        showAlert("success", "सूचना सफलतापूर्वक अपडेट हुई");
      }
      setModal(null);
      load();
    } catch (e) {
      showAlert("error", e.message || "त्रुटि");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete("/notices/" + id);
      showAlert("success", "सूचना हटाई गई");
      setDelConfirm(null);
      load();
    } catch {
      showAlert("error", "हटाने में त्रुटि");
    }
  };

  const togglePublish = async (n) => {
    try {
      await api.put("/notices/" + n.id, { isPublished: !n.isPublished });
      showAlert("success", n.isPublished ? "सूचना अप्रकाशित की गई" : "सूचना प्रकाशित की गई");
      load();
    } catch {
      showAlert("error", "अपडेट विफल");
    }
  };

  return (
    <div>
      <AdminAlert alert={alert} />
      <div className="admin-section">
        <div className="admin-section-header">
          <h5><FontAwesomeIcon icon={faBullhorn} className="section-icon" /> सूचना प्रबंधन ({notices.length})</h5>
          <button className="btn-admin btn-admin-primary" onClick={openAdd}>
            <FontAwesomeIcon icon={faPlus} /> नई सूचना प्रकाशित करें (Add Notice)
          </button>
        </div>
        <div className="admin-section-body">
          {loading ? <Spinner /> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>शीर्षक</th><th>प्रकार</th><th>प्राथमिकता</th><th>दृश्यता (Visibility)</th><th>दिनांक</th><th>क्रियाएँ</th></tr></thead>
                <tbody>
                  {notices.map(n => (
                    <tr key={n.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>{n.type}</div>
                      </td>
                      <td><span className={"priority-badge " + (n.category === "important" ? "HIGH" : n.category === "exam" ? "MEDIUM" : "LOW")}>{n.category}</span></td>
                      <td><span className={"priority-badge " + n.priority}>{n.priority}</span></td>
                      <td>
                        <button
                          onClick={() => togglePublish(n)}
                          title={n.isPublished ? "प्रकाशित (क्लिक करके अप्रकाशित करें)" : "अप्रकाशित (क्लिक करके प्रकाशित करें)"}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22 }}
                        >
                          <FontAwesomeIcon icon={n.isPublished ? faToggleOn : faToggleOff} style={{ color: n.isPublished ? "#27AE60" : "#aaa" }} />
                        </button>
                      </td>
                      <td style={{ fontSize: 12, color: "#888" }}>{fmt(n.createdAt)}</td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-admin btn-admin-success btn-admin-sm" title="संपादित करें" onClick={() => openEdit(n)}><FontAwesomeIcon icon={faEdit} /></button>
                          <button className="btn-admin btn-admin-danger btn-admin-sm" title="हटाएँ" onClick={() => setDelConfirm(n)}><FontAwesomeIcon icon={faTrash} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {notices.length === 0 && <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">📢</div><p>कोई सूचना नहीं मिली</p></div></td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h5>📢 {modal.mode === "add" ? "नई सूचना प्रकाशित करें" : "सूचना संपादित करें"}</h5>
              <button className="admin-modal-close" onClick={() => setModal(null)}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group"><label>सूचना शीर्षक *</label><input className="admin-input" value={form.title} onChange={e => setF("title", e.target.value)} placeholder="जैसे: यूजीसी नेट परीक्षा समय सारिणी" /></div>
              <div className="admin-form-group"><label>सूचना विवरण (Content) *</label><textarea className="admin-input admin-textarea" rows={4} value={form.content} onChange={e => setF("content", e.target.value)} /></div>
              <div className="form-grid-2">
                <div className="admin-form-group"><label>प्रकार (Type)</label><input className="admin-input" value={form.type} onChange={e => setF("type", e.target.value)} placeholder="महत्वपूर्ण सूचना" /></div>
                <div className="admin-form-group"><label>श्रेणी (Category)</label>
                  <select className="admin-select" value={form.category} onChange={e => setF("category", e.target.value)}>
                    <option value="important">महत्वपूर्ण (important)</option>
                    <option value="course">पाठ्यक्रम (course)</option>
                    <option value="exam">परीक्षा (exam)</option>
                    <option value="update">अपडेट (update)</option>
                  </select>
                </div>
                <div className="admin-form-group"><label>प्राथमिकता (Priority)</label>
                  <select className="admin-select" value={form.priority} onChange={e => setF("priority", e.target.value)}>
                    <option value="HIGH">उच्च (HIGH)</option>
                    <option value="MEDIUM">मध्यम (MEDIUM)</option>
                    <option value="LOW">सामान्य (LOW)</option>
                  </select>
                </div>
                <div className="admin-form-group"><label>दिनांक टेक्स्ट</label><input className="admin-input" value={form.dateText || ""} onChange={e => setF("dateText", e.target.value)} placeholder="15 अगस्त 2025" /></div>
                <div className="admin-form-group"><label>बटन टेक्स्ट</label><input className="admin-input" value={form.actionText || ""} onChange={e => setF("actionText", e.target.value)} placeholder="विस्तार से पढ़ें" /></div>
                <div className="admin-form-group"><label>बटन लिंक</label><input className="admin-input" value={form.actionLink || ""} onChange={e => setF("actionLink", e.target.value)} placeholder="#courses" /></div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, marginTop: 8 }}>
                <input type="checkbox" checked={form.isPublished} onChange={e => setF("isPublished", e.target.checked)} /> वेबसाइट पर तुरंत प्रकाशित करें (Live Visibility)
              </label>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={() => setModal(null)}>रद्द करें</button>
              <button className="btn-admin btn-admin-primary" onClick={handleSave} disabled={saving}><FontAwesomeIcon icon={faSave} /> {saving ? "सहेजा जा रहा है..." : "सहेजें (Save Notice)"}</button>
            </div>
          </div>
        </div>
      )}

      {delConfirm && (
        <DeleteModal
          title="सूचना हटाएँ?"
          body={`क्या आप "${delConfirm.title}" को वेबसाइट से हटाना चाहते हैं?`}
          onConfirm={() => handleDelete(delConfirm.id)}
          onCancel={() => setDelConfirm(null)}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   6. CONTACT MESSAGES & STUDENT DOUBTS DESK
════════════════════════════════════════════════════════ */
function MessagesSection() {
  const [activeSubTab, setActiveSubTab] = useState("contact"); // "contact" | "doubts"
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMsg, setViewMsg] = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);
  const [alert, showAlert] = useAlert();

  // Student Doubts state - 100% Live DB
  const [doubts, setDoubts] = useState([]);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [savingReply, setSavingReply] = useState(false);

  const loadDoubts = useCallback(async () => {
    try {
      const r = await api.get("/doubts");
      setDoubts(r?.data || []);
    } catch {
      showAlert("error", "शंका सूची लोड नहीं हुई");
      setDoubts([]);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    loadDoubts();
    const handleSync = () => loadDoubts();
    window.addEventListener("doubtsUpdated", handleSync);
    return () => window.removeEventListener("doubtsUpdated", handleSync);
  }, [loadDoubts]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/contact?limit=50");
      setMessages(r?.data?.messages || []);
    } catch {
      showAlert("error", "संदेश लोड नहीं हुए");
    }
    setLoading(false);
  }, []); // eslint-disable-line
  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    try {
      await api.put("/contact/" + id + "/status", { status });
      showAlert("success", "स्थिति अपडेट हुई");
      load();
    } catch {
      showAlert("error", "अपडेट विफल");
    }
  };

  const deleteMessage = async (id) => {
    try {
      await api.delete("/contact/" + id);
      showAlert("success", "संदेश सफलतापूर्वक हटा दिया गया");
      setDelConfirm(null);
      if (viewMsg?.id === id) setViewMsg(null);
      load();
      window.dispatchEvent(new CustomEvent("noticesUpdated"));
    } catch (e) {
      showAlert("error", e.message || "संदेश हटाने में त्रुटि");
    }
  };

  const handleSendDoubtReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedDoubt) return;
    setSavingReply(true);

    try {
      await api.put("/doubts/" + selectedDoubt.id + "/reply", { reply: replyText.trim() });
      showAlert("success", "शंका का आर्ष समाधान सफलतापूर्वक प्रेषित किया गया");
      setSelectedDoubt(null);
      setReplyText("");
      loadDoubts();
      window.dispatchEvent(new CustomEvent("doubtsUpdated"));
    } catch (err) {
      showAlert("error", "उत्तर प्रेषण विफल: " + (err.message || "त्रुटि"));
    } finally {
      setSavingReply(false);
    }
  };

  const handleDeleteDoubt = async (id) => {
    try {
      await api.delete("/doubts/" + id);
      showAlert("success", "शंका प्रश्न हटा दिया गया");
      loadDoubts();
      window.dispatchEvent(new CustomEvent("doubtsUpdated"));
    } catch {
      showAlert("error", "हटाने में त्रुटि");
    }
  };

  const filtered = statusFilter === "ALL" ? messages : messages.filter(m => m.status === statusFilter);
  const pendingDoubtsCount = doubts.filter(d => d.status === "PENDING").length;

  return (
    <div>
      <AdminAlert alert={alert} />

      <div className="admin-section">
        <div className="admin-section-header">
          <h5><FontAwesomeIcon icon={faEnvelope} className="section-icon" /> शंका समाधान एवं संवाद केंद्र</h5>
          <div className="admin-subnav-pills" style={{ margin: 0 }}>
            <button
              className={`admin-subnav-btn ${activeSubTab === "contact" ? "active" : ""}`}
              onClick={() => setActiveSubTab("contact")}
            >
              💬 सामान्य पूछताछ ({messages.length})
            </button>
            <button
              className={`admin-subnav-btn ${activeSubTab === "doubts" ? "active" : ""}`}
              onClick={() => setActiveSubTab("doubts")}
            >
              ❓ शिक्षार्थी शंका समाधान {pendingDoubtsCount > 0 && <span style={{ background: "#e74c3c", color: "#fff", padding: "1px 6px", borderRadius: 10, fontSize: 10 }}>{pendingDoubtsCount}</span>}
            </button>
          </div>
        </div>

        <div className="admin-section-body">
          {activeSubTab === "contact" ? (
            <>
              <div className="admin-tabs" style={{ marginBottom: 16 }}>
                {["ALL", "UNREAD", "READ", "REPLIED"].map(s => (
                  <button key={s} className={"admin-tab-btn " + (statusFilter === s ? "active" : "")} onClick={() => setStatusFilter(s)}>
                    {s === "ALL" ? "सभी" : s === "UNREAD" ? "अपठित" : s === "READ" ? "पठित" : "उत्तरित"}
                  </button>
                ))}
              </div>

              {loading ? <Spinner /> : (
                <>
                  {filtered.map(m => (
                    <div key={m.id} className={"msg-card " + (m.status === "UNREAD" ? "unread" : "")}>
                      <div className="msg-card-header">
                        <div>
                          <div className="msg-name">{m.firstName} {m.lastName || ""}</div>
                          <div className="msg-email">{m.email} • {m.phone || "फ़ोन उपलब्ध नहीं"}</div>
                          <div className="msg-subject" style={{ fontWeight: 700, color: "var(--primary-color)", marginTop: 4 }}>विषय: {m.subject}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                          <span className={"status-badge " + m.status}>{m.status}</span>
                          <div style={{ fontSize: 11, color: "#888" }}>{fmt(m.createdAt)}</div>
                        </div>
                      </div>
                      <div className="msg-body">{(m.message || "").slice(0, 200)}{(m.message || "").length > 200 ? "..." : ""}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
                        <button className="btn-admin btn-admin-primary btn-admin-sm" onClick={() => setViewMsg(m)}><FontAwesomeIcon icon={faEye} /> पूरा संदेश देखें</button>
                        {m.status === "UNREAD" && <button className="btn-admin btn-admin-success btn-admin-sm" onClick={() => updateStatus(m.id, "READ")}><FontAwesomeIcon icon={faCheck} /> पठित चिह्नित करें</button>}
                        {m.status !== "REPLIED" && <button className="btn-admin btn-admin-outline btn-admin-sm" onClick={() => updateStatus(m.id, "REPLIED")}><FontAwesomeIcon icon={faEnvelope} /> उत्तरित चिह्नित करें</button>}
                        <button className="btn-admin btn-admin-danger btn-admin-sm" title="संदेश हटाएँ" onClick={() => setDelConfirm(m)}><FontAwesomeIcon icon={faTrash} /> हटाएँ</button>
                      </div>
                    </div>
                  ))}
                  {filtered.length === 0 && <div className="empty-state"><div className="empty-icon">📭</div><p>कोई संदेश नहीं मिला</p></div>}
                </>
              )}
            </>
          ) : (
            /* Student Academic Doubts Section */
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{ margin: 0, fontSize: 13.5, color: "#666" }}>
                  विद्यार्थियों द्वारा वैदिक मंत्रों, दर्शन सूत्रों एवं व्याकरण पर पूछी गई शंकाएं:
                </p>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#78172c" }}>
                  लम्बित शंकाएं: {pendingDoubtsCount}
                </div>
              </div>

              {doubts.map(d => (
                <div key={d.id} className={`doubt-card ${d.status === "PENDING" ? "pending" : "answered"}`}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#2b2520" }}>
                        👤 {d.studentName} <span style={{ fontSize: 12, color: "#888", fontWeight: 400 }}>({d.studentEmail})</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--primary-color)", fontWeight: 600, marginTop: 2 }}>
                        📚 {d.courseTitle}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className={`priority-badge ${d.status === "PENDING" ? "HIGH" : "LOW"}`}>
                        {d.status === "PENDING" ? "लम्बित (Pending)" : "समाधानित (Answered)"}
                      </span>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{d.date}</div>
                    </div>
                  </div>

                  {d.shlokaContext && (
                    <div className="doubt-context-box">
                      <strong>मन्त्र / सूत्र सन्दर्भ:</strong> {d.shlokaContext}
                    </div>
                  )}

                  <div style={{ fontSize: 14, color: "#333", lineHeight: 1.6, margin: "8px 0" }}>
                    <strong>जिज्ञासा / प्रश्न:</strong> {d.question}
                  </div>

                  {d.reply ? (
                    <div className="doubt-reply-box">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div><strong>✨ आचार्य समाधान:</strong> {d.reply}</div>
                        <button
                          className="btn-admin btn-admin-danger btn-admin-sm"
                          style={{ padding: "2px 6px", fontSize: 11 }}
                          onClick={() => handleDeleteDoubt(d.id)}
                          title="शंका प्रश्न हटाएं"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                      <button
                        className="btn-admin btn-admin-gold btn-admin-sm"
                        onClick={() => { setSelectedDoubt(d); setReplyText(""); }}
                      >
                        <FontAwesomeIcon icon={faQuestionCircle} /> वैदिक समाधान प्रेषित करें
                      </button>
                      <button
                        className="btn-admin btn-admin-danger btn-admin-sm"
                        onClick={() => handleDeleteDoubt(d.id)}
                        title="शंका हटाएं"
                      >
                        <FontAwesomeIcon icon={faTrash} /> हटाएं
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {doubts.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">❓</div>
                  <p>कोई शंका दर्ज नहीं है</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* View Message Modal */}
      {viewMsg && (
        <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setViewMsg(null); }}>
          <div className="admin-modal">
            <div className="admin-modal-header"><h5>✉️ संदेश विवरण</h5><button className="admin-modal-close" onClick={() => setViewMsg(null)}><FontAwesomeIcon icon={faTimes} /></button></div>
            <div className="admin-modal-body">
              <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse", marginBottom: 16 }}>
                <tbody>
                  {[["प्रेषक", viewMsg.firstName + " " + (viewMsg.lastName || "")], ["ईमेल", viewMsg.email], ["मोबाइल", viewMsg.phone || "—"], ["विषय", viewMsg.subject], ["तिथि", fmtDT(viewMsg.createdAt)], ["स्थिति", viewMsg.status]].map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: "1px solid #f0e6d3" }}>
                      <td style={{ padding: "8px 0", color: "#888", fontWeight: 600, width: 90 }}>{k}</td>
                      <td style={{ padding: "8px 0" }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="admin-form-group"><label>संदेश सामग्री</label><div style={{ background: "#fdf8f0", border: "1px solid #e0d5c1", borderRadius: 8, padding: 14, fontSize: 14, lineHeight: 1.7 }}>{viewMsg.message}</div></div>
            </div>
            <div className="admin-modal-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button className="btn-admin btn-admin-danger" onClick={() => { const target = viewMsg; setViewMsg(null); setDelConfirm(target); }}>
                <FontAwesomeIcon icon={faTrash} /> संदेश हटाएँ (Delete)
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                {viewMsg.status !== "REPLIED" && <button className="btn-admin btn-admin-gold" onClick={() => { updateStatus(viewMsg.id, "REPLIED"); setViewMsg(null); }}><FontAwesomeIcon icon={faCheck} /> उत्तरित चिह्नित करें</button>}
                <button className="btn-admin btn-admin-outline" onClick={() => setViewMsg(null)}>बंद करें</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doubt Reply Modal */}
      {selectedDoubt && (
        <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedDoubt(null); }}>
          <div className="admin-modal" style={{ maxWidth: 540 }}>
            <div className="admin-modal-header">
              <h5>❓ शंका समाधान प्रेषित करें</h5>
              <button className="admin-modal-close" onClick={() => setSelectedDoubt(null)}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <form onSubmit={handleSendDoubtReply}>
              <div className="admin-modal-body">
                <div style={{ background: "#fdf8ee", padding: 12, borderRadius: 8, border: "1px solid #ebd9b5", marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary-color)" }}>{selectedDoubt.courseTitle}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>प्रश्नकर्ता: {selectedDoubt.studentName}</div>
                  <div style={{ fontSize: 13, color: "#333", marginTop: 4 }}>"{selectedDoubt.question}"</div>
                </div>

                <div className="admin-form-group">
                  <label>आचार्य का शास्त्रीय एवं तर्कसंगत उत्तर *</label>
                  <textarea
                    className="admin-input admin-textarea"
                    rows={4}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="वैदिक प्रमाण, व्याकरण अन्वय एवं दार्शनिक भावार्थ सहित उत्तर लिखें..."
                    required
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-admin btn-admin-outline" onClick={() => setSelectedDoubt(null)}>रद्द करें</button>
                <button type="submit" className="btn-admin btn-admin-gold" disabled={savingReply}>
                  <FontAwesomeIcon icon={faSave} /> {savingReply ? "प्रेषित हो रहा है..." : "उत्तर प्रेषित करें"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {delConfirm && (
        <DeleteModal
          title="शंका संदेश हटाएँ"
          body={`क्या आप वास्तव में प्रेषक "${delConfirm.firstName} ${delConfirm.lastName || ""}" का संदेश (${delConfirm.subject}) हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।`}
          onConfirm={() => deleteMessage(delConfirm.id)}
          onCancel={() => setDelConfirm(null)}
        />
      )}
    </div>
  );
}


/* ════════════════════════════════════════════════════════
   7. ADMIN SETTINGS
════════════════════════════════════════════════════════ */
function SettingsSection({ adminUser }) {
  const { updateProfile } = useAuth();
  const [form, setForm] = useState({ name: adminUser?.name || "", phone: adminUser?.phone || "", avatar: adminUser?.avatar || "🕉️" });
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [alert, showAlert] = useAlert();
  const AVATARS = ["🕉️", "📚", "🙏", "⚡", "🌸", "🌿", "🏛️", "🔱", "📖", "✍️"];

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      showAlert("success", "प्रोफाइल सफलतापूर्वक अपडेट हुई");
    } catch (e) {
      showAlert("error", e.message || "अपडेट विफल");
    }
    setSaving(false);
  };

  const changePassword = async () => {
    if (!passForm.currentPassword || !passForm.newPassword) {
      showAlert("error", "सभी फ़ील्ड भरें");
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      showAlert("error", "पासवर्ड मेल नहीं खाता");
      return;
    }
    if (passForm.newPassword.length < 8) {
      showAlert("error", "पासवर्ड 8+ अक्षर का होना चाहिए");
      return;
    }
    setChangingPass(true);
    try {
      await api.put("/auth/change-password", passForm);
      showAlert("success", "पासवर्ड बदल गया");
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      showAlert("error", e.message || "पासवर्ड परिवर्तन विफल");
    }
    setChangingPass(false);
  };

  return (
    <div>
      <AdminAlert alert={alert} />
      <div className="two-col-layout">
        <div>
          <div className="admin-section">
            <div className="admin-section-header"><h5><FontAwesomeIcon icon={faUser} className="section-icon" /> व्यवस्थापक प्रोफाइल</h5></div>
            <div className="admin-section-body">
              <div className="admin-form-group">
                <label>अवतार चुनें</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                  {AVATARS.map(a => (
                    <button key={a} onClick={() => setForm(p => ({ ...p, avatar: a }))} style={{ fontSize: 24, background: form.avatar === a ? "rgba(199,54,89,0.12)" : "transparent", border: form.avatar === a ? "2px solid #C73659" : "2px solid #e0d5c1", borderRadius: 10, padding: "4px 8px", cursor: "pointer" }}>{a}</button>
                  ))}
                </div>
              </div>
              <div className="admin-form-group"><label>पूरा नाम</label><input className="admin-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="admin-form-group"><label>मोबाइल</label><input className="admin-input" value={form.phone || ""} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="admin-form-group"><label>ईमेल</label><input className="admin-input" value={adminUser?.email || ""} disabled style={{ opacity: 0.6 }} /></div>
              <button className="btn-admin btn-admin-primary" onClick={saveProfile} disabled={saving}><FontAwesomeIcon icon={faSave} /> {saving ? "सहेजा जा रहा है..." : "प्रोफाइल अपडेट करें"}</button>
            </div>
          </div>
          <div className="admin-section">
            <div className="admin-section-header"><h5><FontAwesomeIcon icon={faKey} className="section-icon" /> पासवर्ड बदलें</h5></div>
            <div className="admin-section-body">
              <div className="admin-form-group"><label>वर्तमान पासवर्ड</label><input type="password" className="admin-input" value={passForm.currentPassword} onChange={e => setPassForm(p => ({ ...p, currentPassword: e.target.value }))} /></div>
              <div className="admin-form-group"><label>नया पासवर्ड (8+ अक्षर)</label><input type="password" className="admin-input" value={passForm.newPassword} onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))} /></div>
              <div className="admin-form-group"><label>नया पासवर्ड (पुनः पुष्टि)</label><input type="password" className="admin-input" value={passForm.confirmPassword} onChange={e => setPassForm(p => ({ ...p, confirmPassword: e.target.value }))} /></div>
              <button className="btn-admin btn-admin-outline" onClick={changePassword} disabled={changingPass}><FontAwesomeIcon icon={faKey} /> {changingPass ? "बदला जा रहा है..." : "पासवर्ड बदलें"}</button>
            </div>
          </div>
        </div>
        <div>
          <div className="admin-section">
            <div className="admin-section-header"><h5>👀 प्रोफाइल पूर्वावलोकन</h5></div>
            <div className="admin-section-body" style={{ textAlign: "center", padding: "32px 24px" }}>
              <div style={{ fontSize: 64, marginBottom: 12 }}>{form.avatar}</div>
              <h5 style={{ margin: "0 0 6px", color: "#2E2E2E", fontWeight: 700 }}>{form.name}</h5>
              <span className="role-badge ADMIN" style={{ marginBottom: 12, display: "inline-block" }}>ADMIN</span>
              <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{adminUser?.email}</div>
            </div>
          </div>
          <div className="admin-section">
            <div className="admin-section-header"><h5><FontAwesomeIcon icon={faShieldAlt} className="section-icon" /> सुरक्षा सुझाव</h5></div>
            <div className="admin-section-body">
              {["🔒 हर 30 दिन में पासवर्ड बदलें", "🛡️ मजबूत पासवर्ड: अक्षर, अंक, चिह्न", "🕵️ संदिग्ध लॉगिन पर तुरंत लॉगआउट करें", "📧 ईमेल नोटिफिकेशन सक्रिय रखें"].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: "1px solid #f5ede0", fontSize: 13, color: "#555" }}>{tip}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   MAIN ADMIN PANEL WRAPPER
════════════════════════════════════════════════════════ */
export default function AdminPanel({ onBackToHome }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("arya_admin_tab") || "overview";
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return typeof window !== "undefined" ? window.innerWidth >= 992 : true;
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const r = await api.get("/admin/stats");
      setStats(r?.data || null);
    } catch {
      // ignore
    }
  }, []);
  useEffect(() => { loadStats(); }, [loadStats]);

  const sections = [...new Set(NAV_ITEMS.map(n => n.section))];
  const handleNav = (key) => {
    setActiveTab(key);
    try { localStorage.setItem("arya_admin_tab", key); } catch (_) { }
    if (typeof window !== "undefined" && window.innerWidth < 992) {
      setSidebarOpen(false);
    }
    if (key === "overview") loadStats();
  };

  return (
    <div className="admin-root">
      {sidebarOpen && typeof window !== "undefined" && window.innerWidth < 992 && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          title="मेन्यू बंद करें"
        />
      )}
      <aside className={"admin-sidebar" + (sidebarOpen ? " open" : " collapsed")}>
        <div className="admin-sidebar-brand">
          <img src="/logo.png" alt="Logo" onError={e => { e.target.style.display = "none"; }} />
          <div className="brand-text"><h5>आर्य पाठशाला</h5><span>व्यवस्थापक पोर्टल (Admin)</span></div>
        </div>
        <div className="admin-profile-chip">
          <div className="avatar">{user?.avatar || "🕉️"}</div>
          <div className="info"><h6>{user?.name || "व्यवस्थापक"}</h6><span>ADMIN</span></div>
        </div>
        <nav className="admin-sidebar-nav">
          {sections.map(section => (
            <div key={section}>
              <div className="admin-nav-section-label">{section}</div>
              {NAV_ITEMS.filter(n => n.section === section).map(n => (
                <button key={n.key} className={"admin-nav-item" + (activeTab === n.key ? " active" : "")} onClick={() => handleNav(n.key)}>
                  <FontAwesomeIcon icon={n.icon} className="nav-icon" />
                  {n.label}
                  {n.badge && (stats?.[n.badge] || 0) > 0 && <span className="badge-count">{stats[n.badge]}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="back-btn" onClick={onBackToHome}><FontAwesomeIcon icon={faArrowLeft} /> मुख्य वेबसाइट (Live Site)</button>
          <button className="logout-btn" onClick={logout}><FontAwesomeIcon icon={faSignOutAlt} /> लॉग आउट करें</button>
        </div>
      </aside>

      <main className={"admin-main" + (!sidebarOpen ? " sidebar-collapsed" : "")}>
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(p => !p)}>
              <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} />
            </button>
            <div className="page-title">
              <h4>{SECTION_TITLES[activeTab]}</h4>
            </div>
          </div>
          <div className="topbar-right">
            <button className="btn-admin btn-admin-outline btn-admin-sm" onClick={loadStats} title="डेटाबेस रिफ्रेश करें"><FontAwesomeIcon icon={faSync} /> रिफ्रेश</button>
            <button className="btn-admin btn-admin-primary btn-admin-sm" onClick={onBackToHome}><FontAwesomeIcon icon={faHome} /> वेबसाइट देखें</button>
          </div>
        </header>

        <div className="admin-content">
          <div className="admin-breadcrumb">
            <span>🕉️ आर्य पाठशाला</span>
            <span className="bc-sep">›</span>
            <span>व्यवस्थापक पैनल</span>
            <span className="bc-sep">›</span>
            <span className="bc-current">{SECTION_TITLES[activeTab]}</span>
          </div>
          {activeTab === "overview" && <OverviewSection stats={stats} onTabChange={handleNav} />}
          {activeTab === "courses" && <CoursesSection />}
          {activeTab === "library" && <LibraryAdminSection />}
          {activeTab === "notices" && <NoticesSection />}
          {activeTab === "users" && <UsersSection />}
          {activeTab === "teachers" && <TeachersSection />}
          {activeTab === "liveSessions" && <LiveSessionsSection />}
          {activeTab === "enrollments" && <EnrollmentsSection />}
          {activeTab === "messages" && <MessagesSection />}
          {activeTab === "settings" && <SettingsSection adminUser={user} />}
        </div>
      </main>
    </div>
  );
}
