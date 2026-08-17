const express = require("express");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator");
const Groq = require("groq-sdk");
const fs = require("fs");

const Resume = require("../models/Resume");
const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const extractResumeText = require("../services/resumeParser");

const router = express.Router();

// ======================================================
// GROQ AI
// ======================================================

const groq = process.env.GROQ_API_KEY
  ? new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })
  : null;

const GROQ_MODEL =
  process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

// ======================================================
// SKILL ALIASES
// ======================================================

const skillAliases = {
  js: "javascript",
  javascript: "javascript",

  ts: "typescript",
  typescript: "typescript",

  python: "python",
  java: "java",

  "c++": "c++",
  cpp: "c++",

  "c#": "c#",
  csharp: "c#",
  "c sharp": "c#",

  react: "react",
  reactjs: "react",
  "react js": "react",
  "react.js": "react",

  angular: "angular",

  vue: "vue",
  vuejs: "vue",
  "vue js": "vue",

  html: "html",
  html5: "html",

  css: "css",
  css3: "css",

  tailwind: "tailwind",
  "tailwind css": "tailwind",

  bootstrap: "bootstrap",

  node: "node.js",
  nodejs: "node.js",
  "node js": "node.js",
  "node.js": "node.js",

  express: "express",
  expressjs: "express",
  "express js": "express",
  "express.js": "express",

  django: "django",
  flask: "flask",
  spring: "spring",

  mongodb: "mongodb",
  mongo: "mongodb",
  "mongo db": "mongodb",

  mysql: "mysql",
  "my sql": "mysql",

  postgresql: "postgresql",
  postgres: "postgresql",
  "postgre sql": "postgresql",

  sql: "sql",

  api: "api",
  apis: "api",

  rest: "rest api",
  "rest api": "rest api",
  restapi: "rest api",
  "rest apis": "rest api",
  "restful api": "rest api",
  "restful apis": "rest api",

  graphql: "graphql",

  git: "git",

  github: "github",
  "git hub": "github",

  docker: "docker",
  kubernetes: "kubernetes",

  aws: "aws",
  "amazon web services": "aws",

  azure: "azure",
  "microsoft azure": "azure",

  gcp: "gcp",
  "google cloud": "gcp",

  firebase: "firebase",

  excel: "excel",
  "microsoft excel": "excel",

  tableau: "tableau",

  powerbi: "power bi",
  "power bi": "power bi",

  "machine learning": "machine learning",
  ml: "machine learning",

  "artificial intelligence": "artificial intelligence",
  ai: "artificial intelligence",

  "data analysis": "data analysis",
  dataanalysis: "data analysis",

  "natural language processing": "natural language processing",
  nlp: "natural language processing",

  pandas: "pandas",
  numpy: "numpy",
  tensorflow: "tensorflow",
  pytorch: "pytorch",

  "scikit-learn": "scikit-learn",
  sklearn: "scikit-learn",

  figma: "figma",
  photoshop: "photoshop",
  illustrator: "illustrator",

  teamwork: "teamwork",
  collaboration: "collaboration",
  "time management": "time management",
  leadership: "leadership",
  communication: "communication",
  "project management": "project management",
  "problem solving": "problem solving",
  analysis: "analysis",

  marketing: "marketing",
  sales: "sales",
  accounting: "accounting",
  finance: "finance",
  recruiting: "recruiting",

  hr: "human resources",
  "human resources": "human resources",
};

// ======================================================
// NORMALIZE TEXT
// ======================================================

const normalizeText = (text) => {
  if (!text) return "";

  return String(text)
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// ======================================================
// NORMALIZE SKILL
// ======================================================

const normalizeSkill = (skill) => {
  if (!skill) return "";

  const cleaned = String(skill)
    .toLowerCase()
    .trim()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ");

  return skillAliases[cleaned] || cleaned;
};

// ======================================================
// ESCAPE REGEX
// ======================================================

const escapeRegex = (value) => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

// ======================================================
// CHECK SKILL IN TEXT
// ======================================================

const containsSkill = (text, skill) => {
  if (!text || !skill) return false;

  const normalizedText = normalizeText(text);
  const normalizedSkill = normalizeSkill(skill);

  if (!normalizedSkill) return false;

  const aliases = Object.entries(skillAliases)
    .filter(([, value]) => value === normalizedSkill)
    .map(([key]) => key);

  if (!aliases.includes(normalizedSkill)) {
    aliases.push(normalizedSkill);
  }

  return aliases.some((alias) => {
    const escapedAlias = escapeRegex(alias).replace(
      /\ /g,
      "\\s+"
    );

    const regex = new RegExp(
      "(^|[^a-z0-9+#.])" +
        escapedAlias +
        "([^a-z0-9+#.]|$)",
      "i"
    );

    return regex.test(normalizedText);
  });
};

// ======================================================
// SKILL DEFINITIONS
// ======================================================

const skillDefinitions = {
  javascript: ["javascript", "js"],
  typescript: ["typescript", "ts"],
  python: ["python"],
  java: ["java"],

  "c++": ["c++", "cpp"],
  "c#": ["c#", "csharp", "c sharp"],

  react: [
    "react",
    "reactjs",
    "react js",
    "react.js",
  ],

  angular: ["angular"],

  vue: [
    "vue",
    "vuejs",
    "vue js",
  ],

  html: ["html", "html5"],
  css: ["css", "css3"],

  tailwind: [
    "tailwind",
    "tailwind css",
  ],

  bootstrap: ["bootstrap"],

  "node.js": [
    "node",
    "nodejs",
    "node js",
    "node.js",
  ],

  express: [
    "express",
    "expressjs",
    "express js",
    "express.js",
  ],

  django: ["django"],
  flask: ["flask"],
  spring: ["spring"],

  mongodb: [
    "mongodb",
    "mongo",
    "mongo db",
  ],

  mysql: [
    "mysql",
    "my sql",
  ],

  postgresql: [
    "postgresql",
    "postgres",
    "postgre sql",
  ],

  sql: ["sql"],

  "rest api": [
    "rest",
    "rest api",
    "restapi",
    "rest apis",
    "restful api",
    "restful apis",
  ],

  api: [
    "api",
    "apis",
  ],

  graphql: ["graphql"],

  git: ["git"],

  github: [
    "github",
    "git hub",
  ],

  docker: ["docker"],
  kubernetes: ["kubernetes"],

  aws: [
    "aws",
    "amazon web services",
  ],

  azure: [
    "azure",
    "microsoft azure",
  ],

  gcp: [
    "gcp",
    "google cloud",
  ],

  firebase: ["firebase"],

  excel: [
    "excel",
    "microsoft excel",
  ],

  tableau: ["tableau"],

  "power bi": [
    "power bi",
    "powerbi",
  ],

  "machine learning": [
    "machine learning",
    "ml",
  ],

  "artificial intelligence": [
    "artificial intelligence",
    "ai",
  ],

  "data analysis": [
    "data analysis",
    "dataanalysis",
  ],

  "natural language processing": [
    "natural language processing",
    "nlp",
  ],

  pandas: ["pandas"],
  numpy: ["numpy"],
  tensorflow: ["tensorflow"],
  pytorch: ["pytorch"],

  "scikit-learn": [
    "scikit-learn",
    "scikit learn",
    "sklearn",
  ],

  figma: ["figma"],
  photoshop: ["photoshop"],
  illustrator: ["illustrator"],

  teamwork: ["teamwork"],
  collaboration: ["collaboration"],
  "time management": ["time management"],
  leadership: ["leadership"],
  communication: ["communication"],

  "project management": [
    "project management",
  ],

  "problem solving": [
    "problem solving",
    "problem-solving",
  ],

  analysis: [
    "analysis",
    "analytical",
  ],

  marketing: ["marketing"],
  sales: ["sales"],
  accounting: ["accounting"],
  finance: ["finance"],
  recruiting: ["recruiting"],

  "human resources": [
    "human resources",
    "hr",
  ],
};

// ======================================================
// DETECT SKILLS
// ======================================================

const detectSkills = (text) => {
  const detected = [];

  Object.entries(skillDefinitions).forEach(
    ([canonicalSkill, aliases]) => {
      const found = aliases.some((alias) =>
        containsSkill(text, alias)
      );

      if (found) {
        detected.push(canonicalSkill);
      }
    }
  );

  return [...new Set(detected)];
};

// ======================================================
// STOP WORDS
// ======================================================

const genericStopWords = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "if",
  "for",
  "with",
  "from",
  "into",
  "within",
  "across",
  "through",
  "about",
  "over",
  "under",
  "between",
  "during",
  "after",
  "before",
  "without",
  "against",
  "via",

  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "will",
  "would",
  "could",
  "should",
  "can",
  "may",
  "must",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",

  "job",
  "role",
  "position",
  "company",
  "organization",
  "candidate",
  "candidates",
  "employee",
  "employees",

  "professional",
  "professionals",
  "responsibility",
  "responsibilities",
  "requirement",
  "requirements",
  "required",
  "preferred",

  "experience",
  "experienced",

  "knowledge",
  "ability",
  "abilities",
  "skill",
  "skills",

  "strong",
  "good",
  "excellent",
  "great",

  "years",
  "year",

  "looking",
  "seeking",
  "work",
  "working",
  "works",

  "build",
  "building",
  "built",
  "develop",
  "developing",
  "development",
  "developed",

  "create",
  "creating",
  "created",

  "manage",
  "managing",
  "managed",

  "support",
  "supporting",

  "provide",
  "providing",

  "use",
  "using",
  "used",

  "based",
  "including",
  "include",

  "ensure",
  "ensuring",

  "help",
  "helping",

  "various",
  "related",
  "relevant",

  "resume",
  "cv",
  "profile",
  "career",
  "etc",
  "also",
  "such",
  "like",

  "full",
  "stack",
]);

// ======================================================
// PROTECTED KEYWORDS
// ======================================================

const protectedKeywords = new Set([
  "pandas",
  "analysis",
  "analytics",
  "business",
  "process",
  "css",
  "express",
  "typescript",
  "javascript",
  "python",
  "java",
  "html",
  "github",
  "git",
  "aws",
  "sql",
  "apis",
  "sales",
  "human resources",
]);

// ======================================================
// NORMALIZE KEYWORD
// ======================================================

const normalizeKeyword = (word) => {
  if (!word) return "";

  let normalized = String(word)
    .toLowerCase()
    .trim()
    .replace(
      /^[^a-z0-9+#.-]+|[^a-z0-9+#.-]+$/gi,
      ""
    );

  if (!normalized) return "";

  if (
    normalized === "node.j" ||
    normalized === "node.js" ||
    normalized === "nodejs"
  ) {
    return "node.js";
  }

  if (
    normalized === "react.js" ||
    normalized === "reactjs"
  ) {
    return "react";
  }

  if (
    normalized === "express.js" ||
    normalized === "expressjs"
  ) {
    return "express";
  }

  if (
    normalized === "mongodb" ||
    normalized === "mongo"
  ) {
    return "mongodb";
  }

  if (normalized === "apis") {
    return "api";
  }

  if (!protectedKeywords.has(normalized)) {
    if (
      normalized.endsWith("ies") &&
      normalized.length > 4
    ) {
      normalized =
        normalized.slice(0, -3) + "y";
    }
  }

  return normalized;
};

// ======================================================
// CANONICALIZE KEYWORD
// ======================================================

const canonicalizeKeyword = (keyword) => {
  const normalized =
    normalizeKeyword(keyword);

  if (!normalized) return "";

  return (
    skillAliases[normalized] ||
    normalized
  );
};

// ======================================================
// CHECK GENERIC KEYWORD
// ======================================================

const containsKeyword = (text, keyword) => {
  if (!text || !keyword) return false;

  const canonical =
    canonicalizeKeyword(keyword);

  if (!canonical) return false;

  if (skillDefinitions[canonical]) {
    return containsSkill(
      text,
      canonical
    );
  }

  const normalizedText =
    normalizeText(text);

  const escaped =
    escapeRegex(canonical).replace(
      /\ /g,
      "\\s+"
    );

  const regex = new RegExp(
    "(^|[^a-z0-9])" +
      escaped +
      "([^a-z0-9]|$)",
    "i"
  );

  return regex.test(normalizedText);
};

// ======================================================
// EXTRACT JOB KEYWORDS
// ======================================================

const extractJobKeywords = (
  jobDescription
) => {
  if (!jobDescription) return [];

  const text =
    normalizeText(jobDescription);

  const detectedSkills =
    detectSkills(text);

  const keywords = [
    ...detectedSkills,
  ];

  const words = text
    .replace(
      /[.,!?;:()[\]{}"'`/\\]/g,
      " "
    )
    .split(/\s+/)
    .map(normalizeKeyword)
    .filter(Boolean);

  words.forEach((word) => {
    if (word.length < 3) return;

    if (
      genericStopWords.has(word)
    ) {
      return;
    }

    if (skillAliases[word]) {
      return;
    }

    if (
      /^\d+$/.test(word) ||
      word.includes("@")
    ) {
      return;
    }

    keywords.push(
      canonicalizeKeyword(word)
    );
  });

  return [
    ...new Set(
      keywords.filter((keyword) => {
        if (!keyword) return false;

        if (
          keyword.includes("experience")
        ) {
          return false;
        }

        if (
          /^[0-9]+$/.test(keyword)
        ) {
          return false;
        }

        return true;
      })
    ),
  ].slice(0, 40);
};

// ======================================================
// DETECT SECTIONS
// ======================================================

const detectSections = (text) => {
  const normalized =
    normalizeText(text);

  const sections = [
    {
      label: "Contact Information",
      keywords: [
        "email",
        "phone",
        "linkedin",
        "github",
      ],
    },

    {
      label: "Professional Summary",
      keywords: [
        "summary",
        "professional summary",
        "profile",
        "objective",
        "career objective",
      ],
    },

    {
      label: "Experience",
      keywords: [
        "experience",
        "work experience",
        "employment",
        "internship",
        "internships",
      ],
    },

    {
      label: "Education",
      keywords: [
        "education",
        "university",
        "college",
        "bachelor",
        "master",
        "degree",
        "school",
      ],
    },

    {
      label: "Projects",
      keywords: [
        "projects",
        "project",
      ],
    },

    {
      label: "Skills",
      keywords: [
        "skills",
        "technical skills",
        "technologies",
        "core competencies",
      ],
    },

    {
      label: "Certifications",
      keywords: [
        "certification",
        "certifications",
        "certificate",
        "certificates",
      ],
    },

    {
      label: "Achievements",
      keywords: [
        "achievement",
        "achievements",
        "awards",
        "award",
      ],
    },

    {
      label: "Interests",
      keywords: [
        "interests",
        "hobbies",
      ],
    },
  ];

  return sections
    .filter((section) =>
      section.keywords.some(
        (keyword) =>
          normalized.includes(keyword)
      )
    )
    .map(
      (section) => section.label
    );
};

// ======================================================
// SAFE ARRAY HELPER
// ======================================================

const cleanStringArray = (
  value,
  limit = 6
) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value
        .filter(
          (item) =>
            typeof item === "string"
        )
        .map((item) =>
          item.trim()
        )
        .filter(Boolean)
    ),
  ].slice(0, limit);
};

// ======================================================
// SAFE GROQ JSON PARSER
// ======================================================

const parseGroqJSON = (content) => {
  if (!content) {
    throw new Error(
      "Groq returned an empty response"
    );
  }

  let cleaned = String(content).trim();

  // Remove markdown code fences if Groq
  // unexpectedly returns them.
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // First attempt
  try {
    return JSON.parse(cleaned);
  } catch (firstError) {
    // Try extracting the JSON object
    // from surrounding text.
    const firstBrace =
      cleaned.indexOf("{");

    const lastBrace =
      cleaned.lastIndexOf("}");

    if (
      firstBrace !== -1 &&
      lastBrace !== -1 &&
      lastBrace > firstBrace
    ) {
      const possibleJSON =
        cleaned.slice(
          firstBrace,
          lastBrace + 1
        );

      try {
        return JSON.parse(
          possibleJSON
        );
      } catch (secondError) {
        throw new Error(
          "Groq returned invalid JSON"
        );
      }
    }

    throw new Error(
      "Groq returned invalid JSON"
    );
  }
};

// ======================================================
// GROQ AI RESUME ANALYSIS
// STEP 7.6
// ======================================================

const generateAIResumeAnalysis =
  async (resumeText) => {
    // During tests we avoid calling external AI services and return a safe stub.
    if (process.env.NODE_ENV === "test") {
      return {
        available: false,
        model: GROQ_MODEL,
        message: "AI analysis disabled in test mode",
      };
    }
    if (!groq) {
      return {
        available: false,
        model: GROQ_MODEL,
        message:
          "Groq AI is not configured. Add GROQ_API_KEY to backend/.env",
      };
    }

    const limitedResumeText =
      String(resumeText)
        .trim()
        .slice(0, 18000);

    const prompt = `
You are an expert universal resume and career analyst.

Analyze ONLY the resume provided below.

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

5. Strengths MUST be based on evidence actually present in THIS resume.

6. Do NOT use generic strengths.

BAD:
"Strong professional skills."

BAD:
"Good technical background."

BAD:
"Strong breadth of professional skills."

GOOD:
"Demonstrates experience with Java, Python, and JavaScript through the technical skills and project work listed in the resume."

GOOD:
"Participation in hackathons demonstrates exposure to collaborative problem-solving and practical project development."

7. Every strength should explain WHY it is a strength.

8. Return 3 to 6 specific strengths.

9. Return 3 to 6 weaknesses.

10. Return 3 to 6 actionable improvements.

11. Keep all statements concise but meaningful.

12. Return ONLY valid JSON.

13. Do NOT return markdown.

14. Do NOT return code fences.

15. Do NOT include explanations outside JSON.

Required JSON structure:

{
  "professionalSummary": "string",
  "careerDirection": "string",
  "overallAssessment": "string",
  "strengths": [
    "string"
  ],
  "weaknesses": [
    "string"
  ],
  "improvements": [
    "string"
  ],
  "skillsAssessment": {
    "technicalSkills": [
      "string"
    ],
    "professionalSkills": [
      "string"
    ],
    "domainSkills": [
      "string"
    ],
  "skillInsights": [
    {
      "skill": "string",
      "category": "technical | professional | domain",
      "evidence": "string",
      "importance": "high | medium | low",
      "confidence": "high | medium | low"
    }
  ],
  "skillGaps": [
    "string"
  ]
},
  },
  "experienceAssessment": "string",
  "educationAssessment": "string",
  "atsRecommendations": [
    "string"
  ],
  "recommendedRoles": [
    "string"
  ]
}

==================================================
STRENGTHS REQUIREMENT
==================================================

Return 3 to 6 strengths.

Each strength MUST:

- Be supported by information in the resume.
- Mention concrete evidence where possible.
- Be relevant to the candidate's profession.
- Explain the significance of the evidence.
- Avoid generic compliments.
- Never invent information.

==================================================
WEAKNESSES REQUIREMENT
==================================================

Return 3 to 6 weaknesses.

Each weakness must be based on something genuinely missing,
limited, unclear, or weak in the resume.

Do not invent weaknesses.

==================================================
IMPROVEMENT REQUIREMENT
==================================================

Return 3 to 6 actionable improvements.

Each improvement must tell the candidate WHAT to do.

BAD:
"Improve your resume."

GOOD:
"Add measurable outcomes to project descriptions where possible so recruiters can understand the impact of the work."

==================================================
SKILLS REQUIREMENT
==================================================

Separate skills into:

technicalSkills
professionalSkills
domainSkills

Do not assume that all candidates have technical skills.

==================================================
AI-POWERED SKILL INSIGHTS
==================================================

Analyze the skills demonstrated by the candidate.

For every important skill identified from the resume:

1. Identify the skill name.
2. Classify it as:
   - technical
   - professional
   - domain

3. Provide evidence from the resume explaining why
   the skill is considered present.

4. Assign importance:
   - high
   - medium
   - low

5. Assign confidence:
   - high
   - medium
   - low

IMPORTANT:

- Evidence MUST come from the resume.
- NEVER invent skill experience.
- Do not assume proficiency merely because a technology
  appears once unless the resume provides supporting context.
- Do not claim advanced proficiency unless the resume
  provides evidence.
- Do not assume technical skills for non-technical professions.
- Professional and domain skills should also be considered.
- Skill insights must be relevant to the candidate's actual field.

Also identify realistic skill gaps.

Skill gaps should represent skills that would reasonably
strengthen the candidate's apparent career direction.

Do not list random skills.

For example:

If a candidate clearly demonstrates software development
but has no database or cloud exposure, database/cloud skills
may be reasonable skill gaps.

For a finance candidate, relevant gaps might instead include
financial modelling, Excel, SQL, or financial analysis,
but ONLY when supported by the candidate's career direction.

Return 3 to 10 skill insights.

Return up to 8 skill gaps.


==================================================
CAREER DIRECTION & RECOMMENDED ROLES
==================================================

Analyze the candidate's career direction based ONLY on evidence
present in the resume.

Consider:

- Education
- Degree or qualification
- Work experience
- Internship experience
- Projects
- Skills
- Certifications
- Achievements
- Domain knowledge
- Professional skills
- Tools and technologies explicitly mentioned

IMPORTANT:

1. NEVER assume the candidate belongs to software/IT.

2. Career recommendations must work for ANY profession.

Examples include:

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
- Other professional fields

3. Recommend ONLY roles supported by evidence in the resume.

4. NEVER invent qualifications.

5. NEVER recommend a role that normally requires a qualification
that the candidate clearly does not have.

6. If the candidate is a student or has limited professional
experience, prefer:

- Intern
- Trainee
- Junior
- Entry-level
- Assistant

roles where appropriate.

7. If substantial professional experience is present, recommendations
may include more advanced roles when supported by the resume.

8. Do not recommend more than 6 roles.

9. Do not recommend fewer than 3 roles unless the resume genuinely
does not contain enough information to support three realistic roles.

10. Recommended roles must be specific.

BAD:
"Technology Job"

BAD:
"Business Role"

BAD:
"Management"

GOOD:
"Junior Software Developer"

GOOD:
"AI/ML Intern"

GOOD:
"Data Analyst"

GOOD:
"Financial Analyst"

GOOD:
"Marketing Coordinator"

GOOD:
"HR Assistant"

11. The careerDirection should describe the most realistic professional
direction indicated by the resume.

12. recommendedRoles should contain ONLY role names.

13. Do not add explanations inside recommendedRoles.

14. Do not invent companies or employers.

15. Do not assume a career goal that is not supported by the resume.

==================================================
CAREER RECOMMENDATION QUALITY
==================================================

Before recommending a role, internally verify:

- Is the role supported by the candidate's skills?
- Is the role supported by the candidate's education?
- Is the role consistent with the candidate's experience level?
- Is the role consistent with the candidate's domain?
- Does the candidate have enough evidence in the resume for this role?

If the answer is NO, do not recommend that role.
==================================================
RESUME
==================================================

${limitedResumeText}
`;

    try {
      const completion =
        await groq.chat.completions.create({
          model: GROQ_MODEL,

          messages: [
            {
              role: "system",
              content:
                "You are a professional universal resume and career analyst. Analyze only the supplied resume, never invent information, support recommendations with resume evidence, and return only valid JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],

          temperature: 0.2,

          max_tokens: 3000,

          response_format: {
            type: "json_object",
          },
        });

      const content =
        completion
          .choices?.[0]
          ?.message?.content;

      const parsed =
        parseGroqJSON(content);

      return {
        available: true,
        model: GROQ_MODEL,

        professionalSummary:
          typeof parsed.professionalSummary ===
          "string"
            ? parsed.professionalSummary.trim()
            : "",

        careerDirection:
          typeof parsed.careerDirection ===
          "string"
            ? parsed.careerDirection.trim()
            : "",

        overallAssessment:
          typeof parsed.overallAssessment ===
          "string"
            ? parsed.overallAssessment.trim()
            : "",

        strengths:
          cleanStringArray(
            parsed.strengths,
            6
          ),

        weaknesses:
          cleanStringArray(
            parsed.weaknesses,
            6
          ),

        improvements:
          cleanStringArray(
            parsed.improvements,
            6
          ),

        skillsAssessment: {
  technicalSkills:
    cleanStringArray(
      parsed.skillsAssessment
        ?.technicalSkills,
      20
    ),

  professionalSkills:
    cleanStringArray(
      parsed.skillsAssessment
        ?.professionalSkills,
      20
    ),

  domainSkills:
    cleanStringArray(
      parsed.skillsAssessment
        ?.domainSkills,
      20
    ),

  skillInsights:
    Array.isArray(
      parsed.skillsAssessment
        ?.skillInsights
    )
      ? parsed.skillsAssessment.skillInsights
          .filter(
            (item) =>
              item &&
              typeof item === "object" &&
              typeof item.skill === "string"
          )
          .map((item) => ({
            skill:
              item.skill.trim(),

            category:
              typeof item.category === "string"
                ? item.category.trim().toLowerCase()
                : "technical",

            evidence:
              typeof item.evidence === "string"
                ? item.evidence.trim()
                : "",

            importance:
              typeof item.importance === "string"
                ? item.importance.trim().toLowerCase()
                : "medium",

            confidence:
              typeof item.confidence === "string"
                ? item.confidence.trim().toLowerCase()
                : "medium",
          }))
          .filter(
            (item) =>
              item.skill &&
              item.evidence
          )
          .slice(0, 10)
      : [],

  skillGaps:
    cleanStringArray(
      parsed.skillsAssessment
        ?.skillGaps,
      8
    ),
},
        experienceAssessment:
          typeof parsed.experienceAssessment ===
          "string"
            ? parsed.experienceAssessment.trim()
            : "",

        educationAssessment:
          typeof parsed.educationAssessment ===
          "string"
            ? parsed.educationAssessment.trim()
            : "",

        atsRecommendations:
          cleanStringArray(
            parsed.atsRecommendations,
            6
          ),

        recommendedRoles:
          cleanStringArray(
            parsed.recommendedRoles,
            8
          ),
      };
    } catch (error) {
      console.error(
        "Groq AI analysis error:",
        error.message
      );

      return {
        available: false,
        model: GROQ_MODEL,
        message:
          "Groq AI analysis temporarily unavailable",
      };
    }
  };

// ======================================================
// UPLOAD RESUME
// ======================================================

router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),

  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Please upload a PDF or DOCX resume",
        });
      }

      const extractedText =
        await extractResumeText(
          req.file.path,
          req.file.mimetype
        );

      if (
        !extractedText ||
        !String(extractedText).trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Could not extract text from the uploaded resume",
        });
      }

      const resume =
        await Resume.create({
          user: req.user.id,

          originalName:
            req.file.originalname,

          fileName:
            req.file.filename,

          filePath:
            req.file.path,

          fileType:
            req.file.mimetype,

          fileSize:
            req.file.size,

          extractedText,

          status: "processed",
        });

      return res.status(201).json({
        success: true,

        message:
          "Resume uploaded and processed successfully",

        resume: {
          id: resume._id,

          originalName:
            resume.originalName,

          fileName:
            resume.fileName,

          fileType:
            resume.fileType,

          fileSize:
            resume.fileSize,

          status:
            resume.status,

          extractedTextLength:
            extractedText.length,
        },
      });
    } catch (error) {
      console.error(
        "Resume processing error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while processing resume",
        // Do not expose internal error details to clients
      });
    }
  }
);

// ======================================================
// ANALYZE RESUME
// ======================================================

router.post(
  "/:id/analyze",
  [
    check("id").custom((value, { req }) => {
      // validate via mongoose in handler as well; this ensures basic format
      if (!value || !String(value).trim()) throw new Error("Resume ID is required");
      return true;
    }),
  ],
  authMiddleware,

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      // Get the ID directly from the URL
      const resumeId = String(req.params.id || "").trim();

      console.log("======================================");
      console.log("ANALYZE REQUEST");
      console.log("req.params.id:", req.params.id);
      console.log("resumeId:", resumeId);
      console.log(
        "isValidObjectId:",
        mongoose.isValidObjectId(resumeId)
      );
      console.log("user:", req.user?.id);
      console.log("======================================");

      if (!resumeId) {
        return res.status(400).json({
          success: false,
          message: "Resume ID is required",
        });
      }

      if (!mongoose.isValidObjectId(resumeId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid resume ID",
          receivedId: resumeId,
        });
      }

      const resume =
        await Resume.findOne({
          _id: resumeId,
          user: req.user.id,
        });

      if (!resume) {
        return res.status(404).json({
          success: false,
          message:
            "Resume not found",
        });
      }

      if (
        !resume.extractedText ||
        !String(
          resume.extractedText
        ).trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No extracted resume text available",
        });
      }

      // ==================================================
      // MARK PROCESSING
      // ==================================================

      resume.status = "processing";

      await resume.save();

      const originalText =
        String(
          resume.extractedText
        ).trim();

      const text =
        normalizeText(
          originalText
        );

      console.log(
        "=================================================="
      );

      console.log(
        "GROQ RESUME ANALYSIS STARTED"
      );

      console.log(
        "Resume ID:",
        resumeId
      );

      console.log(
        "Resume text length:",
        originalText.length
      );

      console.log(
        "Groq model:",
        GROQ_MODEL
      );

      // ==================================================
      // DETECT RESUME DATA
      // ==================================================

      const uniqueSkills =
        detectSkills(text);

      const detectedSections =
        detectSections(text);

      // ==================================================
      // RESUME KEYWORDS
      // ==================================================

      const resumeKeywords =
        uniqueSkills.slice(0, 20);

      // ==================================================
      // GROQ AI ANALYSIS
      // ==================================================

      const aiAnalysis =
        await generateAIResumeAnalysis(
          originalText
        );

      console.log(
        "Groq AI available:",
        aiAnalysis.available
      );

      // ==================================================
// AI SKILL INSIGHTS
// ==================================================

let skillInsights = [];
let skillGaps = [];

if (
  aiAnalysis.available &&
  aiAnalysis.skillsAssessment
) {
  skillInsights =
    Array.isArray(
      aiAnalysis.skillsAssessment
        .skillInsights
    )
      ? aiAnalysis.skillsAssessment
          .skillInsights
      : [];

  skillGaps =
    Array.isArray(
      aiAnalysis.skillsAssessment
        .skillGaps
    )
      ? aiAnalysis.skillsAssessment
          .skillGaps
      : [];
}

      // ==================================================
      // ATS SCORE
      // ==================================================

      let atsScore = 0;

      if (
        detectedSections.includes(
          "Contact Information"
        )
      ) {
        atsScore += 10;
      }

      if (
        detectedSections.includes(
          "Professional Summary"
        )
      ) {
        atsScore += 10;
      }

      if (
        detectedSections.includes(
          "Experience"
        )
      ) {
        atsScore += 15;
      }

      if (
        detectedSections.includes(
          "Education"
        )
      ) {
        atsScore += 10;
      }

      if (
        detectedSections.includes(
          "Skills"
        )
      ) {
        atsScore += 15;
      }

      if (
        detectedSections.includes(
          "Projects"
        )
      ) {
        atsScore += 10;
      }

      if (
        detectedSections.includes(
          "Certifications"
        )
      ) {
        atsScore += 5;
      }

      if (
        detectedSections.includes(
          "Achievements"
        )
      ) {
        atsScore += 5;
      }

      if (
        detectedSections.includes(
          "Interests"
        )
      ) {
        atsScore += 5;
      }

      if (
        originalText.length >= 1500
      ) {
        atsScore += 10;
      }

      atsScore =
        Math.max(
          0,
          Math.min(
            100,
            atsScore
          )
        );

      // ==================================================
      // STRENGTHS
      // ==================================================

      let strengths = [];

      if (
        aiAnalysis.available &&
        Array.isArray(
          aiAnalysis.strengths
        )
      ) {
        strengths =
          cleanStringArray(
            aiAnalysis.strengths,
            6
          );
      }

      // ==================================================
      // STRENGTH FALLBACK
      // ==================================================

      if (
        strengths.length === 0
      ) {
        if (
          uniqueSkills.length > 0
        ) {
          strengths.push(
            `The resume demonstrates identifiable professional skills, including ${uniqueSkills
              .slice(0, 6)
              .join(", ")}.`
          );
        }

        if (
          detectedSections.includes(
            "Projects"
          )
        ) {
          strengths.push(
            "The resume includes project experience that provides evidence of practical application."
          );
        }

        if (
          detectedSections.includes(
            "Experience"
          )
        ) {
          strengths.push(
            "The resume includes an experience section showing professional or practical exposure."
          );
        }

        if (
          detectedSections.includes(
            "Education"
          )
        ) {
          strengths.push(
            "The resume clearly presents an educational background."
          );
        }

        if (
          detectedSections.includes(
            "Certifications"
          )
        ) {
          strengths.push(
            "The resume includes certifications or credentials supporting the professional profile."
          );
        }

        if (
          detectedSections.includes(
            "Achievements"
          )
        ) {
          strengths.push(
            "The resume includes achievements that provide additional evidence of development or performance."
          );
        }
      }

      strengths =
        [
          ...new Set(
            strengths
              .filter(Boolean)
              .map((item) =>
                String(item).trim()
              )
          ),
        ].slice(0, 6);

      // ==================================================
      // WEAKNESSES
      // ==================================================

      let weaknesses = [];

      if (
        aiAnalysis.available &&
        Array.isArray(
          aiAnalysis.weaknesses
        )
      ) {
        weaknesses =
          cleanStringArray(
            aiAnalysis.weaknesses,
            6
          );
      }

      // ==================================================
      // IMPROVEMENTS
      // ==================================================

      let improvements = [];

      if (
        aiAnalysis.available &&
        Array.isArray(
          aiAnalysis.improvements
        )
      ) {
        improvements =
          cleanStringArray(
            aiAnalysis.improvements,
            6
          );
      }

      // ==================================================
      // IMPROVEMENT FALLBACK
      // ==================================================

      if (
        improvements.length === 0
      ) {
        improvements = [
          "Add measurable outcomes to experience or project descriptions where possible.",
          "Use clear action-oriented language to explain responsibilities and achievements.",
          "Tailor important keywords to the type of roles being targeted.",
          "Make the most relevant professional skills easy for recruiters and ATS systems to identify.",
        ];
      }

      // ==================================================
      // KEYWORDS
      // ==================================================

      let keywords = [];

      if (
        aiAnalysis.available &&
        aiAnalysis.skillsAssessment
      ) {
        keywords.push(
          ...cleanStringArray(
            aiAnalysis.skillsAssessment
              .technicalSkills,
            20
          )
        );

        keywords.push(
          ...cleanStringArray(
            aiAnalysis.skillsAssessment
              .professionalSkills,
            20
          )
        );

        keywords.push(
          ...cleanStringArray(
            aiAnalysis.skillsAssessment
              .domainSkills,
            20
          )
        );
      }

      keywords.push(
        ...resumeKeywords
      );

      keywords =
        [
          ...new Set(
            keywords
              .filter(
                (item) =>
                  typeof item === "string"
              )
              .map(
                (item) =>
                  canonicalizeKeyword(item)
              )
              .filter(Boolean)
          ),
        ].slice(0, 20);

      // ==================================================
      // SAVE ANALYSIS
      // ==================================================

      resume.atsScore =
        atsScore;

      resume.skills =
        uniqueSkills;

      resume.sections =
        detectedSections;

      resume.strengths =
        strengths;

      resume.improvements =
        improvements;

      resume.keywords =
        keywords;

      resume.status =
        "completed";

      /*
       * IMPORTANT:
       * We do NOT save `weaknesses` here because your
       * current Resume model may not contain a weaknesses
       * field. The weaknesses are still returned in the
       * API response through aiAnalysis.
       */

      await resume.save();

      console.log(
        "=================================================="
      );

      console.log(
        "GROQ ANALYSIS COMPLETED"
      );

      console.log(
        "ATS Score:",
        atsScore
      );

      console.log(
        "Skills:",
        uniqueSkills
      );

      console.log(
        "Sections:",
        detectedSections
      );

      console.log(
        "AI Strengths:",
        strengths
      );

      console.log(
        "AI Weaknesses:",
        weaknesses
      );

      console.log(
        "AI Improvements:",
        improvements
      );

      console.log(
  "Keywords:",
  keywords
);

console.log(
  "Recommended Roles:",
  aiAnalysis.recommendedRoles
);

console.log(
  "Skill Insights:",
  skillInsights
);

console.log(
  "Skill Gaps:",
  skillGaps
);

console.log(
  "Career Direction:",
  aiAnalysis.careerDirection
);

console.log(
  "=================================================="
);

      // ==================================================
      // FINAL RESPONSE
      // ==================================================

      return res.status(200).json({
        success: true,

        message:
          "Resume analyzed successfully",

        analysis: {
          resumeId:
            resume._id,

          atsScore:
            atsScore,

          skills:
            uniqueSkills,

          skillsCount:
            uniqueSkills.length,

          sections:
            detectedSections,

          sectionsCount:
            detectedSections.length,

          strengths:
            strengths,

          weaknesses:
            weaknesses,

          improvements:
            improvements,

          keywords:
            keywords,

          keywordsCount:
            keywords.length,

            skillInsights:
  skillInsights,

skillInsightsCount:
  skillInsights.length,

skillGaps:
  skillGaps,

skillGapsCount:
  skillGaps.length,

          extractedTextLength:
            originalText.length,

          status:
            "completed",

          aiAnalysis:
            aiAnalysis,
        },
      });
    } catch (error) {
      console.error(
        "Resume analysis error:",
        error
      );

      // ==================================================
      // MARK FAILED
      // ==================================================

      try {
        if (
          mongoose.isValidObjectId(
            req.params.id
          )
        ) {
          await Resume.findOneAndUpdate(
            {
              _id:
                req.params.id,

              user:
                req.user?.id,
            },
            {
              status:
                "failed",
            }
          );
        }
      } catch (updateError) {
        console.error(
          "Failed to update resume status:",
          updateError
        );
      }

      return res.status(500).json({
        success: false,

        message:
          "Resume analysis failed",
        // do not expose internal error details
      });
    }
  }
);

// ======================================================
// GET USER RESUMES
// ======================================================

router.get(
  "/",
  authMiddleware,

  async (req, res) => {
    try {
      const resumes =
        await Resume.find({
          user: req.user.id,
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,

        count:
          resumes.length,

        resumes,
      });
    } catch (error) {
      console.error(
        "Get resumes error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Server error while retrieving resumes",
      });
    }
  }
);

// ======================================================
// GET LATEST RESUME
// ======================================================

router.get(
  "/latest",
  authMiddleware,

  async (req, res) => {
    try {
      const resume =
        await Resume.findOne({
          user: req.user.id,
        }).sort({
          createdAt: -1,
        });

      if (!resume) {
        return res.status(404).json({
          success: false,

          message:
            "No resume found",
        });
      }

      return res.status(200).json({
        success: true,

        resume: {
  id: resume._id,

  originalName:
    resume.originalName,

  fileName:
    resume.fileName,

  fileType:
    resume.fileType,

  fileSize:
    resume.fileSize,

  status:
    resume.status,

  extractedTextLength:
    resume.extractedText
      ? resume.extractedText.length
      : 0,

  // ==========================================
  // BASIC AI ANALYSIS
  // ==========================================

  atsScore:
    resume.atsScore || 0,

  skills:
    resume.skills || [],

  sections:
    resume.sections || [],

  strengths:
    resume.strengths || [],

  improvements:
    resume.improvements || [],

  keywords:
    resume.keywords || [],

  // ==========================================
  // AI CAREER ANALYSIS
  // ==========================================

  professionalSummary:
    resume.professionalSummary || "",

  careerDirection:
    resume.careerDirection || "",

  overallAssessment:
    resume.overallAssessment || "",

  weaknesses:
    resume.weaknesses || [],

  experienceAssessment:
    resume.experienceAssessment || "",

  educationAssessment:
    resume.educationAssessment || "",

  atsRecommendations:
    resume.atsRecommendations || [],

  // ==========================================
  // CAREER RECOMMENDATIONS
  // ==========================================

  recommendedRoles:
    resume.recommendedRoles || [],

  // ==========================================
  // AI SKILL INSIGHTS
  // ==========================================

  skillsAssessment: {
    technicalSkills:
      resume.skillsAssessment?.technicalSkills || [],

    professionalSkills:
      resume.skillsAssessment?.professionalSkills || [],

    domainSkills:
      resume.skillsAssessment?.domainSkills || [],

    skillInsights:
      resume.skillsAssessment?.skillInsights || [],

    skillGaps:
      resume.skillsAssessment?.skillGaps || [],
  },
},
      });
    } catch (error) {
      console.error(
        "Get latest resume error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Server error while retrieving latest resume",
      });
    }
  }
);

// ======================================================
// GET SINGLE RESUME
// ======================================================

router.get(
  "/:id",
  authMiddleware,

  async (req, res) => {
    try {
      const resumeId =
        String(req.params.id || "")
          .trim();

      if (
        !mongoose.isValidObjectId(
          resumeId
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid resume ID",
        });
      }

      const resume =
        await Resume.findOne({
          _id:
            resumeId,

          user:
            req.user.id,
        });

      if (!resume) {
        return res.status(404).json({
          success: false,

          message:
            "Resume not found",
        });
      }

      return res.status(200).json({
        success: true,

        resume,
      });
    } catch (error) {
      console.error(
        "Get resume error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Server error while retrieving resume",
      });
    }
  }
);

// ======================================================
// DELETE RESUME
// ======================================================

router.delete(
  "/:id",
  authMiddleware,

  async (req, res) => {
    try {
      const resumeId =
        String(req.params.id || "")
          .trim();

      if (
        !mongoose.isValidObjectId(
          resumeId
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid resume ID",
        });
      }

      const resume =
        await Resume.findOne({
          _id:
            resumeId,

          user:
            req.user.id,
        });

      if (!resume) {
        return res.status(404).json({
          success: false,

          message:
            "Resume not found",
        });
      }

      if (
        resume.filePath &&
        fs.existsSync(
          resume.filePath
        )
      ) {
        fs.unlinkSync(
          resume.filePath
        );
      }

      await Resume.deleteOne({
        _id:
          resume._id,
      });

      return res.status(200).json({
        success: true,

        message:
          "Resume deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete resume error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Server error while deleting resume",
      });
    }
  }
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;