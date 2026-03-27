import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const ROLE_COLORS = {
  admin:   { bg: "#fef3c7", text: "#d97706" },
  manager: { bg: "#dbeafe", text: "#1d4ed8" },
  user:    { bg: "#eef2ff", text: "#4f46e5" },
};

export default function AdminUsers() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null); // user to confirm delete
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const role = localStorage.getItem("role") || "user";

  // Redirect non-admins immediately
  useEffect(() => {
    if (role !== "admin") { navigate("/dashboard"); return; }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/auth/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Backend returns { msg: "...", data: [...] } or array directly — handle both
      setUsers(Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.users || []));
    } catch (err) {
      if (err.response?.status === 403) { navigate("/dashboard"); return; }
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const id = deleteTarget._id || deleteTarget.id;
      await axios.delete(`http://127.0.0.1:8000/auth/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => (u._id || u.id) !== id));
      setDeleteTarget(null);
    } catch {
      setError("Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = users.filter((u) =>
    (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email    || "").toLowerCase().includes(search.toLowerCase())
  );

  const currentUsername = localStorage.getItem("username");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --ink: #1a1a2e; --ink-soft: #4a4a6a; --rule: #e2e2ef;
          --accent: #4f46e5; --accent-light: #eef2ff;
          --bg: #f7f7fb; --surface: #ffffff; --radius: 12px;
          --danger: #dc2626; --danger-light: #fef2f2;
        }
        body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--ink); }

        .admin-root { max-width: 900px; margin: 0 auto; padding: 40px 24px; }

        .back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--ink-soft); text-decoration: none; margin-bottom: 28px; transition: color 0.12s; }
        .back-link:hover { color: var(--accent); }
        .back-link svg { width: 16px; height: 16px; }

        .page-header { margin-bottom: 28px; }
        .page-header h1 { font-family: 'DM Serif Display', serif; font-size: 26px; color: var(--ink); margin-bottom: 4px; }
        .page-header p { font-size: 13px; color: var(--ink-soft); font-weight: 300; }

        .admin-banner {
          background: linear-gradient(135deg, #1a1a2e 0%, #2d2d5e 50%, #1a1a2e 100%);
          border-radius: 12px; padding: 16px 20px;
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 24px;
        }
        .admin-banner svg { width: 20px; height: 20px; fill: #a5b4fc; flex-shrink: 0; }
        .admin-banner span { font-size: 13px; color: rgba(255,255,255,0.65); }

        .toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .search-wrap { position: relative; flex: 1; max-width: 300px; }
        .search-wrap svg { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; fill: var(--ink-soft); pointer-events: none; }
        .search-input { width: 100%; border: 1px solid var(--rule); border-radius: 9px; padding: 9px 12px 9px 34px; font-size: 13.5px; font-family: 'DM Sans', sans-serif; color: var(--ink); background: var(--surface); outline: none; transition: border-color 0.15s; }
        .search-input:focus { border-color: var(--accent); }
        .search-input::placeholder { color: #c0c0d8; }
        .count-chip { font-size: 12.5px; color: var(--ink-soft); background: var(--surface); border: 1px solid var(--rule); border-radius: 20px; padding: 5px 12px; margin-left: auto; }

        .table-wrap { background: var(--surface); border: 1px solid var(--rule); border-radius: var(--radius); overflow: hidden; }
        table { width: 100%; border-collapse: collapse; }
        thead tr { border-bottom: 1px solid var(--rule); }
        thead th { text-align: left; padding: 12px 18px; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-soft); }
        tbody tr { border-bottom: 1px solid var(--rule); transition: background 0.1s; }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: #fafafa; }
        tbody td { padding: 13px 18px; font-size: 13.5px; color: var(--ink); }

        .user-cell { display: flex; align-items: center; gap: 10px; }
        .u-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 500; color: white; flex-shrink: 0; }
        .u-name { font-weight: 500; font-size: 13.5px; }
        .u-email { font-size: 12px; color: var(--ink-soft); font-weight: 300; }

        .role-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; text-transform: capitalize; }

        .you-tag { font-size: 11px; background: #d1fae5; color: #059669; padding: 2px 8px; border-radius: 20px; margin-left: 6px; }

        .del-btn { background: none; border: 1px solid var(--rule); border-radius: 6px; padding: 5px 10px; font-size: 12px; font-family: 'DM Sans', sans-serif; color: var(--ink-soft); cursor: pointer; transition: all 0.12s; }
        .del-btn:hover { border-color: var(--danger); color: var(--danger); }
        .del-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .empty-state { text-align: center; padding: 40px; color: var(--ink-soft); font-size: 14px; }

        /* Confirm dialog */
        .confirm-backdrop { position: fixed; inset: 0; z-index: 200; background: rgba(26,26,46,0.45); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; padding: 24px; animation: fadeIn 0.15s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .confirm-card { background: white; border-radius: 14px; padding: 28px; max-width: 380px; width: 100%; box-shadow: 0 20px 50px rgba(26,26,46,0.18); animation: slideUp 0.18s ease; }
        .confirm-icon { width: 44px; height: 44px; border-radius: 50%; background: var(--danger-light); display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
        .confirm-icon svg { width: 20px; height: 20px; fill: var(--danger); }
        .confirm-title { font-family: 'DM Serif Display', serif; font-size: 19px; color: var(--ink); margin-bottom: 8px; }
        .confirm-text { font-size: 13.5px; color: var(--ink-soft); line-height: 1.5; margin-bottom: 22px; font-weight: 300; }
        .confirm-text strong { color: var(--ink); font-weight: 500; }
        .confirm-btns { display: flex; gap: 10px; justify-content: flex-end; }
        .c-btn { padding: 9px 18px; border-radius: 8px; font-size: 13.5px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.12s; border: 1px solid var(--rule); }
        .c-btn.cancel { background: white; color: var(--ink-soft); }
        .c-btn.cancel:hover { background: #f7f7fb; }
        .c-btn.danger { background: var(--danger); color: white; border-color: var(--danger); }
        .c-btn.danger:hover:not(:disabled) { background: #b91c1c; }
        .c-btn.danger:disabled { opacity: 0.6; cursor: not-allowed; }

        .error-box { background: var(--danger-light); border: 1px solid #fecaca; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: var(--danger); margin-bottom: 16px; }

        .state-center { display: flex; align-items: center; justify-content: center; min-height: 40vh; }
        .state-text { font-size: 15px; color: var(--ink-soft); }
      `}</style>

      <div className="admin-root">
        <Link to="/dashboard" className="back-link">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Dashboard
        </Link>

        <div className="page-header">
          <h1>User Management</h1>
          <p>View and manage all registered user accounts</p>
        </div>

        <div className="admin-banner">
          <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
          <span>Admin area — changes here affect user access and authentication across the system.</span>
        </div>

        {error && <div className="error-box">{error}</div>}

        {loading ? (
          <div className="state-center"><p className="state-text">Loading users…</p></div>
        ) : (
          <>
            <div className="toolbar">
              <div className="search-wrap">
                <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                <input
                  className="search-input"
                  type="search"
                  placeholder="Search users…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <span className="count-chip">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={3}><div className="empty-state">No users found.</div></td></tr>
                  ) : (
                    filtered.map((u) => {
                      const uid = u._id || u.id;
                      const isYou = u.username === currentUsername;
                      const rs = ROLE_COLORS[u.role] ?? ROLE_COLORS.user;
                      return (
                        <tr key={uid}>
                          <td>
                            <div className="user-cell">
                              <div className="u-avatar">{(u.username || "?").slice(0, 2).toUpperCase()}</div>
                              <div>
                                <div className="u-name">
                                  {u.username}
                                  {isYou && <span className="you-tag">You</span>}
                                </div>
                                <div className="u-email">{u.email || "—"}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="role-badge" style={{ background: rs.bg, color: rs.text }}>
                              {u.role || "user"}
                            </span>
                          </td>
                          <td>
                            <button
                              className="del-btn"
                              disabled={isYou}
                              title={isYou ? "Cannot delete your own account" : `Delete ${u.username}`}
                              onClick={() => setDeleteTarget(u)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div className="confirm-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="confirm-card">
            <div className="confirm-icon">
              <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </div>
            <div className="confirm-title">Delete user?</div>
            <p className="confirm-text">
              This will permanently delete <strong>{deleteTarget.username}</strong> and revoke their access. This action cannot be undone.
            </p>
            <div className="confirm-btns">
              <button className="c-btn cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="c-btn danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}