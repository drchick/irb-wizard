import { useWizard } from '../context/WizardContext';
import { TextInput, SectionHeader, Divider } from '../components/ui/FormField';
import { InfoBox } from '../components/ui/InfoBox';

export default function Step02_ResearcherInfo() {
  const { formData, updateField } = useWizard();
  const r = formData.researcher;
  const ps = formData.prescreening;
  const f = (field, val) => updateField('researcher', field, val);

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Principal Investigator"
        description="Provide contact information for the PI responsible for this protocol. For student research, the student is typically listed as PI with the faculty member as Faculty Advisor."
      />

      <div className="grid grid-cols-2 gap-4">
        <TextInput label="First Name" id="piFirstName" required value={r.piFirstName} onChange={e => f('piFirstName', e.target.value)} />
        <TextInput label="Last Name" id="piLastName" required value={r.piLastName} onChange={e => f('piLastName', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TextInput label="Email" id="piEmail" type="email" required value={r.piEmail} onChange={e => f('piEmail', e.target.value)} hint="Use your UB email address" />
        <TextInput label="Phone" id="piPhone" type="tel" value={r.piPhone} onChange={e => f('piPhone', e.target.value)} hint="Include area code (e.g., 203-555-0100)" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TextInput label="Department / School" id="piDepartment" required value={r.piDepartment} onChange={e => f('piDepartment', e.target.value)} />
        <TextInput label="Degree / Title" id="piDegree" value={r.piDegree} onChange={e => f('piDegree', e.target.value)} hint="e.g., Ph.D., M.S. Candidate, B.S. Student" />
      </div>

      {/* Faculty Advisor section (only for students) */}
      {ps.isStudentResearcher === true && (
        <>
          <Divider label="Faculty Advisor (Required for Student Research)" />
          <InfoBox variant="info">
            Your faculty advisor is responsible for human subject protection and must co-sign your IRB
            submission. They must have current CITI training. Look up their name in the Mentor IRB system by last name.
          </InfoBox>
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Advisor First Name" id="advisorFirstName" required value={r.advisorFirstName} onChange={e => f('advisorFirstName', e.target.value)} />
            <TextInput label="Advisor Last Name" id="advisorLastName" required value={r.advisorLastName} onChange={e => f('advisorLastName', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Advisor Email" id="advisorEmail" type="email" required value={r.advisorEmail} onChange={e => f('advisorEmail', e.target.value)} />
            <TextInput label="Advisor Department" id="advisorDepartment" value={r.advisorDepartment} onChange={e => f('advisorDepartment', e.target.value)} />
          </div>
        </>
      )}

      {/* Co-Investigators */}
      <Divider label="Co-Investigators / Research Team" />
      <InfoBox variant="tip" title="Team Members">
        List all individuals who will interact with research subjects, have access to identifiable data,
        or contribute to the research procedures. All team members must have current CITI training.
        You can add them in the Mentor IRB system after creating the protocol.
      </InfoBox>
      <TextInput
        label="Co-Investigators and Research Associates"
        id="coInvestigators"
        value={r.coInvestigators}
        onChange={e => f('coInvestigators', e.target.value)}
        hint="List names and roles (e.g., Jane Smith – Research Assistant, data collection)"
        placeholder="List names and roles, separated by semicolons"
      />

      <InfoBox variant="info" title="CITI Training Reminder">
        All investigators, co-investigators, and research associates must complete CITI training before
        the study begins. CITI certificates are valid for <strong>3 years</strong>. Upload your completion
        certificate in the Mentor IRB system under your protocol.
      </InfoBox>
    </div>
  );
}
