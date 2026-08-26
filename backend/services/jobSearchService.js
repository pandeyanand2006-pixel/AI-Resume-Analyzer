// Real-time job aggregation from free public APIs
// - Arbeitnow (no key): https://www.arbeitnow.com/api/job-board-api
// - Remotive (no key): https://remotive.com/api/remote-jobs
// - Adzuna/JSearch via RapidAPI if keys provided (optional)

const ARBEITNOW_URL = "https://www.arbeitnow.com/api/job-board-api";
const REMOTIVE_URL = "https://remotive.com/api/remote-jobs";

async function fetchArbeitnow() {
  try {
    const res = await fetch(ARBEITNOW_URL, { headers: { "User-Agent": "ResumeAI/1.0" } });
    if (!res.ok) throw new Error(`Arbeitnow ${res.status}`);
    const json = await res.json();
    const data = json.data || [];
    return data.map((j) => ({
      id: `arbeitnow_${j.slug || j.title}`,
      title: j.title || "Untitled",
      company: j.company_name || "Unknown",
      location: j.location || "Remote",
      description: j.description || "",
      url: j.url || "",
      salary: j.salary || "",
      remote: j.remote ? "Remote" : j.location?.toLowerCase().includes("remote") ? "Remote" : "On-site",
      source: "Arbeitnow",
      postedDate: j.created_at ? new Date(j.created_at).toLocaleDateString() : "",
      tags: j.tags || j.job_types || [],
      raw: j,
    }));
  } catch (e) {
    console.error("Arbeitnow fetch failed:", e.message);
    return [];
  }
}

async function fetchRemotive(search = "") {
  try {
    const url = search ? `${REMOTIVE_URL}?search=${encodeURIComponent(search)}` : REMOTIVE_URL;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Remotive ${res.status}`);
    const json = await res.json();
    const jobs = json.jobs || [];
    return jobs.map((j) => ({
      id: `remotive_${j.id}`,
      title: j.title || "Untitled",
      company: j.company_name || "Unknown",
      location: j.candidate_required_location || j.location || "Remote",
      description: j.description || "",
      url: j.url || j.job_url || "",
      salary: j.salary || "",
      remote: "Remote",
      source: "Remotive",
      postedDate: j.publication_date ? new Date(j.publication_date).toLocaleDateString() : "",
      tags: j.tags || [j.category].filter(Boolean),
      raw: j,
    }));
  } catch (e) {
    console.error("Remotive fetch failed:", e.message);
    return [];
  }
}

// Optional: Adzuna if keys present (free tier)
async function fetchAdzuna(search = "", location = "") {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];
  try {
    const country = process.env.ADZUNA_COUNTRY || "in";
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=15&what=${encodeURIComponent(search)}&where=${encodeURIComponent(location)}&content-type=application/json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Adzuna ${res.status}`);
    const json = await res.json();
    const results = json.results || [];
    return results.map((j) => ({
      id: `adzuna_${j.id}`,
      title: j.title || "Untitled",
      company: j.company?.display_name || "Unknown",
      location: j.location?.display_name || location || "Unknown",
      description: j.description || "",
      url: j.redirect_url || "",
      salary: j.salary_min && j.salary_max ? `${j.salary_min}-${j.salary_max}` : "",
      remote: j.location?.display_name?.toLowerCase().includes("remote") ? "Remote" : "On-site",
      source: "Adzuna",
      postedDate: j.created ? new Date(j.created).toLocaleDateString() : "",
      tags: j.category?.label ? [j.category.label] : [],
      raw: j,
    }));
  } catch (e) {
    console.error("Adzuna fetch failed:", e.message);
    return [];
  }
}

function calculateMatchScore(job, resumeSkills, desiredRole) {
  const skills = (resumeSkills || []).map((s) => s.toLowerCase().trim());
  const role = (desiredRole || "").toLowerCase();
  const title = (job.title || "").toLowerCase();
  const desc = (job.description || "").toLowerCase();
  const tags = (job.tags || []).join(" ").toLowerCase();
  const combined = `${title} ${desc} ${tags}`;

  if (skills.length === 0 && !role) return 50; // neutral if no resume

  let matched = 0;
  skills.forEach((skill) => {
    if (skill && combined.includes(skill)) matched += 1;
  });
  const skillScore = skills.length ? Math.round((matched / skills.length) * 70) : 0;

  let roleScore = 0;
  if (role) {
    const roleTokens = role.split(/\s+/).filter(Boolean);
    const hits = roleTokens.filter((t) => combined.includes(t)).length;
    roleScore = Math.round((hits / Math.max(1, roleTokens.length)) * 30);
    // bonus if title contains role
    if (title.includes(role)) roleScore += 10;
  }

  let score = Math.min(98, skillScore + roleScore + 20); // base 20
  if (skills.length === 0) score = Math.min(85, roleScore + 50);
  return Math.max(0, Math.min(99, score));
}

function filterAndRank(jobs, { resumeSkills, desiredRole, location, remoteFilter }) {
  let filtered = jobs;

  // location filter
  if (location && location.trim()) {
    const loc = location.toLowerCase();
    filtered = filtered.filter((j) => j.location.toLowerCase().includes(loc) || j.location.toLowerCase().includes("remote"));
  }
  if (remoteFilter && remoteFilter !== "all") {
    filtered = filtered.filter((j) => j.remote === remoteFilter);
  }

  // desiredRole filter – keep only jobs matching role tokens if role provided
  if (desiredRole && desiredRole.trim()) {
    const tokens = desiredRole.toLowerCase().split(/\s+/).filter(Boolean);
    const scored = filtered.map((j) => ({
      job: j,
      hits: tokens.filter((t) => `${j.title} ${j.description} ${j.tags}`.toLowerCase().includes(t)).length,
    }));
    // keep jobs with at least 1 token hit, or if none, keep all (to avoid empty)
    const withHits = scored.filter((s) => s.hits > 0);
    filtered = withHits.length > 0 ? withHits.map((s) => s.job) : filtered;
  }

  // calculate matchScore
  filtered = filtered.map((j) => ({
    ...j,
    matchScore: calculateMatchScore(j, resumeSkills, desiredRole),
    matchedSkills: (resumeSkills || []).filter((s) => `${j.title} ${j.description} ${j.tags}`.toLowerCase().includes(s.toLowerCase())),
  }));

  // sort by matchScore desc, then by source
  filtered.sort((a, b) => b.matchScore - a.matchScore);

  return filtered;
}

async function searchRealTimeJobs({ resumeSkills = [], desiredRole = "", location = "", remoteFilter = "all", limit = 30 }) {
  const [arbeitnow, remotive, adzuna] = await Promise.all([
    fetchArbeitnow(),
    fetchRemotive(desiredRole || (resumeSkills[0] || "")),
    fetchAdzuna(desiredRole || (resumeSkills[0] || ""), location),
  ]);

  let all = [...arbeitnow, ...remotive, ...adzuna];

  // Dedupe by url
  const seen = new Set();
  all = all.filter((j) => {
    if (!j.url) return true;
    if (seen.has(j.url)) return false;
    seen.add(j.url);
    return true;
  });

  // If external APIs fail or return empty, fallback to curated mock with links
  if (all.length === 0) {
    all = getFallbackJobs(desiredRole, resumeSkills);
  }

  const ranked = filterAndRank(all, { resumeSkills, desiredRole, location, remoteFilter });
  return ranked.slice(0, limit);
}

function getFallbackJobs(desiredRole, skills) {
  const role = desiredRole || "Software Engineer";
  return [
    {
      id: "fallback_1",
      title: `${role} - Remote`,
      company: "Remotive (Fallback)",
      location: "Remote",
      description: `Exciting ${role} role matching skills: ${(skills || []).slice(0, 3).join(", ")}`,
      url: `https://remotive.com/remote-jobs/search?q=${encodeURIComponent(role)}`,
      salary: "",
      remote: "Remote",
      source: "Remotive Fallback",
      postedDate: new Date().toLocaleDateString(),
      tags: skills?.slice(0, 3) || [],
    },
    {
      id: "fallback_2",
      title: `${role} - Arbeitnow`,
      company: "Arbeitnow (Fallback)",
      location: "Germany / Remote",
      description: `Find ${role} jobs on Arbeitnow matching your profile.`,
      url: `https://www.arbeitnow.com/?search=${encodeURIComponent(role)}`,
      salary: "",
      remote: "Remote",
      source: "Arbeitnow Fallback",
      postedDate: new Date().toLocaleDateString(),
      tags: skills?.slice(0, 3) || [],
    },
  ];
}

module.exports = { searchRealTimeJobs, fetchArbeitnow, fetchRemotive, calculateMatchScore };
