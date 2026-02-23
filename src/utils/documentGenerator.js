/**
 * Document Generator
 * Generates IRB-ready consent forms and protocol descriptions from wizard form data.
 */

// ─── Protocol Description ─────────────────────────────────────────────────────
export function generateProtocolDescription(formData) {
  const { researcher, study, subjects, procedures, risks, data, consent, prescreening } = formData;
  const piName = `${researcher.piFirstName} ${researcher.piLastName}`.trim() || '[PI Name]';
  const title  = study.title || '[Protocol Title]';
  const methodStr = (procedures.methodTypes || []).map(m => METHOD_LABELS[m] || m).join(', ') || '[methods]';
  const totalN = subjects.totalParticipants || '[N]';

  return `UNIVERSITY OF BRIDGEPORT
INSTITUTIONAL REVIEW BOARD
PROTOCOL DESCRIPTION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1: IDENTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Protocol Title: ${title}

Principal Investigator: ${piName}
  Degree/Title: ${researcher.piDegree || '[Degree]'}
  Department:   ${researcher.piDepartment || '[Department]'}
  Email:        ${researcher.piEmail || '[Email]'}
  Phone:        ${researcher.piPhone || '[Phone]'}
${prescreening.isStudentResearcher ? `
Faculty Advisor: ${researcher.advisorFirstName} ${researcher.advisorLastName}
  Department:    ${researcher.advisorDepartment || '[Department]'}
  Email:         ${researcher.advisorEmail || '[Email]'}
` : ''}
Co-Investigators / Research Associates:
  ${researcher.coInvestigators || 'None'}

Proposed Start Date: ${study.startDate || '[Date]'}
Proposed End Date:   ${study.endDate || '[Date]'}
Project Type:        ${study.projectType || '[Type]'}
Funding Source:      ${study.fundingSource || 'None'}${study.grantNumber ? `\nGrant Number:        ${study.grantNumber}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2: PURPOSE AND RATIONALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2.1 PURPOSE OF THE RESEARCH
${study.studyPurpose || '[Describe the purpose and objectives of this research.]'}

2.2 SCIENTIFIC BACKGROUND AND RATIONALE
${study.scientificBackground || '[Describe the background and scientific rationale for this study, including why human subjects are necessary.]'}

2.3 RESEARCH QUESTIONS / HYPOTHESES
${study.researchQuestions || '[State your research questions or hypotheses.]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3: RESEARCH SUBJECTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3.1 SUBJECT POPULATION
${subjects.subjectPopulation || '[Describe who the subjects are.]'}

Total Anticipated Enrollment: ${totalN} participants
Age Range: ${subjects.minAge || '[min]'} to ${subjects.maxAge || '[max]'} years

3.2 INCLUSION CRITERIA
${subjects.inclusionCriteria || '[List inclusion criteria.]'}

3.3 EXCLUSION CRITERIA
${subjects.exclusionCriteria || '[List exclusion criteria.]'}

3.4 RECRUITMENT METHODS
Participants will be recruited through: ${(subjects.recruitmentMethod || []).join(', ') || '[methods]'}.
${(subjects.recruitmentMethod || []).includes('class_announce') ? '\nNOTE: Student recruitment safeguards will be implemented to prevent coercion (see below).' : ''}

3.5 COMPENSATION
${subjects.compensationOffered === true ? subjects.compensationDetails || '[Describe compensation.]' : 'Participants will not receive compensation for their participation.'}

3.6 VULNERABLE POPULATIONS
${buildVulnerableSection(subjects)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4: RESEARCH PROCEDURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4.1 OVERVIEW OF RESEARCH DESIGN
${study.methodology || '[Describe your overall research design and methodology.]'}

Research methods: ${methodStr}
Estimated time per participant: ${procedures.participationDuration || '[N]'} ${procedures.participationDurationUnit || 'minutes'}
Total study duration: ${procedures.totalStudyDuration || '[Duration]'}
Study site(s): ${study.studySites || '[Sites]'}

4.2 DETAILED PROCEDURES

${(procedures.methodTypes || []).includes('survey') ? `SURVEYS/QUESTIONNAIRES
Participants will complete a survey covering the following topics:
${procedures.surveyTopics || '[Describe survey topics.]'}
Participants may skip any question they feel uncomfortable answering.

` : ''}${(procedures.methodTypes || []).includes('interview') ? `INTERVIEWS
Semi-structured interviews will cover the following topics:
${procedures.interviewTopics || '[Describe interview topics.]'}

` : ''}${procedures.usesExistingData ? `EXISTING DATA USE
This study will use existing data from the following source(s):
${procedures.existingDataDescription || '[Describe data source.]'}
Data identifiability: ${procedures.existingDataIdentifiable ? 'Identifiable' : procedures.dataSourcePubliclyAvailable ? 'Publicly available' : 'De-identified'}

` : ''}${procedures.involvesRecording ? `RECORDINGS
Participants will be recorded using: ${(procedures.recordingTypes || []).join(', ') || '[types]'}.
Recording consent will be obtained separately. Participants may decline recording while still participating.

` : ''}${procedures.involvesBloodDraw ? `BLOOD COLLECTION
Blood samples will be collected by venipuncture.
Amount per collection: ${procedures.bloodDrawAmount || '[N]'} mL
Collection frequency: ${procedures.bloodDrawFrequency || '[frequency]'}
Total maximum collection: [calculate] mL over 8 weeks (within the 550 mL federal guideline)

` : ''}${procedures.involvesRandomization ? `RANDOMIZATION
${procedures.randomizationDescription || '[Describe randomization procedure.]'}

` : ''}${procedures.involvesDeception ? `DECEPTION
${procedures.deceptionDescription || '[Describe deception.]'}
Debriefing: ${procedures.deceptionDebriefing ? 'Participants will be debriefed following their participation. [Attach debriefing script.]' : 'No debriefing will occur. Justification: [provide justification]'}

` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5: RISKS, BENEFITS, AND RISK-BENEFIT ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5.1 ANTICIPATED RISK LEVEL
${RISK_LEVEL_LABELS[risks.riskLevel] || '[Risk level]'}

5.2 POTENTIAL RISKS TO PARTICIPANTS

Physical risks:
${risks.physicalRisks || 'None anticipated.'}

Psychological / emotional risks:
${risks.psychologicalRisks || 'None anticipated.'}

Privacy / confidentiality risks:
${risks.privacyRisks || 'None anticipated.'}

Social / reputational risks:
${risks.socialRisks || 'None anticipated.'}

Legal risks:
${risks.legalRisks || 'None anticipated.'}

Economic risks:
${risks.economicRisks || 'None anticipated.'}

5.3 RISK MINIMIZATION PROCEDURES
${risks.riskMinimization || '[Describe how each identified risk will be minimized.]'}

5.4 POTENTIAL BENEFITS

Direct benefits to participants:
${risks.directBenefits ? risks.directBenefitDescription || '[Describe direct benefits.]' : 'Participants are not expected to receive direct personal benefits from participation.'}

Benefits to society and science:
${risks.societalBenefits || '[Describe broader benefits of the research.]'}

5.5 RISK-BENEFIT ASSESSMENT
The risks associated with this research are ${RISK_LEVEL_LABELS[risks.riskLevel] || '[level]'}. The anticipated benefits to scientific knowledge and society justify these risks. [Provide explicit risk-benefit analysis here.]

5.6 ADVERSE EVENT MONITORING
${risks.adverseEventPlan || 'Serious adverse events are not anticipated given the minimal-risk nature of this study. Any unanticipated problems involving risks to participants will be reported to the IRB within 10 business days of the PI becoming aware of the event.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 6: DATA MANAGEMENT AND CONFIDENTIALITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6.1 DATA IDENTIFIABILITY
${data.anonymousData ? 'Data will be collected anonymously. No identifiers will be collected at any point.' : data.codedData ? `Data will be coded. Identifiers will be replaced with numeric codes. The master key linking codes to identities will be stored separately from the data: ${data.codingKeyDescription || '[Describe key security]'}` : 'Data will be collected with identifiers.'}

6.2 IDENTIFIERS COLLECTED
${data.collectsIdentifiers || data.codedData ? (data.identifierTypes || []).map(t => `- ${t}`).join('\n') || '[List identifiers]' : 'None — anonymous data collection.'}

6.3 DATA STORAGE
Data will be stored in the following location(s): ${(data.dataStorageLocation || []).join(', ') || '[locations]'}

Encryption: ${data.dataEncrypted === true ? 'All electronic files containing identifiable or coded data will be encrypted using [BitLocker/FileVault 2/UB network drive].' : data.anonymousData ? 'Encryption is not required for anonymous data. However, [encryption method] will be used for additional security.' : '[Describe encryption plan — REQUIRED]'}

Access: ${data.dataAccessList || '[List who has access and their role.]'}

6.4 DATA RETENTION AND DESTRUCTION
Research data will be retained for ${data.retentionPeriod || '[N]'} ${data.retentionUnit || 'years'} following ${data.retentionFrom || 'study completion'}.

Destruction method: ${data.destructionMethod || '[Describe how data will be securely destroyed.]'}

6.5 DATA SHARING
${data.dataShared ? data.dataSharingDetails || '[Describe data sharing plans.]' : 'Research data will not be shared outside the research team.'}

${data.hipaaApplicable ? '6.6 HIPAA COMPLIANCE\nThis research involves Protected Health Information (PHI) and will comply with HIPAA requirements. [Describe HIPAA authorization or waiver basis.]' : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 7: INFORMED CONSENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${consent.consentRequired === false ? `7.1 WAIVER OF INFORMED CONSENT
A waiver of informed consent is requested on the following basis:
${consent.waiverBasis || '[State basis]'}

Justification:
${consent.waiverJustification || '[Provide detailed justification for each waiver criterion.]'}` : `7.1 CONSENT PROCESS
${consent.consentProcess || '[Describe the consent process step by step.]'}

7.2 CONSENT DOCUMENTATION
${consent.documentedConsent ? 'Participants will sign a written informed consent form.' : consent.waiverOfDocumentation ? `A waiver of documentation of informed consent is requested.
Basis: ${consent.waiverDocBasis || '[State basis]'}
Participants will receive an information sheet and proceeding with participation implies consent.` : '[Describe consent documentation approach.]'}

7.3 CONSENT LANGUAGE
Primary language: ${consent.consentLanguage || 'English'}
${consent.translationNeeded ? 'Translated consent forms will be provided for non-English speaking participants.' : ''}

${subjects.includesMinors ? `7.4 PARENTAL PERMISSION AND CHILD ASSENT
Parental/guardian permission: ${consent.parentPermissionRequired ? 'Required — written permission form will be obtained.' : '[State approach]'}
Child assent: ${consent.assentRequired ? 'Required — age-appropriate assent form will be administered.' : 'Not required / IRB waiver will be sought.'}` : ''}`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
END OF PROTOCOL DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Verify that all participant counts, dates, and specific details match across this document, all consent forms, and all recruitment materials before submitting.]
`;
}

// ─── Exempt Consent Information Sheet ─────────────────────────────────────────
export function generateExemptConsentSheet(formData) {
  const { researcher, study, subjects, procedures, risks, data, consent } = formData;
  const piName = `${researcher.piFirstName} ${researcher.piLastName}`.trim() || '[PI Name]';
  const totalN = subjects.totalParticipants || '[N]';
  const duration = `${procedures.participationDuration || '[N]'} ${procedures.participationDurationUnit || 'minutes'}`;

  return `UNIVERSITY OF BRIDGEPORT
RESEARCH INFORMATION SHEET
(Exempt Research — No Signature Required)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESEARCH TITLE: ${study.title || '[Study Title]'}

PRINCIPAL INVESTIGATOR: ${piName}
  ${researcher.piDepartment ? `Department: ${researcher.piDepartment}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are invited to participate in a research study. This research is being conducted by ${piName} at the
University of Bridgeport. Your participation is completely voluntary. You may withdraw at any time
without penalty or loss of benefits to which you are otherwise entitled.

PURPOSE OF THE STUDY
${study.studyPurpose || '[Describe the purpose in plain language.]'}

You are being asked to participate in this research study because ${subjects.subjectPopulation ? `you are ${subjects.subjectPopulation.toLowerCase()}` : '[explain eligibility]'}.

STUDY TASKS OR PROCEDURES
If you decide to participate, you will be asked to: ${buildProceduresSummary(procedures)}.

${procedures.involvesRecording ? `This study involves ${(procedures.recordingTypes || []).join(' and ') || 'recording'}. [State whether participation is possible without being recorded.]` : ''}

DURATION OF PARTICIPATION
Your participation in this study will require approximately ${duration}.

CONFIDENTIALITY
${buildConfidentialitySection(data)}

CONTACTS AND QUESTIONS
If you have questions about this study, please contact:

  Principal Investigator: ${piName}
  Email: ${researcher.piEmail || '[email]'}
  Phone: ${researcher.piPhone || '[phone]'}

For questions about your rights as a participant in this study or to discuss other study-related
concerns or complaints with someone who is not part of the research team, you may contact:

  University of Bridgeport IRB Administrator
  Email: irb@bridgeport.edu

${subjects.compensationOffered === true ? `INCENTIVES
${subjects.compensationDetails || '[Describe compensation.]'}
By law, payments to subjects are considered taxable income.` : ''}

${data.hipaaApplicable ? 'This research involves Protected Health Information (PHI). [Include HIPAA authorization information here.]' : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DO NOT SIGN THIS FORM. KEEP A COPY FOR YOUR RECORDS.
Proceeding with participation indicates that you have read and understood this information.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

// ─── Full Informed Consent Form ───────────────────────────────────────────────
export function generateFullConsentForm(formData) {
  const { researcher, study, subjects, procedures, risks, data, consent } = formData;
  const piName = `${researcher.piFirstName} ${researcher.piLastName}`.trim() || '[PI Name]';
  const totalN = subjects.totalParticipants || '[N]';
  const duration = `${procedures.participationDuration || '[N]'} ${procedures.participationDurationUnit || 'minutes'}`;

  return `UNIVERSITY OF BRIDGEPORT
CONSENT TO BE PART OF A RESEARCH STUDY

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KEY INFORMATION ABOUT THE RESEARCHER(S) AND THIS STUDY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Study Title:           ${study.title || '[Study Title]'}
Study Sponsor:         ${study.fundingSource && study.fundingSource !== 'none' ? study.fundingSource : 'Not externally sponsored'}
Principal Investigator: ${piName}, ${researcher.piDegree || '[Degree]'}
                        ${researcher.piDepartment || '[Department]'}, University of Bridgeport

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1: INVITATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are invited to take part in this research study. You are invited to be in this study because
${subjects.subjectPopulation ? subjects.subjectPopulation.toLowerCase() : '[explain why this person is being asked]'}.

Taking part in this research study is voluntary.

Note: To participate in this study, you must be at least ${subjects.minAge || 18} years old.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2: KEY INFORMATION SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please read the following summary carefully before reviewing the rest of this document.

WHAT IS THIS STUDY ABOUT?
${study.studyPurpose || '[Brief plain-language description of the study purpose.]'}

WHAT WILL I BE ASKED TO DO?
If you agree to participate, you will: ${buildProceduresSummary(procedures)}.
This will take approximately ${duration}.

WHAT ARE THE MAIN RISKS?
${consent.keyRisksForConsent || risks.psychologicalRisks || risks.physicalRisks || 'The risks of this study are minimal. [List key risks from Section 5.]'}

WHAT ARE THE BENEFITS?
${consent.keyBenefitsForConsent || (risks.directBenefits ? risks.directBenefitDescription : 'You may not personally benefit from this study. However, your participation will contribute to ' + (risks.societalBenefits || 'scientific knowledge in this area') + '.')}

DO I HAVE TO PARTICIPATE?
No. Participation is completely voluntary. If you decide not to participate, it will not affect you
in any way. You may stop at any time without penalty.

Now that you have the key information about this study, please review the rest of this document
for other important details.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3: WHAT WILL HAPPEN IN THIS STUDY?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE OF THE STUDY
${study.studyPurpose || '[Full description of study purpose.]'}

Background: ${study.scientificBackground || '[Scientific background.]'}

This study will enroll approximately ${totalN} participants in total.

WHAT HAPPENS IF I SAY YES?

${buildDetailedProcedures(procedures, subjects, data)}

PARTICIPATION TIMELINE
Your total participation time will be approximately ${duration}.
The overall study will run from ${study.startDate || '[start]'} to ${study.endDate || '[end]'}.

WHAT HAPPENS IF I SAY NO?
You may decide not to take part in the research and it will not be held against you.
${subjects.includesUBStudents ? 'If you are a student seeking extra credit, alternative ways to earn equivalent extra credit include: [describe alternatives].' : ''}

WHAT IF I CHANGE MY MIND LATER?
You agree to take part in the research now. You may stop at any time and it will not be held
against you. You will be notified of all significant new findings during the course of the study
that may affect your willingness to continue.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4: RISKS AND BENEFITS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RISKS OF PARTICIPATING

${[
  risks.physicalRisks && `Physical risks: ${risks.physicalRisks}`,
  risks.psychologicalRisks && `Psychological/emotional risks: ${risks.psychologicalRisks}`,
  risks.privacyRisks && `Privacy risks: ${risks.privacyRisks}`,
  risks.socialRisks && `Social risks: ${risks.socialRisks}`,
  risks.legalRisks && `Legal risks: ${risks.legalRisks}`,
  risks.economicRisks && `Economic risks: ${risks.economicRisks}`,
].filter(Boolean).join('\n\n') || 'This research study involves no more than minimal risk.'}

Steps taken to minimize risks:
${risks.riskMinimization || '[Describe risk minimization procedures.]'}

${risks.riskLevel === 'greater' ? `INJURY OR ILLNESS RELATED TO RESEARCH
If you are injured or made sick from taking part in this research study, the University of Bridgeport
does not have a program for compensating subjects for complications related to human subjects research.
However, the study personnel will assist you in getting treatment. [Describe any available care.]` : `This research study involves no more than minimal risk — the probability and magnitude of harm anticipated in this research are not greater than those ordinarily encountered in daily life.`}

BENEFITS

${risks.directBenefits
  ? `Possible direct benefits: We cannot promise any benefits to you from your taking part in this research.
However, possible benefits include: ${risks.directBenefitDescription || '[describe]'}.`
  : 'You may not directly benefit from participating in this study.'}

Benefits to others and society: ${risks.societalBenefits || '[Describe broader benefits.]'}

Note: Compensation for participation is not considered a direct benefit.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5: CONFIDENTIALITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${buildConfidentialitySection(data)}

Organizations that may access research records include the IRB and other authorized representatives
of the University of Bridgeport.${study.fundingSource && study.fundingSource !== 'none' ? ' The study sponsor may also have access to research records for monitoring purposes.' : ''}

You will not be identified in any publication or presentation arising from this research. Data will
be presented in summary or aggregate form only.

${data.certificateOfConfidentiality ? `CERTIFICATE OF CONFIDENTIALITY
This study has a Certificate of Confidentiality from the [federal agency]. This means the researchers
cannot be forced to reveal information that may identify you, even by a court subpoena, in any federal,
state, or local civil, criminal, administrative, legislative, or other proceedings.` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 6: OTHER IMPORTANT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPENSATION
${subjects.compensationOffered === true
  ? `${subjects.compensationDetails || '[Describe compensation.]'}\n\nBy law, payments to subjects are considered taxable income.`
  : 'Participants will not receive payment for their participation in this research study.'}
${subjects.extraCreditOffered === true ? '\nIf you are earning extra credit through your participation, please understand that this is not the only way to do so. You may contact your instructor who will offer you an appropriate alternative activity.' : ''}

SIGNIFICANT NEW FINDINGS
We WILL tell you about any new information that may affect your health, welfare, or choice to remain
in the research.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 7: CONTACTS AND QUESTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Take as long as you like before you make a decision. We will be happy to answer any questions
you have about this study. If you have questions or concerns, please contact:

  Principal Investigator: ${piName}
  Email: ${researcher.piEmail || '[email]'}
  Phone: ${researcher.piPhone || '[phone]'}

If you have questions about your rights as a research participant, or wish to obtain information,
ask questions, or discuss any concerns about this study with someone other than the researcher(s),
you may contact:

  University of Bridgeport IRB Administrator
  Email: irb@bridgeport.edu
  This research has been reviewed and approved by an Institutional Review Board.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 8: RECORD OF INFORMATION PROVIDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your signature in the next section means that you have received a copy of this consent form.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 9: SIGNATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NOTE: By signing this form, you agree to voluntarily enter this study. You have had a chance to
read this consent form, and it was explained to you in a language you use and understand. You have
had the opportunity to ask questions and have received satisfactory answers. You understand that
you can withdraw at any time.

PARTICIPANT:

Signature: _________________________ Date: ___________
Printed Name: _______________________________

PERSON OBTAINING CONSENT:

Signature: _________________________ Date: ___________
Printed Name: _______________________________${procedures.involvesRecording ? `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPTIONAL: RECORDING CONSENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This study involves ${(procedures.recordingTypes || []).join(' and ') || 'recording'} of participants.

[STATE WHETHER: If you do not agree to be recorded, you CAN STILL / CANNOT take part in the study.]

□ I agree to be recorded.
□ I do not agree to be recorded.

Signature: _________________________ Date: ___________
Printed Name: _______________________________` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[DELETE THIS PAGE WHEN UPLOADING TO MENTOR IRB — FOR PREPARER USE ONLY]

REQUIRED ELEMENTS CHECKLIST (45 CFR 46.116):
□ Statement this involves research + voluntary participation
□ Purpose, expected duration, and procedures described
□ Foreseeable risks/discomforts described
□ Benefits described
□ Alternative procedures mentioned (if applicable)
□ Confidentiality disclosure
□ Greater-than-minimal-risk: compensation/treatment info
□ PI and IRB contact information
□ Statement that participation is voluntary and may be withdrawn
□ Approximate number of subjects: ${totalN}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

// ─── Helper functions ─────────────────────────────────────────────────────────
const METHOD_LABELS = {
  survey: 'survey/questionnaire', interview: 'interview', focus_group: 'focus group',
  observation_public: 'observation', observation_lab: 'controlled observation',
  educational_assessment: 'educational assessment', behavioral_intervention: 'behavioral intervention',
  cognitive_test: 'cognitive testing', physiological: 'physiological measurement',
  clinical_procedure: 'clinical procedure', taste_food: 'taste/food evaluation',
  secondary_data: 'secondary data analysis', other: 'other procedures',
};

const RISK_LEVEL_LABELS = {
  none: 'No anticipated risk to participants.',
  minimal: 'Minimal risk — probability and magnitude of harm is not greater than ordinarily encountered in daily life.',
  minor: 'Minor increase over minimal risk.',
  greater: 'Greater than minimal risk — Full Board review required.',
};

function buildProceduresSummary(procedures) {
  const methods = procedures.methodTypes || [];
  const parts = [];
  if (methods.includes('survey'))              parts.push('complete a survey or questionnaire');
  if (methods.includes('interview'))           parts.push('participate in an interview');
  if (methods.includes('focus_group'))         parts.push('participate in a focus group discussion');
  if (methods.includes('observation_public') || methods.includes('observation_lab')) parts.push('be observed');
  if (methods.includes('cognitive_test'))      parts.push('complete cognitive or psychological assessments');
  if (methods.includes('educational_assessment')) parts.push('complete educational assessments or activities');
  if (methods.includes('behavioral_intervention')) parts.push('engage in specific activities or tasks');
  if (methods.includes('physiological'))       parts.push('have physiological measurements taken');
  if (procedures.involvesBloodDraw)            parts.push('provide blood samples');
  if (procedures.involvesOtherBiospecimen)     parts.push('provide biological specimens');
  if (procedures.usesExistingData)             return 'have your existing records or data accessed';
  return parts.length > 0 ? parts.join(', ') : '[describe procedures]';
}

function buildDetailedProcedures(procedures, subjects, data) {
  let text = '';
  if (procedures.involvesRandomization) {
    const n = 2; // default to 2 groups
    text += `RANDOMIZATION\nWe will assign you to 1 of ${n} study groups by chance, like flipping a coin. Your group is not based on what you want or what seems best for you. You will have an equal chance of being in either group. If you agree to participate, you will need to be okay with being in either group.\n\n${procedures.randomizationDescription || '[Describe groups]'}\n\n`;
  }
  if ((procedures.methodTypes || []).includes('survey')) {
    text += `SURVEY\nYou will complete a survey about: ${procedures.surveyTopics || '[topics]'}. You may skip any question you feel uncomfortable answering.\n\n`;
  }
  if ((procedures.methodTypes || []).includes('interview')) {
    text += `INTERVIEW\nYou will participate in a ${procedures.involvesRecording ? (procedures.recordingTypes || []).join('/') + '-recorded ' : ''}interview. Topics will include: ${procedures.interviewTopics || '[topics]'}.\n\n`;
  }
  if (procedures.involvesDeception) {
    text += `[NOTE TO PREPARER: Do NOT disclose the deception in the consent form. After the study, participants will be debriefed about the true purpose.]\n\n`;
  }
  return text || '[Describe exactly what participants will experience during the study, in chronological order.]';
}

function buildConfidentialitySection(data) {
  if (data.anonymousData) {
    return `Your responses are anonymous. No information that could identify you will be collected at any time.
Data will be stored on: ${(data.dataStorageLocation || []).join(', ') || '[locations]'}.`;
  }
  if (data.codedData) {
    return `Efforts will be made to limit your personal information to people who have a need to review this information. We cannot promise complete secrecy.

Your data will be coded with a numeric identifier. The key linking your identity to your code will be stored separately from your data in a secure, encrypted location. Access is limited to: ${data.dataAccessList || '[authorized personnel]'}.

${data.destructionMethod ? `The master key will be destroyed: ${data.destructionMethod}` : 'The master key will be destroyed at the end of the retention period.'}`;
  }
  return `Efforts will be made to limit your personal information, including research study records, to people who have a need to review this information. We cannot promise complete secrecy.

Your data will be stored on encrypted systems. Access is limited to: ${data.dataAccessList || '[authorized personnel]'}.

${data.destructionMethod ? `Data destruction: ${data.destructionMethod}` : 'Data will be securely destroyed at the end of the retention period.'}`;
}

function buildVulnerableSection(subjects) {
  const parts = [];
  if (subjects.includesMinors) parts.push(`MINORS: This study will include participants ages ${subjects.minorAgeRange || subjects.minAge + '–17'}. Parental/guardian permission and child assent will be obtained as required.`);
  if (subjects.includesPrisoners) parts.push(`PRISONERS: This study will include incarcerated individuals. Additional protections per 45 CFR 46 Subpart C will be implemented. [Describe safeguards.]`);
  if (subjects.includesPregnantWomen) parts.push(`PREGNANT WOMEN: This study may include pregnant women. Risks to the fetus and pregnancy will be disclosed per 45 CFR 46 Subpart B.`);
  if (subjects.includesCognitivelyImpaired) parts.push(`COGNITIVELY IMPAIRED: This study will include individuals with diminished decision-making capacity. Capacity assessment procedures and LAR consent will be implemented. [Describe process.]`);
  if (subjects.includesUBStudents) parts.push(`UB STUDENTS/EMPLOYEES: This study recruits from populations with a potential power relationship to the researcher. Safeguards to ensure voluntary participation: [describe safeguards].`);
  return parts.length > 0 ? parts.join('\n\n') : 'No vulnerable populations will be included in this study.';
}

// ─── Parental / Guardian Permission Form ──────────────────────────────────────
export function generateParentalPermissionForm(formData) {
  const { researcher, study, subjects, procedures, risks, data, consent } = formData;
  const piName = `${researcher.piFirstName} ${researcher.piLastName}`.trim() || '[PI Name]';
  const duration = `${procedures.participationDuration || '[N]'} ${procedures.participationDurationUnit || 'minutes'}`;

  return `UNIVERSITY OF BRIDGEPORT
INSTITUTIONAL REVIEW BOARD
PARENTAL / GUARDIAN PERMISSION FORM

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STUDY TITLE: ${study.title || '[Study Title]'}
PRINCIPAL INVESTIGATOR: ${piName}
  Department: ${researcher.piDepartment || '[Department]'}
  Email:      ${researcher.piEmail || '[Email]'}
  Phone:      ${researcher.piPhone || '[Phone]'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are being asked to give permission for your child, [CHILD'S NAME], to take part in a research study at the University of Bridgeport conducted by ${piName}. Participation is completely voluntary.

Your child is being asked to participate because ${subjects.subjectPopulation ? subjects.subjectPopulation.toLowerCase() : '[explain eligibility]'}.

PURPOSE OF THE STUDY
${study.studyPurpose || '[Describe the study purpose in plain language.]'}

WHAT WILL MY CHILD BE ASKED TO DO?
If you give permission, your child will: ${buildProceduresSummary(procedures)}.
Estimated time: ${duration}.

${procedures.involvesDeception ? '[NOTE: Some study details will be explained to your child after participation.]' : ''}

RISKS
${risks.psychologicalRisks || risks.physicalRisks || 'This research involves no more than minimal risk — no greater than activities your child encounters in daily life.'}

Steps to minimize risk: ${risks.riskMinimization || '[Describe safeguards.]'}

BENEFITS
${risks.directBenefits ? risks.directBenefitDescription || '[Describe benefits]' : 'Your child may not directly benefit from participating.'}
Benefits to others: ${risks.societalBenefits || '[Describe]'}

CONFIDENTIALITY
${data.anonymousData ? 'Responses are anonymous. No identifying information about your child will be collected.' :
data.codedData ? `Your child's data will be coded. The key linking identity to data will be stored separately. Access limited to: ${data.dataAccessList || '[authorized personnel]'}.` :
`Your child's information will be kept confidential. Access limited to: ${data.dataAccessList || '[authorized personnel]'}.`}

COMPENSATION
${subjects.compensationOffered ? subjects.compensationDetails || '[Describe compensation]' : 'There is no compensation for participation.'}

VOLUNTARY PARTICIPATION
Your child's participation is completely voluntary. You may refuse or withdraw your child at any time without penalty. This will not affect your child's standing at the University of Bridgeport.

CHILD ASSENT
${consent.assentRequired ? 'In addition to your permission, your child\'s assent will be obtained before participation begins.' : 'Because of your child\'s age, a separate assent form is not required.'}

CONTACTS AND QUESTIONS
Study questions:  ${piName} — ${researcher.piEmail || '[email]'} — ${researcher.piPhone || '[phone]'}
Rights questions: UB IRB Administrator — irb@bridgeport.edu

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERMISSION SIGNATURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

By signing below, I confirm I have read this form, had the chance to ask questions, and give permission for my child to participate.

Parent/Guardian Signature: _________________________ Date: ___________
Printed Name: _______________________________
Child's Name: _______________________________
Child's Date of Birth: _______________
`;
}

// ─── Child Assent Form ────────────────────────────────────────────────────────
export function generateChildAssentForm(formData) {
  const { researcher, study, subjects, procedures } = formData;
  const piName = `${researcher.piFirstName} ${researcher.piLastName}`.trim() || '[PI Name]';
  const duration = `${procedures.participationDuration || '[N]'} ${procedures.participationDurationUnit || 'minutes'}`;
  const ageRange = subjects.minorAgeRange || `${subjects.minAge || '7'}–17`;

  return `UNIVERSITY OF BRIDGEPORT
INSTITUTIONAL REVIEW BOARD
CHILD ASSENT FORM

For children ages ${ageRange}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STUDY: ${study.title || '[Study Title]'}
RESEARCHER: ${piName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi! We want to tell you about a research study and ask if you want to be in it.
A grown-up will explain this to you and answer your questions.

WHAT IS THIS STUDY ABOUT?
A researcher named ${piName} wants to learn about ${study.studyPurpose ? study.studyPurpose.toLowerCase().replace(/^(this study|we|this research)( aims to| seeks to| will| is designed to)?/i, '').trim() : '[simple description of the study topic in child-friendly language]'}.

WHY AM I BEING ASKED?
You are being asked because ${subjects.subjectPopulation ? subjects.subjectPopulation.toLowerCase() : '[explain in child-friendly terms]'}.

WHAT WILL I DO?
If you join the study, you will: ${buildProceduresSummary(procedures)}.
This will take about ${duration}.
${(procedures.methodTypes || []).includes('survey') ? '\nYou will answer some questions. You can skip any question you do not want to answer.' : ''}
${(procedures.methodTypes || []).includes('interview') ? `\nSomeone will ask you questions about ${procedures.interviewTopics || '[topics]'}. There are no right or wrong answers.` : ''}
${procedures.involvesBloodDraw ? '\nA small amount of blood will be taken from your arm. You may feel a small pinch. Tell the researcher if you feel uncomfortable — we can stop.' : ''}

WILL IT HURT?
${procedures.involvesBloodDraw ? 'You may feel a small pinch during the blood draw.' : 'No, this study will not hurt.'}

DOES ANYONE ELSE HAVE TO KNOW WHAT I SAY?
We will keep what you tell us private. We will not tell your parents, teachers, or friends, unless you are in danger.

DO I HAVE TO DO THIS?
NO! You do not have to be in this study.
• No one will be mad at you if you say no.
• Even if you say yes today, you can change your mind and stop at any time.
• Nothing bad will happen if you decide not to participate or if you stop.

DO YOU HAVE QUESTIONS?
You can ask questions any time! Talk to ${piName} or a trusted adult.
Researcher's email: ${researcher.piEmail || '[email]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR CHOICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Circle one:   YES, I want to be in this study.     NO, I do not want to be in this study.

Child's Signature / Printed Name: _________________________ Date: ___________

Researcher Signature: _________________________ Date: ___________

Parent/Guardian Witness: _________________________ Date: ___________
`;
}

// ─── Debriefing Script ────────────────────────────────────────────────────────
export function generateDebriefingScript(formData) {
  const { researcher, study, procedures } = formData;
  const piName = `${researcher.piFirstName} ${researcher.piLastName}`.trim() || '[PI Name]';

  return `UNIVERSITY OF BRIDGEPORT — IRB
DEBRIEFING SCRIPT
(Read aloud to each participant IMMEDIATELY after participation)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STUDY: ${study.title || '[Study Title]'}
RESEARCHER: ${piName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1 — THANK THE PARTICIPANT
"Thank you for participating in this study. Before you leave, I need to share some important information with you."

STEP 2 — REVEAL THE TRUE PURPOSE
"The actual purpose of this study is: ${study.studyPurpose || '[DESCRIBE TRUE STUDY PURPOSE]'}. We were unable to tell you this beforehand because ${procedures.deceptionDescription || '[EXPLAIN WHY DECEPTION WAS NECESSARY TO PRESERVE STUDY VALIDITY]'}."

STEP 3 — EXPLAIN THE DECEPTION
"During the study, [DESCRIBE SPECIFICALLY WHAT WAS WITHHELD OR MISLEADING]. This was necessary because if participants knew the true purpose, it would have affected their responses and made the research invalid."

STEP 4 — AFFIRM PARTICIPATION VALUE
"Everything you did and said is still valuable and will contribute to this research."

STEP 5 — OFFER DATA WITHDRAWAL
"Now that you know the true purpose, you have the right to withdraw your data. If you would like your responses removed, please tell me now or contact me at ${researcher.piEmail || '[email]'} within [SPECIFY TIMEFRAME]."

STEP 6 — OFFER TO ANSWER QUESTIONS
"Do you have any questions about the study or what we discussed? [PAUSE — answer honestly]"

STEP 7 — PROVIDE CONTACTS
"You can reach me at ${researcher.piEmail || '[email]'} or ${researcher.piPhone || '[phone]'}. For questions about your rights as a research participant, contact the UB IRB at irb@bridgeport.edu."

STEP 8 — REQUEST CONFIDENTIALITY
"Please do not discuss the true nature of this study with others who may be potential participants, as this could affect the validity of the research."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESEARCHER NOTES (Complete after each session)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Participant ID/Code: _______________  Date/Time: _______________
Time spent on debriefing: _______________

□ Participant acknowledged understanding of debriefing
□ Participant asked questions (describe below)
□ Participant requested data withdrawal
□ Participant showed signs of distress — follow-up action taken:

Notes: _________________________________________________________________
_______________________________________________________________________

Researcher Signature: _________________________ Date: ___________
`;
}

// ─── HIPAA Authorization Form ─────────────────────────────────────────────────
export function generateHIPAAAuthorization(formData) {
  const { researcher, study, subjects, data } = formData;
  const piName = `${researcher.piFirstName} ${researcher.piLastName}`.trim() || '[PI Name]';
  const phiTypes = (data.identifierTypes || []).length > 0
    ? data.identifierTypes.join(', ')
    : '[List specific PHI: name, date of birth, medical record number, diagnosis codes, test results, etc.]';

  return `UNIVERSITY OF BRIDGEPORT
INSTITUTIONAL REVIEW BOARD
HIPAA RESEARCH AUTHORIZATION FORM
(45 CFR § 164.508)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STUDY TITLE: ${study.title || '[Study Title]'}
PRINCIPAL INVESTIGATOR: ${piName}
  Department: ${researcher.piDepartment || '[Department]'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. DESCRIPTION OF INFORMATION TO BE USED OR DISCLOSED
The following Protected Health Information (PHI) may be used or disclosed:
${phiTypes}

[Specify time period: records from _____________ to _____________, or collected during the study period.]

2. WHO MAY USE OR DISCLOSE YOUR INFORMATION
${piName} (PI), the University of Bridgeport research team, and [LIST OTHER AUTHORIZED PERSONNEL].

3. WHO MAY RECEIVE YOUR INFORMATION
• University of Bridgeport Institutional Review Board
${study.fundingSource && study.fundingSource !== 'none' ? `• Study sponsor: ${study.fundingSource}` : ''}
• Federal and state regulatory agencies authorized to review research records
• [LIST ANY OTHER RECIPIENTS]

4. PURPOSE
Your information will be used for: ${study.studyPurpose || '[Describe the specific research purpose for which PHI is needed]'}.

5. EXPIRATION
This authorization expires at the conclusion of this research study or when data are de-identified, or [SPECIFY DATE/EVENT — whichever comes first].

6. YOUR RIGHT TO REVOKE
You may revoke this authorization at any time by submitting a written request to ${piName} at ${researcher.piEmail || '[email]'}. Revocation stops future use but does not recall information already used or disclosed.

7. EFFECT ON TREATMENT AND PAYMENT
Your decision to authorize or refuse authorization WILL NOT affect your treatment, payment, enrollment in any health plan, or eligibility for benefits.

8. RE-DISCLOSURE NOTICE
Information disclosed may be subject to re-disclosure by the recipient and may no longer be protected by federal privacy rules.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUTHORIZATION SIGNATURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

By signing below, I authorize the use and disclosure of my Protected Health Information as described above. I have received a copy of this form.

Participant Signature: _________________________ Date: ___________
Printed Name: _______________________________

[If signing as a personal representative:]
Representative Signature: _________________________ Date: ___________
Printed Name: _______________________________
Relationship to Participant: _______________
Authority to Sign: _______________
`;
}

// ─── Recruitment Email Template ───────────────────────────────────────────────
export function generateRecruitmentEmail(formData) {
  const { researcher, study, subjects, procedures } = formData;
  const piName = `${researcher.piFirstName} ${researcher.piLastName}`.trim() || '[PI Name]';
  const duration = `${procedures.participationDuration || '[N]'} ${procedures.participationDurationUnit || 'minutes'}`;
  const eligibility = [
    subjects.minAge && subjects.maxAge ? `ages ${subjects.minAge}–${subjects.maxAge}` : subjects.minAge ? `age ${subjects.minAge}+` : null,
    subjects.inclusionCriteria ? subjects.inclusionCriteria.split('\n')[0].trim() : null,
  ].filter(Boolean).join('; ') || '[eligibility criteria]';

  return `RECRUITMENT EMAIL TEMPLATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Do NOT send until IRB approval is received. Insert IRB # before sending.]

FROM:    ${piName} <${researcher.piEmail || '[email]'}>
SUBJECT: Invitation to Participate in Research Study: ${study.title || '[Study Title]'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear [Recipient / Potential Participant],

My name is ${piName}, ${researcher.piDegree ? researcher.piDegree + ',' : ''} in the Department of ${researcher.piDepartment || '[Department]'} at the University of Bridgeport. I am conducting a research study, and I am writing to invite you to participate.

ABOUT THE STUDY
${study.studyPurpose || '[Brief description of the study purpose and significance]'}

WHO CAN PARTICIPATE?
You may be eligible if: ${eligibility}.
${subjects.exclusionCriteria ? `You cannot participate if: ${subjects.exclusionCriteria.split('\n')[0].trim() || '[key exclusion criteria]'}.` : ''}

WHAT IS INVOLVED?
Participation involves: ${buildProceduresSummary(procedures)}.
Your total time commitment is approximately ${duration}.

COMPENSATION
${subjects.compensationOffered ? subjects.compensationDetails || '[Describe compensation/incentive]' : 'This study is voluntary and there is no monetary compensation.'}

HOW TO PARTICIPATE
[Choose one and delete the others:]
  • Complete the survey here: [INSERT LINK]
  • Reply to this email to schedule a session.
  • Contact me at the information below to express interest.

Participation is completely voluntary. You may withdraw at any time without penalty. All information will be kept confidential.

Thank you for your time and consideration.

Sincerely,
${piName}
${researcher.piDegree ? researcher.piDegree + ', ' : ''}${researcher.piDepartment || '[Department]'}
University of Bridgeport
Email: ${researcher.piEmail || '[email]'}
Phone: ${researcher.piPhone || '[phone]'}

P.S. This study has been reviewed and approved by the University of Bridgeport Institutional Review Board. IRB Protocol #: [INSERT AFTER APPROVAL]. Questions about your rights as a research participant? Contact irb@bridgeport.edu.
`;
}

// ─── Recruitment Flyer Template ───────────────────────────────────────────────
export function generateRecruitmentFlyer(formData) {
  const { researcher, study, subjects, procedures } = formData;
  const piName = `${researcher.piFirstName} ${researcher.piLastName}`.trim() || '[PI Name]';
  const duration = `${procedures.participationDuration || '[N]'} ${procedures.participationDurationUnit || 'minutes'}`;

  return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           RESEARCH PARTICIPANTS NEEDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${study.title || '[Study Title]'}
University of Bridgeport Research Study

[Do NOT distribute until IRB approval is received. Add IRB # before posting.]

──────────────────────────────────────────────────────────

ARE YOU ELIGIBLE?
${subjects.minAge && subjects.maxAge ? `  • Ages ${subjects.minAge}–${subjects.maxAge} years` : subjects.minAge ? `  • Age ${subjects.minAge}+` : '  • [List age requirement]'}
${(subjects.inclusionCriteria || '[List eligibility criteria]').split('\n').filter(l => l.trim()).map(l => `  • ${l.trim()}`).join('\n')}

WHAT'S INVOLVED?
  • ${buildProceduresSummary(procedures)}
  • Time commitment: approximately ${duration}
  • Location: ${study.studySites || 'Online / [location]'}

WHAT DO YOU GET?
  • ${subjects.compensationOffered ? subjects.compensationDetails || '[Describe incentive/compensation]' : 'Voluntary participation — no monetary compensation'}

ABOUT THE STUDY
${study.studyPurpose || '[One or two sentences about the purpose and importance of this research]'}

──────────────────────────────────────────────────────────
CONTACT
──────────────────────────────────────────────────────────

Researcher: ${piName}
Email:      ${researcher.piEmail || '[email]'}
Phone:      ${researcher.piPhone || '[phone]'}
Link/QR:    [INSERT SURVEY/SIGN-UP LINK OR QR CODE]

──────────────────────────────────────────────────────────
Approved by the University of Bridgeport IRB | IRB #: [Insert after approval]
`;
}

// ─── Class Announcement Script ────────────────────────────────────────────────
export function generateClassAnnouncement(formData) {
  const { researcher, study, subjects, procedures } = formData;
  const piName = `${researcher.piFirstName} ${researcher.piLastName}`.trim() || '[PI Name]';
  const duration = `${procedures.participationDuration || '[N]'} ${procedures.participationDurationUnit || 'minutes'}`;

  return `CLASS ANNOUNCEMENT / VERBAL RECRUITMENT SCRIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Estimated reading time: 45–60 seconds]
[Obtain instructor permission BEFORE making this announcement]
[Do NOT use until IRB approval is received]

STUDY: ${study.title || '[Study Title]'}
RESEARCHER: ${piName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCRIPT (read verbatim or paraphrase closely):

"Hi everyone — my name is ${piName}. I am a ${researcher.piDegree || '[degree/title]'} in the Department of ${researcher.piDepartment || '[department]'} at the University of Bridgeport.

I am conducting a research study about ${study.studyPurpose ? study.studyPurpose.substring(0, 100) + (study.studyPurpose.length > 100 ? '...' : '') : '[brief description of the study]'}, and I would like to invite you to participate.

The study involves ${buildProceduresSummary(procedures)} and will take approximately ${duration}.

${subjects.compensationOffered
  ? subjects.compensationDetails || '[Describe compensation/incentive here]'
  : 'Participation is completely voluntary and there is no compensation.'}

I want to be very clear: participation is COMPLETELY VOLUNTARY and will NOT affect your grade in this course or your relationship with this university in any way. Whether you choose to participate or not, there will be absolutely no consequences.
${subjects.extraCreditOffered ? '\nIf extra credit is available for this study, I want you to know there are other ways to earn the same credit — this is not the only option. Please speak with your instructor about alternatives.' : ''}
If you are interested in participating, please [CHOOSE ONE: see me after class / visit this link: [INSERT LINK] / scan this QR code / take one of these flyers].

Thank you for your time. Does anyone have any questions?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTACT INFORMATION (for handout / flyer):
  ${piName} — ${researcher.piEmail || '[email]'} — ${researcher.piPhone || '[phone]'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT REMINDERS:
□ Do not exert pressure on individual students
□ Do not take attendance of who signs up
□ Do not ask students individually if they plan to participate
□ If possible, leave the room before collecting sign-up information
□ Instructor permission obtained (date: _____________)
□ Class announced to: ___________________________________
□ Date/time of announcement: ___________________________

Researcher Signature: _________________________ Date: ___________
`;
}

// ─── Social Media Post Template ───────────────────────────────────────────────
export function generateSocialMediaPost(formData) {
  const { researcher, study, subjects, procedures } = formData;
  const piName = `${researcher.piFirstName} ${researcher.piLastName}`.trim() || '[PI Name]';
  const duration = `${procedures.participationDuration || '[N]'} ${procedures.participationDurationUnit || 'minutes'}`;
  const eligibility = subjects.minAge && subjects.maxAge
    ? `ages ${subjects.minAge}–${subjects.maxAge}`
    : subjects.minAge ? `age ${subjects.minAge}+` : '[eligible group]';
  const shortPost = `📢 Research participants needed! Study: "${study.title || '[Title]'}". Who: ${eligibility}. Time: ~${duration}. ${subjects.compensationOffered ? (subjects.compensationDetails || '[compensation]') + '. ' : ''}Contact: ${researcher.piEmail || '[email]'} [UB IRB approved]`.slice(0, 280);

  return `SOCIAL MEDIA RECRUITMENT POST TEMPLATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Do NOT post until IRB approval is received. Include IRB # in all posts.]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VERSION A — LONG FORM (LinkedIn / Facebook, ~100 words)
──────────────────────────────────────────────────────────
🔬 RESEARCH PARTICIPANTS NEEDED

Are you ${eligibility}? Researchers at the University of Bridgeport are seeking participants for a study about ${study.studyPurpose ? study.studyPurpose.substring(0, 100) + '...' : '[brief study description]'}.

📋 What's Involved: ${buildProceduresSummary(procedures)}
⏱ Time Commitment: Approximately ${duration}
💰 Compensation: ${subjects.compensationOffered ? subjects.compensationDetails || '[compensation details]' : 'Voluntary — no monetary compensation'}

Participation is completely voluntary and your responses will be kept confidential.

📧 Interested? Contact: ${piName} at ${researcher.piEmail || '[email]'} or visit [INSERT LINK]

#Research #UniversityOfBridgeport #[StudyTopic] #Participants #AcademicResearch

This study has been approved by the University of Bridgeport IRB. IRB #: [INSERT AFTER APPROVAL]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERSION B — SHORT FORM (Twitter/X — ≤280 chars)
──────────────────────────────────────────────────────────
${shortPost}

[Character count: ${shortPost.length}/280]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERSION C — INSTAGRAM CAPTION
──────────────────────────────────────────────────────────
📢 RESEARCH PARTICIPANTS NEEDED 📢

University of Bridgeport researchers are studying ${study.studyPurpose ? study.studyPurpose.substring(0, 80) + '...' : '[topic]'}.

✅ Who: ${eligibility}
📋 What: ${buildProceduresSummary(procedures)}
⏱ Time: ~${duration}
💰 ${subjects.compensationOffered ? subjects.compensationDetails || '[compensation]' : 'Volunteer — no pay'}

DM or click the link in bio! 👆

#UBridgeport #Research #StudyParticipants #[StudyTopic] #AcademicResearch

🔬 UB IRB Approved | IRB #: [INSERT AFTER APPROVAL]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POSTING GUIDELINES:
• Do NOT post until written IRB approval is received
• IRB approval number MUST appear in every public-facing recruitment post
• Never identify specific potential participants in posts
• Keep copies/screenshots of all posts in your IRB file
• For closed groups/communities: obtain group admin permission first
`;
}
