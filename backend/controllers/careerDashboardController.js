const GeneratedResume = require("../models/GeneratedResume");
const CareerRoadmap = require("../models/CareerRoadmap");
const InterviewSession = require("../models/InterviewSession");
const Notification = require("../models/Notification");
const Resume = require("../models/Resume");

/**
 * Get comprehensive career dashboard data
 * GET /api/career-dashboard
 */
const getCareerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get latest resume
    const latestResume = await GeneratedResume.findOne({ user: userId }).sort({
      createdAt: -1,
    });

    // Get latest uploaded resume with ATS score
    const latestUploadedResume = await Resume.findOne({ user: userId }).sort({
      createdAt: -1,
    });

    // Get latest roadmap
    const latestRoadmap = await CareerRoadmap.findOne({ user: userId }).sort({
      createdAt: -1,
    });

    // Get latest interview
    const latestInterview = await InterviewSession.findOne({ user: userId }).sort({
      createdAt: -1,
    });

    // Get completed interviews
    const completedInterviews = await InterviewSession.find({
      user: userId,
      status: "completed",
    }).sort({ completedAt: -1 });

    // Calculate average interview score
    const averageInterviewScore =
      completedInterviews.length > 0
        ? completedInterviews.reduce((sum, interview) => sum + (interview.overallScore || 0), 0) /
          completedInterviews.length
        : 0;

    // Get unread notifications count
    const unreadNotifications = await Notification.countDocuments({
      user: userId,
      read: false,
    });

    // Calculate skill progress (from roadmap)
    let skillProgress = 0;
    if (latestRoadmap) {
      const totalSkills =
        (latestRoadmap.currentSkills?.length || 0) + (latestRoadmap.skillGaps?.length || 0);
      const currentSkills = latestRoadmap.currentSkills?.length || 0;
      skillProgress = totalSkills > 0 ? (currentSkills / totalSkills) * 100 : 0;
    }

    // Get recent activity
    const recentActivity = [];

    if (latestResume) {
      recentActivity.push({
        type: "resume",
        action: "Resume Builder Updated",
        date: latestResume.createdAt,
        link: `/resume-builder`,
      });
    }

    if (latestUploadedResume) {
      recentActivity.push({
        type: "analysis",
        action: "Resume Analyzed",
        date: latestUploadedResume.createdAt,
        atsScore: latestUploadedResume.atsScore,
        link: `/dashboard`,
      });
    }

    if (latestRoadmap) {
      recentActivity.push({
        type: "roadmap",
        action: "Career Roadmap Generated",
        date: latestRoadmap.createdAt,
        link: `/career-roadmap`,
      });
    }

    if (latestInterview && latestInterview.status === "completed") {
      recentActivity.push({
        type: "interview",
        action: "Interview Completed",
        date: latestInterview.completedAt || latestInterview.createdAt,
        score: latestInterview.overallScore,
        link: `/ai-interviewer`,
      });
    }

    // Sort recent activity by date
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Recommended actions
    const recommendedActions = [];

    if (!latestResume) {
      recommendedActions.push({
        title: "Create Your Resume",
        description: "Start by building your professional resume",
        link: "/resume-builder",
        priority: "high",
      });
    } else if (!latestUploadedResume || (latestUploadedResume.atsScore || 0) < 70) {
      recommendedActions.push({
        title: "Improve Resume ATS Score",
        description: "Optimize your resume for better ATS compatibility",
        link: "/job-optimization",
        priority: "high",
      });
    }

    if (!latestRoadmap) {
      recommendedActions.push({
        title: "Generate Career Roadmap",
        description: "Get a personalized career development plan",
        link: "/career-roadmap",
        priority: "medium",
      });
    } else if (latestRoadmap.progressPercentage < 100) {
      recommendedActions.push({
        title: "Continue Your Learning Path",
        description: `You're ${latestRoadmap.progressPercentage}% through your roadmap`,
        link: "/career-roadmap",
        priority: "medium",
      });
    }

    if (completedInterviews.length === 0) {
      recommendedActions.push({
        title: "Practice Interview Skills",
        description: "Take your first AI-powered practice interview",
        link: "/ai-interviewer",
        priority: "medium",
      });
    } else if (averageInterviewScore < 70) {
      recommendedActions.push({
        title: "Improve Interview Performance",
        description: "Practice more to boost your interview scores",
        link: "/ai-interviewer",
        priority: "medium",
      });
    }

    // Career goals
    const careerGoals = {
      targetRole: latestResume?.targetRole || latestRoadmap?.targetRole || "Not set",
      targetIndustry: latestResume?.targetIndustry || latestRoadmap?.targetIndustry || "Not set",
    };

    return res.status(200).json({
      success: true,
      dashboard: {
        resumeScore: latestUploadedResume?.atsScore || 0,
        jobMatchScore: 0, // Can be calculated from job matching history
        roadmapProgress: latestRoadmap?.progressPercentage || 0,
        interviewScore: averageInterviewScore,
        skillProgress: skillProgress,
        completedInterviews: completedInterviews.length,
        unreadNotifications: unreadNotifications,
        recentActivity: recentActivity.slice(0, 10),
        recommendedActions: recommendedActions,
        careerGoals: careerGoals,
        hasResume: !!latestResume,
        hasRoadmap: !!latestRoadmap,
        hasInterview: completedInterviews.length > 0,
      },
    });
  } catch (error) {
    console.error("Get career dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve career dashboard",
    });
  }
};

module.exports = {
  getCareerDashboard,
};
