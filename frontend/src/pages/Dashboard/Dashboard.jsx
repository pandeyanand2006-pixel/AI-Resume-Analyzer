import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/layout/AppLayout';
import CircularProgress from '../../components/ui/CircularProgress';
import {
  FileTextIcon,
  TargetIcon,
  RouteIcon,
  MicIcon,
  BriefcaseIcon,
  TrendingUpIcon,
  SparklesIcon,
  CheckCircleIcon,
  SearchIcon,
  UserIcon,
  EditIcon,
  BookmarkIcon
} from '../../components/ui/Icons';
import api from '../../services/api';
import './DashboardNew.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resume, setResume] = useState(null);
  const [stats, setStats] = useState({ atsScore: 0, jobMatches: 24, missingSkills: 0, resumeStrength: 'Not Analyzed', profileCompletion: 68 });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/resumes/latest');
      if (res.data?.success && res.data.resume) {
        const r = res.data.resume;
        setResume(r);
        const score = r.atsScore || 0;
        setStats({
          atsScore: score,
          jobMatches: 24,
          missingSkills: r.improvements?.length || 3,
          resumeStrength: score >= 80 ? 'Strong' : score >= 55 ? 'Moderate' : score > 0 ? 'Weak' : 'Not Analyzed',
          profileCompletion: score > 0 ? Math.min(90, 48 + score / 2) : 48
        });
      }
    } catch (e) { /* ignore */ }
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const strengthColor = stats.resumeStrength === 'Strong' ? '#10B981' : stats.resumeStrength === 'Moderate' ? '#F59E0B' : stats.resumeStrength === 'Weak' ? '#EF4444' : '#94A3B8';

  return (
    <AppLayout pageTitle="Dashboard">
      <div className="dashboard">
        {/* HERO */}
        <section className="dash-hero">
          <div className="dash-hero__content">
            <div className="dash-hero__text">
              <h1 className="dash-hero__title">{getGreeting()}, {user?.name || 'Anand'} 👋</h1>
              <p className="dash-hero__desc">Your AI career workspace is ready. Track resume strength, ATS score, job matches, and career progress from one place.</p>
              <div className="dash-hero__actions">
                <button className="dash-hero__btn dash-hero__btn--primary" onClick={() => navigate('/resume-analysis')}>Analyze Resume</button>
                <button className="dash-hero__btn dash-hero__btn--ghost" onClick={() => navigate('/job-search')}>Find Jobs</button>
              </div>
            </div>
            <div className="dash-hero__card">
              <div className="dash-hero__card-top">
                <SparklesIcon size={18} />
                <span>Resume Score</span>
                <span className="dash-hero__card-badge">{stats.atsScore}/100</span>
              </div>
              <div className="dash-hero__preview">
                <div className="dash-hero__preview-left">
                  <div className="dash-hero__mini-score">
                    <svg viewBox="0 0 80 44" className="dash-hero__gauge">
                      <path d="M10 40 A30 30 0 0 1 70 40" fill="none" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
                      <path d="M10 40 A30 30 0 0 1 70 40" fill="none" stroke="#22C7D6" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(stats.atsScore/100)*94.2} 94.2`} />
                    </svg>
                    <div className="dash-hero__gauge-text"><strong>{stats.atsScore || 82}%</strong><span>ATS Score</span></div>
                  </div>
                  <ul className="dash-hero__mini-list">
                    <li><CheckCircleIcon size={12} /> ATS Parse Rate</li>
                    <li><CheckCircleIcon size={12} /> Quantifying Impact</li>
                    <li className="is-warn">✕ Repetition</li>
                  </ul>
                </div>
                <div className="dash-hero__preview-right">
                  <div className="dash-hero__bar-label">ATS PARSE RATE</div>
                  <div className="dash-hero__bar"><span style={{width: '92%'}} /></div>
                  <div className="dash-hero__bar-label">CONTENT</div>
                  <div className="dash-hero__bar"><span style={{width: '84%'}} /></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KPI ROW - 4 cards spec */}
        <section className="dash-kpis">
          <div className="dash-kpi dash-kpi--hover">
            <div className="dash-kpi__top">
              <span className="dash-kpi__label">ATS Score</span>
              <span className="dash-kpi__icon dash-kpi__icon--cyan"><TargetIcon size={16} /></span>
            </div>
            <div className="dash-kpi__main">
              <CircularProgress score={stats.atsScore || 82} size="sm" color="auto" showLabel={false} />
              <div className="dash-kpi__value">{stats.atsScore || 82}%</div>
            </div>
            <div className="dash-kpi__foot"><TrendingUpIcon size={12} /> <span>+8% this month</span></div>
            <div className="dash-kpi__progress"><span style={{width: `${stats.atsScore || 82}%`}} /></div>
          </div>

          <div className="dash-kpi dash-kpi--hover">
            <div className="dash-kpi__top">
              <span className="dash-kpi__label">Resume Strength</span>
              <span className="dash-kpi__icon dash-kpi__icon--emerald"><CheckCircleIcon size={16} /></span>
            </div>
            <div className="dash-kpi__value dash-kpi__value--lg" style={{color: strengthColor}}>{stats.resumeStrength}</div>
            <div className="dash-kpi__sub">Based on ATS analysis</div>
            <div className="dash-kpi__badge" style={{background: strengthColor + '18', color: strengthColor, borderColor: strengthColor + '30'}}>{stats.resumeStrength === 'Strong' ? 'Ready to apply' : 'Needs work'}</div>
          </div>

          <div className="dash-kpi dash-kpi--hover" onClick={() => navigate('/job-search')}>
            <div className="dash-kpi__top">
              <span className="dash-kpi__label">Job Matches</span>
              <span className="dash-kpi__icon dash-kpi__icon--blue"><BriefcaseIcon size={16} /></span>
            </div>
            <div className="dash-kpi__value dash-kpi__value--lg">{stats.jobMatches}</div>
            <div className="dash-kpi__sub">Matching opportunities</div>
            <div className="dash-kpi__foot dash-kpi__foot--blue"><TrendingUpIcon size={12} /> +6 this week</div>
          </div>

          <div className="dash-kpi dash-kpi--hover">
            <div className="dash-kpi__top">
              <span className="dash-kpi__label">Profile Completion</span>
              <span className="dash-kpi__icon dash-kpi__icon--violet"><UserIcon size={16} /></span>
            </div>
            <div className="dash-kpi__value dash-kpi__value--lg">{Math.round(stats.profileCompletion)}%</div>
            <div className="dash-kpi__progress dash-kpi__progress--thin"><span style={{width: `${stats.profileCompletion}%`, background: 'linear-gradient(135deg,#22C7D6,#4F8CFF)'}} /></div>
            <div className="dash-kpi__sub">{stats.profileCompletion < 100 ? 'Add skills & experience' : 'All good!'}</div>
          </div>
        </section>

        {/* SECOND SECTION - Enhancv dark + category cards */}
        <section className="dash-dark">
          <div className="dash-dark__head">
            <h2>The AI-powered Resume Checker goes beyond typos</h2>
            <p>We've built in various AI models to check your resume against what both ATS software and human recruiters look for. 27 crucial checks across seven categories — all in one dashboard.</p>
          </div>

          <div className="dash-cats">
            <div className="dash-cat">
              <div className="dash-cat__icon"><FileTextIcon size={22} /></div>
              <h3>ATS Essentials</h3>
              <ul>
                <li>File format and size</li>
                <li>ATS-friendly design</li>
                <li>Professional email address</li>
                <li>Header links compliance</li>
                <li>Resume file name</li>
                <li>Dates and links consistency</li>
              </ul>
            </div>
            <div className="dash-cat">
              <div className="dash-cat__icon"><EditIcon size={22} /></div>
              <h3>Content Analysis</h3>
              <ul>
                <li>ATS parse rate</li>
                <li>Quantifying impact with AI rewrite</li>
                <li>Repetition of words and phrases</li>
                <li>Spelling and grammar</li>
                <li>Bullet length and consistency</li>
              </ul>
            </div>
            <div className="dash-cat">
              <div className="dash-cat__icon"><BookmarkIcon size={22} /></div>
              <h3>Recruiter Insights</h3>
              <ul>
                <li>Resume credibility</li>
                <li>Missing skills</li>
                <li>Industry benchmarking</li>
                <li>LinkedIn profile match</li>
              </ul>
            </div>
            <div className="dash-cat">
              <div className="dash-cat__icon"><FileTextIcon size={22} /></div>
              <h3>Resume Sections</h3>
              <ul>
                <li>Essential sections</li>
                <li>Contact information</li>
                <li>Experience & education</li>
              </ul>
            </div>
            <div className="dash-cat">
              <div className="dash-cat__icon"><TargetIcon size={22} /></div>
              <h3>Job Tailoring</h3>
              <ul>
                <li>Hard skills match</li>
                <li>Soft skills match</li>
                <li>Keyword optimization</li>
              </ul>
            </div>
            <div className="dash-cat">
              <div className="dash-cat__icon"><UserIcon size={22} /></div>
              <h3>Bias &amp; Discrimination</h3>
              <ul>
                <li>Age and date bias</li>
                <li>Employment gaps</li>
              </ul>
            </div>

            {/* AI Suggestions spans */}
            <div className="dash-cat dash-cat--wide">
              <div className="dash-cat__icon"><SparklesIcon size={22} /></div>
              <h3>AI Suggestions</h3>
              <div className="dash-cat__grid2">
                <ul>
                  <li>Improve summary</li>
                  <li>Improve skills section</li>
                </ul>
                <ul>
                  <li>Rewrite bullet points</li>
                  <li>Optimize keywords</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="dash-dark__cta">
            <h3>Put your resume score to work</h3>
            <p>Checking is step one. We cover the rest: the rewrite, the cover letter, the tracking, and the interview prep.</p>
            <div className="dash-dark__cta-row">
              <button className="dash-dark__btn dash-dark__btn--primary" onClick={() => navigate('/resume-builder')}>Resume Builder</button>
              <button className="dash-dark__btn" onClick={() => navigate('/job-optimization')}>Cover Letter</button>
              <button className="dash-dark__btn" onClick={() => navigate('/resume-analysis')}>Import Resume</button>
              <button className="dash-dark__btn" onClick={() => navigate('/job-search')}>Job Tracker</button>
              <button className="dash-dark__btn" onClick={() => navigate('/ai-interviewer')}>Interview Help</button>
              <button className="dash-dark__btn" onClick={() => navigate('/job-search')}>AI Job Search</button>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="dash-quick">
          <h2 className="dash-quick__title">Quick Actions</h2>
          <div className="dash-quick__grid">
            <button className="dash-quick__btn dash-quick__btn--primary" onClick={() => navigate('/resume-builder')}><FileTextIcon size={18} /> Upload Resume</button>
            <button className="dash-quick__btn" onClick={() => navigate('/resume-analysis')}><SearchIcon size={18} /> Analyze Resume</button>
            <button className="dash-quick__btn" onClick={() => navigate('/job-search')}><BriefcaseIcon size={18} /> Find Jobs</button>
            <button className="dash-quick__btn" onClick={() => navigate('/job-optimization')}><EditIcon size={18} /> Generate Cover Letter</button>
            <button className="dash-quick__btn" onClick={() => navigate('/ai-interviewer')}><MicIcon size={18} /> AI Interview</button>
            <button className="dash-quick__btn" onClick={() => navigate('/career-roadmap')}><RouteIcon size={18} /> Career Roadmap</button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
