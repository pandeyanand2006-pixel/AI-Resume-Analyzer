import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { SparklesIcon, MailIcon, AlertCircleIcon } from "../../components/ui/Icons";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);

      if (response.data.success) {
        login(response.data.user, response.data.token);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Unable to connect to the server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel - Branding */}
      <div className="auth-page__panel auth-page__panel--brand">
        <div className="auth-page__brand-content">
          <Link to="/" className="auth-page__logo">
            <SparklesIcon size={32} />
            <span className="auth-page__logo-text">
              Resume<span className="auth-page__logo-accent">AI</span>
            </span>
          </Link>

          <h2 className="auth-page__brand-title">
            Build Your Career.
            <br />
            Master Your Future.
          </h2>

          <p className="auth-page__brand-description">
            AI-powered career development platform trusted by thousands of professionals
          </p>

          <div className="auth-page__features">
            <div className="auth-page__feature">
              <div className="auth-page__feature-icon">✨</div>
              <div className="auth-page__feature-text">
                <div className="auth-page__feature-title">AI-Powered Tools</div>
                <div className="auth-page__feature-desc">Smart resume building & optimization</div>
              </div>
            </div>

            <div className="auth-page__feature">
              <div className="auth-page__feature-icon">📊</div>
              <div className="auth-page__feature-text">
                <div className="auth-page__feature-title">Career Analytics</div>
                <div className="auth-page__feature-desc">Track your growth & progress</div>
              </div>
            </div>

            <div className="auth-page__feature">
              <div className="auth-page__feature-icon">🎯</div>
              <div className="auth-page__feature-text">
                <div className="auth-page__feature-title">Job Matching</div>
                <div className="auth-page__feature-desc">Find perfect opportunities</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="auth-page__panel auth-page__panel--form">
        <div className="auth-page__form-container">
          {/* Back to Home */}
          <Link to="/" className="auth-page__back-link">
            ← Back to Home
          </Link>

          {/* Form Header */}
          <div className="auth-page__header">
            <h1 className="auth-page__title">Welcome Back</h1>
            <p className="auth-page__subtitle">
              Sign in to access your career dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="auth-page__error">
              <AlertCircleIcon size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="auth-page__form">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              icon={<MailIcon />}
              required
              fullWidth
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              fullWidth
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px' }}>
              <Link
                to="/forgot-password"
                style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary, #4F8CFF)', textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="auth-page__footer">
            <p className="auth-page__footer-text">
              Don't have an account?{" "}
              <Link to="/register" className="auth-page__footer-link">
                Create one for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;