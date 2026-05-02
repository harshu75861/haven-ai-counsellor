import { careerCatalog } from "../data/catalog.js";
import { askOpenAI } from "./openai.js";
import { tokenize } from "./scoring.js";

export async function buildResume({ profile, role }) {
  const localResume = buildLocalResume(profile, role);
  const aiResume = await askOpenAI({
    system: "You are an ATS resume expert. Return strict JSON with name, headline, summary, skills, experience, education, keywords.",
    user: JSON.stringify({ profile, role, localResume }),
    json: true
  }).catch(() => null);

  return aiResume || localResume;
}

function buildLocalResume(profile, role) {
  const tokens = tokenize(profile);
  const matchingCareer = careerCatalog
    .map((career) => ({
      career,
      hits: career.keywords.filter((keyword) => tokens.includes(keyword.toLowerCase())).length
    }))
    .sort((a, b) => b.hits - a.hits)[0]?.career;
  const keywords = unique([...(matchingCareer?.requiredSkills || []), role, "Client communication", "Problem solving"]);

  return {
    name: profile.name || "Haven Candidate",
    headline: `${role} candidate | ${profile.education || "Career transition profile"}`,
    summary: `Career-focused candidate targeting ${role} roles with strengths in ${(profile.skills || []).slice(0, 4).join(", ") || "research, communication, and structured problem solving"}. Interested in ${profile.goals || "building measurable business impact"}.`,
    skills: unique([...(profile.skills || []), ...keywords]).slice(0, 12),
    experience: [
      profile.experience || "Built academic and independent projects aligned with target career goals.",
      "Translated research into structured recommendations, presentations, and action plans.",
      "Collaborated with peers and mentors to solve ambiguous business or technical problems."
    ],
    education: profile.education || "Education details to be added",
    keywords
  };
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}
