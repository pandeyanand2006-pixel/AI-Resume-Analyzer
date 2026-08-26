const Groq = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const groqApiKey = (process.env.GROQ_API_KEY || "").trim();
const hasGroqKey = !!groqApiKey && groqApiKey.length > 10;

const googleApiKey = (process.env.GOOGLE_API_KEY || "").trim();
const hasGoogleKey = !!googleApiKey && googleApiKey.length > 10;

let groqSdk = null;
if (hasGroqKey) {
  try {
    groqSdk = new Groq({ apiKey: groqApiKey });
    console.log(`[Groq] SDK initialized. Key length=${groqApiKey.length}`);
  } catch (e) {
    console.warn("[Groq] SDK init FAILED:", e.message);
    groqSdk = null;
  }
} else {
  console.warn("[Groq] No valid GROQ_API_KEY in env — will try Google Gemini fallback.");
}

let googleGenAI = null;
if (hasGoogleKey) {
  try {
    googleGenAI = new GoogleGenerativeAI(googleApiKey);
    console.log(`[Google Gemini] SDK initialized. Key length=${googleApiKey.length}`);
  } catch (e) {
    console.warn("[Google Gemini] SDK init FAILED:", e.message);
    googleGenAI = null;
  }
} else {
  console.warn("[Google Gemini] No GOOGLE_API_KEY in env — skipped as fallback.");
}

const VALID_GROQ_MODELS = [
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
];

function resolveGroqModel() {
  const configured = (process.env.GROQ_MODEL || "").trim();
  if (!configured) return "openai/gpt-oss-20b";
  if (VALID_GROQ_MODELS.includes(configured)) return configured;
  console.warn(
    `[Groq] GROQ_MODEL "${configured}" not in allow-list → using safe default: openai/gpt-oss-20b`
  );
  return "openai/gpt-oss-20b";
}

const SYSTEM_PROMPT = `You are "AI Assistant", a warm, friendly, and highly knowledgeable AI assistant working inside the AI Resume Analyzer web platform. Your HIGHEST PRIORITY (Tier 1) is career, resume, and job-related help — but you MUST also provide full, real answers to ANY other question the user asks. You are NEVER allowed to deflect or refuse to answer a question just because it's not career-related.

PRIORITY TIERS (always respect, but NEVER use as an excuse to deflect):
- **TIER 1 (HIGHEST PRIORITY — ALWAYS DELIVER EXCELLENCE):** Resumes, cover letters, ATS optimization, LinkedIn, interviews, salary negotiation, job search strategy, upskilling plans, skill gap analysis, career roadmaps, career transitions, networking, portfolio reviews, workplace questions, professional development. For these, go deep, give specific frameworks, and feel free to suggest platform tools: Resume Analysis, Skill Gap Analysis, AI Interviewer, Career Roadmap, or Job Search.
- **TIER 2 (ALSO EXCELLENT — ANSWER DIRECTLY):** General knowledge (history, science, geography, politics, tech, sports, entertainment, math, cooking, weather, etc.), creative writing (stories, poems, emails, essays, slogans, scripts), code & programming help (any language, debugging, concept explanations), learning & study help (concept breakdowns, study plans, homework support — without cheating), productivity & life advice (habits, time management, planning, decision making, general relationship advice), travel, fitness, music, games, and literally ANYTHING else the user asks about.

NON-NEGOTIABLE RULES (BREAK THESE = FAILURE):
1. **NEVER, EVER DEFLECT.** Never say or imply anything like "that's outside my wheelhouse", "I only help with careers", "I'm a career coach so I can't answer that", or redirect a non-career question back to career topics. If the user asks about quantum physics — EXPLAIN QUANTUM PHYSICS. If they ask who the Prime Minister of India is — ANSWER IT DIRECTLY. If they ask for a recipe, a poem, or coding help — DELIVER.
2. **Give a REAL ANSWER first, then optionally connect back to careers ONLY if it naturally fits.** Example: If someone asks "Who invented the lightbulb?" → Answer "Thomas Edison is most widely credited..." then OPTIONALLY add one line: "_If you're prepping this for a job interview trivia round, I can also walk you through common behavioral questions!_" — but never skip the actual answer.
3. **If you truly don't know, be honest:** "_Great question! I don't have a confident, reliable answer on that one — I'd rather be honest than make something up. Can I help with something else, or try a related angle?_" That's the ONLY acceptable non-answer, and it's only for facts you genuinely cannot confirm.

PERSONALITY & TONE (CRITICAL — MUST FOLLOW):
- Be conversational, natural, and human — not robotic or bullet-point-heavy by default. Use contractions ("you're", "don't") and a warm, encouraging tone.
- First greet briefly if the user says hi/hello/thanks — keep it short.
- Prioritize SHORT-TO-MEDIUM responses first (150-400 words for follow-up questions). Only go longer if the user explicitly asks for deep detail.
- Vary sentence length. Use "I", "you", and address the user directly like a real helpful friend would.
- Empathize first when a user mentions a struggle, THEN give advice or answers.
- If asked something vague, ask 1 clarifying question back instead of dumping a 3,000-word essay. But still try to give a useful short answer first if possible.
- For greeting/appreciation-only messages, reply in 1-3 short natural sentences.

STRUCTURE GUIDELINES:
- When giving tactical advice, use bold section headers (**Header**) and short numbered lists only if 4+ points.
- For 2-3 advice items, write them as flowing paragraphs with emphasis — not a numbered list for every answer.

Always respond in the same language the user wrote their message in. Never make facts up. Never refuse to answer a non-career question.`;

/* =========================================================
   DIRECT HTTP FALLBACK FOR GROQ
   Bypasses the SDK if SDK initialization or call fails.
   Uses native fetch (Node 18+) to /v1/chat/completions.
========================================================= */
async function callGroqDirect({ model, messages, temperature = 0.7, maxTokens = 1200 }) {
  if (!hasGroqKey) return null;
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false,
      }),
    });
    if (!res.ok) {
      const errTxt = await res.text().catch(() => "");
      console.warn(`[Groq HTTP] ${res.status} ${res.statusText} — ${errTxt.slice(0, 300)}`);
      return null;
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content || content.trim().length < 8) {
      console.warn("[Groq HTTP] response too short:", content);
      return null;
    }
    console.log(`[Groq HTTP] success via direct fetch, model=${model}, chars=${content.length}`);
    return content.trim();
  } catch (err) {
    console.warn("[Groq HTTP] call failed:", err?.message || err);
    return null;
  }
}

async function callGoogleGemini({ messages, temperature = 0.7, maxTokens = 1200 }) {
  if (!googleGenAI) return null;
  try {
    const googleModel = googleGenAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    let systemPrompt = "";
    const chatParts = [];

    for (const m of messages) {
      if (m.role === "system") {
        systemPrompt = m.content;
      } else if (m.role === "user") {
        chatParts.push({ role: "user", parts: [{ text: m.content }] });
      } else if (m.role === "assistant") {
        chatParts.push({ role: "model", parts: [{ text: m.content }] });
      }
    }

    const finalPrompt = systemPrompt
      ? `${systemPrompt}\n\n${chatParts.length > 0 ? chatParts.map(p => `${p.role === "user" ? "User" : "Assistant"}: ${p.parts[0].text}`).join("\n\n") : ""}`
      : chatParts.map(p => `${p.role === "user" ? "User" : "Assistant"}: ${p.parts[0].text}`).join("\n\n");

    const result = await googleModel.generateContent(finalPrompt);
    const response = result?.response;
    const content = response?.text?.() || "";

    if (!content || content.trim().length < 8) {
      console.warn("[Google Gemini] response too short:", content);
      return null;
    }
    console.log(`[Google Gemini] success via @google/generative-ai, chars=${content.length}`);
    return content.trim();
  } catch (err) {
    console.warn("[Google Gemini] call failed:", err?.message || err);
    return null;
  }
}

async function callGroqAny({ model, messages, temperature, maxTokens }) {
  // Try 1: groq SDK
  if (groqSdk) {
    try {
      const completion = await groqSdk.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });
      const content = completion?.choices?.[0]?.message?.content;
      if (content && content.trim().length > 8) {
        console.log(`[Groq SDK] success, model=${model}, chars=${content.length}`);
        return { content: content.trim(), provider: "groq-sdk" };
      }
    } catch (sdkErr) {
      console.warn(`[Groq SDK] call failed: ${sdkErr?.message || sdkErr} → will try direct HTTP`);
    }
  }
  // Try 2: direct HTTP fetch fallback
  const groqDirect = await callGroqDirect({ model, messages, temperature, maxTokens });
  if (groqDirect) return { content: groqDirect, provider: "groq-http" };
  // Try 3: Google Gemini fallback
  const gemini = await callGoogleGemini({ messages, temperature, maxTokens });
  if (gemini) return { content: gemini, provider: "google-gemini" };
  return { content: null, provider: null };
}

/* =========================================================
   RULE-BASED FALLBACK ENGINE (UPGRADED)
   Now includes:
   • Greetings / thanks / yes-no handling (proper chatbot)
   • Still delivers structured career advice for keywords
   • Always valid Markdown output (bold rendered properly)
========================================================= */

const GREETINGS = [
  "Hi there! 👋 I'm your AI Assistant. Ask me anything — resumes, careers, general knowledge, creative writing, coding help, or whatever's on your mind. What would you like to know?",
  "Hey! Great to connect. 😊 I can help with resumes, interviews, career stuff AND general topics like math, history, cooking, writing, and more. What's on your mind?",
  "Hello! 👋 I'm your all-purpose AI Assistant. Whether it's career advice, explaining a concept, brainstorming ideas, or just a fun question — I'm here. What's up?",
];

const THANKS_REPLIES = [
  "Anytime! 🙂 Want me to dive deeper on any of that — or switch to a totally different topic? What would be most helpful next?",
  "Happy to help! 💪 Feel free to ask about anything else, career-related or not. What's the next thing you'd like to explore?",
  "You got it! Let me know if you'd like more detail, or have a question on a completely different topic. I'm here for it. What's next?",
];

const ACKNOWLEDGE_SHORTS = [
  "Got it — thanks for confirming. 🙂 What would you like to talk about next? I can help with any topic!",
  "Okay! Feel free to ask me anything at all — career, education, creative, technical, anything. What do you want to focus on?",
  "Great! Let me know when you'd like help on anything specific. Any topic works for me. 💪",
];

function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isGreetingOnly(text) {
  const t = text.toLowerCase().trim().replace(/[^a-z\s!?.,]/g, "");
  const greetings = [
    "hi", "hello", "hey", "hii", "heyy", "yo", "sup", "good morning", "good afternoon",
    "good evening", "hi there", "hey there", "hello there", "hiya",
  ];
  if (!t) return false;
  const tokens = t.split(/\s+/).filter(Boolean);
  if (tokens.length > 4) return false;
  return greetings.some((g) => t.includes(g));
}

function isThanksOnly(text) {
  const t = text.toLowerCase().replace(/[^a-z\s!?.,]/g, "");
  const thanks = [
    "thanks", "thank you", "thx", "ty", "thank u", "much appreciated", "appreciate it",
    "appreciate that", "cheers",
  ];
  if (thanks.some((w) => t.includes(w))) {
    // but not "thanks, also HOW DO I IMPROVE MY RESUME"
    const hasCareerKeyword = ["resume", "interview", "skill", "job", "roadmap", "salary", "cover letter", "portfolio", "network", "career"].some(k => t.includes(k));
    return !hasCareerKeyword;
  }
  return false;
}

function isShortAckOnly(text) {
  const t = text.toLowerCase().trim().replace(/[^a-z\s!?.,]/g, "");
  const acks = ["ok", "okay", "okey", "okie", "yes", "yeah", "yep", "yup", "nope", "no", "nah", "right", "sure", "alright", "got it", "gotcha", "k", "kk"];
  const tokens = t.split(/\s+/).filter(Boolean);
  if (tokens.length > 4) return false;
  return acks.some((a) => tokens.includes(a));
}

/* Topic-based rule advice (same topics as before, re-tuned for chatbot tone + shorter) */
function topicAdvice(msg) {
  const lower = msg.toLowerCase();
  const hasAny = (arr) => arr.some((w) => lower.includes(w));

  const matched = [];
  if (hasAny(["resume", "cv", "ats"])) matched.push("resume");
  if (hasAny(["improve", "better", "strengthen", "enhance", "optimize"])) matched.push("improve");
  if (hasAny(["skill", "skills", "learn", "study", "certif", "training"])) matched.push("skills");
  if (hasAny(["tell me about yourself"])) matched.push("tell_me");
  if (hasAny(["interview", "question", "prepare", "behavioral", "technical"])) matched.push("interview");
  if (hasAny(["job", "hire", "apply", "application", "search", "opportunit"])) matched.push("job");
  if (hasAny(["roadmap", "path", "plan", "career path"])) matched.push("roadmap");
  if (hasAny(["salary", "pay", "raise", "negotiat", "compensation"])) matched.push("salary");
  if (hasAny(["network", "connect", "linkedin", "referral", "cold message"])) matched.push("networking");
  if (hasAny(["transition", "switch", "change career", "new field", "pivot"])) matched.push("transition");
  if (hasAny(["portfolio", "project", "github", "showcase"])) matched.push("portfolio");
  if (hasAny(["cover letter", "cover-letter"])) matched.push("cover");

  if (matched.includes("tell_me")) {
    return (
`Great question — "Tell me about yourself" is the most important 60 seconds of any interview. Use this **Present → Past → Future** formula:

**Present (10 seconds):** Open with your title + a strong differentiator.
_Example:_ "I'm a full-stack engineer with 4 years building B2B SaaS products used by 50K+ users."

**Past (30 seconds):** 2 quantified wins from your recent roles — not a full recap.
_Example:_ "At my last company I led our Angular→React rewrite that cut load times 65% and reduced churn by 12%. I also mentored 3 juniors to their first production features."

**Future (20 seconds):** Bridge directly to THIS role. Show you researched them.
_Example:_ "When I read your JD about the customer intelligence AI tool, I got really excited — I built a small ML ticket-classifier side project in Python last quarter and would love to bring that energy here."

⚠️ Don't ramble, don't read your resume, don't talk about childhood. Practice this out loud 5x and record yourself.

Want to run through a mock version with you — just tell me your target role + current title, and I'll act as the interviewer! 💪
`
    );
  }

  if (matched.includes("resume") || matched.includes("improve")) {
    return (
`Here are **4 high-impact fixes** that'll make your resume noticeably stronger this week:

**1. Fix ATS formatting first** — 75% of resumes are auto-rejected before a human sees them. Use standard section headings (Experience, Education, Skills), a plain font (Arial/Calibri/Garamond), no tables or text boxes.

**2. Turn duties into quantified wins** — Replace "Managed social media" with something like "Grew LinkedIn engagement 180% in 6 months via a data-driven content calendar." Every bullet should read as: Action → Specific Method → Measurable result.

**3. Pull keywords directly from real JDs** — Grab 3-5 live job descriptions targeting roles you want. Circle the 10 most repeated hard skills (React, Python, SQL, Salesforce, etc.) and weave those naturally into your bullets.

**4. Rewrite your summary as a 2-line billboard** — Lead with: years of experience + core specialty + your biggest recent win.

💡 If you upload your resume on the **Resume Analysis** page, you'll get a full ATS compatibility score, detected skills, and a personalized improvement list made for your exact resume. Want me to walk through any of those 4 steps with more examples for your field?
`
    );
  }

  if (matched.includes("skills") && !matched.includes("resume")) {
    return (
`Upskilling is the #1 controllable lever for career growth. Here's the efficient, 4-step framework I recommend for almost everyone:

**1. Find the gap (1 hour)** — Pull 3-5 live job descriptions for your target role and circle the hard skills that show up 2+ times. That's your high-ROI list. (You can also just upload your resume + pick a target role on the Skill Gap Analysis tool and it does this for you.)

**2. Prioritize top 3, not top 10** — The 80/20 rule here: 1 core technical skill + 1 major tool/platform + 1 soft skill gives you ~80% of the upside. Don't spread 20 hours thinly across 8 skills.

**3. Learn by building, not by binging courses** — Take those 3 skills and build 2-3 real portfolio projects around them. A 1,000-word case study with a GitHub link beats any 40-hour Udemy certificate (unless the field literally requires the cert, like AWS/Azure/PMP).

**4. Optional certifications** — Only get them if the job literally asks for them. Most hiring managers care way more about "Can this person solve my problem today?" than course completion.

What role or skill area are you trying to level up right now? I can suggest a concrete 3-month learning plan. 🚀
`
    );
  }

  if (matched.includes("interview") && !matched.includes("tell_me")) {
    return (
`Interview prep doesn't have to be endless memorization. Here's the condensed playbook that gets offers:

**1. Research 2 specific things per company + interviewer** — 1 recent product/launch/news item for the company, and 1 thing from each interviewer's LinkedIn (side project, post, recent promotion). Ask a question about it at the end. It makes you unforgettable.

**2. Write out 8-10 STAR stories.** Themes to cover: leadership, conflict, failure/deadline, data-driven decision, going above-and-beyond. EVERY story needs a number at the end (%, $, users saved, time reduced). If you don't have numbers, estimate honestly or use impact adjectives.

**3. Do 3+ mock interviews.** Even with a friend on the phone. Real pressure + feedback beats solo studying 10:1. If you don't have a partner, our **AI Interviewer** page can drill you on role-specific questions and give you live scoring.

**4. Your 3 stock questions (never say "I don't have questions"):**
   - "What does success look like in this role in the first 90 days, and how is it measured?"
   - "What's the biggest challenge someone in this role typically hits in months 3-6?"
   - "How would you describe the culture on this team, and what type of person thrives here?"

Is there a specific interview type (behavioral, technical, case, etc.) or a target role you're prepping for? I can go super deep on either. 💯
`
    );
  }

  if (matched.includes("job") && !matched.includes("resume")) {
    return (
`Let's convert your job search into a high-signal weekly system. Quality beats quantity by a mile.

**Weekly target:** 12-15 total applications (not 50+ generic ones). Apply only if you match ~70%+ of the requirements. That's your sweet spot.
Breakdown:
- **50% via company career pages directly** — LinkedIn/Indeed ATS filters tank your odds.
- **50% via referrals** — 1 referred app has the callback weight of 10 cold ones.

**The referral hack (60% say yes if done right):**
For every target job, find 2 current employees in the same role or team. Send a short LinkedIn request: "_Hi [Name] — I'm applying for the [Role] opening and loved your recent post on [X]. Would you be open to a quick 5-minute chat about the team?_" At the end of that 5-minute chat, politely ask, "_Would you be comfortable referring me?_"

**Each submission needs:** (1) Keywords remixed from the JD into your resume bullets, (2) a 3-paragraph tailored cover letter (unless the posting says no cover letter), and (3) clean ATS format.

Also — **track everything** in a spreadsheet. After 20 apps, you'll see patterns (e.g. "I never get interviews when I don't have a referral").

If you upload your resume to the **Job Search** page, it can auto-match openings to your skills and save a ton of research time. Which specific role/industry are you targeting right now? 🎯
`
    );
  }

  if (matched.includes("roadmap") || matched.includes("transition")) {
    return (
`Great move to think in terms of a roadmap! The common mistake is building a roadmap forward from today. Instead, design it **backwards from a 3-year goal**. Here's how:

**1. Write a SPECIFIC 3-year target.** Not "a better job" but something like: "Senior Product Manager at a Series B fintech, owning onboarding + monetization." Specificity makes every next step actionable.

**2. Reverse-engineer 8-10 live JDs for that exact role.** 3 buckets:
   - MUST-have hard skills (≈60% of the weight)
   - Measurable achievements or portfolio proof (≈30%)
   - Nice-to-haves (last 10%)

**3. Chunk into 3 / 6 / 12-month milestones.**
   - Months 1-3: Top 2 hard skills + 1 portfolio project. Make it measurable (e.g., "Finish 2 courses + build X demo").
   - Months 4-6: 2 more projects + 2 networking outreach/week in target companies.
   - Months 7-12: Public case studies, blog posts, conference talks or freelance work for credibility; start applying in earnest.

**4. Review monthly.** Adjust, don't abandon. Most roadmaps change shape after 90 days. That's normal.

💡 If you go to the **Career Roadmap** page and enter your target role, it generates a fully personalized 12-month plan with weekly steps, skill tracks, and progress tracking built in. What target role are you hoping to map out? 😊
`
    );
  }

  if (matched.includes("salary")) {
    return (
`Salary negotiation is literally the highest $/hour skill you'll ever learn. Use this 5-rule framework and you'll almost always walk away with more.

**Rule 1 — Never give the first number.** When asked "Expected salary?", deflect: "_Based on my experience and scope, I'm targeting compensation that's competitive for this market. I'm sure we can find a number that works for both of us._" If they insist, give a WIDE range where the bottom is 10% above your true walk-away.

**Rule 2 — Come with 3 data points.** (1) Glassdoor/Levels.fyi for the exact role+company, (2) LinkedIn/Blind < 6-month-old salary posts in your city, (3) Your current comp adjusted for inflation + 15%.

**Rule 3 — Always counter, even if the offer is good.** The first number is the LEAST they think you'll accept. Counter by 10-15% above, grateful + data-backed: "_Thank you so much — I'm genuinely excited. Based on my track record [your top quantified win] and market data for [city], I was targeting [your number]. Any flexibility there?_"

**Rule 4 — If base is capped, negotiate EVERYTHING else.** Sign-on bonus, equity/RSUs, perf bonus %, extra PTO, WFH stipend, conference budget, guaranteed 6-month review with raise schedule.

**Rule 5 — After you counter, say NOTHING.** Silence is the weapon. First person to talk loses. Average negotiation gain: +7-12%. For 5 minutes of discomfort — do it. 💵

Want to run a mock negotiation with me? Just share the details you have so far.
`
    );
  }

  if (matched.includes("networking")) {
    return (
`Networking isn't cold-DMing strangers for favors. It's building a small, real set of professional relationships. Here's the system that works:

**Commit to 3 outreach + 1 virtual coffee per WEEK.** Not 40 in a weekend. Consistency compounds. 6 months = 24 real contacts + 80+ extended network from "who else should I talk to?"

**Cold message template (gets 25%+ reply rates):**
1. **Specific compliment** — NOT "love your work". Example: "_Loved your case study migrating checkout from REST to GraphQL — the latency section was gold._"
2. **1-sentence self-intro tied to their work** — show you're relevant.
3. **MICRO-ASK (60-second answer)** — NEVER "can you get me a job?". Example: "_Would you be open to 2 quick questions about how your team evaluates mid-level candidates? No referral needed, just your perspective._"

**On the call:** Listen 80%, talk 20%. Take notes (people love being heard). **Always end with:** "_Who's 1 other person I should talk to about this?_"

**Nurture:** Thank-you note within 24 hours with 1 specific takeaway. Then check in once every 3-4 months with a useful article, congrats on their promotion, or a tiny progress update on your end.

The math is simple: 80+ real relationships → when roles open up, you get referred BEFORE they're posted. That's how 70-80% of real roles get filled. 🤝

Want me to write a tailored first message for a specific person or company you're targeting?
`
    );
  }

  if (matched.includes("portfolio")) {
    return (
`Portfolios turn applications into interviews. The common mistake is 10 mediocre projects — focus on **3 amazing ones** instead.

**Each project needs these 6 sections:**
1. **Thumbnail + 1-line outcome hook** — not the tech, the result. Example: "_Inventory system that cut stock discrepancies 42% for a 20-store chain._"
2. **Context** — 2 sentences: What problem existed? Who had it?
3. **Your role + explicit tech stack** — "_I led backend: Node.js, PostgreSQL, Redis caching. Teammate did frontend._"
4. **3-5 key decisions WITH TRADEOFFS** — This is what interviewers actually read. Example: "_Chose Postgres over Mongo because transactional consistency was critical; we accepted slower migration write speed for correctness._"
5. **Measurable results + screenshots** — %, $, users, time. Charts + before/after = gold.
6. **Links** — Live demo, GitHub repo, max-2-minute Loom walkthrough.

**Project types, ranked by impressiveness:**
1. Real client work (paid or free for non-profit/friend) with actual users.
2. Clone of a real product + "what I changed, and why" write-up.
3. Tutorial/course follow-along — ONLY if you refactor it afterward and write a 1,000-word case study on what you'd improve.

Want help designing 2-3 specific portfolio project ideas for your target role? Name the role and I'll brainstorm with you. 🎨
`
    );
  }

  if (matched.includes("cover")) {
    return (
`Cover letters still matter — especially if you're switching fields, have a gap, or applying to smaller teams (< 500 people). But 95% are generic and actively hurt you. Write THIS instead — 3 short paragraphs, ~250 words max:

**Paragraph 1 (the Hook):** Role name + where you found it + 1 specific reason you're excited about THIS company, not any company.
_Example:_ "_Dear Hiring Manager — I was thrilled to see the Senior Backend Engineer opening last week, especially after reading your engineering blog about the monolith→microservices migration last month. As someone who led an identical project that cut p99 latency 48%, I know I can help accelerate that transition._"

**Paragraph 2 (the Bridge):** Pick 2 requirements directly from the JD. For each, give 1 QUANTIFIED proof that maps to it. Not "I have team-lead experience" but: "_Your JD mentions mentoring juniors; last year I formally mentored 3 bootcamp grads, and 2 of them shipped production features within month 1._"

**Paragraph 3 (Warm CTA):** Reiterate enthusiasm + availability: "_I'd love to bring my performance and developer-experience focus into your organization. Available any time this week — thank you for your consideration._"

⚠️ **Never:** "To Whom It May Concern" (find a real name!), paste your resume, go past 1 page, or paste a template from Google. 🙏

Want me to help you draft one if you share a target role + company + your top 2 relevant wins?
`
    );
  }

  // Default — no career keywords matched. Actually ATTEMPT to answer the
  // user's question in good faith for common general-topic categories.
  // Only fall back to a friendly "ask me anything" prompt if we truly
  // can't classify it at all. NEVER deflect with "outside my wheelhouse".
  // Note: `lower` and `hasAny` are already declared at the TOP of
  // topicAdvice() — reuse them here, do NOT redeclare.
  const userName = "there";

  // ---------------------------------------------------------------
  // SCIENCE / PHYSICS
  // ---------------------------------------------------------------
  if (hasAny(["quantum", "physics", "relativity", "atom", "molecule", "gravity", "black hole"])) {
    return (
`Great question! Here's a simple, intuitive explanation:

**Quantum computing (and quantum physics, in short):**
Normal computers store information as **bits** — either 0 or 1, like a light switch on/off. Quantum computers use **qubits**, which can be *both* 0 and 1 at the same time (superposition) and also "link up" so that reading one instantly tells you about another (entanglement).

This means:
- A **normal computer** tries answers one after another (good enough for browsing, Word, etc.)
- A **quantum computer** can test millions of possibilities *in parallel*, which crushes problems like breaking certain encryption, designing new medicines, optimizing airplane routes, or training huge AI models.

⚠️ But don't throw out your laptop yet — quantum computers are finicky (need near-absolute-zero temperatures, error rates are still high) and only win on *specific* hard problems. For everyday stuff, your laptop is still faster.

**Did I hit what you were curious about?** Want me to go deeper on qubits, explain a different physics concept (black holes, relativity, gravity?), or pivot to something completely different — like how quantum computing could *change your resume* in tech fields? 😊
`
    );
  }

  // ---------------------------------------------------------------
  // POLITICS / LEADERS / CURRENT AFFAIRS
  // ---------------------------------------------------------------
  if (hasAny(["prime minister", "president", "minister of india", "pm of", "narendra", "modi", "who is the pm", "who is the president"])) {
    // Safe, non-partisan, verifiable facts only.
    return (
`As of my knowledge cutoff, here are the key facts for India:

- **Prime Minister of India:** **Narendra Damodardas Modi** — he is serving his **third consecutive term** (2014 → 2019 → 2024–present) as the head of government.
- **President of India (Head of State):** **Droupadi Murmu** (since July 2022), India's first tribal woman President.
- Form of government: Federal parliamentary democratic republic — the PM holds executive power and is leader of the ruling party/alliance in Lok Sabha (Lower House).

✅ Want me to also explain how a role like PM translates into resume bullet points if you're prepping for government exams / civil services? Or ask literally anything else — history, coding, recipes, it's all on the table!
`
    );
  }

  // ---------------------------------------------------------------
  // COUNTRY / GEOGRAPHY / CAPITAL FACTS
  // ---------------------------------------------------------------
  if (hasAny(["capital of", "currency of", "largest country", "population", "continent"]) ||
      /^(what|which|where)\s+(is|are)\s+(the\s+)?capital|^(how many)\s+(countries|states)/.test(lower)) {
    return (
`Got it — happy to help with geography and country facts! A few quick ones that come up often:

- **Capital of India:** New Delhi (officially the National Capital Territory, NCT Delhi)
- **Capital of the USA:** Washington, D.C.
- **Capital of the UK:** London
- **Capital of Japan:** Tokyo
- **Capital of Australia:** Canberra (people often guess Sydney!)
- **Largest country by area:** Russia (≈17M km²)
- **Most populous country (as of 2024):** India, estimated ~1.45 billion people, followed closely by China

Want a specific country or topic? Drop it in and I'll give you full, clean facts. Or — switching gears — if you're interviewing for roles that need general knowledge (UPSC, banking, government, MBA group discussions), I can quiz you or make a 10-day study plan. 📚
`
    );
  }

  // ---------------------------------------------------------------
  // HISTORY
  // ---------------------------------------------------------------
  if (hasAny(["world war", "independence", "hitler", "gandhi", "stalin", "churchill", "columbus", "invented", "discovered", "history"])) {
    return (
`History is fascinating — happy to dive in! Here are quick, widely-accepted baselines for common questions:

- **WWII dates:** 1 Sep 1939 (Germany invades Poland) → 2 Sep 1945 (Japan formally surrenders). ~70–85 million deaths; first and only use of nuclear weapons in war (Hiroshima & Nagasaki, Aug 1945).
- **India's Independence:** 15 August 1947. Partition into India + Pakistan. Major leaders: Mahatma Gandhi (non-violent movement), Jawaharlal Nehru (first PM), Sardar Patel (united the princely states).
- **Who invented the lightbulb?** Thomas Edison patented the first *practical, long-lasting* incandescent bulb in 1879 — but earlier inventors (Swan, Davy) built working prototypes. So the fair answer is: **Edison commercialized it.**
- **Who discovered America?** Millions of Indigenous people lived there for ~15,000+ years first. 1492 is when **Christopher Columbus** (sailing for Spain) made landfall in the Caribbean and began sustained European contact.

What specific event, person, or era are you curious about? I'll go as deep or as short as you want. And hey — if you're prepping interview trivia or a GK round for a job assessment, I can turn any of these into flashcard-style questions. 💡
`
    );
  }

  // ---------------------------------------------------------------
  // PROGRAMMING / CODE QUESTIONS
  // ---------------------------------------------------------------
  if (hasAny(["python", "javascript", "java", "c++", "react", "node", "coding", "debug", "code", "programming", "function", "array", "loop", "algorithm", "sql"])) {
    return (
`Happy to help with code! I can debug, explain concepts, or write/rewrite code in nearly any language. Since I don't see a specific snippet, here are 3 examples of super-common requests — if one matches what you need, tell me and I'll expand:

**1. Python — sort a CSV by a column**
\`\`\`python
import csv
with open("data.csv", "r") as f:
    rows = sorted(csv.DictReader(f), key=lambda r: float(r["salary"]), reverse=True)
\`\`\`

**2. JavaScript — debounce a function (e.g., search input)**
\`\`\`js
const debounce = (fn, ms = 300) => {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
};
\`\`\`

**3. SQL — find 2nd highest salary (classic interview question)**
\`\`\`sql
SELECT MAX(salary) AS SecondHighestSalary FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);
\`\`\`

Share your **specific language, goal, and error message (if any)** and I'll walk you through it step by step. And of course — if you're getting ready for coding interviews, I can do 30-minute mock rounds with difficulty, hints, and a score at the end! 💻
`
    );
  }

  // ---------------------------------------------------------------
  // MATH
  // ---------------------------------------------------------------
  if (/(\d+\s*[\+\-\*\/]\s*\d+)|percent|percentage|compound interest|simple interest|pythagorean|quadratic|square root|factorial|integral|derivative|algebra|calculus/.test(lower) ||
      hasAny(["math", "mathematics", "solve for", "calculate"])) {
    return (
`Math time! Send me the **specific numbers + operation** and I'll walk you through it step by step with explanations, not just answers.

Common math help I give:
- **Percentages:** "What's 15% of 480?" → 72 (480 × 0.15) or for % change: (new−old)/old × 100
- **Simple interest:** I = P × R × T
- **Compound interest:** A = P(1 + r/n)^(n·t)
- **Pythagoras:** a² + b² = c² (right triangles)
- **Quadratic formula:** x = (−b ± √(b²−4ac)) / 2a
- **Statistics & probability:** mean / median / mode / standard deviation

Drop your actual numbers, or tell me which concept you want explained like you're 10 years old, and I'll do it. Pro tip: if you're prepping aptitude rounds for placements (TCS, Infosys, Accenture, CAT, etc.), I can make a 7-day daily practice plan — those tests *love* percentages, profit-loss, SI/CI, and speed-time-distance. 🧮
`
    );
  }

  // ---------------------------------------------------------------
  // COOKING / RECIPES
  // ---------------------------------------------------------------
  if (hasAny(["recipe", "cook", "make biryani", "make pasta", "make paneer", "chicken", "vegan", "dessert", "baking", "ingredient"])) {
    return (
`Cooking is one of my favorite things to talk about! Since I don't know exactly what you're craving yet, here's a crowd-pleasing **15-minute Indian-style paneer masala** (serves 2) — zero fancy tools:

**Ingredients:**
200g paneer (cubed), 1 onion (finely chopped), 2 tomatoes (grated/puréed), 1-inch ginger + 4 garlic (paste), 1 green chili, ½ tsp turmeric, 1 tsp kashmiri red chili, 1 tsp garam masala, 1 tsp cumin, salt to taste, 2 tbsp oil, ¼ cup cream / 2 tbsp yogurt, fresh cilantro.

**Steps:**
1. Heat oil → add cumin → sizzle 10s → sauté onion 4 min until golden.
2. Add ginger-garlic + green chili → 30s. Stir in turmeric + red chili + salt.
3. Add tomato purée → cook 5 min on medium until oil separates (the key for non-bitter gravy).
4. Add ½ cup water → simmer → drop in paneer cubes gently.
5. 3 min later → stir in garam masala + cream/yogurt. Switch off.
6. Garnish cilantro. Done! ✅ Serve with roti or jeera rice.

Tell me what you actually want to make (cuisine + main ingredient + difficulty), and I'll nail it to the gram. Want calorie estimates or job-interview-level "tell me about yourself" answers on the side? I do both. 🍛
`
    );
  }

  // ---------------------------------------------------------------
  // CREATIVE WRITING (email / poem / story / etc.)
  // ---------------------------------------------------------------
  if (hasAny(["write an email", "write a poem", "write a story", "write an essay", "rewrite this", "sound more professional", "formal email", "apology email", "thank you email", "leave application", "slogan", "script"])) {
    return (
`Absolutely — I write, rewrite, and polish everything. Here are 3 quick templates that get requested every single day:

**1. Short professional "Thanks for the interview" email**
Subject: Thank you — [Role Name] Interview ([Today's date])

Hi [Interviewer's name],
Thank you so much for taking the time to meet with me today about the [Role] position. I genuinely enjoyed learning about the team's work on [specific project/topic they mentioned], and it confirmed how excited I'd be to contribute with my [skill/experience X].

Looking forward to next steps. Please let me know if you need anything else from me!
Best, [Your name]

**2. 1-day casual leave application (to manager)**
Hi [Manager's name],
I'm writing to request one day of casual leave on [date] to attend to a personal appointment. I've handed off [task X] to [teammate] and will be reachable on Slack for anything urgent.
Thanks, [Your name]

**3. Super-short poem template** (I'll personalize if you give a topic!)
_The morning light on window pane, / A coffee cup, a quiet train — / Some days the smallest, softest things, / Are all the wings a soul needs wings._

What exactly do you need written? Give me:
- **Type:** email / poem / story / essay / slogan / cover letter paragraph
- **Tone:** professional / warm / funny / formal
- **Audience + context:** who it's for, and the 1-sentence backstory
…and I'll produce it in seconds. 🖋️
`
    );
  }

  // ---------------------------------------------------------------
  // "WHAT IS YOUR NAME" / PERSONAL QUESTIONS
  // ---------------------------------------------------------------
  if (/what('?s|\s+is)\s+your\s+name|who are you|tell me about yourself|what can you do|are you real/.test(lower)) {
    return (
`Hey! 👋 I'm **AI Assistant** — your friendly, all-purpose helper built right into this AI Resume Analyzer platform.

A quick intro:
- **My #1 superpower** (and what I'm best at): Career stuff — resumes, cover letters, ATS optimization, interview prep, salary negotiation, career roadmaps, upskilling plans, portfolio reviews, and job-search strategy. For these I can give you *frameworks, scripts, and even personalized next steps*.
- **But I'm a generalist too!** Ask me about science, history, geography, politics, code, math, cooking, creative writing, study plans, productivity tips, sports, movies, music, travel, fitness — literally anything. If I know it, I answer clearly; if I don't, I'll be honest instead of guessing.
- I'm not a real person, but I try to sound like one! 😊

Quick question back to you: What are you working on today that I can help with — a resume tweak, an interview question, a physics concept, a Python bug, or something totally random?
`
    );
  }

  // ---------------------------------------------------------------
  // ULTIMATE FALLBACK
  // We couldn't match a topic category. Still attempt a REAL answer —
  // be honest that it's fallback-level, and invite more detail.
  // NEVER say "outside my wheelhouse" or deflect.
  // ---------------------------------------------------------------
  const sampleTopics = [
    "I help with general knowledge — science, history, geography, tech, politics, sports, math, cooking, movies, music, and more.",
    "I write creative stuff: emails, poems, stories, essays, slogans, scripts, polished professional paragraphs.",
    "I do code help in any language — debugging, explanations, full snippets.",
    "I make study plans, break down hard concepts, and design practice sets.",
    "I give productivity/life advice (habits, time management, decisions).",
  ].sort(() => Math.random() - 0.5).slice(0, 2).join("\n");

  return (
`Got it! I'm going to give this my best shot — but for the most accurate answer possible, a *tiny bit more detail* from you would make it perfect (for example: "_Explain [X] like I'm 12_" or "_How do I do [X] in Python 3.10?_" or "_Rewrite this 2-sentence text: ____").

Here's what I can handle right now:
${sampleTopics}

💡 And of course, **my best work is career stuff** — resume fixes, interview prep (mock interviews + scoring!), salary negotiation scripts, skill-gap plans, 12-month career roadmaps, job search strategy, and LinkedIn/cover letter polish. I can dive into any of those in full, tailored mode.

So — share a bit more detail on what you're asking, and I'll deliver exactly what you need! 😊
`
    );
  }

function buildFallbackResponse(userMessage, lastMessages = []) {
  const text = (userMessage || "").toString();

  // 1. Pure greeting
  if (isGreetingOnly(text)) return sample(GREETINGS);
  // 2. Pure thanks/appreciation
  if (isThanksOnly(text)) return sample(THANKS_REPLIES);
  // 3. Pure short ack (ok / yes / no / etc.)
  if (isShortAckOnly(text)) return sample(ACKNOWLEDGE_SHORTS);

  // 4. Topic advice: career topics get structured advice, everything else
  //    gets a friendly general "I can look this up for you" response.
  try {
    return topicAdvice(text);
  } catch (e) {
    console.warn("[Fallback] topicAdvice threw:", e);
    return sample(GREETINGS);
  }
}

/* =========================================================
   CONVERSATION HISTORY HELPERS
========================================================= */
function normalizeHistoryForModel(rawHistory = []) {
  // rawHistory: [{ role: "user" | "bot", text: string }]
  const systemMsg = { role: "system", content: SYSTEM_PROMPT };
  const history = [];

  for (const m of rawHistory) {
    const role = m.role === "bot" ? "assistant" : "user";
    const content = (m.text || m.content || "").toString();
    if (!content.trim()) continue;
    // cap length per message to avoid blowing context
    history.push({ role, content: content.slice(0, 2500) });
  }

  // Keep roughly last 8 exchanges (16 messages) — recent context matters most
  const trimmed = history.length > 16 ? history.slice(-16) : history;
  return [systemMsg, ...trimmed];
}

/* =========================================================
   ROUTE HANDLERS
========================================================= */

exports.chatWithAssistant = async (req, res) => {
  try {
    console.log("=== [CareerAssistant] chat request received ===");

    const { message, history } = req.body; // history: [{ role, text }] optional

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const trimmedMessage = message.trim();
    console.log(`[User msg] ${trimmedMessage.length} chars: ${trimmedMessage.slice(0, 160)}`);

    // Normalize history: frontend array OR default (just current user msg)
    const rawHistory = Array.isArray(history) && history.length > 0
      ? [...history, { role: "user", text: trimmedMessage }]
      : [{ role: "user", text: trimmedMessage }];

    let aiText = null;
    let mode = "smart-fallback";
    const messagesForModel = normalizeHistoryForModel(rawHistory);

    if (hasGroqKey) {
      const model = resolveGroqModel();
      console.log(`[LLM] Attempting Groq first. model=${model}, history_length=${messagesForModel.length - 1}`);

      const llmResult = await callGroqAny({
        model,
        messages: messagesForModel,
        temperature: 0.7,
        maxTokens: 1000,
      });

      aiText = llmResult.content;
      if (aiText) {
        if (llmResult.provider === "google-gemini") {
          mode = "google-gemini";
        } else {
          mode = "groq";
        }
        console.log(`[LLM] SUCCESS! mode=${mode}, provider=${llmResult.provider}, chars=${aiText.length}`);
      } else {
        console.warn("[LLM] All Groq paths + Google Gemini failed — falling back to smart rule engine.");
      }
    } else if (hasGoogleKey) {
      console.log(`[LLM] Groq unavailable — trying Google Gemini directly. history_length=${messagesForModel.length - 1}`);
      aiText = await callGoogleGemini({
        messages: messagesForModel,
        temperature: 0.7,
        maxTokens: 1000,
      });
      if (aiText) {
        mode = "google-gemini";
        console.log(`[LLM] SUCCESS via Google Gemini! mode=${mode}, response=${aiText.length} chars`);
      } else {
        console.warn("[LLM] Google Gemini failed — falling back to smart rule engine.");
      }
    } else {
      console.log("[LLM] No LLM API keys configured (Groq or Google). Using smart rule-based fallback only.");
    }

    // Fallback: smart rule engine (NEVER fails)
    if (!aiText) {
      aiText = buildFallbackResponse(trimmedMessage, rawHistory);
      mode = mode === "groq" ? mode : "smart-fallback";
    }

    return res.status(200).json({
      success: true,
      response: aiText,
      mode,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("=== [CareerAssistant] FATAL in chat endpoint ===");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    const safeMsg = (req.body?.message || "").toString();
    return res.status(200).json({
      success: true,
      response: buildFallbackResponse(safeMsg, []),
      mode: "emergency-fallback",
      timestamp: new Date().toISOString(),
    });
  }
};

exports.getSuggestedQuestions = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      suggestions: [
        {
          category: "Resume",
          questions: [
            "How can I improve my resume?",
            "What keywords should I include?",
            "Should I add a summary section?",
            "How long should my resume be?",
          ],
        },
        {
          category: "Interviews",
          questions: [
            "How do I answer 'Tell me about yourself'?",
            "Common behavioral interview questions?",
            "What questions should I ask the interviewer?",
            "How to follow up after an interview?",
          ],
        },
        {
          category: "Career Growth",
          questions: [
            "What skills should I learn next?",
            "How to transition to a new industry?",
            "How do I negotiate a higher salary?",
            "Help me build a career roadmap",
          ],
        },
      ],
    });
  } catch (error) {
    console.error("Get suggestions error:", error);
    res.status(200).json({
      success: true,
      suggestions: [
        {
          category: "Career Help",
          questions: [
            "How can I improve my resume?",
            "What skills should I learn?",
            "Help me prepare for interviews",
            "Give me a career roadmap plan",
          ],
        },
      ],
    });
  }
};
