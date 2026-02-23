/**
 * Consistency Checker
 * Detects internal contradictions and incomplete cross-references in the IRB form.
 */

export function checkConsistency(formData) {
  const issues = [];
  const { prescreening, subjects, procedures, risks, data, consent } = formData;

  // ── Participant count consistency ──────────────────────────────────────────
  const total = Number(subjects.totalParticipants);
  if (total > 0) {
    // Age flags
    const minAge = Number(subjects.minAge);
    const maxAge = Number(subjects.maxAge);
    if (minAge && maxAge && minAge > maxAge) {
      issues.push({
        severity: 'error',
        section: 'subjects',
        field: 'minAge',
        title: 'Age Range Conflict',
        message: `Minimum age (${minAge}) is greater than maximum age (${maxAge}). Correct the age range.`,
      });
    }
    if (minAge < 18 && subjects.includesMinors === false) {
      issues.push({
        severity: 'error',
        section: 'subjects',
        field: 'includesMinors',
        title: 'Minor Age Conflict',
        message: `Minimum age is ${minAge} but you indicated no minors will be included. Reconcile or set minimum age to 18.`,
      });
    }
    if (minAge >= 18 && subjects.includesMinors === true) {
      issues.push({
        severity: 'warning',
        section: 'subjects',
        field: 'includesMinors',
        title: 'Minor Inclusion Mismatch',
        message: `You indicated minors will participate but minimum age is ${minAge} (18+). Verify your age range.`,
      });
    }
  }

  // ── Blood draw amount plausibility ────────────────────────────────────────
  if (procedures.involvesBloodDraw === true) {
    const amount = Number(procedures.bloodDrawAmount);
    if (amount > 550) {
      issues.push({
        severity: 'error',
        section: 'procedures',
        field: 'bloodDrawAmount',
        title: 'Blood Draw Volume Exceeds Federal Limit',
        message: `${amount} mL exceeds the federal guideline of 550 mL per 8-week period for minimal-risk research. Revise or plan for full board review.`,
      });
    }
    if (!procedures.bloodDrawAmount || !procedures.bloodDrawFrequency) {
      issues.push({
        severity: 'warning',
        section: 'procedures',
        field: 'bloodDrawAmount',
        title: 'Blood Draw Details Incomplete',
        message: 'Specify the amount (mL) and frequency of blood draws — required for IRB review.',
      });
    }
  }

  // ── Recording without consent language ───────────────────────────────────
  if (procedures.involvesRecording === true && consent.consentRequired !== false) {
    if (!consent.consentProcess || !consent.consentProcess.toLowerCase().includes('record')) {
      issues.push({
        severity: 'warning',
        section: 'consent',
        field: 'consentProcess',
        title: 'Recording Not Addressed in Consent',
        message: 'You indicated recordings will be made, but the consent process description does not mention recordings. Add a recording-specific consent section.',
      });
    }
  }

  // ── Deception without debriefing ──────────────────────────────────────────
  if (procedures.involvesDeception === true && procedures.deceptionDebriefing === false) {
    issues.push({
      severity: 'error',
      section: 'procedures',
      field: 'deceptionDebriefing',
      title: 'Deception Without Debriefing',
      message: 'Research involving deception requires a debriefing plan unless the IRB waives this requirement. Describe your debriefing procedure.',
    });
  }

  // ── Minors without assent/parental permission ─────────────────────────────
  if (subjects.includesMinors === true) {
    if (consent.assentRequired === false && subjects.minorAgeRange && Number(subjects.minorAgeRange.split('-')[0]) >= 7) {
      issues.push({
        severity: 'warning',
        section: 'consent',
        field: 'assentRequired',
        title: 'Child Assent May Be Required',
        message: 'Children ages 7 and older are generally capable of providing assent. Verify that assent is not required or document your justification.',
      });
    }
    if (consent.parentPermissionRequired === false) {
      issues.push({
        severity: 'error',
        section: 'consent',
        field: 'parentPermissionRequired',
        title: 'Parental Permission Required for Minors',
        message: 'Research involving minors requires parental or guardian permission unless the IRB grants a specific waiver (rare for non-emergency research).',
      });
    }
  }

  // ── Identifiable data without encryption plan ─────────────────────────────
  if (data.collectsIdentifiers === true && data.dataEncrypted === false) {
    issues.push({
      severity: 'error',
      section: 'data',
      field: 'dataEncrypted',
      title: 'Identifiable Data Not Encrypted',
      message: 'UB IRB requires electronic files linking participant identity to research data to be encrypted. Describe your encryption method (e.g., BitLocker, FileVault 2).',
    });
  }

  // ── Anonymous data contradiction ──────────────────────────────────────────
  if (data.anonymousData === true && data.collectsIdentifiers === true) {
    issues.push({
      severity: 'error',
      section: 'data',
      field: 'anonymousData',
      title: 'Anonymous vs. Identifiable Contradiction',
      message: 'You indicated data is anonymous but also that identifiers will be collected. These are contradictory — data cannot be both fully anonymous and identifiable. Correct one of these answers.',
    });
  }

  // ── CITI training expired ─────────────────────────────────────────────────
  if (prescreening.citiExpiryDate) {
    const expiry = new Date(prescreening.citiExpiryDate);
    const today = new Date();
    const proposedStart = formData.study.startDate ? new Date(formData.study.startDate) : today;
    if (expiry < proposedStart) {
      issues.push({
        severity: 'error',
        section: 'prescreening',
        field: 'citiExpiryDate',
        title: 'CITI Training Will Be Expired at Study Start',
        message: `Your CITI training expires on ${prescreening.citiExpiryDate}, before your proposed start date. Renew training before submitting.`,
      });
    }
  }

  // ── Student without faculty advisor ──────────────────────────────────────
  if (
    prescreening.isStudentResearcher === true &&
    prescreening.hasFacultyAdvisor === false
  ) {
    issues.push({
      severity: 'error',
      section: 'prescreening',
      field: 'hasFacultyAdvisor',
      title: 'Faculty Advisor Required for Student Research',
      message: 'UB IRB requires student researchers to have a faculty advisor who is responsible for human subject protection. You must identify a faculty advisor before submitting.',
    });
  }

  // ── No risk mitigation described ─────────────────────────────────────────
  if (risks.riskLevel && risks.riskLevel !== 'none' && !risks.riskMinimization) {
    issues.push({
      severity: 'warning',
      section: 'risks',
      field: 'riskMinimization',
      title: 'Risk Minimization Not Described',
      message: 'You identified risks to participants but did not describe how risks will be minimized. IRB reviewers require this information.',
    });
  }

  // ── No adverse event plan for greater-than-minimal risk ───────────────────
  if (risks.riskLevel === 'greater' && !risks.adverseEventPlan) {
    issues.push({
      severity: 'warning',
      section: 'risks',
      field: 'adverseEventPlan',
      title: 'Adverse Event Plan Needed',
      message: 'Greater-than-minimal-risk research requires a plan for monitoring, reporting, and managing adverse events.',
    });
  }

  // ── Study dates ───────────────────────────────────────────────────────────
  if (formData.study.startDate && formData.study.endDate) {
    const start = new Date(formData.study.startDate);
    const end = new Date(formData.study.endDate);
    if (end <= start) {
      issues.push({
        severity: 'error',
        section: 'study',
        field: 'endDate',
        title: 'Study End Date Before Start Date',
        message: 'End date must be after the start date.',
      });
    }
    const today = new Date();
    if (start < today) {
      issues.push({
        severity: 'warning',
        section: 'study',
        field: 'startDate',
        title: 'Start Date in the Past',
        message: 'Research cannot begin before receiving IRB approval. Set a start date that allows time for IRB review.',
      });
    }
  }

  // ── Consent waiver justification missing ─────────────────────────────────
  if (consent.waiverOfConsent === true && !consent.waiverBasis) {
    issues.push({
      severity: 'error',
      section: 'consent',
      field: 'waiverBasis',
      title: 'Waiver of Consent Justification Missing',
      message: 'If requesting a waiver of informed consent, you must provide the regulatory basis and justification.',
    });
  }

  // ── Prisoners without Subpart C disclosures ───────────────────────────────
  if (subjects.includesPrisoners === true) {
    issues.push({
      severity: 'warning',
      section: 'subjects',
      field: 'includesPrisoners',
      title: 'Subpart C Prisoner Protections Required',
      message: '45 CFR 46 Subpart C requires that prisoner research demonstrate subjects are not being coerced, adequate monitoring is in place, and the research offers only minimal risk or direct benefit. Address these in your protocol.',
    });
  }

  // ── Compensation must be prorated ─────────────────────────────────────────
  if (subjects.compensationOffered === true) {
    if (!subjects.compensationDetails || subjects.compensationDetails.trim().length < 20) {
      issues.push({
        severity: 'warning',
        section: 'subjects',
        field: 'compensationDetails',
        title: 'Compensation Details Incomplete',
        message: 'Describe the compensation amount, schedule, and how it will be prorated for early withdrawal. IRB reviewers will look for this.',
      });
    }
  }

  return issues;
}

export function getIssueCount(issues, severity = null) {
  if (!severity) return issues.length;
  return issues.filter(i => i.severity === severity).length;
}
