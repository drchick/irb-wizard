/**
 * AdminRoute.jsx — Protects /admin from non-admin users.
 * Admin is identified by NEXT_PUBLIC_ADMIN_EMAIL env var.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import IRBWizLogo from '../layout/IRBWizLogo';

export default function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user)    router.replace('/login');
      else if (!isAdmin) router.replace('/wizard');
    }
  }, [user, loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <IRBWizLogo size={40} variant="full" theme="dark" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return children;
}
