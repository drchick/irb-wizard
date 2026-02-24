/**
 * AdminRoute.jsx — Protects /admin from non-admin users.
 * Admin is identified by VITE_ADMIN_EMAIL env var.
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import IRBWizLogo from '../layout/IRBWizLogo';

export default function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <IRBWizLogo size={40} variant="full" theme="dark" />
      </div>
    );
  }

  if (!user)    return <Navigate to="/login"  replace />;
  if (!isAdmin) return <Navigate to="/wizard" replace />;

  return children;
}
