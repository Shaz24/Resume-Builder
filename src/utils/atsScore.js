// ─── ATS Score Calculator ─────────────────────────────────────────────────────

const TECH_KEYWORDS = [
  'javascript','python','java','react','node','sql','html','css','git',
  'api','aws','docker','typescript','mongodb','express','vue','angular',
  'machine learning','data science','algorithms','agile','rest','graphql',
  'linux','github','ci/cd','kubernetes','redis','postgresql','mysql',
];

const ACTION_VERBS = [
  'developed','built','implemented','designed','created','optimized',
  'improved','led','managed','collaborated','engineered','deployed',
  'automated','integrated','delivered','achieved','increased','reduced',
];

export function calculateATSScore(resumeData) {
  if (!resumeData) return { score: 0, breakdown: {} };

  const text = JSON.stringify(resumeData).toLowerCase();
  
  let score = 0;
  const breakdown = {};

  // Section completeness (40 pts)
  const sections = { summary: 10, education: 8, skills: 8, projects: 8, achievements: 6 };
  let sectionScore = 0;
  Object.entries(sections).forEach(([key, pts]) => {
    const val = resumeData[key];
    const exists = Array.isArray(val) ? val.length > 0 : Boolean(val);
    if (exists) sectionScore += pts;
  });
  breakdown.sections = sectionScore;
  score += sectionScore;

  // Keywords (30 pts)
  const foundKeywords = TECH_KEYWORDS.filter(kw => text.includes(kw));
  const kwScore = Math.min(30, Math.round((foundKeywords.length / TECH_KEYWORDS.length) * 40));
  breakdown.keywords = kwScore;
  score += kwScore;

  // Action verbs (15 pts)
  const foundVerbs = ACTION_VERBS.filter(v => text.includes(v));
  const verbScore = Math.min(15, foundVerbs.length * 3);
  breakdown.actionVerbs = verbScore;
  score += verbScore;

  // Skills count (15 pts)
  const skills = resumeData.skills || [];
  const skillScore = Math.min(15, skills.length * 2);
  breakdown.skills = skillScore;
  score += skillScore;

  const finalScore = Math.min(99, score);

  return {
    score: finalScore,
    grade: finalScore >= 85 ? 'Excellent' : finalScore >= 70 ? 'Good' : finalScore >= 55 ? 'Fair' : 'Needs Work',
    color: finalScore >= 85 ? '#4edea3' : finalScore >= 70 ? '#adc6ff' : finalScore >= 55 ? '#fbbf24' : '#f87171',
    breakdown,
    foundKeywords,
  };
}
