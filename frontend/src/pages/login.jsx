import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("/auth/login", { username, password });
      const { token, role } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink: #1a1a2e;
          --ink-soft: #4a4a6a;
          --rule: #e2e2ef;
          --accent: #4f46e5;
          --accent-hover: #3730a3;
          --bg: #f7f7fb;
          --surface: #ffffff;
          --error: #dc2626;
          --radius: 12px;
        }

        .auth-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
        }

        /* Left panel */
        .auth-brand {
          background: var(--ink);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          position: relative;
          overflow: hidden;
        }

        .auth-brand::before {
          content: '';
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(79,70,229,0.35) 0%, transparent 70%);
          top: -80px;
          right: -80px;
        }

        .auth-brand::after {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%);
          bottom: 60px;
          left: -60px;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1;
        }

        .brand-icon {
          width: 36px;
          height: 36px;
          background: var(--accent);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-icon svg { width: 20px; height: 20px; fill: white; }

        .brand-name {
          font-family: 'DM Serif Display', serif;
          color: white;
          font-size: 18px;
          letter-spacing: 0.01em;
        }

        .brand-tagline {
          z-index: 1;
        }

        .brand-tagline h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 38px;
          line-height: 1.2;
          color: white;
          margin-bottom: 16px;
        }

        .brand-tagline h2 em {
          color: #a5b4fc;
          font-style: italic;
        }

        .brand-tagline p {
          color: rgba(255,255,255,0.5);
          font-size: 14px;
          font-weight: 300;
          line-height: 1.6;
          max-width: 280px;
        }

        .brand-footer {
          z-index: 1;
          font-size: 12px;
          color: rgba(255,255,255,0.25);
        }

        /* Right panel */
        .auth-form-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
        }

        .auth-card {
          width: 100%;
          max-width: 380px;
        }

        .auth-card h1 {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          color: var(--ink);
          margin-bottom: 6px;
        }

        .auth-card .subtitle {
          font-size: 14px;
          color: var(--ink-soft);
          margin-bottom: 36px;
          font-weight: 300;
        }

        .error-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: var(--error);
          margin-bottom: 20px;
        }

        .field {
          margin-bottom: 20px;
        }

        .field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: var(--ink-soft);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 7px;
        }

        .field input {
          width: 100%;
          border: 1px solid var(--rule);
          border-radius: var(--radius);
          padding: 11px 14px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: var(--ink);
          background: var(--surface);
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
        }

        .field input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
        }

        .field input::placeholder { color: #c0c0d8; }

        .submit-btn {
          width: 100%;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: var(--radius);
          padding: 12px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          margin-top: 8px;
          letter-spacing: 0.02em;
        }

        .submit-btn:hover:not(:disabled) { background: var(--accent-hover); }
        .submit-btn:active:not(:disabled) { transform: scale(0.99); }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .auth-link {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: var(--ink-soft);
        }

        .auth-link a {
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
        }

        .auth-link a:hover { text-decoration: underline; }

        @media (max-width: 768px) {
          .auth-root { grid-template-columns: 1fr; }
          .auth-brand { display: none; }
          .auth-form-wrap { padding: 32px 24px; }
        }
      `}</style>

      <div className="auth-root">
        {/* Brand panel */}
        <div className="auth-brand">
          <div className="brand-logo">
            <div className="brand-icon">
              <svg viewBox="0 0 24 24"><path d="M17 20H7V4h7l3 3v13zM14 2H5a1 1 0 00-1 1v18a1 1 0 001 1h14a1 1 0 001-1V7l-6-5z"/></svg>
            </div>
            <span className="brand-name">Workforce</span>
          </div>

          <div className="brand-tagline">
            <h2>Manage your team with <em>clarity.</em></h2>
            <p>A simple, powerful platform for employee records, roles, and access — all in one place.</p>
          </div>

          <div className="brand-footer">© {new Date().getFullYear()} Workforce. All rights reserved.</div>
        </div>

        {/* Form panel */}
        <div className="auth-form-wrap">
          <div className="auth-card">
            <h1>Welcome back</h1>
            <p className="subtitle">Sign in to your employee account</p>

            {error && <div className="error-box" role="alert">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your.username"
                  autoComplete="username"
                />
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <p className="auth-link">
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}