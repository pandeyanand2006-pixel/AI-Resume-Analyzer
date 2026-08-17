const express = require("express");

const Resume = require("../models/Resume");
const Job = require("../models/Job");
const authMiddleware = require("../middleware/authMiddleware");

const { check, validationResult } = require("express-validator");

const router = express.Router();

// ==========================================
// POST /api/job-matching/:resumeId
// ==========================================

router.post(
  "/:resumeId",
  // validate resumeId and optional jobDescription
  [
    check("resumeId").isMongoId().withMessage("Invalid resumeId"),
    check("jobDescription")
      .optional()
      .isString()
      .isLength({ max: 20000 })
      .withMessage("jobDescription too long"),
  ],
  authMiddleware,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
  try {
    console.log(
      "Job matching requested:",
      req.params.resumeId
    );
    
    // If a job description is provided in the request body,
    // compute a single job-match analysis comparing the
    // user's resume against that job description and return
    // a `jobMatch` object that the frontend expects.
    const { jobDescription } = req.body || {};

    if (jobDescription && jobDescription.trim().length > 0) {
      const resume = await Resume.findOne({
        _id: req.params.resumeId,
        user: req.user.id,
      });

      if (!resume) {
        return res.status(404).json({
          success: false,
          message: "Resume not found",
        });
      }

      if (!resume.skills || resume.skills.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Please analyze your resume before running job matching",
        });
      }

      const resumeSkills = resume.skills.map((s) => s.trim().toLowerCase());
      const resumeKeywords = (resume.keywords || []).map((k) => k.trim().toLowerCase());
      const resumeText = (resume.extractedText || "").toLowerCase();

      const jd = jobDescription.toLowerCase();

      // Basic skills library used to detect skills from the job description.
      const skillsLibrary = [
        "javascript",
        "typescript",
        "react",
        "node",
        "node.js",
        "express",
        "mongodb",
        "sql",
        "postgresql",
        "mysql",
        "python",
        "pandas",
        "numpy",
        "tensorflow",
        "pytorch",
        "docker",
        "kubernetes",
        "aws",
        "azure",
        "gcp",
        "rest",
        "rest api",
        "graphql",
        "html",
        "css",
        "git",
        "linux",
        "spark",
        "hadoop",
        "docker",
      ];

      // Detect required skills mentioned in the job description.
      const requiredSkills = Array.from(
        new Set(
          skillsLibrary.filter((skill) => jd.includes(skill))
        )
      );

      // Matched / missing skills
      const matchedSkills = requiredSkills.filter((skill) =>
        resumeSkills.includes(skill)
      );

      const missingSkills = requiredSkills.filter(
        (skill) => !resumeSkills.includes(skill)
      );

      const skillMatchPercentage = Math.round(
        (matchedSkills.length / Math.max(1, requiredSkills.length)) * 100
      );

      // Extract simple job keywords (words longer than 2 chars, remove stopwords)
      const stopwords = new Set([
        "the",
        "and",
        "for",
        "with",
        "that",
        "this",
        "are",
        "you",
        "your",
        "from",
        "have",
        "will",
        "able",
        "our",
        "we",
        "be",
        "to",
        "of",
        "in",
        "on",
        "a",
        "an",
        "or",
        "as",
        "by",
      ]);

      const tokens = (jd.match(/[a-z0-9+#.\-]+/gi) || []).map((t) => t.trim());
      const keywordCounts = {};

      tokens.forEach((t) => {
        const lower = t.toLowerCase();
        if (lower.length <= 2) return;
        if (stopwords.has(lower)) return;
        keywordCounts[lower] = (keywordCounts[lower] || 0) + 1;
      });

      const jobKeywords = Object.keys(keywordCounts)
        .sort((a, b) => keywordCounts[b] - keywordCounts[a])
        .slice(0, 40);

      const matchedKeywords = jobKeywords.filter((k) =>
        resumeKeywords.includes(k) || resumeText.includes(k)
      );

      const missingKeywords = jobKeywords.filter((k) => !matchedKeywords.includes(k));

      const keywordMatchPercentage = Math.round(
        (matchedKeywords.length / Math.max(1, jobKeywords.length)) * 100
      );

      const contentMatchPercentage = Math.round(
        (skillMatchPercentage + keywordMatchPercentage) / 2
      );

      const overallMatchPercentage = Math.round(
        (skillMatchPercentage + keywordMatchPercentage + contentMatchPercentage) / 3
      );

      const matchLevel =
        overallMatchPercentage >= 80
          ? "Excellent"
          : overallMatchPercentage >= 60
          ? "Good"
          : "Needs Improvement";

      const recommendations = [];

      if (missingSkills.length > 0) {
        recommendations.push(
          `Build familiarity with: ${missingSkills.slice(0, 5).join(", ")}`
        );
      }

      if (missingKeywords.length > 0 && recommendations.length === 0) {
        recommendations.push(
          `Consider emphasizing: ${missingKeywords.slice(0, 5).join(", ")}`
        );
      }

      if (recommendations.length === 0) {
        recommendations.push("Your resume is well aligned with this job description.");
      }

      return res.status(200).json({
        success: true,
        message: "Job matching against job description completed successfully",
        jobMatch: {
          resumeId: resume._id,
          overallMatchPercentage,
          matchLevel,
          skillMatchPercentage,
          keywordMatchPercentage,
          contentMatchPercentage,
          matchedSkills,
          missingSkills,
          matchedKeywords,
          missingKeywords,
          jobKeywords,
          recommendations,
        },
      });
    }
    // ==========================================
    // Find user's resume
    // ==========================================

    const resume = await Resume.findOne({
      _id: req.params.resumeId,
      user: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    // ==========================================
    // Check resume skills
    // ==========================================

    if (!resume.skills || resume.skills.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Please analyze your resume before running job matching",
      });
    }

    // ==========================================
    // Get all jobs
    // ==========================================

    const jobs = await Job.find({}).lean();

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No jobs available for matching",
      });
    }

    // ==========================================
    // Normalize user's skills
    // ==========================================

    const userSkills = resume.skills.map((skill) =>
      skill.trim().toLowerCase()
    );

    // ==========================================
    // Match jobs
    // ==========================================

    const matchedJobs = jobs.map((job) => {
      const requiredSkills = (job.requiredSkills || []).map(
        (skill) => skill.trim().toLowerCase()
      );

      const matchedSkills = requiredSkills.filter((skill) =>
        userSkills.includes(skill)
      );

      const missingSkills = requiredSkills.filter(
        (skill) => !userSkills.includes(skill)
      );

      const matchPercentage =
        requiredSkills.length > 0
          ? Math.round(
              (matchedSkills.length / requiredSkills.length) *
                100
            )
          : 0;

      return {
        id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        experience: job.experience,
        salary: job.salary,
        jobType: job.jobType,

        requiredSkills: job.requiredSkills,

        matchedSkills,
        missingSkills,

        matchPercentage,
      };
    });

    // ==========================================
    // Highest match first
    // ==========================================

    matchedJobs.sort(
      (a, b) =>
        b.matchPercentage - a.matchPercentage
    );

    // ==========================================
    // Response
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Job matching completed successfully",

      jobMatching: {
        resumeId: resume._id,
        totalJobs: matchedJobs.length,
        matchedJobs,
      },
    });
  } catch (error) {
    console.error("Job matching error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while matching jobs",
    });
  }
});

module.exports = router;