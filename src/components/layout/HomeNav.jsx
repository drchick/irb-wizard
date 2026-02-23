/**
 * HomeNav.jsx
 *
 * Top navigation bar for the Home and Login pages.
 * Shows the IRBWiz logo on the left and a Sign In / Dashboard button on the right.
 */

import { Link } from 'react-router-dom';
import IRBWizLogo from './IRBWizLogo';
import { useAuth } from '../../context/AuthContext';

export default function HomeNav() {
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-navy-800 shadow-md">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <IRBWizLogo size={32} variant="full" theme="dark" />
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 rounded-full border border-slate-500"
                />
              )}
              <Link
                to="/wizard"
                className="btn-primary text-sm py-1.5 px-4"
              >
                Go to Wizard →
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="btn-primary text-sm py-1.5 px-4"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
