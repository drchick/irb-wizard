import { useWizard, STEPS } from '../../context/WizardContext';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import clsx from 'clsx';
import { getIssueCount } from '../../utils/consistencyChecker';

export function StepNav() {
  const { currentStep, visitedSteps, goToStep, consistencyIssues } = useWizard();

  return (
    <nav className="flex flex-col gap-1">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Progress</p>
      {STEPS.map(step => {
        const isActive  = step.id === currentStep;
        const isVisited = visitedSteps.has(step.id);
        const stepIssues = consistencyIssues.filter(i => i.section === step.key);
        const hasErrors  = stepIssues.some(i => i.severity === 'error');
        const hasWarnings = stepIssues.some(i => i.severity === 'warning');

        return (
          <button
            key={step.id}
            onClick={() => goToStep(step.id)}
            className={clsx(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition w-full',
              isActive  && 'bg-navy-700 text-white shadow-sm',
              !isActive && isVisited && 'text-slate-700 hover:bg-slate-100',
              !isActive && !isVisited && 'text-slate-400 hover:bg-slate-100',
            )}
          >
            {/* Step indicator */}
            <span className="shrink-0">
              {isActive ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-navy-700 text-xs font-bold">
                  {step.id}
                </span>
              ) : isVisited ? (
                hasErrors ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-bold">!</span>
                ) : hasWarnings ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xs font-bold">~</span>
                ) : (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                )
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-slate-400 text-xs">
                  {step.id}
                </span>
              )}
            </span>

            {/* Label */}
            <span className={clsx('text-sm font-medium truncate', isActive && 'text-white font-semibold')}>
              {step.short}
            </span>

            {/* Issue count badge */}
            {!isActive && stepIssues.length > 0 && (
              <span className={clsx(
                'ml-auto text-xs font-bold rounded-full px-1.5 py-0.5 shrink-0',
                hasErrors ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
              )}>
                {stepIssues.length}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
