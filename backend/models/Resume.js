const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    extractedText: {
      type: String,
      default: "",
    },

    // ==============================
    // Analysis
    // ==============================

    atsScore: {
      type: Number,
      default: null,
    },

    skills: {
      type: [String],
      default: [],
    },

    sections: {
      type: [String],
      default: [],
    },

    strengths: {
      type: [String],
      default: [],
    },

    improvements: {
      type: [String],
      default: [],
    },

    keywords: {
      type: [String],
      default: [],
    },

    // ==============================
// AI Career Analysis
// ==============================

professionalSummary: {
  type: String,
  default: "",
},

careerDirection: {
  type: String,
  default: "",
},

overallAssessment: {
  type: String,
  default: "",
},

weaknesses: {
  type: [String],
  default: [],
},

experienceAssessment: {
  type: String,
  default: "",
},

educationAssessment: {
  type: String,
  default: "",
},

atsRecommendations: {
  type: [String],
  default: [],
},

recommendedRoles: {
  type: [String],
  default: [],
},

// ==============================
// AI Skill Insights
// ==============================

skillsAssessment: {
  technicalSkills: {
    type: [String],
    default: [],
  },

  professionalSkills: {
    type: [String],
    default: [],
  },

  domainSkills: {
    type: [String],
    default: [],
  },

  skillInsights: {
    type: [
      {
        skill: {
          type: String,
          default: "",
        },

        category: {
          type: String,
          default: "technical",
        },

        evidence: {
          type: String,
          default: "",
        },

        importance: {
          type: String,
          default: "medium",
        },

        confidence: {
          type: String,
          default: "medium",
        },
      },
    ],
    default: [],
  },

  skillGaps: {
    type: [String],
    default: [],
  },
},

    // ==============================
    // Status
    // ==============================

    status: {
      type: String,
      enum: [
        "uploaded",
        "processing",
        "processed",
        "completed",
        "failed",
      ],
      default: "uploaded",
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model("Resume", resumeSchema);

module.exports = Resume;