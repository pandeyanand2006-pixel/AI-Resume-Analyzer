import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Button, Badge } from '../../components/ui';
import { FileTextIcon, ClockIcon, CheckCircleIcon, GitCompareIcon } from '../../components/ui/Icons';
import api from '../../services/api';
import './ResumeVersions.css';

const ResumeVersions = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeResumeId, setActiveResumeId] = useState(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const getResumeId = (r) => {
    const raw = r?._id || r?.id || "";
    // Ensure string 24-char hex, handle ObjectId objects
    const s = String(raw).trim();
    return s;
  };

  const loadResumes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/resumes');
      if (response.data?.success && response.data.resumes) {
        const normalized = response.data.resumes.map(r => ({ ...r, _id: r._id || r.id, id: r._id || r.id }));
        setResumes(normalized);
        const active = normalized.find(r => r.isActive);
        if (active) setActiveResumeId(getResumeId(active));
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const setActiveResume = async (resumeId) => {
    const id = getResumeId({ _id: resumeId, id: resumeId });
    try {
      await api.put(`/resumes/${id}/set-active`);
      setActiveResumeId(id);
      setResumes(prev => prev.map(r => ({ ...r, isActive: getResumeId(r) === id })));
    } catch (error) {
      console.error('Error setting active resume:', error);
      alert(error?.response?.data?.message || 'Failed to set active resume');
    }
  };

  const deleteResume = async (resumeId) => {
    const id = getResumeId({ _id: resumeId, id: resumeId });
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    const prevResumes = [...resumes];
    // Optimistic responsive update
    setResumes(prev => prev.filter(r => getResumeId(r) !== id));
    if (activeResumeId === id) setActiveResumeId(null);
    try {
      await api.delete(`/resumes/${id}`);
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert(error?.response?.data?.message || 'Failed to delete resume');
      setResumes(prevResumes);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <AppLayout pageTitle="Resume Versions">
      <div className="resume-versions-page">
        <div className="resume-versions-header">
          <div>
            <h1>Resume Versions</h1>
            <p>Manage and compare different versions of your resume</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/resume-builder')}>
            <FileTextIcon size={18} />
            Create New Resume
          </Button>
        </div>

        {loading ? (
          <div className="resume-versions-loading">
            <div className="spinner" />
            <p>Loading your resumes...</p>
          </div>
        ) : resumes.length === 0 ? (
          <Card className="resume-versions-empty">
            <FileTextIcon size={48} />
            <h3>No resumes yet</h3>
            <p>Create your first resume to get started</p>
            <Button variant="primary" onClick={() => navigate('/resume-builder')}>
              Create Resume
            </Button>
          </Card>
        ) : (
          <>
            <div className="resume-versions-actions">
              {resumes.length >= 2 && (
                <Button variant="secondary" onClick={() => navigate('/resume-comparison')}>
                  <GitCompareIcon size={18} />
                  Compare Resumes
                </Button>
              )}
            </div>

            <div className="resume-versions-list">
              {resumes.map(resume => {
                const rid = getResumeId(resume);
                return (
                <Card key={rid} className={`resume-version-card ${rid === activeResumeId ? 'resume-version-card--active' : ''}`}>
                  <div className="resume-version-card__header">
                    <div className="resume-version-card__icon">
                      <FileTextIcon size={24} />
                    </div>
                    <div className="resume-version-card__info">
                      <div className="resume-version-card__title-row">
                        <h3>{resume.fileName || resume.originalName || 'Untitled Resume'}</h3>
                        {rid === activeResumeId && (
                          <Badge variant="success">
                            <CheckCircleIcon size={14} />
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="resume-version-card__meta">
                        <span>
                          <ClockIcon size={14} />
                          {formatDate(resume.uploadDate || resume.createdAt)}
                        </span>
                        {resume.atsScore ? (
                          <Badge variant={resume.atsScore >= 80 ? 'success' : 'warning'}>
                            ATS: {resume.atsScore}%
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="resume-version-card__actions">
                    {rid !== activeResumeId && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setActiveResume(rid)}
                      >
                        Set as Active
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/resume-preview/${rid}?type=uploaded`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/resume-analysis')}
                    >
                      Analyze
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="resume-version-card__delete"
                      onClick={() => deleteResume(rid)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              )})}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default ResumeVersions;
