/**
 * account.jsx — User dashboard
 * Shows: profile info, AI credits used, past protocols (from localStorage)
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import IRBWizLogo from '../components/layout/IRBWizLogo';
import {
  UserCircle, Mail, Shield, LogOut, ArrowLeft,
  FileText, Zap, Clock, ChevronRight, Trash2, AlertCircle,
} from 'lucide-react';

// ── helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

// ── Saved protocols from localStorage ────────────────────────────────────────
const STORAGE_KEY = 'irb_wizard_saved_protocols';

function getSavedProtocols() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch { return []; }
}

function deleteProtocol(id) {
  const protocols = getSavedProtocols().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(protocols));
}

// ── Review type badge ─────────────────────────────────────────────────────────
const REVIEW_COLORS = {
  EXEMPT:             'bg-emerald-900/50 text-emerald-300 border-emerald-700',
  EXPEDITED:          'bg-amber-900/50 text-amber-300 border-amber-700',
  FULL_BOARD:         'bg-red-900/50 text-red-300 border-red-700',
  NOT_RESEARCH:       'bg-slate-700 text-slate-300 border-slate-600',
  NOT_HUMAN_SUBJECTS: 'bg-slate-700 text-slate-300 border-slate-600',
  INSUFFICIENT_INFO:  'bg-slate-700 text-slate-400 border-slate-600',
};
const REVIEW_LABELS = {
  EXEMPT: 'Exempt', EXPEDITED: 'Expedited', FULL_BOARD: 'Full Board',
  NOT_RESEARCH: 'Not Research', NOT_HUMAN_SUBJECTS: 'No Human Subjects',
  INSUFFICIENT_INFO: 'Pending',
};

function ReviewBadge({ type }) {
  const cls = REVIEW_COLORS[type] ?? REVIEW_COLORS.INSUFFICIENT_INFO;
  const lbl = REVIEW_LABELS[type] ?? type;
  return (
    <span className={`px-2 py-0.5 rounded border text-xs font-medium ${cls}`}>{lbl}</span>
  );
}

// ── Dashboard content ─────────────────────────────────────────────────────────
function AccountDashboard() {
  const { user, signOut, isAdmin } = useAuth();
  const router = useRouter();
  const [protocols, setProtocols] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { setProtocols(getSavedProtocols()); }, []);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  const handleDelete = (id) => {
    deleteProtocol(id);
    setProtocols(getSavedProtocols());
    setDeleteConfirm(null);
  };

  const provider = user?.app_metadata?.provider ?? 'email';
  const name     = user?.user_metadata?.full_name || '—';
  const avatar   = user?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-navy-900 text-white">

      {/* ── Header ── */}
      <header className="bg-navy-800 border-b border-navy-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IRBWizLogo size={32} variant="full" theme="dark" />
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link href="/admin"
              className="text-xs text-gold-400 hover:text-gold-300 font-medium transition-colors">
              Admin Panel →
            </Link>
          )}
          <button onClick={handleSignOut}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* ── Back to Wizard ── */}
        <Link href="/wizard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={14} /> Back to Wizard
        </Link>

        {/* ── Profile card ── */}
        <section className="bg-navy-800 rounded-2xl border border-navy-700 p-6">
          <h1 className="text-lg font-bold text-white mb-5">My Account</h1>
          <div className="flex items-start gap-5">
            {avatar
              ? <img src={avatar} alt={name} className="w-16 h-16 rounded-full border-2 border-navy-600 shrink-0" />
              : <div className="w-16 h-16 rounded-full bg-navy-700 border-2 border-navy-600 flex items-center justify-center shrink-0">
                  <UserCircle size={36} className="text-slate-500" />
                </div>
            }
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <UserCircle size={15} className="text-slate-500 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Name</p>
                  <p className="text-sm text-white">{name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={15} className="text-slate-500 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Email</p>
                  <p className="text-sm text-white">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield size={15} className="text-slate-500 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Sign-in method</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-0.5 ${
                    provider === 'google' ? 'bg-blue-900/60 text-blue-300' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {provider === 'google' ? 'Google' : 'Email / Password'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={15} className="text-slate-500 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Member since</p>
                  <p className="text-sm text-white">{fmtDate(user?.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Credits / usage ── */}
        <section className="bg-navy-800 rounded-2xl border border-navy-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-gold-400" />
            <h2 className="text-base font-bold text-white">AI Credits</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-navy-900 rounded-xl p-4 border border-navy-700">
              <p className="text-2xl font-bold text-white">∞</p>
              <p className="text-xs text-slate-400 mt-0.5">Available Credits</p>
            </div>
            <div className="bg-navy-900 rounded-xl p-4 border border-navy-700">
              <p className="text-2xl font-bold text-gold-400">Free</p>
              <p className="text-xs text-slate-400 mt-0.5">Current Plan</p>
            </div>
            <div className="bg-navy-900 rounded-xl p-4 border border-navy-700 sm:col-span-1 col-span-2">
              <p className="text-2xl font-bold text-emerald-400">Beta</p>
              <p className="text-xs text-slate-400 mt-0.5">Access Level</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            During beta, all AI review features are free. Paid plans with usage credits will be introduced after beta.
          </p>
        </section>

        {/* ── Past protocols ── */}
        <section className="bg-navy-800 rounded-2xl border border-navy-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-slate-400" />
              <h2 className="text-base font-bold text-white">Past Protocols</h2>
            </div>
            <Link href="/wizard"
              className="text-xs text-gold-400 hover:text-gold-300 font-medium transition-colors flex items-center gap-1">
              New Protocol <ChevronRight size={12} />
            </Link>
          </div>

          {protocols.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <FileText size={32} className="text-slate-700 mx-auto" />
              <p className="text-slate-400 text-sm">No saved protocols yet.</p>
              <p className="text-slate-500 text-xs">
                Protocols are saved locally in your browser. Start a new one to see it here.
              </p>
              <Link href="/wizard"
                className="inline-block mt-3 px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white text-sm rounded-lg transition-colors">
                Start a Protocol →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {protocols.map((p) => (
                <div key={p.id}
                  className="flex items-center gap-4 bg-navy-900 rounded-xl border border-navy-700 px-4 py-3 hover:border-navy-500 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {p.title || 'Untitled Protocol'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{fmtDateTime(p.savedAt)}</p>
                  </div>
                  {p.reviewType && <ReviewBadge type={p.reviewType} />}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href="/wizard"
                      className="text-xs text-gold-400 hover:text-gold-300 font-medium transition-colors">
                      Open →
                    </Link>
                    {deleteConfirm === p.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(p.id)}
                          className="text-xs text-red-400 hover:text-red-300 font-medium">
                          Delete
                        </button>
                        <button onClick={() => setDeleteConfirm(null)}
                          className="text-xs text-slate-500 hover:text-slate-300">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(p.id)}
                        className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-start gap-2 bg-navy-900 border border-navy-700 rounded-lg p-3">
            <AlertCircle size={13} className="text-slate-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500">
              Protocols are currently stored in your browser. Cloud saving with cross-device sync is coming soon.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountDashboard />
    </ProtectedRoute>
  );
}
