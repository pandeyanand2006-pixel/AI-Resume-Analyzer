import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/layout/Header";

function JobMatch() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const resumeId =
    location.state?.resumeId ||
    sessionStorage.getItem("resumeId");

  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMatch = async () => {
    if (!resumeId) {
      setError(
        "No resume found. Please upload and analyze your resume from the Dashboard first."
      );
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please paste a job description.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await api.post(
        `/job-matching/${resumeId}`,
        {
          jobDescription: jobDescription.trim(),
        }
      );

      if (response.data.success) {
        setResult(response.data.jobMatch || response.data.jobMatching);
      } else {
        setError(
          response.data.message ||
            "Job matching failed."
        );
      }
    } catch (err) {
      console.error("Job match error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to match your resume with this job description."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <Header />

      {/* MAIN */}
      <main className="mx-auto max-w-6xl px-6 py-10">

        {/* TITLE */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Career Tool
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            Job Match
          </h1>

          <p className="mt-3 max-w-3xl text-gray-600">
            Compare your resume against any job description and
            discover your skills match, missing skills, keywords,
            and recommendations.
          </p>
        </div>

        {/* JOB DESCRIPTION INPUT */}
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-gray-900">
            Paste Job Description
          </h2>

          <p className="mt-2 text-gray-600">
            Paste the complete job description below.
          </p>

          <textarea
            value={jobDescription}
            onChange={(event) =>
              setJobDescription(event.target.value)
            }
            placeholder={`Example:

We are looking for a Full Stack Developer with experience in JavaScript, React, Node.js, Express, MongoDB and REST APIs.

Responsibilities:
- Build responsive web applications
- Develop REST APIs
- Work with MongoDB
- Collaborate with development teams

Requirements:
- JavaScript
- React
- Node.js
- Express
- MongoDB
- Git
- REST API`}
            rows={14}
            className="mt-6 w-full rounded-xl border border-gray-300 p-5 text-gray-800 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
          />

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleMatch}
            disabled={loading}
            className="mt-5 rounded-lg bg-black px-7 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Analyzing Match..."
              : "Match My Resume"}
          </button>

        </section>

        {/* RESULTS */}
        {result && (
          <section className="mt-8 space-y-6">

            {/* OVERALL SCORE */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Overall Match
                  </p>

                  <h2 className="mt-1 text-4xl font-bold text-gray-900">
                    {result.overallMatchPercentage}%
                  </h2>

                  <p className="mt-2 font-semibold text-gray-700">
                    {result.matchLevel}
                  </p>
                </div>

                <div className="w-full max-w-md">
                  <div className="h-4 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-black transition-all"
                      style={{
                        width: `${result.overallMatchPercentage}%`,
                      }}
                    />
                  </div>
                </div>

              </div>

              {/* SCORE BREAKDOWN */}
              <div className="mt-8 grid gap-4 md:grid-cols-3">

                <ScoreCard
                  title="Skill Match"
                  value={result.skillMatchPercentage}
                />

                <ScoreCard
                  title="Keyword Match"
                  value={result.keywordMatchPercentage}
                />

                <ScoreCard
                  title="Content Match"
                  value={result.contentMatchPercentage}
                />

              </div>

            </div>

            {/* SKILLS */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Skill Comparison
              </h2>

              {/* MATCHED */}
              <div className="mt-7">

                <h3 className="text-lg font-semibold text-gray-900">
                  Matched Skills
                </h3>

                <div className="mt-4 flex flex-wrap gap-3">

                  {result.matchedSkills?.length > 0 ? (
                    result.matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800"
                      >
                        ✓ {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">
                      No matching skills detected.
                    </p>
                  )}

                </div>
              </div>

              {/* MISSING */}
              <div className="mt-8">

                <h3 className="text-lg font-semibold text-gray-900">
                  Skills to Improve
                </h3>

                <div className="mt-4 flex flex-wrap gap-3">

                  {result.missingSkills?.length > 0 ? (
                    result.missingSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-700"
                      >
                        + {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-green-600">
                      Excellent! No major missing skills detected.
                    </p>
                  )}

                </div>
              </div>

            </div>

            {/* KEYWORDS */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Keyword Comparison
              </h2>

              <div className="mt-6">

                <h3 className="font-semibold text-gray-900">
                  Matched Keywords
                </h3>

                <div className="mt-3 flex flex-wrap gap-2">

                  {result.matchedKeywords?.length > 0 ? (
                    result.matchedKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-lg bg-green-100 px-3 py-2 text-sm text-green-800"
                      >
                        ✓ {keyword}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">
                      No matching keywords detected.
                    </p>
                  )}

                </div>

              </div>

              <div className="mt-7">

                <h3 className="font-semibold text-gray-900">
                  Missing Keywords
                </h3>

                <div className="mt-3 flex flex-wrap gap-2">

                  {result.missingKeywords?.length > 0 ? (
                    result.missingKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                      >
                        + {keyword}
                      </span>
                    ))
                  ) : (
                    <p className="text-green-600">
                      No major keyword gaps detected.
                    </p>
                  )}

                </div>

              </div>

            </div>

            {/* RECOMMENDATIONS */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Recommendations
              </h2>

              <div className="mt-5 space-y-3">

                {result.recommendations?.length > 0 ? (
                  result.recommendations.map(
                    (recommendation) => (
                      <div
                        key={recommendation}
                        className="flex items-start rounded-lg bg-gray-50 p-4"
                      >
                        <span className="mr-3 text-lg">
                          💡
                        </span>

                        <span className="text-gray-700">
                          {recommendation}
                        </span>
                      </div>
                    )
                  )
                ) : (
                  <p className="text-green-600">
                    Your resume is well aligned with this job.
                  </p>
                )}

              </div>

            </div>

            {/* RUN AGAIN */}
            <div className="pb-10 text-center">

              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setError("");
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Match Another Job
              </button>

            </div>

          </section>
        )}

      </main>
    </div>
  );
}

function ScoreCard({ title, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}%
      </p>
    </div>
  );
}

export default JobMatch;