/**
 * IRBWiz Logo — Symbiotic Scholar Suite
 *
 * A doctoral mortarboard cap "hanging on" the IR of the IRBWiz wordmark.
 *
 * Props:
 *   size    — base pixel size (default 40)
 *   variant — 'icon' | 'full' (cap only | cap + wordmark stacked)
 *   theme   — 'dark'  (light cap, white text, gold — for navy/dark backgrounds)
 *             'light' (navy cap, navy text, amber — for white/light backgrounds)
 */
export default function IRBWizLogo({ size = 40, variant = 'icon', theme = 'dark', className = '' }) {
  const isDark = theme === 'dark';

  // ── Colour tokens ──────────────────────────────────────────────────────────
  const capBody    = isDark ? '#dde6f5' : '#1e2d4e';    // dome — icy blue-white / deep navy
  const boardColor = isDark ? '#eef2f9' : '#152347';    // flat board top
  const boardSheen = isDark ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.13)'; // 3-D highlight
  const gold       = '#fbbf24';
  const goldDeep   = '#f59e0b';

  const wordIRB = isDark ? '#ffffff'                : '#1e2d4e';
  const wordWiz = isDark ? '#fbbf24'                : '#d97706';
  const wordSub = isDark ? 'rgba(255,255,255,0.50)' : '#64748b';

  // ── Sizes ──────────────────────────────────────────────────────────────────
  const capW    = Math.round(size * 0.90);            // rendered cap width (wider to stay over IR at larger text)
  const capH    = Math.round(size * 0.56);            // rendered cap height
  const capHang = Math.round(capH * 0.72);            // paddingTop so cap bottom just grazes letter-tops
  const wordSz  = Math.round(size * 0.78);            // IRBWiz font-size — wider so right edge ≈ right edge of sub-brand
  const subSz   = Math.max(9, Math.round(size * 0.245)); // Symbiotic Scholar font-size — slightly bigger too
  const gap     = Math.max(2, Math.round(size * 0.06));

  // ── Mortarboard SVG paths (44 × 44 internal viewBox) ──────────────────────
  // Classic mortarboard from a slight above-front 3/4 angle.
  // Dome visible below the diamond board; gold tassel drapes right.
  const capPaths = (
    <>
      {/* Cap dome — rounded head-fitting part */}
      <path d="M8 25 Q22 15 36 25 L34 35 Q22 43 10 35 Z" fill={capBody} />

      {/* Board / mortarboard top — diamond (rhombus) from slight above angle */}
      <polygon points="22,9 41,20 22,28 3,20" fill={boardColor} />

      {/* Front-left face of board — lighter sheen for 3-D depth */}
      <polygon points="22,9 3,20 22,28" fill={boardSheen} />

      {/* Button at crown of board */}
      <circle cx="22" cy="9" r="2.4" fill={gold} />
      <circle cx="22" cy="9" r="1.1" fill={goldDeep} />

      {/* Tassel cord — from button, arcs right to corner, drops straight down */}
      <path d="M23 9 Q37 14 40 22 L40 36"
        stroke={gold} strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Tassel bob */}
      <circle cx="40" cy="37.5" r="3.2" fill={gold} />
      <circle cx="40" cy="37.5" r="1.5" fill={goldDeep} />

      {/* Tassel fringe — three hanging strands */}
      <line x1="36.5" y1="40.5" x2="35"   y2="44" stroke={gold} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="40"   y1="40.5" x2="40"   y2="44" stroke={gold} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="43.5" y1="40.5" x2="44"   y2="44" stroke={gold} strokeWidth="1.4" strokeLinecap="round" />
    </>
  );

  // ── Icon-only variant ──────────────────────────────────────────────────────
  if (variant === 'icon') {
    return (
      <span className={className} style={{ display: 'inline-flex', flexShrink: 0 }}>
        <svg
          width={size} height={size}
          viewBox="0 0 44 44" fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="IRBWiz"
          style={{ overflow: 'visible' }}
        >
          {capPaths}
        </svg>
      </span>
    );
  }

  // ── Full lockup ────────────────────────────────────────────────────────────
  // paddingTop = capHang reserves space above the text.
  // The cap SVG (position: absolute, top: 0) fills that space and its bottom
  // edge (capH) slightly overlaps the text top (capHang) — the "hanging on IR" effect.
  // A −7° tilt with the pivot near the bottom-left makes the cap read as draped/hung
  // rather than rigidly placed.
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        paddingTop: capHang,
        flexShrink: 0,
      }}
    >
      {/* Mortarboard cap */}
      <svg
        width={capW} height={capH}
        viewBox="0 0 44 44" fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          overflow: 'visible',
          transform: 'rotate(-7deg)',
          transformOrigin: '28% 100%', // pivot near bottom-left → top leans right, base stays over IR
        }}
      >
        {capPaths}
      </svg>

      {/* Text block */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        {/* IRBWiz wordmark */}
        <span style={{
          fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
          fontSize:   wordSz,
          fontWeight: 900,
          letterSpacing: '0em',
          lineHeight: 1,
          color: wordIRB,
          whiteSpace: 'nowrap',
        }}>
          IRB<span style={{ color: wordWiz }}>Wiz</span>
        </span>

        {/* Sub-brand */}
        <span style={{
          fontFamily: "'Special Elite', 'American Typewriter', 'Courier New', Courier, monospace",
          fontSize:   subSz,
          fontWeight: 400,
          letterSpacing: '0.09em',
          lineHeight: 1,
          marginTop:  gap,
          color: wordSub,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          Symbiotic Scholar
        </span>
      </div>
    </div>
  );
}
