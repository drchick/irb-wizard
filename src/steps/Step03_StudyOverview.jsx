import { useWizard } from '../context/WizardContext';
import { TextInput, Textarea, Select, YesNo, SectionHeader, Divider } from '../components/ui/FormField';
import { InfoBox } from '../components/ui/InfoBox';
import { AIStepReviewer } from '../components/ui/AIStepReviewer';

const PROJECT_TYPES = [
  { value: 'thesis',         label: 'Thesis / Dissertation' },
  { value: 'class_project',  label: 'Class / Course Project' },
  { value: 'faculty_research', label: 'Faculty-Initiated Research' },
  { value: 'clinical_trial', label: 'Clinical Trial' },
  { value: 'survey_study',   label: 'Survey / Interview Study' },
  { value: 'observational',  label: 'Observational Study' },
  { value: 'secondary_data', label: 'Secondary Data Analysis' },
  { value: 'mixed_methods',  label: 'Mixed Methods Study' },
  { value: 'other',          label: 'Other' },
];

const FUNDING_SOURCES = [
  { value: 'none',          label: 'No External Funding (Self-funded / UB-funded)' },
  { value: 'federal',       label: 'Federal Agency (NIH, NSF, DOE, etc.)' },
  { value: 'state',         label: 'State Agency' },
  { value: 'industry',      label: 'Industry / Corporate Sponsor' },
  { value: 'foundation',    label: 'Private Foundation / Non-profit' },
  { value: 'ub_grant',      label: 'UB Internal Grant' },
  { value: 'other',         label: 'Other' },
];

export default function Step03_StudyOverview() {
  const { formData, updateField } = useWizard();
  const s = formData.study;
  const f = (field, val) => updateField('study', field, val);

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Study Overview"
        description="Provide general information about your research project. This section establishes the scope, purpose, and administrative context of your protocol."
      />

      <InfoBox variant="tip" title="Protocol Title Tips">
        Your protocol title should be descriptive enough for a reviewer to understand the study topic
        and population. Avoid jargon or acronyms without spelling them out. Example:
        <em> "Effects of Mindfulness Meditation on Exam Anxiety in Undergraduate Students"</em>
      </InfoBox>

      <TextInput
        label="Full Protocol Title"
        id="title"
        required
        value={s.title}
        onChange={e => f('title', e.target.value)}
        hint="Use the exact title you will use in all documents, consent forms, and publications"
        placeholder="e.g., A Survey of Sleep Quality and Academic Performance Among UB Graduate Students"
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Project Type"
          id="projectType"
          required
          options={PROJECT_TYPES}
          placeholder="— Select —"
          value={s.projectType}
          onChange={e => f('projectType', e.target.value)}
        />
        <Select
          label="Funding Source"
          id="fundingSource"
          required
          options={FUNDING_SOURCES}
          placeholder="— Select —"
          value={s.fundingSource}
          onChange={e => f('fundingSource', e.target.value)}
          tooltip="Federally funded research must comply with agency-specific regulations in addition to UB HRPP requirements."
        />
      </div>

      {s.fundingSource && s.fundingSource !== 'none' && (
        <TextInput
          label="Grant / Award Number (if applicable)"
          id="grantNumber"
          value={s.grantNumber}
          onChange={e => f('grantNumber', e.target.value)}
          hint="Include the full grant number exactly as it appears in your award document"
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <TextInput
          label="Proposed Start Date"
          id="startDate"
          type="date"
          required
          value={s.startDate}
          onChange={e => f('startDate', e.target.value)}
          hint="Allow at least 4–6 weeks for IRB review after submission"
        />
        <TextInput
          label="Proposed End Date"
          id="endDate"
          type="date"
          required
          value={s.endDate}
          onChange={e => f('endDate', e.target.value)}
          hint="Include time for data analysis and manuscript preparation"
        />
      </div>

      <Divider label="Scientific Description" />

      <Textarea
        label="Purpose and Objectives of the Research"
        id="studyPurpose"
        required
        rows={4}
        value={s.studyPurpose}
        onChange={e => f('studyPurpose', e.target.value)}
        hint="Describe the scientific or scholarly goals. What do you hope to learn? Why does this knowledge matter?"
        placeholder="The purpose of this study is to... The specific objectives are: (1)..."
      />

      <Textarea
        label="Scientific Background and Rationale"
        id="scientificBackground"
        required
        rows={4}
        value={s.scientificBackground}
        onChange={e => f('scientificBackground', e.target.value)}
        hint="Briefly describe the current state of knowledge. What gap does your research fill? Why are human subjects necessary?"
        placeholder="Previous research has shown... A gap exists in the literature regarding... Human subject participation is necessary because..."
      />

      <Textarea
        label="Research Questions / Hypotheses"
        id="researchQuestions"
        required
        rows={3}
        value={s.researchQuestions}
        onChange={e => f('researchQuestions', e.target.value)}
        placeholder="RQ1: ... / H1: ..."
      />

      <Textarea
        label="Research Methodology"
        id="methodology"
        required
        rows={4}
        value={s.methodology}
        onChange={e => f('methodology', e.target.value)}
        hint="Describe your overall research design (quantitative, qualitative, mixed methods), data collection approach, and analysis plan."
        placeholder="This study uses a [cross-sectional survey / quasi-experimental / qualitative interview] design..."
      />

      <Divider label="Study Site" />

      <Textarea
        label="Where will research take place? (Study Sites)"
        id="studySites"
        required
        rows={2}
        value={s.studySites}
        onChange={e => f('studySites', e.target.value)}
        hint="List all locations where data will be collected (e.g., online via Qualtrics, UB campus, local schools, hospitals)"
        placeholder="Data will be collected online via Qualtrics survey platform and in-person at UB's Wahlstrom Library..."
      />

      <YesNo
        label="Is this a multi-site study (research conducted at more than one institution)?"
        name="isMultiSite"
        value={s.isMultiSite}
        onChange={v => f('isMultiSite', v)}
        tooltip="Multi-site studies may require IRB review at each institution, or a reliance agreement where one IRB serves as the reviewing IRB for all sites."
      />

      {s.isMultiSite === true && (
        <InfoBox variant="info" title="Multi-Site Research">
          For multi-site research, UB may rely on an external IRB or serve as the reviewing IRB for
          other sites. Contact the IRB administrator (irb@bridgeport.edu) early to discuss the appropriate
          arrangement. Each site may need to sign a reliance agreement or Site Authorization.
        </InfoBox>
      )}
      <Divider label="AI Pre-Review" />
      <AIStepReviewer section="study" />
    </div>
  );
}
