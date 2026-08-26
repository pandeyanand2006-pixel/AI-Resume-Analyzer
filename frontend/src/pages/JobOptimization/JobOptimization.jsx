import React, { useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import "../../styles/feature-pages.css";
import "./JobOptimization.css";

const API_URL = "http://localhost:5000";

const JobOptimization = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const optimizeResume = async () => {
    setError("");
    if (!jobDescription.trim()) { setError("Please paste a job description first."); return; }
    if (jobDescription.trim().length < 50) { setError("Please enter a complete job description."); return; }
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("accessToken");
      if (!token) { setError("Please login first."); return; }
      const response = await fetch(`${API_URL}/api/job-optimization`, { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}, credentials:"include", body: JSON.stringify({ jobDescription })});
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || `Optimization failed (${response.status})`);
      setResult(data);
    } catch (err) { console.error("JOB OPTIMIZATION ERROR:", err); setError(err.message || "Failed to optimize resume."); } finally { setLoading(false); }
  };

  return (
    <AppLayout pageTitle="Resume Optimization">
      <div className="feature-page">
        <header className="feature-hero">
          <span className="feature-hero__eyebrow feature-hero__eyebrow--ai">AI • JOB MATCHING</span>
          <h1 className="feature-hero__title">Resume Optimization</h1>
          <p className="feature-hero__desc">Paste any job description — our AI tailors your resume for ATS and recruiter checks. Same dashboard-grade interactivity, gradients and card shadows.</p>
        </header>

        <section className="feature-card">
          <div className="feature-card__header">
            <span className="feature-card__step">1</span>
            <div><h2 className="feature-card__title">Paste Job Description</h2><p className="feature-card__subtitle">Copy the complete description from the company website or job portal</p></div>
          </div>
          <label className="feature-label">Job Description</label>
          <textarea className="feature-textarea" style={{minHeight:200}} placeholder={`We are looking for a Software Engineer to join our team.\n\nRequirements:\n• Java • Spring Boot • React • Node.js • MongoDB • REST APIs • Git • SQL\n\nResponsibilities:\n• Build scalable web applications\n• Develop REST APIs\n• Work with cross-functional teams`} value={jobDescription} onChange={e=>setJobDescription(e.target.value)} />
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12,flexWrap:'wrap',gap:12}}>
            <span style={{fontSize:12,color:'#64748B'}}>{jobDescription.length} characters</span>
            <button className="feature-btn feature-btn--primary" onClick={optimizeResume} disabled={loading}>{loading ? "Analyzing..." : "✨ Optimize My Resume"}</button>
          </div>
        </section>

        {error && <div className="feature-error">⚠️ {error}</div>}

        {result && (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <section className="feature-card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
                <div><span className="feature-tag" style={{marginBottom:8}}>AI ANALYSIS</span><h2 className="feature-card__title">Optimization Results</h2></div>
                <div style={{textAlign:'center',background:'linear-gradient(135deg,#EAFBFF,#EEF2FF)',border:'1px solid #CFFAFE',borderRadius:16,padding:'12px 20px'}}><div style={{fontSize:11,fontWeight:800,letterSpacing:'0.08em',color:'#0E9BA8'}}>ATS MATCH</div><div style={{fontSize:28,fontWeight:800,color:'#0F172A'}}>{result.matchScore || 0}%</div></div>
              </div>
            </section>

            <div className="feature-grid-2">
              <section className="feature-card">
                <h3 style={{fontSize:14,fontWeight:800,margin:'0 0 12px',color:'#065F46'}}>✅ Matched Skills</h3>
                {result.matchedSkills?.length ? <div style={{display:'flex',flexWrap:'wrap',gap:8}}>{result.matchedSkills.map((s,i)=><span key={i} className="feature-tag feature-tag--matched">{s}</span>)}</div> : <p style={{fontSize:13,color:'#64748B'}}>No matched skills found.</p>}
              </section>
              <section className="feature-card">
                <h3 style={{fontSize:14,fontWeight:800,margin:'0 0 12px',color:'#92400E'}}>⚠️ Missing Skills</h3>
                {result.missingSkills?.length ? <div style={{display:'flex',flexWrap:'wrap',gap:8}}>{result.missingSkills.map((s,i)=><span key={i} className="feature-tag feature-tag--missing">{s}</span>)}</div> : <p style={{fontSize:13,color:'#64748B'}}>Great! No major missing skills.</p>}
              </section>
            </div>

            <section className="feature-card">
              <h3 style={{fontSize:14,fontWeight:800,margin:'0 0 12px'}}>🔑 Recommended Keywords</h3>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>{result.recommendedKeywords?.map((k,i)=><span key={i} className="feature-tag">{k}</span>)}</div>
            </section>

            {result.optimizedSummary && (
              <section className="feature-card">
                <h3 style={{fontSize:14,fontWeight:800,margin:'0 0 10px'}}>✨ AI-Optimized Summary</h3>
                <p style={{fontSize:14,lineHeight:1.7,color:'#334155',background:'#F8FAFC',border:'1px solid #E2E8F0',borderRadius:12,padding:16,margin:0}}>{result.optimizedSummary}</p>
              </section>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
export default JobOptimization;
