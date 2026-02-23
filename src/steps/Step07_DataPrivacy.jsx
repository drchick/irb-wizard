import { useWizard } from '../context/WizardContext';
import { TextInput, Textarea, Select, YesNo, ConditionalYesNo, CheckboxGroup, SectionHeader, Divider } from '../components/ui/FormField';
import { InfoBox } from '../components/ui/InfoBox';
import { AIStepReviewer } from '../components/ui/AIStepReviewer';

const IDENTIFIER_TYPES = [
  { value: 'name',           label: 'Full Name' },
  { value: 'email',          label: 'Email Address' },
  { value: 'phone',          label: 'Phone Number' },
  { value: 'address',        label: 'Street Address' },
  { value: 'dob',            label: 'Date of Birth' },
  { value: 'ssn',            label: 'Social Security Number' },
  { value: 'mrn',            label: 'Medical Record Number' },
  { value: 'id_number',      label: 'Student/Employee ID Number' },
  { value: 'ip',             label: 'IP Address' },
  { value: 'location',       label: 'Geographic Location (smaller than state)' },
  { value: 'photo',          label: 'Photographs / Videos' },
  { value: 'voice',          label: 'Voice Recordings' },
  { value: 'biometric',      label: 'Biometric Data' },
  { value: 'other',          label: 'Other Identifying Information' },
];

const DATA_COLLECTION_METHODS = [
  { value: 'online_survey',  label: 'Online Survey (Qualtrics, REDCap, etc.)' },
  { value: 'paper_survey',   label: 'Paper Survey / Questionnaire' },
  { value: 'interview',      label: 'Interview (recorded or note-taking)' },
  { value: 'observation',    label: 'Direct Observation' },
  { value: 'medical_records',label: 'Medical / Health Records' },
  { value: 'educational_records', label: 'Educational Records (FERPA)' },
  { value: 'existing_dataset', label: 'Existing Dataset' },
  { value: 'physiological',  label: 'Physiological Monitoring Device' },
  { value: 'wearable',       label: 'Wearable Technology / App' },
  { value: 'other',          label: 'Other' },
];

const STORAGE_LOCATIONS = [
  { value: 'ub_network',    label: 'UB Secure Network Drive', hint: 'Recommended — already encrypted and backed up' },
  { value: 'encrypted_pc',  label: 'Encrypted Personal Computer', hint: 'BitLocker (Windows) or FileVault 2 (Mac) required' },
  { value: 'redcap',        label: 'UB REDCap Database', hint: 'HIPAA-compliant, recommended for clinical data' },
  { value: 'qualtrics',     label: 'Qualtrics (UB Enterprise)', hint: 'UB Enterprise Qualtrics has enhanced security' },
  { value: 'locked_cabinet',label: 'Locked File Cabinet (paper)', hint: 'For physical documents only' },
  { value: 'cloud',         label: 'UB-Approved Cloud Storage (OneDrive, Google Workspace)', hint: 'Must be UB institutional account, not personal' },
  { value: 'sponsor',       label: 'Sponsor / Funder System', hint: 'Describe access controls in protocol' },
  { value: 'other',         label: 'Other', hint: 'Describe security measures in the text field below' },
];

const RETENTION_UNITS = [
  { value: 'months', label: 'Months' },
  { value: 'years',  label: 'Years' },
];

export default function Step07_DataPrivacy() {
  const { formData, updateField } = useWizard();
  const d = formData.data;
  const f = (field, val) => updateField('data', field, val);

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Data Management & Privacy"
        description="Describe how you will collect, store, protect, and dispose of research data. Strong data security is one of the most effective ways to minimize risk to participants."
      />

      {/* Anonymous vs. coded vs. identifiable */}
      <div className="card p-4 bg-slate-50 border-slate-200">
        <p className="text-sm font-bold text-slate-700 mb-3">Data Identifiability — Choose the most accurate description:</p>
        <div className="flex flex-col gap-2">
          {[
            { key: 'anonymous', label: 'Anonymous', desc: 'No identifiers are collected at any point. Data cannot be linked to individuals.' },
            { key: 'coded', label: 'Coded (Linked De-identified)', desc: 'Identifiers are replaced with codes. A separate key linking codes to identities exists.' },
            { key: 'identified', label: 'Identifiable', desc: 'Data includes identifiers (names, IDs, etc.) that directly link to individuals.' },
          ].map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                f('anonymousData', opt.key === 'anonymous');
                f('codedData', opt.key === 'coded');
                f('collectsIdentifiers', opt.key === 'identified');
              }}
              className={`text-left rounded-lg border-2 p-3 transition ${
                (opt.key === 'anonymous' && d.anonymousData) ||
                (opt.key === 'coded' && d.codedData) ||
                (opt.key === 'identified' && d.collectsIdentifiers)
                  ? 'border-navy-500 bg-navy-50 ring-2 ring-navy-200'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <p className="text-sm font-semibold text-slate-800">{opt.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Identifiers list */}
      {(d.collectsIdentifiers || d.codedData) && (
        <CheckboxGroup
          label="Which identifiers will be collected or linked?"
          options={IDENTIFIER_TYPES}
          value={d.identifierTypes}
          onChange={v => f('identifierTypes', v)}
          required
          tooltip="Check all identifiers that will appear in your data at any point during collection or processing."
        />
      )}

      {/* Coding key description */}
      {d.codedData && (
        <Textarea
          label="Describe the Coding System and Key Security"
          id="codingKeyDescription"
          rows={3}
          value={d.codingKeyDescription}
          onChange={e => f('codingKeyDescription', e.target.value)}
          required
          hint="Describe where the master key will be stored, who has access, and when it will be destroyed."
          placeholder="Participants will be assigned a numeric code (e.g., P001). The master key linking participant names to codes will be stored in a separate password-protected file on the UB secure network. Only the PI and Faculty Advisor will have access. The key will be destroyed 3 years after study closure..."
        />
      )}

      {d.anonymousData && (
        <InfoBox variant="success" title="Anonymous Data — Encryption Not Required">
          Since data is collected without identifiers, encryption of the dataset is not required.
          However, ensure that your data collection tool (e.g., Qualtrics) does not log IP addresses
          or other identifying metadata.
        </InfoBox>
      )}

      <Divider label="Data Collection" />

      <CheckboxGroup
        label="Data Collection Methods (select all that apply)"
        options={DATA_COLLECTION_METHODS}
        value={d.dataCollectionMethod}
        onChange={v => f('dataCollectionMethod', v)}
        required
      />

      {(d.dataCollectionMethod || []).includes('educational_records') && (
        <InfoBox variant="warning" title="FERPA Notice">
          Accessing student educational records requires compliance with FERPA (Family Educational
          Rights and Privacy Act). You must obtain written authorization from students OR show that
          disclosure qualifies under a FERPA exception. Consult UB's Registrar before accessing records.
        </InfoBox>
      )}

      <Divider label="Data Storage & Security" />

      <CheckboxGroup
        label="Where will identifiable or coded data be stored?"
        options={STORAGE_LOCATIONS}
        value={d.dataStorageLocation}
        onChange={v => f('dataStorageLocation', v)}
        required
        tooltip="List every location where data will reside — including during collection, analysis, and archiving."
      />

      <YesNo
        label="Will all electronic files containing identifiable or coded data be encrypted?"
        name="dataEncrypted"
        value={d.dataEncrypted}
        onChange={v => f('dataEncrypted', v)}
        required
        tooltip="UB IRB requires encryption of electronic files linking participant identity to research data. Use BitLocker (Windows) or FileVault 2 (Mac), or store on UB secure network drives."
      />

      {d.dataEncrypted === false && d.anonymousData !== true && (
        <InfoBox variant="error" title="Encryption Required">
          UB IRB requires that all electronic files containing identifiable or coded data be encrypted.
          Options: BitLocker (Windows), FileVault 2 (Mac), or store on UB institutional network drives.
          Contact helpdesk@bridgeport.edu for assistance.
        </InfoBox>
      )}

      <Textarea
        label="Who will have access to identifiable or coded data?"
        id="dataAccessList"
        rows={2}
        value={d.dataAccessList}
        onChange={e => f('dataAccessList', e.target.value)}
        hint="List all individuals with access and their role. Limit access to the minimum necessary."
        placeholder="Access will be limited to: (1) PI [Name] — full access for data management and analysis, (2) Faculty Advisor [Name] — read-only access for oversight. No other individuals will have access to identifiable data."
      />

      <Divider label="Data Retention & Destruction" />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex gap-2 items-end">
          <TextInput
            label="Data Retention Period"
            id="retentionPeriod"
            type="number"
            min="1"
            className="flex-1"
            value={d.retentionPeriod}
            onChange={e => f('retentionPeriod', e.target.value)}
            hint="Federally funded: 6 years. Unfunded: 3 years minimum recommended."
          />
          <div className="w-28 mb-1">
            <Select
              options={RETENTION_UNITS}
              value={d.retentionUnit}
              onChange={e => f('retentionUnit', e.target.value)}
            />
          </div>
        </div>
        <TextInput
          label="Retention Calculated From"
          id="retentionFrom"
          value={d.retentionFrom}
          onChange={e => f('retentionFrom', e.target.value)}
          hint="e.g., study completion, final publication, study closure"
          placeholder="study completion"
        />
      </div>

      <Textarea
        label="Data Destruction Method"
        id="destructionMethod"
        rows={2}
        value={d.destructionMethod}
        onChange={e => f('destructionMethod', e.target.value)}
        hint="Describe how data will be destroyed at the end of the retention period."
        placeholder="Electronic files will be permanently deleted and drives will be wiped using [software]. Paper records will be shredded using a cross-cut shredder. Audio/video recordings will be deleted from all devices and backup locations."
      />

      <Divider label="Data Sharing" />

      <ConditionalYesNo
        label="Will data be shared with individuals outside the research team or with other institutions?"
        name="dataShared"
        value={d.dataShared}
        onChange={v => f('dataShared', v)}
        tooltip="Data sharing includes sharing with collaborators at other universities, depositing in public repositories, or sharing with sponsors."
      >
        <Textarea
          label="Describe Data Sharing Plans"
          id="dataSharingDetails"
          rows={3}
          value={d.dataSharingDetails}
          onChange={e => f('dataSharingDetails', e.target.value)}
          required
          hint="What data will be shared, with whom, in what format (identified vs. de-identified), and what data use agreements are in place?"
          placeholder="De-identified data will be deposited in [repository name] upon publication. A data sharing agreement will be executed with [institution/sponsor]. No identifiable data will be shared externally."
        />
      </ConditionalYesNo>

      <YesNo
        label="Is this research subject to HIPAA (does it involve Protected Health Information from a covered entity)?"
        name="hipaaApplicable"
        value={d.hipaaApplicable}
        onChange={v => f('hipaaApplicable', v)}
        tooltip="HIPAA applies when you access or receive PHI from a healthcare provider, health plan, or healthcare clearinghouse. If yes, you may need a HIPAA Authorization or a waiver from the Privacy Board."
      />

      {d.hipaaApplicable === true && (
        <InfoBox variant="warning" title="HIPAA Compliance Required">
          Research involving Protected Health Information (PHI) requires either:
          <ul className="mt-1 list-disc list-inside text-xs">
            <li>HIPAA Authorization from each participant</li>
            <li>A Waiver of Authorization from the Privacy Board/IRB</li>
            <li>A Data Use Agreement (for limited datasets)</li>
          </ul>
          Contact your clinical site's Privacy Officer and the IRB administrator.
        </InfoBox>
      )}

      <ConditionalYesNo
        label="Will a Certificate of Confidentiality be obtained for this study?"
        name="certificateOfConfidentiality"
        value={d.certificateOfConfidentiality}
        onChange={v => f('certificateOfConfidentiality', v)}
        tooltip="A Certificate of Confidentiality (CoC) protects researchers from being compelled to disclose identifiable research information in legal proceedings. NIH-funded studies automatically receive CoCs."
      >
        <InfoBox variant="info">
          If your study has a Certificate of Confidentiality, you must disclose this to participants
          in the consent form and explain what it means: that you cannot be forced to disclose
          participant identities in response to a court order or subpoena.
        </InfoBox>
      </ConditionalYesNo>
      <Divider label="AI Pre-Review" />
      <AIStepReviewer section="data" />
    </div>
  );
}
