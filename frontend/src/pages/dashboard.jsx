import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import EmployeeModal from "./EmployeeModal";

const STATS_CONFIG = [
  { label: "Total Employees", key: "total",      delta: "All registered staff" },
  { label: "Departments",     key: "departments", delta: "Across all teams" },
  { label: "Active Now",      key: "active",      delta: "Currently active" },
  { label: "Open Roles",      key: "openroles",   delta: "Available" },
];

const DEPT_COLORS = {
  Engineering: "#4f46e5",
  Product:     "#0891b2",
  Design:      "#7c3aed",
  HR:          "#059669",
  Finance:     "#d97706",
};

export default function Dashboard() {
  const [search, setSearch]       = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = add, object = edit
  const navigate = useNavigate();

  const role     = localStorage.getItem("role")     || "user";
  const username = localStorage.getItem("username") || "User";
  const isAdminOrManager = role === "admin" || role === "manager";

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/employees", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setEmployees(res.data || []);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  // Derived stats from real data
  const stats = STATS_CONFIG.map((s) => {
    if (s.key === "total")       return { ...s, value: String(employees.length) };
    if (s.key === "departments") return { ...s, value: String(new Set(employees.map(e => e.department).filter(Boolean)).size) };
    if (s.key === "active")      return { ...s, value: String(employees.filter(e => (e.status || "active") === "active").length) };
    if (s.key === "openroles")   return { ...s, value: String(Math.max(0, 20 - employees.length)) };
    return s;
  });

  const departments = ["All", ...Array.from(new Set(employees.map(e => e.department).filter(Boolean)))];

  const filtered = employees.filter((e) => {
    const matchSearch =
      (e.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (e.position?.toLowerCase() || "").includes(search.toLowerCase());
    const matchDept = deptFilter === "All" || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const openAdd  = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (emp) => { setEditTarget(emp); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };
  const onSaved  = () => { closeModal(); fetchEmployees(); };

  // Delete employee
  const deleteEmployee = async (empId) => {
    if (!window.confirm("Are you sure you want to delete this employee? This action cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/employees/${empId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      fetchEmployees();
    } catch (err) {
      alert("Failed to delete employee.");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --ink: #1a1a2e; --ink-soft: #4a4a6a; --rule: #e2e2ef;
          --accent: #4f46e5; --accent-hover: #3730a3; --accent-light: #eef2ff;
          --bg: #f7f7fb; --surface: #ffffff; --radius: 12px; --sidebar-w: 220px;
        }
        body { background: var(--bg); }
        .dash-root { display: grid; grid-template-columns: var(--sidebar-w) 1fr; min-height: 100vh; font-family: 'DM Sans', sans-serif; color: var(--ink); }

        /* Sidebar */
        .sidebar { background: var(--ink); display: flex; flex-direction: column; padding: 28px 20px; position: sticky; top: 0; height: 100vh; }
        .sidebar-logo { display: flex; align-items: center; gap: 9px; margin-bottom: 40px; }
        .sidebar-icon { width: 32px; height: 32px; background: var(--accent); border-radius: 7px; display: flex; align-items: center; justify-content: center; }
        .sidebar-icon svg { width: 17px; height: 17px; fill: white; }
        .sidebar-logo span { font-family: 'DM Serif Display', serif; color: white; font-size: 16px; }
        .nav-label { font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.3); margin-bottom: 8px; margin-top: 24px; padding: 0 4px; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; font-size: 13.5px; font-weight: 400; color: rgba(255,255,255,0.55); cursor: pointer; transition: background 0.12s, color 0.12s; border: none; background: none; width: 100%; text-align: left; margin-bottom: 2px; text-decoration: none; }
        .nav-item svg { width: 16px; height: 16px; flex-shrink: 0; }
        .nav-item:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.85); }
        .nav-item.active { background: var(--accent); color: white; }
        .sidebar-spacer { flex: 1; }
        .sidebar-user { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; background: rgba(255,255,255,0.06); }
        .user-avatar-sm { width: 30px; height: 30px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 500; color: white; flex-shrink: 0; }
        .user-info { flex: 1; overflow: hidden; }
        .user-info .u-name { font-size: 12.5px; font-weight: 500; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-info .u-role { font-size: 11px; color: rgba(255,255,255,0.35); text-transform: capitalize; }
        .logout-btn { background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.35); padding: 2px; transition: color 0.12s; display: flex; }
        .logout-btn:hover { color: rgba(255,255,255,0.7); }
        .logout-btn svg { width: 15px; height: 15px; }

        /* Main */
        .main { padding: 36px 40px; overflow-y: auto; }
        .main-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; }
        .main-header h1 { font-family: 'DM Serif Display', serif; font-size: 26px; color: var(--ink); margin-bottom: 2px; }
        .main-header p { font-size: 13px; color: var(--ink-soft); font-weight: 300; }
        .add-btn { display: flex; align-items: center; gap: 7px; background: var(--accent); color: white; border: none; border-radius: 9px; padding: 9px 16px; font-size: 13.5px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; white-space: nowrap; }
        .add-btn:hover { background: var(--accent-hover); }
        .add-btn svg { width: 15px; height: 15px; fill: white; }

        /* Stats */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        .stat-card { background: var(--surface); border: 1px solid var(--rule); border-radius: var(--radius); padding: 20px 22px; }
        .stat-label { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-soft); margin-bottom: 8px; }
        .stat-value { font-family: 'DM Serif Display', serif; font-size: 32px; color: var(--ink); line-height: 1; margin-bottom: 6px; }
        .stat-delta { font-size: 12px; color: var(--ink-soft); font-weight: 300; }

        /* Toolbar */
        .toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .search-wrap { position: relative; flex: 1; max-width: 320px; }
        .search-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 15px; height: 15px; fill: var(--ink-soft); pointer-events: none; }
        .search-input { width: 100%; border: 1px solid var(--rule); border-radius: 9px; padding: 9px 12px 9px 36px; font-size: 13.5px; font-family: 'DM Sans', sans-serif; color: var(--ink); background: var(--surface); outline: none; transition: border-color 0.15s; }
        .search-input:focus { border-color: var(--accent); }
        .search-input::placeholder { color: #c0c0d8; }
        .filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .filter-tab { padding: 7px 13px; border-radius: 20px; font-size: 12.5px; font-family: 'DM Sans', sans-serif; cursor: pointer; border: 1px solid var(--rule); background: var(--surface); color: var(--ink-soft); transition: all 0.12s; }
        .filter-tab:hover { border-color: var(--accent); color: var(--accent); }
        .filter-tab.active { background: var(--accent-light); border-color: var(--accent); color: var(--accent); font-weight: 500; }

        /* Table */
        .table-wrap { background: var(--surface); border: 1px solid var(--rule); border-radius: var(--radius); overflow: hidden; }
        table { width: 100%; border-collapse: collapse; }
        thead tr { border-bottom: 1px solid var(--rule); }
        thead th { text-align: left; padding: 13px 18px; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-soft); }
        tbody tr { border-bottom: 1px solid var(--rule); transition: background 0.1s; }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: #fafafa; }
        tbody td { padding: 14px 18px; font-size: 13.5px; color: var(--ink); }
        .emp-name-cell { display: flex; align-items: center; gap: 11px; }
        .emp-avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 500; color: white; flex-shrink: 0; }
        .emp-name { font-weight: 500; }
        .emp-role-sub { font-size: 12px; color: var(--ink-soft); font-weight: 300; }
        .dept-pill { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .status-dot { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; }
        .status-dot::before { content: ''; width: 7px; height: 7px; border-radius: 50%; }
        .status-dot.active { color: #059669; }
        .status-dot.active::before { background: #10b981; }
        .status-dot.inactive { color: #9ca3af; }
        .status-dot.inactive::before { background: #d1d5db; }
        .action-btn { background: none; border: 1px solid var(--rule); border-radius: 6px; padding: 5px 10px; font-size: 12px; font-family: 'DM Sans', sans-serif; color: var(--ink-soft); cursor: pointer; transition: all 0.12s; margin-right: 6px; }
        .action-btn:hover { border-color: var(--accent); color: var(--accent); }
        .action-btn.view { text-decoration: none; display: inline-block; }
        .empty-state { text-align: center; padding: 48px 24px; color: var(--ink-soft); font-size: 14px; }

        @media (max-width: 900px) {
          .dash-root { grid-template-columns: 1fr; }
          .sidebar { display: none; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .main { padding: 24px 20px; }
        }
      `}</style>

      <div className="dash-root">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-icon">
              <svg viewBox="0 0 24 24"><path d="M17 20H7V4h7l3 3v13zM14 2H5a1 1 0 00-1 1v18a1 1 0 001 1h14a1 1 0 001-1V7l-6-5z"/></svg>
            </div>
            <span>Workforce</span>
          </div>

          <div className="nav-label">Main</div>
          <Link to="/dashboard" className="nav-item active">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
            Dashboard
          </Link>

          <div className="nav-label">Settings</div>
          <Link to="/profile" className="nav-item">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
            My Profile
          </Link>
          {role === "admin" && (
            <Link to="/admin/users" className="nav-item">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
              User Management
            </Link>
          )}

          <div className="sidebar-spacer" />
          <div className="sidebar-user">
            <div className="user-avatar-sm">{username.slice(0, 2).toUpperCase()}</div>
            <div className="user-info">
              <div className="u-name">{username}</div>
              <div className="u-role">{role}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Sign out">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          <div className="main-header">
            <div>
              <h1>Employees</h1>
              <p>Manage and view all team members</p>
            </div>
            {isAdminOrManager && (
              <button className="add-btn" onClick={openAdd}>
                <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                Add Employee
              </button>
            )}
          </div>

          {/* Stats — values derived from real employee data */}
          <div className="stats-grid">
            {stats.map((s) => (
              <div className="stat-card" key={s.label}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-delta">{s.delta}</div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="toolbar">
            <div className="search-wrap">
              <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              <input
                className="search-input"
                type="search"
                placeholder="Search by name or role…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-tabs">
              {departments.map((d) => (
                <button
                  key={d}
                  className={`filter-tab ${deptFilter === d ? "active" : ""}`}
                  onClick={() => setDeptFilter(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Status</th>
                  {isAdminOrManager && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4}><div className="empty-state">Loading…</div></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4}><div className="empty-state">No employees match your search.</div></td></tr>
                ) : (
                  filtered.map((emp) => {
                    const color = DEPT_COLORS[emp.department] ?? "#4f46e5";
                    const initials = (emp.name || emp.username || "").split(" ").map(w => w[0]).join("").toUpperCase();
                    const empId = emp.employee_id;
                    return (
                      <tr key={empId}>
                        <td>
                          <div className="emp-name-cell">
                            <div className="emp-avatar" style={{ background: color }}>{initials}</div>
                            <div>
                              <div className="emp-name">{emp.name || emp.username}</div>
                              <div className="emp-role-sub">{emp.position || emp.role}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="dept-pill" style={{ background: color + "18", color }}>
                            {emp.department || "—"}
                          </span>
                        </td>
                        <td>
                          <span className={`status-dot ${emp.status || "active"}`}>
                            {(emp.status || "Active").charAt(0).toUpperCase() + (emp.status || "Active").slice(1)}
                          </span>
                        </td>
                        {isAdminOrManager && (
                          <td>
                            <Link to={`/employees/${empId}`} className="action-btn view">View</Link>
                            <button className="action-btn" onClick={() => openEdit(emp)}>Edit</button>
                            <button className="action-btn" style={{ color: '#dc2626', borderColor: '#dc2626' }} onClick={() => deleteEmployee(empId)}>Delete</button>
                          </td>
                        )}
                        {!isAdminOrManager && (
                          <td>
                            <Link to={`/employees/${empId}`} className="action-btn view">View</Link>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <EmployeeModal
          employee={editTarget}
          onClose={closeModal}
          onSaved={onSaved}
        />
      )}
    </>
  );
}