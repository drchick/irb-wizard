import { useWizard } from '../context/WizardContext';
import { YesNo, ConditionalYesNo, SectionHeader, TextInput } from '../components/ui/FormField';
import { InfoBox } from '../components/ui/InfoBox';
import CitiCertUpload from '../components/ui/CitiCertUpload';
import { Shield } from 'lucide-react';

export default function Step01_Prescreening() {
  const { formData, updateField } = useWizard();
  const ps = formData.prescreening;
  const f = (field, val) => updateField('prescreening', field, val);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Pre-Screening Questions"
        description="These questions determine whether your activity requires IRB review and at what level. Answer carefully — your responses drive the entire wizard."
      />

      <InfoBox variant="info" title="What is the IRB?">
        The Institutional Review Board (IRB) protects the rights and welfare of people who participate in
        research. Federal law requires IRB review for any systematic investigation involving human subjects
        that is designed to generate generalizable knowledge.
      </InfoBox>

      {/* Q1: Is this research? */}
      <YesNo
        label="Is your activity research? (systematic investigation designed to develop or contribute to generalizable knowledge — e.g., will you publish or present findings?)"
        name="isResearch"
        value={ps.isResearch}
        onChange={v => f('isResearch', v)}
        tooltip="Research = a systematic investigation designed to develop or contribute to generalizable knowledge (45 CFR 46.102(l)). Examples: publishable studies, thesis/dissertation work, grant-funded experiments. NOT research: quality improvement, routine clinical care, classroom exercises not intended for publication."
        required
      />

      {ps.isResearch === false && (
        <InfoBox variant="success" title="IRB Review May Not Be Required">
          If your activity is not research (e.g., quality improvement, program evaluation, class projects
          not intended for publication), IRB review may not be required. However, if you are uncertain or
          plan to later publish results, consult your IRB administrator at <strong>irb@bridgeport.edu</strong> before proceeding.
        </InfoBox>
      )}

      {ps.isResearch === true && (
        <>
          {/* Q2: Human subjects? */}
          <YesNo
            label="Does your research involve human subjects? (living individuals from whom you obtain data through interaction, intervention, or identifiable private information)"
            name="involvesHumanSubjects"
            value={ps.involvesHumanSubjects}
            onChange={v => f('involvesHumanSubjects', v)}
            tooltip="Human subject = a living individual about whom an investigator obtains data through interaction/intervention OR obtains/uses identifiable private information (45 CFR 46.102(e)). Secondary analysis of de-identified public datasets typically does not involve 'human subjects' under federal rules."
            required
          />

          {ps.involvesHumanSubjects === false && (
            <InfoBox variant="success" title="No Human Subjects Involved">
              Research that does not involve living human subjects (e.g., analysis of de-identified
              publicly available data, animal research, laboratory studies) may not require IRB review.
              Confirm with your IRB administrator if any individuals contribute identifiable information.
            </InfoBox>
          )}

          {ps.involvesHumanSubjects === true && (
            <>
              {/* Q3: Student researcher? */}
              <YesNo
                label="Are you a student researcher (undergraduate or graduate student)?"
                name="isStudentResearcher"
                value={ps.isStudentResearcher}
                onChange={v => f('isStudentResearcher', v)}
                required
              />

              {ps.isStudentResearcher === true && (
                <ConditionalYesNo
                  label="Do you have a UB faculty advisor who has agreed to oversee this research?"
                  name="hasFacultyAdvisor"
                  value={ps.hasFacultyAdvisor}
                  onChange={v => f('hasFacultyAdvisor', v)}
                  tooltip="UB IRB requires that student research have a faculty advisor responsible for human subject protection. The faculty advisor must also have current CITI training. You cannot submit to IRB without identifying a faculty advisor."
                  required
                >
                  <InfoBox variant="tip" title="Faculty Advisor Requirement">
                    Your faculty advisor must have current CITI Human Subjects training. They will co-sign
                    your IRB submission and take responsibility for protocol compliance.
                  </InfoBox>
                </ConditionalYesNo>
              )}

              {ps.hasFacultyAdvisor === false && ps.isStudentResearcher === true && (
                <InfoBox variant="error" title="Faculty Advisor Required">
                  UB IRB requires student researchers to have a faculty advisor before submitting a protocol.
                  Identify a faculty member in your department who can serve as your advisor, then return to complete this wizard.
                </InfoBox>
              )}

              {/* Q4: CITI Training */}
              <YesNo
                label="Do you (and your faculty advisor, if applicable) have current CITI Human Subjects Research training?"
                name="hasCITITraining"
                value={ps.hasCITITraining}
                onChange={v => f('hasCITITraining', v)}
                tooltip="CITI training is valid for 3 years. You must complete either Social & Behavioral Research or Biomedical Research training (or both, depending on your study type). Go to citiprogram.org to complete training."
                required
              />

              {ps.hasCITITraining === false && (
                <InfoBox variant="warning" title="Complete CITI Training Before Submitting">
                  All investigators and research staff must complete CITI Human Subjects training before IRB
                  submission. Visit <strong>citiprogram.org</strong> and affiliate with the University of Bridgeport.
                  Select the appropriate course for your research type:
                  <ul className="mt-1 list-disc list-inside text-xs">
                    <li>Social &amp; Behavioral Research (for surveys, interviews, observations)</li>
                    <li>Biomedical Research (for clinical, physiological, or medical research)</li>
                  </ul>
                </InfoBox>
              )}

              {ps.hasCITITraining === true && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <TextInput
                      label="CITI Completion Date"
                      id="citiCompletionDate"
                      type="date"
                      value={ps.citiCompletionDate}
                      onChange={e => f('citiCompletionDate', e.target.value)}
                      hint="Date you completed or most recently refreshed training"
                    />
                    <TextInput
                      label="CITI Expiration Date"
                      id="citiExpiryDate"
                      type="date"
                      value={ps.citiExpiryDate}
                      onChange={e => f('citiExpiryDate', e.target.value)}
                      hint="CITI training is valid for 3 years from completion"
                    />
                  </div>
                  <CitiCertUpload
                    onDatesExtracted={(completion, expiry) => {
                      if (completion) f('citiCompletionDate', completion);
                      if (expiry)     f('citiExpiryDate',     expiry);
                    }}
                    onFileSelected={(filename) => f('citiCertFileName', filename)}
                    onRemove={() => f('citiCertFileName', '')}
                    currentFileName={ps.citiCertFileName}
                  />
                </>
              )}

              {/* Q5: New protocol? */}
              <YesNo
                label="Is this a new protocol (not a renewal or amendment to an existing approved study)?"
                name="isNewProtocol"
                value={ps.isNewProtocol}
                onChange={v => f('isNewProtocol', v)}
                required
              />

              {ps.isNewProtocol === false && (
                <InfoBox variant="info" title="Amendments & Renewals">
                  For amendments (modifications to an approved study) or annual renewals, submit through
                  the Amendments or Annual Reports tab of your existing protocol in Mentor IRB, rather than
                  creating a new protocol. This wizard is designed for new protocol submissions.
                </InfoBox>
              )}

              {ps.hasCITITraining !== false && ps.involvesHumanSubjects === true && (
                <InfoBox variant="tip" title="What Happens Next">
                  <p>Based on your answers, this wizard will guide you through all sections needed for an
                  IRB application. As you fill in each section, the <strong>Review Determination</strong> panel
                  on the right will continuously update to reflect your likely review level (Exempt, Expedited,
                  or Full Board).</p>
                </InfoBox>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
