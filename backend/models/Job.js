const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      default: "Remote",
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    requiredSkills: {
      type: [String],
      default: [],
    },

    experience: {
      type: String,
      default: "Not specified",
    },

    salary: {
      type: String,
      default: "Not specified",
    },

    jobType: {
      type: String,
      default: "Full-time",
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;