const CareerRoadmap = require("../models/CareerRoadmap");
const GeneratedResume = require("../models/GeneratedResume");
const { generateCareerRoadmap } = require("../services/careerRoadmapService");

/**
 * Generate a new career roadmap
 * POST /api/career-roadmap
 */
const createCareerRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      targetRole,
      targetIndustry,
      currentLevel,
      resumeId,
      currentSkills,
    } = req.body;

    // Validate required fields
    if (!targetRole || !targetRole.trim()) {
      return res.status(400).json({
        success: false,
        message: "Target role is required",
      });
    }

    if (!targetIndustry || !targetIndustry.trim()) {
      return res.status(400).json({
        success: false,
        message: "Target industry is required",
      });
    }

    // Get resume data if resumeId provided
    let resumeData = {
      skills: currentSkills || [],
      education: [],
      experience: [],
    };

    if (resumeId) {
      const resume = await GeneratedResume.findOne({
        _id: resumeId,
        user: userId,
      });

      if (resume) {
        resumeData = {
          skills: resume.skills || currentSkills || [],
          education: resume.education || [],
          experience: resume.experience || [],
        };
      }
    }

    // Generate roadmap using AI
    const roadmapData = await generateCareerRoadmap({
      targetRole: targetRole.trim(),
      targetIndustry: targetIndustry.trim(),
      currentSkills: resumeData.skills,
      education: resumeData.education,
      experience: resumeData.experience,
      currentLevel: currentLevel || "entry",
    });

    // Create roadmap document
    const roadmap = new CareerRoadmap({
      user: userId,
      resume: resumeId || null,
      targetRole: targetRole.trim(),
      targetIndustry: targetIndustry.trim(),
      currentLevel: currentLevel || "entry",
      careerSummary: roadmapData.careerSummary || "",
      estimatedTimeline: roadmapData.estimatedTimeline || "",
      currentSkills: roadmapData.currentSkills || resumeData.skills,
      skillGaps: roadmapData.skillGaps || [],
      roadmapStages: roadmapData.roadmapStages || [],
      recommendedProjects: roadmapData.recommendedProjects || [],
      recommendedCertifications: roadmapData.recommendedCertifications || [],
      interviewPreparation: roadmapData.interviewPreparation || {
        topics: [],
        commonQuestions: [],
        technicalAreas: [],
        preparationTips: [],
      },
      timeline: roadmapData.timeline || [],
      status: "generated",
      progressPercentage: 0,
    });

    await roadmap.save();

    return res.status(201).json({
      success: true,
      message: "Career roadmap generated successfully",
      roadmap: roadmap,
    });
  } catch (error) {
    console.error("Create career roadmap error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate career roadmap",
    });
  }
};

/**
 * Get all roadmaps for the current user
 * GET /api/career-roadmap
 */
const getUserRoadmaps = async (req, res) => {
  try {
    const userId = req.user.id;

    const roadmaps = await CareerRoadmap.find({ user: userId })
      .populate("resume", "personalInfo targetRole targetIndustry")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: roadmaps.length,
      roadmaps: roadmaps,
    });
  } catch (error) {
    console.error("Get user roadmaps error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve roadmaps",
    });
  }
};

/**
 * Get a specific roadmap by ID
 * GET /api/career-roadmap/:id
 */
const getRoadmapById = async (req, res) => {
  try {
    const userId = req.user.id;
    const roadmapId = req.params.id;

    const roadmap = await CareerRoadmap.findOne({
      _id: roadmapId,
      user: userId,
    }).populate("resume", "personalInfo targetRole targetIndustry");

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Career roadmap not found",
      });
    }

    return res.status(200).json({
      success: true,
      roadmap: roadmap,
    });
  } catch (error) {
    console.error("Get roadmap by ID error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve roadmap",
    });
  }
};

/**
 * Update roadmap progress
 * PUT /api/career-roadmap/:id/progress
 */
const updateRoadmapProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const roadmapId = req.params.id;
    const { stageId, completed, progressPercentage } = req.body;

    const roadmap = await CareerRoadmap.findOne({
      _id: roadmapId,
      user: userId,
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Career roadmap not found",
      });
    }

    // Update stage completion if stageId provided
    if (stageId !== undefined) {
      const stage = roadmap.roadmapStages.id(stageId);

      if (stage) {
        stage.completed = completed === true;
      }
    }

    // Update overall progress
    if (progressPercentage !== undefined) {
      roadmap.progressPercentage = Math.min(100, Math.max(0, progressPercentage));
      
      if (roadmap.progressPercentage === 100) {
        roadmap.status = "completed";
      } else if (roadmap.progressPercentage > 0) {
        roadmap.status = "in_progress";
      }
    }

    await roadmap.save();

    return res.status(200).json({
      success: true,
      message: "Roadmap progress updated successfully",
      roadmap: roadmap,
    });
  } catch (error) {
    console.error("Update roadmap progress error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update roadmap progress",
    });
  }
};

/**
 * Delete a roadmap
 * DELETE /api/career-roadmap/:id
 */
const deleteRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;
    const roadmapId = req.params.id;

    const roadmap = await CareerRoadmap.findOneAndDelete({
      _id: roadmapId,
      user: userId,
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Career roadmap not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Career roadmap deleted successfully",
    });
  } catch (error) {
    console.error("Delete roadmap error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete roadmap",
    });
  }
};

/**
 * Get latest roadmap for user
 * GET /api/career-roadmap/latest
 */
const getLatestRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;

    const roadmap = await CareerRoadmap.findOne({ user: userId })
      .populate("resume", "personalInfo targetRole targetIndustry")
      .sort({ createdAt: -1 });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "No career roadmap found",
      });
    }

    return res.status(200).json({
      success: true,
      roadmap: roadmap,
    });
  } catch (error) {
    console.error("Get latest roadmap error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve latest roadmap",
    });
  }
};

module.exports = {
  createCareerRoadmap,
  getUserRoadmaps,
  getRoadmapById,
  updateRoadmapProgress,
  deleteRoadmap,
  getLatestRoadmap,
};
