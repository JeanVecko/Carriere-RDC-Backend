import type { AtsResult } from "@generated/prisma/enums.ts";

export type AtsCriteria = {
  minEducationLevel: string;
  minExperienceYears: number;
  requiredLanguages: string[];
  keySkills: string[];
};

export type CandidateAnswers = {
  educationLevel: string;
  experienceYears: number;
  languages: string[];
  skills: string[];
};

const EDUCATION_LEVELS = [
  "Sans diplôme",
  "Diplôme d'État",
  "Bac+2",
  "Bac+3",
  "Bac+4",
  "Bac+5 et plus",
];

function meetsEducation(criteria: AtsCriteria, answers: CandidateAnswers): boolean {
  const required = EDUCATION_LEVELS.indexOf(criteria.minEducationLevel);
  const provided = EDUCATION_LEVELS.indexOf(answers.educationLevel);
  if (required === -1 || provided === -1) return false;
  return provided >= required;
}

function meetsExperience(criteria: AtsCriteria, answers: CandidateAnswers): boolean {
  return answers.experienceYears >= criteria.minExperienceYears;
}

function meetsLanguages(criteria: AtsCriteria, answers: CandidateAnswers): boolean {
  const provided = new Set(answers.languages.map((l) => l.toLowerCase()));
  return criteria.requiredLanguages.every((lang) => provided.has(lang.toLowerCase()));
}

function meetsSkills(criteria: AtsCriteria, answers: CandidateAnswers): boolean {
  if (criteria.keySkills.length === 0) return true;
  const provided = new Set(answers.skills.map((s) => s.toLowerCase()));
  const matched = criteria.keySkills.filter((skill) => provided.has(skill.toLowerCase()));
  return matched.length === criteria.keySkills.length;
}

/**
 * Mirrors the mandatory-criteria scoring described in the cadrage doc (section 5.3):
 * all four groups met -> MATCH, 1-2 missing -> PARTIAL, 3+ missing -> NO_MATCH.
 */
export function scoreApplication(
  criteria: AtsCriteria,
  answers: CandidateAnswers
): AtsResult {
  const checks = [
    meetsEducation(criteria, answers),
    meetsExperience(criteria, answers),
    meetsLanguages(criteria, answers),
    meetsSkills(criteria, answers),
  ];

  const missing = checks.filter((met) => !met).length;

  if (missing === 0) return "MATCH";
  if (missing <= 2) return "PARTIAL";
  return "NO_MATCH";
}
