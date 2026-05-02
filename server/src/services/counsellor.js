import { careerCatalog, countryGuides, courses, jobCatalog } from "../data/catalog.js";
import { askOpenAI } from "./openai.js";
import { overlapScore, skillCoverage, tokenize } from "./scoring.js";

const systemPrompt =
  "You are Haven AI Counsellor, a premium career and study abroad counselling assistant for a consultancy. Be practical, ethical, specific, and lead-capture aware. Avoid guaranteeing admission, jobs, visas, or salary outcomes.";

export async function generateCounsellingPlan(profile, latestQuestion = "") {
  const localPlan = buildLocalPlan(profile);

  const aiPlan = await askOpenAI({
    system: `${systemPrompt} Return strict JSON matching the local plan shape: summary, fitScore, careers, skillGap, studyAbroad, roadmap, jobs.`,
    user: JSON.stringify({ profile, latestQuestion, localPlan }),
    json: true
  }).catch(() => null);

  return aiPlan ? mergePlan(localPlan, aiPlan) : localPlan;
}

export async function generateChatReply({ profile, messages }) {
  const latest = messages.at(-1)?.content || "";
  const localPlan = buildLocalPlan(profile);

  const aiReply = await askOpenAI({
    system: `${systemPrompt} Ask one useful follow-up question when profile data is weak. Keep replies concise and actionable.`,
    user: JSON.stringify({ profile, conversation: messages.slice(-8), currentPlan: localPlan })
  }).catch(() => null);

  if (aiReply) return { role: "assistant", content: aiReply };

  return {
    role: "assistant",
    content: localChatReply(profile, latest, localPlan)
  };
}

function buildLocalPlan(profile) {
  const tokens = tokenize(profile);
  const rankedCareers = careerCatalog
    .map((career) => {
      const coverage = skillCoverage(profile.skills || [], career.requiredSkills);
      const score = Math.round((overlapScore(tokens, career.keywords) * 0.62) + (coverage.score * 0.38));
      return {
        ...career,
        score,
        reason: buildReason(profile, career, coverage),
        missing: coverage.missing
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const missing = unique(rankedCareers.flatMap((career) => career.missing)).slice(0, 7);
  if (!missing.includes("Portfolio projects")) missing.push("Portfolio projects");

  const matchedCourses = missing
    .map((skill) => courses.find((course) => course.skill.toLowerCase() === skill.toLowerCase()))
    .filter(Boolean)
    .slice(0, 6);

  const targetCountry = countryGuides.find((guide) => guide.country.toLowerCase() === String(profile.targetCountry || "").toLowerCase());
  const studyAbroad = [targetCountry, ...countryGuides.filter((guide) => guide.country !== targetCountry?.country)]
    .filter(Boolean)
    .slice(0, 3);

  const jobs = jobCatalog
    .map((job) => {
      const coverage = skillCoverage(profile.skills || [], job.requiredSkills);
      return { ...job, match: Math.min(96, 48 + coverage.score) };
    })
    .sort((a, b) => b.match - a.match)
    .slice(0, 5);

  return {
    summary: `${profile.name || "This client"} is best positioned for ${rankedCareers[0].title} and ${rankedCareers[1].title} pathways. The immediate focus should be closing ${missing.slice(0, 3).join(", ")} gaps while preparing a strong resume, portfolio, and study-abroad shortlist.`,
    fitScore: Math.round(rankedCareers.reduce((total, career) => total + career.score, 0) / rankedCareers.length),
    careers: rankedCareers.map(({ title, reason, salary, demand, growth }) => ({ title, reason, salary, demand, growth })),
    skillGap: {
      currentStrengths: profile.skills || [],
      missing,
      courses: matchedCourses.length ? matchedCourses : courses.slice(0, 4)
    },
    studyAbroad,
    roadmap: [
      "Confirm target role family and preferred country with counsellor validation.",
      `Close the top skill gaps: ${missing.slice(0, 3).join(", ")}.`,
      "Build two portfolio artifacts aligned with the chosen career path.",
      "Create an ATS resume and LinkedIn profile tailored to the highest-fit roles.",
      "Shortlist universities, scholarships, intake deadlines, and visa documentation.",
      "Run mock interviews and begin applications with weekly progress tracking."
    ],
    jobs
  };
}

function buildReason(profile, career, coverage) {
  const strengths = coverage.matched.length ? coverage.matched.join(", ") : "your stated interests and goals";
  const gaps = coverage.missing.slice(0, 2).join(", ");
  return `${career.title} fits because it connects ${strengths} with ${profile.goals || "your stated career direction"}. Strengthen ${gaps || "role-specific proof"} to become application-ready.`;
}

function localChatReply(profile, latest, plan) {
  const text = latest.toLowerCase();
  if (text.includes("study") || text.includes("abroad") || text.includes("university")) {
    const top = plan.studyAbroad[0];
    return `${top.country} is the strongest first shortlist based on your current preference. Focus on ${top.programs.slice(0, 2).join(" or ")} programs, then verify ${top.eligibility} Next step: ${top.nextStep}`;
  }
  if (text.includes("resume")) {
    return `For your resume, lead with a ${plan.careers[0].title} headline, quantify projects or internships, and add keywords from ${plan.skillGap.missing.slice(0, 3).join(", ")} once you build evidence for them.`;
  }
  if (text.includes("job")) {
    const job = plan.jobs[0];
    return `${job.title} is the best current match at ${job.match}%. Build proof for ${job.requiredSkills.join(", ")} and apply with a role-specific resume.`;
  }
  return `Your strongest path is ${plan.careers[0].title}. I would next ask: which matters most for you right now, faster employability, study abroad ROI, or long-term career growth?`;
}

function mergePlan(localPlan, aiPlan) {
  return {
    ...localPlan,
    ...aiPlan,
    careers: Array.isArray(aiPlan.careers) && aiPlan.careers.length ? aiPlan.careers : localPlan.careers,
    skillGap: aiPlan.skillGap || localPlan.skillGap,
    studyAbroad: Array.isArray(aiPlan.studyAbroad) && aiPlan.studyAbroad.length ? aiPlan.studyAbroad : localPlan.studyAbroad,
    roadmap: Array.isArray(aiPlan.roadmap) && aiPlan.roadmap.length ? aiPlan.roadmap : localPlan.roadmap,
    jobs: Array.isArray(aiPlan.jobs) && aiPlan.jobs.length ? aiPlan.jobs : localPlan.jobs
  };
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}
