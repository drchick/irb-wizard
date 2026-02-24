/**
 * HomeNav.jsx — Full-width top nav, logo flush left
 */
import { useState } from 'react';
import Link from 'next/link';
import IRBWizLogo from './IRBWizLogo';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, UserCircle, LogOut, ChevronDown } from 'lucide-react';
import { useRef, useEffect } from 'react';

const NAV_LINKS = [
  { label: 'Features',     href: '/#features'    },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Examples',     href: '/examples'      },
  { label: 'Pricing',      href: '/#pricing'      },
  { label: 'Contact',      href: '/contact'       },
];

function UserDropdown({ user, onSignOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const avatar = user.user_metadata?.avatar_url;
  const name   = user.user_metadata?.full_name || user.email;
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
        {avatar
          ? <img src={avatar} alt={name} className="w-8 h-8 rounded-full border border-slate-600" />
          : <UserCircle size={28} className="text-slate-400" />}
        <span className="text-sm hidden sm:block max-w-[120px] truncate">{name}</span>
        <ChevronDown size={13} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-navy-800 border border-navy-600 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-navy-700">
            <p className="text-xs font-semibold text-white truncate">{name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
          <div className="py-1">
            <Link href="/account" onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-navy-700 hover:text-white transition-colors">
              <UserCircle size={14} /> My Account
            </Link>
            <Link href="/wizard" onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-navy-700 hover:text-white transition-colors">
              → Go to Wizard
            </Link>
            <button onClick={() => { setOpen(false); onSignOut(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-navy-700 hover:text-white transition-colors">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomeNav() {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-navy-900/95 backdrop-blur border-b border-navy-700/60 shadow-sm">
      {/* Full-width container with generous padding */}
      <div className="w-full px-8 lg:px-14 py-4 flex items-center justify-between gap-8">

        {/* ── Logo flush left ── */}
        <Link href="/" className="flex items-center shrink-0">
          <IRBWizLogo size={40} variant="full" theme="dark" />
        </Link>

        {/* ── Center nav links (desktop) ── */}
        <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={label} href={href}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              {label}
            </a>
          ))}
        </div>

        {/* ── Right: auth ── */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          {user ? (
            <UserDropdown user={user} onSignOut={signOut} />
          ) : (
            <>
              <Link href="/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/login"
                className="bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold text-sm px-5 py-2 rounded-lg transition-colors">
                Get Started →
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button className="md:hidden text-slate-300 hover:text-white"
          onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden bg-navy-900 border-t border-navy-700 px-8 py-5 flex flex-col gap-4">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={label} href={href}
              className="text-sm text-slate-300 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}>
              {label}
            </a>
          ))}
          <div className="border-t border-navy-700 pt-4 flex flex-col gap-3">
            {user ? (
              <>
                <Link href="/account" className="text-sm text-slate-300 hover:text-white"
                  onClick={() => setMobileOpen(false)}>My Account</Link>
                <Link href="/wizard"
                  className="bg-gold-500 text-navy-900 font-bold text-sm text-center py-2.5 rounded-lg"
                  onClick={() => setMobileOpen(false)}>Go to Wizard →</Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-slate-300 hover:text-white"
                  onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link href="/login"
                  className="bg-gold-500 text-navy-900 font-bold text-sm text-center py-2.5 rounded-lg"
                  onClick={() => setMobileOpen(false)}>Get Started →</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
