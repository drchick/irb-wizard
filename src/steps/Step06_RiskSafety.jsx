import { useWizard } from '../context/WizardContext';
import { TextInput, Textarea, YesNo, ConditionalYesNo, SectionHeader, Divider } from '../components/ui/FormField';
import { InfoBox } from '../components/ui/InfoBox';
import { AIStepReviewer } from '../components/ui/AIStepReviewer';
import clsx from 'clsx';

const RISK_LEVELS = [
  {
    value: 'none',
    label: 'No Anticipated Risk',
    desc: 'Participation poses no physical, psychological, social, legal, or economic risk to subjects.',
    color: 'border-emerald-300 bg-emerald-50',
    selected: 'border-emerald-500 bg-emerald-100 ring-2 ring-emerald-300',
  },
  {
    value: 'minimal',
    label: 'Minimal Risk',
    desc: 'Probability and magnitude of harm is not greater than ordinarily encountered in daily life or during routine physical or psychological examinations.',
    color: 'border-blue-300 bg-blue-50',
    selected: 'border-blue-500 bg-blue-100 ring-2 ring-blue-300',
  },
  {
    value: 'minor',
    label: 'Minor Increase Over Minimal Risk',
    desc: 'Slightly greater than minimal risk, but still relatively low. May qualify for Expedited review for children if there is direct benefit.',
    color: 'border-amber-300 bg-amber-50',
    selected: 'border-amber-500 bg-amber-100 ring-2 ring-amber-300',
  },
  {
    value: 'greater',
    label: 'Greater Than Minimal Risk',
    desc: 'Research involves risks meaningfully beyond everyday life. Full Board review is required.',
    color: 'border-red-300 bg-red-50',
    selected: 'border-red-500 bg-red-100 ring-2 ring-red-300',
  },
];

export default function Step06_RiskSafety() {
  const { formData, updateField } = useWizard();
  const r = formData.risks;
  const f = (field, val) => updateField('risks', field, val);

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Risk & Safety Assessment"
        description="The heart of IRB review is the risk-benefit assessment. Be honest and thorough — reviewers appreciate candid identification of risks paired with thoughtful mitigation strategies."
      />

      <InfoBox variant="info" title="The Belmont Principle of Beneficence">
        The Belmont Report requires that research maximize possible benefits and minimize possible harms.
        The IRB evaluates whether risks are reasonable in relation to anticipated benefits. Identifying
        risks honestly — and describing how you will minimize them — demonstrates sound ethical practice.
      </InfoBox>

      {/* Risk level selector */}
      <div>
        <p className="field-label">Overall Risk Level <span className="text-red-500">*</span></p>
        <p className="field-hint mb-3">Select the risk level that best describes your study's anticipated risk to participants:</p>
        <div className="flex flex-col gap-2">
          {RISK_LEVELS.map(rl => (
            <button
              key={rl.value}
              type="button"
              onClick={() => f('riskLevel', rl.value)}
              className={clsx(
                'text-left rounded-lg border-2 p-4 transition',
                r.riskLevel === rl.value ? rl.selected : rl.color + ' hover:opacity-90'
              )}
            >
              <p className="text-sm font-semibold text-slate-800">{rl.label}</p>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{rl.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {r.riskLevel === 'greater' && (
        <InfoBox variant="error" title="Full Board Review Required">
          Research involving greater-than-minimal risk requires Full Board review. Your protocol must
          include a thorough risk-benefit analysis, adverse event monitoring plan, and data safety
          monitoring procedures.
        </InfoBox>
      )}

      <Divider label="Risk Categories" />

      <InfoBox variant="tip" title="Identify All Applicable Risk Types">
        Leave a field blank if that risk category does not apply to your study. For each identified risk,
        describe both the nature of the risk AND the steps you will take to minimize it.
      </InfoBox>

      <Textarea
        label="Physical Risks"
        id="physicalRisks"
        rows={2}
        value={r.physicalRisks}
        onChange={e => f('physicalRisks', e.target.value)}
        hint="e.g., bruising from blood draw, discomfort from exercise protocol, side effects from drug administration"
        placeholder="Participants may experience minor discomfort from..."
      />

      <Textarea
        label="Psychological / Emotional Risks"
        id="psychologicalRisks"
        rows={2}
        value={r.psychologicalRisks}
        onChange={e => f('psychologicalRisks', e.target.value)}
        hint="e.g., distress from recalling traumatic events, anxiety from testing, emotional discomfort from sensitive survey topics"
        placeholder="Some participants may experience emotional discomfort when answering questions about..."
      />

      <Textarea
        label="Privacy / Confidentiality Risks"
        id="privacyRisks"
        rows={2}
        value={r.privacyRisks}
        onChange={e => f('privacyRisks', e.target.value)}
        hint="e.g., risk of data breach, unintended disclosure of sensitive information, identification through unique characteristics"
        placeholder="There is minimal risk that identifiable data could be disclosed if..."
      />

      <Textarea
        label="Social / Reputational Risks"
        id="socialRisks"
        rows={2}
        value={r.socialRisks}
        onChange={e => f('socialRisks', e.target.value)}
        hint="e.g., stigma from disclosed conditions, impact on relationships, discrimination based on disclosed information"
        placeholder="Disclosure of participants' [condition/behavior] could potentially lead to..."
      />

      <Textarea
        label="Legal Risks"
        id="legalRisks"
        rows={2}
        value={r.legalRisks}
        onChange={e => f('legalRisks', e.target.value)}
        hint="e.g., disclosure of illegal activities, potential prosecution, mandatory reporting obligations"
        placeholder="Questions about [drug use / illegal activities] could expose participants to legal risk if data were disclosed. However..."
      />

      <Textarea
        label="Economic Risks"
        id="economicRisks"
        rows={2}
        value={r.economicRisks}
        onChange={e => f('economicRisks', e.target.value)}
        hint="e.g., loss of insurance coverage, employment consequences, time costs"
        placeholder="Disclosure of [health condition / financial information] could affect participants' insurance or employment..."
      />

      <Divider label="Risk Minimization" />

      <Textarea
        label="How will you minimize risks to participants?"
        id="riskMinimization"
        required
        rows={4}
        value={r.riskMinimization}
        onChange={e => f('riskMinimization', e.target.value)}
        hint="Describe concrete steps to reduce each identified risk. This is one of the most important sections reviewers evaluate."
        placeholder="To minimize psychological risk: surveys include skip options for sensitive questions, and a list of campus counseling resources will be provided. To minimize privacy risk: data will be de-identified by removing all identifiers within 24 hours of collection. Data will be stored on encrypted UB network drives accessible only to the PI and Faculty Advisor..."
      />

      <Divider label="Benefits" />

      <ConditionalYesNo
        label="Are there direct benefits to participants from this research?"
        name="directBenefits"
        value={r.directBenefits}
        onChange={v => f('directBenefits', v)}
        tooltip="Direct benefits are actual health or personal improvements from participating, not compensation. If participants receive free medical care, therapy, or gain knowledge, these are direct benefits."
      >
        <Textarea
          label="Describe Direct Benefits to Participants"
          id="directBenefitDescription"
          rows={2}
          value={r.directBenefitDescription}
          onChange={e => f('directBenefitDescription', e.target.value)}
          placeholder="Participants may benefit from... However, we cannot guarantee that all participants will experience these benefits."
        />
      </ConditionalYesNo>

      {r.directBenefits === false && (
        <InfoBox variant="info" title="No Direct Benefit — Template Language">
          For studies with no direct benefit to participants, your consent form should state:
          <em> "You may not directly benefit from participating in this study. However, your participation
          may benefit others by contributing to knowledge about [topic]."</em>
        </InfoBox>
      )}

      <Textarea
        label="Benefits to Society / Scientific Contribution"
        id="societalBenefits"
        required
        rows={3}
        value={r.societalBenefits}
        onChange={e => f('societalBenefits', e.target.value)}
        hint="Describe the broader value of the research — what will others gain from your findings?"
        placeholder="Results from this study will contribute to the scientific understanding of... Findings may inform future interventions for... This research addresses a gap in..."
      />

      <Divider label="Safety Monitoring" />

      <Textarea
        label="Adverse Event Monitoring Plan"
        id="adverseEventPlan"
        rows={3}
        value={r.adverseEventPlan}
        onChange={e => f('adverseEventPlan', e.target.value)}
        hint="Describe how you will detect, manage, and report adverse events. For minimal-risk studies, note that serious adverse events are not anticipated but would be reported to the IRB within required timeframes."
        placeholder="Participants will be monitored for adverse events throughout the study. Any unanticipated problem involving risks to participants will be reported to the IRB within [X days] of the PI becoming aware. The PI will stop the study if..."
      />

      <ConditionalYesNo
        label="Does this study have a Data Safety Monitoring Board (DSMB) or independent safety monitoring?"
        name="hasDataSafetyMonitoring"
        value={r.hasDataSafetyMonitoring}
        onChange={v => f('hasDataSafetyMonitoring', v)}
        tooltip="A DSMB is typically required for studies with greater-than-minimal risk, especially clinical trials. The DSMB periodically reviews accumulating data for safety concerns."
      >
        <InfoBox variant="info">
          Provide DSMB membership, meeting schedule, and reporting procedures in your protocol description.
          DSMB reports must be submitted to the IRB as part of annual review.
        </InfoBox>
      </ConditionalYesNo>
      <Divider label="AI Pre-Review" />
      <AIStepReviewer section="risks" />
    </div>
  );
}
