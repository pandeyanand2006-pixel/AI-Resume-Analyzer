const mongoose = require("mongoose");

const careerRoadmapSchema = new mongoose.Schema(
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
    // CAREER TARGET
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

    currentLevel: {
      type: String,
      enum: ["entry", "junior", "mid", "senior", "lead", "executive"],
      default: "entry",
    },

    // ==================================================
    // CAREER OVERVIEW
    // ==================================================

    careerSummary: {
      type: String,
      default: "",
    },

    estimatedTimeline: {
      type: String,
      default: "",
    },

    // ==================================================
    // CURRENT SKILLS
    // ==================================================

    currentSkills: {
      type: [String],
      default: [],
    },

    // ==================================================
    // SKILL GAPS
    // ==================================================

    skillGaps: {
      type: [
        {
          skill: {
            type: String,
            required: true,
          },

          importance: {
            type: String,
            enum: ["critical", "high", "medium", "low"],
            default: "medium",
          },

          priority: {
            type: Number,
            default: 1,
          },

          reason: {
            type: String,
            default: "",
          },

          category: {
            type: String,
            default: "technical",
          },
        },
      ],
      default: [],
    },

    // ==================================================
    // LEARNING ROADMAP
    // ==================================================

    roadmapStages: {
      type: [
        {
          title: {
            type: String,
            required: true,
          },

          description: {
            type: String,
            default: "",
          },

          phase: {
            type: String,
            default: "",
          },

          duration: {
            type: String,
            default: "",
          },

          skills: {
            type: [String],
            default: [],
          },

          priority: {
            type: String,
            enum: ["critical", "high", "medium", "low"],
            default: "medium",
          },

          resources: {
            type: [
              {
                name: {
                  type: String,
                  default: "",
                },

                type: {
                  type: String,
                  default: "",
                },

                url: {
                  type: String,
                  default: "",
                },
              },
            ],
            default: [],
          },

          completed: {
            type: Boolean,
            default: false,
          },
        },
      ],
      default: [],
    },

    // ==================================================
    // RECOMMENDED PROJECTS
    // ==================================================

    recommendedProjects: {
      type: [
        {
          title: {
            type: String,
            required: true,
          },

          description: {
            type: String,
            default: "",
          },

          skills: {
            type: [String],
            default: [],
          },

          difficulty: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            default: "intermediate",
          },

          estimatedTime: {
            type: String,
            default: "",
          },

          impact: {
            type: String,
            default: "",
          },
        },
      ],
      default: [],
    },

    // ==================================================
    // RECOMMENDED CERTIFICATIONS
    // ==================================================

    recommendedCertifications: {
      type: [
        {
          name: {
            type: String,
            required: true,
          },

          provider: {
            type: String,
            default: "",
          },

          relevance: {
            type: String,
            default: "",
          },

          priority: {
            type: String,
            enum: ["critical", "high", "medium", "low"],
            default: "medium",
          },

          estimatedCost: {
            type: String,
            default: "",
          },

          estimatedTime: {
            type: String,
            default: "",
          },
        },
      ],
      default: [],
    },

    // ==================================================
    // INTERVIEW PREPARATION
    // ==================================================

    interviewPreparation: {
      topics: {
        type: [String],
        default: [],
      },

      commonQuestions: {
        type: [String],
        default: [],
      },

      technicalAreas: {
        type: [String],
        default: [],
      },

      preparationTips: {
        type: [String],
        default: [],
      },
    },

    // ==================================================
    // TIMELINE
    // ==================================================

    timeline: {
      type: [
        {
          phase: {
            type: String,
            required: true,
          },

          duration: {
            type: String,
            required: true,
          },

          focus: {
            type: String,
            default: "",
          },

          milestones: {
            type: [String],
            default: [],
          },
        },
      ],
      default: [],
    },

    // ==================================================
    // STATUS
    // ==================================================

    status: {
      type: String,
      enum: ["generated", "in_progress", "completed"],
      default: "generated",
    },

    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

const CareerRoadmap = mongoose.model("CareerRoadmap", careerRoadmapSchema);

module.exports = CareerRoadmap;
