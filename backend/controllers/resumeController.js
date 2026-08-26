const fs = require("fs");

const Resume = require("../models/Resume");
const extractResumeText = require("../services/resumeParser");
const { generateAIResponse } = require("../services/groqService");

// ======================================================
// UPLOAD RESUME
// ======================================================

const uploadResume = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF or DOCX resume.",
      });
    }

    const file = req.file;

    // ------------------------------------------
    // Extract resume text
    // ------------------------------------------

    const extractedText = await extractResumeText(
      file.path,
      file.mimetype
    );

    if (
      !extractedText ||
      extractedText.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Could not extract text from the resume. Please upload a valid PDF or DOCX file.",
      });
    }

    // ------------------------------------------
    // Save resume
    // ------------------------------------------

    const resume = await Resume.create({
      user: req.user._id || req.user.id,

      originalName: file.originalname,

      fileName: file.filename,

      filePath: file.path,

      fileType: file.mimetype,

      fileSize: file.size,

      extractedText: extractedText,

      status: "uploaded",
    });

    return res.status(201).json({
      success: true,

      message: "Resume uploaded successfully.",

      resume: {
        id: resume._id,
        originalName: resume.originalName,
        fileName: resume.fileName,
        fileType: resume.fileType,
        fileSize: resume.fileSize,
        status: resume.status,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Upload resume error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Resume upload failed.",
    });
  }
};

// ======================================================
// GET USER RESUMES
// ======================================================

const getUserResumes = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userId =
      req.user._id || req.user.id;

    const resumes = await Resume.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    const safeResumes = resumes.map((r) => ({
      id: String(r._id),
      _id: String(r._id),
      originalName: r.originalName,
      fileName: r.fileName,
      fileType: r.fileType,
      fileSize: r.fileSize,
      status: r.status,
      createdAt: r.createdAt,
      atsScore: r.atsScore || 0,
      skills: r.skills || [],
    }));

    return res.status(200).json({
      success: true,
      count: safeResumes.length,
      resumes: safeResumes,
    });
  } catch (error) {
    console.error(
      "Get resumes error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch resumes.",
    });
  }
};

// ======================================================
// GET SINGLE RESUME
// ======================================================

const getResumeById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid resume ID" });
    }

    const userId =
      req.user._id || req.user.id;

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found.",
      });
    }

    const safe = {
      id: String(resume._id),
      _id: String(resume._id),
      originalName: resume.originalName,
      fileName: resume.fileName,
      fileType: resume.fileType,
      fileSize: resume.fileSize,
      status: resume.status,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
      atsScore: resume.atsScore || 0,
      skills: resume.skills || [],
      sections: resume.sections || [],
      strengths: resume.strengths || [],
      improvements: resume.improvements || [],
      keywords: resume.keywords || [],
      extractedText: resume.extractedText || "",
    };

    return res.status(200).json({
      success: true,
      resume: safe,
    });
  } catch (error) {
    console.error(
      "Get resume error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch resume.",
    });
  }
};

// ======================================================
// GET RESUME FILE (serve PDF/DOCX)
// ======================================================

const path = require("path");

const getResumeFile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid resume ID" });
    }
    const userId = req.user._id || req.user.id;
    const resume = await Resume.findOne({ _id: req.params.id, user: userId });
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found." });
    }
    if (!resume.filePath) {
      return res.status(404).json({ success: false, message: "File not found on server." });
    }
    // Handle both absolute and relative paths
    let absolutePath = resume.filePath;
    if (!path.isAbsolute(absolutePath)) {
      absolutePath = path.resolve(__dirname, "..", absolutePath);
    }
    if (!fs.existsSync(absolutePath)) {
      // Fallback: try uploads folder directly
      const fallback = path.join(__dirname, "..", "uploads", path.basename(absolutePath));
      if (fs.existsSync(fallback)) absolutePath = fallback;
      else return res.status(404).json({ success: false, message: "File not found on server." });
    }
    res.setHeader("Content-Type", resume.fileType || "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${resume.originalName}"`);
    res.setHeader("Cache-Control", "private, max-age=0");
    return res.sendFile(absolutePath);
  } catch (error) {
    console.error("Get resume file error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch file." });
  }
};

// ======================================================
// DELETE RESUME
// ======================================================

const deleteResume = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userId =
      req.user._id || req.user.id;

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found.",
      });
    }

    // ------------------------------------------
    // Delete physical file
    // ------------------------------------------

    if (
      resume.filePath &&
      fs.existsSync(resume.filePath)
    ) {
      fs.unlinkSync(resume.filePath);
    }

    // ------------------------------------------
    // Delete database record
    // ------------------------------------------

    await Resume.deleteOne({
      _id: resume._id,
    });

    return res.status(200).json({
      success: true,
      message: "Resume deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete resume error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete resume.",
      // Do not expose internal error details
    });
  }
};

// ======================================================
// ANALYZE RESUME — GEMINI AI
// ======================================================

const analyzeResume = async (req, res) => {
   console.log("🔥🔥🔥 ANALYZE CONTROLLER HIT 🔥🔥🔥");
  console.log("METHOD:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("PARAMS:", req.params);

  try {
    console.log(
      "=================================================="
    );

    console.log(
      "ANALYZE RESUME ROUTE HIT"
    );

    console.log(
      "Resume ID:",
      req.params.id
    );

    // ------------------------------------------
    // Authentication
    // ------------------------------------------

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userId =
      req.user._id || req.user.id;

    // ------------------------------------------
    // Find resume
    // ------------------------------------------

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found.",
      });
    }

    // ------------------------------------------
    // Check extracted text
    // ------------------------------------------

    if (
      !resume.extractedText ||
      resume.extractedText.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Resume text has not been extracted yet.",
      });
    }

    // ------------------------------------------
    // Mark processing
    // ------------------------------------------

    resume.status = "processing";

    await resume.save();

    // ------------------------------------------
    // Resume text
    // ------------------------------------------

    const text =
      resume.extractedText.trim();

    console.log(
      "Resume text length:",
      text.length
    );

    // ==================================================
    // GEMINI PROMPT
    // ==================================================

    const prompt = `
You are an expert universal resume analyzer and career coach.

Analyze the following resume professionally and objectively.

IMPORTANT UNIVERSAL RULES:

1. The candidate can belong to ANY profession or industry.

Examples:
- Software / IT
- Finance
- Accounting
- Marketing
- Human Resources
- Healthcare
- Education
- Engineering
- Design
- Sales
- Administration
- Operations
- Research
- Legal
- Hospitality
- Manufacturing
- Government
- Non-profit
- Skilled trades
- Any other professional field

2. NEVER assume the candidate is an IT/software professional.

3. Use ONLY information actually present in the resume.

4. NEVER invent:
- Skills
- Experience
- Companies
- Job titles
- Degrees
- Certifications
- Achievements
- Projects
- Responsibilities
- Results
- Years of experience

5. Every strength and improvement must be based on evidence from THIS resume.

6. Return ONLY valid JSON.

7. Do NOT return markdown.

8. Do NOT use code fences.

9. Do NOT include explanations outside JSON.

Return EXACTLY this structure:

{
  "atsScore": 0,
  "skills": [],
  "sections": [],
  "strengths": [],
  "improvements": [],
  "keywords": []
}

==================================================
ATS SCORE
==================================================

Return an integer from 0 to 100.

Consider:

- Resume structure
- Section organization
- Content completeness
- Professional clarity
- Keyword relevance
- Skills visibility
- Experience clarity
- Education clarity
- Achievement visibility
- ATS-friendly formatting
- Professional terminology

Do NOT automatically give a high score.

90-100 = Excellent
75-89 = Good
60-74 = Moderate
40-59 = Weak
0-39 = Very weak/incomplete

==================================================
SKILLS
==================================================

Extract important skills actually found in the resume.

Include where appropriate:

- Technical skills
- Professional skills
- Domain skills
- Industry skills
- Tools
- Software
- Methodologies
- Soft skills

Do not restrict the analysis to technology.

Avoid duplicates.

==================================================
SECTIONS
==================================================

Identify only sections actually present.

Examples:

Contact Information
Professional Summary
Summary
Objective
Profile
Experience
Work Experience
Education
Skills
Projects
Certifications
Achievements
Awards
Languages
Publications
Volunteer Work
Interests
References

==================================================
STRENGTHS
==================================================

Return 3 to 6 specific strengths.

Every strength must:

- Be supported by the resume.
- Be relevant to the candidate's field.
- Explain why it is a strength.
- Avoid generic compliments.
- Never invent information.

Example:

Bad:
"Strong technical skills."

Good:
"Strong machine-learning foundation demonstrated through Python, pandas, scikit-learn, and natural-language-processing projects."

==================================================
IMPROVEMENTS
==================================================

Return 3 to 6 specific actionable improvements.

IMPORTANT:

NEVER return an empty improvements array unless the resume is genuinely exceptional in every major area.

Carefully inspect THIS resume.

Look for:

- Weak professional summary
- Unclear career objective
- Missing measurable achievements
- Responsibilities without outcomes
- Weak experience descriptions
- Weak project descriptions
- Missing role-specific keywords
- Poor skills organization
- Missing dates
- Missing important career information
- Weak action verbs
- Generic wording
- ATS-unfriendly formatting
- Missing relevant certifications
- Missing portfolio/profile links where appropriate
- Lack of quantified results
- Weak leadership/teamwork evidence
- Opportunities to better demonstrate professional expertise

Each improvement must be an ACTION.

Bad:
"Improve your resume."

Good:
"Add measurable outcomes to project descriptions so recruiters can understand the impact of the work."

Bad:
"Add achievements."

Good:
"Where possible, add numbers or measurable outcomes to experience and project bullets to demonstrate the impact of your work."

==================================================
KEYWORDS
==================================================

Return up to 20 meaningful keywords actually found in the resume.

Prefer:

- Professional skills
- Job titles
- Tools
- Technologies
- Domains
- Certifications
- Methodologies
- Industry terminology

Do not invent keywords.

==================================================
RESUME
==================================================

${text}
`;

    // ==================================================
    // CALL GROQ AI
    // ==================================================

    const aiText = await generateAIResponse(prompt, {
      temperature: 0.3,
      maxTokens: 4000,
      systemMessage: "You are an expert universal resume analyzer and career coach. Always return valid JSON without markdown."
    });

    console.log(
      "Groq AI analysis response received."
    );

    console.log(
      "Groq raw response:"
    );

    console.log(aiText);

    // ==================================================
    // CLEAN RESPONSE
    // ==================================================

    let cleanedText = aiText;

    cleanedText = cleanedText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // ==================================================
    // PARSE JSON
    // ==================================================

    let aiAnalysis;

    try {
      aiAnalysis =
        JSON.parse(cleanedText);
    } catch (parseError) {
      console.error(
        "Groq JSON parsing error:",
        parseError
      );

      console.error(
        "Cleaned Gemini response:",
        cleanedText
      );

      throw new Error(
        "Groq AI returned an invalid analysis format."
      );
    }

    // ==================================================
    // NORMALIZE ATS SCORE
    // ==================================================

    const atsScore = Math.max(
      0,
      Math.min(
        100,
        Number(aiAnalysis.atsScore) || 0
      )
    );

    // ==================================================
    // NORMALIZE SKILLS
    // ==================================================

    const skills = Array.isArray(
      aiAnalysis.skills
    )
      ? [
          ...new Set(
            aiAnalysis.skills
              .filter(
                (item) =>
                  typeof item === "string"
              )
              .map((item) =>
                item.trim()
              )
              .filter(Boolean)
          ),
        ]
      : [];

    // ==================================================
    // NORMALIZE SECTIONS
    // ==================================================

    const sections = Array.isArray(
      aiAnalysis.sections
    )
      ? [
          ...new Set(
            aiAnalysis.sections
              .filter(
                (item) =>
                  typeof item === "string"
              )
              .map((item) =>
                item.trim()
              )
              .filter(Boolean)
          ),
        ]
      : [];

    // ==================================================
    // NORMALIZE STRENGTHS
    // ==================================================

    const strengths = Array.isArray(
      aiAnalysis.strengths
    )
      ? aiAnalysis.strengths
          .filter(
            (item) =>
              typeof item === "string" &&
              item.trim().length > 0
          )
          .map((item) =>
            item.trim()
          )
          .slice(0, 6)
      : [];

    // ==================================================
    // NORMALIZE IMPROVEMENTS
    // ==================================================

    let improvements = Array.isArray(
      aiAnalysis.improvements
    )
      ? aiAnalysis.improvements
          .filter(
            (item) =>
              typeof item === "string" &&
              item.trim().length > 0
          )
          .map((item) =>
            item.trim()
          )
          .slice(0, 6)
      : [];

    // ==================================================
    // FALLBACK IMPROVEMENTS
    // ==================================================

    if (improvements.length === 0) {
      improvements = [
        "Add measurable achievements and results to experience or project descriptions where possible.",
        "Strengthen experience and project bullet points by clearly describing your actions and the outcomes achieved.",
        "Review the resume for important keywords relevant to your target profession and the roles you want to apply for.",
        "Make the most important professional skills and competencies easy for recruiters and ATS systems to identify.",
      ];
    }

    // IMPORTANT DEBUG LOG
    console.log(
      "FINAL IMPROVEMENTS:"
    );

    console.log(
      improvements
    );

    // ==================================================
    // NORMALIZE KEYWORDS
    // ==================================================

    const keywords = Array.isArray(
      aiAnalysis.keywords
    )
      ? [
          ...new Set(
            aiAnalysis.keywords
              .filter(
                (item) =>
                  typeof item === "string"
              )
              .map((item) =>
                item.trim()
              )
              .filter(Boolean)
          ),
        ].slice(0, 20)
      : [];

    // ==================================================
    // SAVE ANALYSIS
    // ==================================================

    resume.atsScore =
      atsScore;

    resume.skills =
      skills;

    resume.sections =
      sections;

    resume.strengths =
      strengths;

    resume.improvements =
      improvements;

    resume.keywords =
      keywords;

    resume.status =
      "completed";

    await resume.save();

    // ==================================================
    // FINAL RESPONSE
    // ==================================================

    console.log(
      "Analysis saved successfully."
    );

    console.log(
      "Saved improvements:",
      resume.improvements
    );

    return res.status(200).json({
      success: true,

      message:
        "Resume analyzed successfully using Groq AI.",

      analysis: {
        resumeId:
          resume._id,

        atsScore:
          atsScore,

        skills:
          skills,

        skillsCount:
          skills.length,

        sections:
          sections,

        sectionsCount:
          sections.length,

        strengths:
          strengths,

        improvements:
          improvements,

        keywords:
          keywords,

        keywordsCount:
          keywords.length,

        extractedTextLength:
          text.length,

        status:
          "completed",
      },
    });
  } catch (error) {
    console.error(
      "Analyze resume error:",
      error
    );

    // ------------------------------------------
    // Mark failed
    // ------------------------------------------

    try {
      await Resume.findOneAndUpdate(
        {
          _id: req.params.id,
          user:
            req.user?._id ||
            req.user?.id,
        },
        {
          status: "failed",
        }
      );
    } catch (updateError) {
      console.error(
        "Failed to update resume status:",
        updateError
      );
    }

    return res.status(500).json({
      success: false,

      message:
        "Resume analysis failed.",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  uploadResume,
  getUserResumes,
  getResumeById,
  getResumeFile,
  deleteResume,
  analyzeResume,
};