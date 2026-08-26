import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Button, Badge } from '../../components/ui';
import {
  FileTextIcon,
  TargetIcon,
  RouteIcon,
  MicIcon,
  BriefcaseIcon,
  SparklesIcon,
  TrendingUpIcon
} from '../../components/ui/Icons';
import api from '../../services/api';
import './Dashboard.css';

// Arrow Right Icon  
const ArrowRightIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// Check Circle Icon
const CheckCircleIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// Alert Circle Icon
const AlertCircleIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);
  const [stats, setStats] = useState({
    atsScore: 0,
    jobMatches: 0,
    missingSkills: 0,
    resumeStrength: 'Not Analyzed'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load latest resume
      const resumeResponse = await api.get('/resumes/latest');
      if (resumeResponse.data?.success && resumeResponse.data.resume) {
        const latestResume = resumeResponse.data.resume;
        setResume(latestResume);
        
        // Set stats from resume data
        setStats({
          atsScore: latestResume.atsScore || 0,
          jobMatches: 24, // Mock data - replace with real API
          missingSkills: latestResume.improvements?.length || 0,
          resumeStrength: getResumeStrength(latestResume.atsScore || 0)
        });
      }
    } catch (error) {
      console.error('Dashboard data load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResumeStrength = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      icon: <FileTextIcon size={24} />,
      title: 'Build Resume',
      description: 'Create or update your resume',
      color: 'primary',
      path: '/resume-builder'
    },
    {
      icon: <TargetIcon size={24} />,
      title: 'Optimize for Job',
      description: 'Match your resume against a job',
      color: 'secondary',
      path: '/job-optimization'
    },
    {
      icon: <RouteIcon size={24} />,
      title: 'Career Roadmap',
      description: 'See what skills to learn next',
      color: 'success',
      path: '/career-roadmap'
    },
    {
      icon: <MicIcon size={24} />,
      title: 'Practice Interview',
      description: 'Start an AI interview session',
      color: 'warning',
      path: '/ai-interviewer'
    },
    {
      icon: <BriefcaseIcon size={24} />,
      title: 'Search Jobs',
      description: 'Find relevant opportunities',
      color: 'info',
      path: '/job-search'
    }
  ];

  const recentActivity = [
    {
      icon: <FileTextIcon size={16} />,
      title: 'Resume updated',
      time: '2 hours ago',
      status: 'success'
    },
    {
      icon: <TargetIcon size={16} />,
      title: 'Job optimization completed',
      time: '1 day ago',
      status: 'success'
    },
    {
      icon: <MicIcon size={16} />,
      title: 'AI interview completed',
      time: '2 days ago',
      status: 'success'
    }
  ];

  return (
    <AppLayout pageTitle="Dashboard">
      <div className="dashboard">
        {/* Welcome Section */}
        <section className="dashboard__welcome">
          <div className="dashboard__welcome-content">
            <h1 className="dashboard__welcome-title">
              {getGreeting()}, {user?.name || 'there'}! 👋
            </h1>
            <p className="dashboard__welcome-description">
              Your career workspace is ready. Track your resume strength, job matches, 
              and career progress from one place.
            </p>
            
            {resume && (
              <div className="dashboard__resume-status">
                <CheckCircleIcon size={16} className="dashboard__resume-status-icon" />
                <span>
                  Resume loaded: <strong>{resume.fileName || 'Current Resume'}</strong>
                </span>
                <Badge variant="success" size="sm">Active</Badge>
              </div>
            )}
          </div>
        </section>

        {/* KPI Cards */}
        <section className="dashboard__kpis">
          <Card className="dashboard__kpi-card dashboard__kpi-card--primary">
            <div className="dashboard__kpi-icon">
              <TargetIcon size={24} />
            </div>
            <div className="dashboard__kpi-content">
              <div className="dashboard__kpi-label">ATS Score</div>
              <div className="dashboard__kpi-value">{stats.atsScore}%</div>
              <div className="dashboard__kpi-change dashboard__kpi-change--positive">
                <TrendingUpIcon size={14} />
                <span>+8% this month</span>
              </div>
            </div>
            <div className="dashboard__kpi-progress">
              <div 
                className="dashboard__kpi-progress-bar" 
                style={{ width: `${stats.atsScore}%` }}
              />
            </div>
          </Card>

          <Card className="dashboard__kpi-card dashboard__kpi-card--success">
            <div className="dashboard__kpi-icon">
              <CheckCircleIcon size={24} />
            </div>
            <div className="dashboard__kpi-content">
              <div className="dashboard__kpi-label">Resume Strength</div>
              <div className="dashboard__kpi-value">{stats.resumeStrength}</div>
              <div className="dashboard__kpi-description">Based on ATS analysis</div>
            </div>
          </Card>

          <Card className="dashboard__kpi-card dashboard__kpi-card--info">
            <div className="dashboard__kpi-icon">
              <BriefcaseIcon size={24} />
            </div>
            <div className="dashboard__kpi-content">
              <div className="dashboard__kpi-label">Job Matches</div>
              <div className="dashboard__kpi-value">{stats.jobMatches}</div>
              <div className="dashboard__kpi-change dashboard__kpi-change--positive">
                <TrendingUpIcon size={14} />
                <span>+6 this week</span>
              </div>
            </div>
          </Card>

          <Card className="dashboard__kpi-card dashboard__kpi-card--warning">
            <div className="dashboard__kpi-icon">
              <AlertCircleIcon size={24} />
            </div>
            <div className="dashboard__kpi-content">
              <div className="dashboard__kpi-label">Missing Skills</div>
              <div className="dashboard__kpi-value">{stats.missingSkills}</div>
              <div className="dashboard__kpi-description">Needs improvement</div>
            </div>
          </Card>
        </section>

        {/* Two Column Layout */}
        <div className="dashboard__grid">
          {/* Left Column */}
          <div className="dashboard__col-left">
            {/* Resume Health */}
            <Card className="dashboard__card">
              <Card.Header>
                <Card.Title>Resume Health</Card.Title>
                <Card.Description>
                  Overall assessment of your resume quality
                </Card.Description>
              </Card.Header>
              <Card.Body>
                {resume ? (
                  <div className="dashboard__resume-health">
                    <div className="dashboard__health-item">
                      <div className="dashboard__health-label">ATS Score</div>
                      <div className="dashboard__health-bar">
                        <div 
                          className="dashboard__health-bar-fill dashboard__health-bar-fill--primary"
                          style={{ width: `${stats.atsScore}%` }}
                        />
                      </div>
                      <div className="dashboard__health-value">{stats.atsScore}%</div>
                    </div>

                    <div className="dashboard__health-item">
                      <div className="dashboard__health-label">Keyword Match</div>
                      <div className="dashboard__health-bar">
                        <div 
                          className="dashboard__health-bar-fill dashboard__health-bar-fill--success"
                          style={{ width: '82%' }}
                        />
                      </div>
                      <div className="dashboard__health-value">82%</div>
                    </div>

                    <div className="dashboard__health-item">
                      <div className="dashboard__health-label">Skills Coverage</div>
                      <div className="dashboard__health-bar">
                        <div 
                          className="dashboard__health-bar-fill dashboard__health-bar-fill--warning"
                          style={{ width: '74%' }}
                        />
                      </div>
                      <div className="dashboard__health-value">74%</div>
                    </div>
                  </div>
                ) : (
                  <div className="dashboard__empty-state">
                    <FileTextIcon size={48} className="dashboard__empty-icon" />
                    <p className="dashboard__empty-title">No Resume Uploaded</p>
                    <p className="dashboard__empty-description">
                      Upload your resume to see health metrics
                    </p>
                    <Button onClick={() => navigate('/resume-builder')}>
                      Upload Resume
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Quick Actions */}
            <Card className="dashboard__card">
              <Card.Header>
                <Card.Title>Quick Actions</Card.Title>
                <Card.Description>
                  Get started with key features
                </Card.Description>
              </Card.Header>
              <Card.Body>
                <div className="dashboard__quick-actions">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      className={`dashboard__action-card dashboard__action-card--${action.color}`}
                      onClick={() => navigate(action.path)}
                    >
                      <div className="dashboard__action-icon">{action.icon}</div>
                      <div className="dashboard__action-content">
                        <div className="dashboard__action-title">{action.title}</div>
                        <div className="dashboard__action-description">
                          {action.description}
                        </div>
                      </div>
                      <ArrowRightIcon size={18} className="dashboard__action-arrow" />
                    </button>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Right Column */}
          <div className="dashboard__col-right">
            {/* Recommended Next Step */}
            <Card className="dashboard__card dashboard__card--highlight">
              <Card.Header>
                <div className="dashboard__card-header-icon">
                  <SparklesIcon size={20} />
                </div>
                <Card.Title>Recommended Next Step</Card.Title>
              </Card.Header>
              <Card.Body>
                <div className="dashboard__recommendation">
                  {stats.atsScore < 70 ? (
                    <>
                      <p className="dashboard__recommendation-text">
                        Your ATS score is {stats.atsScore}%. Let's optimize your resume
                        to improve your chances with applicant tracking systems.
                      </p>
                      <Button 
                        variant="primary" 
                        fullWidth
                        onClick={() => navigate('/job-optimization')}
                        icon={<TargetIcon size={18} />}
                      >
                        Optimize Resume
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="dashboard__recommendation-text">
                        Great job! Your resume looks strong. Start practicing
                        interviews to prepare for your next opportunity.
                      </p>
                      <Button 
                        variant="primary" 
                        fullWidth
                        onClick={() => navigate('/ai-interviewer')}
                        icon={<MicIcon size={18} />}
                      >
                        Start Interview Practice
                      </Button>
                    </>
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* Recent Activity */}
            <Card className="dashboard__card">
              <Card.Header>
                <Card.Title>Recent Activity</Card.Title>
              </Card.Header>
              <Card.Body>
                {recentActivity.length > 0 ? (
                  <div className="dashboard__activity-list">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="dashboard__activity-item">
                        <div className={`dashboard__activity-icon dashboard__activity-icon--${activity.status}`}>
                          {activity.icon}
                        </div>
                        <div className="dashboard__activity-content">
                          <div className="dashboard__activity-title">
                            {activity.title}
                          </div>
                          <div className="dashboard__activity-time">
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dashboard__empty-state dashboard__empty-state--small">
                    <p>No recent activity</p>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Getting Started */}
            {!resume && (
              <Card className="dashboard__card dashboard__card--info">
                <Card.Header>
                  <Card.Title>Getting Started</Card.Title>
                </Card.Header>
                <Card.Body>
                  <ol className="dashboard__checklist">
                    <li className="dashboard__checklist-item">
                      <CheckCircleIcon size={16} className="dashboard__checklist-icon dashboard__checklist-icon--incomplete" />
                      <span>Upload your resume</span>
                    </li>
                    <li className="dashboard__checklist-item">
                      <CheckCircleIcon size={16} className="dashboard__checklist-icon dashboard__checklist-icon--incomplete" />
                      <span>Run ATS analysis</span>
                    </li>
                    <li className="dashboard__checklist-item">
                      <CheckCircleIcon size={16} className="dashboard__checklist-icon dashboard__checklist-icon--incomplete" />
                      <span>Optimize for a job</span>
                    </li>
                    <li className="dashboard__checklist-item">
                      <CheckCircleIcon size={16} className="dashboard__checklist-icon dashboard__checklist-icon--incomplete" />
                      <span>Practice interview</span>
                    </li>
                  </ol>
                </Card.Body>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
