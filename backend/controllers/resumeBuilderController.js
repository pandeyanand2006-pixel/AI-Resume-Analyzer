const mongoose = require("mongoose");
const GeneratedResume = require("../models/GeneratedResume");

const {
  generateResumeContent,
} = require("../services/groqService");

// ======================================================
// CREATE GENERATED RESUME
// POST /api/resumes/builder
// ======================================================

const createGeneratedResume = async (req, res) => {
  try {
    console.log("CREATE RESUME BODY:");
    console.log(JSON.stringify(req.body, null, 2));

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const personalInfo = req.body.personalInfo || {};

    if (!personalInfo.fullName || !personalInfo.email) {
      return res.status(400).json({
        success: false,
        message: "Full name and email are required",
      });
    }

    const resume = await GeneratedResume.create({
      user: req.user.id,

      personalInfo: {
        fullName: personalInfo.fullName || "",
        email: personalInfo.email || "",
        phone: personalInfo.phone || "",
        location: personalInfo.location || "",
        linkedin: personalInfo.linkedin || "",
        github: personalInfo.github || "",
      },

      summary: req.body.summary || "",

      skills: Array.isArray(req.body.skills)
        ? req.body.skills.filter(Boolean)
        : [],

      experience: Array.isArray(req.body.experience)
        ? req.body.experience
        : [],

      education: Array.isArray(req.body.education)
        ? req.body.education
        : [],

      projects: Array.isArray(req.body.projects)
        ? req.body.projects
        : [],

      certifications: Array.isArray(req.body.certifications)
        ? req.body.certifications
        : [],

      achievements: Array.isArray(req.body.achievements)
        ? req.body.achievements
        : [],

      targetRole: req.body.targetRole || "",

      targetIndustry: req.body.targetIndustry || "",
    });

    console.log("RESUME CREATED:", resume._id);

    return res.status(201).json({
      success: true,
      message: "Resume created successfully",
      resume,
    });
  } catch (error) {
    console.error("================================");
    console.error("CREATE RESUME ERROR");
    console.error(error);
    console.error("================================");

    return res.status(500).json({
      success: false,
      message: "Failed to create resume",
      error: error.message,
    });
  }
};


// ======================================================
// GET ALL USER GENERATED RESUMES
// GET /api/resumes/builder
// ======================================================

const getGeneratedResumes = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const resumes = await GeneratedResume.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: resumes.length,
      resumes,
    });
  } catch (error) {
    console.error("Get generated resumes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get generated resumes",
      error: error.message,
    });
  }
};


// ======================================================
// GET ONE GENERATED RESUME
// GET /api/resumes/builder/:id
// ======================================================

const getGeneratedResumeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume ID",
      });
    }

    const resume = await GeneratedResume.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    return res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error("Get generated resume by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get resume",
      error: error.message,
    });
  }
};


// ======================================================
// UPDATE GENERATED RESUME
// PUT /api/resumes/builder/:id
// ======================================================

const updateGeneratedResume = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume ID",
      });
    }

    const resume = await GeneratedResume.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    const allowedFields = [
      "personalInfo",
      "summary",
      "skills",
      "experience",
      "education",
      "projects",
      "certifications",
      "achievements",
      "targetRole",
      "targetIndustry",
      "generatedSummary",
      "aiSuggestions",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        resume[field] = req.body[field];
      }
    });

    await resume.save();

    return res.status(200).json({
      success: true,
      message: "Resume updated successfully",
      resume,
    });
  } catch (error) {
    console.error("Update generated resume error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update resume",
      error: error.message,
    });
  }
};


// ======================================================
// DELETE GENERATED RESUME
// DELETE /api/resumes/builder/:id
// ======================================================

const deleteGeneratedResume = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume ID",
      });
    }

    const resume = await GeneratedResume.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Delete generated resume error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete resume",
      error: error.message,
    });
  }
};


// ======================================================
// GENERATE AI RESUME
// POST /api/resumes/builder/:id/ai
// ======================================================

const generateAIResume = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume ID",
      });
    }

    const resume = await GeneratedResume.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    const resumeData = {
      personalInfo: resume.personalInfo,
      summary: resume.summary,
      skills: resume.skills,
      experience: resume.experience,
      education: resume.education,
      projects: resume.projects,
      certifications: resume.certifications,
      achievements: resume.achievements,
      targetRole: resume.targetRole,
      targetIndustry: resume.targetIndustry,
    };

    const aiResult = await generateResumeContent(resumeData);

    resume.generatedSummary =
      aiResult?.professionalSummary || resume.summary || "";

    resume.aiSuggestions = [
      ...(Array.isArray(aiResult?.atsRecommendations)
        ? aiResult.atsRecommendations
        : []),

      ...(Array.isArray(aiResult?.recommendedKeywords)
        ? aiResult.recommendedKeywords
        : []),
    ];

    // ==================================================
    // UPDATE PROJECT DESCRIPTIONS FROM AI
    // ==================================================

    if (
      Array.isArray(aiResult?.projects) &&
      Array.isArray(resume.projects)
    ) {
      resume.projects = resume.projects.map((project) => {
        const aiProject = aiResult.projects.find(
          (item) =>
            item.name?.toLowerCase() ===
            project.name?.toLowerCase()
        );

        if (aiProject) {
          project.description =
            aiProject.description || project.description;
        }

        return project;
      });
    }

    await resume.save();

    return res.status(200).json({
      success: true,
      message: "AI resume generated successfully",
      resume,
      ai: aiResult,
    });
  } catch (error) {
    console.error("Generate AI resume error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate AI resume",
      error: error.message,
    });
  }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createGeneratedResume,
  getGeneratedResumes,
  getGeneratedResumeById,
  updateGeneratedResume,
  deleteGeneratedResume,
  generateAIResume,
};