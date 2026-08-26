import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import "../../styles/feature-pages.css";
import "./ResumeBuilder.css";

const API_URL = "http://localhost:5000";

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    personalInfo: { fullName: "", email: "", phone: "", location: "", linkedin: "", github: "" },
    summary: "",
    skills: "",
    education: [{ institution: "", degree: "", field: "", startYear: "", endYear: "", grade: "" }],
    projects: [{ name: "", description: "", technologies: "", link: "" }],
    certifications: [{ name: "", issuer: "", year: "", link: "" }],
    achievements: [{ title: "", description: "", year: "" }],
    targetRole: "Software Engineer",
    targetIndustry: "Technology",
  });

  const updatePersonalInfo = (field, value) => setFormData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }));
  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const updateEducation = (index, field, value) => setFormData(prev => { const a=[...prev.education]; a[index]={...a[index],[field]:value}; return {...prev, education:a}; });
  const addEducation = () => setFormData(prev => ({ ...prev, education:[...prev.education,{institution:"",degree:"",field:"",startYear:"",endYear:"",grade:""}] }));
  const removeEducation = (index) => setFormData(prev => ({ ...prev, education: prev.education.filter((_,i)=>i!==index)}));
  const updateProject = (index, field, value) => setFormData(prev => { const a=[...prev.projects]; a[index]={...a[index],[field]:value}; return {...prev, projects:a}; });
  const addProject = () => setFormData(prev => ({ ...prev, projects:[...prev.projects,{name:"",description:"",technologies:"",link:""}] }));
  const removeProject = (index) => setFormData(prev => ({ ...prev, projects: prev.projects.filter((_,i)=>i!==index)}));
  const updateCertification = (index, field, value) => setFormData(prev => { const a=[...prev.certifications]; a[index]={...a[index],[field]:value}; return {...prev, certifications:a}; });
  const addCertification = () => setFormData(prev => ({ ...prev, certifications:[...prev.certifications,{name:"",issuer:"",year:"",link:""}] }));
  const removeCertification = (index) => setFormData(prev => ({ ...prev, certifications: prev.certifications.filter((_,i)=>i!==index)}));
  const updateAchievement = (index, field, value) => setFormData(prev => { const a=[...prev.achievements]; a[index]={...a[index],[field]:value}; return {...prev, achievements:a}; });
  const addAchievement = () => setFormData(prev => ({ ...prev, achievements:[...prev.achievements,{title:"",description:"",year:""}] }));
  const removeAchievement = (index) => setFormData(prev => ({ ...prev, achievements: prev.achievements.filter((_,i)=>i!==index)}));

  const handleCreateResume = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("accessToken");
      if (!token) { alert("Please login first."); navigate("/login"); return; }
      const payload = {
        personalInfo: formData.personalInfo,
        summary: formData.summary,
        skills: formData.skills.split(",").map(s=>s.trim()).filter(Boolean),
        education: formData.education.filter(e=>e.institution||e.degree||e.field).map(e=>({institution:e.institution,degree:e.degree,field:e.field,startYear:e.startYear,endYear:e.endYear,grade:e.grade})),
        projects: formData.projects.filter(p=>p.name||p.description).map(p=>({name:p.name,description:p.description,technologies:p.technologies.split(",").map(t=>t.trim()).filter(Boolean),link:p.link})),
        certifications: formData.certifications.filter(c=>c.name||c.issuer).map(c=>({name:c.name,issuer:c.issuer,year:c.year,link:c.link})),
        achievements: formData.achievements.filter(a=>a.title||a.description).map(a=>({title:a.title,description:a.description,year:a.year})),
        targetRole: formData.targetRole,
        targetIndustry: formData.targetIndustry,
      };
      const response = await fetch(`${API_URL}/api/resumes/builder`, { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}, credentials:"include", body: JSON.stringify(payload)});
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || `Request failed with status ${response.status}`);
      if (!data.success || !data.resume) throw new Error(data?.message || "Resume was not created.");
      const resumeId = data.resume._id; if (!resumeId) throw new Error("Server did not return resume ID.");
      navigate(`/resume-preview/${resumeId}`);
    } catch (error) { console.error("CREATE RESUME ERROR:", error); alert(`Failed to create resume: ${error.message}`); } finally { setLoading(false); }
  };

  return (
    <AppLayout pageTitle="Resume Builder">
      <div className="feature-page">
        <header className="feature-hero">
          <span className="feature-hero__eyebrow feature-hero__eyebrow--ai">AI • ATS OPTIMIZED</span>
          <h1 className="feature-hero__title">AI Resume Builder</h1>
          <p className="feature-hero__desc">Create a professional, ATS-friendly resume tailored to your target job. Same polished design system as your dashboard — soft gradients, 20px cards, and interactive focus states.</p>
        </header>

        <form onSubmit={handleCreateResume} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          {/* 01 Personal */}
          <section className="feature-card">
            <div className="feature-card__header"><span className="feature-card__step">01</span><div><h2 className="feature-card__title">Personal Information</h2><p className="feature-card__subtitle">Your recruiter contact information</p></div></div>
            <div className="feature-grid-2">
              <div><label className="feature-label">Full Name</label><input className="feature-input" type="text" placeholder="Anand Kumar" value={formData.personalInfo.fullName} onChange={e=>updatePersonalInfo("fullName",e.target.value)} required /></div>
              <div><label className="feature-label">Email Address</label><input className="feature-input" type="email" placeholder="anand@example.com" value={formData.personalInfo.email} onChange={e=>updatePersonalInfo("email",e.target.value)} required /></div>
              <div><label className="feature-label">Phone</label><input className="feature-input" type="text" placeholder="+91 00000 00000" value={formData.personalInfo.phone} onChange={e=>updatePersonalInfo("phone",e.target.value)} /></div>
              <div><label className="feature-label">Location</label><input className="feature-input" type="text" placeholder="Bengaluru, India" value={formData.personalInfo.location} onChange={e=>updatePersonalInfo("location",e.target.value)} /></div>
              <div><label className="feature-label">LinkedIn URL</label><input className="feature-input" type="url" placeholder="https://linkedin.com/in/..." value={formData.personalInfo.linkedin} onChange={e=>updatePersonalInfo("linkedin",e.target.value)} /></div>
              <div><label className="feature-label">GitHub URL</label><input className="feature-input" type="url" placeholder="https://github.com/..." value={formData.personalInfo.github} onChange={e=>updatePersonalInfo("github",e.target.value)} /></div>
            </div>
          </section>

          {/* 02 Summary */}
          <section className="feature-card">
            <div className="feature-card__header"><span className="feature-card__step">02</span><div><h2 className="feature-card__title">Professional Summary</h2><p className="feature-card__subtitle">Short introduction for recruiters</p></div></div>
            <label className="feature-label">Summary</label>
            <textarea className="feature-textarea" rows="5" placeholder="Example: B.Tech Computer Science student with experience in Java, Python and full-stack development..." value={formData.summary} onChange={e=>handleChange("summary",e.target.value)} required />
          </section>

          {/* 03 Skills */}
          <section className="feature-card">
            <div className="feature-card__header"><span className="feature-card__step">03</span><div><h2 className="feature-card__title">Technical Skills</h2><p className="feature-card__subtitle">Add skills relevant to your target job</p></div></div>
            <label className="feature-label">Skills (comma separated)</label>
            <input className="feature-input" type="text" placeholder="Java, Python, JavaScript, React, Node.js, MongoDB, Git" value={formData.skills} onChange={e=>handleChange("skills",e.target.value)} required />
            <div className="feature-hint">Separate skills using commas.</div>
          </section>

          {/* 04 Education */}
          <section className="feature-card">
            <div className="feature-card__header"><span className="feature-card__step">04</span><div><h2 className="feature-card__title">Education</h2><p className="feature-card__subtitle">Add B.Tech, 12th, 10th, Diploma, etc.</p></div></div>
            {formData.education.map((edu, idx)=>(
              <div key={idx} className="feature-repeatable" style={{marginBottom:12}}>
                <div className="feature-repeatable__head"><span className="feature-repeatable__title">Education #{idx+1}</span>{formData.education.length>1 && <button type="button" className="feature-remove-btn" onClick={()=>removeEducation(idx)}>Remove</button>}</div>
                <div className="feature-grid-2">
                  <input className="feature-input" placeholder="Institution / School" value={edu.institution} onChange={e=>updateEducation(idx,"institution",e.target.value)} />
                  <input className="feature-input" placeholder="Degree / Qualification" value={edu.degree} onChange={e=>updateEducation(idx,"degree",e.target.value)} />
                  <input className="feature-input" placeholder="Field of Study" value={edu.field} onChange={e=>updateEducation(idx,"field",e.target.value)} />
                  <input className="feature-input" placeholder="Start Year" value={edu.startYear} onChange={e=>updateEducation(idx,"startYear",e.target.value)} />
                  <input className="feature-input" placeholder="End Year / Present" value={edu.endYear} onChange={e=>updateEducation(idx,"endYear",e.target.value)} />
                  <input className="feature-input" placeholder="CGPA / Percentage / Grade" value={edu.grade} onChange={e=>updateEducation(idx,"grade",e.target.value)} />
                </div>
              </div>
            ))}
            <button type="button" className="feature-btn feature-btn--small" onClick={addEducation}>+ Add Education</button>
          </section>

          {/* 05 Projects */}
          <section className="feature-card">
            <div className="feature-card__header"><span className="feature-card__step">05</span><div><h2 className="feature-card__title">Projects</h2><p className="feature-card__subtitle">Showcase your strongest work</p></div></div>
            {formData.projects.map((p, idx)=>(
              <div key={idx} className="feature-repeatable" style={{marginBottom:12}}>
                <div className="feature-repeatable__head"><span className="feature-repeatable__title">Project #{idx+1}</span>{formData.projects.length>1 && <button type="button" className="feature-remove-btn" onClick={()=>removeProject(idx)}>Remove</button>}</div>
                <input className="feature-input" placeholder="Project Name" value={p.name} onChange={e=>updateProject(idx,"name",e.target.value)} />
                <textarea className="feature-textarea" rows="4" placeholder="Describe what you built, the problem it solves and your contribution..." value={p.description} onChange={e=>updateProject(idx,"description",e.target.value)} />
                <input className="feature-input" placeholder="Technologies (comma separated)" value={p.technologies} onChange={e=>updateProject(idx,"technologies",e.target.value)} />
                <input className="feature-input" type="url" placeholder="Project URL (optional)" value={p.link} onChange={e=>updateProject(idx,"link",e.target.value)} />
              </div>
            ))}
            <button type="button" className="feature-btn feature-btn--small" onClick={addProject}>+ Add Project</button>
          </section>

          {/* 06 Certs */}
          <section className="feature-card">
            <div className="feature-card__header"><span className="feature-card__step">06</span><div><h2 className="feature-card__title">Certifications</h2><p className="feature-card__subtitle">Certificates, courses and credentials</p></div></div>
            {formData.certifications.map((c, idx)=>(
              <div key={idx} className="feature-repeatable" style={{marginBottom:12}}>
                <div className="feature-repeatable__head"><span className="feature-repeatable__title">Certification #{idx+1}</span>{formData.certifications.length>1 && <button type="button" className="feature-remove-btn" onClick={()=>removeCertification(idx)}>Remove</button>}</div>
                <div className="feature-grid-2">
                  <input className="feature-input" placeholder="Certificate Name" value={c.name} onChange={e=>updateCertification(idx,"name",e.target.value)} />
                  <input className="feature-input" placeholder="Issuing Organization" value={c.issuer} onChange={e=>updateCertification(idx,"issuer",e.target.value)} />
                  <input className="feature-input" placeholder="Year" value={c.year} onChange={e=>updateCertification(idx,"year",e.target.value)} />
                  <input className="feature-input" placeholder="Certificate URL" value={c.link} onChange={e=>updateCertification(idx,"link",e.target.value)} />
                </div>
              </div>
            ))}
            <button type="button" className="feature-btn feature-btn--small" onClick={addCertification}>+ Add Certification</button>
          </section>

          {/* 07 Achievements */}
          <section className="feature-card">
            <div className="feature-card__header"><span className="feature-card__step">07</span><div><h2 className="feature-card__title">Achievements</h2><p className="feature-card__subtitle">Awards, competitions, leadership</p></div></div>
            {formData.achievements.map((a, idx)=>(
              <div key={idx} className="feature-repeatable" style={{marginBottom:12}}>
                <div className="feature-repeatable__head"><span className="feature-repeatable__title">Achievement #{idx+1}</span>{formData.achievements.length>1 && <button type="button" className="feature-remove-btn" onClick={()=>removeAchievement(idx)}>Remove</button>}</div>
                <div className="feature-grid-2">
                  <input className="feature-input" placeholder="Title" value={a.title} onChange={e=>updateAchievement(idx,"title",e.target.value)} />
                  <input className="feature-input" placeholder="Year" value={a.year} onChange={e=>updateAchievement(idx,"year",e.target.value)} />
                </div>
                <textarea className="feature-textarea" rows="3" placeholder="Describe your achievement..." value={a.description} onChange={e=>updateAchievement(idx,"description",e.target.value)} />
              </div>
            ))}
            <button type="button" className="feature-btn feature-btn--small" onClick={addAchievement}>+ Add Achievement</button>
          </section>

          {/* 08 Career Target */}
          <section className="feature-card">
            <div className="feature-card__header"><span className="feature-card__step">08</span><div><h2 className="feature-card__title">Career Target</h2><p className="feature-card__subtitle">Target the resume toward a specific job</p></div></div>
            <div className="feature-grid-2">
              <div><label className="feature-label">Target Role</label><input className="feature-input" value={formData.targetRole} onChange={e=>handleChange("targetRole",e.target.value)} placeholder="Software Engineer" required /></div>
              <div><label className="feature-label">Target Industry</label><input className="feature-input" value={formData.targetIndustry} onChange={e=>handleChange("targetIndustry",e.target.value)} placeholder="Technology" required /></div>
            </div>
          </section>

          <div className="feature-card" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10,textAlign:'center'}}>
            <button type="submit" className="feature-btn feature-btn--primary" disabled={loading} style={{minWidth:260,padding:'14px 24px',fontSize:15}}>{loading ? "Creating Resume..." : "✨ Create Professional Resume →"}</button>
            <p style={{fontSize:12,color:'#64748B',margin:0}}>Your resume will be saved and opened in the professional preview.</p>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};
export default ResumeBuilder;
