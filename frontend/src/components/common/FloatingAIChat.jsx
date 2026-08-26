import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { BotIcon, XIcon, SparklesIcon, Trash2Icon } from '../ui/Icons';
import api from '../../services/api';
import './FloatingAIChat.css';

/* =========================================================
   LIGHTWEIGHT MARKDOWN → HTML RENDERER
   Supports: **bold**, *italic*, `code`, ordered & unordered lists,
   line breaks, 1-6 level headers (### Header), horizontal rules,
   emoji symbols preserved. No external deps.
========================================================= */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseInline(text) {
  let s = escapeHtml(text);
  // Code (keep code untouched)
  s = s.replace(/`([^`]+)`/g, (_m, c) => `<code>${c}</code>`);
  // Bold: **text** or __text__
  s = s.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__([^_]+?)__/g, '<strong>$1</strong>');
  // Italic: *text* or _text_
  s = s.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');
  s = s.replace(/(^|[^_])_([^_\n]+?)_(?!_)/g, '$1<em>$2</em>');
  return s;
}

function renderMarkdown(md) {
  const raw = (md || '').toString().replace(/\r\n/g, '\n').trim();
  if (!raw) return '';

  // Split into blocks by paragraph break (blank lines between them)
  const lines = raw.split('\n');

  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip pure blank
    if (!line.trim()) {
      i++;
      continue;
    }

    // Headings: ### Header
    const h = line.match(/^(#{1,6})\s+(.+)$/);
    if (h) {
      const level = h[1].length;
      blocks.push(`<h${level} class="md-h md-h-${level}">${parseInline(h[2])}</h${level}>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^\s*([-*_])\s*\1\s*\1[\s\S]*$/.test(line)) {
      blocks.push('<hr class="md-hr" />');
      i++;
      continue;
    }

    // Unordered list (- item, * item, + item)
    if (/^\s*([-*+])\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*([-*+])\s+/.test(lines[i])) {
        const m = lines[i].match(/^\s*([-*+])\s+(.*)$/);
        if (m) items.push(m[2]);
        i++;
      }
      blocks.push('<ul class="md-ul">' + items.map((it) => `<li>${parseInline(it)}</li>`).join('') + '</ul>');
      continue;
    }

    // Ordered list (1. item, 2. item)
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        const m = lines[i].match(/^\s*\d+\.\s+(.*)$/);
        if (m) items.push(m[1]);
        i++;
      }
      blocks.push('<ol class="md-ol">' + items.map((it) => `<li>${parseInline(it)}</li>`).join('') + '</ol>');
      continue;
    }

    // Blockquote
    if (/^\s*>/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      blocks.push(`<blockquote class="md-quote">${parseInline(buf.join(' '))}</blockquote>`);
      continue;
    }

    // Paragraph: accumulate consecutive non-blank non-special lines
    const buf = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^\s*([-*+])\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^\s*>/.test(lines[i]) &&
      !/^\s*```/.test(lines[i])
    ) {
      buf.push(lines[i]);
      i++;
    }
    const paragraph = buf.join('\n');
    // Allow inline \n → <br> inside a paragraph
    blocks.push(`<p class="md-p">${parseInline(paragraph).replace(/\n/g, '<br/>')}</p>`);
  }

  return blocks.join('\n');
}

/* Small React component that uses dangerouslySetInnerHTML safely
   (our input is always parsed and escaped at this point). */
function Markdown({ text }) {
  const html = useMemo(() => renderMarkdown(text), [text]);
  return (
    <div
      className="md-content"
      /* Markdown parsed above — all HTML is produced by our parser, escapeHtml is applied. */
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/* =========================================================
   CLIENT-SIDE RULE-BASED FALLBACK ENGINE (for when
   backend is completely unreachable) — matches backend's.
========================================================= */
const CLIENT_GREETINGS = [
  "Hi there! 👋 I'm your AI Assistant. Ask me anything — resumes, careers, general knowledge, creative writing, coding help, or whatever's on your mind. What would you like to know?",
  "Hey! Great to connect. 😊 I can help with resumes, interviews, career stuff AND general topics like math, history, cooking, writing, and more. What's on your mind?",
  "Hello! 👋 I'm your all-purpose AI Assistant. Whether it's career advice, explaining a concept, brainstorming ideas, or just a fun question — I'm here. What's up?",
];
const CLIENT_THANKS = [
  "Anytime! 🙂 Want me to dive deeper on any of that, or switch to a totally different topic? What would be most helpful next?",
  "Happy to help! 💪 Feel free to ask about anything else, career-related or not. What's the next thing you'd like to explore?",
];
const CLIENT_ACKS = [
  "Got it! What would you like to talk about next? I can help with any topic!",
  "Okay! Feel free to ask me anything at all — career, education, creative, technical, anything. What do you want to focus on?",
];

function sampleA(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function clientBuildFallback(userMessage) {
  const text = (userMessage || "").toString();
  const lower = text.toLowerCase().trim();

  const normalized = lower.replace(/[^a-z\s!?.,]/g, "");
  const tokens = normalized.split(/\s+/).filter(Boolean);

  // 1. Greeting-only ("hello", "hi", "hey")
  const greetings = ["hi", "hello", "hey", "hii", "heyy", "yo", "sup", "good morning", "good afternoon", "good evening", "hi there"];
  if (tokens.length <= 4 && greetings.some((g) => normalized.includes(g))) {
    return sampleA(CLIENT_GREETINGS);
  }

  // 2. Thanks-only
  const thanksWords = ["thanks", "thank you", "thx", "ty", "appreciate it", "appreciate that", "cheers"];
  if (thanksWords.some((w) => normalized.includes(w))) {
    const careerKw = ["resume", "interview", "skill", "job", "roadmap", "salary", "cover letter", "portfolio", "network", "career"];
    if (!careerKw.some((k) => lower.includes(k))) return sampleA(CLIENT_THANKS);
  }

  // 3. Short ack ("ok", "yes", "no")
  const acks = ["ok", "okay", "okie", "yes", "yeah", "yep", "yup", "nope", "no", "nah", "right", "sure", "alright", "got it", "gotcha", "k", "kk"];
  if (tokens.length <= 4 && acks.some((a) => tokens.includes(a))) {
    return sampleA(CLIENT_ACKS);
  }

  // 4. Short topic advice (career topics get structured advice; everything else
  //    falls through to a general-purpose "I can help with anything" message)
  if (lower.includes("resume") || lower.includes("improve") || lower.includes("cv") || lower.includes("ats")) {
    return (
`Here are **4 high-impact fixes** to strengthen your resume this week:

**1. Fix ATS formatting first** — Use standard section headings (Experience, Education, Skills), a plain font, no tables or text boxes. 75% of resumes get rejected before a human ever sees them.

**2. Turn duties into quantified wins** — Replace "Managed social media" with something like: "Grew LinkedIn engagement 180% in 6 months via a data-driven content calendar." Action → method → measurable result.

**3. Pull keywords directly from real JDs** — Grab 3-5 live job descriptions you're targeting, circle the 10 most repeated hard skills (React, Python, SQL, Salesforce, etc.) and weave them into your bullets naturally.

**4. Rewrite your summary as a 2-line billboard** — Lead with: years of experience + core specialty + your biggest measurable win.

💡 Upload your resume to the **Resume Analysis** page for a full ATS score, detected skills, and a personalized improvement list made for YOUR exact resume. Want me to walk through any of these 4 steps with field-specific examples?
`
    );
  }

  if (lower.includes("tell me about yourself")) {
    return (
`Great question — this is your most important 60 seconds in any interview. Use this **Present → Past → Future** structure:

**Present (10 seconds):** Open with your title + a strong differentiator.
_Example:_ "I'm a Full-Stack Engineer with 4 years building B2B SaaS products that serve 50K+ users."

**Past (30 seconds):** 2 quantified wins — NOT a full recap.
_Example:_ "At my last role I led our Angular→React rewrite that cut p99 load 65% and reduced churn 12%. I also mentored 3 juniors to their first production features."

**Future (20 seconds):** Bridge directly to THIS role with research.
_Example:_ "When I read your JD about the customer intelligence AI tool I got excited — I built a small ML ticket classifier side project last quarter and would love to bring that energy here."

⚠️ Don't ramble, don't read your resume, don't talk about childhood. Practice out loud 5x and record yourself.

Want to run a mock with me? Just tell me your target role + current title and I'll act as the interviewer! 💪
`
    );
  }

  if (lower.includes("interview") || lower.includes("question")) {
    return (
`Here's the condensed interview playbook that wins offers:

**1. Research 2 specific things per company + interviewer.** 1 recent product/launch/news item, and 1 thing from each interviewer's LinkedIn (post, project, promotion). Ask about it at the end — makes you unforgettable.

**2. Write out 8-10 STAR stories** (Situation → Task → Action → Result) for these themes: Leadership, Conflict, Failure/Tight deadline, Data-driven decision, Above & beyond. EVERY story must end with a NUMBER (%, $, users saved, time reduced).

**3. Do 3+ mock interviews.** Real pressure + feedback beats solo studying 10:1. If you don't have a partner, the **AI Interviewer** page drills you on role-specific questions + gives live scoring.

**4. Your 3 go-to questions (never say "I don't have questions"):**
- "What does success look like here in the first 90 days, and how is it measured?"
- "What's the biggest challenge someone in this role typically faces in months 3-6?"
- "How would you describe the team culture, and what type of person thrives here?"

Prepping for behavioral, technical, or a specific target role? I can go as deep as you want. 💯
`
    );
  }

  if (lower.includes("skill")) {
    return (
`Upskilling is the #1 controllable lever for growth. Use this 4-step framework:

**1. Identify the gap (1 hour)** — Pull 3-5 live job descriptions targeting your dream role. Circle the hard skills that appear 2+ times. Those are your high-ROI skills. The Skill Gap Analysis tool (upload your resume + pick a role) will generate this list automatically.

**2. Prioritize the TOP 3, not the top 10** — 80/20 rule: 1 core technical skill + 1 major tool/platform + 1 soft skill gives you ~80% of the upside. Don't spread 20 hours across 8 skills.

**3. Learn by BUILDING, not by binging courses** — Build 2-3 real portfolio projects using the skill. A 1,000-word case study + GitHub link beats any 40-hour certificate (unless the field requires it, like AWS/Azure/PMP).

**4. Certifications: only if required.** Most hiring managers care way more about "Can this person solve my problem today?" than course completion.

What role or skill area are you targeting right now? I can put together a concrete 3-month plan. 🚀
`
    );
  }

  if (lower.includes("salary") || lower.includes("pay") || lower.includes("raise") || lower.includes("negotiat")) {
    return (
`Salary negotiation is literally the highest $/hour skill you'll ever learn. Use this 5-rule framework:

**1. NEVER give the first number.** Deflect: "_Based on my experience + the role's scope, I'm targeting comp that's competitive for this market. I'm confident we can find a fit._" If pressed, give a WIDE range where the bottom is 10% above your true walk-away.

**2. Come with 3 data points.** Glassdoor/Levels.fyi for exact role+co, LinkedIn/Blind posts < 6 months old in your city, your current comp + 15% inflation/expectation adjustment.

**3. Always counter, even if the offer is good.** First number = the LOWEST they think you'll accept. Counter by 10-15% above their offer, grateful + data-backed.

**4. If base is capped, negotiate EVERYTHING.** Sign-on bonus, equity/RSUs, perf %, extra PTO, WFH stipend, conference budget, guaranteed 6-month review with raise schedule.

**5. After you counter — say NOTHING.** The first person to talk loses. Average gain: +7-12% for 5 minutes of discomfort. Do it. 💵

Want to run a mock negotiation? Just share the details you have so far.
`
    );
  }

  if (lower.includes("roadmap") || lower.includes("transition") || lower.includes("career path") || lower.includes("switch")) {
    return (
`Great to think in roadmaps! The common mistake is building forward from today. Instead, design it **backwards from a 3-year target**. Here's how:

**1. Write a SPECIFIC 3-year target.** Not "a better job." Example: "Senior Product Manager at a Series B fintech, owning onboarding + monetization." Specificity = actionability.

**2. Reverse-engineer 8-10 live JDs for that role.** 3 buckets: MUST-have hard skills (60%), measurable proof/portfolio (30%), nice-to-haves (10%).

**3. Chunk into 3/6/12-month milestones.** Months 1-3 = top 2 skills + 1 portfolio project. Months 4-6 = 2 more projects + 2 outreach/wk in target companies. Months 7-12 = public case studies, blogs, freelance, then applying.

**4. Review monthly.** Adjust, don't abandon. Most roadmaps change shape after 90 days — that's normal.

💡 Go to the **Career Roadmap** page, enter your target role, and it generates a personalized 12-month plan with weekly steps, skill tracks, AND built-in progress tracking. What target role are you hoping to map out? 😊
`
    );
  }

  // Default: actually ATTEMPT to answer common general questions
  // (science, politics, geography, history, code, math, cooking, creative, etc.)
  // Only give a "ask me anything" prompt if we truly can't classify.
  // NEVER deflect with "outside my wheelhouse".
  const hasAny = (arr) => arr.some((w) => lower.includes(w));

  // --- SCIENCE / PHYSICS ---
  if (hasAny(["quantum", "physics", "relativity", "atom", "molecule", "gravity", "black hole"])) {
    return (
`Great question! Here's a simple explanation:

**Quantum computing (short version):**
Normal computers use **bits** (0 or 1). Quantum computers use **qubits** that can be both 0 and 1 at the same time ("superposition") and link together ("entanglement").

- Normal computer → tries answers one-by-one (great for everyday tasks)
- Quantum computer → tests millions of possibilities in parallel (crushes specific hard problems: new drug design, breaking some encryption, route optimization, training giant AI models)

⚠️ Quantum is finicky — needs near-absolute-zero temps, high error rates. Your laptop still wins at 99% of real-world tasks.

Want me to go deeper on qubits, black holes, relativity, or switch to how quantum computing could upgrade your tech resume? 😊
`
    );
  }

  // --- POLITICS / LEADERS ---
  if (hasAny(["prime minister", "president", "pm of", "minister of india", "narendra", "modi"])) {
    return (
`As of my knowledge cutoff, key facts for India:

- **Prime Minister of India:** **Narendra Damodardas Modi** — third consecutive term (2014 → 2019 → 2024–present), head of government (executive power).
- **President of India:** **Droupadi Murmu** (since July 2022), India's first tribal woman President (head of state, ceremonial + constitutional powers).

Form of government: Federal parliamentary democratic republic. PM leads the ruling alliance in Lok Sabha.

Prepping for UPSC / banking / government exams? I can make a GK study plan or quiz you on these. Or ask literally anything else!
`
    );
  }

  // --- GEOGRAPHY ---
  if (hasAny(["capital of", "currency", "largest country", "population", "continent"])) {
    return (
`Quick geography facts (these come up in every competitive exam and trivia round):

- **Capital of India →** New Delhi (NCT Delhi)
- **Capital of USA →** Washington, D.C.
- **Capital of UK →** London
- **Capital of Japan →** Tokyo
- **Capital of Australia →** Canberra (not Sydney!)
- **Largest by area →** Russia (~17M km²)
- **Most populous (2024) →** India (~1.45B), closely followed by China

Need a specific country/city? Drop it in, or pivot → I'll build a general-awareness 10-day study plan for your next placement GK round. 📚
`
    );
  }

  // --- HISTORY ---
  if (hasAny(["world war", "independence", "gandhi", "hitler", "stalin", "churchill", "columbus", "invented", "discovered", "history"])) {
    return (
`Quick history baselines that come up all the time:

- **WWII:** 1 Sep 1939 (Germany invades Poland) → 2 Sep 1945 (Japan surrenders). First & only nuclear weapons used (Hiroshima & Nagasaki, Aug 1945).
- **Indian Independence:** 15 Aug 1947. Partitioned into India + Pakistan. Key leaders: Gandhi (non-violent movement), Nehru (first PM), Sardar Patel (united the 562 princely states).
- **Lightbulb:** Thomas Edison patented the first *practical, long-lasting* incandescent bulb in 1879 — earlier inventors (Swan, Davy) built working prototypes.
- **America:** Indigenous peoples lived there for ~15,000+ years. 1492 = Columbus (Spain) made first sustained European contact.

Want a specific person, war, or era? I'll go deep. Prepping interview trivia? I'll turn these into flashcard-style Q&A. 💡
`
    );
  }

  // --- CODE ---
  if (hasAny(["python", "javascript", "java", "c++", "react", "node", "coding", "debug", "code", "programming", "array", "loop", "sql", "algorithm"])) {
    return (
`Happy to help with code! Share the **language + goal + error (if any)** and I'll walk you through it. Quick examples for the 3 most-asked requests:

**1. Python — sort a CSV by a column**
\`\`\`python
import csv
with open("data.csv") as f:
    rows = sorted(csv.DictReader(f), key=lambda r: float(r["salary"]), reverse=True)
\`\`\`

**2. JS — debounce (search input, resize, etc.)**
\`\`\`js
const debounce = (fn, ms = 300) => {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
};
\`\`\`

**3. SQL — 2nd highest salary (classic)**
\`\`\`sql
SELECT MAX(salary) SecondHighestSalary FROM employees
 WHERE salary < (SELECT MAX(salary) FROM employees);
\`\`\`

Need a real bug fixed? Paste the error message! Coding interview soon? I'll run a 30-min mock with scoring. 💻
`
    );
  }

  // --- MATH ---
  if (hasAny(["math", "solve for", "calculate", "percent", "percentage", "interest", "pythagorean", "quadratic"])) {
    return (
`Math time! Send the **specific numbers + operation** and I'll walk through each step with explanations.

Formulas I use every day (memorize these for aptitude tests):
- **% of something:** part = whole × (% as decimal) → example: 15% of 480 = 72
- **% change:** (new − old) / old × 100
- **Simple interest:** I = P × R × T
- **Compound interest:** A = P(1 + r/n)^(n·t)
- **Pythagoras (right triangle):** a² + b² = c²
- **Quadratic:** x = (−b ± √(b²−4ac)) / 2a

Drop your actual numbers, or tell me which concept you want explained ELI5-style. Placement aptitude (TCS, Infosys, Accenture, CAT)? I'll make a 7-day daily practice plan — they LOVE percentages, profit-loss, SI/CI, speed-time-distance. 🧮
`
    );
  }

  // --- COOKING ---
  if (hasAny(["recipe", "cook", "biryani", "pasta", "paneer", "chicken", "vegan", "dessert", "baking", "ingredient"])) {
    return (
`Here's a go-to **15-min paneer masala** (serves 2) — zero fancy tools, tastes like restaurant:

**Ingredients:** 200g paneer (cubed), 1 onion (chopped), 2 tomatoes (grated), 1-inch ginger + 4 garlic (paste), 1 green chili, ½ tsp turmeric, 1 tsp kashmiri chili, 1 tsp garam masala, 1 tsp cumin, salt, 2 tbsp oil, ¼ cup cream / 2 tbsp yogurt, cilantro.

**Steps:** (1) Oil + cumin → sizzle → onion 4 min golden. (2) Ginger-garlic + chili → 30s → add turmeric + chili + salt. (3) Tomato purée → cook 5 min until oil separates. (4) ½ cup water + paneer → simmer 3 min. (5) Stir in garam masala + cream/yogurt → switch off. (6) Cilantro garnish. Done! ✅

Tell me exactly what you want (cuisine + ingredient + difficulty). Side bonus: I'll also draft your perfect "Tell me about yourself" answer for interviews! 🍛
`
    );
  }

  // --- CREATIVE WRITING ---
  if (hasAny(["write an email", "write a poem", "write a story", "write an essay", "rewrite this", "sound more professional", "formal email", "leave application"])) {
    return (
`Absolutely! Send me: **(1) type** (email / poem / story / essay / slogan / cover letter para), **(2) tone** (professional / warm / funny / formal), **(3) audience + 1-sentence context**.

Quick templates people ask for daily:

**A. Post-interview thank-you (≈60 words)**
Subject: Thanks — [Role] Interview ([Date])
Hi [Name], Thank you so much for today. Hearing about your team's work on [specific project they mentioned] genuinely excited me, and I'm confident my experience with [X skill] would help move it forward. Looking forward to next steps! Best, [Your name]

**B. 1-day casual leave to manager**
Hi [Manager], Requesting 1 day of casual leave on [date] for a personal appointment. I've handed off [task X] to [teammate] and am reachable on Slack for anything urgent. Thanks, [Your name]

Want me to write YOUR exact email / poem / story? Give me those 3 details and I'll nail it in 30 seconds. 🖋️
`
    );
  }

  // --- WHO ARE YOU ---
  if (lower.includes("your name") || lower.includes("who are you") || lower.includes("what can you do") || lower.includes("tell me about yourself")) {
    return (
`Hey! 👋 I'm **AI Assistant** — built into this AI Resume Analyzer platform.

**Tier 1 (my #1 priority, where I go DEEP):** Career, resumes, cover letters, ATS optimization, LinkedIn, interviews (mock interviews + live scoring!), salary negotiation scripts, skill-gap plans, 12-month career roadmaps, job search strategy, networking outreach templates, portfolio reviews, professional development.
**Tier 2 (still great, always answered directly):** Science, history, geography, politics, code (any language), math, cooking, creative writing, study plans, productivity, fitness, travel, movies, music, games — literally ANYTHING else.

I never deflect or say "outside my wheelhouse". If I truly don't know something, I'll be honest instead of guessing.

What are you working on today? A resume tweak? Interview prep? A physics question? A Python bug? Or something totally random? 😊
`
    );
  }

  // --- ULTIMATE FALLBACK ---
  const topicHints = [
    "General knowledge: history, science, geography, technology, politics, sports, entertainment — I'll explain anything clearly.",
    "Creative help: stories, poems, emails, essays, slogans, brainstorming, outlines, scripts.",
    "Code & tech: debugging help, concept explanations, writing/rewriting code in any language.",
    "Learning & study: concept breakdowns, study plans, flashcard prompts, quiz questions.",
    "Productivity & life: habits, time management, planning, decisions, fitness, cooking, travel.",
    "Career stuff (my strongest area): resumes, cover letters, interviews, salary negotiation, roadmaps, skill plans, job search.",
  ];
  const hints = topicHints.sort(() => Math.random() - 0.5).slice(0, 3).join("\n");
  return (
`Got it! I'm going to give this my best shot — for the most accurate, specific answer, add a *little* more context if you can. Examples that help a ton:

- "_Explain [topic] like I'm 12 years old_"
- "_How do I do [task] in Python 3.10?_"
- "_Rewrite this 2-sentence text: _____"

A few things I can help with right now:
${hints}

💡 My strongest area (and highest priority!) is **career stuff** — resume fixes, mock interviews with scoring, salary negotiation scripts, skill-gap plans, 12-month career roadmaps, job search strategy, LinkedIn polish, cover letter writing. I go into full tailored mode for those.

What should I dive into first? 😊
`
  );
}

const FloatingAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "👋 Hi! I'm your AI Assistant. Ask me anything — resumes, careers, general knowledge, writing, coding, creative ideas, or literally any topic you're curious about. I'm here to help!",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [statusPulse, setStatusPulse] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + 'px';
    }
  }, [inputValue, isOpen]);

  const suggestedQuestions = [
    "How can I improve my resume?",
    "Explain quantum computing simply",
    "Write a professional email",
    "What skills should I learn?",
  ];

  // Serialize last N messages for backend history context (skip system/intro we don't want repeated every time)
  const historyPayload = useMemo(() => {
    return messages
      .slice(-10)
      .map((m) => ({ role: m.type === 'user' ? 'user' : 'bot', text: m.text }));
  }, [messages]);

  const handleSendMessage = useCallback(async (messageText) => {
    if (!messageText || !messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setStatusPulse(true);
    setTimeout(() => setStatusPulse(false), 1200);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await api.post(
        '/career-assistant/chat',
        {
          message: messageText,
          history: historyPayload,
        },
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      const botText =
        response?.data?.response?.trim() || clientBuildFallback(messageText);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'bot',
          text: botText,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.warn('[FloatingAIChat] API unavailable — using client fallback:', err?.message || err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'bot',
          text: clientBuildFallback(messageText),
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [historyPayload]);

  const handleQuestionClick = useCallback((q) => {
    handleSendMessage(q);
  }, [handleSendMessage]);

  const handleClearChat = useCallback(() => {
    setMessages([
      {
        id: Date.now(),
        type: 'bot',
        text: "👋 Hi! I'm your AI Assistant. Ask me anything — resumes, careers, general knowledge, writing, coding, creative ideas, or literally any topic you're curious about. I'm here to help!",
        timestamp: new Date(),
      },
    ]);
    setInputValue('');
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <div className="floating-ai-chat">
      {isOpen && (
        <div className="floating-ai-chat__window floating-ai-chat__window--open">
          {/* Header */}
          <div className="floating-ai-chat__header">
            <div className="floating-ai-chat__header-content">
              <div className="floating-ai-chat__header-icon">
                <SparklesIcon size={20} />
              </div>
              <div className="floating-ai-chat__header-text">
                <div className="floating-ai-chat__header-title">AI Assistant</div>
                <div className="floating-ai-chat__header-status">
                  <span
                    className={`floating-ai-chat__status-dot ${
                      statusPulse ? 'floating-ai-chat__status-dot--active' : ''
                    }`}
                  ></span>
                  Online
                </div>
              </div>
            </div>
            <div className="floating-ai-chat__header-actions">
              {messages.length > 1 && (
                <button
                  type="button"
                  className="floating-ai-chat__clear-header-btn"
                  onClick={handleClearChat}
                  aria-label="Clear chat"
                  title="Clear chat"
                >
                  <Trash2Icon size={16} />
                </button>
              )}
              <button
                type="button"
                className="floating-ai-chat__close"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                <XIcon size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="floating-ai-chat__messages">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`floating-ai-chat__message floating-ai-chat__message--${m.type}`}
              >
                {m.type === 'bot' && (
                  <div className="floating-ai-chat__message-avatar">
                    <SparklesIcon size={16} />
                  </div>
                )}
                <div className="floating-ai-chat__message-bubble">
                  <Markdown text={m.text} />
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="floating-ai-chat__message floating-ai-chat__message--bot">
                <div className="floating-ai-chat__message-avatar">
                  <SparklesIcon size={16} />
                </div>
                <div className="floating-ai-chat__message-bubble floating-ai-chat__message-bubble--typing">
                  <div className="floating-ai-chat__typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions — only on first state (1 intro message) */}
          {messages.length <= 1 && (
            <div className="floating-ai-chat__suggestions">
              <div className="floating-ai-chat__suggestions-title">Quick questions:</div>
              <div className="floating-ai-chat__suggestions-grid">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className="floating-ai-chat__suggestion-btn"
                    onClick={() => handleQuestionClick(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="floating-ai-chat__input-container">
            <textarea
              ref={textareaRef}
              className="floating-ai-chat__input"
              placeholder="Ask me anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              type="button"
              className={`floating-ai-chat__send ${
                !inputValue.trim() || isTyping ? 'floating-ai-chat__send--disabled' : ''
              }`}
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle FAB */}
      <button
        type="button"
        className={`floating-ai-chat__toggle ${isOpen ? 'floating-ai-chat__toggle--open' : ''}`}
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
      >
        {isOpen ? (
          <XIcon size={24} />
        ) : (
          <>
            <BotIcon size={24} />
            <span className="floating-ai-chat__toggle-pulse"></span>
          </>
        )}
      </button>
    </div>
  );
};

export default FloatingAIChat;
