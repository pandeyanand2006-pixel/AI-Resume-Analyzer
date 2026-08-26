const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema(
  {
    // ==================================================
    // USER & RESUME
    // ==================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GeneratedResume",
      default: null,
    },

    // ==================================================
    // INTERVIEW CONFIGURATION
    // ==================================================

    targetRole: {
      type: String,
      required: true,
      trim: true,
    },

    targetIndustry: {
      type: String,
      required: true,
      trim: true,
    },

    experienceLevel: {
      type: String,
      enum: ["entry", "junior", "mid", "senior", "lead", "executive"],
      default: "entry",
    },

    interviewType: {
      type: String,
      enum: ["hr", "technical", "behavioral", "role_specific", "mixed"],
      default: "mixed",
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    numberOfQuestions: {
      type: Number,
      default: 5,
      min: 1,
      max: 20,
    },

    // ==================================================
    // QUESTIONS & ANSWERS
    // ==================================================

    questions: {
      type: [
        {
          questionNumber: {
            type: Number,
            required: true,
          },

          questionText: {
            type: String,
            required: true,
          },

          questionType: {
            type: String,
            enum: ["hr", "technical", "behavioral", "situational", "role_specific"],
            default: "technical",
          },

          difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "medium",
          },

          category: {
            type: String,
            default: "",
          },

          userAnswer: {
            type: String,
            default: "",
          },

          feedback: {
            type: String,
            default: "",
          },

          score: {
            type: Number,
            default: null,
            min: 0,
            max: 10,
          },

          strengths: {
            type: [String],
            default: [],
          },

          improvements: {
            type: [String],
            default: [],
          },

          idealAnswer: {
            type: String,
            default: "",
          },

          answered: {
            type: Boolean,
            default: false,
          },

          followUpQuestion: {
            type: String,
            default: "",
          },
        },
      ],
      default: [],
    },

    // ==================================================
    // CURRENT STATE
    // ==================================================

    currentQuestionIndex: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["setup", "in_progress", "completed", "abandoned"],
      default: "setup",
    },

    // ==================================================
    // EVALUATION
    // ==================================================

    overallScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },

    overallFeedback: {
      type: String,
      default: "",
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    recommendedTopics: {
      type: [String],
      default: [],
    },

    improvementSuggestions: {
      type: [String],
      default: [],
    },

    // ==================================================
    // PERFORMANCE BREAKDOWN
    // ==================================================

    performanceBreakdown: {
      communication: {
        type: Number,
        default: null,
        min: 0,
        max: 10,
      },

      technicalKnowledge: {
        type: Number,
        default: null,
        min: 0,
        max: 10,
      },

      problemSolving: {
        type: Number,
        default: null,
        min: 0,
        max: 10,
      },

      clarity: {
        type: Number,
        default: null,
        min: 0,
        max: 10,
      },

      relevance: {
        type: Number,
        default: null,
        min: 0,
        max: 10,
      },
    },

    // ==================================================
    // TIMING
    // ==================================================

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    duration: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const InterviewSession = mongoose.model("InterviewSession", interviewSessionSchema);

module.exports = InterviewSession;
