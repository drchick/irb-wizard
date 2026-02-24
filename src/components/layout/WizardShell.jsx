import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWizard, STEPS } from '../../context/WizardContext';
import { useAuth } from '../../context/AuthContext';
import { StepNav } from './StepNav';
import { ReviewBadge } from './ReviewBadge';
import IRBWizLogo from './IRBWizLogo';
import Footer from './Footer';
import { IssueList } from '../ui/InfoBox';
import { getIssueCount } from '../../utils/consistencyChecker';
import { getMissingFields } from '../../utils/stepRequirements';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

// Step components (lazy import pattern)
import Step01 from '../../steps/Step01_Prescreening';
import Step02 from '../../steps/Step02_ResearcherInfo';
import Step03 from '../../steps/Step03_StudyOverview';
import Step04 from '../../steps/Step04_Subjects';
import Step05 from '../../steps/Step05_Procedures';
import Step06 from '../../steps/Step06_RiskSafety';
import Step07 from '../../steps/Step07_DataPrivacy';
import Step08 from '../../steps/Step08_InformedConsent';
import Step09 from '../../steps/Step09_ReviewDetermination';
import Step10 from '../../steps/Step10_DocumentGenerator';

const STEP_COMPONENTS = {
  1: Step01, 2: Step02, 3: Step03, 4: Step04, 5: Step05,
  6: Step06, 7: Step07, 8: Step08, 9: Step09, 10: Step10,
};

export function WizardShell() {
  const { currentStep, nextStep, prevStep, reviewResult, consistencyIssues, formData } = useWizard();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const StepComponent = STEP_COMPONENTS[currentStep];
  const errors   = getIssueCount(consistencyIssues, 'error');
  const warnings = getIssueCount(consistencyIssues, 'warning');
  const currentStepMeta = STEPS.find(s => s.id === currentStep);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  // ── Step completion soft warning ─────────────────────────────────────────
  const [pendingWarning, setPendingWarning] = useState(null);

  // Auto-clear warning when user navigates via sidebar
  useEffect(() => { setPendingWarning(null); }, [currentStep]);

  const handleContinue = () => {
    const missing = getMissingFields(currentStep, formData);
    if (missing.length > 0 && !pendingWarning) {
      setPendingWarning(missing);   // show warning; don't advance yet
    } else {
      setPendingWarning(null);
      nextStep();                   // second click, or already warned → proceed
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* ── Top Header ── */}
      <header className="bg-navy-800 text-white shadow-md no-print">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IRBWizLogo size={36} variant="full" theme="dark" />
          </div>
          <div className="flex items-center gap-3">
            {errors > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold bg-red-600 text-white px-2.5 py-1 rounded-full">
                <AlertCircle size={13} /> {errors} {errors === 1 ? 'Error' : 'Errors'}
              </span>
            )}
            {warnings > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold bg-amber-500 text-white px-2.5 py-1 rounded-full">
                <AlertTriangle size={13} /> {warnings} {warnings === 1 ? 'Warning' : 'Warnings'}
              </span>
            )}
            <ReviewBadge type={reviewResult.type} compact />

            {/* User avatar + sign out */}
            {user && (
              <div className="flex items-center gap-2 ml-1 pl-3 border-l border-navy-600">
                {user.user_metadata?.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata?.full_name || 'User'}
                    className="w-7 h-7 rounded-full border border-navy-500"
                  />
                )}
                <span className="text-xs text-slate-300 hidden sm:block max-w-[120px] truncate">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-slate-400 hover:text-white transition-colors ml-0.5"
                  title="Sign out"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 py-6 gap-6">
        {/* ── Sidebar nav ── */}
        <aside className="w-52 shrink-0 no-print">
          <StepNav />
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0">
          {/* Step title bar */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider">
                Step {currentStep} of {STEPS.length}
              </p>
              <h2 className="text-xl font-bold text-navy-900">{currentStepMeta?.title}</h2>
            </div>
          </div>

          {/* Active consistency issues for this step */}
          {consistencyIssues.filter(i => i.section === currentStepMeta?.key).length > 0 && (
            <div className="mb-4">
              <IssueList issues={consistencyIssues.filter(i => i.section === currentStepMeta?.key)} />
            </div>
          )}

          {/* Form card */}
          <div className="card p-6 mb-6">
            <StepComponent />
          </div>

          {/* Step completion warning banner */}
          {pendingWarning && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 mb-4 no-print">
              <p className="font-semibold text-amber-800 text-sm flex items-center gap-1.5">
                <AlertTriangle size={15} className="shrink-0" />
                Before you continue, consider completing:
              </p>
              <ul className="mt-2 ml-5 list-disc text-sm text-amber-700 space-y-0.5">
                {pendingWarning.map(({ label }) => (
                  <li key={label}>{label}</li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <button
                  className="btn-secondary text-sm"
                  onClick={() => setPendingWarning(null)}
                >
                  ← Stay on this step
                </button>
                <button
                  className="btn-primary text-sm"
                  onClick={() => { setPendingWarning(null); nextStep(); }}
                >
                  Continue anyway →
                </button>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between no-print">
            <button
              className="btn-secondary"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              ← Back
            </button>
            <span className="text-xs text-slate-400">
              {currentStep < STEPS.length
                ? `Next: ${STEPS[currentStep]?.title}`
                : 'Last step'}
            </span>
            {currentStep < STEPS.length ? (
              <button className="btn-primary" onClick={handleContinue}>
                Continue →
              </button>
            ) : (
              <span className="text-sm font-semibold text-emerald-600">✓ Wizard Complete</span>
            )}
          </div>
        </main>

        {/* ── Right panel: Review + All Issues ── */}
        <aside className="w-64 shrink-0 flex flex-col gap-4 no-print">
          <ReviewPanel result={reviewResult} />
          {consistencyIssues.length > 0 && (
            <div className="card p-4">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                All Issues ({consistencyIssues.length})
              </h3>
              <IssueList issues={consistencyIssues} />
            </div>
          )}
        </aside>
      </div>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}

// ── Review Panel ─────────────────────────────────────────────────────────────
function ReviewPanel({ result }) {
  const { type, category, categoryLabel, reasons, confidence } = result;
  const colorMap = {
    EXEMPT:             { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', label: 'Exempt Review', sub: 'text-emerald-700' },
    EXPEDITED:          { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-900',   label: 'Expedited Review', sub: 'text-amber-700' },
    FULL_BOARD:         { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-900',     label: 'Full Board Review', sub: 'text-red-700' },
    NOT_RESEARCH:       { bg: 'bg-slate-50',   border: 'border-slate-200',   text: 'text-slate-900',   label: 'Not Research', sub: 'text-slate-600' },
    NOT_HUMAN_SUBJECTS: { bg: 'bg-slate-50',   border: 'border-slate-200',   text: 'text-slate-900',   label: 'No Human Subjects', sub: 'text-slate-600' },
    INSUFFICIENT_INFO:  { bg: 'bg-slate-50',   border: 'border-slate-200',   text: 'text-slate-600',   label: 'Pending...', sub: 'text-slate-500' },
  };
  const c = colorMap[type] || colorMap.INSUFFICIENT_INFO;

  return (
    <div className={clsx('rounded-xl border p-4', c.bg, c.border)}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Review Determination</h3>
      <p className={clsx('text-base font-bold', c.text)}>{c.label}</p>
      {categoryLabel && <p className={clsx('text-xs mt-0.5', c.sub)}>{categoryLabel}</p>}
      {confidence > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-slate-200">
            <div
              className={clsx('h-1.5 rounded-full', type === 'EXEMPT' ? 'bg-emerald-500' : type === 'EXPEDITED' ? 'bg-amber-500' : 'bg-red-500')}
              style={{ width: `${Math.round(confidence * 100)}%` }}
            />
          </div>
          <span className="text-xs text-slate-400">{Math.round(confidence * 100)}%</span>
        </div>
      )}
      <ul className="mt-3 flex flex-col gap-1.5">
        {(reasons || []).slice(0, 3).map((r, i) => (
          <li key={i} className={clsx('text-xs leading-relaxed', c.sub)}>• {r}</li>
        ))}
      </ul>
    </div>
  );
}
