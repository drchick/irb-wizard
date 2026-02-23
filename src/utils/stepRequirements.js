/**
 * stepRequirements.js
 *
 * Defines required fields for each wizard step and provides a helper
 * to identify which required fields are currently unfilled.
 *
 * Used by WizardShell to show soft completion warnings before navigation.
 */

// ─── Per-step required field definitions ─────────────────────────────────────
//
// Each entry is a function that receives formData and returns an array of
// { field, label } objects for required fields that are NOT yet satisfied.
//
// Return value conventions:
//   null / undefined / '' / [] all count as "not filled"
//   false counts as a valid answer (e.g. "No" to a YesNo question)
//   true  counts as a valid answer

function isFilled(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

const STEP_CHECKS = {
  // ── Step 1: Pre-Screening ─────────────────────────────────────────────────
  1(formData) {
    const ps = formData.prescreening;
    const missing = [];

    if (!isFilled(ps.isResearch))
      missing.push({ field: 'isResearch', label: 'Answer whether this activity is research' });

    // Only require human-subjects answer if the activity IS research
    if (ps.isResearch === true && !isFilled(ps.involvesHumanSubjects))
      missing.push({ field: 'involvesHumanSubjects', label: 'Answer whether human subjects are involved' });

    if (!isFilled(ps.hasCITITraining))
      missing.push({ field: 'hasCITITraining', label: 'Confirm CITI training status' });

    if (ps.hasCITITraining === true && !isFilled(ps.citiExpiryDate))
      missing.push({ field: 'citiExpiryDate', label: 'CITI training expiration date' });

    return missing;
  },

  // ── Step 2: Researcher Info ───────────────────────────────────────────────
  2(formData) {
    const r  = formData.researcher;
    const ps = formData.prescreening;
    const missing = [];

    if (!isFilled(r.piFirstName))  missing.push({ field: 'piFirstName',  label: 'PI first name' });
    if (!isFilled(r.piLastName))   missing.push({ field: 'piLastName',   label: 'PI last name' });
    if (!isFilled(r.piEmail))      missing.push({ field: 'piEmail',      label: 'PI email address' });
    if (!isFilled(r.piDepartment)) missing.push({ field: 'piDepartment', label: 'PI department' });

    if (ps.isStudentResearcher === true && !isFilled(r.advisorEmail))
      missing.push({ field: 'advisorEmail', label: 'Faculty advisor email' });

    return missing;
  },

  // ── Step 3: Study Overview ────────────────────────────────────────────────
  3(formData) {
    const s = formData.study;
    const missing = [];

    if (!isFilled(s.studyTitle))   missing.push({ field: 'studyTitle',   label: 'Study title' });
    if (!isFilled(s.studyPurpose)) missing.push({ field: 'studyPurpose', label: 'Study purpose / specific aims' });

    return missing;
  },

  // ── Step 4: Subjects ──────────────────────────────────────────────────────
  4(formData) {
    const s = formData.subjects;
    const missing = [];

    if (!isFilled(s.targetPopulation))  missing.push({ field: 'targetPopulation',  label: 'Target population description' });
    if (!isFilled(s.estimatedSubjects)) missing.push({ field: 'estimatedSubjects', label: 'Estimated number of subjects' });

    return missing;
  },

  // ── Step 5: Procedures ───────────────────────────────────────────────────
  5(formData) {
    const p = formData.procedures;
    const missing = [];

    if (!isFilled(p.methodTypes))
      missing.push({ field: 'methodTypes', label: 'At least one data collection method' });

    return missing;
  },

  // ── Step 6: Risks ─────────────────────────────────────────────────────────
  6(formData) {
    const r = formData.risks;
    const missing = [];

    if (!isFilled(r.riskLevel))
      missing.push({ field: 'riskLevel', label: 'Risk level assessment' });

    return missing;
  },

  // ── Step 7: Data ──────────────────────────────────────────────────────────
  7(formData) {
    const d = formData.data;
    const missing = [];

    if (!isFilled(d.dataSecurity))
      missing.push({ field: 'dataSecurity', label: 'Data security measures' });

    return missing;
  },

  // ── Step 8: Consent ───────────────────────────────────────────────────────
  8(formData) {
    const c = formData.consent;
    const missing = [];

    if (!isFilled(c.consentProcess))
      missing.push({ field: 'consentProcess', label: 'Consent process description' });

    return missing;
  },

  // Steps 9–10 have no gated required fields (review / output steps)
  9:  () => [],
  10: () => [],
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Return an array of missing required fields for the given step.
 *
 * @param {number} stepNumber — 1-indexed step
 * @param {object} formData   — WizardContext formData object
 * @returns {{ field: string, label: string }[]}  empty = step complete
 */
export function getMissingFields(stepNumber, formData) {
  const check = STEP_CHECKS[stepNumber];
  if (!check) return [];
  try {
    return check(formData) ?? [];
  } catch {
    return [];
  }
}
