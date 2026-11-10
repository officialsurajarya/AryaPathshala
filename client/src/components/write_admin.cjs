const fs = require('fs');
const path = require('path');

const content = `import React, { useState, useEffect, useCallback } from "react";
import "./AdminPanel.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome, faBook, faBullhorn, faEnvelope, faUsers, faChartBar,
  faBars, faTimes, faPlus, faEdit, faTrash, faEye, faSignOutAlt,
  faArrowLeft, faSearch, faCheck, faSave, faExclamationTriangle,
  faGraduationCap, faLayerGroup, faCheckCircle, faToggleOn, faToggleOff,
  faKey, faUser, faShieldAlt, faClock, faBookOpen, faInbox, faSync,
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
  description: "", image: "/images/Rigveda.jpg",
  originalPrice: "₹3,999", currentPrice: "₹2,499",
  rating: "4.8", durationHours: "30", studentsCount: "0",
  hasCertificate: true, badgeText: "", badgeType: "popular", isPublished: true,
};

const EMPTY_NOTICE = {
  title: "", content: "", type: "महत्वपूर्ण सूचना", category: "important",
  dateText: "अद्यतन", actionText: "विस्तार से पढ़ें", actionLink: "#courses",
  priority: "MEDIUM", isPublished: true,
};

const NAV_ITEMS = [
  { key: "overview",     label: "अवलोकन",       icon: faChartBar,     section: "मुख्य" },
  { key: "courses",      label: "पाठ्यक्रम",     icon: faBook,         section: "सामग्री" },
  { key: "notices",      label: "सूचनाएँ",       icon: faBullhorn,     section: "सामग्री" },
  { key: "users",        label: "उपयोगकर्ता",   icon: faUsers,        section: "प्रबंधन" },
  { key: "enrollments",  label: "नामांकन",       icon: faGraduationCap,section: "प्रबंधन" },
  { key: "messages",     label: "शंका संदेश",    icon: faEnvelope,     section: "प्रबंधन", badge: "unreadMessages" },
  { key: "settings",     label: "सेटिंग्स",      icon: faUser,         section: "खाता" },
];

const SECTION_TITLES = {
  overview: "डैशबोर्ड अवलोकन",
  courses: "पाठ्यक्रम प्रबंधन",
  notices: "सूचना प्रबंधन",
  users: "उपयोगकर्ता प्रबंधन",
  enrollments: "नामांकन अवलोकन",
  messages: "शंका संदेश",
  settings: "व्यवस्थापक सेटिंग्स",
};

/* ─── Confirm Delete Modal ─── */
function DeleteModal({ title, body, onConfirm, onCancel }) {
  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal" style={{ maxWidth: 400 }}>
        <div className="admin-modal-header">
          <h5>⚠️ {title}</h5>
          <button className="admin-modal-close" onClick={onCancel}><FontAwesomeIcon icon={faTimes} /></button>
        </div>
        <div className="admin-modal-body"><p style={{ fontSize: 14, color: "#555" }}>{body}</p></div>
        <div className="admin-modal-footer">
          <button className="btn-admin btn-admin-outline" onClick={onCancel}>रद्द करें</button>
          <button className="btn-admin btn-admin-primary" onClick={onConfirm}><FontAwesomeIcon icon={faTrash} /> हाँ, हटाएँ</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   OVERVIEW
════════════════════════════════════════════════════════ */
function OverviewSection({ stats, onTabChange }) {
  const tot = Math.max(stats?.totalUsers || 1, 1);
  const enroll = Math.max(stats?.totalEnrollments || 1, 1);
  return (
    <div>
      <div className="stat-cards-grid">
        <StatCard icon={faUsers}        value={stats?.totalUsers}        label="कुल उपयोगकर्ता" color="red"    />
        <StatCard icon={faGraduationCap} value={stats?.totalStudents}    label="विद्यार्थी"      color="blue"   />
        <StatCard icon={faBook}          value={stats?.totalCourses}      label="पाठ्यक्रम"       color="gold"   />
        <StatCard icon={faLayerGroup}    value={stats?.totalEnrollments}  label="नामांकन"         color="green"  />
        <StatCard icon={faBookOpen}      value={stats?.totalBooks}        label="पुस्तकें"        color="purple" />
        <StatCard icon={faInbox}         value={stats?.unreadMessages}    label="अपठित संदेश"    color="orange" />
      </div>
      <div className="mini-chart-row">
        <div className="mini-chart-card">
          <h6>🕉️ उपयोगकर्ता वितरण</h6>
          {[
            { label: "विद्यार्थी", val: stats?.totalStudents ?? 0,   pct: Math.round(((stats?.totalStudents  ?? 0) / tot) * 100), cls: "blue" },
            { label: "शिक्षक",    val: stats?.totalTeachers ?? 0,   pct: Math.round(((stats?.totalTeachers  ?? 0) / tot) * 100), cls: "gold" },
            { label: "व्यवस्थापक", val: Math.max(0, (stats?.totalUsers ?? 0) - (stats?.totalStudents ?? 0) - (stats?.totalTeachers ?? 0)), pct: 8, cls: "red" },
          ].map(r => (
            <div key={r.label} className="progress-row">
              <span className="pr-label">{r.label}</span>
              <div className="pr-bar"><div className={"pr-fill " + r.cls} style={{ width: r.pct + "%" }} /></div>
              <span className="pr-val">{r.val}</span>
            </div>
          ))}
        </div>
        <div className="mini-chart-card">
          <h6>📚 नामांकन स्थिति</h6>
          {[
            { label: "पूर्ण",  val: stats?.completedEnrollments ?? 0,
              pct: Math.round(((stats?.completedEnrollments ?? 0) / enroll) * 100), cls: "green" },
            { label: "सक्रिय", val: (stats?.totalEnrollments ?? 0) - (stats?.completedEnrollments ?? 0),
              pct: Math.round((((stats?.totalEnrollments ?? 0) - (stats?.completedEnrollments ?? 0)) / enroll) * 100), cls: "blue" },
          ].map(r => (
            <div key={r.label} className="progress-row">
              <span className="pr-label">{r.label}</span>
              <div className="pr-bar"><div className={"pr-fill " + r.cls} style={{ width: r.pct + "%" }} /></div>
              <span className="pr-val">{r.val}</span>
            </div>
          ))}
        </div>
        <div className="mini-chart-card">
          <h6>⚡ त्वरित क्रियाएँ</h6>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            <button className="btn-admin btn-admin-primary" style={{ justifyContent: "center" }} onClick={() => onTabChange("courses")}>
              <FontAwesomeIcon icon={faPlus} /> नया पाठ्यक्रम
            </button>
            <button className="btn-admin btn-admin-gold" style={{ justifyContent: "center" }} onClick={() => onTabChange("notices")}>
              <FontAwesomeIcon icon={faBullhorn} /> सूचना प्रकाशित करें
            </button>
            <button className="btn-admin btn-admin-outline" style={{ justifyContent: "center" }} onClick={() => onTabChange("messages")}>
              <FontAwesomeIcon icon={faEnvelope} /> संदेश ({stats?.unreadMessages ?? 0} अपठित)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   COURSES
════════════════════════════════════════════════════════ */
function CoursesSection() {
  const [courses, setCourses]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [catFilter, setCatFilter]   = useState("all");
  const [modal, setModal]           = useState(null);
  const [form, setForm]             = useState(EMPTY_COURSE);
  const [saving, setSaving]         = useState(false);
  const [alert, showAlert]          = useAlert();
  const [delConfirm, setDelConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get("/courses?limit=100"); setCourses(r?.data?.courses || []); }
    catch { showAlert("error", "पाठ्यक्रम लोड नहीं हुए"); }
    setLoading(false);
  }, []); // eslint-disable-line
  useEffect(() => { load(); }, [load]);

  const filtered = courses.filter(c => {
    const ms = !search || (c.title || "").toLowerCase().includes(search.toLowerCase()) || (c.titleEn || "").toLowerCase().includes(search.toLowerCase());
    return ms && (catFilter === "all" || c.category === catFilter);
  });

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const openAdd  = () => { setForm(EMPTY_COURSE); setModal({ mode: "add" }); };
  const openEdit = (c) => { setForm({ ...c, rating: String(c.rating), durationHours: String(c.durationHours), studentsCount: String(c.studentsCount) }); setModal({ mode: "edit", id: c.id }); };

  const handleSave = async () => {
    if (!form.slug || !form.title || !form.description) { showAlert("error", "Slug, शीर्षक और विवरण आवश्यक हैं"); return; }
    setSaving(true);
    try {
      if (modal.mode === "add") { await api.post("/courses", form); showAlert("success", "पाठ्यक्रम जोड़ा गया"); }
      else { await api.put("/courses/" + modal.id, form); showAlert("success", "पाठ्यक्रम अपडेट हुआ"); }
      setModal(null); load();
    } catch (e) { showAlert("error", e.message || "त्रुटि"); }
    setSaving(false);
  };

  const handleDelete  = async (id) => {
    try { await api.delete("/courses/" + id); showAlert("success", "पाठ्यक्रम हटाया गया"); setDelConfirm(null); load(); }
    catch { showAlert("error", "हटाने में त्रुटि"); }
  };

  const togglePublish = async (c) => {
    try { await api.put("/courses/" + c.id, { isPublished: !c.isPublished }); load(); }
    catch { showAlert("error", "अपडेट विफल"); }
  };

  return (
    <div>
      <AdminAlert alert={alert} />
      <div className="admin-section">
        <div className="admin-section-header">
          <h5><FontAwesomeIcon icon={faBook} className="section-icon" /> पाठ्यक्रम प्रबंधन ({filtered.length})</h5>
          <button className="btn-admin btn-admin-primary" onClick={openAdd}><FontAwesomeIcon icon={faPlus} /> नया पाठ्यक्रम</button>
        </div>
        <div className="admin-section-body">
          <div className="filter-row">
            <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
              <FontAwesomeIcon icon={faSearch} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 13 }} />
              <input className="filter-input" style={{ paddingLeft: 34, width: "100%" }} placeholder="पाठ्यक्रम खोजें..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="all">सभी श्रेणियाँ</option>
              {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          {loading ? <Spinner /> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>पाठ्यक्रम</th><th>श्रेणी</th><th>मूल्य</th><th>अवधि</th><th>रेटिंग</th><th>स्थिति</th><th>क्रियाएँ</th></tr></thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <img src={c.image} alt="" className="course-thumb" onError={e => { e.target.style.display = "none"; }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{c.title}</div>
                            <div style={{ fontSize: 11, color: "#aaa" }}>{c.titleEn || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 12 }}>{CATEGORY_OPTIONS.find(x => x.value === c.category)?.label || c.category}</td>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#27AE60" }}>{c.currentPrice}</div>
                        <div style={{ fontSize: 11, color: "#aaa", textDecoration: "line-through" }}>{c.originalPrice}</div>
                      </td>
                      <td>{c.durationHours}h</td>
                      <td>⭐ {c.rating}</td>
                      <td>
                        <button onClick={() => togglePublish(c)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22 }}>
                          <FontAwesomeIcon icon={c.isPublished ? faToggleOn : faToggleOff} style={{ color: c.isPublished ? "#27AE60" : "#aaa" }} />
                        </button>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-admin btn-admin-success btn-admin-sm" onClick={() => openEdit(c)}><FontAwesomeIcon icon={faEdit} /></button>
                          <button className="btn-admin btn-admin-danger btn-admin-sm" onClick={() => setDelConfirm(c)}><FontAwesomeIcon icon={faTrash} /></button>
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
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h5>🕉️ {modal.mode === "add" ? "नया पाठ्यक्रम जोड़ें" : "पाठ्यक्रम संपादित करें"}</h5>
              <button className="admin-modal-close" onClick={() => setModal(null)}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="form-grid-2">
                <div className="admin-form-group"><label>शीर्षक *</label><input className="admin-input" value={form.title} onChange={e => setF("title", e.target.value)} placeholder="ऋग्वेद अध्ययन" /></div>
                <div className="admin-form-group"><label>English Title</label><input className="admin-input" value={form.titleEn || ""} onChange={e => setF("titleEn", e.target.value)} placeholder="Rigveda Study" /></div>
                <div className="admin-form-group"><label>Slug *</label><input className="admin-input" value={form.slug} onChange={e => setF("slug", e.target.value.toLowerCase().replace(/\\s+/g, "-"))} placeholder="rigveda-adhyayan" /></div>
                <div className="admin-form-group"><label>श्रेणी</label>
                  <select className="admin-select" value={form.category} onChange={e => setF("category", e.target.value)}>
                    {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="admin-form-group"><label>मूल मूल्य</label><input className="admin-input" value={form.originalPrice} onChange={e => setF("originalPrice", e.target.value)} /></div>
                <div className="admin-form-group"><label>वर्तमान मूल्य</label><input className="admin-input" value={form.currentPrice} onChange={e => setF("currentPrice", e.target.value)} /></div>
                <div className="admin-form-group"><label>अवधि (घंटे)</label><input className="admin-input" type="number" value={form.durationHours} onChange={e => setF("durationHours", e.target.value)} /></div>
                <div className="admin-form-group"><label>रेटिंग (0–5)</label><input className="admin-input" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setF("rating", e.target.value)} /></div>
                <div className="admin-form-group"><label>बैज टेक्स्ट</label><input className="admin-input" value={form.badgeText || ""} onChange={e => setF("badgeText", e.target.value)} /></div>
                <div className="admin-form-group"><label>बैज प्रकार</label>
                  <select className="admin-select" value={form.badgeType || ""} onChange={e => setF("badgeType", e.target.value)}>
                    <option value="">कोई नहीं</option>
                    <option value="popular">popular</option>
                    <option value="new">new</option>
                    <option value="trending">trending</option>
                    <option value="special">special</option>
                  </select>
                </div>
                <div className="admin-form-group"><label>इमेज पथ</label><input className="admin-input" value={form.image} onChange={e => setF("image", e.target.value)} /></div>
                <div className="admin-form-group" style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 0 }}><input type="checkbox" checked={form.hasCertificate} onChange={e => setF("hasCertificate", e.target.checked)} /> प्रमाणपत्र</label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 0 }}><input type="checkbox" checked={form.isPublished} onChange={e => setF("isPublished", e.target.checked)} /> प्रकाशित</label>
                </div>
              </div>
              <div className="admin-form-group"><label>विवरण *</label><textarea className="admin-input admin-textarea" value={form.description} onChange={e => setF("description", e.target.value)} /></div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={() => setModal(null)}>रद्द करें</button>
              <button className="btn-admin btn-admin-primary" onClick={handleSave} disabled={saving}><FontAwesomeIcon icon={faSave} /> {saving ? "सहेजा जा रहा है..." : "सहेजें"}</button>
            </div>
          </div>
        </div>
      )}
      {delConfirm && <DeleteModal title="पाठ्यक्रम हटाएँ?" body={\`क्या आप "\${delConfirm.title}" हटाना चाहते हैं?\`} onConfirm={() => handleDelete(delConfirm.id)} onCancel={() => setDelConfirm(null)} />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   NOTICES
════════════════════════════════════════════════════════ */
function NoticesSection() {
  const [notices, setNotices]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(null);
  const [form, setForm]             = useState(EMPTY_NOTICE);
  const [saving, setSaving]         = useState(false);
  const [alert, showAlert]          = useAlert();
  const [delConfirm, setDelConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get("/notices"); setNotices(r?.data || []); }
    catch { showAlert("error", "सूचनाएँ लोड नहीं हुईं"); }
    setLoading(false);
  }, []); // eslint-disable-line
  useEffect(() => { load(); }, [load]);

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const openAdd  = () => { setForm(EMPTY_NOTICE); setModal({ mode: "add" }); };
  const openEdit = (n) => { setForm({ ...n }); setModal({ mode: "edit", id: n.id }); };

  const handleSave = async () => {
    if (!form.title || !form.content) { showAlert("error", "शीर्षक और सामग्री आवश्यक हैं"); return; }
    setSaving(true);
    try {
      if (modal.mode === "add") { await api.post("/notices", form); showAlert("success", "सूचना प्रकाशित हुई"); }
      else { await api.put("/notices/" + modal.id, form); showAlert("success", "सूचना अपडेट हुई"); }
      setModal(null); load();
    } catch (e) { showAlert("error", e.message || "त्रुटि"); }
    setSaving(false);
  };

  const handleDelete  = async (id) => {
    try { await api.delete("/notices/" + id); showAlert("success", "सूचना हटाई गई"); setDelConfirm(null); load(); }
    catch { showAlert("error", "हटाने में त्रुटि"); }
  };

  const togglePublish = async (n) => {
    try { await api.put("/notices/" + n.id, { isPublished: !n.isPublished }); load(); }
    catch { showAlert("error", "अपडेट विफल"); }
  };

  return (
    <div>
      <AdminAlert alert={alert} />
      <div className="admin-section">
        <div className="admin-section-header">
          <h5><FontAwesomeIcon icon={faBullhorn} className="section-icon" /> सूचना प्रबंधन ({notices.length})</h5>
          <button className="btn-admin btn-admin-primary" onClick={openAdd}><FontAwesomeIcon icon={faPlus} /> नई सूचना</button>
        </div>
        <div className="admin-section-body">
          {loading ? <Spinner /> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>शीर्षक</th><th>प्रकार</th><th>प्राथमिकता</th><th>स्थिति</th><th>दिनांक</th><th>क्रियाएँ</th></tr></thead>
                <tbody>
                  {notices.map(n => (
                    <tr key={n.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</div>
                        <div style={{ fontSize: 11, color: "#aaa" }}>{n.type}</div>
                      </td>
                      <td><span className={"priority-badge " + (n.category === "important" ? "HIGH" : n.category === "exam" ? "MEDIUM" : "LOW")}>{n.category}</span></td>
                      <td><span className={"priority-badge " + n.priority}>{n.priority}</span></td>
                      <td>
                        <button onClick={() => togglePublish(n)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22 }}>
                          <FontAwesomeIcon icon={n.isPublished ? faToggleOn : faToggleOff} style={{ color: n.isPublished ? "#27AE60" : "#aaa" }} />
                        </button>
                      </td>
                      <td style={{ fontSize: 12, color: "#888" }}>{fmt(n.createdAt)}</td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-admin btn-admin-success btn-admin-sm" onClick={() => openEdit(n)}><FontAwesomeIcon icon={faEdit} /></button>
                          <button className="btn-admin btn-admin-danger btn-admin-sm" onClick={() => setDelConfirm(n)}><FontAwesomeIcon icon={faTrash} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {notices.length === 0 && <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">📢</div><p>कोई सूचना नहीं</p></div></td></tr>}
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
              <h5>📢 {modal.mode === "add" ? "नई सूचना" : "सूचना संपादित करें"}</h5>
              <button className="admin-modal-close" onClick={() => setModal(null)}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group"><label>शीर्षक *</label><input className="admin-input" value={form.title} onChange={e => setF("title", e.target.value)} /></div>
              <div className="admin-form-group"><label>सामग्री *</label><textarea className="admin-input admin-textarea" value={form.content} onChange={e => setF("content", e.target.value)} /></div>
              <div className="form-grid-2">
                <div className="admin-form-group"><label>प्रकार</label><input className="admin-input" value={form.type} onChange={e => setF("type", e.target.value)} /></div>
                <div className="admin-form-group"><label>श्रेणी</label>
                  <select className="admin-select" value={form.category} onChange={e => setF("category", e.target.value)}>
                    <option value="important">महत्वपूर्ण</option>
                    <option value="course">पाठ्यक्रम</option>
                    <option value="exam">परीक्षा</option>
                    <option value="update">अपडेट</option>
                  </select>
                </div>
                <div className="admin-form-group"><label>प्राथमिकता</label>
                  <select className="admin-select" value={form.priority} onChange={e => setF("priority", e.target.value)}>
                    <option value="HIGH">उच्च</option>
                    <option value="MEDIUM">मध्यम</option>
                    <option value="LOW">सामान्य</option>
                  </select>
                </div>
                <div className="admin-form-group"><label>तिथि</label><input className="admin-input" value={form.dateText || ""} onChange={e => setF("dateText", e.target.value)} /></div>
                <div className="admin-form-group"><label>बटन टेक्स्ट</label><input className="admin-input" value={form.actionText || ""} onChange={e => setF("actionText", e.target.value)} /></div>
                <div className="admin-form-group"><label>बटन लिंक</label><input className="admin-input" value={form.actionLink || ""} onChange={e => setF("actionLink", e.target.value)} /></div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                <input type="checkbox" checked={form.isPublished} onChange={e => setF("isPublished", e.target.checked)} /> अभी प्रकाशित करें
              </label>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-admin btn-admin-outline" onClick={() => setModal(null)}>रद्द करें</button>
              <button className="btn-admin btn-admin-primary" onClick={handleSave} disabled={saving}><FontAwesomeIcon icon={faSave} /> {saving ? "सहेजा जा रहा है..." : "प्रकाशित करें"}</button>
            </div>
          </div>
        </div>
      )}
      {delConfirm && <DeleteModal title="सूचना हटाएँ?" body={\`क्या आप "\${delConfirm.title}" हटाना चाहते हैं?\`} onConfirm={() => handleDelete(delConfirm.id)} onCancel={() => setDelConfirm(null)} />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   USERS
════════════════════════════════════════════════════════ */
function UsersSection() {
  const [users, setUsers]           = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [alert, showAlert]          = useAlert();
  const [delConfirm, setDelConfirm] = useState(null);
  const [viewUser, setViewUser]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ limit: 50 });
      if (roleFilter !== "ALL") p.set("role", roleFilter);
      if (search) p.set("search", search);
      const r = await api.get("/admin/users?" + p.toString());
      setUsers(r?.data?.users || []); setTotal(r?.data?.total || 0);
    } catch { showAlert("error", "उपयोगकर्ता लोड नहीं हुए"); }
    setLoading(false);
  }, [search, roleFilter]); // eslint-disable-line
  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t); }, [load]);

  const changeRole = async (id, role) => {
    try { await api.put("/admin/users/" + id + "/role", { role }); showAlert("success", "भूमिका अपडेट हो गई"); load(); }
    catch { showAlert("error", "अपडेट विफल"); }
  };

  const deleteUser = async (id) => {
    try { await api.delete("/admin/users/" + id); showAlert("success", "उपयोगकर्ता हटाया गया"); setDelConfirm(null); load(); }
    catch { showAlert("error", "हटाने में त्रुटि"); }
  };

  return (
    <div>
      <AdminAlert alert={alert} />
      <div className="admin-section">
        <div className="admin-section-header"><h5><FontAwesomeIcon icon={faUsers} className="section-icon" /> उपयोगकर्ता ({total})</h5></div>
        <div className="admin-section-body">
          <div className="filter-row">
            <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
              <FontAwesomeIcon icon={faSearch} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 13 }} />
              <input className="filter-input" style={{ paddingLeft: 34, width: "100%" }} placeholder="नाम / ईमेल खोजें..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="ALL">सभी</option><option value="STUDENT">विद्यार्थी</option>
              <option value="TEACHER">शिक्षक</option><option value="ADMIN">व्यवस्थापक</option>
            </select>
          </div>
          {loading ? <Spinner /> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>उपयोगकर्ता</th><th>ईमेल</th><th>भूमिका</th><th>नामांकन</th><th>पंजीकरण</th><th>सत्यापित</th><th>क्रियाएँ</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div className="user-thumb">{u.avatar || "🕉️"}</div><div><div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div><div style={{ fontSize: 11, color: "#aaa" }}>ID: {u.id}</div></div></div></td>
                      <td><div style={{ fontSize: 13 }}>{u.email}</div><div style={{ fontSize: 11, color: "#aaa" }}>{u.phone || "—"}</div></td>
                      <td>
                        <select className="role-select-inline" value={u.role} onChange={e => changeRole(u.id, e.target.value)}>
                          <option value="STUDENT">विद्यार्थी</option>
                          <option value="TEACHER">शिक्षक</option>
                          <option value="ADMIN">व्यवस्थापक</option>
                        </select>
                      </td>
                      <td>{u._count?.enrollments ?? "—"}</td>
                      <td style={{ fontSize: 12 }}>{fmt(u.createdAt)}</td>
                      <td><span style={{ color: u.isVerified ? "#27AE60" : "#aaa" }}><FontAwesomeIcon icon={u.isVerified ? faCheckCircle : faClock} /></span></td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-admin btn-admin-success btn-admin-sm" onClick={() => setViewUser(u)}><FontAwesomeIcon icon={faEye} /></button>
                          <button className="btn-admin btn-admin-danger btn-admin-sm" onClick={() => setDelConfirm(u)}><FontAwesomeIcon icon={faTrash} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">👤</div><p>कोई उपयोगकर्ता नहीं मिला</p></div></td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {viewUser && (
        <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setViewUser(null); }}>
          <div className="admin-modal" style={{ maxWidth: 460 }}>
            <div className="admin-modal-header"><h5>👤 उपयोगकर्ता विवरण</h5><button className="admin-modal-close" onClick={() => setViewUser(null)}><FontAwesomeIcon icon={faTimes} /></button></div>
            <div className="admin-modal-body">
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 52 }}>{viewUser.avatar || "🕉️"}</div>
                <h5 style={{ margin: "8px 0 4px", color: "#2E2E2E" }}>{viewUser.name}</h5>
                <span className={"role-badge " + viewUser.role}>{viewUser.role}</span>
              </div>
              <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                {[["ईमेल", viewUser.email], ["मोबाइल", viewUser.phone || "—"], ["नामांकन", viewUser._count?.enrollments ?? "—"], ["पंजीकरण", fmt(viewUser.createdAt)], ["सत्यापित", viewUser.isVerified ? "हाँ ✅" : "नहीं ❌"], ["अंतिम लॉगिन", viewUser.lastLogin ? fmtDT(viewUser.lastLogin) : "—"]].map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: "1px solid #f0e6d3" }}>
                    <td style={{ padding: "9px 0", color: "#888", fontWeight: 600, width: 120 }}>{k}</td>
                    <td style={{ padding: "9px 0" }}>{v}</td>
                  </tr>
                ))}
              </table>
            </div>
            <div className="admin-modal-footer"><button className="btn-admin btn-admin-outline" onClick={() => setViewUser(null)}>बंद करें</button></div>
          </div>
        </div>
      )}
      {delConfirm && <DeleteModal title="उपयोगकर्ता हटाएँ?" body={\`क्या आप "\${delConfirm.name}" का खाता हटाना चाहते हैं?\`} onConfirm={() => deleteUser(delConfirm.id)} onCancel={() => setDelConfirm(null)} />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   ENROLLMENTS
════════════════════════════════════════════════════════ */
function EnrollmentsSection() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, showAlert]    = useAlert();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await api.get("/admin/users?limit=100");
        setUsers((r?.data?.users || []).filter(u => (u._count?.enrollments || 0) > 0));
      } catch { showAlert("error", "नामांकन लोड नहीं हुए"); }
      setLoading(false);
    })();
  }, []); // eslint-disable-line

  return (
    <div>
      <AdminAlert alert={alert} />
      <div className="admin-section">
        <div className="admin-section-header"><h5><FontAwesomeIcon icon={faGraduationCap} className="section-icon" /> नामांकन अवलोकन</h5></div>
        <div className="admin-section-body">
          {loading ? <Spinner /> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>विद्यार्थी</th><th>ईमेल</th><th>भूमिका</th><th>कुल नामांकन</th><th>पंजीकरण तिथि</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div className="user-thumb">{u.avatar || "🕉️"}</div><span style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</span></div></td>
                      <td style={{ fontSize: 13 }}>{u.email}</td>
                      <td><span className={"role-badge " + u.role}>{u.role}</span></td>
                      <td><span style={{ fontWeight: 700, color: "#27AE60", fontSize: 18 }}>{u._count?.enrollments || 0}</span></td>
                      <td style={{ fontSize: 12, color: "#888" }}>{fmt(u.createdAt)}</td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon">🎓</div><p>कोई नामांकन नहीं</p></div></td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   MESSAGES
════════════════════════════════════════════════════════ */
function MessagesSection() {
  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMsg, setViewMsg]         = useState(null);
  const [alert, showAlert]            = useAlert();

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get("/contact?limit=50"); setMessages(r?.data?.messages || []); }
    catch { showAlert("error", "संदेश लोड नहीं हुए"); }
    setLoading(false);
  }, []); // eslint-disable-line
  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    try { await api.put("/contact/" + id + "/status", { status }); showAlert("success", "स्थिति अपडेट हुई"); load(); }
    catch { showAlert("error", "अपडेट विफल"); }
  };

  const filtered = statusFilter === "ALL" ? messages : messages.filter(m => m.status === statusFilter);

  return (
    <div>
      <AdminAlert alert={alert} />
      <div className="admin-section">
        <div className="admin-section-header">
          <h5><FontAwesomeIcon icon={faEnvelope} className="section-icon" /> शंका संदेश ({filtered.length})</h5>
          <div className="admin-tabs">
            {["ALL", "UNREAD", "READ", "REPLIED"].map(s => (
              <button key={s} className={"admin-tab-btn " + (statusFilter === s ? "active" : "")} onClick={() => setStatusFilter(s)}>
                {s === "ALL" ? "सभी" : s === "UNREAD" ? "अपठित" : s === "READ" ? "पठित" : "उत्तरित"}
              </button>
            ))}
          </div>
        </div>
        <div className="admin-section-body">
          {loading ? <Spinner /> : (
            <>
              {filtered.map(m => (
                <div key={m.id} className={"msg-card " + (m.status === "UNREAD" ? "unread" : "")}>
                  <div className="msg-card-header">
                    <div>
                      <div className="msg-name">{m.firstName} {m.lastName || ""}</div>
                      <div className="msg-email">{m.email}</div>
                      <div className="msg-subject">विषय: {m.subject}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <span className={"status-badge " + m.status}>{m.status}</span>
                      <div style={{ fontSize: 11, color: "#aaa" }}>{fmt(m.createdAt)}</div>
                    </div>
                  </div>
                  <div className="msg-body">{(m.message || "").slice(0, 180)}{(m.message || "").length > 180 ? "..." : ""}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                    <button className="btn-admin btn-admin-primary btn-admin-sm" onClick={() => setViewMsg(m)}><FontAwesomeIcon icon={faEye} /> पूरा देखें</button>
                    {m.status === "UNREAD" && <button className="btn-admin btn-admin-success btn-admin-sm" onClick={() => updateStatus(m.id, "READ")}><FontAwesomeIcon icon={faCheck} /> पठित करें</button>}
                    {m.status !== "REPLIED" && <button className="btn-admin btn-admin-outline btn-admin-sm" onClick={() => updateStatus(m.id, "REPLIED")}><FontAwesomeIcon icon={faEnvelope} /> उत्तरित</button>}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="empty-state"><div className="empty-icon">📭</div><p>कोई संदेश नहीं मिला</p></div>}
            </>
          )}
        </div>
      </div>

      {viewMsg && (
        <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setViewMsg(null); }}>
          <div className="admin-modal">
            <div className="admin-modal-header"><h5>✉️ संदेश विवरण</h5><button className="admin-modal-close" onClick={() => setViewMsg(null)}><FontAwesomeIcon icon={faTimes} /></button></div>
            <div className="admin-modal-body">
              <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse", marginBottom: 16 }}>
                {[["प्रेषक", viewMsg.firstName + " " + (viewMsg.lastName || "")], ["ईमेल", viewMsg.email], ["मोबाइल", viewMsg.phone || "—"], ["विषय", viewMsg.subject], ["तिथि", fmtDT(viewMsg.createdAt)], ["स्थिति", viewMsg.status]].map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: "1px solid #f0e6d3" }}>
                    <td style={{ padding: "8px 0", color: "#888", fontWeight: 600, width: 90 }}>{k}</td>
                    <td style={{ padding: "8px 0" }}>{v}</td>
                  </tr>
                ))}
              </table>
              <div className="admin-form-group"><label>संदेश</label><div style={{ background: "#fdf8f0", border: "1px solid #e0d5c1", borderRadius: 8, padding: 14, fontSize: 14, lineHeight: 1.7 }}>{viewMsg.message}</div></div>
            </div>
            <div className="admin-modal-footer">
              {viewMsg.status !== "REPLIED" && <button className="btn-admin btn-admin-gold" onClick={() => { updateStatus(viewMsg.id, "REPLIED"); setViewMsg(null); }}><FontAwesomeIcon icon={faCheck} /> उत्तरित चिह्नित करें</button>}
              <button className="btn-admin btn-admin-outline" onClick={() => setViewMsg(null)}>बंद करें</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SETTINGS
════════════════════════════════════════════════════════ */
function SettingsSection({ adminUser }) {
  const { updateProfile } = useAuth();
  const [form, setForm]         = useState({ name: adminUser?.name || "", phone: adminUser?.phone || "", avatar: adminUser?.avatar || "🕉️" });
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving]     = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [alert, showAlert]      = useAlert();
  const AVATARS = ["🕉️","📚","🙏","⚡","🌸","🌿","🏛️","🔱","📖","✍️"];

  const saveProfile = async () => {
    setSaving(true);
    try { await updateProfile(form); showAlert("success", "प्रोफाइल अपडेट हुई"); }
    catch (e) { showAlert("error", e.message || "अपडेट विफल"); }
    setSaving(false);
  };

  const changePassword = async () => {
    if (!passForm.currentPassword || !passForm.newPassword) { showAlert("error", "सभी फ़ील्ड भरें"); return; }
    if (passForm.newPassword !== passForm.confirmPassword) { showAlert("error", "पासवर्ड मेल नहीं खाता"); return; }
    if (passForm.newPassword.length < 8) { showAlert("error", "पासवर्ड 8+ अक्षर का होना चाहिए"); return; }
    setChangingPass(true);
    try { await api.put("/auth/change-password", passForm); showAlert("success", "पासवर्ड बदल गया"); setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }
    catch (e) { showAlert("error", e.message || "पासवर्ड परिवर्तन विफल"); }
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
                  {AVATARS.map(a => <button key={a} onClick={() => setForm(p => ({ ...p, avatar: a }))} style={{ fontSize: 24, background: form.avatar === a ? "rgba(199,54,89,0.12)" : "transparent", border: form.avatar === a ? "2px solid #C73659" : "2px solid #e0d5c1", borderRadius: 10, padding: "4px 8px", cursor: "pointer" }}>{a}</button>)}
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
              <div className="admin-form-group"><label>नया पासवर्ड</label><input type="password" className="admin-input" value={passForm.newPassword} onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))} /></div>
              <div className="admin-form-group"><label>नया पासवर्ड (पुनः)</label><input type="password" className="admin-input" value={passForm.confirmPassword} onChange={e => setPassForm(p => ({ ...p, confirmPassword: e.target.value }))} /></div>
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
              {["🔒 हर 30 दिन में पासवर्ड बदलें","🛡️ मजबूत पासवर्ड: अक्षर, अंक, चिह्न","🕵️ संदिग्ध लॉगिन पर तुरंत लॉगआउट करें","📧 ईमेल नोटिफिकेशन सक्रिय रखें"].map((tip, i) => (
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
   MAIN ADMIN PANEL
════════════════════════════════════════════════════════ */
export default function AdminPanel({ onBackToHome }) {
  const { user, logout }   = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats]  = useState(null);

  const loadStats = useCallback(async () => {
    try { const r = await api.get("/admin/stats"); setStats(r?.data || null); }
    catch { /* ignore */ }
  }, []);
  useEffect(() => { loadStats(); }, [loadStats]);

  const sections = [...new Set(NAV_ITEMS.map(n => n.section))];
  const handleNav = (key) => { setActiveTab(key); if (key === "overview") loadStats(); };

  return (
    <div className="admin-root">
      <aside className={"admin-sidebar" + (!sidebarOpen ? " collapsed" : "")}>
        <div className="admin-sidebar-brand">
          <img src="/logo.png" alt="Logo" onError={e => { e.target.style.display = "none"; }} />
          <div className="brand-text"><h5>आर्य पाठशाला</h5><span>व्यवस्थापक पोर्टल</span></div>
        </div>
        <div className="admin-profile-chip">
          <div className="avatar">{user?.avatar || "🕉️"}</div>
          <div className="info"><h6>{user?.name || "व्यवस्थापक"}</h6><span>ADMIN</span></div>
        </div>
        <nav style={{ flex: 1 }}>
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
          <button className="back-btn" onClick={onBackToHome}><FontAwesomeIcon icon={faArrowLeft} /> मुख्य पोर्टल</button>
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
              <span>🕉️ आर्य पाठशाला — व्यवस्थापक पैनल</span>
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input placeholder="खोजें..." />
            </div>
            <button className="btn-admin btn-admin-outline btn-admin-sm" onClick={loadStats} title="रिफ्रेश करें"><FontAwesomeIcon icon={faSync} /></button>
            <button className="btn-admin btn-admin-primary btn-admin-sm" onClick={onBackToHome}><FontAwesomeIcon icon={faHome} /> पोर्टल</button>
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
          {activeTab === "overview"    && <OverviewSection stats={stats} onTabChange={setActiveTab} />}
          {activeTab === "courses"     && <CoursesSection />}
          {activeTab === "notices"     && <NoticesSection />}
          {activeTab === "users"       && <UsersSection />}
          {activeTab === "enrollments" && <EnrollmentsSection />}
          {activeTab === "messages"    && <MessagesSection />}
          {activeTab === "settings"    && <SettingsSection adminUser={user} />}
        </div>
      </main>
    </div>
  );
}
`;

const target = path.join(__dirname, 'AdminPanel.js');
fs.writeFileSync(target, content, 'utf8');
console.log('AdminPanel.js written: ' + fs.statSync(target).size + ' bytes');
