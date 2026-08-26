import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  SearchIcon,
  BellIcon,
  HelpCircleIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  MenuIcon,
  FileTextIcon,
  ChevronDownIcon,
  LayoutDashboardIcon,
  TargetIcon,
  RouteIcon,
  MicIcon,
  BriefcaseIcon,
  BarChart3Icon,
  BotIcon,
  GitCompareIcon,
  BookmarkIcon,
  SparklesIcon
} from '../ui/Icons';
import api from '../../services/api';
import './Topbar.css';

// Central registry of all platform features – used for dashboard search
const PLATFORM_FEATURES = [
  {
    title: 'Dashboard',
    description: 'Overview & stats',
    path: '/dashboard',
    keywords: ['dashboard', 'home', 'overview', 'stats', 'kpi'],
    icon: LayoutDashboardIcon,
  },
  {
    title: 'Resume Builder',
    description: 'Create & edit resume with AI',
    path: '/resume-builder',
    keywords: ['resume builder', 'build resume', 'create resume', 'cv builder', 'edit resume', 'make resume'],
    icon: FileTextIcon,
  },
  {
    title: 'Resume Analysis',
    description: 'ATS score & detailed scan',
    path: '/resume-analysis',
    keywords: ['resume analysis', 'analyze resume', 'ats analysis', 'ats score', 'scan resume', 'check resume', 'analysis'],
    icon: FileTextIcon,
  },
  {
    title: 'Resume Optimization',
    description: 'Tailor resume to job description',
    path: '/job-optimization',
    keywords: ['resume optimization', 'job optimization', 'optimize resume', 'tailor resume', 'cover letter', 'job matching', 'keyword optimization', 'optimization'],
    icon: TargetIcon,
  },
  {
    title: 'Resume Comparison',
    description: 'Compare two resumes side-by-side',
    path: '/resume-comparison',
    keywords: ['resume comparison', 'compare resume', 'compare resumes', 'diff resumes'],
    icon: GitCompareIcon,
  },
  {
    title: 'My Resumes',
    description: 'Manage resume versions',
    path: '/resume-versions',
    keywords: ['my resumes', 'resume versions', 'versions', 'manage resumes', 'saved resumes', 'my-resumes'],
    icon: FileTextIcon,
  },
  {
    title: 'Job Search',
    description: 'AI-powered job tracker',
    path: '/job-search',
    keywords: ['job search', 'find jobs', 'search jobs', 'jobs', 'opportunities', 'job tracker', 'ai job search'],
    icon: BriefcaseIcon,
  },
  {
    title: 'Saved Jobs',
    description: 'Bookmarked opportunities',
    path: '/saved-jobs',
    keywords: ['saved jobs', 'bookmarked jobs', 'favorites', 'saved', 'bookmarks'],
    icon: BookmarkIcon,
  },
  {
    title: 'Career Roadmap',
    description: 'Skills to learn next',
    path: '/career-roadmap',
    keywords: ['career roadmap', 'roadmap', 'career path', 'skills to learn', 'learning path'],
    icon: RouteIcon,
  },
  {
    title: 'AI Interviewer',
    description: 'Mock interview practice',
    path: '/ai-interviewer',
    keywords: ['ai interviewer', 'interview', 'mock interview', 'practice interview', 'interview prep', 'interviewer'],
    icon: MicIcon,
  },
  {
    title: 'Career Assistant',
    description: 'AI chat career helper',
    path: '/career-assistant',
    keywords: ['career assistant', 'ai assistant', 'ai chat', 'assistant', 'chatbot', 'career chat', 'ai help'],
    icon: BotIcon,
  },
  {
    title: 'Progress Analytics',
    description: 'Reports & progress insights',
    path: '/progress-analytics',
    keywords: ['progress analytics', 'analytics', 'progress', 'insights', 'reports', 'statistics'],
    icon: BarChart3Icon,
  },
  {
    title: 'Notifications',
    description: 'Alerts & updates',
    path: '/notifications',
    keywords: ['notifications', 'alerts', 'updates', 'inbox'],
    icon: BellIcon,
  },
  {
    title: 'Profile',
    description: 'Your personal profile',
    path: '/profile',
    keywords: ['profile', 'account', 'user', 'personal info', 'my profile'],
    icon: UserIcon,
  },
  {
    title: 'Settings',
    description: 'Preferences & configuration',
    path: '/settings',
    keywords: ['settings', 'preferences', 'configuration', 'account settings'],
    icon: SettingsIcon,
  },
  {
    title: 'Help & Support',
    description: 'FAQ & support center',
    path: '/help',
    keywords: ['help', 'support', 'faq', 'assistance', 'help center', 'contact'],
    icon: HelpCircleIcon,
  },
];

const Topbar = ({ onMenuClick, pageTitle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setShowUserMenu(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) setShowNotifications(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isPro = user?.plan === 'pro' || user?.subscription === 'pro';

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Resume analysis completed', message: 'Your ATS score improved to 78%', time: '5 minutes ago', unread: true },
    { id: 2, title: 'New job match found', message: 'Software Engineer at Tech Corp', time: '1 hour ago', unread: true },
    { id: 3, title: 'Interview feedback ready', message: 'Check your AI interview results', time: '2 hours ago', unread: false }
  ]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success && Array.isArray(res.data.notifications)) {
        const mapped = res.data.notifications.slice(0,5).map(n => ({
          id: n._id || n.id,
          title: n.title,
          message: n.message,
          time: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Just now',
          unread: !n.read
        }));
        if (mapped.length) setNotifications(mapped);
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const h = () => fetchNotifications();
    window.addEventListener('notifications:read', h);
    const iv = setInterval(fetchNotifications, 30000);
    return () => { window.removeEventListener('notifications:read', h); clearInterval(iv); };
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Feature search filtering
  const filteredFeatures = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    return PLATFORM_FEATURES.filter((f) => {
      const haystack = `${f.title} ${f.description} ${f.keywords.join(' ')} ${f.path}`.toLowerCase();
      // direct substring match wins immediately
      if (haystack.includes(q)) return true;
      // all tokens must be present somewhere
      return tokens.every((t) => haystack.includes(t));
    }).slice(0, 8);
  }, [searchQuery]);

  const handleSelectFeature = (feature) => {
    navigate(feature.path);
    setSearchQuery('');
    setShowSearch(false);
    setActiveIndex(-1);
  };

  const handleSearchKeyDown = (e) => {
    if (!showSearch && filteredFeatures.length > 0 && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setShowSearch(true);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setShowSearch(true);
      setActiveIndex((prev) => (prev + 1) % filteredFeatures.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setShowSearch(true);
      setActiveIndex((prev) => (prev - 1 + filteredFeatures.length) % filteredFeatures.length);
    } else if (e.key === 'Enter') {
      if (showSearch && activeIndex >= 0 && filteredFeatures[activeIndex]) {
        e.preventDefault();
        handleSelectFeature(filteredFeatures[activeIndex]);
      } else if (searchQuery.trim() && filteredFeatures.length > 0) {
        // open first result on Enter
        e.preventDefault();
        handleSelectFeature(filteredFeatures[0]);
      } else if (searchQuery.trim()) {
        // fallback: job search
        navigate(`/job-search?q=${encodeURIComponent(searchQuery.trim())}`);
        setShowSearch(false);
      }
    } else if (e.key === 'Escape') {
      setShowSearch(false);
      setActiveIndex(-1);
      searchInputRef.current?.blur();
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      setShowSearch(true);
      setActiveIndex(-1);
    } else {
      setShowSearch(false);
    }
  }, [searchQuery]);

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="topbar__menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
          <MenuIcon size={22} />
        </button>
        <h1 className="topbar__title">{pageTitle || 'Dashboard'}</h1>
      </div>

      <div className="topbar__center">
        <div className="topbar__search" ref={searchRef}>
          <SearchIcon size={16} className="topbar__search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search features — try 'resume', 'jobs', 'interview', 'roadmap'..."
            className="topbar__search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchQuery.trim()) setShowSearch(true); }}
            onKeyDown={handleSearchKeyDown}
            aria-label="Search platform features"
            autoComplete="off"
          />
          {searchQuery && (
            <button className="topbar__search-clear" onClick={() => { setSearchQuery(''); setShowSearch(false); setActiveIndex(-1); searchInputRef.current?.focus(); }} aria-label="Clear">×</button>
          )}

          {showSearch && searchQuery.trim() && (
            <div className="topbar__search-dropdown" role="listbox" aria-label="Feature search results">
              {filteredFeatures.length > 0 ? (
                <>
                  <div className="topbar__search-hint">Features matching &ldquo;{searchQuery.trim()}&rdquo;</div>
                  <div className="topbar__search-results">
                    {filteredFeatures.map((f, idx) => {
                      const IconComp = f.icon;
                      const isActive = idx === activeIndex;
                      return (
                        <button
                          key={f.path}
                          role="option"
                          aria-selected={isActive}
                          className={`topbar__search-item ${isActive ? 'topbar__search-item--active' : ''}`}
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => handleSelectFeature(f)}
                        >
                          <span className="topbar__search-item-icon"><IconComp size={18} /></span>
                          <span className="topbar__search-item-content">
                            <span className="topbar__search-item-title">{f.title}</span>
                            <span className="topbar__search-item-desc">{f.description}</span>
                          </span>
                          <span className="topbar__search-item-open">Open →</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="topbar__search-footer">
                    <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
                    <span><kbd>↵</kbd> open</span>
                    <span><kbd>esc</kbd> close</span>
                  </div>
                </>
              ) : (
                <div className="topbar__search-empty">
                  <div className="topbar__search-empty-title">No feature found for &ldquo;{searchQuery.trim()}&rdquo;</div>
                  <div className="topbar__search-empty-desc">Try searching for: resume, optimization, interview, roadmap, job search, analytics, settings</div>
                  <button className="topbar__search-empty-btn" onClick={() => { navigate(`/job-search?q=${encodeURIComponent(searchQuery.trim())}`); setShowSearch(false); }}>
                    Search jobs for &ldquo;{searchQuery.trim()}&rdquo; instead
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="topbar__right">
        <button className="topbar__icon-btn" onClick={() => navigate('/help')} aria-label="Help">
          <HelpCircleIcon size={19} />
        </button>

        <div className="topbar__notifications" ref={notificationsRef}>
          <button className="topbar__icon-btn topbar__icon-btn--notifications" onClick={() => setShowNotifications(!showNotifications)} aria-label="Notifications">
            <BellIcon size={19} />
            {unreadCount > 0 && <span className="topbar__notification-badge">{unreadCount}</span>}
          </button>
          {showNotifications && (
            <div className="topbar__dropdown topbar__dropdown--notifications">
              <div className="topbar__dropdown-header">
                <h3 className="topbar__dropdown-title">Notifications</h3>
                <button className="topbar__dropdown-action" onClick={async (e)=>{ e.stopPropagation(); try{ await api.put('/notifications/read-all'); setNotifications(prev=>prev.map(x=>({...x, unread:false}))); window.dispatchEvent(new CustomEvent('notifications:read')); } catch{ setNotifications(prev=>prev.map(x=>({...x, unread:false}))); } }}>Mark all read</button>
              </div>
              <div className="topbar__notification-list">
                {notifications.map((n) => (
                  <div key={n.id} className={`topbar__notification-item ${n.unread ? 'topbar__notification-item--unread' : ''}`} onClick={async ()=>{ if(n.unread){ try{ await api.put(`/notifications/${n.id}/read`);}catch{} setNotifications(prev=>prev.map(x=>x.id===n.id?{...x, unread:false}:x)); window.dispatchEvent(new CustomEvent('notifications:read')); } navigate('/notifications'); setShowNotifications(false); }} style={{cursor:'pointer'}}>
                    <div className="topbar__notification-content">
                      <div className="topbar__notification-title">{n.title}</div>
                      <div className="topbar__notification-message">{n.message}</div>
                      <div className="topbar__notification-time">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="topbar__dropdown-footer">
                <button className="topbar__dropdown-footer-btn" onClick={() => { navigate('/notifications'); setShowNotifications(false); }}>View all notifications</button>
              </div>
            </div>
          )}
        </div>

        <div className="topbar__user-menu" ref={userMenuRef}>
          <button className="topbar__user-btn" onClick={() => setShowUserMenu(!showUserMenu)} aria-label="User menu">
            <div className="topbar__user-avatar">{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
            <div className="topbar__user-info">
              <div className="topbar__user-name">{user?.name || 'Anand'}</div>
              <div className="topbar__user-role">{isPro ? 'Pro Plan' : 'Free Plan'}</div>
            </div>
            <span className={`topbar__plan-badge ${isPro ? 'topbar__plan-badge--pro' : ''}`}>{isPro ? 'Pro' : 'Free'}</span>
            <ChevronDownIcon size={14} className="topbar__user-chevron" />
          </button>

          {showUserMenu && (
            <div className="topbar__dropdown topbar__dropdown--user">
              <div className="topbar__dropdown-section">
                <div className="topbar__dropdown-user-info">
                  <div className="topbar__dropdown-user-avatar">{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
                  <div>
                    <div className="topbar__dropdown-user-name">{user?.name || 'Anand'}</div>
                    <div className="topbar__dropdown-user-email">{user?.email || 'user@example.com'}</div>
                  </div>
                </div>
              </div>
              <div className="topbar__dropdown-divider" />
              <div className="topbar__dropdown-section">
                <button className="topbar__dropdown-item" onClick={() => { navigate('/profile'); setShowUserMenu(false); }}><UserIcon size={16} /><span>Profile</span></button>
                <button className="topbar__dropdown-item" onClick={() => { navigate('/settings'); setShowUserMenu(false); }}><SettingsIcon size={16} /><span>Settings</span></button>
                <button className="topbar__dropdown-item" onClick={() => { navigate('/resume-versions'); setShowUserMenu(false); }}><FileTextIcon size={16} /><span>My Resumes</span></button>
              </div>
              <div className="topbar__dropdown-divider" />
              <div className="topbar__dropdown-section">
                <button className="topbar__dropdown-item topbar__dropdown-item--danger" onClick={handleLogout}><LogOutIcon size={16} /><span>Logout</span></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
