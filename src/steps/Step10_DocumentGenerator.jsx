import { useState, useRef, useEffect } from 'react';
import { useWizard } from '../context/WizardContext';
import { useCredits } from '../hooks/useCredits';
import { CreditGate } from '../components/ui/CreditGate';
import { REVIEW_TYPES } from '../utils/reviewClassifier';

// Plain-text generators
import {
  generateProtocolDescription,
  generateExemptConsentSheet,
  generateFullConsentForm,
  generateParentalPermissionForm,
  generateChildAssentForm,
  generateDebriefingScript,
  generateHIPAAAuthorization,
  generateRecruitmentEmail,
  generateRecruitmentFlyer,
  generateClassAnnouncement,
  generateSocialMediaPost,
} from '../utils/documentGenerator';

// DOCX generators
import {
  generateProtocolDescriptionDocx,
  generateExemptConsentSheetDocx,
  generateFullConsentFormDocx,
  generateParentalPermissionFormDocx,
  generateChildAssentFormDocx,
  generateDebriefingScriptDocx,
  generateHIPAAAuthorizationDocx,
  generateRecruitmentEmailDocx,
  generateRecruitmentFlyerDocx,
  generateClassAnnouncementDocx,
  generateSocialMediaPostDocx,
} from '../utils/docxGenerator';

import { SectionHeader } from '../components/ui/FormField';
import { InfoBox } from '../components/ui/InfoBox';
import {
  FileText, Download, Printer, Copy, CheckCircle2,
  AlertCircle, ChevronDown, ChevronUp, Zap,
} from 'lucide-react';
import clsx from 'clsx';

// ─── DocCard ──────────────────────────────────────────────────────────────────

function DocCard({ title, description, onGenerate, onGenerateDocx, generated, content, docxBlob, variant = 'primary' }) {
  const [copied,      setCopied]      = useState(false);
  const [docxLoading, setDocxLoading] = useState(false);
  const [expanded,    setExpanded]    = useState(true);

  const COLORS = {
    primary:   { border: 'border-navy-200',   header: 'bg-navy-50',    icon: 'text-navy-600',    btn: 'bg-navy-700 hover:bg-navy-800' },
    secondary:  { border: 'border-amber-200',  header: 'bg-amber-50',   icon: 'text-amber-600',   btn: 'bg-amber-600 hover:bg-amber-700' },
    tertiary:  { border: 'border-emerald-200', header: 'bg-emerald-50', icon: 'text-emerald-600', btn: 'bg-emerald-600 hover:bg-emerald-700' },
    violet:    { border: 'border-violet-200',  header: 'bg-violet-50',  icon: 'text-violet-600',  btn: 'bg-violet-600 hover:bg-violet-700' },
  };
  const c = COLORS[variant] || COLORS.primary;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: `${title.replace(/\s+/g, '_')}.txt` });
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDocx = async () => {
    setDocxLoading(true);
    try {
      const blob = await onGenerateDocx();
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement('a'), { href: url, download: `${title.replace(/[\s/]+/g, '_')}.docx` });
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('DOCX generation failed', err);
    } finally {
      setDocxLoading(false);
    }
  };

  return (
    <div className={clsx('rounded-xl border-2 overflow-hidden', c.border)}>
      {/* Header */}
      <div className={clsx('px-5 py-4 flex items-start justify-between gap-3', c.header)}>
        <div className="flex items-start gap-3 min-w-0">
          <FileText size={20} className={clsx('shrink-0 mt-0.5', c.icon)} />
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>
        <button
          onClick={onGenerate}
          className={clsx('shrink-0 rounded-lg px-4 py-2 text-xs font-semibold text-white transition', c.btn)}
        >
          {generated ? 'Regenerate' : 'Generate →'}
        </button>
      </div>

      {/* Toolbar — shown after generation */}
      {generated && content && (
        <div className="px-4 py-2.5 bg-slate-50 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
          <span className="text-xs text-slate-500 font-medium italic">
            Review and customize before submitting
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary: DOCX download */}
            <button
              onClick={handleDownloadDocx}
              disabled={docxLoading}
              className="flex items-center gap-1.5 rounded-md bg-navy-700 hover:bg-navy-800 disabled:opacity-60 text-white px-3 py-1.5 text-xs font-semibold transition"
            >
              <Download size={12} />
              {docxLoading ? 'Building…' : '⬇ Download .docx'}
            </button>
            {/* Secondary actions */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-navy-700 transition"
            >
              {copied ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-navy-700 transition"
            >
              <Download size={13} /> .txt
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-navy-700 transition"
            >
              <Printer size={13} /> Print
            </button>
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 transition"
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {expanded ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
      )}

      {/* Content preview */}
      {generated && content && expanded && (
        <pre className="px-5 py-4 text-xs font-mono text-slate-700 leading-relaxed whitespace-pre-wrap bg-white max-h-96 overflow-y-auto border-t border-slate-100">
          {content}
        </pre>
      )}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function DocSection({ label, color, children, onGenerateAll }) {
  const COLORS = {
    navy:   'bg-navy-700 text-white border-navy-200',
    amber:  'bg-amber-600 text-white border-amber-200',
    violet: 'bg-violet-600 text-white border-violet-200',
  };
  return (
    <div className="flex flex-col gap-3">
      <div className={clsx('flex items-center justify-between rounded-lg px-4 py-2.5 border', COLORS[color] || COLORS.navy)}>
        <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
        <button
          onClick={onGenerateAll}
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-md px-3 py-1 text-xs font-semibold transition"
        >
          <Zap size={12} /> Generate All
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}

// ─── Submission checklist ─────────────────────────────────────────────────────

function buildChecklist(formData, reviewType) {
  const { subjects, procedures, data, consent, prescreening, researcher } = formData;
  return [
    { label: 'CITI training certificate (PI)', done: prescreening.hasCITITraining === true },
    { label: 'CITI training certificate (Faculty Advisor)', done: prescreening.isStudentResearcher !== true || !!researcher.advisorEmail },
    { label: 'Protocol description', done: !!formData.study.studyPurpose },
    { label: 'Recruitment materials (flyers, email scripts, posts)', done: (subjects.recruitmentMethod || []).length > 0 },
    { label: 'Survey / interview instrument', done: (procedures.methodTypes || []).some(m => ['survey', 'interview'].includes(m)) ? !!procedures.surveyTopics || !!procedures.interviewTopics : null },
    reviewType === REVIEW_TYPES.EXEMPT
      ? { label: 'Exempt consent information sheet (NO signature line)', done: null }
      : { label: 'Full informed consent form (with signature lines)', done: null },
    subjects.includesMinors && { label: 'Parental/Guardian Permission Form', done: consent.parentPermissionRequired !== false },
    subjects.includesMinors && consent.assentRequired && { label: 'Child Assent Form', done: true },
    procedures.involvesDeception && { label: 'Debriefing script', done: procedures.deceptionDebriefing === true },
    procedures.involvesBloodDraw && { label: 'Blood draw protocol (amounts, frequency)', done: !!procedures.bloodDrawAmount },
    procedures.involvesRandomization && { label: 'Randomization procedure description', done: !!procedures.randomizationDescription },
    data.hipaaApplicable && { label: 'HIPAA Authorization form or Waiver of Authorization', done: null },
    formData.study.isMultiSite && { label: 'Site Authorization letter(s)', done: null },
    consent.waiverOfConsent && { label: 'Written justification for Waiver of Consent', done: !!consent.waiverBasis },
    consent.waiverOfDocumentation && { label: 'Written justification for Waiver of Documentation', done: !!consent.waiverDocBasis },
  ].filter(Boolean);
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Step10_DocumentGenerator() {
  const { formData, reviewResult } = useWizard();
  const { type } = reviewResult;
  const { credits, loading: creditsLoading, deduct: deductCredit } = useCredits();

  // If the user already ran the AI review in Step 9 (and set the unlock flag),
  // treat documents as unlocked without spending another credit.
  const [docUnlocked, setDocUnlocked] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDocUnlocked(localStorage.getItem('irbwiz_protocol_unlocked') === 'true');
    }
  }, []);

  // Effective credits: unlocked via AI run OR has remaining credits
  const effectiveCredits = docUnlocked ? 1 : credits;

  const handleUnlockDocs = async () => {
    try {
      await deductCredit();
      localStorage.setItem('irbwiz_protocol_unlocked', 'true');
      setDocUnlocked(true);
    } catch {
      // handled by CreditGate
    }
  };

  // Text content state
  const [docs, setDocs] = useState({
    protocol: null, consentExempt: null, consentFull: null,
    parentalPermission: null, childAssent: null, debriefing: null,
    hipaa: null, recruitEmail: null, recruitFlyer: null,
    classAnnouncement: null, socialMedia: null,
  });

  const generate = (key, fn) => setDocs(prev => ({ ...prev, [key]: fn(formData) }));

  // Convenience: docx generators per key
  const docxFns = {
    protocol:           () => generateProtocolDescriptionDocx(formData),
    consentExempt:      () => generateExemptConsentSheetDocx(formData),
    consentFull:        () => generateFullConsentFormDocx(formData),
    parentalPermission: () => generateParentalPermissionFormDocx(formData),
    childAssent:        () => generateChildAssentFormDocx(formData),
    debriefing:         () => generateDebriefingScriptDocx(formData),
    hipaa:              () => generateHIPAAAuthorizationDocx(formData),
    recruitEmail:       () => generateRecruitmentEmailDocx(formData),
    recruitFlyer:       () => generateRecruitmentFlyerDocx(formData),
    classAnnouncement:  () => generateClassAnnouncementDocx(formData),
    socialMedia:        () => generateSocialMediaPostDocx(formData),
  };

  const isExempt       = type === REVIEW_TYPES.EXEMPT;
  const needsFullConsent = type === REVIEW_TYPES.EXPEDITED || type === REVIEW_TYPES.FULL_BOARD;
  const hasMinors      = formData.subjects.includesMinors;
  const needsAssent    = hasMinors && formData.consent.assentRequired;
  const hasDeception   = formData.procedures.involvesDeception;
  const hasHIPAA       = formData.data.hipaaApplicable;
  const recruitMethods = formData.subjects.recruitmentMethod || [];
  const hasClassAnnounce = recruitMethods.includes('class_announce');
  const hasSocialMedia   = recruitMethods.includes('social_media');

  const checklist = buildChecklist(formData, type);

  // Generate all in a section
  const generateSection = (keys) => keys.forEach(([key, fn]) => generate(key, fn));

  const protocolKeys = [['protocol', generateProtocolDescription]];
  const participantKeys = [
    ...(isExempt       ? [['consentExempt', generateExemptConsentSheet]]     : []),
    ...(needsFullConsent ? [['consentFull', generateFullConsentForm]]         : []),
    ...(hasMinors      ? [['parentalPermission', generateParentalPermissionForm]] : []),
    ...(needsAssent    ? [['childAssent', generateChildAssentForm]]           : []),
    ...(hasDeception   ? [['debriefing', generateDebriefingScript]]           : []),
    ...(hasHIPAA       ? [['hipaa', generateHIPAAAuthorization]]              : []),
  ];
  const recruitmentKeys = [
    ['recruitEmail', generateRecruitmentEmail],
    ['recruitFlyer', generateRecruitmentFlyer],
    ...(hasClassAnnounce ? [['classAnnouncement', generateClassAnnouncement]] : []),
    ...(hasSocialMedia   ? [['socialMedia', generateSocialMediaPost]]         : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Document Generator"
        description="Generate pre-filled IRB document templates for every requirement. Each document downloads as a formatted Word (.docx) file ready to customize and upload to Mentor IRB."
      />

      <InfoBox variant="warning" title="Templates Require Customization">
        These documents are starting templates — not final submissions. Review each document
        carefully, fill in any <strong>[BRACKETED PLACEHOLDERS]</strong>, and customize the
        language to accurately reflect your study. Have your Faculty Advisor review all
        documents before submission.
      </InfoBox>

      {/* ── Document sections gated behind 1 credit ──────────────────────── */}
      <CreditGate
        credits={effectiveCredits}
        loading={creditsLoading}
        feature="Generate and download your complete IRB document package — Protocol Description, Consent Forms, Recruitment Materials, and more."
      >

      {/* ── A. Protocol Documents ──────────────────────────────────────────── */}
      <DocSection
        label="A. Protocol Documents"
        color="navy"
        onGenerateAll={() => generateSection(protocolKeys)}
      >
        <DocCard
          title="Protocol Description"
          description="Comprehensive 7-section research protocol for IRB submission — study design, procedures, risks, data management, and consent."
          variant="primary"
          generated={!!docs.protocol}
          content={docs.protocol}
          onGenerate={() => generate('protocol', generateProtocolDescription)}
          onGenerateDocx={docxFns.protocol}
        />
      </DocSection>

      {/* ── B. Participant-Facing Documents ───────────────────────────────── */}
      <DocSection
        label="B. Participant-Facing Documents"
        color="amber"
        onGenerateAll={() => generateSection(participantKeys)}
      >
        {/* Consent / Info Sheet */}
        {isExempt && (
          <DocCard
            title="Exempt Consent Information Sheet"
            description="One-page information sheet for exempt research. No participant signature required — proceeding with participation implies consent."
            variant="tertiary"
            generated={!!docs.consentExempt}
            content={docs.consentExempt}
            onGenerate={() => generate('consentExempt', generateExemptConsentSheet)}
            onGenerateDocx={docxFns.consentExempt}
          />
        )}
        {needsFullConsent && (
          <DocCard
            title="Full Informed Consent Form"
            description="Complete 9-section consent form per 45 CFR 46.116 with all required elements, key information summary, and participant signature lines."
            variant="secondary"
            generated={!!docs.consentFull}
            content={docs.consentFull}
            onGenerate={() => generate('consentFull', generateFullConsentForm)}
            onGenerateDocx={docxFns.consentFull}
          />
        )}
        {!isExempt && !needsFullConsent && (
          <InfoBox variant="info" title="Consent Document">
            Complete the Pre-Screening and earlier steps to determine which consent document is required (Exempt Info Sheet or Full Consent Form).
          </InfoBox>
        )}

        {/* Parental Permission */}
        {hasMinors && (
          <DocCard
            title="Parental / Guardian Permission Form"
            description="Required when research involves minors. Mirrors the full consent form but is addressed to the parent or guardian."
            variant="secondary"
            generated={!!docs.parentalPermission}
            content={docs.parentalPermission}
            onGenerate={() => generate('parentalPermission', generateParentalPermissionForm)}
            onGenerateDocx={docxFns.parentalPermission}
          />
        )}

        {/* Child Assent */}
        {needsAssent && (
          <DocCard
            title="Child Assent Form"
            description="Age-appropriate plain-language form for children ages 7–17. Explains the study simply and obtains the child's agreement to participate."
            variant="tertiary"
            generated={!!docs.childAssent}
            content={docs.childAssent}
            onGenerate={() => generate('childAssent', generateChildAssentForm)}
            onGenerateDocx={docxFns.childAssent}
          />
        )}

        {/* Debriefing Script */}
        {hasDeception && (
          <DocCard
            title="Debriefing Script"
            description="8-step verbal script the researcher reads to each participant immediately after participation to reveal the study's true purpose."
            variant="primary"
            generated={!!docs.debriefing}
            content={docs.debriefing}
            onGenerate={() => generate('debriefing', generateDebriefingScript)}
            onGenerateDocx={docxFns.debriefing}
          />
        )}

        {/* HIPAA Authorization */}
        {hasHIPAA && (
          <DocCard
            title="HIPAA Authorization Form"
            description="Authorization for use and disclosure of Protected Health Information per 45 CFR § 164.508 with all required elements."
            variant="secondary"
            generated={!!docs.hipaa}
            content={docs.hipaa}
            onGenerate={() => generate('hipaa', generateHIPAAAuthorization)}
            onGenerateDocx={docxFns.hipaa}
          />
        )}

        {/* Placeholder if no participant docs triggered yet */}
        {!isExempt && !needsFullConsent && !hasMinors && !hasDeception && !hasHIPAA && (
          <InfoBox variant="tip" title="Participant Documents">
            Additional documents (parental permission, child assent, debriefing script, HIPAA authorization) will appear here automatically based on your study characteristics from earlier steps.
          </InfoBox>
        )}
      </DocSection>

      {/* ── C. Recruitment Materials ───────────────────────────────────────── */}
      <DocSection
        label="C. Recruitment Materials"
        color="violet"
        onGenerateAll={() => generateSection(recruitmentKeys)}
      >
        <DocCard
          title="Recruitment Email Template"
          description="Ready-to-send email invitation with study description, eligibility criteria, time commitment, compensation, and IRB approval notice."
          variant="violet"
          generated={!!docs.recruitEmail}
          content={docs.recruitEmail}
          onGenerate={() => generate('recruitEmail', generateRecruitmentEmail)}
          onGenerateDocx={docxFns.recruitEmail}
        />
        <DocCard
          title="Recruitment Flyer / Advertisement"
          description="Print-ready flyer template with eligibility, study details, compensation, and contact information. Add your QR code or survey link."
          variant="violet"
          generated={!!docs.recruitFlyer}
          content={docs.recruitFlyer}
          onGenerate={() => generate('recruitFlyer', generateRecruitmentFlyer)}
          onGenerateDocx={docxFns.recruitFlyer}
        />
        {hasClassAnnounce && (
          <DocCard
            title="Class Announcement Script"
            description="~60-second verbatim verbal script for in-class recruitment with voluntariness language, IRB compliance reminders, and post-announcement checklist."
            variant="violet"
            generated={!!docs.classAnnouncement}
            content={docs.classAnnouncement}
            onGenerate={() => generate('classAnnouncement', generateClassAnnouncement)}
            onGenerateDocx={docxFns.classAnnouncement}
          />
        )}
        {hasSocialMedia && (
          <DocCard
            title="Social Media Post Templates"
            description="Three platform variants: LinkedIn/Facebook long-form, Twitter/X (≤280 chars), and Instagram caption — each with hashtag placeholders and IRB approval note."
            variant="violet"
            generated={!!docs.socialMedia}
            content={docs.socialMedia}
            onGenerate={() => generate('socialMedia', generateSocialMediaPost)}
            onGenerateDocx={docxFns.socialMedia}
          />
        )}
        {!hasClassAnnounce && !hasSocialMedia && (
          <InfoBox variant="info" title="More Recruitment Templates Available">
            Add <strong>Class Announcement</strong> or <strong>Social Media</strong> to your recruitment methods in Step 4 (Subjects) to unlock those templates here.
          </InfoBox>
        )}
      </DocSection>

      {/* ── Submission checklist ───────────────────────────────────────────── */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
          Submission Checklist
        </h3>
        <div className="flex flex-col gap-2">
          {checklist.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.done === true  ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
               : item.done === false ? <AlertCircle  size={16} className="text-red-400 shrink-0" />
               : <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />}
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

      {/* Not research / no human subjects */}
      {(type === REVIEW_TYPES.NOT_RESEARCH || type === REVIEW_TYPES.NOT_HUMAN_SUBJECTS) && (
        <InfoBox variant="success" title="No IRB Submission Required">
          Based on your answers, IRB review may not be required for this activity. Before proceeding,
          confirm with the IRB administrator (irb@bridgeport.edu) that your activity falls outside
          the definition of human subjects research.
        </InfoBox>
      )}

      {/* ── Submission instructions ────────────────────────────────────────── */}
      <InfoBox variant="info" title="How to Submit in Mentor IRB">
        <ol className="mt-1 list-decimal list-inside text-xs space-y-1">
          <li>Log into Mentor IRB and click <strong>My Protocols → Create New Protocol</strong></li>
          <li>Complete online form fields (title, dates, review type, number of subjects)</li>
          <li>Upload your Protocol Description and Consent Form via <strong>Upload Docs</strong></li>
          <li>Upload recruitment materials, instruments, and CITI certificates</li>
          <li>Complete all <strong>Application Sections</strong> (red asterisk = required)</li>
          <li>Obtain your Faculty Advisor's electronic signature</li>
          <li>Click <strong>Submit Protocol for Review</strong></li>
          <li>⚠️ Do NOT begin research until you receive written IRB approval</li>
        </ol>
      </InfoBox>

      <InfoBox variant="tip" title="Need Help?">
        <ul className="mt-1 list-disc list-inside text-xs space-y-1">
          <li>IRB Administrator: <strong>irb@bridgeport.edu</strong></li>
          <li>IRB Phone: (203) 576-4974</li>
          <li>Mentor IRB system: Access via the IRB tab in myUB</li>
          <li>UB Research Compliance: Check myUB portal for IRB Chair and Administrator contacts</li>
        </ul>
      </InfoBox>

      </CreditGate>
    </div>
  );
}
