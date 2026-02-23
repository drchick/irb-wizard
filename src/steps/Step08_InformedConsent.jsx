import { useWizard } from '../context/WizardContext';
import { Textarea, Select, YesNo, ConditionalYesNo, SectionHeader, Divider } from '../components/ui/FormField';
import { InfoBox } from '../components/ui/InfoBox';
import { AIStepReviewer } from '../components/ui/AIStepReviewer';

const CONSENT_LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'mandarin', label: 'Mandarin Chinese' },
  { value: 'other', label: 'Other' },
];

const WAIVER_BASES = [
  { value: 'min_risk_no_link', label: 'Only link between subject and research is consent form (minimal risk of breach)' },
  { value: 'min_risk_no_req',  label: 'Minimal risk + no procedures requiring written consent outside research context' },
  { value: 'cultural_norm',   label: 'Cultural group where signing is not the norm (with alternative documentation)' },
];

const WAIVER_DOC_BASES = [
  { value: 'min_risk_no_link', label: 'Consent form is the only record linking subject to research (principal risk = breach of confidentiality)' },
  { value: 'min_risk_no_req',  label: 'Minimal risk and does not involve procedures requiring written consent outside research context' },
];

export default function Step08_InformedConsent() {
  const { formData, updateField } = useWizard();
  const c = formData.consent;
  const subjects = formData.subjects;
  const f = (field, val) => updateField('consent', field, val);

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Informed Consent"
        description="Informed consent is the cornerstone of ethical research. Participants must understand what they are agreeing to, including risks, benefits, and their right to withdraw without penalty."
      />

      <InfoBox variant="info" title="The Belmont Principle of Respect for Persons">
        Respect for persons requires that individuals be treated as autonomous agents and that those with
        diminished autonomy receive additional protections. Informed consent is the primary mechanism for
        respecting autonomy in research.
      </InfoBox>

      {/* Standard consent required? */}
      <YesNo
        label="Will informed consent be obtained from participants (or their representatives)?"
        name="consentRequired"
        value={c.consentRequired}
        onChange={v => f('consentRequired', v)}
        required
        tooltip="Informed consent is required for virtually all human subjects research. A waiver may be granted by the IRB in specific, limited circumstances."
      />

      {c.consentRequired === false && (
        <>
          <InfoBox variant="warning" title="Waiver of Informed Consent — Strict Criteria Apply">
            The IRB may waive consent requirements only when ALL of the following are true:
            <ul className="mt-1 list-disc list-inside text-xs">
              <li>Research involves no more than minimal risk</li>
              <li>Waiver will not adversely affect subjects' rights or welfare</li>
              <li>Research could not practicably be carried out without the waiver</li>
              <li>Subjects will be provided with pertinent information after participation (when appropriate)</li>
            </ul>
          </InfoBox>
          <div>
            <p className="field-label">Basis for Waiver of Consent Request</p>
            <Select
              options={WAIVER_BASES}
              placeholder="— Select basis —"
              value={c.waiverBasis}
              onChange={e => f('waiverBasis', e.target.value)}
            />
          </div>
          <Textarea
            label="Justification for Waiver of Informed Consent"
            id="waiverJustification"
            rows={4}
            value={c.waiverJustification}
            onChange={e => f('waiverJustification', e.target.value)}
            required
            hint="Explain in detail why each of the four waiver criteria is met."
            placeholder="This research involves no more than minimal risk because... The waiver will not adversely affect subjects' rights or welfare because... The research could not practicably be conducted without the waiver because..."
          />
        </>
      )}

      {c.consentRequired !== false && (
        <>
          {/* Written documentation */}
          <YesNo
            label="Will consent be documented with a signed consent form?"
            name="documentedConsent"
            value={c.documentedConsent}
            onChange={v => f('documentedConsent', v)}
            required
            tooltip="Written, signed consent is the standard. A waiver of documentation of consent (e.g., online survey with implied consent) may be requested for minimal-risk studies."
          />

          {c.documentedConsent === false && (
            <ConditionalYesNo
              label="Are you requesting a Waiver of Documentation of Informed Consent (e.g., implied consent, information sheet only)?"
              name="waiverOfDocumentation"
              value={c.waiverOfDocumentation}
              onChange={v => f('waiverOfDocumentation', v)}
              tooltip="For online surveys with no identifiers, a waiver of documentation is commonly approved: the consent information appears before the survey and proceeding implies consent."
            >
              <div>
                <p className="field-label">Basis for Waiver of Documentation</p>
                <Select
                  options={WAIVER_DOC_BASES}
                  placeholder="— Select basis —"
                  value={c.waiverDocBasis}
                  onChange={e => f('waiverDocBasis', e.target.value)}
                />
              </div>
              <InfoBox variant="tip" title="Online Survey Consent Best Practice">
                For anonymous online surveys, a common and IRB-approved approach is to present all consent
                information on the first page of the survey. The final line should state something like:
                <em> "By clicking 'Begin Survey,' you are indicating that you have read and understood the
                information above and consent to participate."</em>
                Participants should be able to close the window without penalty.
              </InfoBox>
            </ConditionalYesNo>
          )}

          {/* Language */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="field-label">Primary Language of Consent Form <span className="text-red-500">*</span></p>
              <Select
                options={CONSENT_LANGUAGES}
                placeholder="— Select language —"
                value={c.consentLanguage}
                onChange={e => f('consentLanguage', e.target.value)}
              />
            </div>
            <ConditionalYesNo
              label="Will consent forms be provided in languages other than English?"
              name="translationNeeded"
              value={c.translationNeeded}
              onChange={v => f('translationNeeded', v)}
              tooltip="If recruiting non-English speakers, consent must be in a language they understand. IRB may require back-translation for quality assurance."
            >
              <InfoBox variant="info">
                Translated consent forms must be submitted to the IRB for approval.
                A short-form consent in the participant's language (with a summary verbally presented
                in their language, witnessed by a bilingual individual) may be used in some circumstances.
                Contact irb@bridgeport.edu for guidance.
              </InfoBox>
            </ConditionalYesNo>
          </div>

          {/* Minors */}
          {subjects.includesMinors === true && (
            <>
              <Divider label="Children — Parental Permission & Assent" />
              <YesNo
                label="Will written parental or guardian permission be obtained for minor participants?"
                name="parentPermissionRequired"
                value={c.parentPermissionRequired}
                onChange={v => f('parentPermissionRequired', v)}
                required
                tooltip="Research involving children (under 18) requires written permission from a parent or legal guardian. Prepare a separate Parent Permission form."
              />
              <ConditionalYesNo
                label="Will child assent be obtained from minor participants?"
                name="assentRequired"
                value={c.assentRequired}
                onChange={v => f('assentRequired', v)}
                tooltip="Children ages 7 and older are generally capable of providing assent (agreeing to participate). Assent must be age-appropriate (grade-level language). Children younger than 7 generally cannot provide meaningful assent."
              >
                <InfoBox variant="tip" title="Assent Form Requirements">
                  Assent forms should be written at a reading level appropriate for your participants:
                  <ul className="mt-1 list-disc list-inside text-xs">
                    <li>Ages 7–11: simple language, short sentences, pictures if helpful</li>
                    <li>Ages 12–17: similar to adult consent but simpler vocabulary</li>
                  </ul>
                  The assent form should explain: what the study is, what they will do, that they can stop
                  at any time, and that their parent/guardian also agreed.
                </InfoBox>
              </ConditionalYesNo>
            </>
          )}

          <Divider label="Consent Process Description" />

          <Textarea
            label="Describe the Consent Process"
            id="consentProcess"
            required
            rows={4}
            value={c.consentProcess}
            onChange={e => f('consentProcess', e.target.value)}
            hint="Describe step-by-step how you will obtain consent: When will it be obtained? Where? By whom? How will participants have the opportunity to ask questions? How much time will they have to decide?"
            placeholder="Potential participants will first be contacted via email with a recruitment message describing the study. Those who express interest will be directed to the online consent form hosted on Qualtrics. They will have the opportunity to review the consent document at their own pace. By clicking 'I Agree,' participants confirm they have read and understood the consent information and agree to participate. Participants will be provided with the PI's email for questions before or during the study..."
          />

          <Textarea
            label="Key Risks to Highlight in Consent"
            id="keyRisksForConsent"
            rows={3}
            value={c.keyRisksForConsent}
            onChange={e => f('keyRisksForConsent', e.target.value)}
            hint="List the most important risks that must be prominently disclosed in the Key Information section of the consent form."
            placeholder="1. Possible emotional discomfort from survey questions about [topic]&#10;2. Minimal risk of data breach (mitigated by encryption)&#10;3. Time required: approximately 20 minutes"
          />

          <Textarea
            label="Key Benefits to Describe in Consent"
            id="keyBenefitsForConsent"
            rows={2}
            value={c.keyBenefitsForConsent}
            onChange={e => f('keyBenefitsForConsent', e.target.value)}
            hint="List benefits that should be described. If no direct benefit, use: 'You may not personally benefit, but your participation will contribute to...'"
            placeholder="While you may not personally benefit from this study, your participation will contribute to research on..."
          />

          <Divider label="Online Consent" />

          <YesNo
            label="Will consent be obtained online (e.g., via survey platform)?"
            name="onlineConsent"
            value={c.onlineConsent}
            onChange={v => f('onlineConsent', v)}
          />

          {c.onlineConsent === true && (
            <InfoBox variant="tip" title="Online Consent Checklist">
              For online consent, ensure:
              <ul className="mt-1 list-disc list-inside text-xs">
                <li>All required consent elements are present before the survey begins</li>
                <li>Participants can print/save a copy of the consent information</li>
                <li>IP address logging is disabled (if anonymous) OR disclosed (if collected)</li>
                <li>The platform stores data securely (use UB Enterprise Qualtrics or REDCap)</li>
                <li>The consent page cannot be accidentally skipped</li>
                <li>There is a clear statement that completing the survey implies consent</li>
              </ul>
            </InfoBox>
          )}

          <InfoBox variant="info" title="Required Elements of Informed Consent (45 CFR 46.116)">
            Your consent form must include ALL of the following basic elements:
            <ol className="mt-1 list-decimal list-inside text-xs space-y-0.5">
              <li>Statement that study involves research + voluntary participation</li>
              <li>Purpose, expected duration, and description of procedures</li>
              <li>Foreseeable risks or discomforts</li>
              <li>Expected benefits (to subject or others)</li>
              <li>Alternative procedures or treatments</li>
              <li>Extent to which confidentiality will be maintained</li>
              <li>For greater-than-minimal-risk: compensation/treatment for injury</li>
              <li>Contact information for PI and for rights questions (IRB)</li>
              <li>Statement that participation is voluntary, may be withdrawn at any time</li>
            </ol>
            The Document Generator (Step 10) will create a pre-filled template based on your answers.
          </InfoBox>
        </>
      )}
      <Divider label="AI Pre-Review" />
      <AIStepReviewer section="consent" />
    </div>
  );
}
