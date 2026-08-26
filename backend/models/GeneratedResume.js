const mongoose = require("mongoose");

const generatedResumeSchema = new mongoose.Schema(
  {
    // ==================================================
    // USER
    // ==================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==================================================
    // PERSONAL INFORMATION
    // ==================================================

    personalInfo: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        default: "",
        trim: true,
      },

      location: {
        type: String,
        default: "",
        trim: true,
      },

      linkedin: {
        type: String,
        default: "",
        trim: true,
      },

      github: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // ==================================================
    // SUMMARY
    // ==================================================

    summary: {
      type: String,
      default: "",
    },

    // ==================================================
    // SKILLS
    // ==================================================

    skills: {
      type: [String],
      default: [],
    },

    // ==================================================
    // EXPERIENCE
    // ==================================================

    experience: {
      type: [
        {
          company: {
            type: String,
            default: "",
          },

          position: {
            type: String,
            default: "",
          },

          startDate: {
            type: String,
            default: "",
          },

          endDate: {
            type: String,
            default: "",
          },

          description: {
            type: String,
            default: "",
          },
        },
      ],
      default: [],
    },

    // ==================================================
    // EDUCATION
    // ==================================================

    // Supports:
    // 10th
    // 12th
    // Diploma
    // B.Tech
    // M.Tech
    // etc.

    education: {
      type: [
        {
          institution: {
            type: String,
            default: "",
          },

          degree: {
            type: String,
            default: "",
          },

          field: {
            type: String,
            default: "",
          },

          startYear: {
            type: String,
            default: "",
          },

          endYear: {
            type: String,
            default: "",
          },
        },
      ],
      default: [],
    },

    // ==================================================
    // PROJECTS
    // ==================================================

    projects: {
      type: [
        {
          name: {
            type: String,
            default: "",
          },

          description: {
            type: String,
            default: "",
          },

          technologies: {
            type: [String],
            default: [],
          },

          link: {
            type: String,
            default: "",
          },
        },
      ],
      default: [],
    },

    // ==================================================
    // CERTIFICATIONS
    // ==================================================

    certifications: {
      type: [
        {
          name: {
            type: String,
            default: "",
          },

          issuer: {
            type: String,
            default: "",
          },

          year: {
            type: String,
            default: "",
          },

          link: {
            type: String,
            default: "",
          },
        },
      ],
      default: [],
    },

    // ==================================================
    // ACHIEVEMENTS
    // ==================================================

    achievements: {
      type: [
        {
          title: {
            type: String,
            default: "",
          },

          description: {
            type: String,
            default: "",
          },

          year: {
            type: String,
            default: "",
          },
        },
      ],
      default: [],
    },

    // ==================================================
    // CAREER TARGET
    // ==================================================

    targetRole: {
      type: String,
      default: "",
      trim: true,
    },

    targetIndustry: {
      type: String,
      default: "",
      trim: true,
    },

    // ==================================================
    // AI GENERATED CONTENT
    // ==================================================

    generatedSummary: {
      type: String,
      default: "",
    },

    aiSuggestions: {
      type: [String],
      default: [],
    },
  },

  {
    timestamps: true,
  }
);

const GeneratedResume = mongoose.model(
  "GeneratedResume",
  generatedResumeSchema
);

module.exports = GeneratedResume;