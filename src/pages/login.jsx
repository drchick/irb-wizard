/**
 * login.jsx — Sign-in / Sign-up page (Next.js)
 *
 * Modes:
 *   signin  — email/password or Google
 *   signup  — create account with email/password
 *   forgot  — request password reset email
 *   confirm — shown after sign-up (check your email)
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import IRBWizLogo from '../components/layout/IRBWizLogo';
import { AlertTriangle, ArrowLeft, Eye, EyeOff, Mail, CheckCircle2 } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

export default function Login() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, supabaseReady } = useAuth();
  const router = useRouter();

  const [mode,      setMode]      = useState('signin'); // signin | signup | forgot | confirm
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [busy,      setBusy]      = useState(false);
  const [error,     setError]     = useState('');
  const [info,      setInfo]      = useState('');

  useEffect(() => {
    if (!loading && user) router.replace('/wizard');
  }, [user, loading, router]);

  const reset = (nextMode) => { setError(''); setInfo(''); setMode(nextMode); };

  // ── Google ──────────────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setError(''); setBusy(true);
    try { await signInWithGoogle(); }
    catch (err) { setError(err.message || 'Sign-in failed.'); setBusy(false); }
  };

  // ── Email sign-in ───────────────────────────────────────────────────────────
  const handleSignIn = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      await signInWithEmail(email, password);
      router.replace('/wizard');
    } catch (err) {
      setError(err.message || 'Sign-in failed. Check your email and password.');
      setBusy(false);
    }
  };

  // ── Email sign-up ───────────────────────────────────────────────────────────
  const handleSignUp = async (e) => {
    e.preventDefault(); setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }
    setBusy(true);
    try {
      const { needsConfirmation } = await signUpWithEmail(email, password);
      // Fire welcome email + admin notification (fire-and-forget, don't block UX)
      fetch('/api/notify-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(() => {});
      if (needsConfirmation) { setMode('confirm'); }
      else { router.replace('/wizard'); }
    } catch (err) {
      setError(err.message || 'Sign-up failed. Please try again.');
    } finally { setBusy(false); }
  };

  // ── Forgot password ─────────────────────────────────────────────────────────
  const handleForgot = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      await resetPassword(email);
      setInfo('Check your email for a password reset link.');
    } catch (err) {
      setError(err.message || 'Could not send reset email.');
    } finally { setBusy(false); }
  };

  if (loading) return null;

  // ── Confirm email state ─────────────────────────────────────────────────────
  if (mode === 'confirm') {
    return (
      <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 text-center">
          <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-navy-900 mb-2">Check your email</h1>
          <p className="text-sm text-slate-500 mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back to sign in.
          </p>
          <button onClick={() => reset('signin')}
            className="text-sm text-gold-600 hover:text-gold-500 font-medium">
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <IRBWizLogo size={44} variant="full" theme="light" />
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
          <button
            onClick={() => reset('signin')}
            className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${mode === 'signin' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Sign In
          </button>
          <button
            onClick={() => reset('signup')}
            className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${mode === 'signup' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Create Account
          </button>
        </div>

        {/* Supabase warning */}
        {!supabaseReady && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs text-amber-800">
            <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-500" />
            <span>Supabase is not configured. Add <code className="font-mono bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="font-mono bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code> file.</span>
          </div>
        )}

        {/* Google button — temporarily disabled until dedicated Supabase project is configured */}
        {/* TODO: re-enable once IRBWiz has its own Supabase project with correct Site URL */}

        {/* Sign In form */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-3">
            <input type="email" placeholder="Email address" required value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} placeholder="Password" required value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg py-2.5 px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <div className="text-right">
              <button type="button" onClick={() => reset('forgot')}
                className="text-xs text-slate-400 hover:text-slate-600">
                Forgot password?
              </button>
            </div>
            {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle size={12}/>{error}</p>}
            <button type="submit" disabled={busy || !supabaseReady}
              className="w-full bg-navy-800 hover:bg-navy-700 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 transition-colors">
              {busy ? 'Signing in…' : 'Sign In with Email'}
            </button>
          </form>
        )}

        {/* Sign Up form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3">
            <input type="email" placeholder="Email address" required value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} placeholder="Password (min 8 characters)" required value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg py-2.5 px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <input type="password" placeholder="Confirm password" required value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full border border-slate-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
            {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle size={12}/>{error}</p>}
            <button type="submit" disabled={busy || !supabaseReady}
              className="w-full bg-navy-800 hover:bg-navy-700 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 transition-colors">
              {busy ? 'Creating account…' : 'Create Account'}
            </button>
            <p className="text-xs text-slate-400 text-center">
              By signing up you agree to our{' '}
              <a href="https://irbwiz.help/terms" target="_blank" rel="noopener noreferrer" className="underline">Terms</a>
              {' '}and{' '}
              <a href="https://irbwiz.help/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>
            </p>
          </form>
        )}

        {/* Forgot password form */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-3">
            <h2 className="text-base font-semibold text-navy-900 text-center">Reset your password</h2>
            <p className="text-xs text-slate-500 text-center">Enter your email and we'll send you a reset link.</p>
            <input type="email" placeholder="Email address" required value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
            {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle size={12}/>{error}</p>}
            {info  && <p className="text-xs text-emerald-600 flex items-center gap-1"><Mail size={12}/>{info}</p>}
            <button type="submit" disabled={busy || !supabaseReady}
              className="w-full bg-navy-800 hover:bg-navy-700 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 transition-colors">
              {busy ? 'Sending…' : 'Send Reset Link'}
            </button>
            <button type="button" onClick={() => reset('signin')}
              className="w-full text-sm text-slate-400 hover:text-slate-600">
              ← Back to sign in
            </button>
          </form>
        )}
      </div>

      <Link href="/" className="mt-6 flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm transition-colors">
        <ArrowLeft size={14} /> Back to Home
      </Link>

      <p className="mt-6 text-xs text-slate-600">
        Part of the{' '}
        <a href="https://symbioticscholar.com" target="_blank" rel="noopener noreferrer"
          className="text-gold-400 hover:text-gold-300 underline">Symbiotic Scholar Suite</a>
      </p>
    </div>
  );
}
