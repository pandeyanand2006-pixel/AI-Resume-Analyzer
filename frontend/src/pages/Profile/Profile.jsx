import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Button } from '../../components/ui';
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  EditIcon,
  SaveIcon
} from '../../components/ui/Icons';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || 'User Name',
    email: user?.email || 'user@example.com',
    phone: '+91 00000 00000',
    location: 'City, Country',
    role: 'Software Engineer',
    company: 'Company Name',
    joinedDate: '2024',
    bio: 'Passionate professional looking to advance my career with AI-powered tools.'
  });

  const handleSave = () => {
    setIsEditing(false);
    // TODO: Save to backend
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <AppLayout pageTitle="Profile">
      <div className="profile-page">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-header__background"></div>
          <div className="profile-header__content">
            <div className="profile-avatar">
              <div className="profile-avatar__image">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <button className="profile-avatar__edit">
                <EditIcon size={16} />
              </button>
            </div>
            <div className="profile-header__info">
              <h1 className="profile-header__name">{profile.name}</h1>
              <p className="profile-header__role">{profile.role} at {profile.company}</p>
              <div className="profile-header__meta">
                <span className="profile-header__meta-item">
                  <CalendarIcon size={16} />
                  Member since {profile.joinedDate}
                </span>
              </div>
            </div>
            <div className="profile-header__actions">
              {isEditing ? (
                <>
                  <Button variant="primary" onClick={handleSave} icon={<SaveIcon size={18} />}>
                    Save Changes
                  </Button>
                  <Button variant="secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="primary" onClick={() => setIsEditing(true)} icon={<EditIcon size={18} />}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="profile-content">
          {/* Personal Information */}
          <Card className="profile-card">
            <Card.Header>
              <Card.Title>Personal Information</Card.Title>
              <Card.Description>Your basic account details</Card.Description>
            </Card.Header>
            <Card.Body>
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <div className="profile-info-item__icon">
                    <UserIcon size={20} />
                  </div>
                  <div className="profile-info-item__content">
                    <div className="profile-info-item__label">Full Name</div>
                    {isEditing ? (
                      <input
                        type="text"
                        className="profile-info-item__input"
                        value={profile.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    ) : (
                      <div className="profile-info-item__value">{profile.name}</div>
                    )}
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-item__icon">
                    <MailIcon size={20} />
                  </div>
                  <div className="profile-info-item__content">
                    <div className="profile-info-item__label">Email</div>
                    {isEditing ? (
                      <input
                        type="email"
                        className="profile-info-item__input"
                        value={profile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    ) : (
                      <div className="profile-info-item__value">{profile.email}</div>
                    )}
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-item__icon">
                    <PhoneIcon size={20} />
                  </div>
                  <div className="profile-info-item__content">
                    <div className="profile-info-item__label">Phone</div>
                    {isEditing ? (
                      <input
                        type="tel"
                        className="profile-info-item__input"
                        value={profile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    ) : (
                      <div className="profile-info-item__value">{profile.phone}</div>
                    )}
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-item__icon">
                    <MapPinIcon size={20} />
                  </div>
                  <div className="profile-info-item__content">
                    <div className="profile-info-item__label">Location</div>
                    {isEditing ? (
                      <input
                        type="text"
                        className="profile-info-item__input"
                        value={profile.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                      />
                    ) : (
                      <div className="profile-info-item__value">{profile.location}</div>
                    )}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Professional Information */}
          <Card className="profile-card">
            <Card.Header>
              <Card.Title>Professional Information</Card.Title>
              <Card.Description>Your career details</Card.Description>
            </Card.Header>
            <Card.Body>
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <div className="profile-info-item__icon">
                    <BriefcaseIcon size={20} />
                  </div>
                  <div className="profile-info-item__content">
                    <div className="profile-info-item__label">Current Role</div>
                    {isEditing ? (
                      <input
                        type="text"
                        className="profile-info-item__input"
                        value={profile.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                      />
                    ) : (
                      <div className="profile-info-item__value">{profile.role}</div>
                    )}
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-item__icon">
                    <BriefcaseIcon size={20} />
                  </div>
                  <div className="profile-info-item__content">
                    <div className="profile-info-item__label">Company</div>
                    {isEditing ? (
                      <input
                        type="text"
                        className="profile-info-item__input"
                        value={profile.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                      />
                    ) : (
                      <div className="profile-info-item__value">{profile.company}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="profile-info-item profile-info-item--full">
                <div className="profile-info-item__content">
                  <div className="profile-info-item__label">Bio</div>
                  {isEditing ? (
                    <textarea
                      className="profile-info-item__textarea"
                      value={profile.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                    />
                  ) : (
                    <div className="profile-info-item__value">{profile.bio}</div>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Stats */}
          <div className="profile-stats">
            <div className="profile-stat-card">
              <div className="profile-stat-card__value">12</div>
              <div className="profile-stat-card__label">Resumes Created</div>
            </div>
            <div className="profile-stat-card">
              <div className="profile-stat-card__value">85/100</div>
              <div className="profile-stat-card__label">Best ATS Score</div>
            </div>
            <div className="profile-stat-card">
              <div className="profile-stat-card__value">24</div>
              <div className="profile-stat-card__label">Job Matches</div>
            </div>
            <div className="profile-stat-card">
              <div className="profile-stat-card__value">5</div>
              <div className="profile-stat-card__label">Interviews Completed</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
