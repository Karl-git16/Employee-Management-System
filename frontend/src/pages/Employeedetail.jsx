import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import EmployeeModal from "./EmployeeModal";

const DEPT_COLORS = {
  Engineering: "#4f46e5", Product: "#0891b2", Design: "#7c3aed",
  HR: "#059669", Finance: "#d97706",
};

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const role = localStorage.getItem("role") || "user";
  const isAdminOrManager = role === "admin" || role === "manager";

  const fetchEmployee = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://127.0.0.1:8000/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployee(res.data);
    } catch (err) {
      setError(err.response?.status === 404 ? "Employee not found." : "Failed to load employee.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployee(); }, [id]);

  const onSaved = () => { setModalOpen(false); fetchEmployee(); };

  const color    = DEPT_COLORS[employee?.department] ?? "#4f46e5";
  const initials = (employee?.name || "").split(" ").map(w => w[0]).join("").toUpperCase() || "??";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --ink: #1a1a2e; --ink-soft: #4a4a6a; --rule: #e2e2ef;
          --accent: #4f46e5; --accent-light: #eef2ff;
          --bg: #f7f7fb; --surface: #ffffff; --radius: 12px;
        }
        body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--ink); }

        .detail-root { max-width: 800px; margin: 0 auto; padding: 40px 24px; }

        .back-link {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; color: var(--ink-soft);
          text-decoration: none; margin-bottom: 28px;
          transition: color 0.12s;
        }
        .back-link:hover { color: var(--accent); }
        .back-link svg { width: 16px; height: 16px; }

        .profile-card {
          background: var(--surface); border: 1px solid var(--rule);
          border-radius: 16px; overflow: hidden; margin-bottom: 20px;
        }

        .profile-banner {
          height: 100px;
          background: linear-gradient(135deg, var(--dept-color, #4f46e5) 0%, var(--dept-color-dark, #3730a3) 100%);
        }

        .profile-body { padding: 0 28px 28px; }

        .avatar-wrap {
          display: flex; align-items: flex-end; justify-content: space-between;
          margin-top: -36px; margin-bottom: 16px;
        }

        .avatar {
          width: 72px; height: 72px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 500; color: white;
          border: 3px solid var(--surface);
          flex-shrink: 0;
        }

        .edit-btn {
          display: flex; align-items: center; gap: 7px;
          background: var(--accent); color: white; border: none;
          border-radius: 9px; padding: 8px 16px;
          font-size: 13px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: background 0.15s;
        }
        .edit-btn:hover { background: #3730a3; }
        .edit-btn svg { width: 14px; height: 14px; fill: white; }

        .profile-name {
          font-family: 'DM Serif Display', serif;
          font-size: 24px; color: var(--ink); margin-bottom: 4px;
        }

        .profile-position { font-size: 14px; color: var(--ink-soft); font-weight: 300; margin-bottom: 14px; }

        .badge-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

        .dept-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 500;
        }

        .status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 500;
        }
        .status-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; }
        .status-badge.active { background: #d1fae5; color: #059669; }
        .status-badge.active::before { background: #10b981; }
        .status-badge.inactive { background: #f3f4f6; color: #6b7280; }
        .status-badge.inactive::before { background: #d1d5db; }

        .divider { border: none; border-top: 1px solid var(--rule); margin: 24px 0; }

        .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

        .info-item {}
        .info-label { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-soft); margin-bottom: 5px; }
        .info-value { font-size: 15px; color: var(--ink); }

        /* Activity */
        .section-card {
          background: var(--surface); border: 1px solid var(--rule);
          border-radius: 16px; padding: 24px 28px;
        }

        .section-title {
          font-family: 'DM Serif Display', serif;
          font-size: 18px; color: var(--ink); margin-bottom: 18px;
        }

        .activity-list { list-style: none; }

        .activity-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 10px 0; border-bottom: 1px solid var(--rule);
        }
        .activity-item:last-child { border-bottom: none; }

        .activity-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--accent); margin-top: 5px; flex-shrink: 0;
        }

        .activity-action { font-size: 13.5px; color: var(--ink); }
        .activity-time { font-size: 12px; color: var(--ink-soft); font-weight: 300; margin-top: 2px; }

        .empty-activity { font-size: 13px; color: var(--ink-soft); text-align: center; padding: 20px 0; }

        /* States */
        .state-center { display: flex; align-items: center; justify-content: center; min-height: 60vh; }
        .state-text { font-size: 15px; color: var(--ink-soft); }
        .error-text { color: #dc2626; }

        @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <div className="detail-root">
        <Link to="/dashboard" className="back-link">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Dashboard
        </Link>

        {loading && (
          <div className="state-center"><p className="state-text">Loading…</p></div>
        )}

        {!loading && error && (
          <div className="state-center"><p className="state-text error-text">{error}</p></div>
        )}

        {!loading && !error && employee && (
          <>
            <div className="profile-card">
              <div
                className="profile-banner"
                style={{ "--dept-color": color, "--dept-color-dark": color + "cc" }}
              />
              <div className="profile-body">
                <div className="avatar-wrap">
                  <div className="avatar" style={{ background: color }}>{initials}</div>
                  {isAdminOrManager && (
                    <button className="edit-btn" onClick={() => setModalOpen(true)}>
                      <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                      Edit
                    </button>
                  )}
                </div>

                <div className="profile-name">{employee.name}</div>
                <div className="profile-position">{employee.position || "No position set"}</div>

                <div className="badge-row">
                  <span className="dept-badge" style={{ background: color + "18", color }}>
                    {employee.department || "No department"}
                  </span>
                  <span className={`status-badge ${employee.status || "active"}`}>
                    {(employee.status || "Active").charAt(0).toUpperCase() + (employee.status || "Active").slice(1)}
                  </span>
                </div>

                <hr className="divider" />

                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">Email</div>
                    <div className="info-value">{employee.email || "—"}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Department</div>
                    <div className="info-value">{employee.department || "—"}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Position</div>
                    <div className="info-value">{employee.position || "—"}</div>
                  </div>
                  {isAdminOrManager && (
                    <div className="info-item">
                      <div className="info-label">Salary</div>
                      <div className="info-value">
                        {employee.salary != null ? `$${Number(employee.salary).toLocaleString()}` : "—"}
                      </div>
                    </div>
                  )}
                  <div className="info-item">
                    <div className="info-label">Status</div>
                    <div className="info-value" style={{ textTransform: "capitalize" }}>{employee.status || "Active"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Log */}
            <div className="section-card">
              <div className="section-title">Activity Log</div>
              {employee.activitylog?.length > 0 ? (
                <ul className="activity-list">
                  {[...employee.activitylog].reverse().map((log, i) => (
                    <li className="activity-item" key={i}>
                      <div className="activity-dot" />
                      <div>
                        <div className="activity-action">{log.action}</div>
                        <div className="activity-time">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : "Unknown time"}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-activity">No activity recorded yet.</p>
              )}
            </div>
          </>
        )}
      </div>

      {modalOpen && employee && (
        <EmployeeModal employee={employee} onClose={() => setModalOpen(false)} onSaved={onSaved} />
      )}
    </>
  );
}