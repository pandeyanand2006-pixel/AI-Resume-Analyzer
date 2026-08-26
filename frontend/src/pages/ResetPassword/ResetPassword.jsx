import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { SparklesIcon, AlertCircleIcon, CheckCircleIcon } from "../../components/ui/Icons";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import "../Login/Login.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password: formData.password });
      setSuccess(res.data?.message || "Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Reset failed. Link may be expired or invalid.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__panel auth-page__panel--brand">
        <div className="auth-page__brand-content">
          <Link to="/" className="auth-page__logo">
            <SparklesIcon size={32} />
            <span className="auth-page__logo-text">
              Resume<span className="auth-page__logo-accent">AI</span>
            </span>
          </Link>
          <h2 className="auth-page__brand-title">
            Set a New
            <br />
            Password
          </h2>
          <p className="auth-page__brand-description">Choose a strong password you don’t use elsewhere.</p>
          <div className="auth-page__features">
            <div className="auth-page__feature">
              <div className="auth-page__feature-icon">🛡️</div>
              <div className="auth-page__feature-text">
                <div className="auth-page__feature-title">Encrypted & secure</div>
                <div className="auth-page__feature-desc">Password is hashed with bcrypt</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-page__panel auth-page__panel--form">
        <div className="auth-page__form-container">
          <Link to="/login" className="auth-page__back-link">
            ← Back to Login
          </Link>

          <div className="auth-page__header">
            <h1 className="auth-page__title">Choose new password</h1>
            <p className="auth-page__subtitle">Enter your new password below.</p>
          </div>

          {error && (
            <div className="auth-page__error">
              <AlertCircleIcon size={20} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="auth-page__error" style={{ background: "#ECFDF5", borderColor: "#6EE7B7", color: "#065F46" }}>
              <CheckCircleIcon size={20} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-page__form">
            <Input
              label="New Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
              fullWidth
              disabled={loading || !!success}
            />
            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat new password"
              required
              fullWidth
              disabled={loading || !!success}
              error={
                formData.confirmPassword && formData.password !== formData.confirmPassword
                  ? "Passwords don't match"
                  : ""
              }
            />

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} disabled={loading || !!success}>
              {loading ? "Resetting..." : "Reset password"}
            </Button>
          </form>

          <div className="auth-page__footer">
            <p className="auth-page__footer-text">
              Link expired? <Link to="/forgot-password" className="auth-page__footer-link">Request a new one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
