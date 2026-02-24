/**
 * ProtectedRoute.jsx
 *
 * Wraps any route that requires authentication.
 * - While auth state is loading → renders a full-screen spinner
 * - If not signed in → redirects to /login
 * - If signed in → renders children
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import IRBWizLogo from '../layout/IRBWizLogo';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-navy-900">
        <IRBWizLogo size={48} variant="full" theme="dark" />
        <div className="mt-6 flex items-center gap-2 text-slate-400 text-sm">
          <svg className="animate-spin h-4 w-4 text-gold-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading…
        </div>
      </div>
    );
  }

  if (!user) return null;

  return children;
}
