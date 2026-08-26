import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AppLayout from "../../components/layout/AppLayout";
import { Card, Button, Badge, Loading } from "../../components/ui";
import {
  FileTextIcon,
  RouteIcon,
  MicIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  SparklesIcon,
  ArrowRightIcon,
  ClockIcon,
  TargetIcon,
  BriefcaseIcon,
} from "../../components/ui/Icons";
import "./ProgressAnalytics.css";

function ProgressAnalytics() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);

      const dashboardRes = await api.get("/career-dashboard");
      if (dashboardRes.data?.success) {
        setDashboardData(dashboardRes.data.dashboard);
      }

      const interviewsRes = await api.get("/interviews");
      if (interviewsRes.data?.success) {
        setInterviews(interviewsRes.data.interviews || []);
      }

      const roadmapsRes = await api.get("/career-roadmap");
      if (roadmapsRes.data?.success) {
        setRoadmaps(roadmapsRes.data.roadmaps || []);
      }
    } catch (error) {
      console.error("Load analytics error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const completedInterviews = interviews.filter((i) => i.status === "completed");
  const averageInterviewScore =
    completedInterviews.length > 0
      ? completedInterviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) /
        completedInterviews.length
      : 0;

  const roadmapProgress =
    roadmaps.length > 0
      ? roadmaps.reduce((sum, r) => sum + (r.progressPercentage || 0), 0) / roadmaps.length
      : 0;

  const careerProgressItems = [
    {
      label: "Resume Quality",
      value: dashboardData?.resumeScore || 0,
      color: "primary",
    },
    {
      label: "Career Roadmap",
      value: roadmapProgress,
      color: "success",
    },
    {
      label: "Interview Skills",
      value: averageInterviewScore,
      color: "info",
    },
    {
      label: "Skill Development",
      value: dashboardData?.skillProgress || 0,
      color: "warning",
    },
  ];

  const kpiCards = [
    {
      icon: <TargetIcon size={24} />,
      label: "Resume Score",
      value: `${dashboardData?.resumeScore || 0}%`,
      trend: "+5% this month",
      trendPositive: true,
      color: "primary",
      progress: dashboardData?.resumeScore || 0,
    },
    {
      icon: <RouteIcon size={24} />,
      label: "Roadmap Progress",
      value: `${Math.round(roadmapProgress)}%`,
      trend: roadmapProgress > 0 ? `${roadmaps.length} active` : "Get started",
      trendPositive: roadmapProgress > 0,
      color: "success",
    },
    {
      icon: <MicIcon size={24} />,
      label: "Interview Score",
      value: `${Math.round(averageInterviewScore)}%`,
      trend: `${completedInterviews.length} completed`,
      trendPositive: completedInterviews.length > 0,
      color: "secondary",
    },
    {
      icon: <CheckCircleIcon size={24} />,
      label: "Interviews Done",
      value: completedInterviews.length,
      trend: averageInterviewScore > 0 ? `Avg ${Math.round(averageInterviewScore)}` : "No data yet",
      trendPositive: averageInterviewScore >= 70,
      color: "info",
    },
  ];

  return (
    <AppLayout pageTitle="Progress Analytics">
      <div className="progress-analytics">
        {/* Welcome / Hero Section */}
        <section className="pa__welcome">
          <div className="pa__welcome-content">
            <Badge variant="primary" size="sm" className="pa__welcome-badge">
              PROGRESS ANALYTICS
            </Badge>
            <h1 className="pa__welcome-title">
              Track Your Career Growth 📈
            </h1>
            <p className="pa__welcome-description">
              Monitor your progress across resumes, career roadmaps, interviews,
              and skill development. See how far you've come and where to focus next.
            </p>
          </div>
        </section>

        {loading ? (
          <div className="pa__loading">
            <Loading.Spinner />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <section className="pa__kpis">
              {kpiCards.map((kpi, index) => (
                <Card
                  key={index}
                  className={`pa__kpi-card pa__kpi-card--${kpi.color}`}
                  padding="none"
                >
                  <div className="pa__card-inner">
                    <div className={`pa__kpi-icon pa__kpi-icon--${kpi.color}`}>
                      {kpi.icon}
                    </div>
                    <div className="pa__kpi-content">
                      <div className="pa__kpi-label">{kpi.label}</div>
                      <div className="pa__kpi-value">{kpi.value}</div>
                      {kpi.trend && (
                        <div
                          className={`pa__kpi-change pa__kpi-change--${
                            kpi.trendPositive ? "positive" : "neutral"
                          }`}
                        >
                          {kpi.trendPositive && <TrendingUpIcon size={14} />}
                          <span>{kpi.trend}</span>
                        </div>
                      )}
                    </div>
                    {kpi.progress !== undefined && (
                      <div className="pa__kpi-progress">
                        <div
                          className={`pa__kpi-progress-bar pa__kpi-progress-bar--${kpi.color}`}
                          style={{ width: `${kpi.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </section>

            {/* Two Column Layout */}
            <div className="pa__grid">
              {/* Left Column */}
              <div className="pa__col-left">
                {/* Career Progress Overview */}
                <Card className="pa__card">
                  <Card.Header>
                    <Card.Title>Career Progress Overview</Card.Title>
                    <Card.Description>
                      Your growth across key career metrics
                    </Card.Description>
                  </Card.Header>
                  <Card.Body>
                    <div className="pa__progress-health">
                      {careerProgressItems.map((item, index) => (
                        <div key={index} className="pa__health-item">
                          <div className="pa__health-label">{item.label}</div>
                          <div className="pa__health-bar">
                            <div
                              className={`pa__health-bar-fill pa__health-bar-fill--${item.color}`}
                              style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }}
                            />
                          </div>
                          <div className="pa__health-value">
                            {Math.round(item.value)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>

                {/* Career Roadmaps */}
                {roadmaps.length > 0 ? (
                  <Card className="pa__card">
                    <Card.Header>
                      <Card.Title>Career Roadmaps</Card.Title>
                      <Card.Description>
                        Track progress on your career paths
                      </Card.Description>
                    </Card.Header>
                    <Card.Body>
                      <div className="pa__roadmaps-grid">
                        {roadmaps.map((roadmap, index) => (
                          <button
                            key={roadmap._id || index}
                            className="pa__roadmap-card"
                            onClick={() => navigate("/career-roadmap")}
                          >
                            <div className="pa__roadmap-icon pa__roadmap-icon--success">
                              <RouteIcon size={20} />
                            </div>
                            <div className="pa__roadmap-content">
                              <div className="pa__roadmap-title">
                                {roadmap.targetRole}
                              </div>
                              <div className="pa__roadmap-description">
                                {roadmap.targetIndustry}
                              </div>
                              <div className="pa__roadmap-progress-wrap">
                                <div className="pa__roadmap-progress-meta">
                                  <span>Progress</span>
                                  <span className="pa__roadmap-progress-value">
                                    {roadmap.progressPercentage || 0}%
                                  </span>
                                </div>
                                <div className="pa__health-bar pa__health-bar--sm">
                                  <div
                                    className="pa__health-bar-fill pa__health-bar-fill--success"
                                    style={{
                                      width: `${roadmap.progressPercentage || 0}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <ArrowRightIcon size={18} className="pa__roadmap-arrow" />
                          </button>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                ) : (
                  <Card className="pa__card pa__card--info">
                    <Card.Header>
                      <Card.Title>Career Roadmaps</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <div className="pa__empty-state">
                        <RouteIcon size={48} className="pa__empty-icon" />
                        <p className="pa__empty-title">No Roadmaps Yet</p>
                        <p className="pa__empty-description">
                          Create a career roadmap to track your growth path
                        </p>
                        <Button
                          onClick={() => navigate("/career-roadmap")}
                          icon={<RouteIcon size={18} />}
                        >
                          Create Roadmap
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </div>

              {/* Right Column */}
              <div className="pa__col-right">
                {/* Recommended Next Step */}
                <Card className="pa__card pa__card--highlight">
                  <Card.Header>
                    <div className="pa__card-header-icon">
                      <SparklesIcon size={20} />
                    </div>
                    <Card.Title>Recommended Next Step</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <div className="pa__recommendation">
                      {(dashboardData?.resumeScore || 0) < 70 ? (
                        <>
                          <p className="pa__recommendation-text">
                            Your resume score is {dashboardData?.resumeScore || 0}%.
                            Let's optimize your resume to improve your chances with
                            applicant tracking systems.
                          </p>
                          <Button
                            variant="primary"
                            fullWidth
                            onClick={() => navigate("/job-optimization")}
                            icon={<TargetIcon size={18} />}
                          >
                            Optimize Resume
                          </Button>
                        </>
                      ) : completedInterviews.length === 0 ? (
                        <>
                          <p className="pa__recommendation-text">
                            Great job! Your resume looks strong. Start practicing
                            interviews to prepare for your next opportunity.
                          </p>
                          <Button
                            variant="primary"
                            fullWidth
                            onClick={() => navigate("/ai-interviewer")}
                            icon={<MicIcon size={18} />}
                          >
                            Start Interview Practice
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="pa__recommendation-text">
                            You're doing great! Keep building your skills with a
                            focused career roadmap.
                          </p>
                          <Button
                            variant="primary"
                            fullWidth
                            onClick={() => navigate("/career-roadmap")}
                            icon={<BriefcaseIcon size={18} />}
                          >
                            Build Your Roadmap
                          </Button>
                        </>
                      )}
                    </div>
                  </Card.Body>
                </Card>

                {/* Interview History */}
                {completedInterviews.length > 0 ? (
                  <Card className="pa__card">
                    <Card.Header>
                      <Card.Title>Interview History</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <div className="pa__activity-list">
                        {completedInterviews.slice(0, 5).map((interview, index) => (
                          <div key={interview._id || index} className="pa__activity-item">
                            <div className="pa__activity-icon pa__activity-icon--success">
                              <MicIcon size={16} />
                            </div>
                            <div className="pa__activity-content">
                              <div className="pa__activity-title">
                                {interview.targetRole} — {interview.interviewType}
                              </div>
                              <div className="pa__activity-time">
                                <ClockIcon size={12} />
                                <span>
                                  {new Date(interview.completedAt).toLocaleDateString()}
                                </span>
                                <span className="pa__activity-score">
                                  Score: <strong>{Math.round(interview.overallScore)}</strong>
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                ) : (
                  <Card className="pa__card">
                    <Card.Header>
                      <Card.Title>Interview History</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <div className="pa__empty-state pa__empty-state--small">
                        <MicIcon size={40} className="pa__empty-icon" />
                        <p className="pa__empty-title">No Interviews Yet</p>
                        <p className="pa__empty-description">
                          Practice with AI to build your interview skills
                        </p>
                        <Button
                          size="sm"
                          onClick={() => navigate("/ai-interviewer")}
                          icon={<MicIcon size={16} />}
                        >
                          Start Practice
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                )}

                {/* Quick Actions */}
                <Card className="pa__card">
                  <Card.Header>
                    <Card.Title>Quick Actions</Card.Title>
                    <Card.Description>
                      Jump to key career features
                    </Card.Description>
                  </Card.Header>
                  <Card.Body>
                    <div className="pa__quick-actions">
                      <button
                        className="pa__action-card pa__action-card--primary"
                        onClick={() => navigate("/resume-analysis")}
                      >
                        <div className="pa__action-icon">
                          <FileTextIcon size={20} />
                        </div>
                        <div className="pa__action-content">
                          <div className="pa__action-title">Resume Analysis</div>
                          <div className="pa__action-description">
                            Review ATS score & improvements
                          </div>
                        </div>
                        <ArrowRightIcon size={18} className="pa__action-arrow" />
                      </button>

                      <button
                        className="pa__action-card pa__action-card--success"
                        onClick={() => navigate("/career-roadmap")}
                      >
                        <div className="pa__action-icon">
                          <RouteIcon size={20} />
                        </div>
                        <div className="pa__action-content">
                          <div className="pa__action-title">Career Roadmap</div>
                          <div className="pa__action-description">
                            Build your growth plan
                          </div>
                        </div>
                        <ArrowRightIcon size={18} className="pa__action-arrow" />
                      </button>

                      <button
                        className="pa__action-card pa__action-card--info"
                        onClick={() => navigate("/ai-interviewer")}
                      >
                        <div className="pa__action-icon">
                          <MicIcon size={20} />
                        </div>
                        <div className="pa__action-content">
                          <div className="pa__action-title">AI Interviewer</div>
                          <div className="pa__action-description">
                            Practice mock interviews
                          </div>
                        </div>
                        <ArrowRightIcon size={18} className="pa__action-arrow" />
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

export default ProgressAnalytics;
