import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Button, Badge, Input } from '../../components/ui';
import { SearchIcon, BriefcaseIcon, BookmarkIcon, TargetIcon, TrendingUpIcon } from '../../components/ui/Icons';
import api from '../../services/api';
import './JobSearch.css';

const JobSearch = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // for local text filter
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [desiredRole, setDesiredRole] = useState('');
  const [location, setLocation] = useState('');
  const [remoteFilter, setRemoteFilter] = useState('all');
  const [hasSearched, setHasSearched] = useState(false);
  const [resumeSkills, setResumeSkills] = useState([]);

  useEffect(() => {
    loadResumes();
    // auto-load latest resume jobs on first visit
    autoSearch();
  }, []);

  const loadResumes = async () => {
    try {
      const res = await api.get('/resumes');
      if (res.data?.success && res.data.resumes?.length) {
        setResumes(res.data.resumes);
        const latest = res.data.resumes[0];
        if (latest) {
          setSelectedResume(latest._id || latest.id);
          if (latest.skills?.length) setResumeSkills(latest.skills);
          if (!desiredRole && latest.skills?.length) {
            // hint role from first skill
            setDesiredRole(latest.skills[0]);
          }
        }
      }
    } catch (e) {
      console.error('load resumes', e);
    } finally {
      setInitialLoading(false);
    }
  };

  const autoSearch = async () => {
    // try to fetch real-time jobs for latest resume without user clicking
    try {
      setLoading(true);
      const r = await api.get('/resumes');
      let resumeId = null;
      let skills = [];
      if (r.data?.resumes?.[0]) {
        resumeId = r.data.resumes[0]._id || r.data.resumes[0].id;
        skills = r.data.resumes[0].skills || [];
      }
      // if no resume, search with generic role
      const body = resumeId ? { resumeId } : { desiredRole: 'Software Engineer' };
      const resp = await api.post('/jobs/search', body);
      if (resp.data?.success) {
        setJobs(resp.data.jobs || []);
        setResumeSkills(resp.data.resumeSkills || skills);
        setHasSearched(true);
      }
    } catch (e) {
      console.error('autoSearch', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!selectedResume && !desiredRole) {
      // need at least one
      if (!resumes.length) {
        // allow search with desiredRole only
        if (!desiredRole.trim()) return;
      }
    }
    try {
      setLoading(true);
      setHasSearched(true);
      const payload = {};
      if (selectedResume) payload.resumeId = selectedResume;
      if (desiredRole.trim()) payload.desiredRole = desiredRole.trim();
      if (location.trim()) payload.location = location.trim();
      payload.remoteFilter = remoteFilter;

      // if no resume selected but user typed skills via desiredRole, still send
      const res = await api.post('/jobs/search', payload);
      if (res.data?.success) {
        setJobs(res.data.jobs || []);
        setResumeSkills(res.data.resumeSkills || []);
      }
    } catch (err) {
      console.error('search failed', err);
      const msg = err.response?.data?.message;
      if (msg) alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeChange = async (e) => {
    const id = e.target.value;
    setSelectedResume(id);
    const r = resumes.find((x) => (x._id || x.id) === id);
    if (r?.skills) {
      setResumeSkills(r.skills);
      if (!desiredRole && r.skills[0]) setDesiredRole(r.skills[0]);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'warning';
    return 'default';
  };

  const handleOptimize = (job) => {
    navigate('/job-optimization', { state: { job } });
  };

  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      (job.tags || []).some((t) => t.toLowerCase().includes(q)) ||
      (job.matchedSkills || []).some((s) => s.toLowerCase().includes(q))
    );
  });

  if (initialLoading) {
    return (
      <AppLayout pageTitle="Job Search">
        <div className="job-search-loading">
          <div className="spinner" />
          <p>Loading your resumes...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Job Search">
      <div className="job-search-page">
        <div className="job-search-header">
          <div>
            <h1>Find Your Next Opportunity</h1>
            <p>Real-time jobs from Arbeitnow & Remotive, matched to your resume skills & desired role</p>
          </div>
          <Badge variant="primary">{filteredJobs.length} Jobs Found</Badge>
        </div>

        {/* Real-time search form */}
        <Card className="job-search-filters" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>Resume (skills source)</label>
                <select className="job-search-select" style={{ width: '100%', borderRadius: 12 }} value={selectedResume} onChange={handleResumeChange}>
                  <option value="">— No resume (use Desired Role only) —</option>
                  {resumes.map((r) => (
                    <option key={r._id || r.id} value={r._id || r.id}>
                      {r.originalName || r.fileName} {r.skills?.length ? `• ${r.skills.slice(0, 2).join(', ')}` : ''}
                    </option>
                  ))}
                </select>
                {resumes.length === 0 && (
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>
                    No resume found. <span style={{ color: '#4F8CFF', cursor: 'pointer' }} onClick={() => navigate('/resume-builder')}>Upload resume</span> or just type Desired Role.
                  </div>
                )}
                {resumeSkills.length > 0 && <div style={{ fontSize: 11, color: '#64748B', marginTop: 6 }}>Resume skills: {resumeSkills.slice(0, 6).join(', ')}</div>}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>Desired Job Role *</label>
                <Input placeholder="e.g. Frontend Developer, Data Scientist" value={desiredRole} onChange={(e) => setDesiredRole(e.target.value)} required={!selectedResume} />
              </div>
              <div style={{ flex: '0 0 180px', minWidth: 150 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>Location</label>
                <Input placeholder="e.g. Bangalore, Remote" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <select className="job-search-select" value={remoteFilter} onChange={(e) => setRemoteFilter(e.target.value)}>
                <option value="all">All Types</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
              <Button type="submit" variant="primary" loading={loading} disabled={loading}>
                <SearchIcon size={16} /> {loading ? 'Searching live...' : 'Search Real-Time Jobs'}
              </Button>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>Searches Arbeitnow + Remotive live • links included</span>
            </div>
          </form>

          {/* Local text filter */}
          <div style={{ display: 'flex', gap: 10, marginTop: 12, paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
            <div style={{ flex: 1 }}>
              <Input icon={<SearchIcon size={16} />} placeholder="Filter results by title, company, skill..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="job-search-loading">
            <div className="spinner" />
            <p>Searching live job boards for <strong>{desiredRole || resumeSkills[0] || 'your profile'}</strong>...</p>
          </div>
        ) : !hasSearched && filteredJobs.length === 0 ? (
          <Card className="job-search-empty">
            <BriefcaseIcon size={48} />
            <h3>Ready to search</h3>
            <p>Select your resume and desired role, then click Search Real-Time Jobs</p>
          </Card>
        ) : filteredJobs.length === 0 ? (
          <Card className="job-search-empty">
            <BriefcaseIcon size={48} />
            <h3>No jobs found</h3>
            <p>Try a broader Desired Role (e.g. “Developer”, “Designer”) or clear Location filter</p>
          </Card>
        ) : (
          <div className="job-search-list">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="job-card">
                <div className="job-card__header">
                  <div className="job-card__title-section">
                    <h3 className="job-card__title">{job.title}</h3>
                    <p className="job-card__company">
                      {job.company} • <span style={{ color: '#94A3B8' }}>{job.source}</span>
                    </p>
                  </div>
                  <div className="job-card__match">
                    <Badge variant={getMatchColor(job.matchScore)} size="lg">
                      <TrendingUpIcon size={16} /> {job.matchScore}% Match
                    </Badge>
                  </div>
                </div>

                <div className="job-card__details">
                  <span className="job-card__detail">📍 {job.location}</span>
                  {job.salary && <span className="job-card__detail">💰 {job.salary}</span>}
                  <span className="job-card__detail">📅 {job.postedDate || 'Recently'}</span>
                  <Badge variant={job.remote === 'Remote' ? 'success' : 'default'}>{job.remote}</Badge>
                </div>

                {job.matchedSkills?.length > 0 && (
                  <div style={{ fontSize: 11, color: '#10B981', fontWeight: 700, marginBottom: 6 }}>
                    ✓ Matched your skills: {job.matchedSkills.slice(0, 4).join(', ')}
                  </div>
                )}

                <div className="job-card__skills">
                  {(job.tags || []).slice(0, 6).map((tag, idx) => (
                    <Badge key={idx} variant="secondary" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 8 }}>
                  {job.description ? job.description.replace(/<[^>]*>/g, '').slice(0, 220) + '...' : ''}
                </div>

                <div className="job-card__footer">
                  <span className="job-card__posted">Source: {job.source}</span>
                  <div className="job-card__actions">
                    <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(job.url)}>
                      <BookmarkIcon size={16} /> Copy Link
                    </Button>
                    {job.url ? (
                      <a href={job.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <Button variant="secondary" size="sm">
                          View & Apply →
                        </Button>
                      </a>
                    ) : (
                      <Button variant="secondary" size="sm" disabled>
                        No Link
                      </Button>
                    )}
                    <Button variant="primary" size="sm" onClick={() => handleOptimize(job)}>
                      <TargetIcon size={16} /> Optimize Resume
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default JobSearch;
