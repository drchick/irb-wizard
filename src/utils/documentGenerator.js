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
