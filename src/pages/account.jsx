/**
 * account.jsx — User dashboard
 * Shows: profile info, AI credits (buy/redeem), past protocols (from localStorage)
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import IRBWizLogo from '../components/layout/IRBWizLogo';
import { useCredits } from '../hooks/useCredits';
import { supabase } from '../supabase';
import {
  UserCircle, Mail, Shield, LogOut, ArrowLeft,
  FileText, Zap, Clock, ChevronRight, Trash2, AlertCircle,
  CreditCard, Tag, CheckCircle, XCircle, Loader,
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

  // Credits state
  const { credits, loading: creditsLoading, refetch: refetchCredits } = useCredits();
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState('idle'); // idle | loading | success | error
  const [promoMsg, setPromoMsg] = useState('');
  const [buyingPack, setBuyingPack] = useState(null);
  // paymentStatus: null | 'pending' | 'success' | 'delayed' | 'cancelled'
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [creditBaseline, setCreditBaseline] = useState(null);

  useEffect(() => { setProtocols(getSavedProtocols()); }, []);

  // 1️⃣ Detect Stripe redirect — set 'pending', do NOT show success yet
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setPaymentStatus('pending');
      window.history.replaceState({}, '', '/account');
    } else if (params.get('payment') === 'cancelled') {
      setPaymentStatus('cancelled');
      window.history.replaceState({}, '', '/account');
    }
  }, []); // runs once on mount

  // 2️⃣ Capture credit baseline once credits load and payment is pending
  useEffect(() => {
    if (paymentStatus === 'pending' && credits !== null && creditBaseline === null) {
      setCreditBaseline(credits);
    }
  }, [paymentStatus, credits, creditBaseline]);

  // 3️⃣ Poll for webhook-fulfilled credits while pending
  useEffect(() => {
    if (paymentStatus !== 'pending' || creditBaseline === null) return;
    let attempt = 0;
    const MAX = 9; // poll up to ~18 seconds
    const timer = setInterval(async () => {
      attempt++;
      await refetchCredits();
      if (attempt >= MAX) {
        clearInterval(timer);
        setPaymentStatus(prev => prev === 'pending' ? 'delayed' : prev);
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [paymentStatus, creditBaseline, refetchCredits]);

  // 4️⃣ Detect when credits actually increased (webhook fired)
  useEffect(() => {
    if (paymentStatus === 'pending' && creditBaseline !== null && credits !== null && credits > creditBaseline) {
      setPaymentStatus('success');
    }
  }, [paymentStatus, creditBaseline, credits]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  const handleDelete = (id) => {
    deleteProtocol(id);
    setProtocols(getSavedProtocols());
    setDeleteConfirm(null);
  };

  const handleBuyCredits = async (pack) => {
    setBuyingPack(pack);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? '';
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error ?? 'Could not start checkout');
    } catch (err) {
      alert(err.message);
    } finally {
      setBuyingPack(null);
    }
  };

  const handleRedeemCode = async (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setPromoStatus('loading');
    setPromoMsg('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? '';
      const res = await fetch('/api/credits/redeem', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPromoStatus('success');
      setPromoMsg(`${data.added} credit${data.added > 1 ? 's' : ''} added! New balance: ${data.credits}`);
      setPromoCode('');
      refetchCredits();
    } catch (err) {
      setPromoStatus('error');
      setPromoMsg(err.message);
    }
  };

  const provider = user?.app_metadata?.provider ?? 'email';
  const name     = user?.user_metadata?.full_name || '—';
  const avatar   = user?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-navy-900 text-white">

      {/* ── Header ── */}
      <header className="bg-navy-800 border-b border-navy-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/"><IRBWizLogo size={32} variant="full" theme="dark" /></Link>
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

        {/* ── AI Credits ── */}
        <div id="credits" className="bg-navy-800 rounded-2xl border border-navy-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-navy-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-gold-400" />
              <h2 className="text-white font-semibold">AI Credits</h2>
            </div>
            <div className="flex items-center gap-2">
              {creditsLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-gold-400 border-t-transparent animate-spin" />
              ) : (
                <span className="text-2xl font-bold text-gold-400">{credits ?? 0}</span>
              )}
              <span className="text-slate-400 text-sm">credit{credits !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Payment status toasts */}
            {paymentStatus === 'pending' && (
              <div className="flex items-start gap-3 bg-amber-900/30 border border-amber-700 rounded-lg px-4 py-3 text-amber-200 text-sm">
                <span className="mt-0.5 w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                <div>
                  <p className="font-semibold">Payment confirmed — applying credits…</p>
                  <p className="text-xs text-amber-300/80 mt-0.5">Your balance will update automatically in a few seconds.</p>
                </div>
              </div>
            )}
            {paymentStatus === 'success' && (
              <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-700 rounded-lg px-4 py-3 text-emerald-300 text-sm">
                <CheckCircle size={16} className="shrink-0" />
                <div>
                  <p className="font-semibold">Credits added! Your new balance is shown above.</p>
                </div>
              </div>
            )}
            {paymentStatus === 'delayed' && (
              <div className="flex items-start gap-3 bg-amber-900/30 border border-amber-700/60 rounded-lg px-4 py-3 text-amber-200 text-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <p className="font-semibold">Payment confirmed — credits are taking a moment to appear.</p>
                  <p className="text-xs text-amber-300/80 mt-0.5">
                    Try refreshing this page. If credits still don&apos;t appear, contact{' '}
                    <a href="mailto:support@symbioticscholar.com" className="underline">support@symbioticscholar.com</a>.
                  </p>
                  <button onClick={() => { refetchCredits(); setPaymentStatus('pending'); setCreditBaseline(null); }}
                    className="mt-2 text-xs bg-amber-700/50 hover:bg-amber-700 text-white px-3 py-1 rounded-md transition-colors">
                    Retry
                  </button>
                </div>
              </div>
            )}
            {paymentStatus === 'cancelled' && (
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-400 text-sm">
                <XCircle size={16} className="shrink-0" /> Checkout cancelled — no charge was made.
              </div>
            )}

            {/* Credit packs */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Buy Credits</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { pack: '1',  credits: 1,  price: '$9',  per: '$9.00/credit',  label: 'Starter' },
                  { pack: '3',  credits: 3,  price: '$20', per: '$6.67/credit',  label: 'Standard', popular: true },
                  { pack: '10', credits: 10, price: '$50', per: '$5.00/credit',  label: 'Pro' },
                ].map(({ pack, credits: c, price, per, label, popular }) => (
                  <div key={pack} className={`relative rounded-xl border p-4 text-center ${popular ? 'border-gold-500 bg-gold-500/5' : 'border-navy-600 bg-navy-900/50'}`}>
                    {popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gold-500 text-navy-900 text-xs font-bold px-2 py-0.5 rounded-full">
                        Best Value
                      </span>
                    )}
                    <p className="text-xs text-slate-400 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-white">{price}</p>
                    <p className="text-sm text-gold-400 font-medium">{c} credit{c > 1 ? 's' : ''}</p>
                    <p className="text-xs text-slate-500 mb-3">{per}</p>
                    <button
                      onClick={() => handleBuyCredits(pack)}
                      disabled={buyingPack !== null}
                      className={`w-full py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-60 ${
                        popular
                          ? 'bg-gold-500 hover:bg-gold-400 text-navy-900'
                          : 'bg-navy-700 hover:bg-navy-600 text-white'
                      }`}
                    >
                      {buyingPack === pack ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <Loader size={14} className="animate-spin" /> Processing…
                        </span>
                      ) : (
                        `Buy ${c} Credit${c > 1 ? 's' : ''}`
                      )}
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-2 text-center">Credits never expire · Secure checkout via Stripe</p>
            </div>

            {/* Promo / beta code */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Tag size={12} /> Redeem a Code
              </p>
              <form onSubmit={handleRedeemCode} className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="BETA2025 or promo code"
                  className="flex-1 bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
                <button
                  type="submit"
                  disabled={promoStatus === 'loading' || !promoCode.trim()}
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-navy-900 font-bold rounded-lg text-sm transition-colors"
                >
                  {promoStatus === 'loading' ? <Loader size={14} className="animate-spin" /> : 'Redeem'}
                </button>
              </form>
              {promoStatus === 'success' && (
                <p className="mt-2 text-sm text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle size={14} /> {promoMsg}
                </p>
              )}
              {promoStatus === 'error' && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                  <XCircle size={14} /> {promoMsg}
                </p>
              )}
            </div>
          </div>
        </div>

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
