/**
 * Login.jsx — Sign-in page
 *
 * Shows a centered card with Google Sign-In via Supabase OAuth.
 * Clicking "Continue with Google" redirects to Google, which redirects
 * back to /wizard after successful authentication.
 * Already-authenticated users are redirected to /wizard immediately.
 * Shows a graceful warning if Supabase is not yet configured.
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import IRBWizLogo from '../components/layout/IRBWizLogo';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

// Google "G" brand SVG (official brand colours, inline for no extra dep)
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

export default function Login() {
  const { user, loading, signInWithGoogle, supabaseReady } = useAuth();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);
  const [error,     setError]     = useState('');

  // Already logged in → go straight to wizard
  useEffect(() => {
    if (!loading && user) {
      navigate('/wizard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    setError('');
    setSigningIn(true);
    try {
      await signInWithGoogle();
      // Browser is redirecting to Google — no navigate() needed here
    } catch (err) {
      setError(err.message || 'Sign-in failed. Please try again.');
      setSigningIn(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center px-4 py-12">

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">

        {/* Logo */}
        <div className="flex justify-center mb-7">
          <IRBWizLogo size={44} variant="full" theme="light" />
        </div>

        <h1 className="text-xl font-bold text-navy-900 text-center mb-1">Sign in to IRBWiz</h1>
        <p className="text-sm text-slate-500 text-center mb-7">Access your protocols and documents</p>

        {/* Supabase not configured warning */}
        {!supabaseReady && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-xs text-amber-800">
            <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-500" />
            <span>
              Supabase is not configured. Add{' '}
              <code className="font-mono bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code>{' '}
              and{' '}
              <code className="font-mono bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code>{' '}
              to your <code className="font-mono bg-amber-100 px-1 rounded">.env</code> file
              to enable sign-in.
            </span>
          </div>
        )}

        {/* Google Sign-In button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={signingIn || !supabaseReady}
          className="w-full flex items-center justify-center gap-3 border border-slate-300 rounded-lg py-3 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {signingIn ? (
            <>
              <svg className="animate-spin h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Redirecting to Google…
            </>
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <p className="mt-3 text-xs text-center text-red-600 flex items-center justify-center gap-1">
            <AlertTriangle size={13} /> {error}
          </p>
        )}

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">more options coming soon</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Placeholder: email/password (grayed out) */}
        <div className="space-y-2 opacity-40 pointer-events-none select-none">
          <input
            type="email"
            placeholder="Email address"
            className="w-full border border-slate-300 rounded-lg py-2.5 px-3 text-sm placeholder-slate-400"
            disabled
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-slate-300 rounded-lg py-2.5 px-3 text-sm placeholder-slate-400"
            disabled
          />
          <button
            className="w-full bg-navy-700 text-white rounded-lg py-2.5 text-sm font-medium"
            disabled
          >
            Sign in with Email
          </button>
        </div>
      </div>

      {/* Back to home */}
      <Link
        to="/"
        className="mt-6 flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm transition-colors"
      >
        <ArrowLeft size={14} /> Back to Home
      </Link>

      {/* Suite branding */}
      <p className="mt-8 text-xs text-slate-600">
        Part of the{' '}
        <a
          href="https://symbioticscholar.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold-400 hover:text-gold-300 underline"
        >
          Symbiotic Scholar Suite
        </a>
      </p>
    </div>
  );
}
