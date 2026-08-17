require("dotenv").config({
  path: require("path").join(__dirname, ".env"),
});

const mongoose = require("mongoose");

const connectDB = require("./config/db");
const Job = require("./models/Job");

const jobs = [
  {
    title: "Junior Full Stack Developer",
    company: "Tech Solutions",
    location: "Remote",
    description:
      "Build and maintain modern web applications using React and Node.js.",
    requiredSkills: [
      "javascript",
      "react",
      "node.js",
      "express",
      "mongodb",
      "html",
      "css",
      "git",
      "rest api",
    ],
    experience: "0-2 years",
    salary: "₹4-8 LPA",
    jobType: "Full-time",
  },

  {
    title: "Frontend Developer",
    company: "WebWorks",
    location: "Bangalore",
    description:
      "Develop responsive frontend applications using React and modern CSS.",
    requiredSkills: [
      "javascript",
      "react",
      "html",
      "css",
      "tailwind",
      "git",
      "rest api",
    ],
    experience: "1-3 years",
    salary: "₹5-10 LPA",
    jobType: "Full-time",
  },

  {
    title: "Backend Developer",
    company: "Cloud Systems",
    location: "Hyderabad",
    description:
      "Develop scalable backend APIs and database systems.",
    requiredSkills: [
      "javascript",
      "node.js",
      "express",
      "mongodb",
      "sql",
      "rest api",
      "git",
      "docker",
      "aws",
    ],
    experience: "1-3 years",
    salary: "₹6-12 LPA",
    jobType: "Full-time",
  },

  {
    title: "Python Developer",
    company: "DataTech",
    location: "Remote",
    description:
      "Develop Python applications and backend services.",
    requiredSkills: [
      "python",
      "sql",
      "git",
      "rest api",
      "docker",
      "aws",
    ],
    experience: "0-2 years",
    salary: "₹5-9 LPA",
    jobType: "Full-time",
  },

  {
    title: "Software Developer",
    company: "Innovate Labs",
    location: "Pune",
    description:
      "Work on full-stack software development projects.",
    requiredSkills: [
      "javascript",
      "react",
      "node.js",
      "mongodb",
      "sql",
      "git",
      "rest api",
    ],
    experience: "0-3 years",
    salary: "₹5-11 LPA",
    jobType: "Full-time",
  },

  {
    title: "Machine Learning Engineer",
    company: "AI Labs",
    location: "Bangalore",
    description:
      "Build machine learning systems and data pipelines.",
    requiredSkills: [
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
    experience: "1-3 years",
    salary: "₹8-16 LPA",
    jobType: "Full-time",
  },
];

async function seedJobs() {
  try {
    await connectDB();

    await Job.deleteMany({});

    await Job.insertMany(jobs);

    console.log("Jobs inserted successfully");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("Job seed error:", error);

    process.exit(1);
  }
}

seedJobs();