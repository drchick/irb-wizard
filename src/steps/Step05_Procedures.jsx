import { useWizard } from '../context/WizardContext';
import { TextInput, Textarea, Select, YesNo, ConditionalYesNo, CheckboxGroup, SectionHeader, Divider } from '../components/ui/FormField';
import { InfoBox } from '../components/ui/InfoBox';
import { AIStepReviewer } from '../components/ui/AIStepReviewer';

const METHOD_OPTIONS = [
  { value: 'survey',             label: 'Survey / Questionnaire', hint: 'Online or paper-based questionnaire' },
  { value: 'interview',          label: 'Interview', hint: 'Structured, semi-structured, or unstructured' },
  { value: 'focus_group',        label: 'Focus Group', hint: 'Group discussion with multiple participants' },
  { value: 'observation_public', label: 'Observation (Public Behavior)', hint: 'Watching subjects in public settings without interaction' },
  { value: 'observation_lab',    label: 'Observation (Lab/Controlled)', hint: 'Watching subjects in a controlled or private setting' },
  { value: 'educational_assessment', label: 'Educational Assessment', hint: 'Testing or evaluating instructional methods' },
  { value: 'behavioral_intervention', label: 'Behavioral Intervention', hint: 'Engaging subjects in a specific activity to observe effects' },
  { value: 'cognitive_test',     label: 'Cognitive / Psychological Test', hint: 'Standardized assessments (IQ, memory, anxiety scales, etc.)' },
  { value: 'physiological',      label: 'Physiological Measurement', hint: 'Blood pressure, heart rate, EEG, skin conductance, etc.' },
  { value: 'clinical_procedure', label: 'Clinical Procedure', hint: 'Medical examination, biopsy, imaging, drug administration' },
  { value: 'taste_food',         label: 'Taste / Food Evaluation', hint: 'Evaluating food items for quality or preference' },
  { value: 'secondary_data',     label: 'Secondary Data Analysis', hint: 'Analysis of existing datasets, records, or biospecimens' },
  { value: 'other',              label: 'Other', hint: 'Describe in the text fields below' },
];

const RECORDING_TYPES = [
  { value: 'audio',   label: 'Audio Recording' },
  { value: 'video',   label: 'Video Recording' },
  { value: 'photo',   label: 'Photography' },
  { value: 'screen',  label: 'Screen Recording' },
];

const DURATION_UNITS = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours',   label: 'Hours' },
  { value: 'days',    label: 'Days' },
  { value: 'sessions',label: 'Sessions' },
];

export default function Step05_Procedures() {
  const { formData, updateField } = useWizard();
  const p = formData.procedures;
  const f = (field, val) => updateField('procedures', field, val);

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Research Procedures"
        description="Describe exactly what participants will be asked to do, how long it will take, and any special procedures involved. Be specific — reviewers need enough detail to assess risks."
      />

      <CheckboxGroup
        label="Research Methods (select all that apply)"
        options={METHOD_OPTIONS}
        value={p.methodTypes}
        onChange={v => f('methodTypes', v)}
        required
        tooltip="Select every method you will use. This drives the review type determination and the list of required attachments."
      />

      {/* Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex gap-2">
          <TextInput
            label="Participation Duration (per subject)"
            id="participationDuration"
            type="number"
            min="1"
            className="flex-1"
            value={p.participationDuration}
            onChange={e => f('participationDuration', e.target.value)}
            hint="Expected time each participant will spend"
          />
          <div className="w-32 mt-6">
            <Select
              options={DURATION_UNITS}
              value={p.participationDurationUnit}
              onChange={e => f('participationDurationUnit', e.target.value)}
            />
          </div>
        </div>
        <TextInput
          label="Total Study Duration"
          id="totalStudyDuration"
          value={p.totalStudyDuration}
          onChange={e => f('totalStudyDuration', e.target.value)}
          hint="e.g., 6 months, 1 year, one semester"
          placeholder="e.g., 6 months"
        />
      </div>

      {/* Survey content */}
      {(p.methodTypes || []).includes('survey') && (
        <Textarea
          label="Survey Topics and Content Areas"
          id="surveyTopics"
          rows={3}
          value={p.surveyTopics}
          onChange={e => f('surveyTopics', e.target.value)}
          required
          hint="Describe the general topics covered. Include any potentially sensitive topics (mental health, sexual behavior, substance use, illegal activities, etc.)."
          placeholder="The survey will cover: (1) sleep habits and quality, (2) academic performance self-assessment, (3) stress levels..."
        />
      )}

      {/* Interview content */}
      {(p.methodTypes || []).includes('interview') && (
        <Textarea
          label="Interview Topics and Protocol Description"
          id="interviewTopics"
          rows={3}
          value={p.interviewTopics}
          onChange={e => f('interviewTopics', e.target.value)}
          required
          hint="Describe what will be discussed. Attach your interview guide or question list."
          placeholder="Semi-structured interviews will explore participants' experiences with... Questions will focus on..."
        />
      )}

      {/* Observation context */}
      {((p.methodTypes || []).includes('observation_public') || (p.methodTypes || []).includes('observation_lab')) && (
        <Textarea
          label="Observation Setting and Context"
          id="observationContext"
          rows={3}
          value={p.observationContext}
          onChange={e => f('observationContext', e.target.value)}
          required
          hint="Describe where and how you will observe participants. For public observation, explain why there is no reasonable expectation of privacy."
          placeholder="Participants will be observed in... The observer will..."
        />
      )}

      <Divider label="Secondary / Existing Data" />

      <ConditionalYesNo
        label="Does this study use existing data, records, documents, or specimens collected for another purpose?"
        name="usesExistingData"
        value={p.usesExistingData}
        onChange={v => f('usesExistingData', v)}
        tooltip="Secondary data use (existing records, datasets, biological specimens) may qualify for Exempt or Expedited review depending on identifiability."
      >
        <Textarea
          label="Describe the Existing Data Source"
          id="existingDataDescription"
          rows={3}
          value={p.existingDataDescription}
          onChange={e => f('existingDataDescription', e.target.value)}
          required
          placeholder="e.g., De-identified electronic health records from XYZ hospital collected between 2018–2022..."
        />
        <YesNo
          label="Is the existing data identifiable (can be linked to specific individuals)?"
          name="existingDataIdentifiable"
          value={p.existingDataIdentifiable}
          onChange={v => f('existingDataIdentifiable', v)}
          tooltip="Data is identifiable if it contains names, SSNs, medical record numbers, or any information that could reasonably be used to identify individuals."
        />
        <YesNo
          label="Is the data source publicly available?"
          name="dataSourcePubliclyAvailable"
          value={p.dataSourcePubliclyAvailable}
          onChange={v => f('dataSourcePubliclyAvailable', v)}
          tooltip="Publicly available datasets (CDC NHANES, Census data, open access repositories) may qualify for Exempt Category 4."
        />
      </ConditionalYesNo>

      <Divider label="Special Procedures" />

      {/* Recording */}
      <ConditionalYesNo
        label="Will participants be recorded (audio, video, photography, or screen recording)?"
        name="involvesRecording"
        value={p.involvesRecording}
        onChange={v => f('involvesRecording', v)}
        tooltip="Recording requires explicit disclosure in the consent form and a separate recording consent section with opt-in/opt-out checkboxes."
      >
        <CheckboxGroup
          label="Type of Recording"
          options={RECORDING_TYPES}
          value={p.recordingTypes}
          onChange={v => f('recordingTypes', v)}
        />
        <InfoBox variant="tip" title="Recording Consent Requirement">
          Your consent form must include a separate section where participants explicitly agree or decline
          to be recorded. If participants can still participate without being recorded, clearly state this.
        </InfoBox>
      </ConditionalYesNo>

      {/* Blood draw */}
      <ConditionalYesNo
        label="Will blood samples be collected (venipuncture, finger stick, heel stick, or ear stick)?"
        name="involvesBloodDraw"
        value={p.involvesBloodDraw}
        onChange={v => f('involvesBloodDraw', v)}
        tooltip="Minor blood collection from healthy adults for research purposes may qualify for Expedited Category 2 review."
      >
        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="Amount per collection (mL)"
            id="bloodDrawAmount"
            type="number"
            value={p.bloodDrawAmount}
            onChange={e => f('bloodDrawAmount', e.target.value)}
            hint="Federal limit: ≤550 mL per 8-week period"
          />
          <TextInput
            label="Collection Frequency"
            id="bloodDrawFrequency"
            value={p.bloodDrawFrequency}
            onChange={e => f('bloodDrawFrequency', e.target.value)}
            hint="e.g., once, twice per week, weekly for 4 weeks"
            placeholder="e.g., one time only"
          />
        </div>
      </ConditionalYesNo>

      {/* Other biospecimens */}
      <ConditionalYesNo
        label="Will other biological specimens be collected (saliva, urine, tissue, etc.)?"
        name="involvesOtherBiospecimen"
        value={p.involvesOtherBiospecimen}
        onChange={v => f('involvesOtherBiospecimen', v)}
      >
        <Textarea
          label="Describe Biological Specimen Collection"
          id="biospecimenDescription"
          rows={2}
          value={p.biospecimenDescription}
          onChange={e => f('biospecimenDescription', e.target.value)}
          placeholder="e.g., A 2 mL saliva sample will be collected using a Salivette tube..."
        />
      </ConditionalYesNo>

      {/* Physical procedures */}
      <ConditionalYesNo
        label="Will any physical procedures be performed on participants (beyond blood draws listed above)?"
        name="involvesPhysicalProcedure"
        value={p.involvesPhysicalProcedure}
        onChange={v => f('involvesPhysicalProcedure', v)}
        tooltip="Physical procedures include: medical examinations, application of devices to the body, exercise protocols, administration of drugs or placebo, etc."
      >
        <Textarea
          label="Describe Physical Procedures"
          id="physicalProcedureDescription"
          rows={3}
          value={p.physicalProcedureDescription}
          onChange={e => f('physicalProcedureDescription', e.target.value)}
          placeholder="Describe each procedure, who performs it, and the setting in which it occurs..."
        />
      </ConditionalYesNo>

      {/* Randomization */}
      <ConditionalYesNo
        label="Will participants be randomly assigned to groups or conditions?"
        name="involvesRandomization"
        value={p.involvesRandomization}
        onChange={v => f('involvesRandomization', v)}
        tooltip="Randomization (random assignment) must be explained in the consent form using plain-language OHRP-approved language (e.g., 'like flipping a coin')."
      >
        <Textarea
          label="Describe Randomization and Groups"
          id="randomizationDescription"
          rows={3}
          value={p.randomizationDescription}
          onChange={e => f('randomizationDescription', e.target.value)}
          placeholder="Participants will be randomly assigned to one of two groups: (1) treatment group receiving... or (2) control group receiving..."
        />
        <InfoBox variant="tip" title="OHRP Randomization Language">
          Your consent form must explain randomization in plain language. Use the approved OHRP wording:
          <em> "We will assign you to 1 of [X] study groups by chance, like flipping a coin."</em>
          If the study is blinded, state that neither you nor the participant will know the group assignment.
        </InfoBox>
      </ConditionalYesNo>

      {/* Deception */}
      <ConditionalYesNo
        label="Will participants be deceived about the nature or purpose of the research?"
        name="involvesDeception"
        value={p.involvesDeception}
        onChange={v => f('involvesDeception', v)}
        tooltip="Deception includes: withholding the true purpose of the study, providing a cover story, using confederates, or using misleading stimuli. Deception requires IRB justification and a debriefing plan."
      >
        <Textarea
          label="Describe the Deception"
          id="deceptionDescription"
          rows={3}
          value={p.deceptionDescription}
          onChange={e => f('deceptionDescription', e.target.value)}
          required
          placeholder="Participants will be told the study is about [cover story]. The actual purpose is [true purpose]. The deception is necessary because..."
        />
        <YesNo
          label="Will participants be debriefed after the study (told the true purpose and given the opportunity to withdraw data)?"
          name="deceptionDebriefing"
          value={p.deceptionDebriefing}
          onChange={v => f('deceptionDebriefing', v)}
          required
        />
        {p.deceptionDebriefing === true && (
          <InfoBox variant="tip" title="Debriefing Requirements">
            Your protocol must include a debriefing script. The debriefing should: (1) explain the true
            purpose of the study, (2) explain why deception was necessary, (3) give participants the
            opportunity to withdraw their data after learning the true purpose, and (4) answer questions.
            Submit your debriefing script with the IRB application.
          </InfoBox>
        )}
        {p.deceptionDebriefing === false && (
          <InfoBox variant="error" title="Debriefing Required">
            Research involving deception generally requires debriefing. Failure to debrief participants
            requires specific IRB justification and typically results in Full Board review. Describe your
            justification for omitting debriefing.
          </InfoBox>
        )}
      </ConditionalYesNo>
      <Divider label="AI Pre-Review" />
      <AIStepReviewer section="procedures" />
    </div>
  );
}
