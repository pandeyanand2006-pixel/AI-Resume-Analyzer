const Resume = require("../models/Resume");
const { searchRealTimeJobs } = require("../services/jobSearchService");

// POST /api/jobs/search
// Body: { resumeId?, desiredRole?, location?, remoteFilter?, skills? }
// If resumeId provided, uses that resume's skills; otherwise uses provided skills or logged-in user's latest resume
const realtimeSearch = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { resumeId, desiredRole = "", location = "", remoteFilter = "all", skills: bodySkills } = req.body || {};

    let resumeSkills = [];
    let resume = null;

    if (resumeId) {
      resume = await Resume.findOne({ _id: resumeId, user: userId });
      if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });
      resumeSkills = resume.skills || [];
    } else if (Array.isArray(bodySkills) && bodySkills.length) {
      resumeSkills = bodySkills;
    } else {
      // fallback to latest resume
      resume = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });
      if (resume && resume.skills) resumeSkills = resume.skills;
    }

    // If still no skills and no desiredRole, require at least one
    if ((!resumeSkills || resumeSkills.length === 0) && !desiredRole) {
      return res.status(400).json({ success: false, message: "Please provide a resume or desiredRole/skills to search jobs" });
    }

    const jobs = await searchRealTimeJobs({
      resumeSkills,
      desiredRole: desiredRole.trim(),
      location: location.trim(),
      remoteFilter,
      limit: 30,
    });

    return res.status(200).json({
      success: true,
      message: "Real-time jobs fetched",
      count: jobs.length,
      resumeSkills,
      desiredRole,
      jobs,
    });
  } catch (e) {
    console.error("Realtime job search error:", e);
    return res.status(500).json({ success: false, message: "Failed to fetch real-time jobs" });
  }
};

// GET /api/jobs/search?desiredRole=&location=&remoteFilter=&resumeId=
const realtimeSearchGet = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { resumeId, desiredRole = "", location = "", remoteFilter = "all" } = req.query;

    let resumeSkills = [];
    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, user: userId });
      if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });
      resumeSkills = resume.skills || [];
    } else {
      const latest = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });
      if (latest) resumeSkills = latest.skills || [];
    }

    const jobs = await searchRealTimeJobs({
      resumeSkills,
      desiredRole: String(desiredRole || ""),
      location: String(location || ""),
      remoteFilter: String(remoteFilter || "all"),
      limit: 30,
    });

    return res.status(200).json({ success: true, count: jobs.length, jobs, resumeSkills, desiredRole });
  } catch (e) {
    console.error("Realtime GET search error:", e);
    return res.status(500).json({ success: false, message: "Failed to fetch jobs" });
  }
};

module.exports = { realtimeSearch, realtimeSearchGet };
