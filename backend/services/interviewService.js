const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generate interview questions based on role, industry, and experience level
 */
const generateInterviewQuestions = async ({
  targetRole,
  targetIndustry,
  experienceLevel,
  interviewType,
  difficulty,
  numberOfQuestions,
  userSkills = [],
  userExperience = [],
}) => {
  const prompt = `
You are an expert technical recruiter and interview coach.

Your job is to generate realistic, professional interview questions.

IMPORTANT RULES:

1. Questions must be relevant to the target role and industry provided.

2. Do NOT assume this is a software engineering role unless explicitly stated.

3. Questions must work for ALL professional fields:
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

4. Interview Type meanings:
   - hr: General HR questions (motivation, culture fit, career goals)
   - technical: Role-specific technical/professional questions
   - behavioral: Past behavior and experience questions
   - role_specific: Deep dive into role requirements
   - mixed: Combination of all types

5. Difficulty meanings:
   - easy: Entry-level or basic questions
   - medium: Intermediate questions requiring some experience
   - hard: Advanced questions for experienced professionals

6. Generate exactly ${numberOfQuestions} questions.

7. Questions should be realistic and commonly asked in actual interviews.

8. Return ONLY valid JSON with no markdown formatting.

Interview Configuration:

Target Role: ${targetRole}
Target Industry: ${targetIndustry}
Experience Level: ${experienceLevel}
Interview Type: ${interviewType}
Difficulty: ${difficulty}
Number of Questions: ${numberOfQuestions}
User Skills: ${userSkills.join(", ") || "Not provided"}

Return exactly this JSON structure:

{
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "",
      "questionType": "hr|technical|behavioral|situational|role_specific",
      "difficulty": "easy|medium|hard",
      "category": "",
      "idealAnswer": ""
    }
  ]
}

IMPORTANT: 
- Questions must be appropriate for ${targetRole} in ${targetIndustry}
- Adjust technical depth based on ${experienceLevel} level
- Ensure questions match ${interviewType} interview type
- Make questions realistic and professional
`;

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",

    messages: [
      {
        role: "system",
        content:
          "You are an expert interview coach specializing in creating professional interview questions across all industries. Always return valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],

    temperature: 0.5,

    response_format: {
      type: "json_object",
    },
  });

  const content = completion.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI returned an empty response for interview questions");
  }

  try {
    const questionsData = JSON.parse(content);

    if (!Array.isArray(questionsData.questions)) {
      throw new Error("Invalid questions format");
    }

    return questionsData.questions;
  } catch (error) {
    console.error("Interview questions AI JSON parsing error:", error);
    console.error("AI response:", content);

    throw new Error("AI returned invalid JSON for interview questions");
  }
};

/**
 * Evaluate a user's answer to an interview question
 */
const evaluateAnswer = async ({
  questionText,
  questionType,
  userAnswer,
  targetRole,
  targetIndustry,
  idealAnswer,
}) => {
  const prompt = `
You are an expert interview evaluator and career coach.

Your job is to evaluate a candidate's interview answer and provide constructive feedback.

IMPORTANT RULES:

1. Be constructive and encouraging while being honest.

2. Evaluate based on:
   - Relevance to the question
   - Clarity of communication
   - Technical/professional accuracy (if applicable)
   - Structure and organization
   - Examples and specifics provided
   - Confidence and professionalism

3. Provide specific, actionable feedback.

4. Score on a scale of 0-10.

5. Return ONLY valid JSON with no markdown formatting.

Question:
${questionText}

Question Type: ${questionType}
Target Role: ${targetRole}
Target Industry: ${targetIndustry}

Candidate's Answer:
${userAnswer}

${idealAnswer ? `Ideal Answer Reference:\n${idealAnswer}` : ""}

Return exactly this JSON structure:

{
  "score": 0-10,
  "feedback": "",
  "strengths": [],
  "improvements": [],
  "followUpQuestion": ""
}

IMPORTANT:
- Be fair and balanced in evaluation
- Provide 2-4 strengths if answer is decent
- Provide 2-4 improvement suggestions
- Score should reflect answer quality honestly
- Follow-up question should dig deeper or clarify
`;

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",

    messages: [
      {
        role: "system",
        content:
          "You are an expert interview evaluator providing constructive feedback to help candidates improve. Always return valid JSON.",
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
    throw new Error("AI returned an empty response for answer evaluation");
  }

  try {
    const evaluation = JSON.parse(content);

    // Validate and normalize score
    if (typeof evaluation.score !== "number") {
      evaluation.score = 5;
    }

    evaluation.score = Math.min(10, Math.max(0, evaluation.score));

    if (!evaluation.feedback) {
      evaluation.feedback = "Answer received and reviewed.";
    }

    if (!Array.isArray(evaluation.strengths)) {
      evaluation.strengths = [];
    }

    if (!Array.isArray(evaluation.improvements)) {
      evaluation.improvements = [];
    }

    if (!evaluation.followUpQuestion) {
      evaluation.followUpQuestion = "";
    }

    return evaluation;
  } catch (error) {
    console.error("Answer evaluation AI JSON parsing error:", error);
    console.error("AI response:", content);

    throw new Error("AI returned invalid JSON for answer evaluation");
  }
};

/**
 * Generate overall interview evaluation
 */
const generateOverallEvaluation = async ({
  targetRole,
  targetIndustry,
  questions,
  averageScore,
}) => {
  const answeredQuestions = questions.filter((q) => q.answered);

  const questionsAndAnswers = answeredQuestions
    .map(
      (q) => `
Q${q.questionNumber}: ${q.questionText}
A: ${q.userAnswer}
Score: ${q.score}/10
`
    )
    .join("\n");

  const prompt = `
You are an expert interview evaluator.

Your job is to provide an overall evaluation of a candidate's interview performance.

Target Role: ${targetRole}
Target Industry: ${targetIndustry}
Average Score: ${averageScore.toFixed(1)}/10
Questions Answered: ${answeredQuestions.length}

Interview Q&A:
${questionsAndAnswers}

Provide a comprehensive overall evaluation.

Return exactly this JSON structure:

{
  "overallFeedback": "",
  "strengths": [],
  "weaknesses": [],
  "recommendedTopics": [],
  "improvementSuggestions": [],
  "performanceBreakdown": {
    "communication": 0-10,
    "technicalKnowledge": 0-10,
    "problemSolving": 0-10,
    "clarity": 0-10,
    "relevance": 0-10
  }
}

IMPORTANT:
- Overall feedback should be 2-3 sentences
- Provide 3-5 key strengths
- Provide 3-5 areas for improvement
- Recommend 4-6 topics to study
- Provide 3-5 actionable improvement suggestions
- Performance breakdown should reflect actual performance
- Be constructive and encouraging while honest
`;

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",

    messages: [
      {
        role: "system",
        content:
          "You are an expert interview evaluator providing comprehensive performance reviews. Always return valid JSON.",
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
    throw new Error("AI returned an empty response for overall evaluation");
  }

  try {
    const evaluation = JSON.parse(content);

    // Validate fields
    if (!evaluation.overallFeedback) {
      evaluation.overallFeedback = "Interview performance reviewed.";
    }

    if (!Array.isArray(evaluation.strengths)) {
      evaluation.strengths = [];
    }

    if (!Array.isArray(evaluation.weaknesses)) {
      evaluation.weaknesses = [];
    }

    if (!Array.isArray(evaluation.recommendedTopics)) {
      evaluation.recommendedTopics = [];
    }

    if (!Array.isArray(evaluation.improvementSuggestions)) {
      evaluation.improvementSuggestions = [];
    }

    if (!evaluation.performanceBreakdown) {
      evaluation.performanceBreakdown = {
        communication: 5,
        technicalKnowledge: 5,
        problemSolving: 5,
        clarity: 5,
        relevance: 5,
      };
    }

    // Normalize scores
    Object.keys(evaluation.performanceBreakdown).forEach((key) => {
      const value = evaluation.performanceBreakdown[key];
      if (typeof value !== "number") {
        evaluation.performanceBreakdown[key] = 5;
      } else {
        evaluation.performanceBreakdown[key] = Math.min(10, Math.max(0, value));
      }
    });

    return evaluation;
  } catch (error) {
    console.error("Overall evaluation AI JSON parsing error:", error);
    console.error("AI response:", content);

    throw new Error("AI returned invalid JSON for overall evaluation");
  }
};

module.exports = {
  generateInterviewQuestions,
  evaluateAnswer,
  generateOverallEvaluation,
};
