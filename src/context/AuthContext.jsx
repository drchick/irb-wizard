/**
 * AuthContext.jsx
 *
 * Provides authentication state (Supabase) to the entire app.
 * Wrap <App> with <AuthProvider> in main.jsx.
 *
 * useAuth() returns:
 *   user            — Supabase User object or null
 *                     user.email
 *                     user.user_metadata.full_name
 *                     user.user_metadata.avatar_url
 *   loading         — true while initial session is resolving
 *   signInWithGoogle — triggers Supabase Google OAuth redirect
 *   signOut         — signs out, returns promise
 *   supabaseReady   — false if Supabase env vars are not configured
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../supabase';

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Hydrate session from localStorage on first load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for sign-in / sign-out / token refresh events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Redirects to Google OAuth via Supabase.
   * After the user authenticates, Google redirects back to redirectTo
   * (defaults to /wizard). Supabase stores the session automatically.
   */
  const signInWithGoogle = async (redirectTo) => {
    if (!supabaseConfigured || !supabase) {
      throw new Error(
        'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
      );
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo ?? `${window.location.origin}/wizard`,
      },
    });
    if (error) throw error;
    // Browser will navigate away — no further action needed here
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithGoogle,
      signOut,
      supabaseReady: supabaseConfigured,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
