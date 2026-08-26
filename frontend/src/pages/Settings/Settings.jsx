import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Button, Input, Badge } from '../../components/ui';
import { UserIcon, BellIcon, TargetIcon, SparklesIcon, LogOutIcon } from '../../components/ui/Icons';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [profile, setProfile] = useState({
    name: user?.name || 'Anand',
    email: user?.email || 'anand@example.com',
    phone: '',
    location: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    jobAlerts: true,
    aiRecommendations: true,
    weeklyDigest: false
  });

  const [resumePreferences, setResumePreferences] = useState({
    defaultResume: 'Anand_Resume_2026.pdf',
    targetRole: 'Software Engineer',
    preferredIndustry: 'Technology',
    experienceLevel: 'Mid-level'
  });

  const [aiPreferences, setAiPreferences] = useState({
    interviewDifficulty: 'medium',
    assistantVerbosity: 'balanced',
    autoOptimize: true
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // TODO: Call actual API when available
      // await api.put('/user/profile', profile);
      
      setTimeout(() => {
        setSuccessMessage('Profile updated successfully!');
        setSaving(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }, 500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaving(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setSaving(true);
    
    try {
      // TODO: Call actual API when available
      // await api.put('/user/preferences', preferences);
      
      setTimeout(() => {
        setSuccessMessage('Preferences updated successfully!');
        setSaving(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }, 500);
    } catch (error) {
      console.error('Error updating preferences:', error);
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const togglePreference = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <AppLayout pageTitle="Settings">
      <div className="settings-page">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your account and preferences</p>
        </div>

        {successMessage && (
          <div className="settings-success-message">
            {successMessage}
          </div>
        )}

        {/* Profile Settings */}
        <Card className="settings-section">
          <div className="settings-section__header">
            <div className="settings-section__icon">
              <UserIcon size={20} />
            </div>
            <div>
              <h2>Profile Information</h2>
              <p>Update your personal details</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="settings-form">
            <div className="settings-form__grid">
              <div className="settings-form__field">
                <label>Full Name</label>
                <Input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="settings-form__field">
                <label>Email Address</label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="settings-form__field">
                <label>Phone Number</label>
                <Input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+91 00000 00000"
                />
              </div>

              <div className="settings-form__field">
                <label>Location</label>
                <Input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div className="settings-form__actions">
              <Button type="submit" loading={saving}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Notification Preferences */}
        <Card className="settings-section">
          <div className="settings-section__header">
            <div className="settings-section__icon">
              <BellIcon size={20} />
            </div>
            <div>
              <h2>Notifications</h2>
              <p>Manage how you receive updates</p>
            </div>
          </div>

          <div className="settings-toggles">
            <div className="settings-toggle">
              <div className="settings-toggle__info">
                <h3>Email Notifications</h3>
                <p>Receive email updates about your activity</p>
              </div>
              <label className="settings-toggle__switch">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={() => togglePreference('emailNotifications')}
                />
                <span className="settings-toggle__slider" />
              </label>
            </div>

            <div className="settings-toggle">
              <div className="settings-toggle__info">
                <h3>Job Alerts</h3>
                <p>Get notified about new job matches</p>
              </div>
              <label className="settings-toggle__switch">
                <input
                  type="checkbox"
                  checked={preferences.jobAlerts}
                  onChange={() => togglePreference('jobAlerts')}
                />
                <span className="settings-toggle__slider" />
              </label>
            </div>

            <div className="settings-toggle">
              <div className="settings-toggle__info">
                <h3>AI Recommendations</h3>
                <p>Receive AI-powered career suggestions</p>
              </div>
              <label className="settings-toggle__switch">
                <input
                  type="checkbox"
                  checked={preferences.aiRecommendations}
                  onChange={() => togglePreference('aiRecommendations')}
                />
                <span className="settings-toggle__slider" />
              </label>
            </div>

            <div className="settings-toggle">
              <div className="settings-toggle__info">
                <h3>Weekly Digest</h3>
                <p>Get a summary of your weekly progress</p>
              </div>
              <label className="settings-toggle__switch">
                <input
                  type="checkbox"
                  checked={preferences.weeklyDigest}
                  onChange={() => togglePreference('weeklyDigest')}
                />
                <span className="settings-toggle__slider" />
              </label>
            </div>
          </div>

          <div className="settings-form__actions">
            <Button onClick={handlePreferencesUpdate} loading={saving}>
              Save Preferences
            </Button>
          </div>
        </Card>

        {/* Resume Preferences */}
        <Card className="settings-section">
          <div className="settings-section__header">
            <div className="settings-section__icon">
              <TargetIcon size={20} />
            </div>
            <div>
              <h2>Resume Preferences</h2>
              <p>Set your default resume and career goals</p>
            </div>
          </div>

          <div className="settings-form">
            <div className="settings-form__grid">
              <div className="settings-form__field">
                <label>Default Resume</label>
                <Input
                  type="text"
                  value={resumePreferences.defaultResume}
                  onChange={(e) => setResumePreferences({ ...resumePreferences, defaultResume: e.target.value })}
                  placeholder="Select default resume"
                  readOnly
                />
              </div>

              <div className="settings-form__field">
                <label>Target Role</label>
                <Input
                  type="text"
                  value={resumePreferences.targetRole}
                  onChange={(e) => setResumePreferences({ ...resumePreferences, targetRole: e.target.value })}
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div className="settings-form__field">
                <label>Preferred Industry</label>
                <Input
                  type="text"
                  value={resumePreferences.preferredIndustry}
                  onChange={(e) => setResumePreferences({ ...resumePreferences, preferredIndustry: e.target.value })}
                  placeholder="e.g., Technology"
                />
              </div>

              <div className="settings-form__field">
                <label>Experience Level</label>
                <select
                  className="settings-select"
                  value={resumePreferences.experienceLevel}
                  onChange={(e) => setResumePreferences({ ...resumePreferences, experienceLevel: e.target.value })}
                >
                  <option value="Entry-level">Entry-level</option>
                  <option value="Mid-level">Mid-level</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* AI Preferences */}
        <Card className="settings-section">
          <div className="settings-section__header">
            <div className="settings-section__icon">
              <SparklesIcon size={20} />
            </div>
            <div>
              <h2>AI Preferences</h2>
              <p>Customize your AI experience</p>
            </div>
          </div>

          <div className="settings-form">
            <div className="settings-form__grid">
              <div className="settings-form__field">
                <label>Interview Difficulty</label>
                <select
                  className="settings-select"
                  value={aiPreferences.interviewDifficulty}
                  onChange={(e) => setAiPreferences({ ...aiPreferences, interviewDifficulty: e.target.value })}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="settings-form__field">
                <label>Assistant Style</label>
                <select
                  className="settings-select"
                  value={aiPreferences.assistantVerbosity}
                  onChange={(e) => setAiPreferences({ ...aiPreferences, assistantVerbosity: e.target.value })}
                >
                  <option value="concise">Concise</option>
                  <option value="balanced">Balanced</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
            </div>

            <div className="settings-toggles">
              <div className="settings-toggle">
                <div className="settings-toggle__info">
                  <h3>Auto-Optimize Resume</h3>
                  <p>Automatically suggest optimizations for job matches</p>
                </div>
                <label className="settings-toggle__switch">
                  <input
                    type="checkbox"
                    checked={aiPreferences.autoOptimize}
                    onChange={() => setAiPreferences(prev => ({ ...prev, autoOptimize: !prev.autoOptimize }))}
                  />
                  <span className="settings-toggle__slider" />
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Actions */}
        <Card className="settings-section settings-section--danger">
          <div className="settings-section__header">
            <div className="settings-section__icon">
              <LogOutIcon size={20} />
            </div>
            <div>
              <h2>Account</h2>
              <p>Manage your account</p>
            </div>
          </div>

          <div className="settings-actions">
            <Button variant="danger" onClick={handleLogout}>
              <LogOutIcon size={18} />
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Settings;
