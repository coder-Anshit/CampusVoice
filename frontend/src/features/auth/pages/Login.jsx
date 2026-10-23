import { useState } from  "react";
import axios from  "axios";
import { User, Lock, ArrowRight, Feather } from  "lucide-react";

const LOGIN_STYLES = `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgb(var(--cv-bg));
          background-image:
            radial-gradient(ellipse 80% 60% at 20% 10%, rgb(var(--cv-primary) / 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 90%, rgb(var(--cv-accent) / 0.12) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 60% 30%, rgb(var(--cv-primary) / 0.07) 0%, transparent 50%);
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
          padding: 20px;
        }

        /* Subtle linen texture overlay */
        .login-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.6;
        }

        /* Decorative botanical leaf shapes */
        .leaf {
          position: absolute;
          border-radius: 50% 0 50% 0;
          pointer-events: none;
        }
        .leaf-1 {
          width: 260px; height: 260px;
          background: rgb(var(--cv-primary) / 0.10);
          top: -80px; right: -60px;
          transform: rotate(-30deg);
        }
        .leaf-2 {
          width: 180px; height: 180px;
          background: rgb(var(--cv-accent) / 0.08);
          bottom: -60px; left: -50px;
          transform: rotate(140deg);
        }
        .leaf-3 {
          width: 120px; height: 120px;
          background: rgb(var(--cv-primary) / 0.07);
          bottom: 80px; right: 40px;
          transform: rotate(60deg);
        }

        .login-card-wrap {
          position: relative;
          width: 100%;
          max-width: 420px;
          z-index: 10;
          animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes fadeUp {
          from  { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .brand-mark {
          text-align: center;
          margin-bottom: 32px;
        }
        .brand-icon-row {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .brand-icon-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgb(var(--cv-primary));
        }
        .brand-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgb(var(--cv-primary));
          font-family: 'DM Sans', sans-serif;
        }
        .brand-title {
          font-family: 'Playfair Display', serif;
          font-size: 38px;
          font-weight: 600;
          color: rgb(var(--cv-text));
          line-height: 1.15;
          margin: 0;
        }
        .brand-title em {
          font-style: italic;
          font-weight: 400;
          color: rgb(var(--cv-primary-hover));
        }
        .brand-sub {
          font-size: 13px;
          color: rgb(var(--cv-text-muted));
          margin-top: 8px;
          font-weight: 300;
          letter-spacing: 0.04em;
        }

        .login-card {
          background: rgb(var(--cv-surface) / 0.88);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgb(var(--cv-primary-border) / 0.55);
          border-radius: 28px;
          padding: 36px 32px;
          box-shadow:
            0 4px 6px rgb(var(--cv-text) / 0.025),
            0 20px 60px rgb(var(--cv-text) / 0.05),
            0 1px 0 rgb(var(--cv-text-inverse) / 0.9) inset;
        }

        .tab-switcher {
          display: flex;
          background: rgb(var(--cv-primary) / 0.07);
          border-radius: 16px;
          padding: 4px;
          margin-bottom: 28px;
          border: 1px solid rgb(var(--cv-primary) / 0.20);
        }
        .tab-btn {
          flex: 1;
          padding: 10px;
          font-size: 13px;
          font-weight: 500;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.22s ease;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.02em;
        }
        .tab-btn.active {
          background: rgb(var(--cv-text-inverse));
          color: rgb(var(--cv-text));
          box-shadow: 0 2px 12px rgb(var(--cv-text) / 0.07);
        }
        .tab-btn.inactive {
          background: transparent;
          color: rgb(var(--cv-text-subtle));
        }
        .tab-btn.inactive:hover { color: rgb(var(--cv-primary-hover)); }

        .fields { display: flex; flex-direction: column; gap: 14px; }

        .input-group {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px; height: 16px;
          color: rgb(var(--cv-primary-border));
          transition: color 0.2s;
          pointer-events: none;
        }
        .input-group:focus-within .input-icon {
          color: rgb(var(--cv-primary-hover));
        }
        .input-field {
          width: 100%;
          background: rgb(var(--cv-surface-soft) / 0.70);
          border: 1.5px solid rgb(var(--cv-primary-border) / 0.55);
          color: rgb(var(--cv-text));
          border-radius: 14px;
          padding: 13px 16px 13px 42px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          font-family: 'DM Sans', sans-serif;
          box-sizing: border-box;
        }
        .input-field::placeholder { color: rgb(var(--cv-text-subtle)); }
        .input-field:focus {
          border-color: rgb(var(--cv-primary-hover) / 0.60);
          background: rgb(var(--cv-surface) / 0.95);
          box-shadow: 0 0 0 4px rgb(var(--cv-primary) / 0.08);
        }

        .error-box {
          background: rgb(var(--cv-danger) / 0.07);
          border: 1px solid rgb(var(--cv-danger) / 0.20);
          border-radius: 12px;
          padding: 11px 14px;
        }
        .error-text { color: rgb(var(--cv-danger)); font-size: 13px; margin: 0; }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, rgb(var(--cv-primary)) 0%, rgb(var(--cv-primary-hover)) 100%);
          color: rgb(var(--cv-text-inverse));
          border: none;
          border-radius: 14px;
          padding: 14px 20px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.03em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.22s ease;
          box-shadow: 0 6px 20px rgb(var(--cv-primary-hover) / 0.28);
          position: relative;
          overflow: hidden;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgb(var(--cv-text-inverse) / 0.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 28px rgb(var(--cv-primary-hover) / 0.36);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgb(var(--cv-text-inverse) / 0.35);
          border-top-color: rgb(var(--cv-text-inverse));
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .arrow-icon { transition: transform 0.15s ease; }
        .submit-btn:hover:not(:disabled) .arrow-icon { transform: translateX(3px); }

        .footer-text {
          text-align: center;
          color: rgb(var(--cv-text-subtle));
          font-size: 11.5px;
          margin-top: 24px;
          font-weight: 300;
          letter-spacing: 0.05em;
        }

        /* Divider line with ornament */
        .divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 4px 0;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: rgb(var(--cv-primary) / 0.25);
        }
        .divider-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: rgb(var(--cv-primary) / 0.40);
        }
`;

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleAuth = async () => {
    if (!username || !password) return;
    try {
      setLoading(true);
      setError("");
      const BASE_URL =
        process.env.REACT_APP_API_URL ?? "http://localhost:5000/api";

      const { data } = await axios.post(`${BASE_URL}/auth/login`, { username, password });
      localStorage.setItem("token",data.token)
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);
      localStorage.setItem("mustChangePassword", String(Boolean(data.mustChangePassword)));
      if (data.mustChangePassword) {
        setMustChangePassword(true);
        return;
      }
      onLogin(data.username);
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) { setError("New password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    try {
      setLoading(true); setError("");
      const BASE_URL = process.env.REACT_APP_API_URL ?? "http://localhost:5000/api";
      await axios.post(`${BASE_URL}/auth/change-password`, { currentPassword: password, newPassword }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      localStorage.setItem("mustChangePassword", "false");
      setMustChangePassword(false);
      onLogin(localStorage.getItem("username"));
    } catch (err) { setError(err.response?.data?.error || "Unable to change password"); }
    finally { setLoading(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAuth();
  };



  if (mustChangePassword) {
    return (
      <>
        <style>{LOGIN_STYLES}</style>
        <div className="login-root">
          <div className="leaf leaf-1" />
          <div className="leaf leaf-2" />
          <div className="leaf leaf-3" />

          <div className="login-card-wrap">
            <div className="brand-mark">
              <div className="brand-icon-row">
                <div className="brand-icon-dot" />
                <span className="brand-label">Campus Voice</span>
                <div className="brand-icon-dot" />
              </div>
              <h1 className="brand-title">Set your<br /><em>password.</em></h1>
              <p className="brand-sub">Create a private password for your account.</p>
            </div>

            <div className="login-card">
              <div className="login-mode-label">
                <span className="tab-btn active">First-time setup</span>
              </div>

              <div className="fields">
                {error && <div className="error-box"><p className="error-text">{error}</p></div>}

                <div className="input-group">
                  <Lock className="input-icon" />
                  <input
                    className="input-field"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleChangePassword(); }}
                    placeholder="New password"
                    autoFocus
                  />
                </div>

                <div className="input-group">
                  <Lock className="input-icon" />
                  <input
                    className="input-field"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleChangePassword(); }}
                    placeholder="Confirm new password"
                  />
                </div>

                <button className="submit-btn" onClick={handleChangePassword} disabled={loading || !newPassword || !confirmPassword}>
                  {loading ? (
                    <>
                      <span className="spinner" />
                      Please wait…
                    </>
                  ) : (
                    <>
                      Set password & continue
                      <ArrowRight className="arrow-icon" style={{ width: 16, height: 16 }} />
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="footer-text">Your username is fixed for this account. Only you control your password.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{LOGIN_STYLES}</style>

      <div className="login-root">
        <div className="leaf leaf-1" />
        <div className="leaf leaf-2" />
        <div className="leaf leaf-3" />

        <div className="login-card-wrap">
          {/* Brand */}
          <div className="brand-mark">
            <div className="brand-icon-row">
              <div className="brand-icon-dot" />
              <span className="brand-label">Campus Voice</span>
              <div className="brand-icon-dot" />
            </div>
            <h1 className="brand-title">
              Raise your<br />
              <em>voice.</em>
            </h1>
            <p className="brand-sub">Stay anonymous. Be heard.</p>
          </div>

          {/* Card */}
          <div className="login-card">
            <div className="login-mode-label">
              <span className="tab-btn active">Sign In</span>
            </div>

            <div className="fields">
              {/* Username */}
              <div className="input-group">
                <User className="input-icon" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Username"
                  className="input-field"
                />
              </div>

              {/* Password */}
              <div className="input-group">
                <Lock className="input-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Password"
                  className="input-field"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="error-box">
                  <p className="error-text">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleAuth}
                disabled={loading || !username || !password}
                className="submit-btn"
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Please wait…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="arrow-icon" style={{ width: 16, height: 16 }} />
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="footer-text">Use the username and temporary password provided by your institution.</p>
        </div>
      </div>
    </>
  );
}