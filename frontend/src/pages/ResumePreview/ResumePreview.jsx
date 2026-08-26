import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import api from "../../services/api";

import "./ResumePreview.css";

const API_URL = "http://localhost:5000";

const ResumePreview = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type");

  const navigate = useNavigate();

  const [resume, setResume] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // LOAD RESUME
  // ==========================================

  const [isUploaded, setIsUploaded] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  useEffect(() => { return () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }; }, [fileUrl]);

  useEffect(() => {
    const loadResume = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem(
            "authToken"
          ) ||
          localStorage.getItem(
            "accessToken"
          );

        if (!token) {
          navigate("/login");
          return;
        }

        if (!id || id === "undefined" || id === "null" || String(id).length !== 24) {
          throw new Error(
            "Invalid resume ID"
          );
        }

        // Try uploaded resume first if type=uploaded, else builder
        let data = null;
        let success = false;
        let fetched = null;

        const tryUploaded = async () => {
          try {
            const res = await api.get(`/resumes/${id}`);
            if (res.data?.success && res.data?.resume) {
              fetched = res.data.resume;
              success = true;
              setIsUploaded(true);
              return true;
            }
          } catch (e) {
            // ignore
          }
          return false;
        };

        const tryBuilder = async () => {
          try {
            const response = await fetch(
              `${API_URL}/api/resumes/builder/${id}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                credentials: "include",
              }
            );
            const j = await response.json();
            if (response.ok && j?.success && j?.resume) {
              fetched = j.resume;
              success = true;
              setIsUploaded(false);
              return true;
            }
          } catch (e) {}
          return false;
        };

        if (typeParam === "uploaded") {
          if (!(await tryUploaded())) await tryBuilder();
        } else {
          if (!(await tryBuilder())) await tryUploaded();
        }

        if (!success || !fetched) {
          throw new Error("Resume not found");
        }

        console.log("Resume preview:", fetched);
        setResume(fetched);
        // If uploaded resume, fetch file blob for inline preview
        if (fetched && (fetched.fileName || fetched.originalName)) {
          try {
            const fileRes = await api.get(`/resumes/${id}/file`, { responseType: 'blob' });
            const blob = fileRes.data;
            const url = URL.createObjectURL(blob);
            setFileUrl(url);
          } catch (e) {
            console.warn("File preview not available", e?.message);
          }
        }
      } catch (err) {
        console.error(
          "RESUME PREVIEW ERROR:",
          err
        );

        setError(
          err.message ||
            "Failed to load resume"
        );
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, [id, navigate, typeParam]);

  // ==========================================
  // PRINT
  // ==========================================

  const printResume = () => {
    window.print();
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="preview-loading">
        <div className="preview-spinner"></div>

        <h2>
          Loading your resume...
        </h2>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="preview-error">

        <h2>
          Resume not found
        </h2>

        <p>
          {error}
        </p>

        <Link to="/dashboard">
          ← Back to Dashboard
        </Link>

      </div>
    );
  }

  // ==========================================
  // SAFE DATA
  // ==========================================

  const personal =
    resume.personalInfo || {};

  const education =
    Array.isArray(resume.education)
      ? resume.education
      : [];

  const projects =
    Array.isArray(resume.projects)
      ? resume.projects
      : [];

  const skills =
    Array.isArray(resume.skills)
      ? resume.skills
      : [];

  const experience =
    Array.isArray(resume.experience)
      ? resume.experience
      : [];

  const certifications =
    Array.isArray(
      resume.certifications
    )
      ? resume.certifications
      : [];

  const achievements =
    Array.isArray(
      resume.achievements
    )
      ? resume.achievements
      : [];

  // ==========================================
  // RESUME
  // ==========================================

  return (
    <div className="preview-page">

      {/* ====================================
          ACTION BAR
      ==================================== */}

      <div className="preview-actions no-print">

        <Link to="/dashboard">
          ← Dashboard
        </Link>

        <div style={{display:'flex', gap:'8px'}}>

          {!isUploaded && (
            <button
              onClick={() =>
                navigate(
                  `/resume-builder?edit=${resume._id || resume.id}`
                )
              }
            >
              Edit Resume
            </button>
          )}

          <button
            onClick={printResume}
            className="print-button"
          >
            Print / Save PDF
          </button>

        </div>

      </div>


      {/* ====================================
          RESUME PAPER (Uploaded = Original only)
      ==================================== */}
      {isUploaded ? (
        <main className="resume-paper" style={{padding:'0', background:'#fff', overflow:'hidden'}}>
          <div style={{display:'flex', alignItems:'center', gap:'12px', padding:'14px 18px', background:'linear-gradient(135deg,#EAFBFF,#EEF2FF)', borderBottom:'1px solid #E2E8F0'}}>
            <span style={{width:'36px', height:'36px', borderRadius:'10px', background:'#fff', border:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>📄</span>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:'14px', fontWeight:800, color:'#0F172A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{resume.originalName || resume.fileName}</div>
              <div style={{fontSize:'11px', color:'#64748B'}}>{resume.fileType?.includes('pdf') ? 'PDF' : 'DOCX'} • {(resume.fileSize/1024).toFixed(1)} KB • {new Date(resume.createdAt).toLocaleDateString()}</div>
            </div>
            {fileUrl && <a href={fileUrl} download={resume.originalName} style={{padding:'8px 14px', background:'#0F172A', color:'#fff', borderRadius:'999px', fontSize:'12px', fontWeight:700, textDecoration:'none', flexShrink:0}}>Download Original</a>}
          </div>

          {fileUrl && resume.fileType?.includes('pdf') ? (
            <iframe src={fileUrl} title="Original Resume" style={{width:'100%', height:'calc(100vh - 120px)', minHeight:'720px', border:'none', display:'block', background:'#fff'}} />
          ) : (
            <div style={{padding:'0'}}>
              {resume.extractedText && resume.extractedText.trim().length > 10 ? (
                <div style={{padding:'24px'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px', padding:'10px 14px', background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:'10px', fontSize:'12px', color:'#1E40AF', fontWeight:600}}>
                    <span>📄</span> Showing extracted content from original • {resume.originalName}
                    {fileUrl && <a href={fileUrl} download={resume.originalName} style={{marginLeft:'auto', padding:'6px 12px', background:'#1E40AF', color:'#fff', borderRadius:'999px', fontSize:'11px', textDecoration:'none'}}>Download PDF</a>}
                  </div>
                  <div style={{background:'#fff', border:'1px solid #E2E8F0', borderRadius:'12px', padding:'24px', boxShadow:'0 4px 16px rgba(0,0,0,0.04)'}}>
                    <pre style={{whiteSpace:'pre-wrap', fontFamily:'Inter, sans-serif', fontSize:'13px', lineHeight:1.7, color:'#0F172A', margin:0}}>{resume.extractedText}</pre>
                  </div>
                </div>
              ) : fileUrl ? (
                <div style={{padding:'32px', textAlign:'center'}}>
                  <p style={{fontSize:'13px', color:'#475569', marginBottom:'16px'}}>Preview not available for DOCX in browser.</p>
                  <a href={fileUrl} download={resume.originalName} style={{display:'inline-flex', padding:'12px 20px', background:'linear-gradient(135deg,#22C7D6,#4F8CFF)', color:'#fff', borderRadius:'999px', fontSize:'13px', fontWeight:700, textDecoration:'none', boxShadow:'0 8px 24px rgba(34,199,214,0.25)'}}>Download Original Resume</a>
                </div>
              ) : (
                <div style={{padding:'48px 24px', textAlign:'center'}}>
                  <div style={{width:'56px', height:'56px', borderRadius:'16px', background:'#FEF2F2', border:'1px solid #FECACA', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'24px'}}>⚠️</div>
                  <p style={{fontSize:'14px', fontWeight:700, color:'#0F172A', margin:'0 0 6px'}}>Original file not found on server</p>
                  <p style={{fontSize:'12px', color:'#64748B', margin:'0 0 16px', maxWidth:'420px', marginLeft:'auto', marginRight:'auto'}}>This can happen if the server restarted or the file was cleaned. Please re-upload your resume to view the original.</p>
                  <button onClick={()=>window.location.href='/resume-analysis'} style={{padding:'10px 18px', background:'#0F172A', color:'#fff', borderRadius:'999px', fontSize:'13px', fontWeight:700, border:'none', cursor:'pointer'}}>Go to Upload</button>
                </div>
              )}
            </div>
          )}
        </main>
      ) : (
        <main className="resume-paper">

        {/* HEADER */}

        <header className="resume-header">

          <h1>
            {personal.fullName ||
              "Your Name"}
          </h1>

          <div className="contact-info">

            {personal.email && (
              <span>
                {personal.email}
              </span>
            )}

            {personal.phone && (
              <span>
                {personal.phone}
              </span>
            )}

            {personal.location && (
              <span>
                {personal.location}
              </span>
            )}

            {personal.linkedin && (
              <a
                href={
                  personal.linkedin
                }
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            )}

            {personal.github && (
              <a
                href={
                  personal.github
                }
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            )}

          </div>

        </header>


        {/* ====================================
            SUMMARY
        ==================================== */}

        {(resume.generatedSummary ||
          resume.summary) && (

          <section className="resume-section">

            <h2>
              Professional Summary
            </h2>

            <p>
              {resume.generatedSummary ||
                resume.summary}
            </p>

          </section>

        )}


        {/* ====================================
            SKILLS
        ==================================== */}

        {skills.length > 0 && (

          <section className="resume-section">

            <h2>
              Technical Skills
            </h2>

            <div className="skill-list">

              {skills.map(
                (skill, index) => (

                  <span
                    key={index}
                  >
                    {skill}
                  </span>

                )
              )}

            </div>

          </section>

        )}


        {/* ====================================
            EXPERIENCE
        ==================================== */}

        {experience.length > 0 && (

          <section className="resume-section">

            <h2>
              Experience
            </h2>

            {experience.map(
              (item, index) => (

                <article
                  className="experience-item"
                  key={
                    item._id ||
                    index
                  }
                >

                  <div className="experience-top">

                    <strong>
                      {item.position ||
                        item.title}
                    </strong>

                    <span>
                      {item.startDate}

                      {item.endDate
                        ? ` - ${item.endDate}`
                        : ""}
                    </span>

                  </div>

                  {item.company && (
                    <div>
                      <strong>
                        {item.company}
                      </strong>
                    </div>
                  )}

                  {item.description && (
                    <p>
                      {item.description}
                    </p>
                  )}

                </article>

              )
            )}

          </section>

        )}


        {/* ====================================
            EDUCATION
        ==================================== */}

        {education.length > 0 && (

          <section className="resume-section">

            <h2>
              Education
            </h2>

            {education.map(
              (edu, index) => (

                <div
                  className="education-item"
                  key={
                    edu._id ||
                    index
                  }
                >

                  <div className="education-top">

                    <strong>
                      {edu.degree}
                    </strong>

                    <span>

                      {edu.startYear}

                      {edu.endYear
                        ? ` - ${edu.endYear}`
                        : ""}

                    </span>

                  </div>

                  {edu.institution && (
                    <div className="institution">
                      {edu.institution}
                    </div>
                  )}

                  {edu.field && (
                    <div className="field">
                      {edu.field}
                    </div>
                  )}

                  {edu.grade && (
                    <div className="grade">
                      {edu.grade}
                    </div>
                  )}

                </div>

              )
            )}

          </section>

        )}


        {/* ====================================
            PROJECTS
        ==================================== */}

        {projects.length > 0 && (

          <section className="resume-section">

            <h2>
              Projects
            </h2>

            {projects.map(
              (project, index) => (

                <article
                  className="project-item"
                  key={
                    project._id ||
                    index
                  }
                >

                  <div className="project-title">

                    <strong>
                      {project.name}
                    </strong>

                    {project.link && (
                      <a
                        href={
                          project.link
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Project
                      </a>
                    )}

                  </div>

                  {project.technologies
                    ?.length > 0 && (

                    <p className="technologies">

                      <strong>
                        Technologies:
                      </strong>{" "}

                      {project.technologies.join(
                        ", "
                      )}

                    </p>

                  )}

                  {project.description && (
                    <p>
                      {project.description}
                    </p>
                  )}

                </article>

              )
            )}

          </section>

        )}


        {/* ====================================
            CERTIFICATIONS
        ==================================== */}

        {certifications.length > 0 && (

          <section className="resume-section">

            <h2>
              Certifications
            </h2>

            {certifications.map(
              (cert, index) => (

                <article
                  className="certification-item"
                  key={
                    cert._id ||
                    index
                  }
                >

                  <div className="certification-top">

                    <strong>
                      {cert.name}
                    </strong>

                    {cert.year && (
                      <span>
                        {cert.year}
                      </span>
                    )}

                  </div>

                  {cert.issuer && (
                    <div>
                      {cert.issuer}
                    </div>
                  )}

                  {cert.link && (
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Certificate
                    </a>
                  )}

                </article>

              )
            )}

          </section>

        )}


        {/* ====================================
            ACHIEVEMENTS
        ==================================== */}

        {achievements.length > 0 && (

          <section className="resume-section">

            <h2>
              Achievements
            </h2>

            {achievements.map(
              (achievement, index) => (

                <article
                  className="achievement-item"
                  key={
                    achievement._id ||
                    index
                  }
                >

                  <div className="achievement-top">

                    <strong>
                      {achievement.title}
                    </strong>

                    {achievement.year && (
                      <span>
                        {achievement.year}
                      </span>
                    )}

                  </div>

                  {achievement.description && (
                    <p>
                      {achievement.description}
                    </p>
                  )}

                </article>

              )
            )}

          </section>

        )}

      </main>
      )}

    </div>
  );
};

export default ResumePreview;