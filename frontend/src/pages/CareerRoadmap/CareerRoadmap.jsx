import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AppLayout from "../../components/layout/AppLayout";
import { Button, Badge, Input, Select } from "../../components/ui";
import { RouteIcon, CheckCircleIcon, SparklesIcon } from "../../components/ui/Icons";
import api from "../../services/api";
import "./CareerRoadmap.css";

function CareerRoadmap() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [targetRole, setTargetRole] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [currentLevel, setCurrentLevel] = useState("entry");
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => { loadUserResumes(); }, []);
  const loadUserResumes = async () => {
    try {
      setLoadingResumes(true);
      const response = await api.get("/resumes/builder");
      if (response.data?.success) {
        setResumes(response.data.resumes || []);
        if (response.data.resumes && response.data.resumes.length > 0) {
          const latest = response.data.resumes[0];
          setSelectedResumeId(latest._id || latest.id);
          if (latest.targetRole) setTargetRole(latest.targetRole);
          if (latest.targetIndustry) setTargetIndustry(latest.targetIndustry);
        }
      }
    } catch (err) { console.error("Load resumes error:", err); } finally { setLoadingResumes(false); }
  };

  const handleGenerateRoadmap = async () => {
    if (!targetRole.trim()) { setError("Please enter your target role"); return; }
    if (!targetIndustry.trim()) { setError("Please enter your target industry"); return; }
    try {
      setGenerating(true); setMessage(""); setError(""); setRoadmap(null);
      const response = await api.post("/career-roadmap", { targetRole: targetRole.trim(), targetIndustry: targetIndustry.trim(), currentLevel, resumeId: selectedResumeId || null });
      if (!response.data?.success) throw new Error(response.data?.message || "Failed to generate roadmap");
      setRoadmap(response.data.roadmap); setMessage("Career roadmap generated successfully!");
      setTimeout(() => { document.getElementById("roadmap-results")?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
    } catch (err) { setError(err.response?.data?.message || err.message || "Failed to generate roadmap"); } finally { setGenerating(false); }
  };

  const renderSkillGap = (gap) => {
    const tone = gap.importance === 'critical' ? 'crit' : gap.importance === 'high' ? 'high' : 'med';
    return (
      <div key={gap._id || gap.skill} className={`rm-skill-gap rm-skill-gap--${tone}`}>
        <div className="rm-skill-gap__head">
          <h4 className="rm-skill-gap__name">{gap.skill}</h4>
          <span className={`rm-pill rm-pill--${tone}`}>{gap.importance || "medium"}</span>
        </div>
        {gap.reason && <p className="rm-skill-gap__reason">{gap.reason}</p>}
        <div className="rm-skill-gap__meta"><span>Priority {gap.priority || 1}</span><span className="rm-dot" /> <span>{gap.category || "technical"}</span></div>
      </div>
    );
  };

  const renderRoadmapStage = (stage, index) => {
    return (
      <div key={stage._id || index} className="rm-stage">
        <div className="rm-stage__num">{index + 1}</div>
        <div className="rm-stage__body">
          <div className="rm-stage__head">
            <h3 className="rm-stage__title">{stage.title}</h3>
            {stage.phase && <span className="rm-stage__phase">{stage.phase}</span>}
          </div>
          {stage.description && <p className="rm-stage__desc">{stage.description}</p>}
          {stage.duration && <div className="rm-stage__duration">⏱ {stage.duration}</div>}
          {stage.skills && stage.skills.length > 0 && (
            <div className="rm-stage__block">
              <p className="rm-label">Skills to Learn</p>
              <div className="rm-tag-row">{stage.skills.map((skill, idx) => (<span key={idx} className="rm-tag">{skill}</span>))}</div>
            </div>
          )}
          {stage.resources && stage.resources.length > 0 && (
            <div className="rm-stage__block">
              <p className="rm-label">Resources</p>
              <ul className="rm-resource-list">
                {stage.resources.map((resource, idx) => (
                  <li key={idx}><span className="rm-resource-type">{resource.type}</span> {resource.url ? <a href={resource.url} target="_blank" rel="noopener noreferrer" className="rm-link">{resource.name}</a> : <span>{resource.name}</span>}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="rm-stage__foot"><span className={`rm-pill rm-pill--${stage.priority || 'medium'}`}>{stage.priority || "medium"} priority</span></div>
        </div>
      </div>
    );
  };

  const renderProject = (project, index) => {
    return (
      <div key={project._id || index} className="rm-card">
        <div className="rm-card__head"><h4 className="rm-card__title">{project.title}</h4><span className={`rm-pill rm-pill--${project.difficulty || 'intermediate'}`}>{project.difficulty || "intermediate"}</span></div>
        {project.description && <p className="rm-card__desc">{project.description}</p>}
        {project.skills && project.skills.length > 0 && (
          <div className="rm-stage__block"><p className="rm-label">Skills Used</p><div className="rm-tag-row">{project.skills.map((skill, idx) => (<span key={idx} className="rm-tag">{skill}</span>))}</div></div>
        )}
        <div className="rm-card__foot">{project.estimatedTime && <span>⏱ {project.estimatedTime}</span>}{project.impact && <span>💡 {project.impact}</span>}</div>
      </div>
    );
  };

  const renderCertification = (cert, index) => {
    return (
      <div key={cert._id || index} className="rm-card">
        <div className="rm-card__head"><h4 className="rm-card__title">{cert.name}</h4><span className={`rm-pill rm-pill--${cert.priority || 'medium'}`}>{cert.priority || "medium"}</span></div>
        {cert.provider && <p className="rm-card__meta">📚 {cert.provider}</p>}
        {cert.relevance && <p className="rm-card__desc">{cert.relevance}</p>}
        <div className="rm-card__foot">{cert.estimatedTime && <span>⏱ {cert.estimatedTime}</span>}{cert.estimatedCost && <span>💰 {cert.estimatedCost}</span>}</div>
      </div>
    );
  };

  const renderTimeline = (timeline) => {
    return (
      <div className="rm-timeline">
        {timeline.map((phase, index) => (
          <div key={index} className="rm-timeline__item">
            <div className="rm-timeline__num">{index + 1}</div>
            <div className="rm-timeline__body">
              <h4 className="rm-timeline__title">{phase.phase}</h4>
              <p className="rm-timeline__dur">{phase.duration}</p>
              {phase.focus && <p className="rm-timeline__focus">🎯 {phase.focus}</p>}
              {phase.milestones && phase.milestones.length > 0 && (
                <ul className="rm-timeline__miles">{phase.milestones.map((m, idx) => (<li key={idx}>{m}</li>))}</ul>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "skills", label: "Current Skills", icon: "🧠" },
    { id: "gaps", label: "Skill Gaps", icon: "🎯" },
    { id: "roadmap", label: "Learning Roadmap", icon: "🗺️" },
    { id: "projects", label: "Projects", icon: "💼" },
    { id: "certifications", label: "Certifications", icon: "📜" },
    { id: "interview", label: "Interview Prep", icon: "💬" },
    { id: "timeline", label: "Timeline", icon: "⏱️" },
  ];

  return (
    <AppLayout pageTitle="Career Roadmap">
      <div className="rm-page">
        {/* HERO - dashboard style */}
        <section className="rm-hero">
          <div className="rm-hero__left">
            <div className="rm-hero__badge"><SparklesIcon size={14} /> AI-Powered</div>
            <h1 className="rm-hero__title">Build Your Personalized<br />Career Path</h1>
            <p className="rm-hero__sub">Get a comprehensive, AI-powered career development roadmap based on your current skills, experience, target role, and industry. Includes skill gaps, learning stages, projects, certifications, and interview preparation.</p>
          </div>
          <div className="rm-hero__right">
            <div className="rm-hero__stats">
              <div className="rm-hero__stat"><span className="rm-hero__stat-val">{resumes.length}</span><span className="rm-hero__stat-lab">Resumes</span></div>
              <div className="rm-hero__stat"><span className="rm-hero__stat-val">{roadmap?.roadmapStages?.length || '—'}</span><span className="rm-hero__stat-lab">Stages</span></div>
              <div className="rm-hero__stat"><span className="rm-hero__stat-val">{roadmap?.skillGaps?.length || '—'}</span><span className="rm-hero__stat-lab">Gaps</span></div>
            </div>
            <p className="rm-hero__hint"><RouteIcon size={14} /> Tailored to your profile • Updates as you progress</p>
          </div>
        </section>

        {message && (
          <div className="rm-alert rm-alert--success"><CheckCircleIcon size={18} /> {message}</div>
        )}
        {error && (
          <div className="rm-alert rm-alert--error">⚠ {error}</div>
        )}

        {/* CAREER INFORMATION FORM - interactive card like dashboard */}
        <section className="rm-form-card">
          <div className="rm-form-card__head">
            <div className="rm-form-card__icon">🎯</div>
            <div>
              <h2 className="rm-form-card__title">Career Information</h2>
              <p className="rm-form-card__sub">Tell us about your career goals and we'll create a personalized roadmap</p>
            </div>
          </div>

          <div className="rm-form-grid">
            <label className="rm-field">
              <span className="rm-field__label">Target Role *</span>
              <Input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g., Software Engineer, Financial Analyst" />
            </label>
            <label className="rm-field">
              <span className="rm-field__label">Target Industry *</span>
              <Input type="text" value={targetIndustry} onChange={(e) => setTargetIndustry(e.target.value)} placeholder="e.g., Technology, Finance, Healthcare" />
            </label>
            <label className="rm-field">
              <span className="rm-field__label">Current Career Level</span>
              <Select value={currentLevel} onChange={(e) => setCurrentLevel(e.target.value)}>
                <option value="entry">Entry Level</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="executive">Executive</option>
              </Select>
            </label>
            <label className="rm-field">
              <span className="rm-field__label">Select Resume (Optional)</span>
              <Select value={selectedResumeId} onChange={(e) => setSelectedResumeId(e.target.value)} disabled={loadingResumes}>
                <option value="">No Resume Selected</option>
                {resumes.map((r) => (
                  <option key={r._id || r.id} value={r._id || r.id}>{r.personalInfo?.fullName || "Resume"} — {new Date(r.createdAt).toLocaleDateString()}</option>
                ))}
              </Select>
            </label>
          </div>

          <div className="rm-form-actions">
            <Button onClick={handleGenerateRoadmap} disabled={generating} variant="primary" size="lg" loading={generating}>
              {generating ? "Generating..." : "Generate My Career Roadmap →"}
            </Button>
          </div>
        </section>

        {/* RESULTS */}
        {roadmap && (
          <section id="roadmap-results" className="rm-results">
            <div className="rm-overview">
              <div className="rm-overview__left">
                <div className="rm-overview__icon">📊</div>
                <div>
                  <h2 className="rm-overview__title">Career Overview</h2>
                  <p className="rm-overview__meta">{roadmap.targetRole} in {roadmap.targetIndustry}</p>
                </div>
              </div>
              <div className="rm-overview__badge">{roadmap.estimatedTimeline || "6-12 months"}</div>
            </div>
            {roadmap.careerSummary && (
              <div className="rm-summary"><p>{roadmap.careerSummary}</p></div>
            )}

            <div className="rm-tabs-wrap">
              <div className="rm-tabs">
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`rm-tab ${activeTab === tab.id ? 'rm-tab--active' : ''}`}>
                    <span>{tab.icon}</span> {tab.label}
                  </button>
                ))}
              </div>

              <div className="rm-tab-panel">
                {activeTab === "overview" && (
                  <div className="rm-kpis">
                    <div className="rm-kpi"><div className="rm-kpi__val" style={{color:'#2563EB'}}>{roadmap.currentSkills?.length || 0}</div><div className="rm-kpi__lab">Current Skills</div></div>
                    <div className="rm-kpi"><div className="rm-kpi__val" style={{color:'#EA580C'}}>{roadmap.skillGaps?.length || 0}</div><div className="rm-kpi__lab">Skill Gaps</div></div>
                    <div className="rm-kpi"><div className="rm-kpi__val" style={{color:'#059669'}}>{roadmap.roadmapStages?.length || 0}</div><div className="rm-kpi__lab">Learning Stages</div></div>
                    <div className="rm-kpi"><div className="rm-kpi__val" style={{color:'#7C3AED'}}>{roadmap.recommendedProjects?.length || 0}</div><div className="rm-kpi__lab">Projects</div></div>
                    <div className="rm-kpi"><div className="rm-kpi__val" style={{color:'#4F46E5'}}>{roadmap.recommendedCertifications?.length || 0}</div><div className="rm-kpi__lab">Certifications</div></div>
                    <div className="rm-kpi"><div className="rm-kpi__val" style={{color:'#DB2777'}}>{roadmap.estimatedTimeline || "6-12 mo"}</div><div className="rm-kpi__lab">Timeline</div></div>
                  </div>
                )}
                {activeTab === "skills" && (
                  <div>
                    <h3 className="rm-panel-title">Your Current Skills</h3>
                    {roadmap.currentSkills?.length ? <div className="rm-tag-row">{roadmap.currentSkills.map((s,i)=><span key={i} className="rm-tag rm-tag--green">✓ {s}</span>)}</div> : <p className="rm-empty">No current skills identified.</p>}
                  </div>
                )}
                {activeTab === "gaps" && (
                  <div>
                    <h3 className="rm-panel-title">Skills to Develop</h3>
                    {roadmap.skillGaps?.length ? <div className="rm-grid-2">{roadmap.skillGaps.map((g)=>renderSkillGap(g))}</div> : <p className="rm-empty">No skill gaps — you're ready!</p>}
                  </div>
                )}
                {activeTab === "roadmap" && (
                  <div>
                    <h3 className="rm-panel-title">Your Learning Roadmap</h3>
                    {roadmap.roadmapStages?.length ? <div className="rm-stage-list">{roadmap.roadmapStages.map((s,i)=>renderRoadmapStage(s,i))}</div> : <p className="rm-empty">No stages available.</p>}
                  </div>
                )}
                {activeTab === "projects" && (
                  <div>
                    <h3 className="rm-panel-title">Recommended Projects</h3>
                    {roadmap.recommendedProjects?.length ? <div className="rm-grid-2">{roadmap.recommendedProjects.map((p,i)=>renderProject(p,i))}</div> : <p className="rm-empty">No projects.</p>}
                  </div>
                )}
                {activeTab === "certifications" && (
                  <div>
                    <h3 className="rm-panel-title">Recommended Certifications</h3>
                    {roadmap.recommendedCertifications?.length ? <div className="rm-grid-2">{roadmap.recommendedCertifications.map((c,i)=>renderCertification(c,i))}</div> : <p className="rm-empty">No certifications.</p>}
                  </div>
                )}
                {activeTab === "interview" && (
                  <div className="rm-interview-grid">
                    <div><h4 className="rm-label">Interview Topics</h4>{roadmap.interviewPreparation?.topics?.length ? <div className="rm-tag-row">{roadmap.interviewPreparation.topics.map((t,i)=><span key={i} className="rm-tag rm-tag--purple">{t}</span>)}</div> : <p className="rm-empty">—</p>}</div>
                    <div><h4 className="rm-label">Common Questions</h4>{roadmap.interviewPreparation?.commonQuestions?.length ? <ul className="rm-bullet">{roadmap.interviewPreparation.commonQuestions.map((q,i)=><li key={i}>{q}</li>)}</ul> : <p className="rm-empty">—</p>}</div>
                    <div><h4 className="rm-label">Technical Areas</h4>{roadmap.interviewPreparation?.technicalAreas?.length ? <div className="rm-tag-row">{roadmap.interviewPreparation.technicalAreas.map((a,i)=><span key={i} className="rm-tag rm-tag--blue">{a}</span>)}</div> : <p className="rm-empty">—</p>}</div>
                    <div><h4 className="rm-label">Preparation Tips</h4>{roadmap.interviewPreparation?.preparationTips?.length ? <ul className="rm-bullet">{roadmap.interviewPreparation.preparationTips.map((t,i)=><li key={i}>{t}</li>)}</ul> : <p className="rm-empty">—</p>}</div>
                  </div>
                )}
                {activeTab === "timeline" && (
                  <div>
                    <h3 className="rm-panel-title">Career Development Timeline</h3>
                    {roadmap.timeline?.length ? renderTimeline(roadmap.timeline) : <p className="rm-empty">No timeline.</p>}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}

export default CareerRoadmap;
