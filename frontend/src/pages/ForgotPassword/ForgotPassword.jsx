import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { SparklesIcon, MailIcon, AlertCircleIcon, CheckCircleIcon } from "../../components/ui/Icons";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import "../Login/Login.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: email.trim() });
      setSuccess(res.data?.message || "OTP has been sent to your email. Please check inbox and spam (expires in 10 minutes).");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", { email: email.trim(), otp: otp.trim() });
      setSuccess(res.data?.message || "OTP verified successfully.");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!otp.trim()) {
      setError("OTP missing. Please verify again.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password-otp", { email: email.trim(), otp: otp.trim(), password });
      setSuccess(res.data?.message || "Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSuccess("OTP resent. Please check your email (and spam).");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
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
            Forgot Your
            <br />
            Password?
          </h2>
          <p className="auth-page__brand-description">
            No worries — we’ll send a 6-digit OTP to your email. Verify and set a new password.
          </p>
          <div className="auth-page__features">
            <div className="auth-page__feature">
              <div className="auth-page__feature-icon">🔐</div>
              <div className="auth-page__feature-text">
                <div className="auth-page__feature-title">OTP Secure</div>
                <div className="auth-page__feature-desc">6-digit code, expires in 10 minutes</div>
              </div>
            </div>
            <div className="auth-page__feature">
              <div className="auth-page__feature-icon">✉️</div>
              <div className="auth-page__feature-text">
                <div className="auth-page__feature-title">Via SMTP</div>
                <div className="auth-page__feature-desc">Delivered by pandeyanand2006@gmail.com</div>
              </div>
            </div>
            <div className="auth-page__feature">
              <div className="auth-page__feature-icon">⚡</div>
              <div className="auth-page__feature-text">
                <div className="auth-page__feature-title">Quick Reset</div>
                <div className="auth-page__feature-desc">Verify OTP → set new password → login</div>
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
            <h1 className="auth-page__title">
              {step === 1 && "Reset password"}
              {step === 2 && "Enter OTP"}
              {step === 3 && "Set new password"}
            </h1>
            <p className="auth-page__subtitle">
              {step === 1 && "Enter your email and we’ll send you a 6-digit OTP."}
              {step === 2 && `We sent a 6-digit OTP to ${email}. Check inbox & spam.`}
              {step === 3 && "OTP verified. Now create your new password."}
            </p>
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

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="auth-page__form">
              <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" icon={<MailIcon />} required fullWidth disabled={loading} />
              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="auth-page__form">
              <Input label="6-digit OTP" type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Enter 6-digit OTP" required fullWidth disabled={loading} helperText="OTP expires in 10 minutes. Check spam folder." />
              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 4 }}>
                <button type="button" onClick={() => { setStep(1); setOtp(""); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", color: "#64748B", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
                  Change email
                </button>
                <span style={{ color: "#E2E8F0" }}>|</span>
                <button type="button" onClick={handleResend} disabled={loading} style={{ background: "none", border: "none", color: "#4F8CFF", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="auth-page__form">
              <div style={{ fontSize: 12, color: "#64748B", background: "#F8FAFC", padding: "8px 12px", borderRadius: 8, border: "1px solid #E2E8F0", marginBottom: 4 }}>
                OTP verified for <strong>{email}</strong> • <span style={{ color: "#10B981", fontWeight: 700 }}>✓ Verified</span>
              </div>
              <Input label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required fullWidth disabled={loading} />
              <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" required fullWidth disabled={loading} error={confirmPassword && password !== confirmPassword ? "Passwords don't match" : ""} />
              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} disabled={loading}>
                {loading ? "Resetting..." : "Reset password & Login"}
              </Button>
              <button type="button" onClick={() => { setStep(2); setPassword(""); setConfirmPassword(""); setError(""); }} style={{ background: "none", border: "none", color: "#64748B", fontSize: 13, cursor: "pointer", textAlign: "center", width: "100%", textDecoration: "underline" }}>
                Back to OTP
              </button>
            </form>
          )}

          <div className="auth-page__footer">
            <p className="auth-page__footer-text">
              Remembered your password? <Link to="/login" className="auth-page__footer-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
