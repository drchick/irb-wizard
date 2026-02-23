/**
 * DOCX Document Generator — IRBWiz / Symbiotic Scholar Suite
 *
 * Generates Microsoft Word (.docx) documents from wizard form data.
 * Uses the `docx` npm package (v9) which runs entirely in the browser.
 * All exports are async and return Promise<Blob>.
 *
 * Usage:
 *   import { generateProtocolDescriptionDocx } from '../utils/docxGenerator';
 *   const blob = await generateProtocolDescriptionDocx(formData);
 *   const url  = URL.createObjectURL(blob);
 *   const a    = Object.assign(document.createElement('a'), { href: url, download: 'Protocol.docx' });
 *   a.click();
 */

import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, Table, TableRow, TableCell,
  WidthType, ShadingType,
} from 'docx';

// ─── Colour / font constants ──────────────────────────────────────────────────
const NAVY   = '1e2d4e';
const GOLD   = 'D97706';
const GRAY   = '64748b';
const FONT   = 'Calibri';
const SZ_BODY = 22;   // 11pt in half-points
const SZ_SMALL = 20;  // 10pt
const SZ_HEAD1 = 32;  // 16pt
const SZ_HEAD2 = 24;  // 12pt

// ─── Shared paragraph helpers ─────────────────────────────────────────────────

const empty = () => new Paragraph({ text: '' });

const divider = () => new Paragraph({
  text: '',
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1', space: 1 } },
  spacing: { before: 160, after: 160 },
});

/** Centered UB + IRB header block */
function ubHeader(docTitle) {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 0 },
      children: [new TextRun({ text: 'UNIVERSITY OF BRIDGEPORT', bold: true, size: SZ_HEAD2, color: NAVY, font: FONT })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 0 },
      children: [new TextRun({ text: 'INSTITUTIONAL REVIEW BOARD', size: SZ_BODY, color: GRAY, font: FONT })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 320 },
      children: [new TextRun({ text: docTitle.toUpperCase(), bold: true, size: SZ_HEAD1, color: NAVY, font: FONT })],
    }),
    divider(),
  ];
}

/** Bold section heading (Heading 2 style) */
function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 280, after: 80 },
    children: [new TextRun({ text, bold: true, size: SZ_HEAD2, color: NAVY, font: FONT, underline: {} })],
  });
}

/** Sub-heading */
function subHeading(text) {
  return new Paragraph({
    spacing: { before: 200, after: 60 },
    children: [new TextRun({ text, bold: true, size: SZ_BODY, color: NAVY, font: FONT })],
  });
}

/** Normal body paragraph — renders [Not provided] for blank values */
function bodyParagraph(text, { italic = false, indent = false } = {}) {
  const val = (text || '').trim() || '[Not provided]';
  return new Paragraph({
    indent: indent ? { left: 360 } : undefined,
    spacing: { after: 80 },
    children: [new TextRun({ text: val, size: SZ_BODY, font: FONT, italics: italic })],
  });
}

/** Label: value on one line */
function labelValue(label, value) {
  return new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: SZ_BODY, font: FONT }),
      new TextRun({ text: (value || '').trim() || '[Not provided]', size: SZ_BODY, font: FONT }),
    ],
  });
}

/** Signature line: "Label: ___________________________ Date: __________" */
function signatureLine(label) {
  return new Paragraph({
    spacing: { before: 320, after: 80 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: SZ_BODY, font: FONT }),
      new TextRun({ text: '_________________________  ', size: SZ_BODY, font: FONT }),
      new TextRun({ text: 'Date: ', bold: true, size: SZ_BODY, font: FONT }),
      new TextRun({ text: '___________', size: SZ_BODY, font: FONT }),
    ],
  });
}

/** Checkbox line */
function checkboxLine(text) {
  return new Paragraph({
    indent: { left: 360 },
    spacing: { after: 60 },
    children: [new TextRun({ text: `☐  ${text}`, size: SZ_BODY, font: FONT })],
  });
}

/** Bulleted item (manual) */
function bulletItem(text) {
  return new Paragraph({
    indent: { left: 360, hanging: 200 },
    spacing: { after: 60 },
    children: [new TextRun({ text: `•  ${text}`, size: SZ_BODY, font: FONT })],
  });
}

/** Numbered item */
function numberedItem(n, text) {
  return new Paragraph({
    indent: { left: 360, hanging: 220 },
    spacing: { after: 60 },
    children: [
      new TextRun({ text: `${n}. `, bold: true, size: SZ_BODY, font: FONT }),
      new TextRun({ text, size: SZ_BODY, font: FONT }),
    ],
  });
}

/** Shaded info box paragraph */
function infoBox(text) {
  return new Paragraph({
    shading: { type: ShadingType.SOLID, color: 'EFF6FF' },
    spacing: { before: 120, after: 120 },
    indent: { left: 200, right: 200 },
    children: [new TextRun({ text, size: SZ_SMALL, font: FONT, italics: true, color: '1e40af' })],
  });
}

/** Document page settings */
const PAGE_MARGINS = {
  top: 1080, bottom: 1080, left: 1260, right: 1260,  // ~0.75" side margins
};

// ─── Content helpers shared across documents ──────────────────────────────────

const METHOD_LABELS = {
  survey: 'survey/questionnaire', interview: 'interview', focus_group: 'focus group discussion',
  observation_public: 'observation in public settings', observation_lab: 'controlled observation',
  educational_assessment: 'educational assessment', behavioral_intervention: 'behavioral task/intervention',
  cognitive_test: 'cognitive/psychological assessment', physiological: 'physiological measurement',
  clinical_procedure: 'clinical procedure', taste_food: 'taste/food evaluation',
  secondary_data: 'existing/secondary data analysis', other: 'other procedures',
};

function procedureSummary(procedures) {
  const methods = (procedures.methodTypes || []).map(m => METHOD_LABELS[m] || m);
  if (procedures.usesExistingData) return 'have existing records or data accessed';
  return methods.length ? methods.join(', ') : '[describe study procedures]';
}

function confidentialityParagraphs(data) {
  if (data.anonymousData) {
    return [
      bodyParagraph('Your responses are completely anonymous. No information that could identify you will be collected at any point.'),
      bodyParagraph(`Data will be stored on: ${(data.dataStorageLocation || []).join(', ') || '[locations]'}.`),
    ];
  }
  if (data.codedData) {
    return [
      bodyParagraph('We will make every effort to keep your information confidential. We cannot promise complete secrecy.'),
      bodyParagraph(`Your data will be coded with a numeric identifier. The code key linking your identity to your data will be stored separately in a secure, encrypted location. Only the following individuals have access: ${data.dataAccessList || '[authorized personnel]'}.`),
      bodyParagraph(`${data.destructionMethod ? `The master key will be destroyed: ${data.destructionMethod}` : 'The master key will be securely destroyed at the end of the retention period.'}`),
    ];
  }
  return [
    bodyParagraph('We will make every effort to keep your personal information, including research records, confidential. We cannot promise complete secrecy.'),
    bodyParagraph(`Your data will be stored on encrypted systems. Access is limited to: ${data.dataAccessList || '[authorized personnel]'}.`),
    bodyParagraph(`${data.destructionMethod ? `Data destruction: ${data.destructionMethod}` : 'Data will be securely destroyed at the end of the retention period.'}`),
  ];
}

// ─── 1. Protocol Description ──────────────────────────────────────────────────
export async function generateProtocolDescriptionDocx(formData) {
  const { researcher, study, subjects, procedures, risks, data, consent, prescreening } = formData;
  const piName = `${researcher.piFirstName || ''} ${researcher.piLastName || ''}`.trim() || '[PI Name]';

  const children = [
    ...ubHeader('Protocol Description'),

    sectionHeading('Section 1: Identification'),
    labelValue('Protocol Title', study.title),
    labelValue('Principal Investigator', piName),
    labelValue('Degree/Title', researcher.piDegree),
    labelValue('Department', researcher.piDepartment),
    labelValue('Email', researcher.piEmail),
    labelValue('Phone', researcher.piPhone),
    ...(prescreening.isStudentResearcher ? [
      empty(),
      labelValue('Faculty Advisor', `${researcher.advisorFirstName || ''} ${researcher.advisorLastName || ''}`.trim() || '[Advisor Name]'),
      labelValue('Advisor Department', researcher.advisorDepartment),
      labelValue('Advisor Email', researcher.advisorEmail),
    ] : []),
    labelValue('Co-Investigators', Array.isArray(researcher.coInvestigators) ? researcher.coInvestigators.join('; ') : researcher.coInvestigators || 'None'),
    labelValue('Proposed Start Date', study.startDate),
    labelValue('Proposed End Date', study.endDate),
    labelValue('Project Type', study.projectType),
    labelValue('Funding Source', study.fundingSource),
    ...(study.grantNumber ? [labelValue('Grant Number', study.grantNumber)] : []),

    sectionHeading('Section 2: Purpose and Rationale'),
    subHeading('2.1 Purpose of the Research'),
    bodyParagraph(study.studyPurpose),
    subHeading('2.2 Scientific Background and Rationale'),
    bodyParagraph(study.scientificBackground),
    subHeading('2.3 Research Questions / Hypotheses'),
    bodyParagraph(study.researchQuestions),

    sectionHeading('Section 3: Research Subjects'),
    subHeading('3.1 Subject Population'),
    bodyParagraph(subjects.subjectPopulation),
    labelValue('Total Anticipated Enrollment', subjects.totalParticipants?.toString()),
    labelValue('Age Range', `${subjects.minAge || '[min]'} to ${subjects.maxAge || '[max]'} years`),
    subHeading('3.2 Inclusion Criteria'),
    bodyParagraph(subjects.inclusionCriteria),
    subHeading('3.3 Exclusion Criteria'),
    bodyParagraph(subjects.exclusionCriteria),
    subHeading('3.4 Recruitment Methods'),
    bodyParagraph((subjects.recruitmentMethod || []).join(', ') || '[describe methods]'),
    subHeading('3.5 Compensation'),
    bodyParagraph(subjects.compensationOffered ? subjects.compensationDetails : 'Participants will not receive compensation for their participation.'),
    subHeading('3.6 Vulnerable Populations'),
    ...buildVulnerableParas(subjects),

    sectionHeading('Section 4: Research Procedures'),
    subHeading('4.1 Overview of Research Design'),
    bodyParagraph(study.methodology),
    labelValue('Research Methods', procedureSummary(procedures)),
    labelValue('Estimated Time per Participant', `${procedures.participationDuration || '[N]'} ${procedures.participationDurationUnit || 'minutes'}`),
    labelValue('Total Study Duration', procedures.totalStudyDuration),
    labelValue('Study Site(s)', study.studySites),
    subHeading('4.2 Detailed Procedures'),
    ...buildDetailedProcedureParas(procedures),

    sectionHeading('Section 5: Risks, Benefits, and Risk-Benefit Analysis'),
    subHeading('5.1 Anticipated Risk Level'),
    bodyParagraph(RISK_LEVEL_LABELS[risks.riskLevel] || '[Risk level]'),
    subHeading('5.2 Potential Risks to Participants'),
    labelValue('Physical', risks.physicalRisks || 'None anticipated'),
    labelValue('Psychological/Emotional', risks.psychologicalRisks || 'None anticipated'),
    labelValue('Privacy/Confidentiality', risks.privacyRisks || 'None anticipated'),
    labelValue('Social/Reputational', risks.socialRisks || 'None anticipated'),
    labelValue('Legal', risks.legalRisks || 'None anticipated'),
    labelValue('Economic', risks.economicRisks || 'None anticipated'),
    subHeading('5.3 Risk Minimization Procedures'),
    bodyParagraph(risks.riskMinimization),
    subHeading('5.4 Potential Benefits'),
    bodyParagraph(risks.directBenefits ? risks.directBenefitDescription : 'Participants are not expected to receive direct personal benefits.'),
    subHeading('Benefits to Society'),
    bodyParagraph(risks.societalBenefits),
    subHeading('5.5 Adverse Event Monitoring'),
    bodyParagraph(risks.adverseEventPlan || 'Any unanticipated problems involving risks to participants will be reported to the IRB within 10 business days.'),

    sectionHeading('Section 6: Data Management and Confidentiality'),
    subHeading('6.1 Data Identifiability'),
    bodyParagraph(data.anonymousData ? 'Anonymous — no identifiers collected at any point.' : data.codedData ? 'Coded — identifiers replaced with numeric codes; master key stored separately.' : 'Identifiable data will be collected.'),
    subHeading('6.2 Identifiers Collected'),
    ...((data.identifierTypes || []).length ? (data.identifierTypes || []).map(t => bulletItem(t)) : [bodyParagraph('None — anonymous data collection.')]),
    subHeading('6.3 Data Storage'),
    bodyParagraph((data.dataStorageLocation || []).join(', ') || '[locations]'),
    labelValue('Encryption', data.dataEncrypted ? 'All electronic files containing identifiable or coded data will be encrypted.' : data.anonymousData ? 'Not required for anonymous data.' : '[Describe encryption plan — REQUIRED]'),
    labelValue('Access', data.dataAccessList),
    subHeading('6.4 Data Retention and Destruction'),
    bodyParagraph(`Research data will be retained for ${data.retentionPeriod || '[N]'} ${data.retentionUnit || 'years'} following ${data.retentionFrom || 'study completion'}.`),
    labelValue('Destruction Method', data.destructionMethod),
    subHeading('6.5 Data Sharing'),
    bodyParagraph(data.dataShared ? data.dataSharingDetails : 'Research data will not be shared outside the research team.'),
    ...(data.hipaaApplicable ? [subHeading('6.6 HIPAA Compliance'), bodyParagraph('This research involves Protected Health Information (PHI) and will comply with HIPAA requirements. [Describe HIPAA authorization or waiver basis.]')] : []),

    sectionHeading('Section 7: Informed Consent'),
    ...(consent.consentRequired === false ? [
      subHeading('7.1 Waiver of Informed Consent'),
      bodyParagraph(`A waiver of informed consent is requested on the following basis: ${consent.waiverBasis || '[State basis]'}`),
      bodyParagraph(consent.waiverJustification || '[Provide detailed justification for each waiver criterion.]'),
    ] : [
      subHeading('7.1 Consent Process'),
      bodyParagraph(consent.consentProcess),
      subHeading('7.2 Consent Documentation'),
      bodyParagraph(consent.documentedConsent ? 'Participants will sign a written informed consent form.' : consent.waiverOfDocumentation ? `A waiver of documentation is requested. Basis: ${consent.waiverDocBasis || '[state basis]'}` : '[Describe consent documentation approach.]'),
      labelValue('Primary Consent Language', consent.consentLanguage || 'English'),
      ...(subjects.includesMinors ? [
        subHeading('7.3 Parental Permission and Child Assent'),
        bodyParagraph(`Parental/guardian permission: ${consent.parentPermissionRequired ? 'Required — written permission form will be obtained.' : '[State approach]'}`),
        bodyParagraph(`Child assent: ${consent.assentRequired ? 'Required — age-appropriate assent form will be administered.' : 'Not required / IRB waiver will be sought.'}`),
      ] : []),
    ]),

    divider(),
    new Paragraph({
      spacing: { before: 200 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: '— END OF PROTOCOL DESCRIPTION —', bold: true, size: SZ_SMALL, color: GRAY, font: FONT })],
    }),
    infoBox('Verify that all participant counts, dates, and specific details match across this document, all consent forms, and all recruitment materials before submitting to Mentor IRB.'),
  ];

  return Packer.toBlob(new Document({ sections: [{ properties: { page: { margin: PAGE_MARGINS } }, children }] }));
}

// ─── 2. Full Informed Consent Form ───────────────────────────────────────────
export async function generateFullConsentFormDocx(formData) {
  const { researcher, study, subjects, procedures, risks, data, consent } = formData;
  const piName = `${researcher.piFirstName || ''} ${researcher.piLastName || ''}`.trim() || '[PI Name]';
  const duration = `${procedures.participationDuration || '[N]'} ${procedures.participationDurationUnit || 'minutes'}`;

  const children = [
    ...ubHeader('Consent to Participate in a Research Study'),
    infoBox('This is a template. Review all [BRACKETED] items and customize before submitting.'),
    empty(),

    sectionHeading('Key Information'),
    labelValue('Study Title', study.title),
    labelValue('Principal Investigator', `${piName}, ${researcher.piDegree || '[Degree]'}`),
    labelValue('Department', researcher.piDepartment),
    labelValue('Sponsor', study.fundingSource && study.fundingSource !== 'none' ? study.fundingSource : 'Not externally sponsored'),

    sectionHeading('Section 1: Invitation'),
    bodyParagraph(`You are invited to take part in this research study. You are being asked because ${subjects.subjectPopulation ? subjects.subjectPopulation.toLowerCase() : '[explain eligibility]'}.`),
    bodyParagraph('Taking part in this research study is completely voluntary.'),
    bodyParagraph(`Note: You must be at least ${subjects.minAge || 18} years old to participate.`),

    sectionHeading('Section 2: Key Information Summary'),
    subHeading('What is this study about?'),
    bodyParagraph(study.studyPurpose),
    subHeading('What will I be asked to do?'),
    bodyParagraph(`If you agree to participate, you will: ${procedureSummary(procedures)}. This will take approximately ${duration}.`),
    subHeading('What are the main risks?'),
    bodyParagraph(consent.keyRisksForConsent || risks.psychologicalRisks || risks.physicalRisks || 'The risks of this study are minimal.'),
    subHeading('What are the benefits?'),
    bodyParagraph(consent.keyBenefitsForConsent || (risks.directBenefits ? risks.directBenefitDescription : `You may not personally benefit from this study. However, your participation will contribute to ${risks.societalBenefits || 'scientific knowledge in this area'}.`)),
    subHeading('Do I have to participate?'),
    bodyParagraph('No. Participation is completely voluntary. If you decide not to participate, it will not affect you in any way. You may stop at any time without penalty.'),

    sectionHeading('Section 3: Study Procedures'),
    subHeading('Purpose'),
    bodyParagraph(study.studyPurpose),
    bodyParagraph(`Background: ${study.scientificBackground || '[Scientific background]'}`),
    bodyParagraph(`This study will enroll approximately ${subjects.totalParticipants || '[N]'} participants in total.`),
    subHeading('What will happen if I say yes?'),
    ...buildDetailedProcedureParas(procedures),
    bodyParagraph(`Total participation time: approximately ${duration}.`),
    bodyParagraph(`Study period: ${study.startDate || '[start]'} to ${study.endDate || '[end]'}.`),
    ...(subjects.includesUBStudents ? [bodyParagraph('If you are a student seeking extra credit, alternative ways to earn equivalent credit include: [describe alternatives].')] : []),
    bodyParagraph('You may stop at any time and it will not be held against you. You will be notified of any significant new findings that may affect your willingness to continue.'),

    sectionHeading('Section 4: Risks and Benefits'),
    subHeading('Risks of Participating'),
    ...[
      risks.physicalRisks && labelValue('Physical', risks.physicalRisks),
      risks.psychologicalRisks && labelValue('Psychological/Emotional', risks.psychologicalRisks),
      risks.privacyRisks && labelValue('Privacy', risks.privacyRisks),
      risks.socialRisks && labelValue('Social', risks.socialRisks),
      risks.legalRisks && labelValue('Legal', risks.legalRisks),
      risks.economicRisks && labelValue('Economic', risks.economicRisks),
    ].filter(Boolean),
    ...(![risks.physicalRisks, risks.psychologicalRisks, risks.privacyRisks].some(Boolean) ? [bodyParagraph('This research study involves no more than minimal risk.')] : []),
    subHeading('Steps to Minimize Risk'),
    bodyParagraph(risks.riskMinimization),
    subHeading('Benefits'),
    bodyParagraph(risks.directBenefits ? `Possible direct benefits: ${risks.directBenefitDescription || '[describe]'}` : 'You may not directly benefit from this study.'),
    bodyParagraph(`Benefits to others: ${risks.societalBenefits || '[describe broader benefits]'}`),

    sectionHeading('Section 5: Confidentiality'),
    ...confidentialityParagraphs(data),
    bodyParagraph('Organizations that may access research records include the IRB and other authorized representatives of the University of Bridgeport.'),
    bodyParagraph('You will not be identified in any publication or presentation.'),
    ...(data.certificateOfConfidentiality ? [bodyParagraph('This study has a Certificate of Confidentiality, which means researchers cannot be forced to reveal your identity.')] : []),

    sectionHeading('Section 6: Compensation and Other Information'),
    bodyParagraph(subjects.compensationOffered ? `${subjects.compensationDetails || '[Describe compensation]'}\n\nBy law, payments to research participants are considered taxable income.` : 'Participants will not receive payment for participation.'),
    ...(subjects.extraCreditOffered ? [bodyParagraph('If earning extra credit through participation, alternative ways to earn equivalent credit are available. Contact your instructor for details.')] : []),
    bodyParagraph('We WILL tell you about any new information that may affect your health, welfare, or choice to remain in the research.'),

    sectionHeading('Section 7: Contacts and Questions'),
    subHeading('Questions about the study:'),
    labelValue('  Principal Investigator', piName),
    labelValue('  Email', researcher.piEmail),
    labelValue('  Phone', researcher.piPhone),
    subHeading('Questions about your rights as a research participant:'),
    labelValue('  UB IRB Administrator', 'irb@bridgeport.edu'),
    bodyParagraph('This research has been reviewed and approved by the University of Bridgeport Institutional Review Board.'),

    sectionHeading('Section 8: Signatures'),
    infoBox('By signing below, you agree that you have read and understood this consent form, had the chance to ask questions, and voluntarily agree to participate. You understand you may withdraw at any time.'),
    empty(),
    signatureLine('Participant Signature'),
    labelValue('Printed Name', '                                                  '),
    empty(),
    signatureLine('Person Obtaining Consent'),
    labelValue('Printed Name', '                                                  '),
    ...(procedures.involvesRecording ? [
      empty(),
      divider(),
      sectionHeading('Optional: Recording Consent'),
      bodyParagraph(`This study involves ${(procedures.recordingTypes || []).join(' and ') || 'recording'} of participants. [STATE WHETHER: If you do not agree to be recorded, you CAN STILL / CANNOT take part in the study.]`),
      checkboxLine('I agree to be recorded.'),
      checkboxLine('I do NOT agree to be recorded.'),
      empty(),
      signatureLine('Participant Signature'),
    ] : []),
    divider(),
    infoBox('PREPARER CHECKLIST (delete before submitting): ☐ Voluntary participation stated ☐ Purpose described ☐ Risks/discomforts described ☐ Benefits described ☐ Confidentiality disclosed ☐ PI and IRB contacts provided ☐ Right to withdraw stated ☐ Total N: ' + (subjects.totalParticipants || '[N]')),
  ];

  return Packer.toBlob(new Document({ sections: [{ properties: { page: { margin: PAGE_MARGINS } }, children }] }));
}

// ─── 3. Exempt Consent Information Sheet ─────────────────────────────────────
export async function generateExemptConsentSheetDocx(formData) {
  const { researcher, study, subjects, procedures, data } = formData;
  const piName = `${researcher.piFirstName || ''} ${researcher.piLastName || ''}`.trim() || '[PI Name]';
  const duration = `${procedures.participationDuration || '[N]'} ${procedures.participationDurationUnit || 'minutes'}`;

  const children = [
    ...ubHeader('Research Information Sheet'),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: 'Exempt Research — No Participant Signature Required', italics: true, size: SZ_BODY, color: GRAY, font: FONT })],
    }),
    infoBox('Proceeding with participation indicates that you have read and understood this information.'),
    empty(),

    labelValue('Research Title', study.title),
    labelValue('Principal Investigator', piName),
    labelValue('Department', researcher.piDepartment),
    divider(),

    bodyParagraph(`You are invited to participate in a research study being conducted by ${piName} at the University of Bridgeport. Your participation is completely voluntary. You may withdraw at any time without penalty.`),

    sectionHeading('Purpose of the Study'),
    bodyParagraph(study.studyPurpose),
    bodyParagraph(`You are being asked to participate because ${subjects.subjectPopulation ? `you are ${subjects.subjectPopulation.toLowerCase()}` : '[explain eligibility]'}.`),

    sectionHeading('Study Tasks or Procedures'),
    bodyParagraph(`If you decide to participate, you will be asked to: ${procedureSummary(procedures)}.`),
    ...(procedures.involvesRecording ? [bodyParagraph(`This study involves ${(procedures.recordingTypes || []).join(' and ') || 'recording'}. [State whether participation is possible without being recorded.]`)] : []),

    sectionHeading('Duration of Participation'),
    bodyParagraph(`Your participation will require approximately ${duration}.`),

    sectionHeading('Confidentiality'),
    ...confidentialityParagraphs(data),

    sectionHeading('Contacts and Questions'),
    subHeading('Questions about the study:'),
    labelValue('  Principal Investigator', piName),
    labelValue('  Email', researcher.piEmail),
    labelValue('  Phone', researcher.piPhone),
    subHeading('Questions about your rights as a participant:'),
    labelValue('  UB IRB Administrator', 'irb@bridgeport.edu'),

    ...(subjects.compensationOffered ? [
      sectionHeading('Compensation'),
      bodyParagraph(subjects.compensationDetails || '[Describe compensation]'),
      bodyParagraph('By law, payments to research participants are considered taxable income.'),
    ] : []),

    divider(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 120 },
      children: [new TextRun({ text: 'DO NOT SIGN THIS FORM. KEEP A COPY FOR YOUR RECORDS.', bold: true, size: SZ_BODY, font: FONT, color: NAVY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'Proceeding with participation indicates that you have read and understood this information.', italics: true, size: SZ_SMALL, font: FONT, color: GRAY })],
    }),
  ];

  return Packer.toBlob(new Document({ sections: [{ properties: { page: { margin: PAGE_MARGINS } }, children }] }));
}

// ─── 4. Parental / Guardian Permission Form ───────────────────────────────────
export async function generateParentalPermissionFormDocx(formData) {
  const { researcher, study, subjects, procedures, risks, data, consent } = formData;
  const piName = `${researcher.piFirstName || ''} ${researcher.piLastName || ''}`.trim() || '[PI Name]';
  const duration = `${procedures.participationDuration || '[N]'} ${procedures.participationDurationUnit || 'minutes'}`;

  const children = [
    ...ubHeader('Parental / Guardian Permission Form'),
    infoBox('This form requests your permission for your child to participate. Read carefully before signing.'),
    empty(),

    labelValue('Study Title', study.title),
    labelValue('Principal Investigator', piName),
    labelValue('Department', researcher.piDepartment),
    labelValue('Email', researcher.piEmail),
    labelValue('Phone', researcher.piPhone),

    sectionHeading('Invitation'),
    bodyParagraph(`You are being asked to give permission for your child, [CHILD'S NAME], to take part in a research study. The study is being conducted by ${piName} at the University of Bridgeport. Your child's participation is completely voluntary.`),
    bodyParagraph(`Your child is being asked to participate because ${subjects.subjectPopulation ? subjects.subjectPopulation.toLowerCase() : '[explain eligibility]'}.`),

    sectionHeading('Purpose of the Study'),
    bodyParagraph(study.studyPurpose),

    sectionHeading('What Will My Child Be Asked to Do?'),
    bodyParagraph(`If you give permission, your child will: ${procedureSummary(procedures)}.`),
    bodyParagraph(`This will take approximately ${duration}.`),
    ...buildDetailedProcedureParas(procedures),

    sectionHeading('Risks'),
    bodyParagraph(risks.psychologicalRisks || risks.physicalRisks || 'This research involves no more than minimal risk — no greater risk than activities your child encounters in daily life.'),
    bodyParagraph(`Steps to minimize risk: ${risks.riskMinimization || '[Describe safeguards]'}`),

    sectionHeading('Benefits'),
    bodyParagraph(risks.directBenefits ? risks.directBenefitDescription : 'Your child may not directly benefit from participating.'),
    bodyParagraph(`Benefits to others: ${risks.societalBenefits || '[Describe]'}`),

    sectionHeading('Confidentiality'),
    ...confidentialityParagraphs(data),

    sectionHeading('Compensation'),
    bodyParagraph(subjects.compensationOffered ? subjects.compensationDetails || '[Describe compensation]' : 'There is no compensation for participation in this study.'),

    sectionHeading('Voluntary Participation'),
    bodyParagraph('Your child\'s participation is completely voluntary. You may refuse to allow your child to participate, or you may withdraw your child at any time without penalty. Your decision will not affect your relationship with the University of Bridgeport.'),

    sectionHeading('Child Assent'),
    bodyParagraph(consent.assentRequired ? 'In addition to your permission, your child\'s assent will also be obtained before participation.' : 'Because of your child\'s age, a separate assent form is not required.'),

    sectionHeading('Contacts and Questions'),
    subHeading('Questions about the study:'),
    labelValue('  Principal Investigator', piName),
    labelValue('  Email', researcher.piEmail),
    labelValue('  Phone', researcher.piPhone),
    subHeading('Questions about your or your child\'s rights as research participants:'),
    labelValue('  UB IRB Administrator', 'irb@bridgeport.edu'),

    sectionHeading('Permission'),
    bodyParagraph('By signing below, you indicate that you have read and understood this form, had the opportunity to ask questions, and give permission for your child to participate in this study.'),
    empty(),
    signatureLine('Parent/Guardian Signature'),
    labelValue('Printed Name', '                                                  '),
    labelValue("Child's Name", '                                                  '),
    labelValue("Child's Date of Birth", '                       '),
  ];

  return Packer.toBlob(new Document({ sections: [{ properties: { page: { margin: PAGE_MARGINS } }, children }] }));
}

// ─── 5. Child Assent Form ─────────────────────────────────────────────────────
export async function generateChildAssentFormDocx(formData) {
  const { researcher, study, subjects, procedures } = formData;
  const piName = `${researcher.piFirstName || ''} ${researcher.piLastName || ''}`.trim() || '[PI Name]';
  const duration = `${procedures.participationDuration || '[N]'} ${procedures.participationDurationUnit || 'minutes'}`;
  const ageRange = subjects.minorAgeRange || `${subjects.minAge || '7'}–17`;

  const children = [
    ...ubHeader('Child Assent Form'),
    infoBox(`This form is written for children ages ${ageRange}. An adult will explain this to you before you decide.`),
    empty(),

    labelValue('Study Title', study.title),
    labelValue('Researcher', piName),
    divider(),

    sectionHeading('What Is This Study About?'),
    bodyParagraph(`A researcher named ${piName} wants to learn about ${study.studyPurpose ? study.studyPurpose.toLowerCase().replace(/^(this study|we|this research)( aims to| seeks to| will| is designed to)?/i, '').trim() : '[simple description of study topic]'}.`),

    sectionHeading('Why Am I Being Asked?'),
    bodyParagraph(`You are being asked because ${subjects.subjectPopulation ? subjects.subjectPopulation.toLowerCase() : '[explain in child-friendly terms]'}.`),

    sectionHeading('What Will I Do?'),
    bodyParagraph(`If you join the study, you will: ${procedureSummary(procedures)}.`),
    bodyParagraph(`This will take about ${duration}.`),
    ...((procedures.methodTypes || []).includes('survey') ? [bodyParagraph('You will answer some questions. You can skip any question you do not want to answer.')] : []),
    ...((procedures.methodTypes || []).includes('interview') ? [bodyParagraph(`Someone will ask you questions about ${procedures.interviewTopics || '[topics]'}. There are no right or wrong answers.`)] : []),

    sectionHeading('Will It Hurt?'),
    bodyParagraph(procedures.involvesBloodDraw ? 'A small amount of blood will be taken from your arm with a small needle. You may feel a small pinch. If you feel uncomfortable, tell the researcher and we can stop.' : 'No — this study will not hurt you.'),

    sectionHeading('Does Anyone Else Have to Know?'),
    bodyParagraph('We will keep what you tell us private. We will not tell your parents, teachers, or friends what you say, unless you are in danger.'),

    sectionHeading('Do I Have to Do This?'),
    bodyParagraph('NO! You do not have to be in this study. No one will be mad at you if you say no. Even if you say yes today, you can change your mind and stop at any time. Nothing bad will happen.'),

    sectionHeading('Do You Have Questions?'),
    bodyParagraph(`You can ask questions any time. Talk to ${piName} or a trusted adult.`),
    labelValue('Researcher Email', researcher.piEmail),

    sectionHeading('Your Choice'),
    bodyParagraph('If you want to be in this study, please sign your name below. A parent or guardian has already said it is okay, but it is still YOUR choice.'),
    empty(),
    signatureLine('Child\'s Signature / Printed Name'),
    labelValue('Date', '              '),
    empty(),
    signatureLine('Researcher Signature'),
    empty(),
    signatureLine('Parent/Guardian Witness'),
  ];

  return Packer.toBlob(new Document({ sections: [{ properties: { page: { margin: PAGE_MARGINS } }, children }] }));
}

// ─── 6. Debriefing Script ─────────────────────────────────────────────────────
export async function generateDebriefingScriptDocx(formData) {
  const { researcher, study, procedures } = formData;
  const piName = `${researcher.piFirstName || ''} ${researcher.piLastName || ''}`.trim() || '[PI Name]';

  const children = [
    ...ubHeader('Debriefing Script'),
    infoBox('READ THIS SCRIPT ALOUD TO EACH PARTICIPANT IMMEDIATELY AFTER THEIR PARTICIPATION. Do not summarize — use the actual words provided.'),
    empty(),

    labelValue('Study Title', study.title),
    labelValue('Researcher', piName),
    divider(),

    sectionHeading('Step 1: Thank the Participant'),
    bodyParagraph(`"Thank you for participating in this study. Before you leave, I need to share some important information with you."`),

    sectionHeading('Step 2: Reveal the True Purpose'),
    bodyParagraph(`"The actual purpose of this study is: ${study.studyPurpose || '[DESCRIBE TRUE PURPOSE]'}. We were unable to tell you this beforehand because ${procedures.deceptionDescription || '[EXPLAIN WHY DECEPTION WAS NECESSARY]'}."`),

    sectionHeading('Step 3: Explain the Deception'),
    bodyParagraph(`"During the study, [DESCRIBE SPECIFICALLY WHAT WAS WITHHELD OR MISLEADING]. This deception was necessary because if participants knew the true purpose, it would have affected their responses and made the research invalid."`),

    sectionHeading('Step 4: Affirm Validity of Participation'),
    bodyParagraph(`"Everything you did and said during the study is still valuable. Your participation will contribute to ${study.studyPurpose || 'this research'}."`),

    sectionHeading('Step 5: Confirm Voluntary Continued Participation'),
    bodyParagraph(`"Now that you know the true purpose of the study, you have the right to withdraw your data. If you would like your responses removed from the study, please let me know now or contact me at ${researcher.piEmail || '[email]'} within [SPECIFY TIMEFRAME, e.g., 2 weeks]."`),

    sectionHeading('Step 6: Offer to Answer Questions'),
    bodyParagraph(`"Do you have any questions about the study or what we just discussed? [PAUSE — allow questions and answer honestly]"`),

    sectionHeading('Step 7: Provide Contact Information'),
    bodyParagraph(`"If you have questions later, you can reach me at ${researcher.piEmail || '[email]'} or ${researcher.piPhone || '[phone]'}. You may also contact the UB IRB at irb@bridgeport.edu if you have concerns about your rights as a research participant."`),

    sectionHeading('Step 8: Confidentiality Reminder'),
    bodyParagraph(`"Please do not discuss the true nature of this study with others who may be potential participants. Doing so could affect the validity of the research."`),

    divider(),
    sectionHeading('Researcher Notes (Complete After Each Session)'),
    labelValue('Participant ID / Code', '                    '),
    labelValue('Date/Time', '                    '),
    labelValue('Time Spent on Debriefing', '                    '),
    empty(),
    checkboxLine('Participant acknowledged understanding of the debriefing'),
    checkboxLine('Participant asked questions (describe below)'),
    checkboxLine('Participant requested data withdrawal'),
    checkboxLine('Participant showed signs of distress — follow-up action taken:'),
    empty(),
    bodyParagraph('Notes: ________________________________________________________________________'),
    bodyParagraph('_____________________________________________________________________________'),
    empty(),
    signatureLine('Researcher Signature'),
  ];

  return Packer.toBlob(new Document({ sections: [{ properties: { page: { margin: PAGE_MARGINS } }, children }] }));
}

// ─── 7. HIPAA Authorization Form ─────────────────────────────────────────────
export async function generateHIPAAAuthorizationDocx(formData) {
  const { researcher, study, subjects, data } = formData;
  const piName = `${researcher.piFirstName || ''} ${researcher.piLastName || ''}`.trim() || '[PI Name]';

  const phiTypes = (data.identifierTypes || []).length > 0
    ? data.identifierTypes.join(', ')
    : '[List specific PHI types: name, date of birth, medical record number, diagnosis codes, test results, etc.]';

  const children = [
    ...ubHeader('HIPAA Research Authorization Form'),
    infoBox('Required under 45 CFR § 164.508. This form authorizes use of your Protected Health Information (PHI) for research. You have the right to refuse.'),
    empty(),

    labelValue('Study Title', study.title),
    labelValue('Principal Investigator', piName),
    labelValue('Department', researcher.piDepartment),

    sectionHeading('1. Description of Information to Be Used or Disclosed'),
    bodyParagraph(`The following Protected Health Information (PHI) may be used or disclosed for this research study: ${phiTypes}.`),
    bodyParagraph('[Specify the time period covered, e.g., "records from [date range]" or "information collected during the study period."]'),

    sectionHeading('2. Who May Use or Disclose Your Information'),
    bodyParagraph(`The following individuals and organizations may use or disclose your PHI: ${piName} (Principal Investigator), the research team at the University of Bridgeport, and [LIST ANY OTHER AUTHORIZED PERSONNEL].`),

    sectionHeading('3. Who May Receive Your Information'),
    bodyParagraph(`Your PHI may be disclosed to: the University of Bridgeport Institutional Review Board; ${study.fundingSource && study.fundingSource !== 'none' ? `the study sponsor (${study.fundingSource});` : ''} regulatory agencies authorized to review research records; [LIST ANY OTHER RECIPIENTS].`),

    sectionHeading('4. Purpose'),
    bodyParagraph(`Your information will be used for the following research purpose: ${study.studyPurpose || '[Describe specific research purpose for which PHI is needed]'}.`),

    sectionHeading('5. Expiration'),
    bodyParagraph('This authorization will expire at the end of the study, when research activities are complete and data are de-identified, or [SPECIFY DATE/EVENT — whichever comes first].'),

    sectionHeading('6. Your Right to Revoke This Authorization'),
    bodyParagraph(`You have the right to revoke (cancel) this authorization at any time. To revoke, submit a written request to: ${piName} at ${researcher.piEmail || '[email]'}. Revoking this authorization will stop future use of your PHI, but information already used or disclosed before revocation cannot be recalled.`),

    sectionHeading('7. Treatment, Payment, and Enrollment'),
    bodyParagraph('Your decision to authorize or refuse to authorize the use of your PHI for this research will NOT affect your treatment, payment, enrollment in a health plan, or eligibility for benefits.'),

    sectionHeading('8. Re-Disclosure'),
    bodyParagraph('Information disclosed pursuant to this authorization may be subject to re-disclosure by the recipient and may no longer be protected by federal privacy rules.'),

    divider(),
    sectionHeading('Authorization Signature'),
    bodyParagraph('By signing below, you authorize the use and disclosure of your Protected Health Information as described in this form. You have received a copy of this form.'),
    empty(),
    signatureLine('Participant Signature'),
    labelValue('Printed Name', '                                                  '),
    empty(),
    new Paragraph({
      children: [new TextRun({ text: 'If signing as a personal representative:', bold: true, size: SZ_BODY, font: FONT })],
    }),
    signatureLine('Representative Signature'),
    labelValue('Printed Name', '                                                  '),
    labelValue('Relationship to Participant', '                    '),
    labelValue('Authority to Sign', '                    '),
  ];

  return Packer.toBlob(new Document({ sections: [{ properties: { page: { margin: PAGE_MARGINS } }, children }] }));
}

// ─── 8. Recruitment Email Template ───────────────────────────────────────────
export async function generateRecruitmentEmailDocx(formData) {
  const { researcher, study, subjects, procedures } = formData;
  const piName = `${researcher.piFirstName || ''} ${researcher.piLastName || ''}`.trim() || '[PI Name]';
  const duration = `${procedures.participationDuration || '[N]'} ${procedures.participationDurationUnit || 'minutes'}`;

  const eligibilitySummary = [
    subjects.minAge && subjects.maxAge ? `Ages ${subjects.minAge}–${subjects.maxAge}` : subjects.minAge ? `Age ${subjects.minAge}+` : null,
    subjects.inclusionCriteria ? subjects.inclusionCriteria.split('\n')[0].trim() : null,
  ].filter(Boolean).join('; ') || '[eligibility criteria]';

  const children = [
    ...ubHeader('Recruitment Email Template'),
    infoBox('Copy and paste into your email client. Fill all [BRACKETED] items before sending. Do not send until IRB approval is received.'),
    empty(),

    sectionHeading('Email Details'),
    labelValue('From', `${piName} <${researcher.piEmail || '[email]'}>`),
    labelValue('Subject', `Invitation to Participate in Research Study: ${study.title || '[Study Title]'}`),
    labelValue('Reply-To', researcher.piEmail || '[email]'),
    divider(),

    sectionHeading('Email Body'),
    empty(),
    bodyParagraph('Dear [RECIPIENT / Potential Participant],'),
    empty(),
    bodyParagraph(`My name is ${piName}, and I am a ${researcher.piDegree || '[degree/title]'} in the Department of ${researcher.piDepartment || '[department]'} at the University of Bridgeport. I am conducting a research study, and I am writing to invite you to participate.`),
    empty(),
    subHeading('About the Study'),
    bodyParagraph(study.studyPurpose || '[Brief description of what the study is about and why it matters]'),
    empty(),
    subHeading('Who Can Participate?'),
    bodyParagraph(`You may participate if: ${eligibilitySummary}.`),
    ...(subjects.exclusionCriteria ? [bodyParagraph(`You cannot participate if: ${subjects.exclusionCriteria.split('\n')[0].trim() || '[key exclusion criteria]'}.`)] : []),
    empty(),
    subHeading('What Is Involved?'),
    bodyParagraph(`Participation involves: ${procedureSummary(procedures)}. Your time commitment is approximately ${duration}.`),
    empty(),
    subHeading('Compensation'),
    bodyParagraph(subjects.compensationOffered ? subjects.compensationDetails || '[Describe compensation/incentive]' : 'Participation in this study is voluntary and there is no monetary compensation.'),
    empty(),
    subHeading('How to Participate'),
    bodyParagraph('[CHOOSE ONE OF THE FOLLOWING AND DELETE THE OTHERS:]'),
    bulletItem('Click here to complete the survey: [INSERT SURVEY LINK]'),
    bulletItem('Reply to this email to schedule an interview/session.'),
    bulletItem('Contact me at the information below to express interest.'),
    empty(),
    bodyParagraph('Participation is completely voluntary. You may withdraw at any time without penalty. All information collected will be kept confidential.'),
    empty(),
    bodyParagraph('Thank you for your time and consideration.'),
    empty(),
    bodyParagraph('Sincerely,'),
    empty(),
    bodyParagraph(piName),
    bodyParagraph(researcher.piDegree ? researcher.piDegree + ', ' + (researcher.piDepartment || '') : researcher.piDepartment || '[Department]'),
    bodyParagraph('University of Bridgeport'),
    bodyParagraph(`Email: ${researcher.piEmail || '[email]'}`),
    bodyParagraph(`Phone: ${researcher.piPhone || '[phone]'}`),
    empty(),
    bodyParagraph(`P.S. This study has been approved by the University of Bridgeport Institutional Review Board. IRB Protocol #: [INSERT AFTER APPROVAL]. If you have questions about your rights as a research participant, contact the UB IRB at irb@bridgeport.edu.`),
  ];

  return Packer.toBlob(new Document({ sections: [{ properties: { page: { margin: PAGE_MARGINS } }, children }] }));
}

// ─── 9. Recruitment Flyer / Advertisement ────────────────────────────────────
export async function generateRecruitmentFlyerDocx(formData) {
  const { researcher, study, subjects, procedures } = formData;
  const piName = `${researcher.piFirstName || ''} ${researcher.piLastName || ''}`.trim() || '[PI Name]';
  const duration = `${procedures.participationDuration || '[N]'} ${procedures.participationDurationUnit || 'minutes'}`;

  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
      children: [new TextRun({ text: 'RESEARCH PARTICIPANTS NEEDED', bold: true, size: 48, color: NAVY, font: FONT })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: study.title || '[Study Title]', bold: true, size: 32, color: GOLD, font: FONT })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 320 },
      children: [new TextRun({ text: 'University of Bridgeport — Research Study', size: SZ_BODY, color: GRAY, font: FONT })],
    }),
    divider(),

    sectionHeading('Are You Eligible?'),
    ...[
      subjects.minAge && subjects.maxAge ? bulletItem(`Age ${subjects.minAge}–${subjects.maxAge} years`) : subjects.minAge ? bulletItem(`Age ${subjects.minAge}+`) : null,
      ...(subjects.inclusionCriteria || '').split('\n').filter(l => l.trim()).map(l => bulletItem(l.trim())),
    ].filter(Boolean),
    ...(subjects.inclusionCriteria ? [] : [bulletItem('[List key eligibility criteria]')]),

    sectionHeading('What Is Involved?'),
    bulletItem(`${procedureSummary(procedures)}`),
    bulletItem(`Time commitment: approximately ${duration}`),
    bulletItem(`Location: ${study.studySites || 'Online / [specify location]'}`),

    sectionHeading(`What Do You Get?`),
    bulletItem(subjects.compensationOffered ? (subjects.compensationDetails || '[Describe incentive/compensation]') : 'Voluntary participation — no monetary compensation'),

    sectionHeading('About the Study'),
    bodyParagraph(study.studyPurpose || '[One to two sentences describing the purpose and importance of the research]'),

    divider(),
    sectionHeading('Interested? Contact:'),
    labelValue('Researcher', piName),
    labelValue('Email', researcher.piEmail || '[email]'),
    labelValue('Phone', researcher.piPhone || '[phone]'),
    labelValue('Survey Link / Sign-Up', '[INSERT LINK]'),
    empty(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'Approved by the University of Bridgeport IRB  |  IRB #: [insert after approval]', size: SZ_SMALL, italics: true, color: GRAY, font: FONT })],
    }),
  ];

  return Packer.toBlob(new Document({ sections: [{ properties: { page: { margin: PAGE_MARGINS } }, children }] }));
}

// ─── 10. Class Announcement Script ───────────────────────────────────────────
export async function generateClassAnnouncementDocx(formData) {
  const { researcher, study, subjects, procedures } = formData;
  const piName = `${researcher.piFirstName || ''} ${researcher.piLastName || ''}`.trim() || '[PI Name]';
  const duration = `${procedures.participationDuration || '[N]'} ${procedures.participationDurationUnit || 'minutes'}`;

  const children = [
    ...ubHeader('Class Announcement / Verbal Recruitment Script'),
    infoBox('Read this script aloud to the class. Estimated reading time: 45–60 seconds. Obtain instructor permission before making this announcement. Do not use this script until IRB approval is received.'),
    empty(),

    labelValue('Study Title', study.title),
    labelValue('Researcher', piName),
    divider(),

    sectionHeading('Script (Read Verbatim or Paraphrase Closely)'),
    empty(),
    new Paragraph({
      shading: { type: ShadingType.SOLID, color: 'F8FAFC' },
      spacing: { before: 80, after: 80 },
      indent: { left: 360, right: 360 },
      children: [new TextRun({ text: '"', bold: true, size: 36, font: FONT, color: NAVY })],
    }),
    bodyParagraph(`"Hi everyone — my name is ${piName}. I am a ${researcher.piDegree || '[degree/title]'} in the ${researcher.piDepartment || '[department]'} department here at the University of Bridgeport."`),
    empty(),
    bodyParagraph(`"I am conducting a research study about ${study.studyPurpose ? study.studyPurpose.substring(0, 120) + (study.studyPurpose.length > 120 ? '...' : '') : '[brief description]'}, and I would like to invite you to participate."`),
    empty(),
    bodyParagraph(`"The study involves: ${procedureSummary(procedures)}. It will take approximately ${duration} of your time."`),
    empty(),
    bodyParagraph(subjects.compensationOffered
      ? `"${subjects.compensationDetails || '[Describe compensation — e.g., extra credit, gift card, etc.]'}"`
      : `"Participation is completely voluntary and there is no compensation offered."`),
    empty(),
    bodyParagraph(`"I want to be very clear: participation is completely VOLUNTARY and will NOT affect your grade in this course or your relationship with this institution in any way. Whether you participate or not, there will be no consequences whatsoever."`),
    ...(subjects.extraCreditOffered ? [
      empty(),
      bodyParagraph(`"If extra credit is offered for this study, there are other ways to earn the same credit — participating in this study is not the only option. Please see me or your instructor for alternatives."`),
    ] : []),
    empty(),
    bodyParagraph(`"If you are interested in participating, please [CHOOSE ONE: see me after class / visit this link: [INSERT LINK] / scan this QR code / fill out this sign-up sheet]."`),
    empty(),
    bodyParagraph('"Thank you for your time. Does anyone have any questions?"'),
    empty(),

    divider(),
    sectionHeading('Post-Announcement Notes'),
    bodyParagraph(`Researcher: ${piName}`),
    bodyParagraph(`Email: ${researcher.piEmail || '[email]'}`),
    bodyParagraph(`Phone: ${researcher.piPhone || '[phone]'}`),
    empty(),
    infoBox('IMPORTANT: Do not exert any pressure on students. Do not take attendance of who signs up. Do not ask students individually if they plan to participate. Leave the room or wait until the instructor has dismissed the class before collecting sign-up information if possible.'),
    empty(),
    checkboxLine('Instructor permission obtained (date: ___________)'),
    checkboxLine('Class/section announced to: ___________________________________'),
    checkboxLine('Date and time of announcement: ___________________________________'),
    signatureLine('Researcher Signature'),
  ];

  return Packer.toBlob(new Document({ sections: [{ properties: { page: { margin: PAGE_MARGINS } }, children }] }));
}

// ─── 11. Social Media Post Template ──────────────────────────────────────────
export async function generateSocialMediaPostDocx(formData) {
  const { researcher, study, subjects, procedures } = formData;
  const piName = `${researcher.piFirstName || ''} ${researcher.piLastName || ''}`.trim() || '[PI Name]';
  const duration = `${procedures.participationDuration || '[N]'} ${procedures.participationDurationUnit || 'minutes'}`;
  const eligibility = subjects.minAge && subjects.maxAge ? `ages ${subjects.minAge}–${subjects.maxAge}` : subjects.minAge ? `age ${subjects.minAge}+` : '[eligible group]';

  // Build a short-form post (≤280 chars)
  const compensation = subjects.compensationOffered ? (subjects.compensationDetails || '[compensation details]') : 'Voluntary';
  const shortPost = `📢 Research participants needed! Study: "${study.title || '[Title]'}". Who: ${eligibility}. Time: ~${duration}. ${compensation !== 'Voluntary' ? compensation + '. ' : ''}Contact: ${researcher.piEmail || '[email]'} [IRB approved]`.slice(0, 280);

  const children = [
    ...ubHeader('Social Media Recruitment Post Templates'),
    infoBox('Use these templates for LinkedIn, Facebook, Twitter/X, Instagram, and other platforms. Do NOT post until IRB approval is received. Include IRB number in final post.'),
    empty(),

    sectionHeading('Version A — Long Form (LinkedIn / Facebook)'),
    infoBox('Recommended for LinkedIn and Facebook. Approximately 100 words.'),
    empty(),
    bodyParagraph('🔬 RESEARCH PARTICIPANTS NEEDED'),
    empty(),
    bodyParagraph(`Are you ${eligibility}? Researchers at the University of Bridgeport are looking for participants for a study about ${study.studyPurpose ? study.studyPurpose.substring(0, 100) + (study.studyPurpose.length > 100 ? '...' : '') : '[brief study description]'}.`),
    empty(),
    bodyParagraph(`📋 What's Involved: ${procedureSummary(procedures)}`),
    bodyParagraph(`⏱ Time Commitment: Approximately ${duration}`),
    bodyParagraph(`💰 Compensation: ${subjects.compensationOffered ? subjects.compensationDetails || '[compensation details]' : 'Voluntary — no monetary compensation'}`),
    empty(),
    bodyParagraph(`Your participation is completely voluntary and your responses will be kept confidential.`),
    empty(),
    bodyParagraph(`📧 Interested? Contact: ${piName} at ${researcher.piEmail || '[email]'} or visit [INSERT LINK].`),
    empty(),
    bodyParagraph('#Research #UniversityOfBridgeport #[StudyTopic] #Participants #AcademicResearch'),
    empty(),
    bodyParagraph('This study has been approved by the University of Bridgeport IRB. IRB #: [INSERT AFTER APPROVAL]'),

    divider(),

    sectionHeading('Version B — Short Form (Twitter/X — ≤280 characters)'),
    infoBox('This version fits within the 280-character limit for Twitter/X. Verify character count before posting.'),
    empty(),
    new Paragraph({
      shading: { type: ShadingType.SOLID, color: 'F0F9FF' },
      spacing: { before: 80, after: 80 },
      indent: { left: 360, right: 360 },
      children: [new TextRun({ text: shortPost, size: SZ_BODY, font: FONT })],
    }),
    empty(),
    labelValue('Character count', `${shortPost.length} / 280`),

    divider(),

    sectionHeading('Version C — Instagram Caption'),
    bodyParagraph('📢 RESEARCH PARTICIPANTS NEEDED 📢'),
    empty(),
    bodyParagraph(`University of Bridgeport researchers are studying ${study.studyPurpose ? study.studyPurpose.substring(0, 80) + '...' : '[topic]'}.`),
    empty(),
    bodyParagraph(`✅ Eligible: ${eligibility}`),
    bodyParagraph(`📋 What: ${procedureSummary(procedures)}`),
    bodyParagraph(`⏱ Takes: ~${duration}`),
    bodyParagraph(`💰 ${subjects.compensationOffered ? subjects.compensationDetails || '[compensation]' : 'Volunteer — no pay'}`),
    empty(),
    bodyParagraph('DM us or click the link in bio to learn more! 👆'),
    empty(),
    bodyParagraph('#UBridgeport #Research #StudyParticipants #[StudyTopic] #AcademicResearch #Connecticut'),
    empty(),
    bodyParagraph('🔬 UB IRB Approved | IRB #: [INSERT AFTER APPROVAL]'),

    divider(),
    sectionHeading('Posting Guidelines'),
    bulletItem('Do NOT post until you receive written IRB approval and insert the protocol number.'),
    bulletItem('IRB approval number MUST appear in every public-facing recruitment post.'),
    bulletItem('Never identify specific potential participants in recruitment posts.'),
    bulletItem('Do not make unsubstantiated claims about benefits or compensation.'),
    bulletItem('Maintain copies of all recruitment posts (screenshots) for your IRB file.'),
    bulletItem('If posting in a closed Facebook group or online community, obtain group administrator permission first.'),
  ];

  return Packer.toBlob(new Document({ sections: [{ properties: { page: { margin: PAGE_MARGINS } }, children }] }));
}

// ─── Private helpers ──────────────────────────────────────────────────────────

const RISK_LEVEL_LABELS = {
  none: 'No anticipated risk to participants.',
  minimal: 'Minimal risk — probability and magnitude of harm is not greater than ordinarily encountered in daily life.',
  minor: 'Minor increase over minimal risk.',
  greater: 'Greater than minimal risk — Full Board review required.',
};

function buildVulnerableParas(subjects) {
  const parts = [];
  if (subjects.includesMinors) parts.push(bodyParagraph(`MINORS: This study will include participants ages ${subjects.minorAgeRange || `${subjects.minAge}–17`}. Parental/guardian permission and child assent will be obtained as required.`));
  if (subjects.includesPrisoners) parts.push(bodyParagraph('PRISONERS: This study will include incarcerated individuals. Additional protections per 45 CFR 46 Subpart C will be implemented. [Describe safeguards.]'));
  if (subjects.includesPregnantWomen) parts.push(bodyParagraph('PREGNANT WOMEN: This study may include pregnant women. Risks to the fetus will be disclosed per 45 CFR 46 Subpart B.'));
  if (subjects.includesCognitivelyImpaired) parts.push(bodyParagraph('COGNITIVELY IMPAIRED: Capacity assessment and LAR consent procedures will be implemented. [Describe process.]'));
  if (subjects.includesUBStudents) parts.push(bodyParagraph('UB STUDENTS/EMPLOYEES: Safeguards to ensure voluntary participation include: [describe safeguards].'));
  return parts.length > 0 ? parts : [bodyParagraph('No vulnerable populations will be included in this study.')];
}

function buildDetailedProcedureParas(procedures) {
  const paras = [];
  if (procedures.involvesRandomization) {
    paras.push(subHeading('Randomization'));
    paras.push(bodyParagraph(`You will be randomly assigned to one of the study groups: ${procedures.randomizationDescription || '[Describe groups and randomization method]'}.`));
  }
  if ((procedures.methodTypes || []).includes('survey')) {
    paras.push(subHeading('Survey'));
    paras.push(bodyParagraph(`You will complete a survey covering: ${procedures.surveyTopics || '[survey topics]'}. You may skip any question you feel uncomfortable answering.`));
  }
  if ((procedures.methodTypes || []).includes('interview')) {
    paras.push(subHeading('Interview'));
    paras.push(bodyParagraph(`You will participate in an interview covering: ${procedures.interviewTopics || '[interview topics]'}.`));
  }
  if ((procedures.methodTypes || []).includes('focus_group')) {
    paras.push(subHeading('Focus Group'));
    paras.push(bodyParagraph('You will participate in a group discussion. [Describe focus group format and topics.]'));
  }
  if (procedures.involvesRecording) {
    paras.push(subHeading('Recording'));
    paras.push(bodyParagraph(`Sessions will be recorded using: ${(procedures.recordingTypes || []).join(', ') || '[types]'}. Consent will be obtained separately. You may decline recording while still participating.`));
  }
  if (procedures.involvesBloodDraw) {
    paras.push(subHeading('Blood Collection'));
    paras.push(bodyParagraph(`Blood samples: ${procedures.bloodDrawAmount || '[N]'} mL per collection; frequency: ${procedures.bloodDrawFrequency || '[frequency]'}.`));
  }
  if (procedures.involvesDeception) {
    paras.push(subHeading('Note on Study Design'));
    paras.push(bodyParagraph('[NOTE TO PREPARER: Do NOT disclose the deception in the consent form. After the study, participants will be fully debriefed.]'));
  }
  if (procedures.usesExistingData) {
    paras.push(subHeading('Existing Data'));
    paras.push(bodyParagraph(`Existing data from: ${procedures.existingDataDescription || '[Describe data source]'}.`));
  }
  return paras.length > 0 ? paras : [bodyParagraph('[Describe study procedures in chronological order — what participants will experience from beginning to end.]')];
}
