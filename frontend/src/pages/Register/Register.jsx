import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { SparklesIcon, UserIcon, MailIcon, AlertCircleIcon, CheckCircleIcon } from "../../components/ui/Icons";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import "../Login/Login.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  // Password strength checker
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength('');
      return;
    }

    const password = formData.password;
    let strength = '';

    if (password.length < 6) {
      strength = 'weak';
    } else if (password.length < 10) {
      strength = 'medium';
    } else if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      strength = 'strong';
    } else {
      strength = 'medium';
    }

    setPasswordStrength(strength);
  }, [formData.password]);

  const passwordRequirements = [
    { text: '8+ characters', met: formData.password.length >= 8 },
    { text: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'One number', met: /[0-9]/.test(formData.password) }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { name, email, password, confirmPassword } = formData;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      console.log("Registration response:", response.data);

      setSuccess("Account created successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Registration failed. Please check your connection and try again.");
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
            Start Your Career
            <br />
            Journey Today.
          </h2>

          <p className="auth-page__brand-description">
            Join thousands of professionals who are accelerating their careers with AI
          </p>

          <div className="auth-page__features">
            <div className="auth-page__feature">
              <div className="auth-page__feature-icon">🚀</div>
              <div className="auth-page__feature-text">
                <div className="auth-page__feature-title">Quick Setup</div>
                <div className="auth-page__feature-desc">Get started in under 2 minutes</div>
              </div>
            </div>

            <div className="auth-page__feature">
              <div className="auth-page__feature-icon">🔒</div>
              <div className="auth-page__feature-text">
                <div className="auth-page__feature-title">Secure & Private</div>
                <div className="auth-page__feature-desc">Your data is encrypted and protected</div>
              </div>
            </div>

            <div className="auth-page__feature">
              <div className="auth-page__feature-icon">💼</div>
              <div className="auth-page__feature-text">
                <div className="auth-page__feature-title">Free to Start</div>
                <div className="auth-page__feature-desc">No credit card required</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="auth-page__panel auth-page__panel--form">
        <div className="auth-page__form-container">
          {/* Back to Home */}
          <Link to="/" className="auth-page__back-link">
            ← Back to Home
          </Link>

          {/* Form Header */}
          <div className="auth-page__header">
            <h1 className="auth-page__title">Create Account</h1>
            <p className="auth-page__subtitle">
              Start optimizing your career with AI-powered tools
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="auth-page__error">
              <AlertCircleIcon size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="auth-page__error" style={{ background: 'var(--color-success-bg)', borderColor: 'var(--color-success-border)', color: 'var(--color-success-dark)' }}>
              <CheckCircleIcon size={20} />
              <span>{success}</span>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="auth-page__form">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              icon={<UserIcon />}
              required
              fullWidth
              disabled={loading}
            />

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
              disabled={loading}
            />

            <div>
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
                fullWidth
                disabled={loading}
              />
              
              {formData.password && (
                <div className="auth-page__password-strength">
                  <div className="auth-page__password-strength-bar">
                    <div className={`auth-page__password-strength-fill auth-page__password-strength-fill--${passwordStrength}`}></div>
                  </div>
                  <div className="auth-page__password-requirements">
                    {passwordRequirements.map((req, index) => (
                      <div 
                        key={index} 
                        className={`auth-page__password-requirement ${req.met ? 'auth-page__password-requirement--met' : ''}`}
                      >
                        {req.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              fullWidth
              disabled={loading}
              error={formData.confirmPassword && formData.password !== formData.confirmPassword ? "Passwords don't match" : ""}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="auth-page__footer">
            <p className="auth-page__footer-text">
              Already have an account?{" "}
              <Link to="/login" className="auth-page__footer-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;