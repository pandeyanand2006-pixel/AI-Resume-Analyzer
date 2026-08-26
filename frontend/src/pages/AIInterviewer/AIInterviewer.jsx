import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AppLayout from "../../components/layout/AppLayout";
import { Card, Button, Badge, Input, Select } from "../../components/ui";
import api from "../../services/api";
import "./AIInterviewer.css";
import "../../styles/feature-pages.css";

function AIInterviewer() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // ======================================================
  // STATE
  // ======================================================

  const [step, setStep] = useState("setup"); // setup, interview, results

  // Setup form
  const [targetRole, setTargetRole] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("entry");
  const [interviewType, setInterviewType] = useState("mixed");
  const [difficulty, setDifficulty] = useState("medium");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [selectedResumeId, setSelectedResumeId] = useState("");

  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);

  // Interview state
  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Creating/completing
  const [creating, setCreating] = useState(false);
  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ======================================================
  // LOAD RESUMES
  // ======================================================

  useEffect(() => {
    loadUserResumes();
  }, []);

  const loadUserResumes = async () => {
    try {
      setLoadingResumes(true);

      const response = await api.get("/resumes/builder");

      if (response.data?.success) {
        setResumes(response.data.resumes || []);

        // Auto-select latest resume
        if (response.data.resumes && response.data.resumes.length > 0) {
          const latest = response.data.resumes[0];
          setSelectedResumeId(latest._id || latest.id);

          // Pre-fill target role and industry if available
          if (latest.targetRole) {
            setTargetRole(latest.targetRole);
          }

          if (latest.targetIndustry) {
            setTargetIndustry(latest.targetIndustry);
          }
        }
      }
    } catch (err) {
      console.error("Load resumes error:", err);
    } finally {
      setLoadingResumes(false);
    }
  };

  // ======================================================
  // CREATE INTERVIEW
  // ======================================================

  const handleCreateInterview = async () => {
    if (!targetRole.trim()) {
      setError("Please enter your target role");
      return;
    }

    if (!targetIndustry.trim()) {
      setError("Please enter your target industry");
      return;
    }

    try {
      setCreating(true);
      setMessage("");
      setError("");

      const response = await api.post("/interviews", {
        targetRole: targetRole.trim(),
        targetIndustry: targetIndustry.trim(),
        experienceLevel,
        interviewType,
        difficulty,
        numberOfQuestions,
        resumeId: selectedResumeId || null,
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to create interview");
      }

      setInterview(response.data.interview);
      setMessage("Interview created successfully! Ready to start.");
    } catch (err) {
      console.error("Create interview error:", err);
      setError(err.response?.data?.message || err.message || "Failed to create interview");
    } finally {
      setCreating(false);
    }
  };

  // ======================================================
  // START INTERVIEW
  // ======================================================

  const handleStartInterview = async () => {
    if (!interview) return;

    try {
      setStarting(true);
      setMessage("");
      setError("");

      const response = await api.post(`/interviews/${interview._id}/start`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to start interview");
      }

      setInterview(response.data.interview);
      setStep("interview");
      setCurrentQuestionIndex(0);
      setCurrentAnswer("");
      setShowFeedback(false);
    } catch (err) {
      console.error("Start interview error:", err);
      setError(err.response?.data?.message || err.message || "Failed to start interview");
    } finally {
      setStarting(false);
    }
  };

  // ======================================================
  // SUBMIT ANSWER
  // ======================================================

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      setError("Please enter your answer");
      return;
    }

    if (!interview) return;

    const currentQuestion = interview.questions[currentQuestionIndex];

    try {
      setSubmittingAnswer(true);
      setMessage("");
      setError("");

      const response = await api.post(`/interviews/${interview._id}/answer`, {
        questionNumber: currentQuestion.questionNumber,
        answer: currentAnswer.trim(),
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to submit answer");
      }

      // Update interview with feedback
      setInterview(response.data.interview);
      setShowFeedback(true);
      setMessage("Answer submitted and evaluated!");
    } catch (err) {
      console.error("Submit answer error:", err);
      setError(err.response?.data?.message || err.message || "Failed to submit answer");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // ======================================================
  // NEXT QUESTION
  // ======================================================

  const handleNextQuestion = () => {
    if (currentQuestionIndex < interview.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer("");
      setShowFeedback(false);
      setMessage("");
      setError("");
    }
  };

  // ======================================================
  // COMPLETE INTERVIEW
  // ======================================================

  const handleCompleteInterview = async () => {
    if (!interview) return;

    try {
      setCompleting(true);
      setMessage("");
      setError("");

      const response = await api.post(`/interviews/${interview._id}/complete`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to complete interview");
      }

      setInterview(response.data.interview);
      setStep("results");
      setMessage("Interview completed! Here are your results.");
    } catch (err) {
      console.error("Complete interview error:", err);
      setError(err.response?.data?.message || err.message || "Failed to complete interview");
    } finally {
      setCompleting(false);
    }
  };

  // ======================================================
  // RESTART
  // ======================================================

  const handleRestart = () => {
    setStep("setup");
    setInterview(null);
    setCurrentQuestionIndex(0);
    setCurrentAnswer("");
    setShowFeedback(false);
    setMessage("");
    setError("");
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ======================================================
  // RENDER
  // ======================================================

  const currentQuestion = interview?.questions?.[currentQuestionIndex];
  const isLastQuestion = interview && currentQuestionIndex === interview.questions.length - 1;
  const allQuestionsAnswered =
    interview && interview.questions.every((q) => q.answered);

  return (
    <AppLayout pageTitle="AI Interviewer">
      <div className="ai-interviewer-page">
        {/* ==================================================
            HERO
        ================================================== */}

        <section className="aii-hero">
          <div>
            <div className="aii-hero__badge">✨ AI-Powered</div>
            <h1 className="aii-hero__title">Practice Interviews with AI</h1>
            <p className="aii-hero__sub">Get personalized interview practice for your target role and industry. Receive instant AI-powered feedback on your answers and improve your interview skills.</p>
          </div>
          <div className="aii-hero__side">
            <div className="aii-hero__stats">
              <div className="aii-hero__stat"><span className="aii-hero__stat-val">{resumes.length}</span><span className="aii-hero__stat-lab">Resumes</span></div>
              <div className="aii-hero__stat"><span className="aii-hero__stat-val">{interview?.questions?.length || 5}</span><span className="aii-hero__stat-lab">Questions</span></div>
            </div>
            <p style={{margin:'12px 0 0', fontSize:'12px', color:'#64748B', display:'flex', gap:'6px', alignItems:'center'}}>🎯 Tailored to your role • Instant scoring</p>
          </div>
        </section>

        {/* ==================================================
            MESSAGES
        ================================================== */}

        {message && (<div className="aii-alert aii-alert--success">✓ {message}</div>)}
        {error && (<div className="aii-alert aii-alert--error">⚠ {error}</div>)}

        {/* ==================================================
            SETUP STEP
        ================================================== */}

        {step === "setup" && (
          <section className="aii-card">
            <div className="aii-card__head">
              <div className="aii-card__icon">⚙️</div>
              <div><h2 className="aii-card__title">Interview Setup</h2><p className="aii-card__sub">Configure your interview session parameters</p></div>
            </div>
            <div className="aii-grid">
              <label className="aii-field"><span className="aii-field__label">Target Role *</span><Input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g., Software Engineer, Financial Analyst" /></label>
              <label className="aii-field"><span className="aii-field__label">Target Industry *</span><Input type="text" value={targetIndustry} onChange={(e) => setTargetIndustry(e.target.value)} placeholder="e.g., Technology, Finance, Healthcare" /></label>
              <label className="aii-field"><span className="aii-field__label">Experience Level</span><Select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}><option value="entry">Entry Level</option><option value="junior">Junior</option><option value="mid">Mid Level</option><option value="senior">Senior</option><option value="lead">Lead</option><option value="executive">Executive</option></Select></label>
              <label className="aii-field"><span className="aii-field__label">Interview Type</span><Select value={interviewType} onChange={(e) => setInterviewType(e.target.value)}><option value="mixed">Mixed</option><option value="hr">HR Interview</option><option value="technical">Technical Interview</option><option value="behavioral">Behavioral Interview</option><option value="role_specific">Role-Specific Interview</option></Select></label>
              <label className="aii-field"><span className="aii-field__label">Difficulty</span><Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></Select></label>
              <label className="aii-field"><span className="aii-field__label">Number of Questions</span><Input type="number" value={numberOfQuestions} onChange={(e) => setNumberOfQuestions(Math.min(20, Math.max(1, parseInt(e.target.value) || 5)))} min="1" max="20" /></label>
              <label className="aii-field" style={{gridColumn:'1 / -1'}}><span className="aii-field__label">Select Resume (Optional)</span><Select value={selectedResumeId} onChange={(e) => setSelectedResumeId(e.target.value)} disabled={loadingResumes}><option value="">No Resume Selected</option>{resumes.map((resume) => (<option key={resume._id || resume.id} value={resume._id || resume.id}>{resume.personalInfo?.fullName || "Resume"} — {new Date(resume.createdAt).toLocaleDateString()}</option>))}</Select></label>
            </div>
            <div className="aii-actions">
              {!interview && (<Button onClick={handleCreateInterview} disabled={creating} variant="primary" size="lg" loading={creating}>Create Interview</Button>)}
              {interview && interview.status === "setup" && (<Button onClick={handleStartInterview} disabled={starting} variant="primary" size="lg" loading={starting}>Start Interview →</Button>)}
            </div>
          </section>
        )}

        {/* ==================================================
            INTERVIEW STEP
        ================================================== */}

        {step === "interview" && interview && currentQuestion && (
          <section style={{display:'flex', flexDirection:'column', gap:'16px'}}>
            <div className="aii-progress">
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                <span style={{fontSize:'12px', fontWeight:800, color:'#334155'}}>Question {currentQuestionIndex + 1} of {interview.questions.length}</span>
                <span style={{fontSize:'12px', fontWeight:700, color:'#4F8CFF'}}>{Math.round(((currentQuestionIndex + 1) / interview.questions.length) * 100)}%</span>
              </div>
              <div className="aii-progress__bar"><div className="aii-progress__fill" style={{ width: `${((currentQuestionIndex + 1) / interview.questions.length) * 100}%` }} /></div>
            </div>
            <div className="aii-question">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-2xl shadow-sm">
                  💬
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      {currentQuestion.questionType}
                    </span>
                    <span className="rounded-lg bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                      {currentQuestion.difficulty}
                    </span>
                    {currentQuestion.category && (
                      <span className="rounded-lg bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        {currentQuestion.category}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 leading-relaxed">
                    {currentQuestion.questionText}
                  </h3>
                </div>
              </div>

              {!currentQuestion.answered && !showFeedback && (
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Your Answer
                  </label>
                  <Input
                    type="textarea"
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={8}
                  />

                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={submittingAnswer || !currentAnswer.trim()}
                      variant="primary"
                      size="lg"
                      loading={submittingAnswer}
                    >
                      Submit Answer
                    </Button>
                  </div>
                </div>
              )}

              {/* Feedback */}
              {(currentQuestion.answered || showFeedback) && (
                <div className="mt-6 space-y-4">
                  {/* Your Answer */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Your Answer:</p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {currentQuestion.userAnswer}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-indigo-700">Score:</span>
                      <span className="text-3xl font-bold text-indigo-600">
                        {currentQuestion.score}/10
                      </span>
                    </div>
                  </div>

                  {/* Feedback */}
                  {currentQuestion.feedback && (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                      <p className="text-sm font-semibold text-blue-700 mb-2">Feedback:</p>
                      <p className="text-sm text-blue-600 leading-relaxed">
                        {currentQuestion.feedback}
                      </p>
                    </div>
                  )}

                  {/* Strengths */}
                  {currentQuestion.strengths && currentQuestion.strengths.length > 0 && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                      <p className="text-sm font-semibold text-green-700 mb-3">Strengths:</p>
                      <ul className="space-y-2">
                        {currentQuestion.strengths.map((strength, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-green-600">
                            <span className="text-green-500">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {currentQuestion.improvements && currentQuestion.improvements.length > 0 && (
                    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
                      <p className="text-sm font-semibold text-orange-700 mb-3">
                        Areas for Improvement:
                      </p>
                      <ul className="space-y-2">
                        {currentQuestion.improvements.map((improvement, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-orange-600">
                            <span className="text-orange-500">→</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-end gap-3 pt-4">
                    {!isLastQuestion && (
                      <Button
                        onClick={handleNextQuestion}
                        variant="primary"
                        size="lg"
                      >
                        Next Question →
                      </Button>
                    )}

                    {isLastQuestion && (
                      <Button
                        onClick={handleCompleteInterview}
                        disabled={completing}
                        variant="success"
                        size="lg"
                        loading={completing}
                      >
                        Complete Interview →
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ==================================================
            RESULTS STEP
        ================================================== */}

        {step === "results" && interview && (
          <section className="mt-8">
            {/* Overall Score */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="text-center">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-4xl mb-4">
                  🎯
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Interview Complete!</h2>
                <p className="mt-2 text-slate-600">
                  {interview.targetRole} in {interview.targetIndustry}
                </p>

                <div className="mt-8 inline-block rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 p-8 text-white">
                  <p className="text-sm font-semibold uppercase tracking-wider">Overall Score</p>
                  <p className="mt-3 text-6xl font-bold">
                    {Math.round(interview.overallScore)}
                  </p>
                  <p className="mt-2 text-lg">out of 100</p>
                </div>
              </div>

              {/* Performance Breakdown */}
              {interview.performanceBreakdown && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {Object.entries(interview.performanceBreakdown).map(([key, value]) => (
                    <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className="text-3xl font-bold text-indigo-600">{value}/10</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Overall Feedback */}
              {interview.overallFeedback && (
                <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6">
                  <p className="text-sm font-semibold text-blue-700 mb-2">Overall Feedback:</p>
                  <p className="text-sm text-blue-600 leading-relaxed">
                    {interview.overallFeedback}
                  </p>
                </div>
              )}

              {/* Strengths */}
              {interview.strengths && interview.strengths.length > 0 && (
                <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">
                  <p className="text-sm font-semibold text-green-700 mb-3">Key Strengths:</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {interview.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-green-600">
                        <span className="text-green-500">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {interview.weaknesses && interview.weaknesses.length > 0 && (
                <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-6">
                  <p className="text-sm font-semibold text-orange-700 mb-3">
                    Areas for Improvement:
                  </p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {interview.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-orange-600">
                        <span className="text-orange-500">→</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Topics */}
              {interview.recommendedTopics && interview.recommendedTopics.length > 0 && (
                <div className="mt-6 rounded-2xl border border-purple-200 bg-purple-50 p-6">
                  <p className="text-sm font-semibold text-purple-700 mb-3">
                    Recommended Topics to Study:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {interview.recommendedTopics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-purple-100 px-3 py-2 text-sm font-medium text-purple-700"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvement Suggestions */}
              {interview.improvementSuggestions && interview.improvementSuggestions.length > 0 && (
                <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
                  <p className="text-sm font-semibold text-yellow-700 mb-3">
                    Improvement Suggestions:
                  </p>
                  <ul className="space-y-2">
                    {interview.improvementSuggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-yellow-700">
                        <span className="text-yellow-600">💡</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 flex justify-center gap-4">
                <Button onClick={handleRestart} variant="primary" size="lg">
                  Practice Again
                </Button>
                <Button onClick={() => navigate("/dashboard")} variant="outline" size="lg">
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}

export default AIInterviewer;
