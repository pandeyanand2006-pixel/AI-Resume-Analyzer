const Groq = require("groq-sdk");
const GeneratedResume = require("../models/GeneratedResume");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generateResume = async (req, res) => {
  try {
    const {
      targetRole,
      targetIndustry,
      skills = [],
      experience = [],
      projects = [],
      certifications = [],
      achievements = [],
    } = req.body;

    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: "Target role is required",
      });
    }

    const prompt = `
You are an expert professional resume writer.

Create a professional ATS-friendly resume based ONLY on the information provided below.

Target Role:
${targetRole}

Target Industry:
${targetIndustry || "Technology"}

Skills:
${JSON.stringify(skills)}

Experience:
${JSON.stringify(experience)}

Projects:
${JSON.stringify(projects)}

Certifications:
${JSON.stringify(certifications)}

Achievements:
${JSON.stringify(achievements)}

Return ONLY valid JSON.

Use this exact structure:

{
  "professionalSummary": "",
  "skills": [],
  "experience": [],
  "projects": [],
  "certifications": [],
  "achievements": [],
  "education": [],
  "atsKeywords": []
}

Rules:
- Do not invent companies.
- Do not invent degrees.
- Do not invent certifications.
- Do not invent experience.
- Improve wording professionally.
- Make bullet points action-oriented.
- Optimize for ATS.
- Keep information truthful.
`;

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            "You are an expert ATS resume writer. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });

    let generatedText =
      completion.choices[0]?.message?.content || "{}";

    // Remove markdown JSON fences if Groq returns them
    generatedText = generatedText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let generatedResume;

    try {
      generatedResume = JSON.parse(generatedText);
    } catch (error) {
      console.error("Groq JSON parsing error:", generatedText);

      return res.status(500).json({
        success: false,
        message: "AI returned invalid resume data",
      });
    }

    const savedResume = await GeneratedResume.create({
      user: req.user.id || req.user._id,
      targetRole,
      targetIndustry,
      skills,
      experience,
      projects,
      certifications,
      achievements,
      generatedResume,
    });

    return res.status(201).json({
      success: true,
      message: "Resume generated successfully",
      data: savedResume,
    });
  } catch (error) {
    console.error("Generate resume error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate resume",
      error:
        process.env.NODE_ENV === "production"
          ? undefined
          : error.message,
    });
  }
};

const getGeneratedResumes = async (req, res) => {
  try {
    const resumes = await GeneratedResume.find({
      user: req.user.id || req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error) {
    console.error("Get generated resumes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch generated resumes",
    });
  }
};

module.exports = {
  generateResume,
  getGeneratedResumes,
};