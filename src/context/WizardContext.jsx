import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { classifyReview } from '../utils/reviewClassifier';
import { checkConsistency } from '../utils/consistencyChecker';

// ─── Initial form data ───────────────────────────────────────────────────────
const initialFormData = {
  // Step 1 – Pre-Screening
  prescreening: {
    isResearch: null,
    involvesHumanSubjects: null,
    isStudentResearcher: null,
    hasFacultyAdvisor: null,
    hasCITITraining: null,
    citiCompletionDate: '',
    citiExpiryDate: '',
    citiCertFileName: '',
    isNewProtocol: true,
  },
  // Step 2 – Researcher Info
  researcher: {
    piFirstName: '',
    piLastName: '',
    piEmail: '',
    piPhone: '',
    piDepartment: '',
    piDegree: '',
    advisorFirstName: '',
    advisorLastName: '',
    advisorEmail: '',
    advisorDepartment: '',
    coInvestigators: [],
    researchAssociates: [],
  },
  // Step 3 – Study Overview
  study: {
    title: '',
    shortTitle: '',
    startDate: '',
    endDate: '',
    projectType: '',
    fundingSource: '',
    grantNumber: '',
    studyPurpose: '',
    scientificBackground: '',
    researchQuestions: '',
    methodology: '',
    studySites: '',
    isMultiSite: null,
    externalIRB: null,
  },
  // Step 4 – Research Subjects
  subjects: {
    totalParticipants: '',
    minAge: '',
    maxAge: '',
    includesMinors: null,
    minorAgeRange: '',
    includesPrisoners: null,
    includesPregnantWomen: null,
    includesCognitivelyImpaired: null,
    includesUBStudents: null,
    includesUBEmployees: null,
    includesEconomicallyDisadvantaged: null,
    subjectPopulation: '',
    recruitmentMethod: [],
    inclusionCriteria: '',
    exclusionCriteria: '',
    compensationOffered: null,
    compensationDetails: '',
    extraCreditOffered: null,
  },
  // Step 5 – Procedures
  procedures: {
    methodTypes: [],
    surveyTopics: '',
    interviewTopics: '',
    observationContext: '',
    involvesDeception: null,
    deceptionDescription: '',
    deceptionDebriefing: null,
    involvesRecording: null,
    recordingTypes: [],
    involvesBloodDraw: null,
    bloodDrawAmount: '',
    bloodDrawFrequency: '',
    involvesOtherBiospecimen: null,
    biospecimenDescription: '',
    involvesPhysicalProcedure: null,
    physicalProcedureDescription: '',
    involvesRandomization: null,
    randomizationDescription: '',
    participationDuration: '',
    participationDurationUnit: 'minutes',
    totalStudyDuration: '',
    usesExistingData: null,
    existingDataDescription: '',
    existingDataIdentifiable: null,
    dataSourcePubliclyAvailable: null,
  },
  // Step 6 – Risk & Safety
  risks: {
    riskLevel: null,
    physicalRisks: '',
    psychologicalRisks: '',
    privacyRisks: '',
    socialRisks: '',
    legalRisks: '',
    economicRisks: '',
    otherRisks: '',
    riskMinimization: '',
    directBenefits: null,
    directBenefitDescription: '',
    societalBenefits: '',
    adverseEventPlan: '',
    hasDataSafetyMonitoring: null,
  },
  // Step 7 – Data & Privacy
  data: {
    collectsIdentifiers: null,
    identifierTypes: [],
    dataCollectionMethod: [],
    dataStorageLocation: [],
    dataEncrypted: null,
    dataAccessList: '',
    retentionPeriod: '',
    retentionUnit: 'years',
    dataDestroyedAfterStudy: null,
    destructionMethod: '',
    dataShared: null,
    dataSharingDetails: '',
    hipaaApplicable: null,
    certificateOfConfidentiality: null,
    anonymousData: null,
    codedData: null,
    codingKeyDescription: '',
  },
  // Step 8 – Informed Consent
  consent: {
    consentRequired: null,
    waiverOfConsent: null,
    waiverBasis: '',
    documentedConsent: null,
    waiverOfDocumentation: null,
    waiverDocBasis: '',
    consentLanguage: '',
    translationNeeded: null,
    translationLanguage: '',
    assentRequired: null,
    parentPermissionRequired: null,
    onlineConsent: null,
    consentProcess: '',
    keyRisksForConsent: '',
    keyBenefitsForConsent: '',
  },
};

// ─── Wizard metadata ──────────────────────────────────────────────────────────
export const STEPS = [
  { id: 1, key: 'prescreening',  title: 'Pre-Screening',        short: 'Screening'   },
  { id: 2, key: 'researcher',    title: 'Researcher Info',      short: 'Researcher'  },
  { id: 3, key: 'study',         title: 'Study Overview',       short: 'Overview'    },
  { id: 4, key: 'subjects',      title: 'Research Subjects',    short: 'Subjects'    },
  { id: 5, key: 'procedures',    title: 'Procedures',           short: 'Procedures'  },
  { id: 6, key: 'risks',         title: 'Risk & Safety',        short: 'Risks'       },
  { id: 7, key: 'data',          title: 'Data & Privacy',       short: 'Data'        },
  { id: 8, key: 'consent',       title: 'Informed Consent',     short: 'Consent'     },
  { id: 9, key: 'review',        title: 'Review Determination', short: 'Review'      },
  { id: 10, key: 'documents',    title: 'Documents',            short: 'Docs'        },
];

// ─── Reducer ──────────────────────────────────────────────────────────────────
function wizardReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FIELD': {
      const { section, field, value } = action;
      return {
        ...state,
        formData: {
          ...state.formData,
          [section]: {
            ...state.formData[section],
            [field]: value,
          },
        },
      };
    }
    case 'UPDATE_SECTION': {
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.section]: {
            ...state.formData[action.section],
            ...action.data,
          },
        },
      };
    }
    case 'SET_STEP': {
      return { ...state, currentStep: action.step };
    }
    case 'NEXT_STEP': {
      const next = Math.min(state.currentStep + 1, STEPS.length);
      return { ...state, currentStep: next };
    }
    case 'PREV_STEP': {
      const prev = Math.max(state.currentStep - 1, 1);
      return { ...state, currentStep: prev };
    }
    case 'MARK_VISITED': {
      return {
        ...state,
        visitedSteps: new Set([...state.visitedSteps, action.step]),
      };
    }
    case 'LOAD_FORMDATA': {
      // Load a complete formData object (e.g. a sample study) and jump to Step 1
      return {
        ...initialState,
        formData: { ...initialFormData, ...action.formData },
        currentStep: 1,
        visitedSteps: new Set([1]),
      };
    }
    case 'RESET': {
      return initialState;
    }
    default:
      return state;
  }
}

const initialState = {
  currentStep: 1,
  visitedSteps: new Set([1]),
  formData: initialFormData,
};

// ─── Context ──────────────────────────────────────────────────────────────────
const WizardContext = createContext(null);

export function WizardProvider({ children }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  // ── Example loader: if /examples page set a pending load, apply it once ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem('irb_wizard_load_example');
      if (raw) {
        const formData = JSON.parse(raw);
        localStorage.removeItem('irb_wizard_load_example');
        dispatch({ type: 'LOAD_FORMDATA', formData });
      }
    } catch {
      // malformed JSON — ignore
    }
  }, []); // runs once on mount

  const updateField = useCallback((section, field, value) => {
    dispatch({ type: 'UPDATE_FIELD', section, field, value });
  }, []);

  const updateSection = useCallback((section, data) => {
    dispatch({ type: 'UPDATE_SECTION', section, data });
  }, []);

  const goToStep = useCallback((step) => {
    dispatch({ type: 'SET_STEP', step });
    dispatch({ type: 'MARK_VISITED', step });
  }, []);

  const nextStep = useCallback(() => {
    const next = Math.min(state.currentStep + 1, STEPS.length);
    dispatch({ type: 'NEXT_STEP' });
    dispatch({ type: 'MARK_VISITED', step: next });
  }, [state.currentStep]);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  /** Directly load a sample study formData and navigate to step 1. */
  const loadExample = useCallback((formData) => {
    dispatch({ type: 'LOAD_FORMDATA', formData });
  }, []);

  // Derived values computed on each render (lightweight)
  const reviewResult = classifyReview(state.formData);
  const consistencyIssues = checkConsistency(state.formData);

  return (
    <WizardContext.Provider
      value={{
        currentStep: state.currentStep,
        visitedSteps: state.visitedSteps,
        formData: state.formData,
        reviewResult,
        consistencyIssues,
        updateField,
        updateSection,
        goToStep,
        nextStep,
        prevStep,
        loadExample,
        dispatch,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used inside WizardProvider');
  return ctx;
}
