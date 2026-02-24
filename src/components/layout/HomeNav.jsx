/**
 * HomeNav.jsx
 *
 * Top navigation bar matching the Symbiotic Scholar suite pattern:
 * Logo flush-left | Center nav links | Sign In + Get Started flush-right
 */

import { useState } from 'react';
import Link from 'next/link';
import IRBWizLogo from './IRBWizLogo';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features',    href: '/#features'    },
  { label: 'How It Works',href: '/#how-it-works' },
  { label: 'Pricing',     href: '/#pricing'      },
  { label: 'Contact',     href: 'mailto:hello@irbwiz.help' },
];

export default function HomeNav() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-navy-900 border-b border-navy-700 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-6">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center shrink-0">
          <IRBWizLogo size={32} variant="full" theme="dark" />
        </Link>

        {/* ── Center nav links (desktop) ── */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ label, href }) =>
            href.startsWith('mailto') ? (
              <a key={label} href={href}
                className="text-sm text-slate-300 hover:text-white transition-colors">
                {label}
              </a>
            ) : (
              <a key={label} href={href}
                className="text-sm text-slate-300 hover:text-white transition-colors">
                {label}
              </a>
            )
          )}
        </div>

        {/* ── Right: auth buttons ── */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {user ? (
            <>
              {user.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata?.full_name || 'User'}
                  className="w-7 h-7 rounded-full border border-slate-500"
                />
              )}
              <Link href="/wizard" className="btn-primary text-sm py-1.5 px-4">
                Go to Wizard →
              </Link>
            </>
          ) : (
            <>
              <Link href="/login"
                className="text-sm text-slate-300 hover:text-white transition-colors px-2">
                Sign In
              </Link>
              <Link href="/login"
                className="btn-primary text-sm py-1.5 px-4">
                Get Started →
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="md:hidden text-slate-300 hover:text-white"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden bg-navy-900 border-t border-navy-700 px-6 py-4 flex flex-col gap-3">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={label} href={href}
              className="text-sm text-slate-300 hover:text-white transition-colors py-1"
              onClick={() => setMobileOpen(false)}>
              {label}
            </a>
          ))}
          <div className="border-t border-navy-700 pt-3 flex flex-col gap-2">
            {user ? (
              <Link href="/wizard" className="btn-primary text-sm text-center py-2"
                onClick={() => setMobileOpen(false)}>
                Go to Wizard →
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-slate-300 hover:text-white py-1"
                  onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link href="/login" className="btn-primary text-sm text-center py-2"
                  onClick={() => setMobileOpen(false)}>Get Started →</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
