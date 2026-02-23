import { useState } from 'react';
import clsx from 'clsx';
import {
  Sparkles, X, ChevronRight, ChevronDown,
  ShieldCheck, ShieldAlert, Shield, HelpCircle,
  AlertCircle, AlertTriangle, Info,
} from 'lucide-react';

// ── Review suggestion badge ───────────────────────────────────────────────────
const SUGGESTION_CONFIG = {
  EXEMPT:           { label: 'Exempt Review',     cls: 'badge-exempt',    Icon: ShieldCheck  },
  EXPEDITED:        { label: 'Expedited Review',  cls: 'badge-expedited', Icon: ShieldAlert  },
  FULL_BOARD:       { label: 'Full Board Review', cls: 'badge-full',      Icon: Shield       },
  CANNOT_DETERMINE: { label: 'Cannot Determine',  cls: 'badge-unknown',   Icon: HelpCircle   },
};

function AISuggestionBadge({ suggestion }) {
  const cfg = SUGGESTION_CONFIG[suggestion] || SUGGESTION_CONFIG.CANNOT_DETERMINE;
  return (
    <span className={cfg.cls}>
      <cfg.Icon size={12} />
      AI Suggests: {cfg.label}
    </span>
  );
}

// ── Confidence bar ────────────────────────────────────────────────────────────
function ConfidenceBar({ confidence }) {
  const pct = Math.round((confidence || 0) * 100);
  const color = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-slate-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-200">
        <div className={clsx('h-1.5 rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 tabular-nums">{pct}% confidence</span>
    </div>
  );
}

// ── Importance dot ────────────────────────────────────────────────────────────
const IMPORTANCE_DOT = {
  high:   'bg-red-500',
  medium: 'bg-amber-400',
  low:    'bg-blue-400',
};
const IMPORTANCE_LABEL = {
  high:   'text-red-600',
  medium: 'text-amber-600',
  low:    'text-blue-500',
};

// ── Individual clarifying question ───────────────────────────────────────────
function QuestionItem({ index, question, why, importance }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-lg p-3 bg-white">
      <div className="flex items-start gap-2">
        <span className={clsx('w-2.5 h-2.5 rounded-full shrink-0 mt-1.5', IMPORTANCE_DOT[importance] || 'bg-slate-300')} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-800 leading-snug">
            <span className="font-semibold text-slate-500 mr-1">{index + 1}.</span>
            {question}
          </p>
          {why && (
            <button
              onClick={() => setOpen(v => !v)}
              className="mt-1 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition"
            >
              {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              Why this matters
            </button>
          )}
          {open && why && (
            <p className="mt-1 text-xs text-slate-500 leading-relaxed pl-1 border-l-2 border-slate-200">
              {why}
            </p>
          )}
        </div>
        <span className={clsx('text-xs font-semibold shrink-0 capitalize', IMPORTANCE_LABEL[importance] || 'text-slate-400')}>
          {importance}
        </span>
      </div>
    </div>
  );
}

// ── Flags list ────────────────────────────────────────────────────────────────
const FLAG_CONFIG = {
  error:   { Icon: AlertCircle,   cls: 'bg-red-50 border-red-200 text-red-800',   iconCls: 'text-red-500'   },
  warning: { Icon: AlertTriangle, cls: 'bg-amber-50 border-amber-200 text-amber-800', iconCls: 'text-amber-500' },
  info:    { Icon: Info,          cls: 'bg-blue-50 border-blue-200 text-blue-800',  iconCls: 'text-blue-500'  },
};

function FlagItem({ severity, message }) {
  const cfg = FLAG_CONFIG[severity] || FLAG_CONFIG.info;
  return (
    <div className={clsx('flex items-start gap-2 rounded-lg border px-3 py-2 text-sm', cfg.cls)}>
      <cfg.Icon size={15} className={clsx('shrink-0 mt-0.5', cfg.iconCls)} />
      <span>{message}</span>
    </div>
  );
}

// ── Main AIReviewPanel ────────────────────────────────────────────────────────
export function AIReviewPanel({ result, loading, error, onClear }) {
  if (!loading && !result && !error) return null;

  return (
    <div className="border border-navy-200 rounded-xl shadow-sm overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-navy-50 border-b border-navy-200">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-navy-600" />
          <span className="text-sm font-bold text-navy-800">AI Pre-Review Result</span>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="text-slate-400 hover:text-slate-600 transition"
            aria-label="Dismiss AI review"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="p-4">
        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 py-3">
            <div className="w-5 h-5 rounded-full border-2 border-navy-300 border-t-navy-600 animate-spin shrink-0" />
            <div>
              <p className="text-sm font-medium text-navy-800">AI reviewer is reading your protocol…</p>
              <p className="text-xs text-slate-500 mt-0.5">This usually takes 5–15 seconds.</p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800">AI Review Unavailable</p>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {!loading && result && (
          <div className="flex flex-col gap-4">
            {/* Suggestion + confidence */}
            <div className="flex flex-col gap-2">
              <AISuggestionBadge suggestion={result.reviewSuggestion} />
              <ConfidenceBar confidence={result.confidence} />
            </div>

            {/* Reasoning */}
            {result.reasoning && (
              <p className="text-sm text-slate-700 leading-relaxed">{result.reasoning}</p>
            )}

            {/* Reviewer notes */}
            {result.reviewerNotes && (
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Reviewer Notes</p>
                <p className="text-sm text-slate-700 leading-relaxed">{result.reviewerNotes}</p>
              </div>
            )}

            {/* Clarifying questions */}
            {result.clarifyingQuestions?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Clarifying Questions ({result.clarifyingQuestions.length})
                </p>
                <div className="flex flex-col gap-2">
                  {result.clarifyingQuestions.map((q, i) => (
                    <QuestionItem key={i} index={i} {...q} />
                  ))}
                </div>
              </div>
            )}

            {/* Flags */}
            {result.flags?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Reviewer Flags ({result.flags.length})
                </p>
                <div className="flex flex-col gap-2">
                  {result.flags.map((f, i) => (
                    <FlagItem key={i} {...f} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
