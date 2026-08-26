const InterviewSession = require("../models/InterviewSession");
const GeneratedResume = require("../models/GeneratedResume");
const {
  generateInterviewQuestions,
  evaluateAnswer,
  generateOverallEvaluation,
} = require("../services/interviewService");

/**
 * Create a new interview session
 * POST /api/interviews
 */
const createInterviewSession = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      targetRole,
      targetIndustry,
      experienceLevel,
      interviewType,
      difficulty,
      numberOfQuestions,
      resumeId,
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

    // Get user skills if resume provided
    let userSkills = [];
    let userExperience = [];

    if (resumeId) {
      const resume = await GeneratedResume.findOne({
        _id: resumeId,
        user: userId,
      });

      if (resume) {
        userSkills = resume.skills || [];
        userExperience = resume.experience || [];
      }
    }

    // Generate questions using AI
    const questions = await generateInterviewQuestions({
      targetRole: targetRole.trim(),
      targetIndustry: targetIndustry.trim(),
      experienceLevel: experienceLevel || "entry",
      interviewType: interviewType || "mixed",
      difficulty: difficulty || "medium",
      numberOfQuestions: numberOfQuestions || 5,
      userSkills,
      userExperience,
    });

    // Create interview session
    const interview = new InterviewSession({
      user: userId,
      resume: resumeId || null,
      targetRole: targetRole.trim(),
      targetIndustry: targetIndustry.trim(),
      experienceLevel: experienceLevel || "entry",
      interviewType: interviewType || "mixed",
      difficulty: difficulty || "medium",
      numberOfQuestions: numberOfQuestions || 5,
      questions: questions.map((q, index) => ({
        questionNumber: index + 1,
        questionText: q.questionText,
        questionType: q.questionType || "technical",
        difficulty: q.difficulty || "medium",
        category: q.category || "",
        idealAnswer: q.idealAnswer || "",
        userAnswer: "",
        feedback: "",
        score: null,
        strengths: [],
        improvements: [],
        answered: false,
        followUpQuestion: "",
      })),
      currentQuestionIndex: 0,
      status: "setup",
    });

    await interview.save();

    return res.status(201).json({
      success: true,
      message: "Interview session created successfully",
      interview: interview,
    });
  } catch (error) {
    console.error("Create interview session error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create interview session",
    });
  }
};

/**
 * Start interview session
 * POST /api/interviews/:id/start
 */
const startInterviewSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const interviewId = req.params.id;

    const interview = await InterviewSession.findOne({
      _id: interviewId,
      user: userId,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found",
      });
    }

    if (interview.status !== "setup") {
      return res.status(400).json({
        success: false,
        message: "Interview has already been started",
      });
    }

    interview.status = "in_progress";
    interview.startedAt = new Date();
    interview.currentQuestionIndex = 0;

    await interview.save();

    return res.status(200).json({
      success: true,
      message: "Interview started successfully",
      interview: interview,
    });
  } catch (error) {
    console.error("Start interview error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to start interview",
    });
  }
};

/**
 * Submit answer to a question
 * POST /api/interviews/:id/answer
 */
const submitAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const interviewId = req.params.id;
    const { questionNumber, answer } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({
        success: false,
        message: "Answer is required",
      });
    }

    const interview = await InterviewSession.findOne({
      _id: interviewId,
      user: userId,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found",
      });
    }

    if (interview.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Interview is not in progress",
      });
    }

    // Find the question
    const question = interview.questions.find(
      (q) => q.questionNumber === questionNumber
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (question.answered) {
      return res.status(400).json({
        success: false,
        message: "Question has already been answered",
      });
    }

    // Evaluate answer using AI
    const evaluation = await evaluateAnswer({
      questionText: question.questionText,
      questionType: question.questionType,
      userAnswer: answer.trim(),
      targetRole: interview.targetRole,
      targetIndustry: interview.targetIndustry,
      idealAnswer: question.idealAnswer,
    });

    // Update question with answer and evaluation
    question.userAnswer = answer.trim();
    question.answered = true;
    question.score = evaluation.score;
    question.feedback = evaluation.feedback;
    question.strengths = evaluation.strengths || [];
    question.improvements = evaluation.improvements || [];
    question.followUpQuestion = evaluation.followUpQuestion || "";

    // Move to next question
    interview.currentQuestionIndex = questionNumber;

    await interview.save();

    return res.status(200).json({
      success: true,
      message: "Answer submitted successfully",
      evaluation: {
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        followUpQuestion: evaluation.followUpQuestion,
      },
      interview: interview,
    });
  } catch (error) {
    console.error("Submit answer error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit answer",
    });
  }
};

/**
 * Complete interview and generate overall evaluation
 * POST /api/interviews/:id/complete
 */
const completeInterview = async (req, res) => {
  try {
    const userId = req.user.id;
    const interviewId = req.params.id;

    const interview = await InterviewSession.findOne({
      _id: interviewId,
      user: userId,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found",
      });
    }

    if (interview.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Interview is not in progress",
      });
    }

    // Calculate average score
    const answeredQuestions = interview.questions.filter((q) => q.answered);

    if (answeredQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No questions have been answered",
      });
    }

    const totalScore = answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
    const averageScore = totalScore / answeredQuestions.length;
    const overallScore = (averageScore / 10) * 100;

    // Generate overall evaluation
    const overallEvaluation = await generateOverallEvaluation({
      targetRole: interview.targetRole,
      targetIndustry: interview.targetIndustry,
      questions: interview.questions,
      averageScore,
    });

    // Update interview with evaluation
    interview.status = "completed";
    interview.completedAt = new Date();
    interview.overallScore = overallScore;
    interview.overallFeedback = overallEvaluation.overallFeedback;
    interview.strengths = overallEvaluation.strengths;
    interview.weaknesses = overallEvaluation.weaknesses;
    interview.recommendedTopics = overallEvaluation.recommendedTopics;
    interview.improvementSuggestions = overallEvaluation.improvementSuggestions;
    interview.performanceBreakdown = overallEvaluation.performanceBreakdown;

    // Calculate duration
    if (interview.startedAt) {
      interview.duration = Math.floor(
        (interview.completedAt - interview.startedAt) / 1000
      );
    }

    await interview.save();

    return res.status(200).json({
      success: true,
      message: "Interview completed successfully",
      interview: interview,
    });
  } catch (error) {
    console.error("Complete interview error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to complete interview",
    });
  }
};

/**
 * Get all interviews for current user
 * GET /api/interviews
 */
const getUserInterviews = async (req, res) => {
  try {
    const userId = req.user.id;

    const interviews = await InterviewSession.find({ user: userId })
      .populate("resume", "personalInfo targetRole targetIndustry")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: interviews.length,
      interviews: interviews,
    });
  } catch (error) {
    console.error("Get user interviews error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve interviews",
    });
  }
};

/**
 * Get specific interview by ID
 * GET /api/interviews/:id
 */
const getInterviewById = async (req, res) => {
  try {
    const userId = req.user.id;
    const interviewId = req.params.id;

    const interview = await InterviewSession.findOne({
      _id: interviewId,
      user: userId,
    }).populate("resume", "personalInfo targetRole targetIndustry");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found",
      });
    }

    return res.status(200).json({
      success: true,
      interview: interview,
    });
  } catch (error) {
    console.error("Get interview by ID error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve interview",
    });
  }
};

/**
 * Delete an interview
 * DELETE /api/interviews/:id
 */
const deleteInterview = async (req, res) => {
  try {
    const userId = req.user.id;
    const interviewId = req.params.id;

    const interview = await InterviewSession.findOneAndDelete({
      _id: interviewId,
      user: userId,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error) {
    console.error("Delete interview error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete interview",
    });
  }
};

/**
 * Get latest interview
 * GET /api/interviews/latest
 */
const getLatestInterview = async (req, res) => {
  try {
    const userId = req.user.id;

    const interview = await InterviewSession.findOne({ user: userId })
      .populate("resume", "personalInfo targetRole targetIndustry")
      .sort({ createdAt: -1 });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "No interview sessions found",
      });
    }

    return res.status(200).json({
      success: true,
      interview: interview,
    });
  } catch (error) {
    console.error("Get latest interview error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve latest interview",
    });
  }
};

module.exports = {
  createInterviewSession,
  startInterviewSession,
  submitAnswer,
  completeInterview,
  getUserInterviews,
  getInterviewById,
  deleteInterview,
  getLatestInterview,
};
