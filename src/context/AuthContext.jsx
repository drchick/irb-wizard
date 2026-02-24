/**
 * AuthContext.jsx — Supabase auth (Google OAuth + email/password)
 *
 * useAuth() returns:
 *   user              — Supabase User | null
 *   loading           — true while resolving initial session
 *   signInWithGoogle  — Google OAuth redirect
 *   signInWithEmail   — email + password sign-in
 *   signUpWithEmail   — create account with email + password
 *   resetPassword     — send password-reset email
 *   signOut
 *   supabaseReady     — false if env vars missing
 *   isAdmin           — true if user.email matches VITE_ADMIN_EMAIL
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../supabase';

const AuthContext = createContext(null);
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? '';

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseConfigured || !supabase) { setLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  // ── Google OAuth (redirect flow) ────────────────────────────────────────────
  const signInWithGoogle = async (redirectTo) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectTo ?? `${window.location.origin}/wizard` },
    });
    if (error) throw error;
  };

  // ── Email / password sign-in ─────────────────────────────────────────────────
  const signInWithEmail = async (email, password) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  };

  // ── Email / password sign-up ─────────────────────────────────────────────────
  const signUpWithEmail = async (email, password) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/wizard` },
    });
    if (error) throw error;
    // data.user is set but session is null until email confirmed
    return { user: data.user, needsConfirmation: !data.session };
  };

  // ── Password reset ───────────────────────────────────────────────────────────
  const resetPassword = async (email) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  // ── Sign out ─────────────────────────────────────────────────────────────────
  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  };

  const isAdmin = !!(user && ADMIN_EMAIL && user.email === ADMIN_EMAIL);

  return (
    <AuthContext.Provider value={{
      user, loading,
      signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, signOut,
      supabaseReady: supabaseConfigured,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
