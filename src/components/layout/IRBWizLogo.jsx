/**
 * IRBWiz Logo — Symbiotic Scholar Suite
 *
 * Props:
 *   size    — icon pixel size (default 40)
 *   variant — 'icon' | 'full' (icon + wordmark)
 *   theme   — 'dark'  (white text, gold hat — for navy/dark backgrounds)
 *             'light' (navy text, amber hat — for white/light backgrounds)
 */
export default function IRBWizLogo({ size = 40, variant = 'icon', theme = 'dark', className = '' }) {
  const isDark = theme === 'dark';

  // ── colour tokens ──────────────────────────────────────────────────────────
  const hatFill     = '#fbbf24';          // warm gold — same in both themes
  const hatBrim     = '#f59e0b';
  const hatBand     = '#8b5cf6';          // classic wizard purple
  const starColor   = isDark ? 'white' : '#fbbf24';
  const wandColor   = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(30,45,78,0.45)';
  const wand2Color  = isDark ? 'rgba(255,255,255,0.9)' : '#fbbf24';

  const wordIRB     = isDark ? '#ffffff'          : '#1e2d4e';
  const wordWiz     = isDark ? '#fbbf24'          : '#d97706';
  const wordSub     = isDark ? 'rgba(255,255,255,0.52)' : '#64748b';

  // ── icon SVG (44 × 44 viewBox) ────────────────────────────────────────────
  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="IRBWiz"
      style={{ flexShrink: 0 }}
    >
      {/* ── Wand (behind hat, crossing diagonally lower-right → upper-left) ── */}
      <line x1="40" y1="42" x2="10" y2="12"
        stroke={wandColor} strokeWidth="2.5" strokeLinecap="round" />

      {/* ── Hat body (cone) ── */}
      <path d="M22 3 L5 34 L39 34 Z" fill={hatFill} />

      {/* ── Hat brim ── */}
      <ellipse cx="22" cy="34" rx="20" ry="5" fill={hatBrim} />

      {/* ── Hat band (purple stripe) ── */}
      <path d="M8.5 27.5 L35.5 27.5 L37 31 L7 31 Z" fill={hatBand} opacity="0.9" />

      {/* ── Stars on hat ── */}
      {/* Centre star (4-point) */}
      <path d="M22 13 L23.3 16 L26.5 17 L23.3 18 L22 21 L20.7 18 L17.5 17 L20.7 16 Z"
        fill={starColor} opacity="0.95" />
      {/* Left small star */}
      <path d="M16 22 L16.9 23.6 L18.8 24 L16.9 24.4 L16 26 L15.1 24.4 L13.2 24 L15.1 23.6 Z"
        fill={starColor} opacity="0.85" />
      {/* Right dot */}
      <circle cx="27.5" cy="24" r="1.6" fill={starColor} opacity="0.75" />

      {/* ── Wand star / sparkle at tip (upper-left, above hat) ── */}
      <path d="M10 9 L11.3 11 L13.8 12 L11.3 13 L10 15 L8.7 13 L6.2 12 L8.7 11 Z"
        fill={wand2Color} opacity="0.98" />
      {/* Tiny sparkle dots around wand star */}
      <circle cx="6.5"  cy="8.5" r="0.9" fill={wand2Color} opacity="0.8" />
      <circle cx="13.5" cy="8.5" r="0.8" fill={wand2Color} opacity="0.7" />
      <circle cx="10"   cy="6.5" r="0.8" fill={wand2Color} opacity="0.7" />

      {/* ── Sparkle at hat tip ── */}
      <line x1="22" y1="0.5" x2="22" y2="2.5" stroke={wand2Color} strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
      <line x1="20.2" y1="1.5" x2="23.8" y2="1.5" stroke={wand2Color} strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
    </svg>
  );

  if (variant === 'icon') return <span className={className}>{icon}</span>;

  // ── Full lockup ─────────────────────────────────────────────────────────────
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: Math.round(size * 0.28) }}
      className={className}
    >
      {icon}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        {/* IRBWiz wordmark */}
        <span style={{
          fontFamily: "'Cinzel', 'Palatino Linotype', 'Book Antiqua', Palatino, serif",
          fontSize:   Math.round(size * 0.52),
          fontWeight: 900,
          letterSpacing: '0.01em',
          lineHeight: 1,
          color: wordIRB,
        }}>
          IRB<span style={{ color: wordWiz }}>Wiz</span>
        </span>
        {/* Sub-brand line */}
        <span style={{
          fontFamily: "'Special Elite', 'American Typewriter', 'Courier New', Courier, monospace",
          fontSize:   Math.max(9, Math.round(size * 0.235)),
          fontWeight: 400,
          letterSpacing: '0.09em',
          lineHeight: 1,
          marginTop:  Math.round(size * 0.08),
          color: wordSub,
          textTransform: 'uppercase',
        }}>
          Symbiotic Scholar
        </span>
      </div>
    </div>
  );
}
