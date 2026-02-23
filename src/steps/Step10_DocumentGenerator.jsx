import { useState } from 'react';
import { useWizard } from '../context/WizardContext';
import { REVIEW_TYPES } from '../utils/reviewClassifier';
import {
  generateProtocolDescription,
  generateExemptConsentSheet,
  generateFullConsentForm,
} from '../utils/documentGenerator';
import { SectionHeader } from '../components/ui/FormField';
import { InfoBox } from '../components/ui/InfoBox';
import { FileText, Download, Printer, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

function DocCard({ title, description, onGenerate, generated, content, variant = 'primary' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={clsx(
      'rounded-xl border-2 overflow-hidden',
      variant === 'primary'   && 'border-navy-200',
      variant === 'secondary' && 'border-amber-200',
      variant === 'tertiary'  && 'border-emerald-200',
    )}>
      {/* Header */}
      <div className={clsx(
        'px-5 py-4 flex items-start justify-between',
        variant === 'primary'   && 'bg-navy-50',
        variant === 'secondary' && 'bg-amber-50',
        variant === 'tertiary'  && 'bg-emerald-50',
      )}>
        <div className="flex items-start gap-3">
          <FileText size={20} className={clsx(
            variant === 'primary'   && 'text-navy-600',
            variant === 'secondary' && 'text-amber-600',
            variant === 'tertiary'  && 'text-emerald-600',
          )} />
          <div>
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>
        <button
          onClick={onGenerate}
          className={clsx(
            'shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition',
            variant === 'primary'   && 'bg-navy-700 text-white hover:bg-navy-800',
            variant === 'secondary' && 'bg-amber-600 text-white hover:bg-amber-700',
            variant === 'tertiary'  && 'bg-emerald-600 text-white hover:bg-emerald-700',
          )}
        >
          {generated ? 'Regenerate' : 'Generate →'}
        </button>
      </div>

      {/* Generated content */}
      {generated && content && (
        <div>
          <div className="px-4 py-2 bg-slate-100 flex items-center justify-between border-t border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Generated — review and customize before submitting</span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy-700 transition"
              >
                {copied ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy-700 transition"
              >
                <Download size={13} /> Download .txt
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy-700 transition"
              >
                <Printer size={13} /> Print
              </button>
            </div>
          </div>
          <pre className="px-5 py-4 text-xs font-mono text-slate-700 leading-relaxed whitespace-pre-wrap bg-white max-h-96 overflow-y-auto border-t border-slate-100">
            {content}
          </pre>
        </div>
      )}
    </div>
  );
}

// Submission checklist items
function buildChecklist(formData, reviewType) {
  const { subjects, procedures, data, consent, prescreening, researcher } = formData;
  const items = [
    { label: 'CITI training certificate (PI)', done: prescreening.hasCITITraining === true },
    { label: 'CITI training certificate (Faculty Advisor)', done: prescreening.isStudentResearcher !== true || !!researcher.advisorEmail },
    { label: 'Protocol description', done: !!formData.study.studyPurpose },
    { label: 'Recruitment materials (flyers, email scripts, social media posts)', done: (subjects.recruitmentMethod || []).length > 0 },
    { label: 'Survey / interview instrument', done: (procedures.methodTypes || []).some(m => ['survey','interview'].includes(m)) ? !!procedures.surveyTopics || !!procedures.interviewTopics : null },
    reviewType === REVIEW_TYPES.EXEMPT
      ? { label: 'Exempt consent information sheet (NO signature line)', done: null }
      : { label: 'Full informed consent form (with signature lines)', done: null },
    subjects.includesMinors && { label: 'Parental/Guardian Permission Form', done: consent.parentPermissionRequired !== false },
    subjects.includesMinors && consent.assentRequired && { label: 'Child Assent Form', done: true },
    procedures.involvesBloodDraw && { label: 'Blood draw protocol details (amounts, frequency)', done: !!procedures.bloodDrawAmount },
    procedures.involvesDeception && { label: 'Debriefing script', done: procedures.deceptionDebriefing === true },
    procedures.involvesRandomization && { label: 'Randomization procedure description', done: !!procedures.randomizationDescription },
    data.hipaaApplicable && { label: 'HIPAA Authorization form or Waiver of Authorization request', done: null },
    formData.study.isMultiSite && { label: 'Site Authorization letter(s)', done: null },
    consent.waiverOfConsent && { label: 'Written justification for Waiver of Consent', done: !!consent.waiverBasis },
    consent.waiverOfDocumentation && { label: 'Written justification for Waiver of Documentation', done: !!consent.waiverDocBasis },
  ].filter(Boolean);

  return items;
}

export default function Step10_DocumentGenerator() {
  const { formData, reviewResult } = useWizard();
  const { type } = reviewResult;

  const [docs, setDocs] = useState({
    protocol: null,
    consentExempt: null,
    consentFull: null,
  });

  const generate = (key, fn) => {
    setDocs(prev => ({ ...prev, [key]: fn(formData) }));
  };

  const checklist = buildChecklist(formData, type);
  const isExempt  = type === REVIEW_TYPES.EXEMPT;
  const needsFullConsent = type === REVIEW_TYPES.EXPEDITED || type === REVIEW_TYPES.FULL_BOARD;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Document Generator"
        description="Generate pre-filled IRB document templates based on your wizard answers. Review and customize each document before uploading to Mentor IRB."
      />

      <InfoBox variant="warning" title="Important: Templates Require Customization">
        These documents are starting templates — not final submissions. Review each generated document
        carefully, fill in any <strong>[bracketed placeholders]</strong>, and customize the language to
        accurately reflect your study. Have your Faculty Advisor review all documents before submission.
      </InfoBox>

      {/* Consistency check banner */}
      {false /* placeholder — already shown in right panel */ && null}

      {/* Generated documents */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Documents</h3>

        <DocCard
          title="Protocol Description"
          description="Comprehensive research protocol for IRB submission — describes your study design, procedures, risks, benefits, and data management."
          variant="primary"
          generated={!!docs.protocol}
          content={docs.protocol}
          onGenerate={() => generate('protocol', generateProtocolDescription)}
        />

        {isExempt && (
          <DocCard
            title="Exempt Consent Information Sheet"
            description="For exempt research — a one-page information sheet describing the study. No participant signature required."
            variant="tertiary"
            generated={!!docs.consentExempt}
            content={docs.consentExempt}
            onGenerate={() => generate('consentExempt', generateExemptConsentSheet)}
          />
        )}

        {needsFullConsent && (
          <DocCard
            title="Full Informed Consent Form"
            description="Complete consent form with all required elements per 45 CFR 46.116, including participant signature lines."
            variant="secondary"
            generated={!!docs.consentFull}
            content={docs.consentFull}
            onGenerate={() => generate('consentFull', generateFullConsentForm)}
          />
        )}

        {type === REVIEW_TYPES.NOT_RESEARCH || type === REVIEW_TYPES.NOT_HUMAN_SUBJECTS ? (
          <InfoBox variant="success" title="No IRB Submission Required">
            Based on your answers, IRB review may not be required for this activity. Before proceeding,
            confirm with the IRB administrator (irb@bridgeport.edu) that your activity falls outside
            the definition of human subjects research.
          </InfoBox>
        ) : null}
      </div>

      {/* Submission checklist */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
          Submission Checklist
        </h3>
        <div className="flex flex-col gap-2">
          {checklist.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.done === true ? (
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              ) : item.done === false ? (
                <AlertCircle size={16} className="text-red-400 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
              )}
              <span className={clsx(
                'text-sm',
                item.done === true  && 'text-slate-700',
                item.done === false && 'text-red-600 font-medium',
                item.done === null  && 'text-slate-500',
              )}>
                {item.label}
                {item.done === null && <span className="text-xs text-slate-400 ml-1">(manual)</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Submission instructions */}
      <InfoBox variant="info" title="How to Submit in Mentor IRB">
        <ol className="mt-1 list-decimal list-inside text-xs space-y-1">
          <li>Log into Mentor IRB and click <strong>My Protocols → Create New Protocol</strong></li>
          <li>Complete the online form fields (title, dates, review type, number of subjects)</li>
          <li>Upload your Protocol Description and Consent Form using the <strong>Upload Docs</strong> button</li>
          <li>Upload recruitment materials, instruments, and CITI certificates</li>
          <li>Complete all <strong>Application Sections</strong> (red asterisk fields are required)</li>
          <li>Obtain your Faculty Advisor's electronic signature</li>
          <li>Click <strong>Submit Protocol for Review</strong></li>
          <li>⚠️ Do NOT begin research until you receive written IRB approval</li>
        </ol>
      </InfoBox>

      <InfoBox variant="tip" title="Need Help?">
        <ul className="mt-1 list-disc list-inside text-xs space-y-1">
          <li>IRB Administrator: <strong>irb@bridgeport.edu</strong></li>
          <li>IRB Phone: (203) 576-4974</li>
          <li>UB Research Compliance page: Check myUB portal for IRB Chair and Administrator contacts</li>
          <li>Mentor IRB system: Access via the IRB tab in myUB</li>
        </ul>
      </InfoBox>
    </div>
  );
}
