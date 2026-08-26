import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboardIcon,
  FileTextIcon,
  TargetIcon,
  RouteIcon,
  MicIcon,
  BriefcaseIcon,
  BarChart3Icon,
  BellIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  SparklesIcon
} from '../ui/Icons';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  const navigationSections = [
    {
      title: 'MAIN',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboardIcon size={18} /> },
        { path: '/resume-builder', label: 'Resume Builder', icon: <FileTextIcon size={18} />, badge: 'AI' },
        { path: '/job-optimization', label: 'Resume Optimization', icon: <TargetIcon size={18} />, badge: 'AI' },
        { path: '/career-roadmap', label: 'Career Roadmap', icon: <RouteIcon size={18} />, badge: 'AI' },
        { path: '/ai-interviewer', label: 'AI Interviewer', icon: <MicIcon size={18} />, badge: 'AI' }
      ]
    },
    {
      title: 'CAREER',
      items: [
        { path: '/job-search', label: 'Job Search', icon: <BriefcaseIcon size={18} /> },
        { path: '/progress-analytics', label: 'Progress Analytics', icon: <BarChart3Icon size={18} /> }
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { path: '/profile', label: 'Profile', icon: <UserIcon size={18} /> },
        { path: '/notifications', label: 'Notifications', icon: <BellIcon size={18} /> },
        { path: '/settings', label: 'Settings', icon: <SettingsIcon size={18} /> }
      ]
    }
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        {/* Logo */}
        <div className="sidebar__logo">
          <Link to="/dashboard" className="sidebar__logo-link" onClick={onClose}>
            <span className="sidebar__logo-mark">
              <SparklesIcon size={22} />
            </span>
            <span className="sidebar__logo-text">
              Resume<span className="sidebar__logo-text--accent">AI</span>
            </span>
          </Link>
        </div>

        <nav className="sidebar__nav">
          {navigationSections.map((section) => (
            <div key={section.title} className="sidebar__section">
              <div className="sidebar__section-title">{section.title}</div>
              <ul className="sidebar__nav-list">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`sidebar__nav-item ${isActive(item.path) ? 'sidebar__nav-item--active' : ''}`}
                      onClick={onClose}
                    >
                      <span className="sidebar__nav-icon">{item.icon}</span>
                      <span className="sidebar__nav-label">{item.label}</span>
                      {item.badge === 'AI' && <span className="sidebar__nav-badge sidebar__nav-badge--ai">AI</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Logout */}
          <div className="sidebar__section">
            <ul className="sidebar__nav-list">
              <li>
                <button className="sidebar__nav-item sidebar__nav-item--button" onClick={handleLogout}>
                  <span className="sidebar__nav-icon"><LogOutIcon size={18} /></span>
                  <span className="sidebar__nav-label">Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>


      </aside>
    </>
  );
};

export default Sidebar;
