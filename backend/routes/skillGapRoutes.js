const express = require("express");
const { check, validationResult } = require("express-validator");

const Resume = require("../models/Resume");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// POST /api/skill-gap/:resumeId
// ==========================================
router.post(
  "/:resumeId",
  [
    check("resumeId").isMongoId().withMessage("Invalid resumeId"),
    check("targetRole").trim().notEmpty().withMessage("targetRole is required"),
  ],
  authMiddleware,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
  try {
    console.log(
      "Skill gap analysis requested:",
      req.params.resumeId
    );

    const { targetRole } = req.body;

    // ==========================================
    // Validate target role
    // ==========================================

    if (!targetRole || !targetRole.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a target job role",
      });
    }

    // ==========================================
    // Find resume belonging to logged-in user
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
          "Please analyze your resume before running skill gap analysis",
      });
    }

    // ==========================================
    // Role skill database
    // ==========================================

    const roleSkills = {
      "full stack developer": [
        "javascript",
        "typescript",
        "react",
        "node.js",
        "express",
        "mongodb",
        "sql",
        "html",
        "css",
        "git",
        "docker",
        "aws",
        "rest api",
      ],

      "frontend developer": [
        "javascript",
        "typescript",
        "react",
        "html",
        "css",
        "tailwind",
        "git",
        "rest api",
      ],

      "backend developer": [
        "javascript",
        "typescript",
        "node.js",
        "express",
        "mongodb",
        "sql",
        "rest api",
        "git",
        "docker",
        "aws",
      ],

      "python developer": [
        "python",
        "sql",
        "git",
        "rest api",
        "docker",
        "aws",
      ],

      "data scientist": [
        "python",
        "sql",
        "machine learning",
        "data analysis",
        "statistics",
        "pandas",
        "numpy",
      ],

      "machine learning engineer": [
        "python",
        "machine learning",
        "data analysis",
        "sql",
        "numpy",
        "pandas",
        "tensorflow",
        "pytorch",
        "git",
        "docker",
      ],
      // Non-tech roles (initial coverage)
      "bank manager": [
        "banking",
        "customer service",
        "credit analysis",
        "risk management",
        "compliance",
        "branch operations",
        "cash handling",
        "loans",
        "relationship management",
      ],

      "accountant": [
        "accounting",
        "gst",
        "tax",
        "financial reporting",
        "reconciliation",
        "accounts payable",
        "accounts receivable",
        "excel",
      ],

      "forensic pathologist": [
        "forensic pathology",
        "autopsy",
        "medical research",
        "histology",
        "toxicology",
        "case reporting",
      ],

      "lab technician": [
        "laboratory",
        "sample preparation",
        "microscopy",
        "sterile technique",
        "equipment handling",
      ],

      "microbiologist": [
        "microbiology",
        "culture",
        "microscopy",
        "molecular biology",
        "assay",
      ],

      "research scientist": [
        "research",
        "experimental design",
        "data analysis",
        "lab techniques",
        "writing",
      ],

      "teacher": [
        "lesson planning",
        "classroom management",
        "curriculum",
        "assessment",
        "communication",
      ],

      "hr manager": [
        "recruitment",
        "onboarding",
        "employee relations",
        "performance management",
        "compliance",
      ],

      "marketing manager": [
        "marketing",
        "campaign",
        "content",
        "seo",
        "analytics",
        "branding",
      ],

      "sales manager": [
        "sales",
        "relationship management",
        "pipeline",
        "negotiation",
        "forecasting",
      ],
    };

    // ==========================================
    // Normalize role
    // ==========================================

    const normalizedRole = targetRole
      .trim()
      .toLowerCase();

    let requiredSkills = roleSkills[normalizedRole];

    // If role not in map, attempt to generate a simple keyword set from the role words
    if (!requiredSkills) {
      const fallbackKeywords = normalizedRole
        .split(/[^a-z0-9]+/)
        .filter(Boolean)
        .slice(0, 6);

      requiredSkills = fallbackKeywords.length
        ? fallbackKeywords
        : [normalizedRole];
    }

    // ==========================================
    // Normalize user's skills
    // ==========================================

    const userSkills = resume.skills.map((skill) => skill.toLowerCase());

    // Use substring matching to allow fuzzy matches like 'aws (lambda)' -> 'aws'
    const matchedSkills = requiredSkills.filter((req) => {
      const r = req.toLowerCase();
      return userSkills.some((us) => us.includes(r) || r.includes(us));
    });

    const missingSkills = requiredSkills.filter((req) => {
      const r = req.toLowerCase();
      return !userSkills.some((us) => us.includes(r) || r.includes(us));
    });

    // ==========================================
    // Calculate skill match percentage
    // ==========================================

    const skillMatchPercentage = Math.round(
      (matchedSkills.length / requiredSkills.length) *
        100
    );

    // ==========================================
    // Recommendations
    // ==========================================

    const recommendations = [];

    if (missingSkills.length > 0) {
      recommendations.push(
        `Focus on learning: ${missingSkills
          .slice(0, 3)
          .join(", ")}`
      );
    }

    if (missingSkills.includes("docker")) {
      recommendations.push(
        "Learn Docker and basic containerization"
      );
    }

    if (missingSkills.includes("aws")) {
      recommendations.push(
        "Learn AWS fundamentals and cloud deployment"
      );
    }

    if (missingSkills.includes("typescript")) {
      recommendations.push(
        "Learn TypeScript to improve modern JavaScript development skills"
      );
    }

    if (matchedSkills.length >= requiredSkills.length * 0.7) {
      recommendations.push(
        "Your current skills are a strong match for this role"
      );
    } else {
      recommendations.push(
        "Continue building projects using the missing skills"
      );
    }

    // ==========================================
    // Response
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Skill gap analysis completed successfully",

      skillGap: {
        resumeId: resume._id,

        targetRole: targetRole.trim(),

        requiredSkills,

        userSkills,

        matchedSkills,

        missingSkills,

        requiredSkillsCount: requiredSkills.length,

        matchedSkillsCount: matchedSkills.length,

        missingSkillsCount: missingSkills.length,

        skillMatchPercentage,

        recommendations,
      },
    });
  } catch (error) {
    console.error(
      "Skill gap analysis error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while analyzing skill gap",
    });
  }
});

module.exports = router;