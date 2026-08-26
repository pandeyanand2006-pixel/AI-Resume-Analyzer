import { Link } from "react-router-dom";
import { SparklesIcon } from "../ui/Icons";
import './Header.css';

export default function Header() {
  return (
    <nav className="header">
      <div className="header__container">
        {/* Logo */}
        <Link to="/" className="header__logo">
          <SparklesIcon size={24} className="header__logo-icon" />
          <span className="header__logo-text">
            Resume<span className="header__logo-accent">AI</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="header__nav">
          <a href="#features" className="header__nav-link" onClick={(e)=>{e.preventDefault(); document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}}>
            Features
          </a>
          <a href="#how-it-works" className="header__nav-link" onClick={(e)=>{e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'})}}>
            How It Works
          </a>
          <Link to="/help" className="header__nav-link">
            Help
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="header__actions">
          <Link to="/login" className="header__btn header__btn--ghost">
            Login
          </Link>
          <Link to="/register" className="header__btn header__btn--primary">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
