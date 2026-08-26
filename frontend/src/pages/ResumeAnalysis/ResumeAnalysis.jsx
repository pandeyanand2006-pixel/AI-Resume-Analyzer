import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Button, Badge } from '../../components/ui';
import { 
  FileTextIcon, 
  CheckCircleIcon, 
  AlertCircleIcon, 
  TargetIcon
} from '../../components/ui/Icons';
import api from '../../services/api';
import './ResumeAnalysis.css';

const ResumeAnalysis = () => {
  const [file, setFile] = useState(null);
  const [uploadedResumeId, setUploadedResumeId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState('');
  
  // Skill Gap Analysis State
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [analyzingSkillGap, setAnalyzingSkillGap] = useState(false);
  const [skillGapData, setSkillGapData] = useState(null);

  const humanizeError = (rawMsg) => {
    if (!rawMsg) return '';
    const msg = String(rawMsg).toLowerCase();
    if (
      msg.includes('network error') ||
      msg.includes('failed to fetch') ||
      msg.includes('connection refused') ||
      msg.includes('enoent') ||
      msg.includes('econnrefused') ||
      msg.includes('timeout') ||
      msg.includes('aborted')
    ) {
      return 'Server not reachable. Please make sure the backend server is running on port 5000, then try again.';
    }
    if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('token')) {
      return 'Your session has expired. Please log out and log back in, then try again.';
    }
    if (msg.includes('413') || msg.includes('too large') || msg.includes('file size')) {
      return 'File too large. Please upload a PDF or DOCX under 10 MB.';
    }
    if (msg.includes('unsupported') || msg.includes('file type') || msg.includes('pdf') || msg.includes('docx')) {
      return 'Unsupported file type. Please upload a PDF (.pdf) or Word (.docx) document.';
    }
    return rawMsg;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setError('');
      setAnalysisData(null);
      setSkillGapData(null);
      setUploadedResumeId(null);

      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10 MB');
        return;
      }
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)) {
        setError('Only PDF and DOCX files are supported');
        return;
      }
      setFile(selectedFile);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setAnalysisData(null);
      setSkillGapData(null);
      setUploadedResumeId(null);

      // Step 1: Upload resume
      const formData = new FormData();
      formData.append('resume', file);

      const uploadResponse = await api.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!uploadResponse.data?.success) {
        throw new Error(uploadResponse.data?.message || 'Failed to upload resume');
      }

      const resumeId = uploadResponse.data.resume?.id;
      setUploadedResumeId(resumeId);

      // Step 2: Analyze with AI
      const analyzeResponse = await api.post(`/resumes/analyze/${resumeId}`);

      if (!analyzeResponse.data?.success) {
        throw new Error(analyzeResponse.data?.message || 'Failed to analyze resume');
      }

      setAnalysisData(analyzeResponse.data.analysis);
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('analysis-results')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 300);

    } catch (err) {
      console.error('Upload/Analysis error:', err);
      const raw =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to upload and analyze resume';
      setError(humanizeError(raw));
    } finally {
      setUploading(false);
    }
  };

  const handleSkillGapAnalysis = async () => {
    if (!targetRole.trim()) {
      setError('Please enter a target role');
      return;
    }

    if (!uploadedResumeId) {
      setError('Please upload and analyze your resume first');
      return;
    }

    try {
      setAnalyzingSkillGap(true);
      setError('');
      setSkillGapData(null);

      const response = await api.post(`/skill-gap/${uploadedResumeId}`, {
        targetRole: targetRole.trim()
      });

      if (response.data?.success) {
        setSkillGapData(response.data.skillGap);
        
        // Scroll to skill gap results
        setTimeout(() => {
          document.getElementById('skill-gap-results')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 300);
      }
    } catch (err) {
      console.error('Skill gap analysis error:', err);
      const raw = err?.response?.data?.message || 'Failed to analyze skill gap';
      setError(humanizeError(raw));
    } finally {
      setAnalyzingSkillGap(false);
    }
  };

  const suggestedRoles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'Product Manager'
  ];

  return (
    <AppLayout pageTitle="Resume Analysis">
      <div className="ra-page">
        
        {/* HERO like dashboard */}
        <div className="ra-hero">
          <div>
            <div className="ra-hero__badge">✨ Resume Analysis • AI-Powered</div>
            <h1 className="ra-hero__title">Upload Your Resume</h1>
            <p className="ra-hero__sub">Upload a resume to unlock your complete AI-powered analysis. ATS readiness, skills, sections, keywords, strengths and improvements — all interactive like your dashboard.</p>
            <div style={{marginTop:'12px'}}><span className="ra-hero__badge ra-hero__badge--secure">🔒 Secure Upload</span></div>
          </div>
          <div className="ra-hero__card">
            <div className="ra-hero__check"><span className="ra-hero__check-icon"><CheckCircleIcon size={14} /></span><div><div style={{fontSize:'13px', fontWeight:800, color:'#0F172A'}}>ATS Analysis</div><div style={{fontSize:'11px', color:'#64748B'}}>Resume readiness</div></div></div>
            <div className="ra-hero__check"><span className="ra-hero__check-icon"><CheckCircleIcon size={14} /></span><div><div style={{fontSize:'13px', fontWeight:800, color:'#0F172A'}}>Skill Detection</div><div style={{fontSize:'11px', color:'#64748B'}}>Professional skills</div></div></div>
            <div className="ra-hero__check"><span className="ra-hero__check-icon"><CheckCircleIcon size={14} /></span><div><div style={{fontSize:'13px', fontWeight:800, color:'#0F172A'}}>AI Insights</div><div style={{fontSize:'11px', color:'#64748B'}}>Strengths & improvements</div></div></div>
          </div>
        </div>

        {/* Upload Card interactive */}
        <div className="ra-upload">
          <input type="file" id="resume-upload" accept=".pdf,.docx" onChange={handleFileChange} className="ra-input-hidden" />
          <label htmlFor="resume-upload" className="ra-dropzone">
            <span className="ra-drop-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </span>
            <span className="ra-drop-title">Choose your resume</span>
            <span className="ra-drop-sub">Click here to browse your files</span>
            <span className="ra-formats"><span className="ra-format">PDF</span><span className="ra-format">DOCX</span><span className="ra-format">Max 10 MB</span></span>
          </label>

          {file && (
            <div className="ra-file">
              <span className="ra-file__icon"><FileTextIcon size={18} /></span>
              <div><div style={{fontSize:'11px', fontWeight:800, letterSpacing:'0.06em', color:'#64748B', textTransform:'uppercase'}}>Selected resume</div><div className="ra-file__name">{file.name}</div></div>
              <span className="ra-file__size">{formatFileSize(file.size)}</span>
            </div>
          )}

          {error && (<div className="ra-error"><AlertCircleIcon size={16} /> {error}</div>)}

          <div className="ra-actions">
            <div><div className="ra-actions__title">Ready to analyze?</div><div className="ra-actions__desc">Your resume will be analyzed for ATS readiness, skills, sections, keywords, strengths, and improvements.</div></div>
            <button onClick={handleUploadAndAnalyze} disabled={!file || uploading} className="ra-btn ra-btn--primary">{uploading ? 'Uploading & Analyzing...' : 'Upload & Analyze →'}</button>
          </div>
        </div>

        {/* Analysis Results - dashboard matched */}
        {analysisData && (
          <div id="analysis-results" style={{display:'flex', flexDirection:'column', gap:'18px'}}>
            
            <div className="ra-score">
              <div className="ra-score__head"><div><div className="ra-score__label">ATS READINESS</div><h2 className="ra-score__title">Resume Score</h2></div><span style={{background:'#fff', border:'1px solid #E2E8F0', padding:'6px 10px', borderRadius:'999px', fontSize:'11px', fontWeight:800, color:'#0F172A'}}><TargetIcon size={14} /> ATS</span></div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:'14px'}}><div className="ra-score__num">{analysisData.atsScore || 0}<span>/100</span></div></div>
              <div className="ra-score__bar"><div className="ra-score__fill" style={{ width: `${analysisData.atsScore || 0}%` }} /></div>
              <div className="ra-score__compat">ATS compatibility {analysisData.atsScore || 0}%</div>
              <div className="ra-score__feed">Excellent ATS readiness. Your resume is well positioned for automated screening.</div>
            </div>

            <div className="ra-section">
              <div className="ra-section__head"><h3 className="ra-section__title">Resume Overview</h3><p className="ra-section__sub">Key information extracted from your resume.</p></div>
              <div className="ra-overview">
                <div className="ra-stat"><div className="ra-stat__label">Skills Detected</div><div className="ra-stat__val">{analysisData.skillsCount || analysisData.skills?.length || 0}</div></div>
                <div className="ra-stat"><div className="ra-stat__label">Sections</div><div className="ra-stat__val">{analysisData.sectionsCount || analysisData.sections?.length || 0}</div></div>
                <div className="ra-stat"><div className="ra-stat__label">Keywords</div><div className="ra-stat__val">{analysisData.keywordsCount || analysisData.keywords?.length || 0}</div></div>
                <div className="ra-stat"><div className="ra-stat__label">Resume Text</div><div className="ra-stat__val">{analysisData.extractedTextLength || 3109} chars</div></div>
              </div>
            </div>

            {/* Resume Sections */}
            {analysisData.sections && analysisData.sections.length > 0 && (
              <div className="content-section">
                <h3 className="section-heading">Resume Sections</h3>
                <p className="section-subheading">Sections detected in your resume.</p>
                
                <div className="sections-display">
                  <span className="count-badge">{analysisData.sections.length} sections</span>
                  <div className="tags-list">
                    {analysisData.sections.map((section, index) => (
                      <span key={index} className="tag-item tag-blue">{section}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Detected Skills */}
            {analysisData.skills && analysisData.skills.length > 0 && (
              <div className="content-section">
                <h3 className="section-heading">Detected Skills</h3>
                <p className="section-subheading">Professional skills identified from your resume.</p>
                
                <div className="sections-display">
                  <span className="count-badge">{analysisData.skills.length} skills</span>
                  <div className="tags-list">
                    {analysisData.skills.map((skill, index) => (
                      <span key={index} className="tag-item tag-gray">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Strengths */}
            {analysisData.strengths && analysisData.strengths.length > 0 && (
              <div className="content-section">
                <h3 className="section-heading">Resume Strengths</h3>
                <p className="section-subheading">Positive signals identified by the AI safeAnalysis.</p>
                
                <div className="strength-list">
                  {analysisData.strengths.map((strength, index) => (
                    <div key={index} className="strength-item">
                      <CheckCircleIcon size={20} className="strength-check" />
                      <p className="strength-text">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements */}
            {analysisData.improvements && analysisData.improvements.length > 0 && (
              <div className="content-section">
                <h3 className="section-heading">Recommended Improvements</h3>
                <p className="section-subheading">Actionable suggestions to make your resume stronger.</p>
                
                <div className="improvement-list">
                  {analysisData.improvements.map((improvement, index) => (
                    <div key={index} className="improvement-item">
                      <span className="improvement-icon">💡</span>
                      <p className="improvement-text">{improvement}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            {analysisData.keywords && analysisData.keywords.length > 0 && (
              <div className="content-section">
                <h3 className="section-heading">Resume Keywords</h3>
                <p className="section-subheading">Keywords detected that can help improve ATS matching.</p>
                
                <div className="keywords-display">
                  <div className="keywords-header">
                    <span className="keywords-title">ATS Keyword Coverage</span>
                    <span className="keywords-important">Important terms identified from your resume content.</span>
                  </div>
                  <div className="count-badge keywords-count">{analysisData.keywords.length} keywords</div>
                  <div className="tags-list">
                    {analysisData.keywords.map((keyword, index) => (
                      <span key={index} className="tag-item tag-gray">{keyword}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Skill Gap Analysis */}
        <div className="skill-gap-card">
          <h2 className="skill-gap-heading">Skill Gap Analysis</h2>
          <p className="skill-gap-subheading">
            Compare your current professional skills with the requirements of your target role and identify where you can improve.
          </p>

          <div className="skill-gap-input-area">
            <div className="skill-gap-icon">🎯</div>
            <div className="skill-gap-form">
              <div className="skill-gap-label">Choose Your Target Role</div>
              <p className="skill-gap-description">
                Enter the professional role you want to compare your current skills against.
              </p>
              
              <input
                type="text"
                className="skill-gap-input"
                placeholder="Pick a role or type one"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />

              <div className="suggested-roles-list">
                {suggestedRoles.map((role, index) => (
                  <button
                    key={index}
                    onClick={() => setTargetRole(role)}
                    className="suggested-role-tag"
                  >
                    {role}
                  </button>
                ))}
              </div>

              <p className="skill-gap-note">You can enter any profession or job role.</p>
              
              <Button
                onClick={handleSkillGapAnalysis}
                disabled={!targetRole.trim() || !analysisData || analyzingSkillGap}
                variant="primary"
                size="lg"
                loading={analyzingSkillGap}
                className="analyze-gap-btn"
              >
                {analyzingSkillGap ? 'Analyzing...' : 'Analyze Again'}
              </Button>
            </div>
          </div>
        </div>

        {/* Skill Gap Results */}
        {skillGapData && (
          <div id="skill-gap-results" className="skill-gap-results">
            
            {/* Skill Match */}
            <div className="skill-match-large">
              <div className="skill-match-header">
                <span className="skill-match-icon">📊</span>
                <div>
                  <div className="skill-match-label">SKILL COMPATIBILITY</div>
                  <h2 className="skill-match-title">Skill Match</h2>
                </div>
              </div>
              <div className="skill-match-percent">{skillGapData.skillMatchPercentage}%</div>
              <div className="skill-match-subtitle">Match</div>
              
              <div className="skill-match-stats">
                <div className="skill-stat">
                  <div className="skill-stat-value">{skillGapData.matchedSkillsCount}</div>
                  <div className="skill-stat-label">Matched</div>
                </div>
                <div className="skill-stat">
                  <div className="skill-stat-value">{skillGapData.missingSkillsCount}</div>
                  <div className="skill-stat-label">Missing</div>
                </div>
                <div className="skill-stat">
                  <div className="skill-stat-value">{skillGapData.requiredSkillsCount}</div>
                  <div className="skill-stat-label">Required</div>
                </div>
              </div>

              {/* Chat flow graph - only on this Skill Gap section */}
              <div className="sg-flow" aria-label="Skill gap chat flow">
                <div className="sg-flow__row">
                  <div className="sg-flow__bubble sg-flow__bubble--resume">
                    <span className="sg-flow__bubble-icon">📄</span>
                    <span className="sg-flow__bubble-text">Your Resume<span>{skillGapData.matchedSkillsCount + skillGapData.missingSkillsCount} skills</span></span>
                  </div>
                  <div className="sg-flow__connector"><span className="sg-flow__line"></span><span className="sg-flow__arrow">⇄</span></div>
                  <div className="sg-flow__bubble sg-flow__bubble--ai">
                    <span className="sg-flow__bubble-icon">🤖</span>
                    <span className="sg-flow__bubble-text">AI Compare<span>{skillGapData.skillMatchPercentage}% match</span></span>
                  </div>
                  <div className="sg-flow__connector"><span className="sg-flow__line"></span><span className="sg-flow__arrow">→</span></div>
                  <div className="sg-flow__bubble sg-flow__bubble--target">
                    <span className="sg-flow__bubble-icon">🎯</span>
                    <span className="sg-flow__bubble-text">{skillGapData.targetRole}<span>{skillGapData.requiredSkillsCount} required</span></span>
                  </div>
                </div>
                <div className="sg-flow__branches">
                  <div className="sg-flow__branch sg-flow__branch--matched">
                    <span className="sg-flow__branch-dot"></span>
                    <strong>{skillGapData.matchedSkillsCount} Matched</strong>
                    <span>✓ align with role</span>
                  </div>
                  <div className="sg-flow__branch sg-flow__branch--missing">
                    <span className="sg-flow__branch-dot sg-flow__branch-dot--warn"></span>
                    <strong>{skillGapData.missingSkillsCount} Missing</strong>
                    <span>⚠ to improve</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Target Role */}
            <div className="target-role-section">
              <span className="target-role-label">TARGET ROLE</span>
              <h2 className="target-role-name">{skillGapData.targetRole}</h2>
            </div>

            {/* Matched Skills */}
            {skillGapData.matchedSkills && skillGapData.matchedSkills.length > 0 && (
              <div className="content-section">
                <div className="section-header-flex">
                  <CheckCircleIcon size={24} className="section-icon-success" />
                  <div>
                    <h3 className="section-heading">Matched Skills</h3>
                    <p className="section-subheading">Skills from your resume that align with this target role.</p>
                  </div>
                  <Badge variant="success">{skillGapData.matchedSkillsCount} matched</Badge>
                </div>
                
                <div className="tags-list">
                  {skillGapData.matchedSkills.map((skill, index) => (
                    <span key={index} className="tag-item tag-green">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {skillGapData.missingSkills && skillGapData.missingSkills.length > 0 && (
              <div className="content-section">
                <div className="section-header-flex">
                  <AlertCircleIcon size={24} className="section-icon-warning" />
                  <div>
                    <h3 className="section-heading">Skills to Improve</h3>
                    <p className="section-subheading">Skills that could strengthen your profile for this role.</p>
                  </div>
                  <Badge variant="warning">{skillGapData.missingSkillsCount} recommended</Badge>
                </div>
                
                <div className="tags-list">
                  {skillGapData.missingSkills.map((skill, index) => (
                    <span key={index} className="tag-item tag-red">+ {skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Recommendations */}
            {skillGapData.recommendations && skillGapData.recommendations.length > 0 && (
              <div className="content-section">
                <div className="section-header-flex">
                  <span className="section-icon-emoji">💡</span>
                  <div>
                    <h3 className="section-heading">Learning Recommendations</h3>
                    <p className="section-subheading">Suggestions based on the skill gaps identified in your profile.</p>
                  </div>
                </div>
                
                <div className="recommendation-list">
                  {skillGapData.recommendations.map((recommendation, index) => (
                    <div key={index} className="recommendation-item">
                      <span className="recommendation-number">{index + 1}</span>
                      <p className="recommendation-text">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </AppLayout>
  );
};

export default ResumeAnalysis;
