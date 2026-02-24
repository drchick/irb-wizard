import { useWizard } from '../context/WizardContext';
import { REVIEW_TYPES } from '../utils/reviewClassifier';
import { IssueList, InfoBox } from '../components/ui/InfoBox';
import { SectionHeader } from '../components/ui/FormField';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Lightbulb, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';
import { useAIReview } from '../hooks/useAIReview';
import { AIReviewPanel } from '../components/ui/AIReviewPanel';
import { ReviewBadge } from '../components/layout/ReviewBadge';
import { useCredits } from '../hooks/useCredits';
import { CreditGate } from '../components/ui/CreditGate';

const REVIEW_CONFIG = {
  [REVIEW_TYPES.EXEMPT]: {
    label: 'Exempt Review',
    color: 'bg-emerald-600',
    lightBg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-900',
    subtext: 'text-emerald-700',
    Icon: CheckCircle2,
    description: 'Exempt research still requires IRB review and determination — it is NOT exempt from the IRB process. The IRB (not the investigator) makes the final determination of exempt status.',
    timeframe: 'Typically 1–2 weeks for initial review',
    attachments: ['Protocol description', 'Exempt consent information sheet (no signature required)', 'Recruitment materials', 'Survey/interview instruments'],
  },
  [REVIEW_TYPES.EXPEDITED]: {
    label: 'Expedited Review',
    color: 'bg-amber-600',
    lightBg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-900',
    subtext: 'text-amber-700',
    Icon: AlertTriangle,
    description: 'Expedited review is conducted by the IRB Chair or designated reviewer (not the full board). Approval can be faster than full board review.',
    timeframe: 'Typically 2–4 weeks',
    attachments: ['Protocol description', 'Full informed consent form (with signatures)', 'Recruitment materials', 'Survey/interview instruments', 'Data collection tools', 'CITI certificates for all investigators'],
  },
  [REVIEW_TYPES.FULL_BOARD]: {
    label: 'Full Board Review',
    color: 'bg-red-600',
    lightBg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-900',
    subtext: 'text-red-700',
    Icon: AlertCircle,
    description: 'Full Board review requires review by a quorum of the full IRB committee at a scheduled meeting. This provides the most thorough review for higher-risk research.',
    timeframe: 'Typically 4–8 weeks (dependent on meeting schedule)',
    attachments: [
      'Protocol description (detailed)',
      'Full informed consent form (with signatures)',
      'Parental permission form (if children)',
      'Child assent form (if applicable)',
      'Recruitment materials',
      'Survey/interview instruments',
      'Data collection tools',
      'CITI certificates for all investigators',
      'Site authorization letter (if applicable)',
      'Adverse event monitoring plan',
      'DSMB charter (if applicable)',
    ],
  },
  [REVIEW_TYPES.NOT_RESEARCH]: {
    label: 'IRB Review Not Required',
    color: 'bg-slate-600',
    lightBg: 'bg-slate-50',
    border: 'border-slate-300',
    text: 'text-slate-900',
    subtext: 'text-slate-600',
    Icon: CheckCircle2,
    description: 'Based on your answers, this activity does not meet the federal definition of research. IRB review is not required.',
    timeframe: 'N/A',
    attachments: [],
  },
  [REVIEW_TYPES.NOT_HUMAN_SUBJECTS]: {
    label: 'IRB Review Not Required',
    color: 'bg-slate-600',
    lightBg: 'bg-slate-50',
    border: 'border-slate-300',
    text: 'text-slate-900',
    subtext: 'text-slate-600',
    Icon: CheckCircle2,
    description: 'Based on your answers, this research does not involve human subjects as defined by federal regulations. IRB review may not be required.',
    timeframe: 'N/A',
    attachments: [],
  },
  [REVIEW_TYPES.INSUFFICIENT_INFO]: {
    label: 'More Information Needed',
    color: 'bg-slate-400',
    lightBg: 'bg-slate-50',
    border: 'border-slate-300',
    text: 'text-slate-700',
    subtext: 'text-slate-500',
    Icon: Info,
    description: 'Complete the earlier sections to receive a review type determination.',
    timeframe: 'N/A',
    attachments: [],
  },
};

function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 text-left transition"
      >
        <span className="text-sm font-semibold text-slate-700">{title}</span>
        {open ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />}
      </button>
      {open && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
}

const RECOMMENDATION_ICONS = {
  expedite:    { Icon: Lightbulb,    color: 'text-gold-600' },
  compliance:  { Icon: CheckCircle2, color: 'text-navy-600' },
  protection:  { Icon: AlertTriangle,color: 'text-amber-600' },
  consistency: { Icon: Info,         color: 'text-blue-600' },
};

const PRIORITY_LABELS = {
  high:   { label: 'High Priority', cls: 'bg-red-100 text-red-700' },
  medium: { label: 'Medium',        cls: 'bg-amber-100 text-amber-700' },
  low:    { label: 'Low',           cls: 'bg-slate-100 text-slate-600' },
};

export default function Step09_ReviewDetermination() {
  const { reviewResult, consistencyIssues, formData } = useWizard();
  const { type, category, categoryLabel, reasons, recommendations, confidence, flags } = reviewResult;
  const config = REVIEW_CONFIG[type] || REVIEW_CONFIG[REVIEW_TYPES.INSUFFICIENT_INFO];
  const { Icon } = config;

  const errors   = consistencyIssues.filter(i => i.severity === 'error');
  const warnings = consistencyIssues.filter(i => i.severity === 'warning');

  const { analyze: runAI, loading: aiLoading, result: aiResult, error: aiError, clear: clearAI } = useAIReview();
  const { credits, loading: creditsLoading, deduct: deductCredit } = useCredits();

  // Run AI and deduct 1 credit
  const handleRunAI = async () => {
    if (aiResult) { runAI('comprehensive', formData, { rulesBased: reviewResult }); return; }
    try {
      await deductCredit();
      // Set unlock flag so Step 10 documents are also unlocked
      if (typeof window !== 'undefined') {
        localStorage.setItem('irbwiz_protocol_unlocked', 'true');
      }
      runAI('comprehensive', formData, { rulesBased: reviewResult });
    } catch (err) {
      // Insufficient credits — CreditGate UI handles this
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Review Determination"
        description="Based on your answers, here is the recommended IRB review level, required attachments, and recommendations for a successful submission."
      />

      {/* Main determination card */}
      <div className={clsx('rounded-xl border-2 p-6', config.lightBg, config.border)}>
        <div className="flex items-start gap-4">
          <div className={clsx('rounded-full p-2.5', config.color)}>
            <Icon size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-3">
              <h3 className={clsx('text-xl font-bold', config.text)}>{config.label}</h3>
              {categoryLabel && (
                <span className={clsx('text-sm font-semibold', config.subtext)}>— {categoryLabel}</span>
              )}
            </div>
            {confidence > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-32 h-1.5 rounded-full bg-white/50">
                  <div
                    className={clsx('h-1.5 rounded-full', config.color)}
                    style={{ width: `${Math.round(confidence * 100)}%` }}
                  />
                </div>
                <span className={clsx('text-xs', config.subtext)}>
                  {Math.round(confidence * 100)}% confidence based on answers provided
                </span>
              </div>
            )}
            <p className={clsx('mt-2 text-sm leading-relaxed', config.subtext)}>{config.description}</p>
            {config.timeframe !== 'N/A' && (
              <p className={clsx('mt-1 text-xs font-semibold', config.subtext)}>
                Typical review timeframe: {config.timeframe}
              </p>
            )}
          </div>
        </div>

        {/* Reasons */}
        {reasons && reasons.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/40">
            <p className={clsx('text-xs font-bold uppercase tracking-wider mb-2', config.subtext)}>Determination Basis:</p>
            <ul className="flex flex-col gap-1">
              {reasons.map((r, i) => (
                <li key={i} className={clsx('text-xs leading-relaxed flex gap-2', config.subtext)}>
                  <span className="shrink-0">•</span><span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Flags */}
      {flags && flags.length > 0 && (
        <CollapsibleSection title={`Review Flags (${flags.length})`} defaultOpen>
          <div className="flex flex-col gap-2">
            {flags.map((flag, i) => (
              <div
                key={i}
                className={clsx(
                  'rounded-lg border p-3 text-sm',
                  flag.severity === 'high'   && 'bg-red-50 border-red-200 text-red-800',
                  flag.severity === 'medium' && 'bg-amber-50 border-amber-200 text-amber-800',
                  flag.severity === 'low'    && 'bg-blue-50 border-blue-200 text-blue-800',
                )}
              >
                {flag.message}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Consistency issues */}
      {(errors.length > 0 || warnings.length > 0) && (
        <CollapsibleSection title={`Issues to Resolve Before Submitting (${consistencyIssues.length})`} defaultOpen={errors.length > 0}>
          {errors.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">Errors — Must Fix</p>
              <IssueList issues={errors} />
            </div>
          )}
          {warnings.length > 0 && (
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Warnings — Review</p>
              <IssueList issues={warnings} />
            </div>
          )}
        </CollapsibleSection>
      )}

      {consistencyIssues.length === 0 && (
        <InfoBox variant="success" title="No Issues Detected">
          The wizard found no consistency errors or warnings in your responses. Your protocol appears
          internally consistent and ready for document generation.
        </InfoBox>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <CollapsibleSection title={`Recommendations (${recommendations.length})`} defaultOpen>
          <div className="flex flex-col gap-3">
            {recommendations.map((rec, i) => {
              const { Icon: RIcon, color } = RECOMMENDATION_ICONS[rec.type] || RECOMMENDATION_ICONS.compliance;
              const priorityStyle = PRIORITY_LABELS[rec.priority] || PRIORITY_LABELS.low;
              return (
                <div key={i} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <RIcon size={18} className={clsx('shrink-0 mt-0.5', color)} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-slate-800">{rec.title}</p>
                      <span className={clsx('text-xs font-semibold rounded-full px-2 py-0.5', priorityStyle.cls)}>
                        {priorityStyle.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rec.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* Required attachments */}
      {config.attachments.length > 0 && (
        <CollapsibleSection title="Required Documents & Attachments" defaultOpen>
          <p className="text-xs text-slate-500 mb-3">
            Submit all of the following with your IRB application. Use the Document Generator (Step 10) to
            create the consent form and protocol description templates.
          </p>
          <ul className="flex flex-col gap-1.5">
            {config.attachments.map((att, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                {att}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Submission tips */}
      <InfoBox variant="tip" title="Tips for a Smooth Review">
        <ul className="mt-1 list-disc list-inside text-xs space-y-1">
          <li>Number consistency: ensure participant counts match across all documents</li>
          <li>Verify CITI training is current for ALL team members before submitting</li>
          <li>Upload recruitment materials (flyers, emails, scripts) in their exact form</li>
          <li>If collecting audio/video, include a separate recording consent section</li>
          <li>Use the UB IRB email (<strong>irb@bridgeport.edu</strong>) for questions before submission</li>
          <li>Do NOT begin research until you receive written IRB approval</li>
        </ul>
      </InfoBox>

      {/* ── Full AI Protocol Assessment ──────────────────────────────────── */}
      <CreditGate
        credits={credits}
        loading={creditsLoading}
        feature="Run a full AI protocol assessment powered by Claude — acts as an IRB pre-reviewer across all your narratives."
      >
        <div className="border-2 border-dashed border-navy-200 rounded-xl p-5 bg-navy-50">
          <div className="flex items-start gap-3 mb-4">
            <Sparkles size={20} className="text-navy-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-navy-800">Full AI Protocol Assessment</p>
              <p className="text-xs text-navy-600 mt-0.5">
                Claude reviews all your narratives holistically — acting as an IRB pre-reviewer.
                Results are advisory only and do not replace official IRB review.
              </p>
            </div>
          </div>

          {!aiResult && !aiLoading && !aiError && (
            <button
              className="btn-primary"
              onClick={handleRunAI}
            >
              <Sparkles size={14} />
              Run Full AI Assessment
            </button>
          )}

          {(aiLoading || aiResult || aiError) && (
            <AIReviewPanel
              result={aiResult}
              loading={aiLoading}
              error={aiError}
              onClear={clearAI}
            />
          )}

          {/* Re-run button */}
          {(aiResult || aiError) && !aiLoading && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-navy-200">
              <button onClick={clearAI} className="btn-secondary text-xs px-3 py-1.5">Clear</button>
              <button
                onClick={() => runAI('comprehensive', formData, { rulesBased: reviewResult })}
                className="btn-primary text-xs px-3 py-1.5"
              >
                <Sparkles size={12} />
                Re-run Assessment
              </button>
            </div>
          )}

          {/* AI vs. rules-based comparison */}
          {aiResult && (
            <div className="mt-4 pt-4 border-t border-navy-200">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                AI vs. Rules-Based Comparison
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500 font-semibold mb-2">Rules-Based Engine</p>
                  <ReviewBadge type={type} compact />
                  <p className="text-xs text-slate-400 mt-1.5">
                    {Math.round((confidence || 0) * 100)}% confidence
                  </p>
                </div>
                <div className="rounded-lg border border-navy-200 bg-white p-3">
                  <p className="text-xs text-navy-600 font-semibold mb-2">AI Assessment</p>
                  <ReviewBadge type={aiResult.reviewSuggestion} compact />
                  <p className="text-xs text-slate-400 mt-1.5">
                    {Math.round((aiResult.confidence || 0) * 100)}% confidence
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CreditGate>
    </div>
  );
}
