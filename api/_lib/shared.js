// Shared logic for IRB AI endpoints (used by both local dev server and Vercel serverless functions)
import Anthropic from '@anthropic-ai/sdk';

// ── Anthropic client ──────────────────────────────────────────────────────────
export function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not set in environment');
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// ── Robust JSON extractor ─────────────────────────────────────────────────────
export function extractJSON(raw) {
  let text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try { return JSON.parse(text); } catch (_) {}
  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch (_) {}
  }
  throw new SyntaxError('Could not extract valid JSON from AI response');
}

// ── Shared system prompt ──────────────────────────────────────────────────────
export const SYSTEM_PROMPT = `You are an experienced IRB (Institutional Review Board) reviewer at a US university.
You have deep expertise in 45 CFR 46 (the Common Rule), FDA human subjects regulations,
the Belmont Report principles (Respect for Persons, Beneficence, Justice), and OHRP guidance documents.

Your role in this tool is ADVISORY ONLY. You are helping a researcher pre-screen their
IRB protocol application before formal submission. Your goals are to:
1. Identify ambiguities, gaps, or inconsistencies in the narrative sections
2. Ask clarifying questions the researcher should answer before submitting
3. Suggest a probable review level based on what is described (not a final determination)
4. Flag potential regulatory concerns with specific citations when applicable

IMPORTANT RULES:
- You are NOT making a final IRB determination. Only the IRB can do that.
- Be collegial and constructive. Frame questions as "Please clarify..." or "Help us understand..."
- Questions must be SPECIFIC to the text provided, not generic boilerplate.
- Focus on gaps that would cause a real IRB to send a revision request.
- Output ONLY valid JSON matching the schema below. No markdown, no preamble, no trailing text.

OUTPUT SCHEMA (strict JSON, no markdown fences):
{
  "reviewSuggestion": "EXEMPT" or "EXPEDITED" or "FULL_BOARD" or "CANNOT_DETERMINE",
  "confidence": <float 0.0-1.0>,
  "reasoning": "<1-2 sentence paragraph explaining the suggestion>",
  "clarifyingQuestions": [
    {
      "question": "<specific question referencing the researcher's actual text>",
      "why": "<1 sentence: why an IRB reviewer would ask this>",
      "importance": "high" or "medium" or "low"
    }
  ],
  "flags": [
    { "severity": "error" or "warning" or "info", "message": "<specific concern>" }
  ],
  "reviewerNotes": "<2-3 sentence overall assessment of this section>"
}

Return 3-7 clarifying questions. Prioritize high-importance ones first.`;

// ── Per-section prompt builders ───────────────────────────────────────────────
export function buildPerSectionPrompt(section, sectionData, formDataSummary) {
  const ctx = `STUDY CONTEXT:
- Study title: ${formDataSummary.studyTitle || '(not yet provided)'}
- Project type: ${formDataSummary.projectType || '(not yet provided)'}
- Participant count: ${formDataSummary.subjectsCount || '(not yet provided)'}
- Includes vulnerable populations: ${formDataSummary.includesVulnerable ? 'Yes' : 'No'}
- Risk level: ${formDataSummary.riskLevel || '(not yet provided)'}
- Current rules-based review estimate: ${formDataSummary.currentReviewType || 'INSUFFICIENT_INFO'}`;

  switch (section) {
    case 'study':
      return `You are reviewing the STUDY OVERVIEW section of an IRB protocol application.

${ctx}
Additional context: Funding=${sectionData.fundingSource || 'none'}, Multi-site=${sectionData.isMultiSite}

NARRATIVE TEXT PROVIDED BY RESEARCHER:

[Purpose and Objectives]
${sectionData.studyPurpose || '(not provided)'}

[Scientific Background and Rationale]
${sectionData.scientificBackground || '(not provided)'}

[Research Questions / Hypotheses]
${sectionData.researchQuestions || '(not provided)'}

[Research Methodology]
${sectionData.methodology || '(not provided)'}

[Study Sites]
${sectionData.studySites || '(not provided)'}

As an IRB reviewer, analyze these narratives. Focus on:
- Is the scientific rationale sufficient to justify human subjects involvement?
- Are the research questions specific enough for a reviewer to assess scope?
- Is the methodology detailed enough to identify what will be done to/with participants?
- Are there inconsistencies between the project type and the described methodology?
- Is there adequate justification for why human subjects are necessary?`;

    case 'subjects':
      return `You are reviewing the RESEARCH SUBJECTS section of an IRB protocol application.

${ctx}
Vulnerable populations: Minors=${sectionData.includesMinors}, Prisoners=${sectionData.includesPrisoners}, Pregnant=${sectionData.includesPregnantWomen}, Cognitively impaired=${sectionData.includesCognitivelyImpaired}, UB students=${sectionData.includesUBStudents}, Economically disadvantaged=${sectionData.includesEconomicallyDisadvantaged}
Age range: ${sectionData.minAge || '?'} – ${sectionData.maxAge || '?'}
Recruitment methods: ${(sectionData.recruitmentMethod || []).join(', ') || '(none selected)'}
Compensation offered: ${sectionData.compensationOffered}

NARRATIVE TEXT PROVIDED BY RESEARCHER:

[Subject Population Description]
${sectionData.subjectPopulation || '(not provided)'}

[Inclusion Criteria]
${sectionData.inclusionCriteria || '(not provided)'}

[Exclusion Criteria]
${sectionData.exclusionCriteria || '(not provided)'}

[Compensation Details]
${sectionData.compensationDetails || '(not provided)'}

As an IRB reviewer, analyze these narratives. Focus on:
- Are inclusion/exclusion criteria specific enough to actually screen participants?
- If vulnerable populations are selected, is scientific justification for their inclusion present?
- Is compensation described clearly — amount, schedule, and proration for early withdrawal?
- Are there power-dynamic concerns (e.g., UB students/employees as subjects)?
- Do the criteria align with the study purpose described in the overview?`;

    case 'procedures':
      return `You are reviewing the RESEARCH PROCEDURES section of an IRB protocol application.

${ctx}
Methods used: ${(sectionData.methodTypes || []).join(', ') || '(none selected)'}
Special flags: Deception=${sectionData.involvesDeception}, Debriefing=${sectionData.deceptionDebriefing}, Recording=${sectionData.involvesRecording}, Blood draw=${sectionData.involvesBloodDraw}, Biospecimens=${sectionData.involvesOtherBiospecimen}, Physical procedures=${sectionData.involvesPhysicalProcedure}, Randomization=${sectionData.involvesRandomization}, Existing data=${sectionData.usesExistingData}

NARRATIVE TEXT PROVIDED BY RESEARCHER:

[Survey Topics and Content]
${sectionData.surveyTopics || '(not applicable)'}

[Interview Topics and Protocol]
${sectionData.interviewTopics || '(not applicable)'}

[Deception Description]
${sectionData.deceptionDescription || '(not applicable)'}

[Randomization Description]
${sectionData.randomizationDescription || '(not applicable)'}

[Biospecimen Collection]
${sectionData.biospecimenDescription || '(not applicable)'}

[Physical Procedures]
${sectionData.physicalProcedureDescription || '(not applicable)'}

As an IRB reviewer, analyze these narratives. Focus on:
- Are procedure descriptions specific enough to assess risk and burden?
- If deception is used, is scientific justification for why it's necessary present?
- If sensitive survey/interview topics are mentioned, are they acknowledged and justified?
- Is participant burden (time, discomfort, emotional) proportionate to study goals?
- For biospecimens or physical procedures: is staff training/qualifications mentioned?`;

    case 'risks':
      return `You are reviewing the RISK & SAFETY section of an IRB protocol application.

${ctx}
Self-reported risk level: ${sectionData.riskLevel || '(not selected)'}
Vulnerable populations included: ${formDataSummary.includesVulnerable ? 'Yes' : 'No'}
Has Data Safety Monitoring Board: ${sectionData.hasDataSafetyMonitoring}
Direct benefits to participants: ${sectionData.directBenefits}

NARRATIVE TEXT PROVIDED BY RESEARCHER:

[Physical Risks]
${sectionData.physicalRisks || '(none identified)'}

[Psychological / Emotional Risks]
${sectionData.psychologicalRisks || '(none identified)'}

[Privacy / Confidentiality Risks]
${sectionData.privacyRisks || '(none identified)'}

[Social / Reputational Risks]
${sectionData.socialRisks || '(none identified)'}

[Legal Risks]
${sectionData.legalRisks || '(none identified)'}

[Economic Risks]
${sectionData.economicRisks || '(none identified)'}

[Risk Minimization Strategies]
${sectionData.riskMinimization || '(not provided)'}

[Societal Benefits]
${sectionData.societalBenefits || '(not provided)'}

[Adverse Event Monitoring Plan]
${sectionData.adverseEventPlan || '(not provided)'}

As an IRB reviewer, analyze these narratives. Focus on:
- Are identified risks specific and honest — not minimized or vague?
- Is the risk minimization plan concrete with specific tools, procedures, and safeguards?
- Does the self-assessed risk level (${sectionData.riskLevel}) match what the narratives describe?
- Is the risk-benefit balance adequately articulated?
- For vulnerable populations, are group-specific protections described?`;

    case 'data':
      return `You are reviewing the DATA MANAGEMENT & PRIVACY section of an IRB protocol application.

${ctx}
Data identifiability: Anonymous=${sectionData.anonymousData}, Coded=${sectionData.codedData}, Identifiable=${sectionData.collectsIdentifiers}
Identifiers collected: ${(sectionData.identifierTypes || []).join(', ') || '(none)'}
Encrypted: ${sectionData.dataEncrypted}
Storage locations: ${(sectionData.dataStorageLocation || []).join(', ') || '(none selected)'}
Retention: ${sectionData.retentionPeriod} ${sectionData.retentionUnit}
Data shared externally: ${sectionData.dataShared}
HIPAA applicable: ${sectionData.hipaaApplicable}

NARRATIVE TEXT PROVIDED BY RESEARCHER:

[Who Has Access to Data]
${sectionData.dataAccessList || '(not provided)'}

[Data Destruction Method]
${sectionData.destructionMethod || '(not provided)'}

[Data Sharing Details]
${sectionData.dataSharingDetails || '(not provided)'}

[Coding Key Security]
${sectionData.codingKeyDescription || '(not applicable)'}

As an IRB reviewer, analyze these narratives. Focus on:
- Is the data security plan sufficient given the identifiability level?
- Are access controls described with specificity (named roles, not generic "study team")?
- Is the retention period justified and appropriate (federally funded research = 6 years minimum)?
- If data sharing is planned, are safeguards (DUA, de-identification standards) described?
- Are HIPAA obligations correctly identified given the data being collected?`;

    case 'consent':
      return `You are reviewing the INFORMED CONSENT section of an IRB protocol application.

${ctx}
Consent required: ${sectionData.consentRequired}
Waiver of consent requested: ${sectionData.waiverOfConsent}
Documented consent: ${sectionData.documentedConsent}
Waiver of documentation: ${sectionData.waiverOfDocumentation}
Online consent: ${sectionData.onlineConsent}
Translation needed: ${sectionData.translationNeeded}
Minors involved: ${sectionData.includesMinors} (from subjects section)
Parental permission required: ${sectionData.parentPermissionRequired}
Child assent required: ${sectionData.assentRequired}

NARRATIVE TEXT PROVIDED BY RESEARCHER:

[Consent Process Description]
${sectionData.consentProcess || '(not provided)'}

[Key Risks to Highlight in Consent]
${sectionData.keyRisksForConsent || '(not provided)'}

[Key Benefits to Describe in Consent]
${sectionData.keyBenefitsForConsent || '(not provided)'}

[Waiver of Consent Justification]
${sectionData.waiverBasis || '(not applicable)'}

As an IRB reviewer, analyze these narratives. Focus on:
- Is the consent process described step-by-step with enough detail for a reviewer?
- If a waiver is requested, does the justification address all four criteria in 45 CFR 46.116(c) or (d)?
- Are the key risks listed here consistent with the risks described in the Risk section?
- For online consent: are required elements mentioned (ability to print, no forced participation)?
- If minors are involved, is the assent/parental permission process described appropriately?`;

    default:
      return `Review this IRB protocol section (${section}) and provide feedback.\n\nSection data: ${JSON.stringify(sectionData, null, 2)}`;
  }
}

// ── Comprehensive prompt builder ──────────────────────────────────────────────
export function buildComprehensivePrompt(formData, rulesBased) {
  const { study, subjects, procedures, risks, data, consent } = formData;
  const rb = rulesBased || {};

  const vulnerableFlags = [
    subjects.includesMinors && 'minors',
    subjects.includesPrisoners && 'prisoners',
    subjects.includesPregnantWomen && 'pregnant women',
    subjects.includesCognitivelyImpaired && 'cognitively impaired',
    subjects.includesUBStudents && 'UB students',
    subjects.includesEconomicallyDisadvantaged && 'economically disadvantaged',
  ].filter(Boolean).join(', ') || 'none';

  const identifiability = data.anonymousData ? 'fully anonymous'
    : data.codedData ? 'coded (indirect identifiers)'
    : data.collectsIdentifiers ? 'directly identifiable'
    : 'not specified';

  return `You are performing a HOLISTIC REVIEW of a complete IRB protocol application.
The automated rules-based classifier reached a preliminary determination.
Your task is to assess the full protocol as an experienced IRB reviewer would.

RULES-BASED DETERMINATION:
Type: ${rb.type || 'INSUFFICIENT_INFO'}
Category: ${rb.categoryLabel || 'N/A'}
Confidence: ${rb.confidence ? Math.round(rb.confidence * 100) + '%' : 'N/A'}
Basis: ${(rb.reasons || []).join('; ') || 'N/A'}

--- STUDY OVERVIEW ---
Title: ${study.title || '(not provided)'}
Type: ${study.projectType || '(not provided)'} | Funding: ${study.fundingSource || 'none'} | Multi-site: ${study.isMultiSite}
Purpose: ${study.studyPurpose || '(not provided)'}
Background: ${study.scientificBackground || '(not provided)'}
Research Questions: ${study.researchQuestions || '(not provided)'}
Methodology: ${study.methodology || '(not provided)'}

--- SUBJECTS ---
N=${subjects.totalParticipants || '?'}, Ages ${subjects.minAge || '?'}-${subjects.maxAge || '?'}
Vulnerable populations: ${vulnerableFlags}
Population: ${subjects.subjectPopulation || '(not provided)'}
Inclusion: ${subjects.inclusionCriteria || '(not provided)'}
Exclusion: ${subjects.exclusionCriteria || '(not provided)'}
Compensation: ${subjects.compensationDetails || 'none described'}

--- PROCEDURES ---
Methods: ${(procedures.methodTypes || []).join(', ') || '(none selected)'}
Survey topics: ${procedures.surveyTopics || '(N/A)'}
Interview topics: ${procedures.interviewTopics || '(N/A)'}
Deception: ${procedures.involvesDeception} | Debriefing planned: ${procedures.deceptionDebriefing}
Recording: ${procedures.involvesRecording} | Blood draw: ${procedures.involvesBloodDraw} | Biospecimens: ${procedures.involvesOtherBiospecimen}
Randomization: ${procedures.involvesRandomization} — ${procedures.randomizationDescription || '(no description)'}

--- RISKS ---
Self-assessed level: ${risks.riskLevel || '(not selected)'}
Physical: ${risks.physicalRisks || '(none)'}
Psychological: ${risks.psychologicalRisks || '(none)'}
Privacy: ${risks.privacyRisks || '(none)'}
Minimization: ${risks.riskMinimization || '(not described)'}
Adverse event plan: ${risks.adverseEventPlan || '(not described)'}
Societal benefits: ${risks.societalBenefits || '(not described)'}

--- DATA ---
Identifiability: ${identifiability}
Identifiers: ${(data.identifierTypes || []).join(', ') || 'none'}
Encrypted: ${data.dataEncrypted}
Access: ${data.dataAccessList || '(not described)'}
Retention: ${data.retentionPeriod} ${data.retentionUnit}
Sharing: ${data.dataSharingDetails || 'none'}
HIPAA: ${data.hipaaApplicable}

--- CONSENT ---
Required: ${consent.consentRequired} | Waiver requested: ${consent.waiverOfConsent}
Process: ${consent.consentProcess || '(not described)'}
Key risks in consent: ${consent.keyRisksForConsent || '(not described)'}
Waiver basis: ${consent.waiverBasis || '(N/A)'}

Provide a holistic assessment. In your analysis, address:
1. Cross-section consistency: do identified risks match the procedures? Do consent disclosures match the risks?
2. Whether the rules-based determination (${rb.type || 'N/A'}) appears correct, or whether you see factors suggesting a different review level
3. The most critical gaps that would cause a real IRB to return this protocol for revision
4. Any relevant regulatory citations (45 CFR 46 subpart, specific OHRP guidance, FDA 21 CFR 50)
Provide 5-7 clarifying questions covering the most significant cross-section issues.`;
}
