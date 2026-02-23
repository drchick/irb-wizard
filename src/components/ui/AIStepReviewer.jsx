import { Sparkles } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';
import { useAIReview } from '../../hooks/useAIReview';
import { AIReviewPanel } from './AIReviewPanel';

// ── Section field extractors ──────────────────────────────────────────────────
const SECTION_CONFIG = {
  study: {
    label: 'Study Overview',
    extract: (formData) => ({
      projectType:           formData.study.projectType,
      fundingSource:         formData.study.fundingSource,
      isMultiSite:           formData.study.isMultiSite,
      studyPurpose:          formData.study.studyPurpose,
      scientificBackground:  formData.study.scientificBackground,
      researchQuestions:     formData.study.researchQuestions,
      methodology:           formData.study.methodology,
      studySites:            formData.study.studySites,
    }),
  },
  subjects: {
    label: 'Research Subjects',
    extract: (formData) => ({
      totalParticipants:             formData.subjects.totalParticipants,
      minAge:                        formData.subjects.minAge,
      maxAge:                        formData.subjects.maxAge,
      includesMinors:                formData.subjects.includesMinors,
      includesPrisoners:             formData.subjects.includesPrisoners,
      includesPregnantWomen:         formData.subjects.includesPregnantWomen,
      includesCognitivelyImpaired:   formData.subjects.includesCognitivelyImpaired,
      includesUBStudents:            formData.subjects.includesUBStudents,
      includesEconomicallyDisadvantaged: formData.subjects.includesEconomicallyDisadvantaged,
      subjectPopulation:             formData.subjects.subjectPopulation,
      recruitmentMethod:             formData.subjects.recruitmentMethod,
      inclusionCriteria:             formData.subjects.inclusionCriteria,
      exclusionCriteria:             formData.subjects.exclusionCriteria,
      compensationOffered:           formData.subjects.compensationOffered,
      compensationDetails:           formData.subjects.compensationDetails,
    }),
  },
  procedures: {
    label: 'Procedures',
    extract: (formData) => ({
      methodTypes:                  formData.procedures.methodTypes,
      surveyTopics:                 formData.procedures.surveyTopics,
      interviewTopics:              formData.procedures.interviewTopics,
      involvesDeception:            formData.procedures.involvesDeception,
      deceptionDescription:         formData.procedures.deceptionDescription,
      deceptionDebriefing:          formData.procedures.deceptionDebriefing,
      involvesRecording:            formData.procedures.involvesRecording,
      recordingTypes:               formData.procedures.recordingTypes,
      involvesBloodDraw:            formData.procedures.involvesBloodDraw,
      involvesOtherBiospecimen:     formData.procedures.involvesOtherBiospecimen,
      biospecimenDescription:       formData.procedures.biospecimenDescription,
      involvesPhysicalProcedure:    formData.procedures.involvesPhysicalProcedure,
      physicalProcedureDescription: formData.procedures.physicalProcedureDescription,
      involvesRandomization:        formData.procedures.involvesRandomization,
      randomizationDescription:     formData.procedures.randomizationDescription,
      usesExistingData:             formData.procedures.usesExistingData,
      existingDataIdentifiable:     formData.procedures.existingDataIdentifiable,
    }),
  },
  risks: {
    label: 'Risk & Safety',
    extract: (formData) => ({
      riskLevel:               formData.risks.riskLevel,
      physicalRisks:           formData.risks.physicalRisks,
      psychologicalRisks:      formData.risks.psychologicalRisks,
      privacyRisks:            formData.risks.privacyRisks,
      socialRisks:             formData.risks.socialRisks,
      legalRisks:              formData.risks.legalRisks,
      economicRisks:           formData.risks.economicRisks,
      riskMinimization:        formData.risks.riskMinimization,
      directBenefits:          formData.risks.directBenefits,
      directBenefitDescription: formData.risks.directBenefitDescription,
      societalBenefits:        formData.risks.societalBenefits,
      adverseEventPlan:        formData.risks.adverseEventPlan,
      hasDataSafetyMonitoring: formData.risks.hasDataSafetyMonitoring,
    }),
  },
  data: {
    label: 'Data & Privacy',
    extract: (formData) => ({
      anonymousData:         formData.data.anonymousData,
      codedData:             formData.data.codedData,
      collectsIdentifiers:   formData.data.collectsIdentifiers,
      identifierTypes:       formData.data.identifierTypes,
      dataEncrypted:         formData.data.dataEncrypted,
      dataStorageLocation:   formData.data.dataStorageLocation,
      dataAccessList:        formData.data.dataAccessList,
      retentionPeriod:       formData.data.retentionPeriod,
      retentionUnit:         formData.data.retentionUnit,
      dataDestroyedAfterStudy: formData.data.dataDestroyedAfterStudy,
      destructionMethod:     formData.data.destructionMethod,
      dataShared:            formData.data.dataShared,
      dataSharingDetails:    formData.data.dataSharingDetails,
      hipaaApplicable:       formData.data.hipaaApplicable,
      codingKeyDescription:  formData.data.codingKeyDescription,
    }),
  },
  consent: {
    label: 'Informed Consent',
    extract: (formData) => ({
      consentRequired:          formData.consent.consentRequired,
      waiverOfConsent:          formData.consent.waiverOfConsent,
      waiverBasis:              formData.consent.waiverBasis,
      documentedConsent:        formData.consent.documentedConsent,
      waiverOfDocumentation:    formData.consent.waiverOfDocumentation,
      consentProcess:           formData.consent.consentProcess,
      keyRisksForConsent:       formData.consent.keyRisksForConsent,
      keyBenefitsForConsent:    formData.consent.keyBenefitsForConsent,
      onlineConsent:            formData.consent.onlineConsent,
      assentRequired:           formData.consent.assentRequired,
      parentPermissionRequired: formData.consent.parentPermissionRequired,
      translationNeeded:        formData.consent.translationNeeded,
      // Include minors flag from subjects for context
      includesMinors:           formData.subjects.includesMinors,
    }),
  },
};

// ── AIStepReviewer component ──────────────────────────────────────────────────
export function AIStepReviewer({ section }) {
  const { formData, reviewResult } = useWizard();
  const { analyze, loading, result, error, clear } = useAIReview();

  const cfg = SECTION_CONFIG[section];
  if (!cfg) return null;

  const formDataSummary = {
    studyTitle:         formData.study.title,
    projectType:        formData.study.projectType,
    subjectsCount:      formData.subjects.totalParticipants,
    includesVulnerable: !!(
      formData.subjects.includesMinors ||
      formData.subjects.includesPrisoners ||
      formData.subjects.includesPregnantWomen ||
      formData.subjects.includesCognitivelyImpaired
    ),
    riskLevel:          formData.risks.riskLevel,
    currentReviewType:  reviewResult?.type || 'INSUFFICIENT_INFO',
  };

  const handleAnalyze = () => {
    const sectionData = cfg.extract(formData);
    analyze(section, sectionData, formDataSummary);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Trigger button — only shown when idle */}
      {!loading && !result && !error && (
        <div className="flex items-center justify-between rounded-xl border border-dashed border-navy-200 bg-navy-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-navy-800">AI Pre-Review</p>
            <p className="text-xs text-navy-600 mt-0.5">
              Get clarifying questions and a reviewer perspective on this section.
            </p>
          </div>
          <button
            onClick={handleAnalyze}
            className="btn-primary shrink-0"
          >
            <Sparkles size={14} />
            Analyze Section
          </button>
        </div>
      )}

      {/* Re-run button when results are shown */}
      {(result || error) && !loading && (
        <div className="flex items-center gap-2 justify-end">
          <button onClick={clear} className="btn-secondary text-xs px-3 py-1.5">
            Clear
          </button>
          <button onClick={handleAnalyze} className="btn-primary text-xs px-3 py-1.5">
            <Sparkles size={12} />
            Re-analyze
          </button>
        </div>
      )}

      <AIReviewPanel result={result} loading={loading} error={error} onClear={clear} />
    </div>
  );
}
