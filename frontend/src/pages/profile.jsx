import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const ROLE_COLORS = {
  admin:   { bg: "#fef3c7", text: "#d97706" },
  manager: { bg: "#dbeafe", text: "#1d4ed8" },
  user:    { bg: "#eef2ff", text: "#4f46e5" },
};

export default function Profile() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const navigate              = useNavigate();

  const storedUsername = localStorage.getItem("username") || "User";
  const storedRole     = localStorage.getItem("role")     || "user";

  useEffect(() => {
    const fetchMe = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        const res = await axios.get("http://127.0.0.1:8000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Backend returns { user: { username, role, ... } }
        setUser(res.data?.user || res.data);
      } catch (err) {
        if (err.response?.status === 401) { navigate("/login"); return; }
        setError("Could not load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const roleStyle = ROLE_COLORS[user?.role || storedRole] ?? ROLE_COLORS.user;
  const initials  = (user?.username || storedUsername).slice(0, 2).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --ink: #1a1a2e; --ink-soft: #4a4a6a; --rule: #e2e2ef;
          --accent: #4f46e5; --bg: #f7f7fb; --surface: #ffffff; --radius: 12px;
        }
        body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--ink); }

        .profile-root { max-width: 640px; margin: 0 auto; padding: 40px 24px; }

        .back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--ink-soft); text-decoration: none; margin-bottom: 28px; transition: color 0.12s; }
        .back-link:hover { color: var(--accent); }
        .back-link svg { width: 16px; height: 16px; }

        .card { background: var(--surface); border: 1px solid var(--rule); border-radius: 16px; overflow: hidden; margin-bottom: 20px; }

        .card-banner {
          height: 90px;
          background: linear-gradient(135deg, #1a1a2e 0%, #2d2d5e 100%);
          position: relative;
        }

        .card-body { padding: 0 28px 28px; }

        .avatar-row { display: flex; align-items: flex-end; gap: 16px; margin-top: -38px; margin-bottom: 16px; }

        .avatar {
          width: 76px; height: 76px; border-radius: 50%;
          background: var(--accent);
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Serif Display', serif;
          font-size: 24px; color: white;
          border: 3px solid var(--surface); flex-shrink: 0;
        }

        .profile-name { font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--ink); margin-bottom: 4px; }
        .profile-sub  { font-size: 13px; color: var(--ink-soft); font-weight: 300; }

        .role-badge {
          display: inline-block; padding: 3px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 500; text-transform: capitalize;
          margin-top: 10px;
        }

        .divider { border: none; border-top: 1px solid var(--rule); margin: 20px 0; }

        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .info-item {}
        .info-label { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-soft); margin-bottom: 5px; }
        .info-value { font-size: 14px; color: var(--ink); }

        /* Permissions */
        .perms-card { background: var(--surface); border: 1px solid var(--rule); border-radius: 16px; padding: 24px 28px; margin-bottom: 20px; }
        .perms-title { font-family: 'DM Serif Display', serif; font-size: 18px; color: var(--ink); margin-bottom: 14px; }
        .perms-list  { display: flex; flex-wrap: wrap; gap: 8px; }
        .perm-tag {
          padding: 4px 12px; border-radius: 20px; font-size: 12px;
          background: var(--accent); color: white; font-weight: 400;
        }

        /* Activity */
        .activity-card { background: var(--surface); border: 1px solid var(--rule); border-radius: 16px; padding: 24px 28px; }
        .activity-title { font-family: 'DM Serif Display', serif; font-size: 18px; color: var(--ink); margin-bottom: 14px; }
        .activity-list { list-style: none; }
        .activity-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--rule); }
        .activity-item:last-child { border-bottom: none; }
        .activity-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); margin-top: 5px; flex-shrink: 0; }
        .activity-action { font-size: 13.5px; color: var(--ink); }
        .activity-time   { font-size: 12px; color: var(--ink-soft); font-weight: 300; margin-top: 2px; }
        .empty-text { font-size: 13px; color: var(--ink-soft); padding: 12px 0; }

        .state-center { display: flex; align-items: center; justify-content: center; min-height: 50vh; }
        .state-text { font-size: 15px; color: var(--ink-soft); }

        @media (max-width: 500px) { .info-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="profile-root">
        <Link to="/dashboard" className="back-link">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Dashboard
        </Link>

        {loading && <div className="state-center"><p className="state-text">Loading…</p></div>}
        {!loading && error && <div className="state-center"><p className="state-text" style={{color:"#dc2626"}}>{error}</p></div>}

        {!loading && !error && (
          <>
            {/* Main profile card */}
            <div className="card">
              <div className="card-banner" />
              <div className="card-body">
                
                <div className="profile-name">{user?.username || storedUsername}</div>
                <div className="profile-sub">{user?.email || "No email on record"}</div>
                <span className="role-badge" style={{ background: roleStyle.bg, color: roleStyle.text }}>
                  {user?.role || storedRole}
                </span>

                <hr className="divider" />

                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">Username</div>
                    <div className="info-value">{user?.username || storedUsername}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Role</div>
                    <div className="info-value" style={{ textTransform: "capitalize" }}>{user?.role || storedRole}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Email</div>
                    <div className="info-value">{user?.email || "—"}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Account Status</div>
                    <div className="info-value">Active</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="perms-card">
              <div className="perms-title">Your Permissions</div>
              <div className="perms-list">
                {getPermissions(user?.role || storedRole).map((p) => (
                  <span key={p} className="perm-tag">{p.replace(/_/g, " ")}</span>
                ))}
              </div>
            </div>

            {/* Activity */}
            <div className="activity-card">
              <div className="activity-title">Recent Activity</div>
              {user?.activitylog?.length > 0 ? (
                <ul className="activity-list">
                  {[...user.activitylog].reverse().slice(0, 10).map((log, i) => (
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
                <p className="empty-text">No activity recorded yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

// Mirror of your backend ROLE_PERMISSIONS
function getPermissions(role) {
  const map = {
    admin:   ["create_user", "delete_user", "view_users", "update_user", "view_employees"],
    manager: ["view_users", "update_user", "view_employees"],
    user:    ["view_self"],
  };
  return map[role] ?? ["view_self"];
}