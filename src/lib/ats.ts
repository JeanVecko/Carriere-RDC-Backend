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

export type AtsScoreResult = {
  result: AtsResult;
  score: number;
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

function languagesMatchRatio(criteria: AtsCriteria, answers: CandidateAnswers): number {
  if (criteria.requiredLanguages.length === 0) return 1;
  const provided = new Set(answers.languages.map((l) => l.toLowerCase()));
  const matched = criteria.requiredLanguages.filter((lang) => provided.has(lang.toLowerCase()));
  return matched.length / criteria.requiredLanguages.length;
}

function skillsMatchRatio(criteria: AtsCriteria, answers: CandidateAnswers): number {
  if (criteria.keySkills.length === 0) return 1;
  const provided = new Set(answers.skills.map((s) => s.toLowerCase()));
  const matched = criteria.keySkills.filter((skill) => provided.has(skill.toLowerCase()));
  return matched.length / criteria.keySkills.length;
}

/**
 * Combine deux niveaux de restitution pour le recruteur :
 * - `result` reprend la classification à 3 paliers du cadrage (section 5.3) :
 *   0 critère manquant -> MATCH, 1-2 -> PARTIAL, 3-4 -> NO_MATCH.
 * - `score` est un pourcentage plus fin (0-100), chaque groupe de critère
 *   pesant 25 points ; langues/compétences sont crédités au prorata du
 *   nombre d'éléments requis effectivement couverts par le candidat.
 */
export function scoreApplication(
  criteria: AtsCriteria,
  answers: CandidateAnswers
): AtsScoreResult {
  const educationMet = meetsEducation(criteria, answers);
  const experienceMet = meetsExperience(criteria, answers);
  const languagesRatio = languagesMatchRatio(criteria, answers);
  const skillsRatio = skillsMatchRatio(criteria, answers);

  const checks = [educationMet, experienceMet, languagesRatio === 1, skillsRatio === 1];
  const missing = checks.filter((met) => !met).length;

  const result: AtsResult = missing === 0 ? "MATCH" : missing <= 2 ? "PARTIAL" : "NO_MATCH";
  const score = Math.round(
    (educationMet ? 25 : 0) + (experienceMet ? 25 : 0) + languagesRatio * 25 + skillsRatio * 25
  );

  return { result, score };
}
