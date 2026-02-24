/**
 * useCredits — React hook for managing a user's credit balance.
 *
 * Returns: { credits, loading, deduct, refetch }
 *   credits  — number | null (null while loading)
 *   loading  — boolean
 *   deduct() — deducts 1 credit; throws on error / insufficient credits
 *   refetch  — manually re-fetch balance
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

export function useCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!user) { setCredits(0); setLoading(false); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? '';
      const res  = await fetch('/api/credits', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCredits(typeof data.credits === 'number' ? data.credits : 0);
    } catch {
      setCredits(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCredits(); }, [fetchCredits]);

  /** Deducts 1 credit. Throws if insufficient or error. */
  const deduct = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? '';
    const res = await fetch('/api/credits/deduct', {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to deduct credit');
    setCredits(data.credits);
    return data.credits;
  }, []);

  return { credits, loading, deduct, refetch: fetchCredits };
}
