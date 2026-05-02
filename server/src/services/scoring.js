export function normalize(value) {
  return String(value || "").toLowerCase();
}

export function tokenize(profile) {
  return [
    ...(profile.interests || []),
    ...(profile.skills || []),
    profile.education,
    profile.goals,
    profile.experience
  ]
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter(Boolean);
}

export function overlapScore(tokens, keywords) {
  const tokenSet = new Set(tokens);
  const hits = keywords.filter((keyword) => tokenSet.has(keyword.toLowerCase()) || tokens.join(" ").includes(keyword.toLowerCase()));
  return Math.min(98, Math.round((hits.length / Math.max(keywords.length, 1)) * 100) + 35);
}

export function skillCoverage(userSkills, requiredSkills) {
  const normalizedSkills = userSkills.map(normalize);
  const matched = requiredSkills.filter((skill) =>
    normalizedSkills.some((candidate) => candidate.includes(normalize(skill)) || normalize(skill).includes(candidate))
  );
  const missing = requiredSkills.filter((skill) => !matched.includes(skill));
  return {
    matched,
    missing,
    score: Math.round((matched.length / requiredSkills.length) * 100)
  };
}
