import { askOpenAI } from "./openai.js";

export async function reviewInterviewAnswer({ profile, answer }) {
  const localFeedback = buildLocalFeedback(profile, answer);
  const aiFeedback = await askOpenAI({
    system: "You are a supportive interview coach. Return strict JSON with score, feedback, improvedAnswer, confidenceTip.",
    user: JSON.stringify({ profile, answer, localFeedback }),
    json: true
  }).catch(() => null);

  return aiFeedback || localFeedback;
}

function buildLocalFeedback(profile, answer) {
  const wordCount = answer.trim().split(/\s+/).length;
  const hasMetric = /\d|percent|%|increase|decrease|reduced|improved/i.test(answer);
  const hasStructure = /situation|task|action|result|first|then|finally/i.test(answer);
  const score = Math.min(95, 52 + (wordCount > 60 ? 15 : 5) + (hasMetric ? 15 : 0) + (hasStructure ? 13 : 0));

  return {
    score,
    feedback: `Your answer is ${wordCount > 60 ? "detailed" : "a little brief"}. ${hasStructure ? "It has a clear structure." : "Add a Situation, Action, Result structure."} ${hasMetric ? "The measurable detail helps credibility." : "Add one measurable outcome to make it stronger."}`,
    improvedAnswer: `A stronger version should connect the example to ${profile.goals || "the target role"}, name the problem, explain your action, and end with a measurable result or learning.`,
    confidenceTip: "Pause before answering, lead with the outcome, and keep eye contact while explaining the action you personally took."
  };
}
