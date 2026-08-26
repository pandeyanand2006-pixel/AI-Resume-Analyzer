import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Button, Badge } from '../../components/ui';
import { BookmarkIcon, BriefcaseIcon, TargetIcon, TrendingUpIcon } from '../../components/ui/Icons';
import './SavedJobs.css';

const SavedJobs = () => {
  const navigate = useNavigate();
  const [savedJobs] = useState([
    {
      id: 1,
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'Bangalore',
      salary: '₹15-25 LPA',
      matchScore: 92,
      skills: ['Java', 'Spring Boot', 'AWS'],
      savedDate: '2 days ago'
    }
  ]);

  return (
    <AppLayout pageTitle="Saved Jobs">
      <div className="saved-jobs-page">
        <div className="saved-jobs-header">
          <h1>Saved Jobs</h1>
          <Badge variant="primary">{savedJobs.length} Saved</Badge>
        </div>

        {savedJobs.length === 0 ? (
          <Card className="saved-jobs-empty">
            <BookmarkIcon size={48} />
            <h3>No saved jobs yet</h3>
            <p>Start saving jobs you're interested in</p>
            <Button onClick={() => navigate('/job-search')}>Browse Jobs</Button>
          </Card>
        ) : (
          <div className="saved-jobs-list">
            {savedJobs.map(job => (
              <Card key={job.id} className="job-card">
                <div className="job-card__header">
                  <div>
                    <h3>{job.title}</h3>
                    <p>{job.company}</p>
                  </div>
                  <Badge variant="success">
                    <TrendingUpIcon size={16} />
                    {job.matchScore}% Match
                  </Badge>
                </div>
                <div className="job-card__details">
                  <span>📍 {job.location}</span>
                  <span>💰 {job.salary}</span>
                  <span>Saved {job.savedDate}</span>
                </div>
                <div className="job-card__skills">
                  {job.skills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" size="sm">{skill}</Badge>
                  ))}
                </div>
                <div className="job-card__actions">
                  <Button variant="ghost" size="sm">Remove</Button>
                  <Button variant="secondary" size="sm">View Details</Button>
                  <Button variant="primary" size="sm" onClick={() => navigate('/job-optimization')}>
                    <TargetIcon size={16} />
                    Optimize Resume
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SavedJobs;
