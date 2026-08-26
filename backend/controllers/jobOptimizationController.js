const GeneratedResume = require("../models/GeneratedResume");

// =====================================================
// JOB-SPECIFIC RESUME OPTIMIZATION
// POST /api/job-optimization
// =====================================================

const optimizeResumeForJob = async (req, res) => {
  try {
    const { jobDescription } = req.body;

    // -------------------------------------------------
    // Validate job description
    // -------------------------------------------------

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job description is required",
      });
    }

    if (jobDescription.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: "Please provide a complete job description",
      });
    }

    // -------------------------------------------------
    // Find user's latest resume
    // -------------------------------------------------

    const resume = await GeneratedResume.findOne({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message:
          "No resume found. Please create a resume first.",
      });
    }

    // -------------------------------------------------
    // Prepare resume information
    // -------------------------------------------------

    const resumeText = `
PERSONAL INFORMATION
Name: ${resume.personalInfo?.fullName || ""}
Email: ${resume.personalInfo?.email || ""}
Location: ${resume.personalInfo?.location || ""}

PROFESSIONAL SUMMARY
${resume.generatedSummary || resume.summary || ""}

SKILLS
${(resume.skills || []).join(", ")}

EXPERIENCE
${
  (resume.experience || [])
    .map(
      (item) => `
Company: ${item.company || ""}
Position: ${item.position || ""}
Duration: ${item.startDate || ""} - ${item.endDate || ""}
Description: ${item.description || ""}
`
    )
    .join("\n")
}

EDUCATION
${
  (resume.education || [])
    .map(
      (item) => `
Institution: ${item.institution || ""}
Degree: ${item.degree || ""}
Field: ${item.field || ""}
Duration: ${item.startYear || ""} - ${item.endYear || ""}
`
    )
    .join("\n")
}

PROJECTS
${
  (resume.projects || [])
    .map(
      (project) => `
Project: ${project.name || ""}
Technologies: ${(project.technologies || []).join(", ")}
Description: ${project.description || ""}
`
    )
    .join("\n")
}

CERTIFICATIONS
${
  (resume.certifications || [])
    .map(
      (cert) =>
        `${cert.name || ""} - ${cert.issuer || ""} - ${
          cert.year || ""
        }`
    )
    .join("\n")
}

ACHIEVEMENTS
${
  (resume.achievements || [])
    .map(
      (achievement) =>
        `${achievement.title || ""} - ${
          achievement.description || ""
        } - ${achievement.year || ""}`
    )
    .join("\n")
}
`;

    // -------------------------------------------------
    // Groq API
    // -------------------------------------------------

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GROQ_API_KEY is not configured",
      });
    }

    const prompt = `
You are an expert ATS resume optimization system.

Analyze the candidate's resume against the provided job description.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME:
${resumeText}

Your task is to calculate an ATS compatibility score and identify exactly how the resume should be improved.

Return ONLY valid JSON.

Use this exact structure:

{
  "matchScore": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "recommendedKeywords": [],
  "optimizedSummary": "",
  "recommendations": [],
  "projectImprovements": []
}

Rules:

1. matchScore must be a number from 0 to 100.
2. matchedSkills must contain skills/technologies found in both the resume and job description.
3. missingSkills must contain important skills/technologies requested by the job but missing from the resume.
4. recommendedKeywords must contain important ATS keywords from the job description.
5. optimizedSummary must be a professional ATS-friendly summary based ONLY on information actually present in the resume. Do not invent experience.
6. recommendations should contain practical improvements.
7. projectImprovements should contain suggestions for improving existing projects.
8. Do not invent certifications, companies, degrees, jobs or experience.
9. Keep the response concise.
`;

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },

        body: JSON.stringify({
          model:
            process.env.GROQ_MODEL ||
            "openai/gpt-oss-120b",

          temperature: 0.2,

          response_format: {
            type: "json_object",
          },

          messages: [
            {
              role: "system",
              content:
                "You are an expert ATS resume optimization assistant. Always return valid JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    const groqData = await groqResponse.json();

    // -------------------------------------------------
    // Check Groq response
    // -------------------------------------------------

    if (!groqResponse.ok) {
      console.error(
        "Groq optimization error:",
        groqData
      );

      return res.status(500).json({
        success: false,
        message:
          groqData?.error?.message ||
          "Groq AI optimization failed",
      });
    }

    const content =
      groqData?.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({
        success: false,
        message: "AI returned an empty response",
      });
    }

    // -------------------------------------------------
    // Parse AI JSON
    // -------------------------------------------------

    let optimization;

    try {
      optimization = JSON.parse(content);
    } catch (parseError) {
      console.error(
        "AI JSON parse error:",
        parseError
      );

      console.error(
        "AI content:",
        content
      );

      return res.status(500).json({
        success: false,
        message:
          "AI returned an invalid optimization response",
      });
    }

    // -------------------------------------------------
    // Normalize result
    // -------------------------------------------------

    const result = {
      matchScore: Math.max(
        0,
        Math.min(
          100,
          Number(optimization.matchScore) || 0
        )
      ),

      matchedSkills: Array.isArray(
        optimization.matchedSkills
      )
        ? optimization.matchedSkills
        : [],

      missingSkills: Array.isArray(
        optimization.missingSkills
      )
        ? optimization.missingSkills
        : [],

      recommendedKeywords: Array.isArray(
        optimization.recommendedKeywords
      )
        ? optimization.recommendedKeywords
        : [],

      optimizedSummary:
        optimization.optimizedSummary || "",

      recommendations: Array.isArray(
        optimization.recommendations
      )
        ? optimization.recommendations
        : [],

      projectImprovements: Array.isArray(
        optimization.projectImprovements
      )
        ? optimization.projectImprovements
        : [],
    };

    // -------------------------------------------------
    // Send response
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Resume optimized successfully",

      resumeId: resume._id,

      result,

      // Also send these directly because
      // frontend can use them easily.
      matchScore: result.matchScore,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      recommendedKeywords:
        result.recommendedKeywords,
      optimizedSummary:
        result.optimizedSummary,
      recommendations:
        result.recommendations,
      projectImprovements:
        result.projectImprovements,
    });
  } catch (error) {
    console.error(
      "Job optimization error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to optimize resume",
      error: error.message,
    });
  }
};

module.exports = {
  optimizeResumeForJob,
};