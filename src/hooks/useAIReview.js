import { useState, useCallback } from 'react';

/**
 * Hook for triggering AI section reviews and comprehensive protocol assessments.
 *
 * Usage:
 *   const { analyze, loading, result, error, clear } = useAIReview();
 *   analyze('study', sectionData, formDataSummary);
 *   analyze('comprehensive', formData, { rulesBased });
 */
export function useAIReview() {
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);

  const analyze = useCallback(async (section, sectionData, formDataSummary) => {
    setLoading(true);
    setResult(null);
    setError(null);

    const isComprehensive = section === 'comprehensive';
    const endpoint = isComprehensive ? '/api/ai-comprehensive' : '/api/ai-review';
    const body = isComprehensive
      ? { formData: sectionData, rulesBased: formDataSummary?.rulesBased }
      : { section, sectionData, formDataSummary };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (HTTP ${res.status})`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Cannot reach the AI backend. Make sure the server is running (npm run dev).');
      } else {
        setError(err.message || 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { analyze, loading, result, error, clear };
}
