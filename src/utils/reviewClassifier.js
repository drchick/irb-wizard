/**
 * IRB Review Type Classifier
 * Based on 45 CFR 46 (Common Rule), FDA regulations, and UB HRPP Plan
 */

export const REVIEW_TYPES = {
  NOT_RESEARCH:         'NOT_RESEARCH',
  NOT_HUMAN_SUBJECTS:   'NOT_HUMAN_SUBJECTS',
  EXEMPT:               'EXEMPT',
  EXPEDITED:            'EXPEDITED',
  FULL_BOARD:           'FULL_BOARD',
  INSUFFICIENT_INFO:    'INSUFFICIENT_INFO',
};

// Sensitive topic categories that may preclude exemption
const SENSITIVE_TOPICS = [
  'sexual behavior',
  'drug use',
  'illegal activities',
  'mental health',
  'immigration status',
  'financial distress',
  'abuse',
  'criminal behavior',
];

/**
 * Primary classifier function.
 * Returns { type, category, reasons, recommendations, confidence }
 */
export function classifyReview(formData) {
  const { prescreening, subjects, procedures, risks, data, consent } = formData;

  // ── 0. Insufficient information ──────────────────────────────────────────
  if (prescreening.isResearch === null || prescreening.involvesHumanSubjects === null) {
    return {
      type: REVIEW_TYPES.INSUFFICIENT_INFO,
      category: null,
      reasons: ['Complete the Pre-Screening section to determine review type.'],
      recommendations: [],
      confidence: 0,
    };
  }

  // ── 1. Not research ───────────────────────────────────────────────────────
  if (prescreening.isResearch === false) {
    return {
      type: REVIEW_TYPES.NOT_RESEARCH,
      category: null,
      reasons: [
        'Activity does not meet the federal definition of research (systematic investigation designed to develop or contribute to generalizable knowledge).',
        'IRB review is not required. However, consult your IRB office if uncertain.',
      ],
      recommendations: [
        'Confirm with your IRB administrator that your activity qualifies as non-research (e.g., quality improvement, program evaluation, classroom exercise).',
        'If you plan to publish or present findings, IRB review may be needed.',
      ],
      confidence: 0.9,
    };
  }

  // ── 2. Not human subjects ─────────────────────────────────────────────────
  if (prescreening.involvesHumanSubjects === false) {
    return {
      type: REVIEW_TYPES.NOT_HUMAN_SUBJECTS,
      category: null,
      reasons: [
        'Research does not involve human subjects as defined by 45 CFR 46.102(e).',
        'IRB review is not required for this activity.',
      ],
      recommendations: [
        'Verify that no living individuals are involved through intervention, interaction, or collection of identifiable information.',
        'Consult your IRB administrator if you are uncertain.',
      ],
      confidence: 0.85,
    };
  }

  // ── 3. Hard stops → Full Board ────────────────────────────────────────────
  const fullBoardTriggers = checkFullBoardTriggers(formData);
  if (fullBoardTriggers.triggered) {
    return {
      type: REVIEW_TYPES.FULL_BOARD,
      category: null,
      reasons: fullBoardTriggers.reasons,
      recommendations: generateRecommendations(formData, REVIEW_TYPES.FULL_BOARD),
      confidence: 0.9,
      flags: fullBoardTriggers.flags,
    };
  }

  // ── 4. Check exempt categories ────────────────────────────────────────────
  const exemptResult = checkExemptCategories(formData);
  if (exemptResult.qualifies) {
    return {
      type: REVIEW_TYPES.EXEMPT,
      category: exemptResult.category,
      categoryLabel: exemptResult.label,
      reasons: exemptResult.reasons,
      recommendations: generateRecommendations(formData, REVIEW_TYPES.EXEMPT),
      confidence: exemptResult.confidence,
      flags: exemptResult.flags || [],
    };
  }

  // ── 5. Check expedited categories ────────────────────────────────────────
  const expeditedResult = checkExpeditedCategories(formData);
  if (expeditedResult.qualifies) {
    return {
      type: REVIEW_TYPES.EXPEDITED,
      category: expeditedResult.category,
      categoryLabel: expeditedResult.label,
      reasons: expeditedResult.reasons,
      recommendations: generateRecommendations(formData, REVIEW_TYPES.EXPEDITED),
      confidence: expeditedResult.confidence,
      flags: expeditedResult.flags || [],
    };
  }

  // ── 6. Default: Full Board ────────────────────────────────────────────────
  return {
    type: REVIEW_TYPES.FULL_BOARD,
    category: null,
    reasons: [
      'Research does not qualify for exempt or expedited review based on answers provided.',
      'Full Board review is required.',
    ],
    recommendations: generateRecommendations(formData, REVIEW_TYPES.FULL_BOARD),
    confidence: 0.75,
    flags: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Full Board Hard Triggers
// ─────────────────────────────────────────────────────────────────────────────
function checkFullBoardTriggers(formData) {
  const { subjects, procedures, risks } = formData;
  const reasons = [];
  const flags = [];

  // Prisoners as PRIMARY subjects (not just incidental)
  if (subjects.includesPrisoners === true) {
    reasons.push('Research involves prisoners as subjects (45 CFR 46 Subpart C requires Full Board review).');
    flags.push({ severity: 'high', message: 'Prisoner research requires Full Board review and specific protections under Subpart C.' });
  }

  // Greater than minimal risk
  if (risks.riskLevel === 'greater') {
    reasons.push('Research involves greater than minimal risk to participants.');
    flags.push({ severity: 'high', message: 'Greater-than-minimal-risk research requires Full Board review.' });
  }

  // Deception without debriefing
  if (procedures.involvesDeception === true && procedures.deceptionDebriefing === false) {
    reasons.push('Research involves deception without planned debriefing.');
    flags.push({ severity: 'high', message: 'Deception studies without debriefing require Full Board review.' });
  }

  return { triggered: reasons.length > 0, reasons, flags };
}

// ─────────────────────────────────────────────────────────────────────────────
// Exempt Categories (45 CFR 46.104(d))
// ─────────────────────────────────────────────────────────────────────────────
function checkExemptCategories(formData) {
  const { subjects, procedures, data, risks } = formData;
  const methodTypes = procedures.methodTypes || [];

  // Category 1: Normal educational practices
  if (
    methodTypes.includes('educational_assessment') &&
    !subjects.includesMinors &&
    !subjects.includesPrisoners &&
    risks.riskLevel !== 'greater'
  ) {
    const flags = [];
    if (subjects.includesUBStudents) {
      flags.push({ severity: 'medium', message: 'Research with UB students requires extra care to ensure voluntariness — power dynamics between instructor and students may affect free consent.' });
    }
    return {
      qualifies: true,
      category: 1,
      label: 'Category 1 — Normal Educational Practices',
      reasons: [
        'Research involves normal educational practices, instructional strategies, or curricula in established educational settings.',
        '45 CFR 46.104(d)(1)',
      ],
      confidence: 0.85,
      flags,
    };
  }

  // Category 2: Surveys, interviews, observation of public behavior
  const isSurveyInterview =
    methodTypes.includes('survey') ||
    methodTypes.includes('interview') ||
    methodTypes.includes('observation_public');

  const identifiersCritical =
    data.collectsIdentifiers === true &&
    (data.identifierTypes || []).some(t => ['name', 'ssn', 'id_number'].includes(t));

  const sensitiveTopicFlag =
    (procedures.surveyTopics || '').toLowerCase().match(
      /sexual|drug|illegal|abuse|criminal|immigration|mental health|financial distress/i
    );

  if (isSurveyInterview && !subjects.includesMinors && !subjects.includesPrisoners) {
    if (!identifiersCritical && !sensitiveTopicFlag) {
      return {
        qualifies: true,
        category: 2,
        label: 'Category 2 — Surveys / Interviews / Observation',
        reasons: [
          'Research involves educational tests, surveys, interviews, or observation of public behavior.',
          'Disclosure of responses would not reasonably place subjects at risk of harm.',
          '45 CFR 46.104(d)(2)',
        ],
        confidence: 0.82,
        flags: [
          { severity: 'low', message: 'Ensure no sensitive topics (sexual behavior, drug use, illegal activity, etc.) are covered that could expose participants to harm.' },
        ],
      };
    }
    if (identifiersCritical || sensitiveTopicFlag) {
      return {
        qualifies: false,
        reasons: ['Identifiable data with sensitive topics may not qualify for Category 2 exemption.'],
      };
    }
  }

  // Category 3: Benign behavioral interventions (adults only, limited data)
  if (
    methodTypes.includes('behavioral_intervention') &&
    subjects.minAge >= 18 &&
    !subjects.includesMinors &&
    !subjects.includesPrisoners &&
    data.collectsIdentifiers !== true
  ) {
    return {
      qualifies: true,
      category: 3,
      label: 'Category 3 — Benign Behavioral Interventions',
      reasons: [
        'Research involves only benign behavioral interventions with adult subjects.',
        'No identifiable information will be retained or recorded.',
        '45 CFR 46.104(d)(3)',
      ],
      confidence: 0.78,
      flags: [],
    };
  }

  // Category 4: Secondary research using existing de-identified data
  if (procedures.usesExistingData === true) {
    if (procedures.dataSourcePubliclyAvailable === true) {
      return {
        qualifies: true,
        category: 4,
        label: 'Category 4 — Secondary Research (Publicly Available Data)',
        reasons: [
          'Research uses existing data, documents, or specimens that are publicly available.',
          '45 CFR 46.104(d)(4)(i)',
        ],
        confidence: 0.9,
        flags: [],
      };
    }
    if (procedures.existingDataIdentifiable === false) {
      return {
        qualifies: true,
        category: 4,
        label: 'Category 4 — Secondary Research (De-identified Data)',
        reasons: [
          'Research uses existing data/biospecimens that cannot be linked to identifiable individuals.',
          'Data is recorded such that subjects cannot be identified.',
          '45 CFR 46.104(d)(4)(ii)',
        ],
        confidence: 0.85,
        flags: [
          { severity: 'low', message: 'Confirm that no code exists linking the data to individuals, or that you cannot access the key.' },
        ],
      };
    }
  }

  // Category 6: Taste and food quality
  if (methodTypes.includes('taste_food') && risks.riskLevel === 'minimal') {
    return {
      qualifies: true,
      category: 6,
      label: 'Category 6 — Taste and Food Quality Evaluation',
      reasons: [
        'Research involves taste and food quality evaluation with wholesome foods, not a controlled substance.',
        '45 CFR 46.104(d)(6)',
      ],
      confidence: 0.9,
      flags: [],
    };
  }

  return { qualifies: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// Expedited Categories (45 CFR 46.110)
// ─────────────────────────────────────────────────────────────────────────────
function checkExpeditedCategories(formData) {
  const { subjects, procedures, risks, data } = formData;
  const methodTypes = procedures.methodTypes || [];

  // Category 2: Blood collection — minor venipuncture from healthy adults
  if (
    procedures.involvesBloodDraw === true &&
    subjects.minAge >= 18 &&
    !subjects.includesMinors &&
    !subjects.includesPrisoners &&
    risks.riskLevel === 'minimal'
  ) {
    return {
      qualifies: true,
      category: 2,
      label: 'Category 2 — Blood Collection (Venipuncture)',
      reasons: [
        'Research involves blood samples by finger stick, heel stick, or venipuncture from healthy adults.',
        '45 CFR 46.110(b)(1), Category 2',
      ],
      confidence: 0.8,
      flags: [
        { severity: 'low', message: 'Specify the amount and frequency of blood draws in your protocol. Limits: ≤550 mL in 8 weeks.' },
      ],
    };
  }

  // Category 4: Noninvasive data collection procedures
  if (
    (methodTypes.includes('survey') ||
      methodTypes.includes('interview') ||
      methodTypes.includes('observation_public') ||
      methodTypes.includes('cognitive_test')) &&
    risks.riskLevel === 'minimal' &&
    !subjects.includesPrisoners
  ) {
    const hasIdentifiers = data.collectsIdentifiers === true;
    if (hasIdentifiers || subjects.includesMinors || subjects.includesPregnantWomen || subjects.includesCognitivelyImpaired) {
      return {
        qualifies: true,
        category: 4,
        label: 'Category 4 — Noninvasive Procedures (Vulnerable Population or Identifiable)',
        reasons: [
          'Research involves noninvasive data collection with identifiable information or vulnerable populations.',
          'Qualifies for Expedited review as minimal risk research.',
          '45 CFR 46.110(b)(1), Category 4',
        ],
        confidence: 0.78,
        flags: [
          { severity: 'medium', message: subjects.includesMinors ? 'Children require parental permission and child assent.' : '' },
          { severity: 'medium', message: subjects.includesPregnantWomen ? 'Pregnant women require additional consent disclosures about fetal risk.' : '' },
        ].filter(f => f.message),
      };
    }
  }

  // Category 5: Materials collected for non-research purposes
  if (procedures.usesExistingData === true && procedures.existingDataIdentifiable === true) {
    return {
      qualifies: true,
      category: 5,
      label: 'Category 5 — Existing Records (Identifiable)',
      reasons: [
        'Research involves collection/study of data from materials already collected for non-research purposes.',
        'Identifiable data requires Expedited review.',
        '45 CFR 46.110(b)(1), Category 5',
      ],
      confidence: 0.75,
      flags: [
        { severity: 'medium', message: 'Describe how you will access and protect identifiable existing records.' },
      ],
    };
  }

  // Category 6: Voice, video, digital, or image recordings
  if (
    procedures.involvesRecording === true &&
    risks.riskLevel === 'minimal' &&
    !subjects.includesPrisoners
  ) {
    return {
      qualifies: true,
      category: 6,
      label: 'Category 6 — Voice / Video / Image Recordings',
      reasons: [
        'Research involves collection of data from voice, video, digital, or image recordings.',
        '45 CFR 46.110(b)(1), Category 6',
      ],
      confidence: 0.82,
      flags: [
        { severity: 'low', message: 'Your consent form must disclose recording and describe how recordings will be stored, used, and destroyed.' },
      ],
    };
  }

  // Category 7: Surveys / interviews with identifiable data (sensitive or vulnerable)
  if (
    (methodTypes.includes('survey') || methodTypes.includes('interview')) &&
    data.collectsIdentifiers === true &&
    risks.riskLevel === 'minimal'
  ) {
    return {
      qualifies: true,
      category: 7,
      label: 'Category 7 — Research on Individual Characteristics or Behavior',
      reasons: [
        'Research on individual or group characteristics, behavior, or factors affecting health using surveys or interviews with identifiable data.',
        '45 CFR 46.110(b)(1), Category 7',
      ],
      confidence: 0.75,
      flags: [
        { severity: 'medium', message: 'Ensure strong data security procedures given identifiable data collection.' },
        { severity: 'low', message: 'Consider whether de-identification is feasible to potentially qualify for Exempt status.' },
      ],
    };
  }

  return { qualifies: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// Recommendations Engine
// ─────────────────────────────────────────────────────────────────────────────
function generateRecommendations(formData, reviewType) {
  const { subjects, procedures, data, consent, risks } = formData;
  const recs = [];

  // Recommendations for expediting approval
  if (reviewType === REVIEW_TYPES.FULL_BOARD) {
    recs.push({
      type: 'expedite',
      priority: 'high',
      title: 'Consider De-identification',
      body: 'If you collect no identifiable information, you may qualify for Exempt or Expedited review. Evaluate whether your research question can be answered without linking data to individuals.',
    });
    if (!subjects.includesPrisoners && !subjects.includesMinors) {
      recs.push({
        type: 'expedite',
        priority: 'medium',
        title: 'Review Exempt Categories',
        body: 'Full Board may not be required. Work with your Faculty Advisor to review whether your methodology qualifies for Exempt Category 2 (surveys/interviews of public behavior) or Expedited Category 7.',
      });
    }
  }

  // CITI training
  recs.push({
    type: 'compliance',
    priority: 'high',
    title: 'CITI Training',
    body: 'Ensure all investigators and research staff have current CITI training (valid for 3 years). For student research, both PI and Faculty Advisor must have active certifications.',
  });

  // Vulnerable populations
  if (subjects.includesMinors) {
    recs.push({
      type: 'protection',
      priority: 'high',
      title: 'Parental Permission & Child Assent',
      body: 'Research involving minors requires both written parental permission AND age-appropriate child assent (if child is capable of providing it). Prepare separate assent and permission forms.',
    });
  }
  if (subjects.includesPregnantWomen) {
    recs.push({
      type: 'protection',
      priority: 'high',
      title: 'Pregnant Women Disclosure',
      body: '45 CFR 46 Subpart B applies. Your consent form must disclose known/unknown risks to the fetus and pregnancy. If risk to fetus is unknown, include standard OHRP language.',
    });
  }
  if (subjects.includesCognitivelyImpaired) {
    recs.push({
      type: 'protection',
      priority: 'high',
      title: 'LAR / Capacity Assessment',
      body: 'Research with cognitively impaired subjects requires Legally Authorized Representative (LAR) consent and/or assessment of the subject\'s decision-making capacity. Describe your capacity assessment process.',
    });
  }
  if (subjects.includesUBStudents) {
    recs.push({
      type: 'protection',
      priority: 'medium',
      title: 'Student Coercion Prevention',
      body: 'When recruiting UB students, explicitly state in the consent form that participation will not affect grades, standing, or any other academic benefits. For extra credit, provide an equivalent alternative activity.',
    });
  }

  // Data security
  if (data.collectsIdentifiers === true && data.dataEncrypted !== true) {
    recs.push({
      type: 'compliance',
      priority: 'high',
      title: 'Encrypt Identifiable Data',
      body: 'UB IRB requires that all electronic files linking participant identity to data be encrypted. Use BitLocker (Windows) or FileVault 2 (Mac), or store on UB secure network drives.',
    });
  }

  // Consistency: participant numbers
  if (subjects.totalParticipants && subjects.totalParticipants > 0) {
    recs.push({
      type: 'consistency',
      priority: 'low',
      title: 'Verify Participant Count Consistency',
      body: `You've indicated ${subjects.totalParticipants} total participants. Ensure this number is used consistently throughout your protocol description, consent form, and any recruitment materials.`,
    });
  }

  // Consent recommendations
  if (consent.waiverOfDocumentation === true) {
    recs.push({
      type: 'compliance',
      priority: 'medium',
      title: 'Waiver of Documentation Requirements',
      body: 'A waiver of signed consent documentation requires the IRB to determine that: (1) the only link between subject and research is the consent form and the principal risk is breach of confidentiality, OR (2) research involves minimal risk with no non-research written consent requirement.',
    });
  }

  if (procedures.involvesDeception === true) {
    recs.push({
      type: 'compliance',
      priority: 'high',
      title: 'Deception Protocol Requirements',
      body: 'Deception studies require: (1) a debriefing plan with specific script, (2) justification that research cannot be conducted without deception, and (3) IRB-approved debriefing materials. Include all three in your submission.',
    });
  }

  // Recording
  if (procedures.involvesRecording === true) {
    recs.push({
      type: 'compliance',
      priority: 'medium',
      title: 'Recording Consent Language',
      body: 'Your consent form must include a separate recording section with checkboxes allowing participants to consent or decline recording while still participating in the study (if applicable).',
    });
  }

  return recs;
}
