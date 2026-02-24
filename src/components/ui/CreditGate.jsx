/**
 * CreditGate — wraps content that requires at least 1 credit.
 *
 * Props:
 *   credits  — number | null  (from useCredits)
 *   loading  — boolean
 *   feature  — string describing what's gated (shown in locked state)
 *   children — the content to show when unlocked
 */
import Link from 'next/link';
import { Lock, Zap } from 'lucide-react';

export function CreditGate({ credits, loading, feature, children }) {
  // While loading, show a subtle skeleton
  if (loading) {
    return (
      <div className="animate-pulse rounded-xl bg-navy-800/50 border border-navy-700 h-48 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-gold-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Unlocked — show children normally
  if (credits !== null && credits > 0) return <>{children}</>;

  // Locked state
  return (
    <div className="relative rounded-xl overflow-hidden border border-navy-700">
      {/* Blurred preview */}
      <div className="opacity-10 pointer-events-none select-none blur-sm">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy-900/90 backdrop-blur-sm p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mb-4">
          <Lock size={24} className="text-gold-400" />
        </div>
        <h3 className="text-white font-bold text-lg mb-1">1 Credit Required</h3>
        <p className="text-slate-400 text-sm max-w-xs leading-relaxed mb-5">{feature}</p>
        <Link
          href="/account#credits"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Zap size={14} /> Buy Credits
        </Link>
        <p className="text-slate-600 text-xs mt-3">
          From $9 · credits never expire
        </p>
      </div>
    </div>
  );
}
