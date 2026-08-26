const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generate a personalized career roadmap based on user's current skills,
 * target role, industry, and experience level.
 */
const generateCareerRoadmap = async ({
  targetRole,
  targetIndustry,
  currentSkills = [],
  education = [],
  experience = [],
  currentLevel = "entry",
}) => {
  const prompt = `
You are an expert career advisor and professional development specialist.

Your job is to create a comprehensive, personalized career development roadmap.

IMPORTANT RULES:

1. This roadmap must be relevant to the target role and industry provided.

2. Do NOT assume this is a software engineering role unless explicitly stated.

3. The roadmap must work for ALL professional fields:
   - Healthcare (nursing, medicine, pharmacy)
   - Finance (accounting, banking, investment)
   - Engineering (mechanical, civil, electrical, software)
   - Marketing (digital marketing, brand management, content)
   - Education (teaching, training, administration)
   - Law (legal practice, corporate law, litigation)
   - Design (graphic design, UX/UI, product design)
   - Business (management, sales, consulting)
   - Science (research, laboratory, data science)
   - And ANY other professional field

4. Base skill gaps on what is ACTUALLY required for the target role in the
   target industry, not generic assumptions.

5. Recommend certifications, courses, and learning resources that are
   RELEVANT to the specific field.

6. Create practical project recommendations appropriate to the field.

7. Interview preparation should be tailored to the industry.

8. Timeline should be realistic based on current level and target role.

9. Return ONLY valid JSON with no markdown formatting.

10. If current skills are empty, assume the person is starting from scratch.

Current User Information:

Target Role: ${targetRole}
Target Industry: ${targetIndustry}
Current Level: ${currentLevel}
Current Skills: ${currentSkills.join(", ") || "None provided"}
Education: ${JSON.stringify(education)}
Experience: ${JSON.stringify(experience)}

Return exactly this JSON structure:

{
  "careerSummary": "",
  "estimatedTimeline": "",
  "currentSkills": [],
  "skillGaps": [
    {
      "skill": "",
      "importance": "critical|high|medium|low",
      "priority": 1,
      "reason": "",
      "category": "technical|professional|domain|soft"
    }
  ],
  "roadmapStages": [
    {
      "title": "",
      "description": "",
      "phase": "Foundation|Skill Development|Practical Experience|Interview Preparation",
      "duration": "",
      "skills": [],
      "priority": "critical|high|medium|low",
      "resources": [
        {
          "name": "",
          "type": "course|book|certification|practice|community",
          "url": ""
        }
      ]
    }
  ],
  "recommendedProjects": [
    {
      "title": "",
      "description": "",
      "skills": [],
      "difficulty": "beginner|intermediate|advanced",
      "estimatedTime": "",
      "impact": ""
    }
  ],
  "recommendedCertifications": [
    {
      "name": "",
      "provider": "",
      "relevance": "",
      "priority": "critical|high|medium|low",
      "estimatedCost": "",
      "estimatedTime": ""
    }
  ],
  "interviewPreparation": {
    "topics": [],
    "commonQuestions": [],
    "technicalAreas": [],
    "preparationTips": []
  },
  "timeline": [
    {
      "phase": "",
      "duration": "",
      "focus": "",
      "milestones": []
    }
  ]
}

IMPORTANT: Ensure the roadmap is comprehensive, actionable, and specific to
the target role and industry. Provide 4-8 roadmap stages, 3-6 projects,
3-6 certifications, and a realistic timeline.
`;

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",

    messages: [
      {
        role: "system",
        content:
          "You are an expert career advisor specializing in creating personalized professional development roadmaps across all industries. Always return valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],

    temperature: 0.4,

    response_format: {
      type: "json_object",
    },
  });

  const content = completion.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI returned an empty response for career roadmap");
  }

  try {
    const roadmapData = JSON.parse(content);

    // Validate required fields
    if (!roadmapData.careerSummary) {
      roadmapData.careerSummary = `Career development roadmap for ${targetRole} in ${targetIndustry}`;
    }

    if (!roadmapData.estimatedTimeline) {
      roadmapData.estimatedTimeline = "6-12 months";
    }

    if (!Array.isArray(roadmapData.currentSkills)) {
      roadmapData.currentSkills = currentSkills || [];
    }

    if (!Array.isArray(roadmapData.skillGaps)) {
      roadmapData.skillGaps = [];
    }

    if (!Array.isArray(roadmapData.roadmapStages)) {
      roadmapData.roadmapStages = [];
    }

    if (!Array.isArray(roadmapData.recommendedProjects)) {
      roadmapData.recommendedProjects = [];
    }

    if (!Array.isArray(roadmapData.recommendedCertifications)) {
      roadmapData.recommendedCertifications = [];
    }

    if (!roadmapData.interviewPreparation) {
      roadmapData.interviewPreparation = {
        topics: [],
        commonQuestions: [],
        technicalAreas: [],
        preparationTips: [],
      };
    }

    if (!Array.isArray(roadmapData.timeline)) {
      roadmapData.timeline = [];
    }

    return roadmapData;
  } catch (error) {
    console.error("Career roadmap AI JSON parsing error:", error);
    console.error("AI response:", content);

    throw new Error("AI returned invalid JSON for career roadmap");
  }
};

module.exports = {
  generateCareerRoadmap,
};
