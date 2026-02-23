import { useWizard } from '../context/WizardContext';
import { TextInput, Textarea, Select, YesNo, ConditionalYesNo, CheckboxGroup, SectionHeader, Divider } from '../components/ui/FormField';
import { InfoBox } from '../components/ui/InfoBox';
import { AIStepReviewer } from '../components/ui/AIStepReviewer';

const RECRUITMENT_METHODS = [
  { value: 'flyer',         label: 'Flyers / Posters', hint: 'Physical or digital posted announcements' },
  { value: 'email',         label: 'Email Recruitment', hint: 'Recruitment emails to eligible individuals' },
  { value: 'social_media',  label: 'Social Media', hint: 'Facebook, Instagram, LinkedIn, etc.' },
  { value: 'class_announce',label: 'Class Announcement', hint: 'Recruiting students from a class you teach or attend' },
  { value: 'online_panel',  label: 'Online Panel / Mechanical Turk', hint: 'Prolific, MTurk, Qualtrics panel, etc.' },
  { value: 'snowball',      label: 'Snowball / Word of Mouth', hint: 'Participants refer others' },
  { value: 'clinical',      label: 'Clinical / Medical Setting', hint: 'Recruiting through hospital, clinic, or patient records' },
  { value: 'registry',      label: 'Patient / Community Registry', hint: 'Established registry of eligible individuals' },
  { value: 'purposive',     label: 'Purposive / Expert Sampling', hint: 'Selecting specific individuals with relevant expertise' },
  { value: 'other',         label: 'Other', hint: 'Describe in inclusion criteria field below' },
];

export default function Step04_Subjects() {
  const { formData, updateField } = useWizard();
  const s = formData.subjects;
  const f = (field, val) => updateField('subjects', field, val);

  const hasVulnerable = s.includesMinors || s.includesPrisoners || s.includesPregnantWomen || s.includesCognitivelyImpaired;

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Research Subjects"
        description="Describe who will participate in your research, how many, how they will be recruited, and whether any vulnerable populations are involved. Consistency in participant numbers across all documents is essential."
      />

      {/* Participant numbers */}
      <div className="grid grid-cols-3 gap-4">
        <TextInput
          label="Total Number of Participants"
          id="totalParticipants"
          type="number"
          min="1"
          required
          value={s.totalParticipants}
          onChange={e => f('totalParticipants', e.target.value)}
          hint="This number MUST match your consent form, protocol description, and any grant applications"
          tooltip="Use the anticipated maximum enrollment, not a minimum. This number will be cross-checked throughout the wizard."
        />
        <TextInput
          label="Minimum Age"
          id="minAge"
          type="number"
          min="0"
          max="120"
          required
          value={s.minAge}
          onChange={e => f('minAge', e.target.value)}
          hint="Age in years"
        />
        <TextInput
          label="Maximum Age"
          id="maxAge"
          type="number"
          min="0"
          max="120"
          required
          value={s.maxAge}
          onChange={e => f('maxAge', e.target.value)}
          hint="Use 99+ for no upper limit"
        />
      </div>

      <InfoBox variant="warning" title="Participant Count — Critical Consistency Check">
        The total participant count you enter here will be compared against numbers mentioned in your
        protocol description, consent forms, and recruitment materials. Mismatches are one of the most
        common causes of IRB revision requests.
      </InfoBox>

      <Textarea
        label="Description of Subject Population"
        id="subjectPopulation"
        required
        rows={3}
        value={s.subjectPopulation}
        onChange={e => f('subjectPopulation', e.target.value)}
        hint="Who are your subjects? (e.g., adults 18+ enrolled in graduate programs at UB, registered nurses at Connecticut hospitals, children aged 8–12 diagnosed with ADHD)"
        placeholder="Participants will be adult undergraduate students (18+) enrolled in..."
      />

      <CheckboxGroup
        label="Recruitment Methods (select all that apply)"
        options={RECRUITMENT_METHODS}
        value={s.recruitmentMethod}
        onChange={v => f('recruitmentMethod', v)}
        required
        tooltip="You must upload copies of all recruitment materials (flyers, scripts, emails) with your IRB application."
      />

      {(s.recruitmentMethod || []).includes('class_announce') && (
        <InfoBox variant="warning" title="Recruiting From Your Own Class">
          Recruiting students from a class you teach creates a power dynamic that may compromise voluntary
          participation. Describe safeguards (e.g., recruitment after grades are submitted, having a
          neutral third party distribute materials, ensuring students know non-participation is truly optional).
        </InfoBox>
      )}

      <Divider label="Inclusion &amp; Exclusion Criteria" />

      <Textarea
        label="Inclusion Criteria"
        id="inclusionCriteria"
        required
        rows={3}
        value={s.inclusionCriteria}
        onChange={e => f('inclusionCriteria', e.target.value)}
        hint="List the specific criteria that must be met to participate (age, status, characteristics, language, etc.)"
        placeholder="1. Adults 18 years of age or older&#10;2. Currently enrolled at the University of Bridgeport&#10;3. Able to read and understand English"
      />

      <Textarea
        label="Exclusion Criteria"
        id="exclusionCriteria"
        required
        rows={3}
        value={s.exclusionCriteria}
        onChange={e => f('exclusionCriteria', e.target.value)}
        hint="List who will be excluded and why. If excluding potentially vulnerable groups, explain the scientific justification."
        placeholder="1. Individuals under 18 years of age&#10;2. Non-English speakers (survey not available in other languages)&#10;3. Individuals not currently enrolled at UB"
      />

      <Divider label="Compensation" />

      <ConditionalYesNo
        label="Will participants receive compensation, payment, or extra credit?"
        name="compensationOffered"
        value={s.compensationOffered}
        onChange={v => f('compensationOffered', v)}
        tooltip="Compensation includes cash, gift cards, raffle entries, course extra credit, or other incentives. By law, payments to subjects are considered taxable income."
      >
        <Textarea
          label="Compensation Details"
          id="compensationDetails"
          rows={3}
          value={s.compensationDetails}
          onChange={e => f('compensationDetails', e.target.value)}
          required
          hint="Describe: amount, type, payment schedule, and what happens if participant withdraws early. Compensation must be prorated — not contingent on study completion."
          placeholder="Participants will receive a $10 Amazon gift card for completing the survey. If a participant withdraws early, they will receive $5 for partial completion."
        />

        <ConditionalYesNo
          label="Is extra credit being offered to UB students?"
          name="extraCreditOffered"
          value={s.extraCreditOffered}
          onChange={v => f('extraCreditOffered', v)}
        >
          <InfoBox variant="warning" title="Extra Credit Requirements">
            When offering extra credit, you MUST:
            <ul className="mt-1 list-disc list-inside text-xs">
              <li>State the specific extra credit amount in the consent form</li>
              <li>Provide an equivalent alternative activity for students who choose not to participate</li>
              <li>Ensure the activity is not the only way to earn extra credit</li>
            </ul>
          </InfoBox>
        </ConditionalYesNo>
      </ConditionalYesNo>

      <Divider label="Vulnerable Populations" />

      <InfoBox variant="info" title="Why Vulnerable Populations Matter">
        Federal regulations provide additional protections for populations who may be more susceptible to
        coercion, undue influence, or who have diminished capacity to consent. Including vulnerable
        populations typically requires additional justification and safeguards.
      </InfoBox>

      <div className="grid grid-cols-1 gap-4">
        <ConditionalYesNo
          label="Will any participants be minors (under 18 years of age)?"
          name="includesMinors"
          value={s.includesMinors}
          onChange={v => f('includesMinors', v)}
          tooltip="Research involving children requires parental/guardian permission AND age-appropriate assent from the child. Stricter IRB scrutiny applies."
        >
          <TextInput
            label="Age range of minor participants"
            id="minorAgeRange"
            value={s.minorAgeRange}
            onChange={e => f('minorAgeRange', e.target.value)}
            hint="e.g., 8–17 years"
            placeholder="e.g., 12–17"
          />
          <InfoBox variant="warning">
            Research involving minors requires: (1) parental or guardian written permission, (2) child assent
            (if age 7 or older and capable), and (3) IRB verification that minors are necessary and risks
            are justified. Full Board review is likely required for greater-than-minimal-risk research with children.
          </InfoBox>
        </ConditionalYesNo>

        <YesNo
          label="Will any participants be prisoners or incarcerated individuals?"
          name="includesPrisoners"
          value={s.includesPrisoners}
          onChange={v => f('includesPrisoners', v)}
          tooltip="45 CFR 46 Subpart C provides special protections for prisoner research. Prisoner research requires Full Board review and IRB membership that includes a prisoner representative."
        />

        {s.includesPrisoners === true && (
          <InfoBox variant="error" title="Prisoner Research — Full Board Required">
            Research with prisoners as subjects requires Full Board review. The IRB must include
            a prisoner or prisoner representative as a member when reviewing. Your protocol must
            demonstrate: (1) no coercion, (2) risks are minimal or there is direct benefit,
            (3) selection is equitable, and (4) parole/housing will not be affected by participation.
          </InfoBox>
        )}

        <YesNo
          label="Will any participants be pregnant women or fetuses?"
          name="includesPregnantWomen"
          value={s.includesPregnantWomen}
          onChange={v => f('includesPregnantWomen', v)}
          tooltip="45 CFR 46 Subpart B provides protections for pregnant women and fetuses. Additional consent disclosures about fetal risks are required."
        />

        <YesNo
          label="Will any participants have cognitive impairments or diminished decision-making capacity?"
          name="includesCognitivelyImpaired"
          value={s.includesCognitivelyImpaired}
          onChange={v => f('includesCognitivelyImpaired', v)}
          tooltip="Individuals who cannot give legally valid informed consent require a Legally Authorized Representative (LAR) to consent on their behalf. Describe your capacity assessment process."
        />

        <YesNo
          label="Will any participants be UB students or employees of the researchers?"
          name="includesUBStudents"
          value={s.includesUBStudents}
          onChange={v => f('includesUBStudents', v)}
          tooltip="Students in researchers' classes and employees supervised by the PI may feel implicit pressure to participate. Describe safeguards to ensure genuinely voluntary participation."
        />

        <YesNo
          label="Will any participants be economically or educationally disadvantaged, or otherwise susceptible to undue influence?"
          name="includesEconomicallyDisadvantaged"
          value={s.includesEconomicallyDisadvantaged}
          onChange={v => f('includesEconomicallyDisadvantaged', v)}
          tooltip="Individuals who may be overly influenced by compensation (e.g., due to financial need) require additional protections and justification that compensation is not coercive."
        />
      </div>

      {hasVulnerable && (
        <InfoBox variant="warning" title="Vulnerable Population Justification Required">
          Since your study includes vulnerable populations, your protocol must justify why these individuals
          need to be included (scientific necessity) and describe the additional protections you will provide.
          Include this justification in the Risk &amp; Safety section.
        </InfoBox>
      )}
      <Divider label="AI Pre-Review" />
      <AIStepReviewer section="subjects" />
    </div>
  );
}
