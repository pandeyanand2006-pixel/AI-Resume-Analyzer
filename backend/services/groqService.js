const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generateResumeContent = async (resumeData) => {
  const prompt = `
You are an expert professional resume writer, ATS optimization specialist,
and career advisor.

Your job is to improve and generate resume content based ONLY on the
candidate information provided below.

IMPORTANT RULES:

1. Do not invent companies, degrees, jobs, certifications, achievements,
   technologies, dates, responsibilities, metrics, or qualifications.

2. Never add skills simply because they are common for the target role.

3. Preserve factual information supplied by the candidate.

4. You may improve grammar, clarity, structure, professional wording,
   and ATS readability.

5. The candidate may belong to ANY professional field:
   software engineering, healthcare, finance, education, law, marketing,
   mechanical engineering, civil engineering, design, research,
   business, administration, etc.

6. Do NOT assume the candidate is a software developer.

7. Use terminology appropriate to the candidate's actual field and
   target role.

8. If information is missing, return an empty string or empty array
   instead of inventing information.

9. Use concise, professional, achievement-oriented language.

10. Do not use first-person pronouns such as "I", "me", or "my".

11. Do not include markdown formatting.

12. Return ONLY valid JSON.

Candidate information:

${JSON.stringify(resumeData, null, 2)}

Return exactly this JSON structure:

{
  "professionalSummary": "",
  "experience": [
    {
      "jobTitle": "",
      "company": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "currentlyWorking": false,
      "description": "",
      "aiDescription": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "role": "",
      "technologies": [],
      "description": "",
      "aiDescription": "",
      "link": ""
    }
  ],
  "skills": [
    {
      "name": "",
      "category": ""
    }
  ],
  "achievements": [
    {
      "title": "",
      "description": "",
      "aiDescription": "",
      "date": ""
    }
  ],
  "atsRecommendations": [],
  "recommendedKeywords": []
}
`;

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",

    messages: [
      {
        role: "system",
        content:
          "You are a professional resume writer and ATS optimization expert. Always return valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],

    temperature: 0.3,

    response_format: {
      type: "json_object",
    },
  });

  const content = completion.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq returned an empty response");
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error("Groq JSON parsing error:", error);
    console.error("Groq response:", content);

    throw new Error("Groq returned invalid JSON");
  }
};

const listGroqModels = async () => {
  try {
    const models = await groq.models.list();

    console.log("\n========== AVAILABLE GROQ MODELS ==========");

    models.data.forEach((model) => {
      console.log(model.id);
    });

    console.log("===========================================\n");

    return models.data;
  } catch (error) {
    console.error("Failed to list Groq models:", error.message);
    throw error;
  }
};

/**
 * Generate AI response for chat/text generation
 */
const generateAIResponse = async (prompt, options = {}) => {
  const {
    temperature = 0.7,
    maxTokens = 1000,
    systemMessage = "You are a helpful AI assistant."
  } = options;

  try {
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: temperature,
      max_tokens: maxTokens,
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Groq returned an empty response");
    }

    return content.trim();
  } catch (error) {
    console.error("Groq AI response error:", error);
    console.error("Error details:", error.response?.data || error.message);
    throw new Error(`AI generation failed: ${error.message}`);
  }
};

module.exports = {
  generateResumeContent,
  listGroqModels,
  generateAIResponse,
};