/**
 * AuthContext.jsx
 *
 * Provides authentication state (Firebase) to the entire app.
 * Wrap <App> with <AuthProvider> in main.jsx.
 *
 * useAuth() returns:
 *   user          — Firebase User object or null
 *   loading       — true while initial auth state is resolving
 *   signInWithGoogle — opens Google popup, returns promise
 *   signOut       — signs out, returns promise
 *   firebaseReady — false if Firebase env vars are not configured
 */

import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, provider, firebaseConfigured } from '../firebase';

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    // Persist login state across page refreshes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;   // cleanup on unmount
  }, []);

  const signInWithGoogle = async () => {
    if (!firebaseConfigured || !auth) {
      throw new Error('Firebase is not configured. Add VITE_FIREBASE_* to your .env file.');
    }
    const result = await signInWithPopup(auth, provider);
    return result.user;
  };

  const signOut = async () => {
    if (auth) await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithGoogle,
      signOut,
      firebaseReady: firebaseConfigured,
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
