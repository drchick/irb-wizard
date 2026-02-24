/**
 * sampleStudies.js
 *
 * Six complete, realistic IRB protocol formData objects covering every review
 * determination: EXEMPT (Cat 2 & Cat 4) → EXPEDITED (Cat 4 & Cat 6) → FULL BOARD (x2).
 *
 * Each study includes educational metadata (title, description, keyFactors,
 * reviewRationale) used by the /examples showcase page.
 *
 * Field names match WizardContext initialFormData exactly so they can be
 * loaded directly via the LOAD_FORMDATA reducer action.
 */

// ─── Helper: today ± N months ─────────────────────────────────────────────────
function iso(monthOffset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + monthOffset);
  return d.toISOString().split('T')[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// Study 1 — EXEMPT Category 2
// Anonymous online survey, adult community college students
// ─────────────────────────────────────────────────────────────────────────────
const study1_exempt_cat2 = {
  id: 'exempt-cat2-survey',
  expectedReview: 'EXEMPT',
  expectedCategory: 2,
  badge: 'Exempt — Category 2',
  badgeColor: 'emerald',
  shortTitle: 'Digital Learning Preferences Survey',
  description:
    'An anonymous Qualtrics survey exploring how community college students prefer to receive instructional content (synchronous vs. asynchronous, video vs. text). No identifiers collected. Adults only.',
  methodology: 'Quantitative · Cross-Sectional Survey',
  discipline: 'Educational Technology',
  keyFactors: [
    'Fully anonymous — no names, IDs, or contact info collected',
    'Adults only (18+), no vulnerable populations',
    'Online survey platform (Qualtrics) with auto-randomized order',
    'Minimal risk: no sensitive topics, no psychological probing',
    'Disclosure of responses poses no risk of harm to participants',
  ],
  reviewRationale:
    'This study qualifies for Exempt Category 2 (45 CFR 46.104(d)(2)) because it uses survey procedures with adults only and the data are collected anonymously. Disclosure of responses would not reasonably place subjects at risk of criminal or civil liability, financial harm, employability harm, or stigmatization.',

  formData: {
    prescreening: {
      isResearch: true,
      involvesHumanSubjects: true,
      isStudentResearcher: true,
      hasFacultyAdvisor: true,
      hasCITITraining: true,
      citiCompletionDate: iso(-18),
      citiExpiryDate: iso(18),
      citiCertFileName: 'CITI_Certificate_Rivera.pdf',
      isNewProtocol: true,
    },
    researcher: {
      piFirstName: 'Sofia',
      piLastName: 'Rivera',
      piEmail: 'srivera@bridgeport.edu',
      piPhone: '(203) 576-4200',
      piDepartment: 'School of Education',
      piDegree: 'Master of Education (EdM)',
      advisorFirstName: 'Dr. James',
      advisorLastName: 'Chen',
      advisorEmail: 'jchen@bridgeport.edu',
      advisorDepartment: 'School of Education',
      coInvestigators: [],
      researchAssociates: [],
    },
    study: {
      title: 'Digital Learning Preferences Among Community College Students: A Quantitative Survey Study',
      shortTitle: 'Digital Learning Preferences Survey',
      startDate: iso(1),
      endDate: iso(7),
      projectType: 'thesis',
      fundingSource: 'None',
      grantNumber: '',
      studyPurpose:
        'This study investigates how community college students prefer to engage with digital instructional materials, examining differences between synchronous and asynchronous formats, video-based versus text-based content, and the role of self-regulation in format preference.',
      scientificBackground:
        'The rapid expansion of online learning in community colleges has created a need to understand student format preferences. Prior research suggests format preference correlates with self-efficacy and prior technology experience, but few studies have examined community college populations specifically.',
      researchQuestions:
        '1. What digital learning format do community college students most prefer for course content delivery?\n2. How do preferences differ by age group, program of study, and prior online learning experience?\n3. What self-regulation strategies do community college students report when using asynchronous video content?',
      methodology:
        'Quantitative cross-sectional survey design using a validated instrument (the Online Learning Preference Scale, OLPS-R) administered via Qualtrics. Stratified convenience sampling across three community colleges.',
      studySites: 'Community College of Rhode Island, Norwalk Community College, Gateway Community College',
      isMultiSite: true,
      externalIRB: false,
    },
    subjects: {
      totalParticipants: 250,
      minAge: 18,
      maxAge: 65,
      includesMinors: false,
      minorAgeRange: '',
      includesPrisoners: false,
      includesPregnantWomen: false,
      includesCognitivelyImpaired: false,
      includesUBStudents: false,
      includesUBEmployees: false,
      includesEconomicallyDisadvantaged: false,
      subjectPopulation:
        'Enrolled students (18+) at three Connecticut and Rhode Island community colleges who have completed at least one online or hybrid course.',
      recruitmentMethod: ['email', 'in_class_announcement'],
      inclusionCriteria:
        'Age 18 or older; currently enrolled at one of the three participating community colleges; completed at least one online or hybrid course in the past two years.',
      exclusionCriteria:
        'Students under 18; students who have never taken an online or hybrid course; non-enrolled community members.',
      compensationOffered: false,
      compensationDetails: '',
      extraCreditOffered: false,
    },
    procedures: {
      methodTypes: ['survey'],
      surveyTopics:
        'Digital learning format preferences, self-regulation strategies, technology comfort, prior online learning experience, preferred content modalities.',
      interviewTopics: '',
      observationContext: '',
      involvesDeception: false,
      deceptionDescription: '',
      deceptionDebriefing: null,
      involvesRecording: false,
      recordingTypes: [],
      involvesBloodDraw: false,
      bloodDrawAmount: '',
      bloodDrawFrequency: '',
      involvesOtherBiospecimen: false,
      biospecimenDescription: '',
      involvesPhysicalProcedure: false,
      physicalProcedureDescription: '',
      involvesRandomization: false,
      randomizationDescription: '',
      participationDuration: '20',
      participationDurationUnit: 'minutes',
      totalStudyDuration: '6 months',
      usesExistingData: false,
      existingDataDescription: '',
      existingDataIdentifiable: null,
      dataSourcePubliclyAvailable: null,
    },
    risks: {
      riskLevel: 'minimal',
      physicalRisks: 'None.',
      psychologicalRisks:
        'Minimal. Questions about learning preferences and habits are not expected to cause distress. Participants may skip any question.',
      privacyRisks: 'None. The survey is fully anonymous and no identifying information is collected.',
      socialRisks: 'None.',
      legalRisks: 'None.',
      economicRisks: 'None.',
      otherRisks: 'None.',
      riskMinimization:
        'Survey is anonymous. No IP addresses or metadata will be collected. Participation is voluntary and participants may exit at any time without consequence.',
      directBenefits: false,
      directBenefitDescription: '',
      societalBenefits:
        'Findings will inform instructional design decisions at community colleges, potentially improving online learning experiences for thousands of students.',
      adverseEventPlan: 'No adverse events are anticipated given the anonymous, minimal-risk nature of the survey.',
      hasDataSafetyMonitoring: false,
    },
    data: {
      collectsIdentifiers: false,
      identifierTypes: [],
      dataCollectionMethod: ['online_survey'],
      dataStorageLocation: ['university_server'],
      dataEncrypted: true,
      dataAccessList: 'Principal Investigator (Sofia Rivera), Faculty Advisor (Dr. James Chen)',
      retentionPeriod: '3',
      retentionUnit: 'years',
      dataDestroyedAfterStudy: true,
      destructionMethod: 'Permanent deletion from Qualtrics and university server after 3 years.',
      dataShared: false,
      dataSharingDetails: '',
      hipaaApplicable: false,
      certificateOfConfidentiality: false,
      anonymousData: true,
      codedData: false,
      codingKeyDescription: '',
    },
    consent: {
      consentRequired: true,
      waiverOfConsent: false,
      waiverBasis: '',
      documentedConsent: false,
      waiverOfDocumentation: true,
      waiverDocBasis:
        'The only record linking the subject to the research would be the consent document, and the principal risk would be a breach of confidentiality. An information sheet (implied consent via survey submission) is used instead.',
      consentLanguage: 'English',
      translationNeeded: false,
      translationLanguage: '',
      assentRequired: false,
      parentPermissionRequired: false,
      onlineConsent: true,
      consentProcess:
        'Participants receive an online information sheet explaining the study purpose, voluntary participation, anonymity, and researcher contact information. Proceeding with the survey constitutes consent.',
      keyRisksForConsent: 'There are no foreseeable risks to participants.',
      keyBenefitsForConsent:
        'Participants will contribute to research that may improve online learning design for community college students.',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Study 2 — EXEMPT Category 4
// Secondary analysis of publicly available IPEDS data (no subject interaction)
// ─────────────────────────────────────────────────────────────────────────────
const study2_exempt_cat4 = {
  id: 'exempt-cat4-secondary',
  expectedReview: 'EXEMPT',
  expectedCategory: 4,
  badge: 'Exempt — Category 4',
  badgeColor: 'emerald',
  shortTitle: 'STEM Graduation Trends (Public Data)',
  description:
    'Longitudinal analysis of five-year STEM graduation-rate trends using publicly available IPEDS data. No human subject interaction whatsoever — purely secondary analysis of institutional-level aggregated data.',
  methodology: 'Quantitative · Secondary Data Analysis',
  discipline: 'Higher Education Research',
  keyFactors: [
    'Uses IPEDS — a publicly available federal database (no subject interaction)',
    'Institutional-level aggregated data only (no individual identifiers)',
    'No living individuals are contacted or observed',
    'Publicly available data automatically qualifies for 45 CFR 46.104(d)(4)(i)',
    'No risk of harm to any individual',
  ],
  reviewRationale:
    'This study qualifies for Exempt Category 4 (45 CFR 46.104(d)(4)(i)) because it uses secondary research on data that are publicly available. IPEDS data are published by the National Center for Education Statistics and are freely accessible. No individual-level data are used and no subjects are contacted.',

  formData: {
    prescreening: {
      isResearch: true,
      involvesHumanSubjects: true,
      isStudentResearcher: true,
      hasFacultyAdvisor: true,
      hasCITITraining: true,
      citiCompletionDate: iso(-6),
      citiExpiryDate: iso(30),
      citiCertFileName: 'CITI_Certificate_Okafor.pdf',
      isNewProtocol: true,
    },
    researcher: {
      piFirstName: 'Emeka',
      piLastName: 'Okafor',
      piEmail: 'eokafor@bridgeport.edu',
      piPhone: '(203) 576-4300',
      piDepartment: 'College of Arts and Sciences',
      piDegree: 'Doctor of Philosophy (PhD)',
      advisorFirstName: 'Dr. Patricia',
      advisorLastName: 'Nguyen',
      advisorEmail: 'pnguyen@bridgeport.edu',
      advisorDepartment: 'College of Arts and Sciences',
      coInvestigators: [],
      researchAssociates: [],
    },
    study: {
      title: 'Five-Year Trends in STEM Graduation Rates at Minority-Serving Institutions: A Secondary Analysis of IPEDS Data (2018–2023)',
      shortTitle: 'STEM Graduation Trends at MSIs',
      startDate: iso(0),
      endDate: iso(10),
      projectType: 'dissertation',
      fundingSource: 'None',
      grantNumber: '',
      studyPurpose:
        'This study examines five-year trends in STEM graduation rates at Historically Black Colleges and Universities (HBCUs), Hispanic-Serving Institutions (HSIs), and tribal colleges using publicly available IPEDS data, with the goal of identifying institutional characteristics associated with improved outcomes.',
      scientificBackground:
        'Despite decades of policy attention, STEM degree attainment at minority-serving institutions remains uneven. Institutional-level IPEDS data provide a unique opportunity to examine trends across institution types without recruiting individual participants.',
      researchQuestions:
        '1. How have STEM graduation rates changed across MSI types over the 2018–2023 period?\n2. What institutional characteristics (size, Carnegie classification, federal funding) are associated with higher STEM graduation rates?\n3. Are there significant differences in STEM graduation trends by MSI type, region, or institution size?',
      methodology:
        'Quantitative longitudinal secondary data analysis using publicly available IPEDS data downloaded from the National Center for Education Statistics. Multiple regression and panel data models will be estimated in R.',
      studySites: 'Not applicable — publicly available institutional database',
      isMultiSite: false,
      externalIRB: false,
    },
    subjects: {
      totalParticipants: 0,
      minAge: '',
      maxAge: '',
      includesMinors: false,
      minorAgeRange: '',
      includesPrisoners: false,
      includesPregnantWomen: false,
      includesCognitivelyImpaired: false,
      includesUBStudents: false,
      includesUBEmployees: false,
      includesEconomicallyDisadvantaged: false,
      subjectPopulation:
        'No individual human subjects. Analysis uses aggregated institutional-level data from the IPEDS database. Individual students are not contacted, observed, or identified.',
      recruitmentMethod: [],
      inclusionCriteria: 'Not applicable — no individual subjects recruited.',
      exclusionCriteria: 'Not applicable.',
      compensationOffered: false,
      compensationDetails: '',
      extraCreditOffered: false,
    },
    procedures: {
      methodTypes: ['secondary_data_analysis'],
      surveyTopics: '',
      interviewTopics: '',
      observationContext: '',
      involvesDeception: false,
      deceptionDescription: '',
      deceptionDebriefing: null,
      involvesRecording: false,
      recordingTypes: [],
      involvesBloodDraw: false,
      bloodDrawAmount: '',
      bloodDrawFrequency: '',
      involvesOtherBiospecimen: false,
      biospecimenDescription: '',
      involvesPhysicalProcedure: false,
      physicalProcedureDescription: '',
      involvesRandomization: false,
      randomizationDescription: '',
      participationDuration: '0',
      participationDurationUnit: 'minutes',
      totalStudyDuration: '10 months',
      usesExistingData: true,
      existingDataDescription:
        'Integrated Postsecondary Education Data System (IPEDS) — a publicly available database maintained by NCES. Data accessed via NCES Data Center at https://nces.ed.gov/ipeds/. Academic years 2018–19 through 2022–23 will be downloaded.',
      existingDataIdentifiable: false,
      dataSourcePubliclyAvailable: true,
    },
    risks: {
      riskLevel: 'minimal',
      physicalRisks: 'None. No individual subjects are involved.',
      psychologicalRisks: 'None.',
      privacyRisks:
        'Minimal. IPEDS data are institutional-level and publicly available. No individual student or faculty data are used.',
      socialRisks: 'None.',
      legalRisks: 'None.',
      economicRisks: 'None.',
      otherRisks: 'None.',
      riskMinimization:
        'Only aggregate institutional-level data will be used. No attempt will be made to identify or reidentify individual students from aggregate data.',
      directBenefits: false,
      directBenefitDescription: '',
      societalBenefits:
        'Findings may inform federal policy, foundation grant-making, and institutional strategy to improve STEM degree completion at minority-serving institutions.',
      adverseEventPlan: 'No adverse events possible given the absence of individual human subjects.',
      hasDataSafetyMonitoring: false,
    },
    data: {
      collectsIdentifiers: false,
      identifierTypes: [],
      dataCollectionMethod: ['secondary_data'],
      dataStorageLocation: ['personal_computer'],
      dataEncrypted: true,
      dataAccessList: 'Principal Investigator (Emeka Okafor), Faculty Advisor (Dr. Patricia Nguyen)',
      retentionPeriod: '5',
      retentionUnit: 'years',
      dataDestroyedAfterStudy: false,
      destructionMethod: '',
      dataShared: true,
      dataSharingDetails:
        'Cleaned and recoded IPEDS dataset may be shared via OSF upon publication to support replication.',
      hipaaApplicable: false,
      certificateOfConfidentiality: false,
      anonymousData: true,
      codedData: false,
      codingKeyDescription: '',
    },
    consent: {
      consentRequired: false,
      waiverOfConsent: true,
      waiverBasis:
        'No individual human subjects are involved. Research uses publicly available, non-identifiable institutional data. Informed consent is not applicable.',
      documentedConsent: false,
      waiverOfDocumentation: true,
      waiverDocBasis: 'No consent obtained; not applicable.',
      consentLanguage: '',
      translationNeeded: false,
      translationLanguage: '',
      assentRequired: false,
      parentPermissionRequired: false,
      onlineConsent: false,
      consentProcess: 'Not applicable.',
      keyRisksForConsent: 'Not applicable.',
      keyBenefitsForConsent: 'Not applicable.',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Study 3 — EXPEDITED Category 4
// Semi-structured interviews, identifiable data, adult K-12 teachers
// ─────────────────────────────────────────────────────────────────────────────
const study3_expedited_cat4 = {
  id: 'expedited-cat4-interviews',
  expectedReview: 'EXPEDITED',
  expectedCategory: 4,
  badge: 'Expedited — Category 4',
  badgeColor: 'amber',
  shortTitle: 'Teacher Perspectives on Culturally Responsive Pedagogy',
  description:
    'Semi-structured qualitative interviews with urban K-12 teachers exploring their understanding and implementation of culturally responsive pedagogy. Identifiable participants (names + institutions collected for follow-up). Minimal risk.',
  methodology: 'Qualitative · Semi-Structured Interviews',
  discipline: 'Urban Education / Teacher Education',
  keyFactors: [
    'Identifiable participants — names and institutional affiliations collected',
    'Adults only (18+), no vulnerable populations',
    'Minimal risk: professional topic, voluntary participation',
    'Identifiers elevate beyond Exempt Cat 2 → requires Expedited review',
    'Noninvasive procedures with identifiable data = Expedited Category 4',
  ],
  reviewRationale:
    'This study qualifies for Expedited Category 4 (45 CFR 46.110(b)(1), Category 4) because it involves noninvasive data collection (interviews) with identifiable adult participants and presents minimal risk. The collection of names and institutional affiliations prevents qualification for Exempt Category 2, but the absence of vulnerable populations and minimal-risk procedures make Expedited review appropriate.',

  formData: {
    prescreening: {
      isResearch: true,
      involvesHumanSubjects: true,
      isStudentResearcher: true,
      hasFacultyAdvisor: true,
      hasCITITraining: true,
      citiCompletionDate: iso(-12),
      citiExpiryDate: iso(24),
      citiCertFileName: 'CITI_Certificate_Patel.pdf',
      isNewProtocol: true,
    },
    researcher: {
      piFirstName: 'Priya',
      piLastName: 'Patel',
      piEmail: 'ppatel@bridgeport.edu',
      piPhone: '(203) 576-4100',
      piDepartment: 'School of Education',
      piDegree: 'Doctor of Education (EdD)',
      advisorFirstName: 'Dr. Michelle',
      advisorLastName: 'Thompson',
      advisorEmail: 'mthompson@bridgeport.edu',
      advisorDepartment: 'School of Education',
      coInvestigators: [],
      researchAssociates: [],
    },
    study: {
      title: 'Culturally Responsive Pedagogy in Urban K-12 Settings: A Qualitative Study of Teacher Perspectives and Implementation Challenges',
      shortTitle: 'CRP Teacher Perspectives',
      startDate: iso(1),
      endDate: iso(9),
      projectType: 'dissertation',
      fundingSource: 'None',
      grantNumber: '',
      studyPurpose:
        'This study examines how urban K-12 teachers understand, conceptualize, and implement culturally responsive pedagogy (CRP) in their classrooms, and what institutional and personal factors facilitate or impede full implementation.',
      scientificBackground:
        'Culturally responsive pedagogy (CRP) has been advocated as a strategy for improving academic engagement and achievement among culturally and linguistically diverse students. However, research on how teachers actually operationalize CRP in urban settings remains limited, particularly in terms of the gap between theoretical knowledge and classroom practice.',
      researchQuestions:
        '1. How do urban K-12 teachers conceptualize culturally responsive pedagogy?\n2. What strategies do teachers report using to implement CRP in their classrooms?\n3. What institutional, personal, or systemic barriers do teachers identify as impediments to CRP implementation?',
      methodology:
        'Qualitative phenomenological study using semi-structured individual interviews. Purposive sampling of 20 K-12 teachers across urban school districts in Connecticut. Thematic analysis using NVivo.',
      studySites: 'New Haven Public Schools, Bridgeport Public Schools, Hartford Public Schools',
      isMultiSite: true,
      externalIRB: false,
    },
    subjects: {
      totalParticipants: 20,
      minAge: 22,
      maxAge: 65,
      includesMinors: false,
      minorAgeRange: '',
      includesPrisoners: false,
      includesPregnantWomen: false,
      includesCognitivelyImpaired: false,
      includesUBStudents: false,
      includesUBEmployees: false,
      includesEconomicallyDisadvantaged: false,
      subjectPopulation:
        'K-12 classroom teachers employed in urban public school districts in Connecticut who have at least two years of teaching experience.',
      recruitmentMethod: ['email', 'snowball'],
      inclusionCriteria:
        'Currently employed K-12 classroom teacher; minimum 2 years of teaching experience; employed in a Connecticut urban public school district; teaches in a school where more than 50% of students are students of color.',
      exclusionCriteria:
        'Administrators, counselors, or non-classroom instructional staff; teachers with fewer than 2 years of experience.',
      compensationOffered: true,
      compensationDetails: '$25 Amazon gift card provided at the conclusion of the interview.',
      extraCreditOffered: false,
    },
    procedures: {
      methodTypes: ['interview'],
      surveyTopics: '',
      interviewTopics:
        'Teaching philosophy, understanding of culturally responsive pedagogy, specific classroom strategies, professional development experiences related to CRP, school-level support and barriers, perceived impact on student engagement.',
      observationContext: '',
      involvesDeception: false,
      deceptionDescription: '',
      deceptionDebriefing: null,
      involvesRecording: false,
      recordingTypes: [],
      involvesBloodDraw: false,
      bloodDrawAmount: '',
      bloodDrawFrequency: '',
      involvesOtherBiospecimen: false,
      biospecimenDescription: '',
      involvesPhysicalProcedure: false,
      physicalProcedureDescription: '',
      involvesRandomization: false,
      randomizationDescription: '',
      participationDuration: '60',
      participationDurationUnit: 'minutes',
      totalStudyDuration: '8 months',
      usesExistingData: false,
      existingDataDescription: '',
      existingDataIdentifiable: null,
      dataSourcePubliclyAvailable: null,
    },
    risks: {
      riskLevel: 'minimal',
      physicalRisks: 'None.',
      psychologicalRisks:
        'Minimal. Interview questions address professional practices and beliefs. Participants may experience mild discomfort discussing institutional barriers. Participants may skip any question or withdraw at any time.',
      privacyRisks:
        'Moderate privacy risk given identifiable data. Participants may discuss sensitive school-level issues. All identifying information will be replaced with pseudonyms in transcripts and publications.',
      socialRisks:
        'Low. Participants could theoretically experience professional repercussions if their views were disclosed to employers, but data will be de-identified in publications.',
      legalRisks: 'None.',
      economicRisks: 'None.',
      otherRisks: 'None.',
      riskMinimization:
        'Pseudonyms assigned immediately upon transcription. Participant names and identifying data stored separately from interview content on encrypted drive. Employer names omitted from published reports. Member checking offered to all participants.',
      directBenefits: false,
      directBenefitDescription: '',
      societalBenefits:
        'Findings will contribute to teacher education programs and professional development initiatives aimed at improving culturally responsive practices in urban schools.',
      adverseEventPlan:
        'If a participant becomes distressed during the interview, the researcher will pause, remind them of their right to stop, and provide contact information for the school district employee assistance program.',
      hasDataSafetyMonitoring: false,
    },
    data: {
      collectsIdentifiers: true,
      identifierTypes: ['name', 'email', 'institution'],
      dataCollectionMethod: ['interview', 'written_notes'],
      dataStorageLocation: ['encrypted_drive'],
      dataEncrypted: true,
      dataAccessList: 'Principal Investigator (Priya Patel), Faculty Advisor (Dr. Michelle Thompson)',
      retentionPeriod: '5',
      retentionUnit: 'years',
      dataDestroyedAfterStudy: true,
      destructionMethod: 'Secure deletion of identifiable records 5 years post-publication. De-identified transcripts may be retained.',
      dataShared: false,
      dataSharingDetails: '',
      hipaaApplicable: false,
      certificateOfConfidentiality: false,
      anonymousData: false,
      codedData: true,
      codingKeyDescription:
        'Participant names replaced with alphanumeric codes (e.g., T01, T02) upon transcription. The master key linking names to codes stored in a separate, password-protected file accessible only to the PI.',
    },
    consent: {
      consentRequired: true,
      waiverOfConsent: false,
      waiverBasis: '',
      documentedConsent: true,
      waiverOfDocumentation: false,
      waiverDocBasis: '',
      consentLanguage: 'English',
      translationNeeded: false,
      translationLanguage: '',
      assentRequired: false,
      parentPermissionRequired: false,
      onlineConsent: false,
      consentProcess:
        'Participants will receive the consent form by email at least 48 hours before the scheduled interview. The researcher will review the form verbally at the start of the interview, answer any questions, and obtain a signed copy before beginning.',
      keyRisksForConsent:
        'There is a minor risk that participants could be identified through their descriptions of school contexts. All identifying information will be replaced with pseudonyms in publications.',
      keyBenefitsForConsent:
        'Participation may allow teachers to reflect on their own practice and contribute to professional knowledge about culturally responsive teaching.',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Study 4 — EXPEDITED Category 6
// Audio/video recorded focus groups, graduate students, no critical identifiers
// ─────────────────────────────────────────────────────────────────────────────
const study4_expedited_cat6 = {
  id: 'expedited-cat6-recording',
  expectedReview: 'EXPEDITED',
  expectedCategory: 6,
  badge: 'Expedited — Category 6',
  badgeColor: 'amber',
  shortTitle: 'Graduate Student Self-Efficacy Focus Groups (Recorded)',
  description:
    'Video-recorded focus groups exploring barriers to academic self-efficacy among first-generation doctoral students. Participants are audio/video recorded; assigned pseudonyms; minimal risk. Recording requirement triggers Expedited Category 6.',
  methodology: 'Qualitative · Focus Groups (Audio/Video Recorded)',
  discipline: 'Higher Education / Counseling Education',
  keyFactors: [
    'Audio AND video recording of focus groups — the defining feature for Cat 6',
    'Pseudonyms used — no critical identifiers (name/SSN/ID) collected',
    'Adults only (18+), graduate students, minimal risk',
    'Recording itself requires Expedited review even without sensitive content',
    'Category 6: "Collection of data from voice, video, digital, or image recordings"',
  ],
  reviewRationale:
    'This study qualifies for Expedited Category 6 (45 CFR 46.110(b)(1), Category 6) because it involves the collection of data from voice and video recordings. Although the research topic is not sensitive and participants are assigned pseudonyms, the act of recording creates a record that can be linked to specific identifiable individuals, requiring at minimum Expedited review. The study presents minimal risk.',

  formData: {
    prescreening: {
      isResearch: true,
      involvesHumanSubjects: true,
      isStudentResearcher: true,
      hasFacultyAdvisor: true,
      hasCITITraining: true,
      citiCompletionDate: iso(-8),
      citiExpiryDate: iso(28),
      citiCertFileName: 'CITI_Certificate_Washington.pdf',
      isNewProtocol: true,
    },
    researcher: {
      piFirstName: 'Marcus',
      piLastName: 'Washington',
      piEmail: 'mwashington@bridgeport.edu',
      piPhone: '(203) 576-4400',
      piDepartment: 'School of Education',
      piDegree: 'Doctor of Education (EdD)',
      advisorFirstName: 'Dr. Sandra',
      advisorLastName: 'Collins',
      advisorEmail: 'scollins@bridgeport.edu',
      advisorDepartment: 'School of Education',
      coInvestigators: [],
      researchAssociates: [],
    },
    study: {
      title: 'Academic Self-Efficacy Barriers Among First-Generation Doctoral Students: A Qualitative Focus Group Study',
      shortTitle: 'Doctoral Self-Efficacy Focus Groups',
      startDate: iso(2),
      endDate: iso(10),
      projectType: 'dissertation',
      fundingSource: 'None',
      grantNumber: '',
      studyPurpose:
        'This study explores how first-generation doctoral students perceive and experience barriers to academic self-efficacy, with particular attention to the intersection of imposter phenomenon, mentorship quality, and departmental climate.',
      scientificBackground:
        'First-generation doctoral students face unique challenges that affect their academic self-efficacy and persistence. Focus groups provide a rich interactive format for exploring shared and divergent experiences that individual interviews may not capture.',
      researchQuestions:
        '1. How do first-generation doctoral students describe academic self-efficacy in their programs?\n2. What barriers to self-efficacy do first-generation doctoral students identify?\n3. How do mentorship relationships and departmental climate influence self-efficacy perceptions?',
      methodology:
        'Qualitative focus group design. Four focus groups of 5–8 participants each, conducted via Zoom and recorded (audio + video). Participants assigned pseudonyms. Thematic analysis.',
      studySites: 'University of Bridgeport; remote Zoom sessions',
      isMultiSite: false,
      externalIRB: false,
    },
    subjects: {
      totalParticipants: 30,
      minAge: 23,
      maxAge: 60,
      includesMinors: false,
      minorAgeRange: '',
      includesPrisoners: false,
      includesPregnantWomen: false,
      includesCognitivelyImpaired: false,
      includesUBStudents: true,
      includesUBEmployees: false,
      includesEconomicallyDisadvantaged: false,
      subjectPopulation:
        'Current doctoral students who self-identify as first-generation college students (neither parent completed a bachelor\'s degree) enrolled at accredited U.S. doctoral programs.',
      recruitmentMethod: ['email', 'social_media', 'snowball'],
      inclusionCriteria:
        'Currently enrolled in a doctoral program (PhD, EdD, or equivalent); self-identifies as first-generation college student; age 18 or older.',
      exclusionCriteria: 'Students who have already completed their dissertation defense; non-doctoral graduate students.',
      compensationOffered: true,
      compensationDetails: '$30 Visa gift card provided after each focus group session.',
      extraCreditOffered: false,
    },
    procedures: {
      methodTypes: ['focus_group'],
      surveyTopics: '',
      interviewTopics:
        'Academic self-efficacy experiences, imposter phenomenon, mentorship quality, departmental belonging, barriers to persistence, support systems.',
      observationContext: '',
      involvesDeception: false,
      deceptionDescription: '',
      deceptionDebriefing: null,
      involvesRecording: true,
      recordingTypes: ['audio', 'video'],
      involvesBloodDraw: false,
      bloodDrawAmount: '',
      bloodDrawFrequency: '',
      involvesOtherBiospecimen: false,
      biospecimenDescription: '',
      involvesPhysicalProcedure: false,
      physicalProcedureDescription: '',
      involvesRandomization: false,
      randomizationDescription: '',
      participationDuration: '90',
      participationDurationUnit: 'minutes',
      totalStudyDuration: '8 months',
      usesExistingData: false,
      existingDataDescription: '',
      existingDataIdentifiable: null,
      dataSourcePubliclyAvailable: null,
    },
    risks: {
      riskLevel: 'minimal',
      physicalRisks: 'None.',
      psychologicalRisks:
        'Low. Participants may experience mild discomfort discussing challenging academic experiences or imposter feelings. The focus group setting could create social pressure. Ground rules will be established at the outset emphasizing confidentiality within the group.',
      privacyRisks:
        'Moderate due to video recording. Participants will be informed that recordings will be seen only by the research team and transcriptionist. Recordings will be deleted after transcription.',
      socialRisks:
        'Low. Group format means participants hear each other\'s responses, but a confidentiality agreement will be requested of all participants.',
      legalRisks: 'None.',
      economicRisks: 'None.',
      otherRisks: 'None.',
      riskMinimization:
        'Participants may choose audio-only participation (camera off). Pseudonyms used throughout. Recordings accessible only to PI and research team. Recordings destroyed within 30 days of transcription completion. Participants sign a group confidentiality agreement.',
      directBenefits: false,
      directBenefitDescription: '',
      societalBenefits:
        'Findings will inform doctoral program design, graduate mentoring practices, and support services for first-generation students.',
      adverseEventPlan:
        'If a participant becomes distressed, the PI will acknowledge their experience, pause if needed, and provide the UB Graduate Student Counseling Services contact. Participants may exit the session at any time.',
      hasDataSafetyMonitoring: false,
    },
    data: {
      collectsIdentifiers: false,
      identifierTypes: [],
      dataCollectionMethod: ['focus_group', 'recording'],
      dataStorageLocation: ['encrypted_drive', 'university_server'],
      dataEncrypted: true,
      dataAccessList: 'Principal Investigator (Marcus Washington), Faculty Advisor (Dr. Sandra Collins), Transcription contractor (under NDA)',
      retentionPeriod: '5',
      retentionUnit: 'years',
      dataDestroyedAfterStudy: true,
      destructionMethod: 'Recordings destroyed within 30 days of transcript completion. De-identified transcripts retained for 5 years, then permanently deleted.',
      dataShared: false,
      dataSharingDetails: '',
      hipaaApplicable: false,
      certificateOfConfidentiality: false,
      anonymousData: false,
      codedData: true,
      codingKeyDescription:
        'Each participant assigned a pseudonym (e.g., "Participant Aurora") randomly generated prior to the session. No master key linking pseudonyms to real names is maintained after the consent process is complete.',
    },
    consent: {
      consentRequired: true,
      waiverOfConsent: false,
      waiverBasis: '',
      documentedConsent: true,
      waiverOfDocumentation: false,
      waiverDocBasis: '',
      consentLanguage: 'English',
      translationNeeded: false,
      translationLanguage: '',
      assentRequired: false,
      parentPermissionRequired: false,
      onlineConsent: true,
      consentProcess:
        'Electronic informed consent obtained via DocuSign at least 24 hours prior to the focus group. The consent form includes a separate recording authorization section with the option to decline recording while still participating. Participants who decline recording participate with audio/camera disabled and are transcribed via written notes only.',
      keyRisksForConsent:
        'Video and audio recording of sessions. Risk that other participants may share group discussions outside the group despite the confidentiality agreement request.',
      keyBenefitsForConsent:
        'Opportunity to share experiences and contribute to research that may improve doctoral program environments for first-generation students.',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Study 5 — FULL BOARD
// RCT with minors (elementary students), greater-than-minimal risk
// ─────────────────────────────────────────────────────────────────────────────
const study5_full_board_minors = {
  id: 'full-board-minors-rct',
  expectedReview: 'FULL_BOARD',
  expectedCategory: null,
  badge: 'Full Board Review',
  badgeColor: 'red',
  shortTitle: 'Cooperative Learning RCT (Elementary Students)',
  description:
    'Randomized controlled trial testing a cooperative-learning math intervention with elementary students (ages 8–11). Involves minors, randomization to intervention/control, greater-than-minimal risk due to academic impact, and potential stigmatization. Requires Full Board review.',
  methodology: 'Quantitative · Randomized Controlled Trial (RCT)',
  discipline: 'Elementary Education / Math Achievement',
  keyFactors: [
    'Participants are minors (ages 8–11) — requires parental permission + child assent',
    'Randomized assignment to intervention/control conditions',
    'Greater-than-minimal risk: randomization creates differential academic exposure',
    'Risk of stigmatization if intervention group performance is disclosed',
    'Full Board required: greater-than-minimal risk is a hard trigger under 45 CFR 46',
  ],
  reviewRationale:
    'Full Board review is required because this study presents greater than minimal risk to participants (45 CFR 46.102(j)) — specifically, the risk that assignment to the control condition may place students at a relative academic disadvantage, and that disclosure of group assignment or results could create stigmatization. Additionally, participants are minors (Subpart D applies), requiring both parental permission and child assent.',

  formData: {
    prescreening: {
      isResearch: true,
      involvesHumanSubjects: true,
      isStudentResearcher: false,
      hasFacultyAdvisor: false,
      hasCITITraining: true,
      citiCompletionDate: iso(-3),
      citiExpiryDate: iso(33),
      citiCertFileName: 'CITI_Certificate_Kowalski.pdf',
      isNewProtocol: true,
    },
    researcher: {
      piFirstName: 'Dr. Anna',
      piLastName: 'Kowalski',
      piEmail: 'akowalski@bridgeport.edu',
      piPhone: '(203) 576-4500',
      piDepartment: 'School of Education',
      piDegree: 'PhD',
      advisorFirstName: '',
      advisorLastName: '',
      advisorEmail: '',
      advisorDepartment: '',
      coInvestigators: [
        { name: 'Dr. Robert Kim', email: 'rkim@bridgeport.edu', department: 'School of Education' },
      ],
      researchAssociates: [],
    },
    study: {
      title: 'The Effect of Cooperative Learning Structures on Mathematical Achievement and Engagement in Grades 3–5: A Randomized Controlled Trial',
      shortTitle: 'Cooperative Learning Math RCT',
      startDate: iso(2),
      endDate: iso(14),
      projectType: 'grant_funded',
      fundingSource: 'Institute of Education Sciences (IES)',
      grantNumber: 'R305A220001',
      studyPurpose:
        'This study tests the effectiveness of a structured cooperative learning mathematics curriculum (the BUILD-Math program) on third- through fifth-grade student achievement and math engagement compared to standard instruction, using a cluster-randomized design at the classroom level.',
      scientificBackground:
        'Cooperative learning has long been associated with positive outcomes, but rigorous experimental evidence for its effect on elementary math achievement — particularly in high-need schools — remains limited. This RCT addresses a critical gap in the evidence base by using a cluster-randomized design with a well-defined intervention.',
      researchQuestions:
        '1. Does the BUILD-Math cooperative learning program improve mathematics achievement (standardized test scores) compared to control instruction after one academic year?\n2. Does the program improve student engagement and math self-concept?\n3. Are effects moderated by race/ethnicity, prior achievement, or socioeconomic status?',
      methodology:
        'Cluster-randomized controlled trial. Classrooms randomized to BUILD-Math intervention or business-as-usual control. Pre- and post-assessments using the STAR Math standardized assessment. Teacher observations conducted at weeks 4, 8, and 12 of implementation.',
      studySites: 'Bridgeport Public Schools — 6 elementary schools, 24 classrooms',
      isMultiSite: true,
      externalIRB: false,
    },
    subjects: {
      totalParticipants: 480,
      minAge: 8,
      maxAge: 11,
      includesMinors: true,
      minorAgeRange: '8–11 years (Grades 3–5)',
      includesPrisoners: false,
      includesPregnantWomen: false,
      includesCognitivelyImpaired: false,
      includesUBStudents: false,
      includesUBEmployees: false,
      includesEconomicallyDisadvantaged: true,
      subjectPopulation:
        'Third-, fourth-, and fifth-grade students enrolled in Bridgeport Public Schools. The district serves a predominantly low-income, racially diverse population. Students from all classrooms selected for participation will be invited, including students with IEPs (with appropriate accommodations).',
      recruitmentMethod: ['school_district', 'in_class_announcement'],
      inclusionCriteria:
        'Enrolled in a participating Grades 3–5 classroom in a selected school; parental permission obtained; child assent obtained (for children age 7+ capable of providing assent).',
      exclusionCriteria:
        'Parents/guardians who do not provide permission; children who actively decline assent; students in self-contained special education classrooms (separate RCT planned).',
      compensationOffered: false,
      compensationDetails: '',
      extraCreditOffered: false,
    },
    procedures: {
      methodTypes: ['survey', 'educational_assessment', 'observation_structured'],
      surveyTopics: 'Math self-concept, engagement, cooperative learning attitudes (administered via teacher-read age-appropriate Likert-scale instruments).',
      interviewTopics: '',
      observationContext:
        'Trained observers conduct 45-minute classroom observations at three time points (weeks 4, 8, 12) using a structured protocol (Classroom Assessment Scoring System — CLASS) to assess implementation fidelity.',
      involvesDeception: false,
      deceptionDescription: '',
      deceptionDebriefing: null,
      involvesRecording: false,
      recordingTypes: [],
      involvesBloodDraw: false,
      bloodDrawAmount: '',
      bloodDrawFrequency: '',
      involvesOtherBiospecimen: false,
      biospecimenDescription: '',
      involvesPhysicalProcedure: false,
      physicalProcedureDescription: '',
      involvesRandomization: true,
      randomizationDescription:
        'Cluster randomization at the classroom level: classrooms (not individual students) are randomly assigned to intervention or control condition using a stratified randomization procedure to balance schools and grade levels across arms. Assignment completed by an independent statistician prior to study launch.',
      participationDuration: '45',
      participationDurationUnit: 'minutes',
      totalStudyDuration: '12 months',
      usesExistingData: false,
      existingDataDescription: '',
      existingDataIdentifiable: null,
      dataSourcePubliclyAvailable: null,
    },
    risks: {
      riskLevel: 'greater',
      physicalRisks: 'None.',
      psychologicalRisks:
        'Low-moderate. Students assigned to the control condition receive standard instruction and are not disadvantaged relative to their peers outside the study. However, if students become aware of group assignment, control-group students may perceive themselves as excluded from a beneficial program. Classroom teachers will be instructed not to discuss group assignment with students.',
      privacyRisks:
        'Moderate. Standardized assessment scores and teacher observation data will be linked to student identifiers during analysis. All published analyses will use aggregate-level data only.',
      socialRisks:
        'Low-moderate. Potential for stigmatization if students or parents learn that their classroom received less-effective instruction. Safeguards include witholding group assignment from parents during the study year; control classrooms offered the intervention in the following year.',
      legalRisks:
        'Low. FERPA-protected student records (prior assessment scores) obtained through a data sharing agreement with the district.',
      economicRisks: 'None.',
      otherRisks:
        'Implementation risk: If the intervention is disrupted mid-year (e.g., teacher absence, school closure), affected classrooms will be considered protocol deviations and reported to the IRB.',
      riskMinimization:
        'Cluster randomization minimizes individual-level risk by treating the classroom as the unit of assignment. Control classrooms will receive the intervention in Year 2 (waitlist design). Student data de-identified for analysis. Standardized assessments are also used for regular district accountability, minimizing additional burden.',
      directBenefits: true,
      directBenefitDescription:
        'Students in the intervention condition will receive a structured, evidence-based cooperative learning math curriculum. All students will receive the intervention in the following school year.',
      societalBenefits:
        'If effective, the BUILD-Math program could be adopted at scale, improving math outcomes for thousands of elementary students in high-need districts.',
      adverseEventPlan:
        'The study involves no physical procedures. Any reports of student distress related to research activities will be documented and reported to the IRB within 10 business days. A data safety monitoring committee (DSMC) will review interim data at the midpoint of the study year.',
      hasDataSafetyMonitoring: true,
    },
    data: {
      collectsIdentifiers: true,
      identifierTypes: ['name', 'student_id', 'school_id'],
      dataCollectionMethod: ['standardized_test', 'survey', 'observation', 'school_records'],
      dataStorageLocation: ['university_server', 'encrypted_drive'],
      dataEncrypted: true,
      dataAccessList:
        'PI (Dr. Kowalski), Co-Investigator (Dr. Kim), Research Coordinator, Biostatistician. District data steward will review access under the data sharing agreement.',
      retentionPeriod: '7',
      retentionUnit: 'years',
      dataDestroyedAfterStudy: true,
      destructionMethod: 'Identifiable records securely deleted 7 years post-final publication. Student IDs replaced with random codes in analysis datasets before archiving.',
      dataShared: true,
      dataSharingDetails:
        'De-identified analysis dataset will be deposited in IES ERIC repository upon study completion, consistent with IES data sharing requirements.',
      hipaaApplicable: false,
      certificateOfConfidentiality: false,
      anonymousData: false,
      codedData: true,
      codingKeyDescription:
        'Student names and district IDs replaced with random 6-digit research codes. Coding key maintained separately in a password-protected file accessible only to PI and Co-I.',
    },
    consent: {
      consentRequired: true,
      waiverOfConsent: false,
      waiverBasis: '',
      documentedConsent: true,
      waiverOfDocumentation: false,
      waiverDocBasis: '',
      consentLanguage: 'English, Spanish',
      translationNeeded: true,
      translationLanguage: 'Spanish',
      assentRequired: true,
      parentPermissionRequired: true,
      onlineConsent: false,
      consentProcess:
        'Written parental permission forms sent home via the district\'s standard communication channels (backpack mail + ParentVUE digital portal) in English and Spanish. Child assent obtained verbally by the classroom teacher using an age-appropriate script. Children who decline assent are still in the classroom but their data are excluded.',
      keyRisksForConsent:
        'Random assignment to intervention or control condition. Control condition students receive standard instruction and will receive the intervention in the following school year. Standardized test scores and classroom observations will be collected.',
      keyBenefitsForConsent:
        'Students in the intervention condition receive a research-based cooperative learning math program. All participating students contribute to research that may improve math instruction in high-need schools.',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Study 6 — FULL BOARD
// Doctoral burnout: longitudinal, clinical psychological measures, greater risk
// ─────────────────────────────────────────────────────────────────────────────
const study6_full_board_psychological = {
  id: 'full-board-burnout-longitudinal',
  expectedReview: 'FULL_BOARD',
  expectedCategory: null,
  badge: 'Full Board Review',
  badgeColor: 'red',
  shortTitle: 'Doctoral Burnout: Longitudinal Mixed Methods',
  description:
    'Longitudinal mixed-methods study of burnout and attrition risk among doctoral students using clinical psychological measures (PHQ-9, Maslach Burnout Inventory). Greater-than-minimal psychological risk, certificate of confidentiality, 6-month follow-up. Full Board required.',
  methodology: 'Mixed Methods · Longitudinal (3 time points, 6 months)',
  discipline: 'Higher Education / Counseling Psychology',
  keyFactors: [
    'Clinical depression screening (PHQ-9) — triggers greater-than-minimal risk',
    'Maslach Burnout Inventory (MBI) — validated clinical measure of burnout',
    'Longitudinal design: 3 time points over 6 months with identifiable tracking',
    'Certificate of Confidentiality required due to mental health data sensitivity',
    'Greater-than-minimal psychological risk is a hard trigger for Full Board',
  ],
  reviewRationale:
    'Full Board review is required because this study presents greater than minimal risk to participants (45 CFR 46.102(j)). The use of the PHQ-9 depression screening instrument means the study may identify participants at risk for major depressive disorder. Clinical screening generates a duty-to-report obligation and creates psychological risk beyond what would be encountered in daily life. A Certificate of Confidentiality is required to protect sensitive mental health data from compelled disclosure.',

  formData: {
    prescreening: {
      isResearch: true,
      involvesHumanSubjects: true,
      isStudentResearcher: false,
      hasFacultyAdvisor: false,
      hasCITITraining: true,
      citiCompletionDate: iso(-2),
      citiExpiryDate: iso(34),
      citiCertFileName: 'CITI_Certificate_Ibrahim.pdf',
      isNewProtocol: true,
    },
    researcher: {
      piFirstName: 'Dr. Leila',
      piLastName: 'Ibrahim',
      piEmail: 'librahim@bridgeport.edu',
      piPhone: '(203) 576-4600',
      piDepartment: 'Department of Counselor Education',
      piDegree: 'PhD',
      advisorFirstName: '',
      advisorLastName: '',
      advisorEmail: '',
      advisorDepartment: '',
      coInvestigators: [
        { name: 'Dr. Carlos Reyes', email: 'creyes@bridgeport.edu', department: 'Department of Psychology' },
      ],
      researchAssociates: [
        { name: 'Jenna Park', email: 'jpark@bridgeport.edu', role: 'Research Coordinator' },
      ],
    },
    study: {
      title: 'Burnout, Depression Risk, and Persistence Among Doctoral Students: A Longitudinal Mixed-Methods Study',
      shortTitle: 'Doctoral Burnout Longitudinal Study',
      startDate: iso(1),
      endDate: iso(13),
      projectType: 'grant_funded',
      fundingSource: 'Spencer Foundation',
      grantNumber: 'SF-2024-0782',
      studyPurpose:
        'This longitudinal mixed-methods study examines the trajectory of burnout and depression risk among doctoral students across three time points over six months, explores the role of advisor relationships and program climate in burnout development, and identifies protective factors associated with persistence.',
      scientificBackground:
        'Doctoral attrition rates approach 50% in many disciplines, and emerging evidence links high burnout and depression risk to early departure. However, longitudinal data tracking burnout trajectories — and the qualitative factors that explain them — are scarce. This study combines validated clinical instruments with qualitative follow-up interviews to generate both population-level and narrative data.',
      researchQuestions:
        '1. How do burnout scores (MBI) and depression risk (PHQ-9) change across three time points among doctoral students?\n2. What advisor relationship and program climate factors predict burnout trajectory?\n3. What protective factors do persisters describe that distinguish their experience from students who consider leaving?',
      methodology:
        'Sequential explanatory mixed-methods design. Phase 1: Online longitudinal survey (MBI + PHQ-9 + program climate items) at baseline, 3 months, 6 months. Phase 2: Purposive semi-structured interviews with a subset (n=20) selected to represent high/low burnout trajectories. Analysis: latent growth curve modeling for Phase 1; thematic analysis for Phase 2.',
      studySites: 'University of Bridgeport + online recruitment via national doctoral student networks',
      isMultiSite: true,
      externalIRB: false,
    },
    subjects: {
      totalParticipants: 200,
      minAge: 22,
      maxAge: 65,
      includesMinors: false,
      minorAgeRange: '',
      includesPrisoners: false,
      includesPregnantWomen: false,
      includesCognitivelyImpaired: false,
      includesUBStudents: true,
      includesUBEmployees: false,
      includesEconomicallyDisadvantaged: false,
      subjectPopulation:
        'Currently enrolled doctoral students (PhD, EdD, or equivalent) in any discipline who are post-comprehensive exam and pre-defense. Recruited nationally via graduate student associations and program listservs.',
      recruitmentMethod: ['email', 'social_media', 'snowball'],
      inclusionCriteria:
        'Currently enrolled doctoral student; post-comprehensive examination; pre-dissertation defense; age 18 or older; reads English fluently.',
      exclusionCriteria:
        'Students who have defended their dissertation; master\'s-only students; students currently receiving inpatient psychiatric treatment (due to the need for immediate referral resources that may not be accessible).',
      compensationOffered: true,
      compensationDetails:
        '$15 Amazon gift card per survey completion (up to $45 for all three), plus $30 for interview participants (up to $75 total).',
      extraCreditOffered: false,
    },
    procedures: {
      methodTypes: ['survey', 'interview'],
      surveyTopics:
        'Burnout (Maslach Burnout Inventory — Educators Survey), depression risk (PHQ-9), advisor relationship quality, program climate, academic self-efficacy, perceived organizational support, attrition intention.',
      interviewTopics:
        'Burnout experiences, advisor relationship quality, critical incidents, protective factors, coping strategies, attrition considerations.',
      observationContext: '',
      involvesDeception: false,
      deceptionDescription: '',
      deceptionDebriefing: null,
      involvesRecording: true,
      recordingTypes: ['audio'],
      involvesBloodDraw: false,
      bloodDrawAmount: '',
      bloodDrawFrequency: '',
      involvesOtherBiospecimen: false,
      biospecimenDescription: '',
      involvesPhysicalProcedure: false,
      physicalProcedureDescription: '',
      involvesRandomization: false,
      randomizationDescription: '',
      participationDuration: '45',
      participationDurationUnit: 'minutes',
      totalStudyDuration: '12 months',
      usesExistingData: false,
      existingDataDescription: '',
      existingDataIdentifiable: null,
      dataSourcePubliclyAvailable: null,
    },
    risks: {
      riskLevel: 'greater',
      physicalRisks: 'None.',
      psychologicalRisks:
        'GREATER THAN MINIMAL. Use of the PHQ-9 depression screening tool means the study may identify participants with moderate to severe depression who are not currently receiving treatment. Disclosure of symptoms may cause distress. The MBI may prompt participants to become acutely aware of their burnout, potentially worsening subjective well-being in the short term. All participants who score PHQ-9 ≥ 10 will be provided crisis resources and encouraged to seek support.',
      privacyRisks:
        'HIGH. Mental health screening data are highly sensitive. Identifiable participants are tracked across three time points. Data breach could result in stigmatization, academic consequences, or impact on disability insurance eligibility.',
      socialRisks:
        'Moderate. If participants discuss their experiences in institutional settings, there is a theoretical risk of academic consequences. Certificate of Confidentiality will be obtained to prevent compelled disclosure.',
      legalRisks:
        'Moderate. State mandatory reporting laws may require disclosure if a participant expresses imminent risk of harm to self or others. The protocol includes a mandatory reporting policy that will be disclosed to participants in the consent form.',
      economicRisks: 'None.',
      otherRisks:
        'Longitudinal attrition risk: if a participant drops out of their doctoral program between time points, the study team will not contact them to request additional data without updated consent.',
      riskMinimization:
        'Certificate of Confidentiality (NIH) protects data from compelled disclosure. Mandatory reporting policy disclosed in consent. Clinical referral protocol: all PHQ-9 ≥ 10 participants automatically receive a resource email. Suicide risk protocol: if PHQ-9 item 9 score ≥ 1, the participant receives immediate crisis resources and the PI is alerted. Data encrypted AES-256 at rest and in transit. Data stored on UB secure HIPAA-compliant research server.',
      directBenefits: false,
      directBenefitDescription: '',
      societalBenefits:
        'Findings will contribute to doctoral program design, advisor training, and graduate mental health policy. Longitudinal data on burnout trajectories are urgently needed to inform evidence-based interventions.',
      adverseEventPlan:
        'Suicide and self-harm protocol: any PHQ-9 item 9 score ≥ 1 triggers an immediate automated referral email with crisis resources (988 Suicide and Crisis Lifeline, UB Counseling Center) and PI notification within 24 hours. Adverse events will be reported to the IRB within 10 business days using the standard adverse event report form.',
      hasDataSafetyMonitoring: true,
    },
    data: {
      collectsIdentifiers: true,
      identifierTypes: ['name', 'email', 'institution'],
      dataCollectionMethod: ['online_survey', 'interview', 'recording'],
      dataStorageLocation: ['university_server', 'encrypted_drive'],
      dataEncrypted: true,
      dataAccessList:
        'PI (Dr. Ibrahim), Co-PI (Dr. Reyes), Research Coordinator (Jenna Park). No student research assistants will have access to identifiable data.',
      retentionPeriod: '7',
      retentionUnit: 'years',
      dataDestroyedAfterStudy: true,
      destructionMethod:
        'Identifiable data securely deleted 7 years post-publication. Audio recordings deleted within 30 days of transcription. De-identified analysis dataset retained indefinitely.',
      dataShared: true,
      dataSharingDetails:
        'De-identified, aggregate-level dataset deposited in ICPSR upon study completion, consistent with Spencer Foundation open data requirements.',
      hipaaApplicable: false,
      certificateOfConfidentiality: true,
      anonymousData: false,
      codedData: true,
      codingKeyDescription:
        'Participant names replaced with 8-character random codes at point of data entry. Linking file maintained in a separate encrypted partition accessible only to PI and Co-PI.',
    },
    consent: {
      consentRequired: true,
      waiverOfConsent: false,
      waiverBasis: '',
      documentedConsent: true,
      waiverOfDocumentation: false,
      waiverDocBasis: '',
      consentLanguage: 'English',
      translationNeeded: false,
      translationLanguage: '',
      assentRequired: false,
      parentPermissionRequired: false,
      onlineConsent: true,
      consentProcess:
        'Electronic informed consent via REDCap at baseline. The consent form will explicitly disclose: (1) the nature of the PHQ-9 and MBI instruments; (2) the mandatory reporting policy; (3) the limits of the Certificate of Confidentiality; (4) the automated referral protocol for high PHQ-9 scores; (5) the longitudinal nature of the study and voluntary nature of continued participation. Participants must confirm they have read and understood all sections before proceeding.',
      keyRisksForConsent:
        'Use of clinical depression screening (PHQ-9) — participants may learn they are at risk for depression. Mandatory reporting applies if participant discloses imminent risk of harm. Mental health data are sensitive and will be protected by a Certificate of Confidentiality.',
      keyBenefitsForConsent:
        'Participants who score above clinical threshold on the PHQ-9 will be immediately connected with mental health resources. Participation contributes to research that may improve doctoral program conditions for future students.',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────
export const SAMPLE_STUDIES = [
  study1_exempt_cat2,
  study2_exempt_cat4,
  study3_expedited_cat4,
  study4_expedited_cat6,
  study5_full_board_minors,
  study6_full_board_psychological,
];

export const SAMPLE_STUDIES_BY_ID = Object.fromEntries(
  SAMPLE_STUDIES.map(s => [s.id, s])
);
