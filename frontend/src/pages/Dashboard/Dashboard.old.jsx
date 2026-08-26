import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // ======================================================
  // STATE
  // ======================================================

  const [selectedFile, setSelectedFile] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [skillGapLoading, setSkillGapLoading] = useState(false);
  const [jobMatchLoading, setJobMatchLoading] = useState(false);
  const [loadingResume, setLoadingResume] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  // Keep the dashboard safe while analysis is loading or unavailable.
  // This prevents errors such as:
  // "Cannot read properties of null (reading 'sectionsCount')".
  const safeAnalysis = analysis || {
    resumeId: null,
    atsScore: 0,
    skills: [],
    skillsCount: 0,
    sections: [],
    sectionsCount: 0,
    strengths: [],
    improvements: [],
    keywords: [],
    keywordsCount: 0,
    extractedTextLength: 0,
  };
  const [skillGap, setSkillGap] = useState(null);
  const [jobMatch, setJobMatch] = useState(null);

  const [targetRole, setTargetRole] =
    useState("Full Stack Developer");

  const [jobDescription, setJobDescription] =
    useState("");

  // ======================================================
  // LOAD LATEST SAVED RESUME
  // ======================================================

  useEffect(() => {
    const loadLatestResume = async () => {
      try {
        setLoadingResume(true);
        setError("");

        const response = await api.get(
          "/resumes/latest"
        );

        if (!response.data?.success) {
          return;
        }

        const latestResume =
          response.data.resume;

        if (!latestResume) {
          return;
        }

        setResume(latestResume);

        setAnalysis({
          atsScore:
            latestResume.atsScore ?? 0,

          skills:
            latestResume.skills || [],

          skillsCount:
            latestResume.skills?.length || 0,

          sections:
            latestResume.sections || [],

          sectionsCount:
            latestResume.sections?.length || 0,

          strengths:
            latestResume.strengths || [],

          improvements:
            latestResume.improvements || [],

          keywords:
            latestResume.keywords || [],

          keywordsCount:
            latestResume.keywords?.length || 0,

          extractedTextLength:
            latestResume.extractedTextLength || 0,
        });

        setMessage(
          "Your latest saved resume has been loaded."
        );
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error(
            "Load latest resume error:",
            err
          );
        }
      } finally {
        setLoadingResume(false);
      }
    };

    loadLatestResume();
  }, []);

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ======================================================
  // GET RESUME ID
  // ======================================================

  const getResumeId = () => {
    return (
      resume?.id ||
      resume?._id ||
      null
    );
  };

  // ======================================================
  // SELECT FILE
  // ======================================================

  const handleFileChange = (event) => {
    const file =
      event.target.files?.[0];

    setMessage("");
    setError("");

    setAnalysis(null);
    setSkillGap(null);
    setJobMatch(null);
    setResume(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const validExtension =
      file.name
        .toLowerCase()
        .endsWith(".pdf") ||
      file.name
        .toLowerCase()
        .endsWith(".docx");

    if (
      !allowedTypes.includes(file.type) &&
      !validExtension
    ) {
      setError(
        "Please select a valid PDF or DOCX resume."
      );

      setSelectedFile(null);
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setError(
        "Resume file must be smaller than 10 MB."
      );

      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  // ======================================================
  // UPLOAD RESUME
  // ======================================================

  const handleUpload = async () => {
    if (!selectedFile) {
      setError(
        "Please select a resume first."
      );
      return;
    }

    try {
      setUploading(true);
      setMessage("");
      setError("");

      const formData =
        new FormData();

      formData.append(
        "resume",
        selectedFile
      );

      const response =
        await api.post(
          "/resumes/upload",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Resume upload failed."
        );
      }

      const uploadedResume =
        response.data.resume;

      if (!uploadedResume) {
        throw new Error(
          "Resume was uploaded but no resume data was returned."
        );
      }

      setResume(uploadedResume);

      setMessage(
        "Resume uploaded successfully. Starting analysis..."
      );

      const resumeId =
        uploadedResume.id ||
        uploadedResume._id;

      if (!resumeId) {
        throw new Error(
          "Resume ID was not returned by the server."
        );
      }

      await analyzeResume(resumeId);
    } catch (err) {
      console.error(
        "Resume upload error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Resume upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  // ======================================================
  // ANALYZE RESUME
  // ======================================================

  const analyzeResume =
    async (resumeId) => {
      try {
        setAnalyzing(true);
        setMessage(
          "Analyzing your resume..."
        );
        setError("");

        const response =
          await api.post(
            `/resumes/${resumeId}/analyze`
          );

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ||
              "Resume analysis failed."
          );
        }

        const analysisData =
          response.data.analysis;

        if (!analysisData) {
          throw new Error(
            "Resume analysis completed but no analysis data was returned."
          );
        }

        setAnalysis({
          resumeId: analysisData.resumeId ?? resumeId,
          atsScore: Number(analysisData.atsScore) || 0,
          skills: Array.isArray(analysisData.skills)
            ? analysisData.skills
            : [],
          skillsCount:
            Number(analysisData.skillsCount) ||
            (Array.isArray(analysisData.skills)
              ? analysisData.skills.length
              : 0),
          sections: Array.isArray(analysisData.sections)
            ? analysisData.sections
            : [],
          sectionsCount:
            Number(analysisData.sectionsCount) ||
            (Array.isArray(analysisData.sections)
              ? analysisData.sections.length
              : 0),
          strengths: Array.isArray(analysisData.strengths)
            ? analysisData.strengths
            : [],
          improvements: Array.isArray(analysisData.improvements)
            ? analysisData.improvements
            : [],
          keywords: Array.isArray(analysisData.keywords)
            ? analysisData.keywords
            : [],
          keywordsCount:
            Number(analysisData.keywordsCount) ||
            (Array.isArray(analysisData.keywords)
              ? analysisData.keywords.length
              : 0),
          extractedTextLength:
            Number(analysisData.extractedTextLength) || 0,
        });

        setMessage(
          "Resume analyzed successfully!"
        );

        setTimeout(() => {
          document
            .getElementById(
              "resume-analysis"
            )
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
        }, 100);
      } catch (err) {
        console.error(
          "Resume analysis error:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Resume analysis failed. Please try again."
        );
      } finally {
        setAnalyzing(false);
      }
    };

  // ======================================================
  // SKILL GAP
  // ======================================================

  const handleSkillGapAnalysis = async () => {
  const resumeId = getResumeId();

  if (!resumeId) {
    setError(
      "Please upload and analyze a resume first."
    );
    return;
  }

  if (!analysis) {
    setError(
      "Please analyze your resume before running skill gap analysis."
    );
    return;
  }

  if (!targetRole.trim()) {
    setError(
      "Please enter a target role."
    );
    return;
  }

  try {
    setSkillGapLoading(true);
    setMessage("");
    setError("");

    const response = await api.post(
      `/skill-gap/${resumeId}`,
      {
        targetRole: targetRole.trim(),
      }
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message ||
          "Skill gap analysis failed."
      );
    }

    setSkillGap(
      response.data.skillGap
    );

    setMessage(
      "Skill gap analysis completed successfully!"
    );

    setTimeout(() => {
      document
        .getElementById("skill-gap-results")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  } catch (err) {
    console.error(
      "Skill gap analysis error:",
      err
    );

    setError(
      err.response?.data?.message ||
        err.message ||
        "Skill gap analysis failed. Please try again."
    );
  } finally {
    setSkillGapLoading(false);
  }
};
  
// JOB MATCH
// ======================================================

const handleJobMatch = async () => {
  const resumeId = getResumeId();

  if (!resumeId) {
    setError("Please upload and analyze a resume first.");
    return;
  }

  if (!analysis) {
    setError(
      "Please analyze your resume before matching it with a job."
    );
    return;
  }

  if (!jobDescription.trim()) {
    setError("Please paste a job description first.");
    return;
  }

  try {
    setJobMatchLoading(true);
    setMessage("");
    setError("");

    const response = await api.post(
      `/job-matching/${resumeId}`,
      {
        jobDescription: jobDescription.trim(),
      }
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || "Job matching failed."
      );
    }

    // Backend may return `jobMatch` (jobDescription mode) or
    // `jobMatching` (matching against DB jobs). Accept either.
    setJobMatch(response.data.jobMatch || response.data.jobMatching);

    setMessage(
      "Resume matched with job description successfully!"
    );

    setTimeout(() => {
      document
        .getElementById("job-match")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  } catch (err) {
    console.error("Job matching error:", err);

    setError(
      err.response?.data?.message ||
        err.message ||
        "Job matching failed. Please try again."
    );
  } finally {
    setJobMatchLoading(false);
  }
};

  // ======================================================
  // VIEW ANALYSIS
  // ======================================================

  const handleViewResumeAnalysis =
    () => {
      if (!analysis) {
        setError(
          "Please upload and analyze a resume first."
        );
        return;
      }

      document
        .getElementById(
          "resume-analysis"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    };

  // ======================================================
  // SCROLL HELPERS
  // ======================================================

  const scrollToSection =
    (id) => {
      document
        .getElementById(id)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    };

  // ======================================================
  // ATS COLOR
  // ======================================================

  const atsScore =
    Number(
      safeAnalysis.atsScore || 0
    );

  const atsColor =
    atsScore >= 80
      ? "green"
      : atsScore >= 60
      ? "yellow"
      : "red";

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-slate-900"
          >
            Resume<span className="text-blue-600">AI</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">

            <span className="hidden text-sm font-medium text-slate-600 sm:block">
              {user?.name || "User"}
            </span>

            <Link
              to="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Home
            </Link>

            <div className="flex items-center gap-2">

  <button
    onClick={() => navigate("/resume-builder")}
    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
  >
    Resume Builder
  </button>

  <button
    onClick={() => navigate("/job-optimization")}
    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
  >
    Job Optimization
  </button>

  <button
    onClick={() => navigate("/career-roadmap")}
    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
  >
    Career Roadmap
  </button>

  <button
    onClick={() => navigate("/ai-interviewer")}
    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
  >
    AI Interviewer
  </button>

  <button
    onClick={() => navigate("/progress-analytics")}
    className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
  >
    Progress Analytics
  </button>

  <button
    onClick={() => navigate("/resume-comparison")}
    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
  >
    Resume Comparison
  </button>

  <button
    onClick={() => navigate("/career-assistant")}
    className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
  >
    AI Career Assistant
  </button>

</div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>

          </div>
        </div>
      </header>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ==================================================
            HERO
        ================================================== */}

        <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6 text-white shadow-lg sm:p-8 lg:p-10">

          <div className="max-w-3xl">

            <div className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-100">
              Resume Dashboard
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Welcome, {user?.name || "User"}!
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Analyze your resume, understand your professional strengths, identify skill gaps, and compare your profile with real job descriptions.
            </p>

            {resume && (
              <div className="mt-6 flex flex-wrap items-center gap-3">

                <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm text-white">
                  <span>📄</span>

                  <span className="font-medium">
                    {resume.fileName || resume.originalName || resume.filename || "Saved Resume"}
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl bg-green-500/20 px-4 py-2 text-sm font-medium text-green-200">
                  <span>✓</span>
                  Saved resume loaded
                </div>

              </div>
            )}

          </div>
        </section>

        <section
  id="features"
  className="mx-auto max-w-7xl px-6 py-24"
>
  <div className="text-center">
    <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
      Features
    </p>

    <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
      Everything you need to improve your career profile
    </h2>

    <p className="mx-auto mt-4 max-w-2xl text-gray-600">
      ResumeAI combines resume analysis, skill-gap analysis,
      job matching, ATS insights, and AI-powered career guidance
      in one platform.
    </p>
  </div>

  <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="text-3xl">📄</div>

      <h3 className="mt-5 text-xl font-bold text-gray-900">
        Resume Analysis
      </h3>

      <p className="mt-3 leading-7 text-gray-600">
        Analyze resume content, skills, sections,
        strengths, keywords, and areas for improvement.
      </p>
    </div>

    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="text-3xl">🎯</div>

      <h3 className="mt-5 text-xl font-bold text-gray-900">
        Skill Gap Analysis
      </h3>

      <p className="mt-3 leading-7 text-gray-600">
        Compare your current skills with the requirements
        of a target professional role.
      </p>
    </div>

    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="text-3xl">💼</div>

      <h3 className="mt-5 text-xl font-bold text-gray-900">
        Job Matching
      </h3>

      <p className="mt-3 leading-7 text-gray-600">
        Compare your resume with job descriptions and
        understand your compatibility with opportunities.
      </p>
    </div>

    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="text-3xl">🤖</div>

      <h3 className="mt-5 text-xl font-bold text-gray-900">
        AI Career Analysis
      </h3>

      <p className="mt-3 leading-7 text-gray-600">
        Get AI-powered insights about career direction,
        strengths, weaknesses, improvements, and suitable roles.
      </p>
    </div>

  </div>
</section>

        {/* ==================================================
            MESSAGES
        ================================================== */}

        {/* ==================================================
    GLOBAL MESSAGES
================================================== */}

{/* Loading Message */}
{loadingResume && (
  <div className="mt-6 flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-700 shadow-sm">
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"></div>

    <span>
      Loading your latest saved resume...
    </span>
  </div>
)}

{/* Success Message */}
{message && !loadingResume && (
  <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700 shadow-sm">
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
      ✓
    </div>

    <div className="pt-0.5">
      {message}
    </div>
  </div>
)}

{/* Error Message */}
{error && (
  <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700 shadow-sm">
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
      !
    </div>

    <div className="pt-0.5">
      {error}
    </div>
  </div>
)}

        {/* ==================================================
            STATS
        ================================================== */}

        {/* ==================================================
    STATS
================================================== */}

<section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

  <StatCard
    icon="🎯"
    title="ATS Score"
    value={
      analysis
        ? `${safeAnalysis.atsScore}/100`
        : "--"
    }
    description={
      analysis
        ? "Current resume score"
        : "Upload your resume"
    }
    accent="blue"
    progress={
      analysis
        ? Number(safeAnalysis.atsScore) || 0
        : 0
    }
  />

  <StatCard
    icon="🧠"
    title="Skills"
    value={
      analysis
        ? safeAnalysis.skillsCount
        : "--"
    }
    description="Professional skills detected"
    accent="purple"
  />

  <StatCard
    icon="📑"
    title="Sections"
    value={
      analysis
        ? safeAnalysis.sectionsCount
        : "--"
    }
    description="Resume sections detected"
    accent="green"
  />

  <StatCard
    icon="📊"
    title="Skill Match"
    value={
      skillGap
        ? `${skillGap.skillMatchPercentage}%`
        : "--"
    }
    description={
      skillGap
        ? skillGap.targetRole
        : "Run skill gap analysis"
    }
    accent="orange"
    progress={
      skillGap
        ? Number(
            skillGap.skillMatchPercentage
          ) || 0
        : 0
    }
  />

</section>

        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        {analysis && (
          <section className="mt-8">

            <div className="mb-4">

              <h2 className="text-xl font-bold text-slate-900">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Continue improving your professional profile.
              </p>

            </div>

            <div className="grid gap-4 sm:grid-cols-3">

              <QuickAction
                icon="📄"
                title="Resume Analysis"
                description="View your resume insights"
                onClick={
                  handleViewResumeAnalysis
                }
              />

              <QuickAction
                icon="🎯"
                title="Skill Gap"
                description="Find skills to improve"
                onClick={() =>
                  scrollToSection(
                    "skill-gap"
                  )
                }
              />

              <QuickAction
                icon="💼"
                title="Job Matching"
                description="Compare with a job"
                onClick={() =>
                  scrollToSection(
                    "job-match"
                  )
                }
              />

            </div>

          </section>
        )}

        {/* ==================================================
    UPLOAD
================================================== */}

<section className="mt-8">

  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

    {/* HEADER */}

    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

      <div className="flex items-start gap-4">

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl shadow-sm">
          📄
        </div>

        <div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Upload Your Resume
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Upload a resume to unlock your complete AI-powered safeAnalysis.
          </p>

        </div>

      </div>

      <div className="hidden rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 sm:block">
        🔒 Secure Upload
      </div>

    </div>

    {/* UPLOAD AREA */}

    <div className="mt-7">

      <input
        id="resume-upload"
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileChange}
        className="hidden"
      />

      <label
        htmlFor="resume-upload"
        className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition duration-200 hover:border-blue-400 hover:bg-blue-50/40"
      >

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm transition duration-200 group-hover:scale-105">
          ⬆️
        </div>

        <p className="mt-5 text-base font-semibold text-slate-900">
          Choose your resume
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Click here to browse your files
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">

          <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
            PDF
          </span>

          <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
            DOCX
          </span>

          <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
            Max 10 MB
          </span>

        </div>

      </label>

    </div>

    {/* SELECTED FILE */}

    {selectedFile && (

      <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
            📎
          </div>

          <div className="min-w-0">

            <p className="text-xs font-medium text-blue-600">
              Selected resume
            </p>

            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
              {selectedFile.name}
            </p>

          </div>

        </div>

        <div className="shrink-0 text-xs font-medium text-slate-500">
          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
        </div>

      </div>

    )}

    {/* ACTION ROW */}

    <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <div>

        <p className="text-sm font-medium text-slate-700">
          Ready to analyze?
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Your resume will be analyzed for ATS readiness, skills,
          sections, keywords, strengths, and improvements.
        </p>

      </div>

      <button
        type="button"
        onClick={handleUpload}
        disabled={
          !selectedFile ||
          uploading ||
          analyzing ||
          skillGapLoading ||
          jobMatchLoading
        }
        className="inline-flex min-w-[190px] items-center justify-center rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-blue-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading
          ? "Uploading..."
          : analyzing
          ? "Analyzing..."
          : "Upload & Analyze →"}
      </button>

    </div>

    {/* FEATURES */}

    <div className="mt-7 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-3">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-sm">
          ✓
        </div>

        <div>

          <p className="text-xs font-semibold text-slate-700">
            ATS Analysis
          </p>

          <p className="text-xs text-slate-500">
            Resume readiness
          </p>

        </div>

      </div>

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm">
          ✓
        </div>

        <div>

          <p className="text-xs font-semibold text-slate-700">
            Skill Detection
          </p>

          <p className="text-xs text-slate-500">
            Professional skills
          </p>

        </div>

      </div>

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-sm">
          ✓
        </div>

        <div>

          <p className="text-xs font-semibold text-slate-700">
            AI Insights
          </p>

          <p className="text-xs text-slate-500">
            Strengths & improvements
          </p>

        </div>

      </div>

    </div>

  </div>

</section>

       {/* ==================================================
    RESUME ANALYSIS
================================================== */}

{analysis && (
  <section
    id="resume-analysis"
    className="mt-8 scroll-mt-24"
  >

    <SectionHeading
      title="Resume Analysis"
      description="Universal AI analysis of your resume content, regardless of your profession or target industry."
    />

    {/* ==================================================
        ANALYSIS OVERVIEW
    ================================================== */}

    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">

        {/* ATS SCORE */}

        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6 text-white sm:p-8">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                ATS Readiness
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                Resume Score
              </h3>

            </div>

            <div className="rounded-xl bg-white/10 px-3 py-2 text-lg">
              🎯
            </div>

          </div>

          <div className="mt-8 flex items-end gap-3">

            <span className="text-6xl font-bold tracking-tight">
              {safeAnalysis.atsScore}
            </span>

            <span className="pb-2 text-lg text-slate-300">
              /100
            </span>

          </div>

          {/* SCORE BAR */}

          <div className="mt-7">

            <div className="h-3 overflow-hidden rounded-full bg-white/10">

              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  atsColor === "green"
                    ? "bg-green-400"
                    : atsColor === "yellow"
                    ? "bg-yellow-400"
                    : "bg-red-400"
                }`}
                style={{
                  width: `${Math.min(
                    Math.max(atsScore, 0),
                    100
                  )}%`,
                }}
              />

            </div>

            <div className="mt-3 flex items-center justify-between text-xs">

              <span className="text-slate-400">
                ATS compatibility
              </span>

              <span className="font-semibold text-white">
                {Math.round(atsScore)}%
              </span>

            </div>

          </div>

          {/* SCORE MESSAGE */}

          <div className="mt-6 rounded-xl bg-white/10 p-4">

            <p className="text-sm leading-6 text-slate-200">

              {atsScore >= 80
                ? "Excellent ATS readiness. Your resume is well positioned for automated screening."
                : atsScore >= 60
                ? "Good ATS readiness. A few improvements could make your resume more competitive."
                : "Your resume needs improvement to perform better in ATS screening."}

            </p>

          </div>

        </div>

        {/* SUMMARY GRID */}

        <div>

          <div className="mb-4">

            <h3 className="text-xl font-bold text-slate-900">
              Resume Overview
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Key information extracted from your resume.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            <SummaryCard
              title="Skills Detected"
              value={safeAnalysis.skillsCount}
            />

            <SummaryCard
              title="Sections"
              value={safeAnalysis.sectionsCount}
            />

            <SummaryCard
              title="Keywords"
              value={safeAnalysis.keywordsCount}
            />

            <SummaryCard
              title="Resume Text"
              value={`${safeAnalysis.extractedTextLength} chars`}
            />

          </div>

        </div>

      </div>

    </div>

    {/* ==================================================
        RESUME SECTIONS
    ================================================== */}

    <AnalysisCard
      title="Resume Sections"
      description="Sections detected in your resume."
    >

      <div className="mb-4 flex items-center justify-between">

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {safeAnalysis.sectionsCount} sections
        </span>

      </div>

      <TagList
        items={safeAnalysis.sections}
        emptyMessage="No sections detected."
        color="blue"
      />

    </AnalysisCard>

    {/* ==================================================
        DETECTED SKILLS
    ================================================== */}

    <AnalysisCard
      title="Detected Skills"
      description="Professional skills identified from your resume."
    >

      <div className="mb-4 flex items-center justify-between">

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {safeAnalysis.skillsCount} skills
        </span>

      </div>

      <TagList
        items={safeAnalysis.skills}
        emptyMessage="No skills detected."
        color="slate"
      />

    </AnalysisCard>

    {/* ==================================================
        STRENGTHS
    ================================================== */}

    <AnalysisCard
      title="Resume Strengths"
      description="Positive signals identified by the AI safeAnalysis."
    >

      {safeAnalysis.strengths?.length > 0 ? (

        <div className="grid gap-3 md:grid-cols-2">

          {safeAnalysis.strengths.map(
            (strength, index) => (

              <div
                key={`${strength}-${index}`}
                className="group flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm"
              >

                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                  ✓
                </div>

                <p className="text-sm leading-6 text-green-800">
                  {strength}
                </p>

              </div>

            )
          )}

        </div>

      ) : (

        <EmptyState
          text="No specific strengths detected."
        />

      )}

    </AnalysisCard>

    {/* ==================================================
        IMPROVEMENTS
    ================================================== */}

    <AnalysisCard
      title="Recommended Improvements"
      description="Actionable suggestions to make your resume stronger."
    >

      {safeAnalysis.improvements?.length > 0 ? (

        <div className="space-y-3">

          {safeAnalysis.improvements.map(
            (improvement, index) => (

              <div
                key={`${improvement}-${index}`}
                className="flex items-start gap-3 rounded-2xl border border-yellow-100 bg-yellow-50 p-4 transition duration-200 hover:border-yellow-200"
              >

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-base">
                  💡
                </div>

                <p className="text-sm leading-6 text-yellow-800">
                  {improvement}
                </p>

              </div>

            )
          )}

        </div>

      ) : (

        <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-4">

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
            ✓
          </div>

          <p className="text-sm font-medium text-green-700">
            No major improvements detected.
          </p>

        </div>

      )}

    </AnalysisCard>

    {/* ==================================================
        KEYWORDS
    ================================================== */}

    <AnalysisCard
      title="Resume Keywords"
      description="Keywords detected that can help improve ATS matching."
    >

      <div className="mb-5 flex items-center justify-between">

        <div>

          <p className="text-sm font-medium text-slate-700">
            ATS Keyword Coverage
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Important terms identified from your resume content.
          </p>

        </div>

        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          {safeAnalysis.keywordsCount} keywords
        </span>

      </div>

      <TagList
        items={safeAnalysis.keywords}
        emptyMessage="No keywords detected."
        color="slate"
        square
      />

    </AnalysisCard>

  </section>
)}
        {/* ==================================================
    SKILL GAP
================================================== */}

{analysis && (
  <section
    id="skill-gap"
    className="mt-10 scroll-mt-24"
  >

    <SectionHeading
      title="Skill Gap Analysis"
      description="Compare your current professional skills with the requirements of your target role and identify where you can improve."
    />

 {/* ==================================================
        TARGET ROLE
    ================================================== */}

    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">

        <div>

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              🎯
            </div>

            <div>

              <h3 className="text-xl font-bold text-slate-900">
                Choose Your Target Role
              </h3>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Enter the professional role you want to compare your
                current skills against.
              </p>

            </div>

          </div>

          <div className="mt-6">

            <label htmlFor="target-role" className="text-sm font-semibold text-slate-700 target-label">
              <span className="label-pill">Target Role</span>
              <span style={{fontSize:14,color:'#0f1724',fontWeight:700}}>Pick a role or type one</span>
            </label>

            <input
              id="target-role"
              type="text"
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
              placeholder="e.g. Data Analyst, HR Manager, Frontend Developer"
              className="mt-2 w-full target-input text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-transparent focus:ring-0 lg:max-w-2xl"
            />

            <div className="role-chips" aria-hidden>
              {[
                'Frontend Developer',
                'Backend Developer',
                'Data Scientist',
                'Product Manager',
              ].map((role) => {
                const active = (role.toLowerCase() === (targetRole || '').toLowerCase());
                return (
                  <div
                    key={role}
                    onClick={() => setTargetRole(role)}
                    className={`role-chip ${active ? 'role-chip--active' : ''}`}
                  >
                    {role}
                  </div>
                );
              })}
            </div>

            <p className="mt-2 text-xs text-slate-400">You can enter any profession or job role.</p>

          </div>

        </div>

        <button
          type="button"
          onClick={handleSkillGapAnalysis}
          disabled={
            skillGapLoading ||
            !targetRole.trim()
          }
          className="rounded-xl bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          {skillGapLoading
            ? "Analyzing Skills..."
            : skillGap
            ? "Analyze Again"
            : "Analyze Skill Gap"}
        </button>

      </div>

    </div>

    {/* ==================================================
        SKILL GAP RESULT
    ================================================== */}

   {skillGap && (
  <div
    id="skill-gap-results"
    className="mt-5 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
  >
        {/* ==================================================
            SCORE OVERVIEW
        ================================================== */}

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">

          {/* SCORE */}

          <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 p-6 text-white sm:p-8">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                  Skill Compatibility
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  Skill Match
                </h3>

              </div>

              <div className="rounded-xl bg-white/10 px-3 py-2 text-xl">
                📊
              </div>

            </div>

            <div className="mt-8 flex items-end gap-2">

              <span className="text-6xl font-bold tracking-tight">
                {skillGap.skillMatchPercentage}
              </span>

              <span className="pb-2 text-lg text-blue-100">
                %
              </span>

            </div>

            {/* PROGRESS */}

            <div className="mt-7">

              <div className="h-3 overflow-hidden rounded-full bg-white/20">

                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      Math.max(
                        Number(
                          skillGap.skillMatchPercentage
                        ) || 0,
                        0
                      ),
                      100
                    )}%`,
                  }}
                />

              </div>

              <div className="mt-3 flex items-center justify-between text-xs">

                <span className="text-blue-100">
                  Current skill coverage
                </span>

                <span className="font-semibold">
                  {Math.round(
                    Number(
                      skillGap.skillMatchPercentage
                    ) || 0
                  )}
                  %
                </span>

              </div>

            </div>

            <div className="mt-6 rounded-xl bg-white/10 p-4">

              <p className="text-sm leading-6 text-blue-50">

                {Number(
                  skillGap.skillMatchPercentage
                ) >= 80
                  ? "Excellent skill alignment for this target role."
                  : Number(
                      skillGap.skillMatchPercentage
                    ) >= 60
                  ? "Good skill alignment with some areas available for improvement."
                  : "Your current profile has several skill areas that could be strengthened for this role."}

              </p>

            </div>

          </div>

          {/* ROLE SUMMARY */}

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                💼
              </div>

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Target Role
                </p>

                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  {skillGap.targetRole}
                </h3>

              </div>

            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl border border-green-100 bg-green-50 p-5">

                <p className="text-sm font-medium text-green-700">
                  Matched Skills
                </p>

                <p className="mt-2 text-3xl font-bold text-green-800">
                  {skillGap.matchedSkills?.length || 0}
                </p>

                <p className="mt-1 text-xs text-green-600">
                  Skills already aligned
                </p>

              </div>

              <div className="rounded-2xl border border-red-100 bg-red-50 p-5">

                <p className="text-sm font-medium text-red-700">
                  Skills to Improve
                </p>

                <p className="mt-2 text-3xl font-bold text-red-800">
                  {skillGap.missingSkills?.length || 0}
                </p>

                <p className="mt-1 text-xs text-red-600">
                  Recommended areas
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ==================================================
            MATCHED SKILLS
        ================================================== */}

        <div className="mt-8 border-t border-slate-200 pt-8">

          <div className="flex items-start justify-between gap-4">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-lg">
                  ✓
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  Matched Skills
                </h3>

              </div>

              <p className="mt-2 text-sm text-slate-500">
                Skills from your resume that align with this target role.
              </p>

            </div>

            <span className="hidden rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 sm:block">
              {skillGap.matchedSkills?.length || 0} matched
            </span>

          </div>

          <div className="mt-5">

            <TagList
              items={skillGap.matchedSkills}
              emptyMessage="No matching skills detected."
              color="green"
            />

          </div>

        </div>

        {/* ==================================================
            MISSING SKILLS
        ================================================== */}

        <div className="mt-8 border-t border-slate-200 pt-8">

          <div className="flex items-start justify-between gap-4">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-lg">
                  +
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  Skills to Improve
                </h3>

              </div>

              <p className="mt-2 text-sm text-slate-500">
                Skills that could strengthen your profile for this role.
              </p>

            </div>

            <span className="hidden rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 sm:block">
              {skillGap.missingSkills?.length || 0} recommended
            </span>

          </div>

          <div className="mt-5">

            {skillGap.missingSkills?.length > 0 ? (

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                {skillGap.missingSkills.map(
                  (skill, index) => (

                    <div
                      key={`${skill}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 transition duration-200 hover:border-red-200 hover:shadow-sm"
                    >

                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-red-600">
                        +
                      </span>

                      <span className="text-sm font-medium text-red-700">
                        {skill}
                      </span>

                    </div>

                  )
                )}

              </div>

            ) : (

              <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-5">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                  ✓
                </div>

                <p className="text-sm font-medium text-green-700">
                  Excellent! No major skill gaps detected for this role.
                </p>

              </div>

            )}

          </div>

        </div>

        {/* ==================================================
            LEARNING RECOMMENDATIONS
        ================================================== */}

        {skillGap.recommendations?.length > 0 && (

          <div className="mt-8 border-t border-slate-200 pt-8">

            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-50 text-lg">
                💡
              </div>

              <div>

                <h3 className="text-xl font-bold text-slate-900">
                  Learning Recommendations
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Suggestions based on the skill gaps identified in your profile.
                </p>

              </div>

            </div>

            <div className="mt-5 grid gap-3">

              {skillGap.recommendations.map(
                (recommendation, index) => (

                  <div
                    key={`${recommendation}-${index}`}
                    className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition duration-200 hover:border-blue-200 hover:bg-blue-50/40"
                  >

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-blue-600 shadow-sm">
                      {index + 1}
                    </div>

                    <p className="text-sm leading-6 text-slate-700">
                      {recommendation}
                    </p>

                  </div>

                )
              )}

            </div>

          </div>

        )}

      </div>
    )}

  </section>
)}

        {/* ==================================================
    JOB MATCH
================================================== */}

{analysis && (
  <section
    id="job-match"
    className="mt-10 scroll-mt-24"
  >

    <SectionHeading
      title="Job Matching"
      description="Compare your resume with any job description and understand how closely your experience, skills, and keywords match the opportunity."
    />

    {/* ==================================================
        JOB DESCRIPTION INPUT
    ================================================== */}

    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

      <div className="flex items-start gap-4">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
          💼
        </div>

        <div>

          <h3 className="text-xl font-bold text-slate-900">
            Compare With a Job
          </h3>

          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            Paste the complete job description below. ResumeAI will
            compare it against your resume and identify your strongest
            matches and areas that may need improvement.
          </p>

        </div>

      </div>

      {/* TEXTAREA */}

      <div className="mt-7">

        <label
          htmlFor="job-description"
          className="text-sm font-semibold text-slate-700"
        >
          Job Description
        </label>

        <textarea
          id="job-description"
          value={jobDescription}
          onChange={(event) =>
            setJobDescription(event.target.value)
          }
          placeholder="Paste the complete job description here..."
          rows={11}
          className="mt-2 w-full resize-y rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-xs text-slate-400">
            Paste the complete job posting for the most accurate comparison.
          </p>

          <p className="text-xs font-medium text-slate-500">
            {jobDescription.length} characters
          </p>

        </div>

      </div>

      {/* ACTION */}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">

        <button
          type="button"
          onClick={handleJobMatch}
          disabled={
            jobMatchLoading ||
            !jobDescription.trim()
          }
          className="rounded-xl bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          {jobMatchLoading
            ? "Analyzing Match..."
            : jobMatch
            ? "Analyze Again"
            : "Match Resume With Job"}
        </button>

      </div>

    </div>

    {/* ==================================================
        JOB MATCH RESULTS
    ================================================== */}

    {jobMatch && (
      <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

        {/* ==================================================
            MATCH OVERVIEW
        ================================================== */}

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">

          {/* OVERALL SCORE */}

          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-blue-700 p-6 text-white sm:p-8">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                  Job Compatibility
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  Overall Match
                </h3>

              </div>

              <div className="rounded-xl bg-white/10 px-3 py-2 text-xl">
                🎯
              </div>

            </div>

            <div className="mt-8 flex items-end gap-2">

              <span className="text-6xl font-bold tracking-tight">
                {jobMatch.overallMatchPercentage}
              </span>

              <span className="pb-2 text-lg text-blue-200">
                %
              </span>

            </div>

            {/* PROGRESS */}

            <div className="mt-7">

              <div className="h-3 overflow-hidden rounded-full bg-white/15">

                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      Math.max(
                        Number(
                          jobMatch.overallMatchPercentage
                        ) || 0,
                        0
                      ),
                      100
                    )}%`,
                  }}
                />

              </div>

              <div className="mt-3 flex items-center justify-between text-xs">

                <span className="text-blue-200">
                  Resume compatibility
                </span>

                <span className="font-semibold">
                  {Math.round(
                    Number(
                      jobMatch.overallMatchPercentage
                    ) || 0
                  )}
                  %
                </span>

              </div>

            </div>

            <div className="mt-6 rounded-xl bg-white/10 p-4">

              <p className="text-sm leading-6 text-blue-50">
                {Number(
                  jobMatch.overallMatchPercentage
                ) >= 80
                  ? "Excellent match. Your profile aligns strongly with this opportunity."
                  : Number(
                      jobMatch.overallMatchPercentage
                    ) >= 60
                  ? "Good match. Your profile has several relevant strengths with some areas to improve."
                  : "This opportunity has several gaps that you may want to address before applying."}
              </p>

            </div>

          </div>

          {/* MATCH BREAKDOWN */}

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Match Breakdown
              </p>

              <h3 className="mt-2 text-xl font-bold text-slate-900">
                How your resume compares
              </h3>

            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <MatchBreakdownCard
                title="Skill Match"
                value={jobMatch.skillMatchPercentage}
                icon="🧠"
              />

              <MatchBreakdownCard
                title="Keyword Match"
                value={jobMatch.keywordMatchPercentage}
                icon="🔑"
              />

              <MatchBreakdownCard
                title="Content Match"
                value={jobMatch.contentMatchPercentage}
                icon="📄"
              />

              <div className="rounded-2xl border border-slate-200 bg-white p-5">

                <p className="text-sm font-medium text-slate-500">
                  Match Level
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {jobMatch.matchLevel}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ==================================================
            MATCHED SKILLS
        ================================================== */}

        <div className="mt-8 border-t border-slate-200 pt-8">

          <div className="flex items-start justify-between gap-4">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-lg">
                  ✓
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  Matched Skills
                </h3>

              </div>

              <p className="mt-2 text-sm text-slate-500">
                Skills from your resume that are relevant to this job.
              </p>

            </div>

            <span className="hidden rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 sm:block">
              {jobMatch.matchedSkills?.length || 0} matched
            </span>

          </div>

          <div className="mt-5">

            {jobMatch.matchedSkills?.length > 0 ? (

              <div className="flex flex-wrap gap-2">

                {jobMatch.matchedSkills.map(
                  (skill, index) => (

                    <span
                      key={`${skill}-${index}`}
                      className="rounded-full border border-green-100 bg-green-50 px-4 py-2 text-sm font-medium text-green-700"
                    >
                      ✓ {skill}
                    </span>

                  )
                )}

              </div>

            ) : (

              <EmptyState text="No matching skills found." />

            )}

          </div>

        </div>

        {/* ==================================================
            MISSING SKILLS
        ================================================== */}

        <div className="mt-8 border-t border-slate-200 pt-8">

          <div className="flex items-start justify-between gap-4">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-lg">
                  +
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  Missing Skills
                </h3>

              </div>

              <p className="mt-2 text-sm text-slate-500">
                Skills mentioned in the job description that were not detected in your resume.
              </p>

            </div>

            <span className="hidden rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 sm:block">
              {jobMatch.missingSkills?.length || 0} missing
            </span>

          </div>

          <div className="mt-5">

            {jobMatch.missingSkills?.length > 0 ? (

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                {jobMatch.missingSkills.map(
                  (skill, index) => (

                    <div
                      key={`${skill}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 transition duration-200 hover:border-red-200 hover:shadow-sm"
                    >

                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-red-600">
                        +
                      </span>

                      <span className="text-sm font-medium text-red-700">
                        {skill}
                      </span>

                    </div>

                  )
                )}

              </div>

            ) : (

              <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-5">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                  ✓
                </div>

                <p className="text-sm font-medium text-green-700">
                  Excellent! No major missing skills were detected.
                </p>

              </div>

            )}

          </div>

        </div>

        {/* ==================================================
            JOB KEYWORDS
        ================================================== */}

        <div className="mt-8 border-t border-slate-200 pt-8">

          <div className="flex items-start gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
              🔑
            </div>

            <div>

              <h3 className="text-xl font-bold text-slate-900">
                Job Keywords
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Important keywords detected in the job description.
              </p>

            </div>

          </div>

          <div className="mt-5">

            <TagList
              items={jobMatch.jobKeywords}
              emptyMessage="No job keywords detected."
              color="slate"
              square
            />

          </div>

        </div>

        {/* ==================================================
            MISSING KEYWORDS
        ================================================== */}

        {jobMatch.missingKeywords?.length > 0 && (

          <div className="mt-8 border-t border-slate-200 pt-8">

            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-50 text-lg">
                💡
              </div>

              <div>

                <h3 className="text-xl font-bold text-slate-900">
                  Keywords to Consider
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Relevant job keywords that may be worth addressing in your resume.
                </p>

              </div>

            </div>

            <div className="mt-5 flex flex-wrap gap-2">

              {jobMatch.missingKeywords.map(
                (keyword, index) => (

                  <span
                    key={`${keyword}-${index}`}
                    className="rounded-lg border border-yellow-100 bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-800"
                  >
                    + {keyword}
                  </span>

                )
              )}

            </div>

          </div>

        )}

        {/* ==================================================
            RECOMMENDATIONS
        ================================================== */}

        {jobMatch.recommendations?.length > 0 && (

          <div className="mt-8 border-t border-slate-200 pt-8">

            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-lg">
                ✨
              </div>

              <div>

                <h3 className="text-xl font-bold text-slate-900">
                  Recommendations
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Suggestions to improve your resume for this specific opportunity.
                </p>

              </div>

            </div>

            <div className="mt-5 grid gap-3">

              {jobMatch.recommendations.map(
                (recommendation, index) => (

                  <div
                    key={`${recommendation}-${index}`}
                    className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition duration-200 hover:border-blue-200 hover:bg-blue-50/40"
                  >

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-blue-600 shadow-sm">
                      {index + 1}
                    </div>

                    <p className="text-sm leading-6 text-slate-700">
                      {recommendation}
                    </p>

                  </div>

                )
              )}

            </div>

          </div>

        )}

      </div>
    )}

  </section>
)}
        {/* ==================================================
            CAREER TOOLS
        ================================================== */}

        <section className="mt-12">

          <SectionHeading
            title="Career Tools"
            description="Quick access to the tools that help improve your resume."
          />

          <div className="grid gap-5 md:grid-cols-3">

            <ToolCard
              icon="📄"
              title="Resume Analysis"
              description="Review your ATS score, skills, sections, strengths, keywords, and improvements."
              onClick={
                handleViewResumeAnalysis
              }
              buttonText={
                analysis
                  ? "View Analysis →"
                  : "Upload Resume First →"
              }
              disabled={!analysis}
            />

            <ToolCard
              icon="🎯"
              title="Skill Gap Analysis"
              description="Compare your skills with the requirements of your target role."
              onClick={() =>
                scrollToSection(
                  "skill-gap"
                )
              }
              buttonText="Analyze Skill Gap →"
              disabled={!analysis}
            />

            <ToolCard
              icon="💼"
              title="Job Matching"
              description="Compare your resume against a real job description."
              onClick={() =>
                scrollToSection(
                  "job-match"
                )
              }
              buttonText="Match a Job →"
              disabled={!analysis}
            />

            <ToolCard
  icon="🎯"
  title="Job-Specific Resume Optimization"
  description="Optimize your resume for a specific job description using AI and improve your ATS match."
  onClick={() => navigate("/job-optimization")}
  buttonText="Optimize Resume →"
/>

          </div>

        </section>

      </main>
    </div>
  );
}

// ======================================================
// STAT CARD
// ======================================================

// ======================================================
// STAT CARD
// ======================================================

function StatCard({
  icon,
  title,
  value,
  description,
  accent = "blue",
  progress,
}) {
  const accentStyles = {
    blue: {
      icon:
        "bg-blue-50 text-blue-600",
      border:
        "hover:border-blue-200",
      progress:
        "bg-blue-600",
    },

    purple: {
      icon:
        "bg-purple-50 text-purple-600",
      border:
        "hover:border-purple-200",
      progress:
        "bg-purple-600",
    },

    green: {
      icon:
        "bg-green-50 text-green-600",
      border:
        "hover:border-green-200",
      progress:
        "bg-green-600",
    },

    orange: {
      icon:
        "bg-orange-50 text-orange-600",
      border:
        "hover:border-orange-200",
      progress:
        "bg-orange-500",
    },
  };

  const styles =
    accentStyles[accent] ||
    accentStyles.blue;

  const hasProgress =
    typeof progress === "number";

  const safeProgress = Math.min(
    Math.max(progress || 0, 0),
    100
  );

  return (
    <div
      className={`group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg ${styles.border}`}
    >

      {/* TOP ROW */}

      <div className="flex items-start justify-between">

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl transition duration-200 group-hover:scale-105 ${styles.icon}`}
        >
          {icon}
        </div>

        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>

      </div>

      {/* VALUE */}

      <div className="mt-5">

        <p className="text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </p>

        <p className="mt-2 text-sm leading-5 text-slate-500">
          {description}
        </p>

      </div>

      {/* PROGRESS */}

      {hasProgress && (
        <div className="mt-5">

          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Progress</span>

            <span>
              {Math.round(safeProgress)}%
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

            <div
              className={`h-full rounded-full transition-all duration-700 ${styles.progress}`}
              style={{
                width: `${safeProgress}%`,
              }}
            />

          </div>

        </div>
      )}

    </div>
  );
}
// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({
  title,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

// ======================================================
// SECTION HEADING
// ======================================================

function SectionHeading({
  title,
  description,
}) {
  return (
    <div className="mb-5">

      <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h2>

      {description && (
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}

    </div>
  );
}

// ======================================================
// ANALYSIS CARD
// ======================================================

function AnalysisCard({
  title,
  description,
  children,
}) {
  return (
    <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

      <h3 className="text-xl font-bold text-slate-900">
        {title}
      </h3>

      {description && (
        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      )}

      <div className="mt-5">
        {children}
      </div>

    </div>
  );
}

// ======================================================
// TAG LIST
// ======================================================

function TagList({
  items,
  emptyMessage,
  color = "slate",
  square = false,
}) {
  if (!items?.length) {
    return (
      <EmptyState
        text={emptyMessage}
      />
    );
  }

  const colorClasses = {
    blue:
      "bg-blue-50 text-blue-700 border-blue-100",

    green:
      "bg-green-50 text-green-700 border-green-100",

    slate:
      "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <div className="flex flex-wrap gap-2">

      {items.map((item) => (
        <span
          key={item}
          className={`border px-3 py-2 text-sm font-medium ${
            square
              ? "rounded-lg"
              : "rounded-full"
          } ${
            colorClasses[color]
          }`}
        >
          {item}
        </span>
      ))}

    </div>
  );
}

// ======================================================
// RESULT LIST
// ======================================================

function ResultList({
  title,
  items,
  type,
  emptyMessage,
}) {
  const matched =
    type === "matched";

  return (
    <div className="mt-8">

      <h3 className="text-xl font-bold text-slate-900">
        {title}
      </h3>

      <div className="mt-4">

        {items?.length > 0 ? (
          <div className="flex flex-wrap gap-2">

            {items.map((item) => (
              <span
                key={item}
                className={
                  matched
                    ? "rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700"
                    : "rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-700"
                }
              >
                {matched
                  ? `✓ ${item}`
                  : `+ ${item}`}
              </span>
            ))}

          </div>
        ) : (
          <EmptyState
            text={emptyMessage}
          />
        )}

      </div>

    </div>
  );
}

// ======================================================
// MATCH STAT
// ======================================================

function MatchStat({
  title,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

// ======================================================
// MATCH BREAKDOWN CARD
// ======================================================

function MatchBreakdownCard({
  title,
  value,
  icon,
}) {
  const percentage = Math.min(
    Math.max(Number(value) || 0, 0),
    100
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-lg">
            {icon}
          </div>

          <p className="text-sm font-medium text-slate-600">
            {title}
          </p>

        </div>

        <span className="text-lg font-bold text-slate-900">
          {percentage}%
        </span>

      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-700"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}

// ======================================================
// QUICK ACTION
// ======================================================

function QuickAction({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
        {icon}
      </div>

      <div>

        <p className="font-semibold text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>

      </div>

    </button>
  );
}

// ======================================================
// TOOL CARD
// ======================================================

function ToolCard({
  icon,
  title,
  description,
  onClick,
  buttonText,
  disabled,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-500">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {buttonText}
      </button>

    </div>
  );
}

// ======================================================
// EMPTY STATE
// ======================================================

function EmptyState({
  text,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
      {text}
    </div>
  );
}

export default Dashboard;