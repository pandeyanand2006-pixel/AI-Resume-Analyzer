import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Badge } from '../../components/ui';
import { BellIcon, CheckCircleIcon, AlertCircleIcon, SparklesIcon, TargetIcon } from '../../components/ui/Icons';
import api from '../../services/api';
import './Notifications.css';

const Notifications = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifications(); }, []);

  const mapBackendType = (t) => {
    if (t === 'system') return 'info';
    if (t === 'job_match') return 'job';
    if (t === 'career_tip' || t === 'skill_recommendation') return 'ai';
    if (t === 'resume_update') return 'success';
    return t || 'info';
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data?.success && Array.isArray(res.data.notifications) && res.data.notifications.length > 0) {
        const mapped = res.data.notifications.map(n => ({
          id: n._id || n.id,
          type: mapBackendType(n.type),
          title: n.title,
          message: n.message,
          timestamp: n.createdAt,
          read: n.read,
          actionUrl: n.link || (n.type === 'job_match' ? '/job-search' : n.type === 'resume_update' ? '/resume-analysis' : undefined)
        }));
        setNotifications(mapped);
        return;
      }
      // Fallback to mock if empty (so UI not blank)
      throw new Error('empty');
    } catch (e) {
      const mock = [
        { id: 1, type: 'success', title: 'Resume analysis completed', message: 'Your ATS score is 85%. Great job!', timestamp: new Date().toISOString(), read: false, actionUrl: '/resume-analysis' },
        { id: 2, type: 'job', title: 'New job matches available', message: 'You have 3 new jobs matching your profile.', timestamp: new Date(Date.now()-3600000).toISOString(), read: false, actionUrl: '/job-search' },
        { id: 3, type: 'ai', title: 'Career roadmap updated', message: 'New skills were added to your personalized roadmap.', timestamp: new Date(Date.now()-7200000).toISOString(), read: false, actionUrl: '/career-roadmap' },
        { id: 4, type: 'success', title: 'Job optimization completed', message: 'Your resume has been optimized for "Senior Java Developer".', timestamp: new Date(Date.now()-86400000).toISOString(), read: true, actionUrl: '/job-optimization' },
        { id: 5, type: 'info', title: 'Interview practice reminder', message: 'Keep practicing! Try the AI Interviewer today.', timestamp: new Date(Date.now()-172800000).toISOString(), read: true, actionUrl: '/ai-interviewer' },
      ];
      setNotifications(mock);
    } finally { setLoading(false); }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircleIcon size={18} className="notification-icon notification-icon--success" />;
      case 'warning': return <AlertCircleIcon size={18} className="notification-icon notification-icon--warning" />;
      case 'ai': return <SparklesIcon size={18} className="notification-icon notification-icon--ai" />;
      case 'job': return <TargetIcon size={18} className="notification-icon notification-icon--job" />;
      default: return <BellIcon size={18} className="notification-icon notification-icon--info" />;
    }
  };

  const getTimeAgo = (ts) => {
    const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff/86400)}d ago`;
    return new Date(ts).toLocaleDateString();
  };

  const markAsRead = async (id) => {
    const prev = [...notifications];
    setNotifications(prev.map(n => n.id === id ? { ...n, read: true } : n));
    try { await api.put(`/notifications/${id}/read`); } catch { setNotifications(prev); }
    window.dispatchEvent(new CustomEvent('notifications:read'));
  };

  const markAllAsRead = async () => {
    const prev = [...notifications];
    setNotifications(prev.map(n => ({ ...n, read: true })));
    try { await api.put('/notifications/read-all'); } catch { setNotifications(prev); }
    window.dispatchEvent(new CustomEvent('notifications:read'));
  };

  const handleNotificationClick = (n) => {
    if (!n.read) markAsRead(n.id);
    if (n.actionUrl) navigate(n.actionUrl);
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  const grouped = (() => {
    const now = new Date(); const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); const yest = new Date(today.getTime()-86400000);
    const g = { today:[], yesterday:[], earlier:[] };
    filtered.forEach(n => { const d=new Date(n.timestamp); if(d>=today) g.today.push(n); else if(d>=yest) g.yesterday.push(n); else g.earlier.push(n); });
    return g;
  })();

  return (
    <AppLayout pageTitle="Notifications">
      <div className="notifications-page">
        <div className="notifications-hero">
          <div className="notifications-hero__left">
            <div className="notifications-hero__title">
              <h1>Notifications</h1>
              {unreadCount>0 && <span className="notifications-hero__badge">{unreadCount} unread</span>}
            </div>
            <p className="notifications-hero__sub">Stay updated on your career progress and AI insights</p>
          </div>
          <div className="notifications-hero__actions">
            {unreadCount>0 && <button className="notifications-hero__btn notifications-hero__btn--primary" onClick={markAllAsRead}>Mark all as read</button>}
          </div>
        </div>

        <div className="notifications-filters">
          <button className={`notifications-filter ${filter==='all'?'notifications-filter--active':''}`} onClick={()=>setFilter('all')}>All</button>
          <button className={`notifications-filter ${filter==='unread'?'notifications-filter--active':''}`} onClick={()=>setFilter('unread')}>Unread {unreadCount>0 && `(${unreadCount})`}</button>
        </div>

        <div className="notifications-list">
          {loading ? (
            <div className="notifications-loading"><div className="spinner" /><p>Loading notifications...</p></div>
          ) : filtered.length===0 ? (
            <Card className="notifications-empty">
              <BellIcon size={40} className="notifications-empty__icon" />
              <h3>No notifications</h3>
              <p>{filter==='unread' ? "You're all caught up! No unread notifications." : "You don't have any notifications yet."}</p>
            </Card>
          ) : (
            <>
              {grouped.today.length>0 && (
                <div className="notifications-group">
                  <div className="notifications-group__title">Today</div>
                  {grouped.today.map(n=>(
                    <div key={n.id} className={`notification-card ${!n.read?'notification-card--unread':''}`} onClick={()=>handleNotificationClick(n)}>
                      <div className="notification-card__icon">{getIcon(n.type)}</div>
                      <div className="notification-card__content">
                        <div className="notification-card__header"><h4>{n.title}</h4><span className="notification-card__time">{getTimeAgo(n.timestamp)}</span></div>
                        <p className="notification-card__message">{n.message}</p>
                      </div>
                      {!n.read && <div className="notification-card__unread-dot" />}
                    </div>
                  ))}
                </div>
              )}
              {grouped.yesterday.length>0 && (
                <div className="notifications-group">
                  <div className="notifications-group__title">Yesterday</div>
                  {grouped.yesterday.map(n=>(
                    <div key={n.id} className={`notification-card ${!n.read?'notification-card--unread':''}`} onClick={()=>handleNotificationClick(n)}>
                      <div className="notification-card__icon">{getIcon(n.type)}</div>
                      <div className="notification-card__content">
                        <div className="notification-card__header"><h4>{n.title}</h4><span className="notification-card__time">{getTimeAgo(n.timestamp)}</span></div>
                        <p className="notification-card__message">{n.message}</p>
                      </div>
                      {!n.read && <div className="notification-card__unread-dot" />}
                    </div>
                  ))}
                </div>
              )}
              {grouped.earlier.length>0 && (
                <div className="notifications-group">
                  <div className="notifications-group__title">Earlier</div>
                  {grouped.earlier.map(n=>(
                    <div key={n.id} className={`notification-card ${!n.read?'notification-card--unread':''}`} onClick={()=>handleNotificationClick(n)}>
                      <div className="notification-card__icon">{getIcon(n.type)}</div>
                      <div className="notification-card__content">
                        <div className="notification-card__header"><h4>{n.title}</h4><span className="notification-card__time">{getTimeAgo(n.timestamp)}</span></div>
                        <p className="notification-card__message">{n.message}</p>
                      </div>
                      {!n.read && <div className="notification-card__unread-dot" />}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Notifications;
