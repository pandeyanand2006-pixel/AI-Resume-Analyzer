import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "./ResumeComparison.css";

function ResumeComparison() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [resumes, setResumes] = useState([]);
  const [selectedResume1, setSelectedResume1] = useState("");
  const [selectedResume2, setSelectedResume2] = useState("");
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoadingResumes(true);
      const response = await api.get("/resume-comparison/list");
      
      if (response.data?.success) {
        setResumes(response.data.resumes || []);
      }
    } catch (error) {
      console.error("Load resumes error:", error);
      setError("Failed to load resumes");
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleCompare = async () => {
    if (!selectedResume1 || !selectedResume2) {
      setError("Please select two resumes to compare");
      return;
    }

    if (selectedResume1 === selectedResume2) {
      setError("Please select two different resumes");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await api.post("/resume-comparison/compare", {
        resumeId1: selectedResume1,
        resumeId2: selectedResume2
      });

      if (response.data?.success) {
        setComparison(response.data.comparison);
      }
    } catch (error) {
      console.error("Comparison error:", error);
      setError(error.response?.data?.message || "Failed to compare resumes");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getResumeName = (id) => {
    const resume = resumes.find(r => r.id === id);
    return resume?.name || "Unknown Resume";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-2xl font-bold tracking-tight text-slate-900 hover:text-blue-600 transition"
          >
            Resume<span className="text-blue-600">AI</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden text-sm font-medium text-slate-600 sm:block">
              {user?.name || "User"}
            </span>

            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Dashboard
            </button>

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

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="rounded-3xl bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-6 text-white shadow-lg sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-100">
              Resume Comparison
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Compare Resume Versions
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-purple-50 sm:text-base font-medium">
              Compare two versions of your resume side-by-side. See what changed, what improved, and track your progress over time.
            </p>
          </div>
        </section>

        {/* Selection */}
        <section className="mt-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Select Resumes to Compare</h2>

            {loadingResumes ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
              </div>
            ) : resumes.length < 2 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 mb-4">
                  You need at least 2 resumes to compare. Please build more resumes first.
                </p>
                <button
                  onClick={() => navigate("/resume-builder")}
                  className="rounded-lg bg-purple-600 px-6 py-3 text-white font-semibold hover:bg-purple-700 transition"
                >
                  Build Resume
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Resume 1 */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Resume 1 (Original/Old Version)
                    </label>
                    <select
                      value={selectedResume1}
                      onChange={(e) => setSelectedResume1(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    >
                      <option value="">Select first resume...</option>
                      {resumes.map((resume) => (
                        <option key={resume.id} value={resume.id}>
                          {resume.name} - {resume.targetRole} ({new Date(resume.updatedAt).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Resume 2 */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Resume 2 (Updated/New Version)
                    </label>
                    <select
                      value={selectedResume2}
                      onChange={(e) => setSelectedResume2(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    >
                      <option value="">Select second resume...</option>
                      {resumes.map((resume) => (
                        <option key={resume.id} value={resume.id}>
                          {resume.name} - {resume.targetRole} ({new Date(resume.updatedAt).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
                    {error}
                  </div>
                )}

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleCompare}
                    disabled={loading || !selectedResume1 || !selectedResume2}
                    className="rounded-lg bg-purple-600 px-8 py-3 text-white font-semibold hover:bg-purple-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {loading ? "Comparing..." : "Compare Resumes"}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Comparison Results */}
        {comparison && (
          <>
            {/* Summary */}
            <section className="mt-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Comparison Summary</h2>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    icon="📊"
                    title="Total Changes"
                    value={comparison.summary.totalChanges}
                    color="blue"
                  />
                  <StatCard
                    icon="➕"
                    title="Added Items"
                    value={comparison.summary.addedItems}
                    color="green"
                  />
                  <StatCard
                    icon="➖"
                    title="Removed Items"
                    value={comparison.summary.removedItems}
                    color="red"
                  />
                  <StatCard
                    icon="✏️"
                    title="Modified Items"
                    value={comparison.summary.modifiedItems}
                    color="yellow"
                  />
                </div>

                {comparison.summary.sectionsChanged.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-slate-900 mb-3">Sections Changed:</h3>
                    <div className="flex flex-wrap gap-2">
                      {comparison.summary.sectionsChanged.map((section, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700"
                        >
                          {formatSectionName(section)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Detailed Comparison */}
            <section className="mt-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Detailed Comparison</h2>

                <div className="space-y-6">
                  {/* Target Role */}
                  {comparison.differences.targetRole?.changed && (
                    <DiffSection
                      title="Target Role"
                      resume1={comparison.differences.targetRole.resume1}
                      resume2={comparison.differences.targetRole.resume2}
                    />
                  )}

                  {/* Target Industry */}
                  {comparison.differences.targetIndustry?.changed && (
                    <DiffSection
                      title="Target Industry"
                      resume1={comparison.differences.targetIndustry.resume1}
                      resume2={comparison.differences.targetIndustry.resume2}
                    />
                  )}

                  {/* Professional Summary */}
                  {comparison.differences.professionalSummary?.changed && (
                    <DiffSection
                      title="Professional Summary"
                      resume1={comparison.differences.professionalSummary.resume1}
                      resume2={comparison.differences.professionalSummary.resume2}
                      lengthDiff={comparison.differences.professionalSummary.lengthDiff}
                    />
                  )}

                  {/* Skills */}
                  {comparison.differences.skills && (
                    <ArrayDiffSection
                      title="Skills"
                      diff={comparison.differences.skills}
                      renderItem={(item) => item.name || item}
                    />
                  )}

                  {/* Work Experience */}
                  {comparison.differences.workExperience && (
                    <ArrayDiffSection
                      title="Work Experience"
                      diff={comparison.differences.workExperience}
                      renderItem={(item) => `${item.jobTitle} at ${item.company}`}
                    />
                  )}

                  {/* Education */}
                  {comparison.differences.education && (
                    <ArrayDiffSection
                      title="Education"
                      diff={comparison.differences.education}
                      renderItem={(item) => `${item.degree} - ${item.institution}`}
                    />
                  )}

                  {/* Projects */}
                  {comparison.differences.projects && (
                    <ArrayDiffSection
                      title="Projects"
                      diff={comparison.differences.projects}
                      renderItem={(item) => item.title || item.name}
                    />
                  )}

                  {/* Certifications */}
                  {comparison.differences.certifications && (
                    <ArrayDiffSection
                      title="Certifications"
                      diff={comparison.differences.certifications}
                      renderItem={(item) => item.name || item}
                    />
                  )}

                  {/* Achievements */}
                  {comparison.differences.achievements && (
                    <ArrayDiffSection
                      title="Achievements"
                      diff={comparison.differences.achievements}
                      renderItem={(item) => item}
                    />
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

// Helper Components
function StatCard({ icon, title, value, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    yellow: "bg-yellow-50 text-yellow-700"
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm font-medium text-slate-600 mb-1">{title}</div>
      <div className={`text-3xl font-bold ${colorClasses[color]?.split(" ")[1] || "text-blue-600"}`}>
        {value}
      </div>
    </div>
  );
}

function DiffSection({ title, resume1, resume2, lengthDiff }) {
  return (
    <div className="rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Resume 1 (Old)</div>
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-slate-700">
            {resume1 || <span className="text-slate-400 italic">Not provided</span>}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Resume 2 (New)</div>
          <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-slate-700">
            {resume2 || <span className="text-slate-400 italic">Not provided</span>}
          </div>
        </div>
      </div>
      {lengthDiff !== undefined && lengthDiff !== 0 && (
        <div className="mt-3 text-sm text-slate-600">
          Length {lengthDiff > 0 ? "increased" : "decreased"} by {Math.abs(lengthDiff)} characters
        </div>
      )}
    </div>
  );
}

function ArrayDiffSection({ title, diff, renderItem }) {
  const hasChanges = (diff.added?.length > 0) || (diff.removed?.length > 0) || (diff.modified?.length > 0);

  if (!hasChanges) return null;

  return (
    <div className="rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
      
      <div className="space-y-4">
        {/* Added Items */}
        {diff.added?.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-green-600 uppercase mb-2">
              ➕ Added ({diff.added.length})
            </div>
            <div className="space-y-2">
              {diff.added.map((item, idx) => (
                <div key={idx} className="rounded-lg bg-green-50 border border-green-200 p-3 text-slate-700">
                  {renderItem(item)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Removed Items */}
        {diff.removed?.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-red-600 uppercase mb-2">
              ➖ Removed ({diff.removed.length})
            </div>
            <div className="space-y-2">
              {diff.removed.map((item, idx) => (
                <div key={idx} className="rounded-lg bg-red-50 border border-red-200 p-3 text-slate-700">
                  {renderItem(item)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modified Items */}
        {diff.modified?.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-yellow-600 uppercase mb-2">
              ✏️ Modified ({diff.modified.length})
            </div>
            <div className="space-y-3">
              {diff.modified.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-yellow-200 p-3">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Old:</div>
                      <div className="text-slate-700">{renderItem(item.old)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">New:</div>
                      <div className="text-slate-700">{renderItem(item.new)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Count Summary */}
        <div className="text-sm text-slate-600 pt-2 border-t border-slate-200">
          Total: {diff.resume1Count} → {diff.resume2Count} 
          {diff.countDiff !== 0 && (
            <span className={diff.countDiff > 0 ? "text-green-600" : "text-red-600"}>
              {" "}({diff.countDiff > 0 ? "+" : ""}{diff.countDiff})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatSectionName(section) {
  return section
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

export default ResumeComparison;
