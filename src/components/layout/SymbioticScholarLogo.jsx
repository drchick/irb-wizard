/**
 * SymbioticScholarLogo — Inline SVG brand mark for Symbiotic Scholar.
 *
 * Renders as an inline SVG so Plus Jakarta Sans web font loads correctly
 * (unlike <img src="*.svg"> which runs in isolation without access to
 * the document's loaded fonts).
 *
 * Props:
 *   height — rendered height in px (width scales automatically via SVG aspect ratio).
 *            Default: 55  (footer use)
 *            Nav use:  73
 *            Compact:  40
 *
 * Orbital mark:
 *   Two ±30° ellipses with four colored nodes — one per tool:
 *     Indigo   #6366F1 — Dr. Dissertation   (top-left)
 *     Teal     #0D9488 — Peer-Review PRO     (top-right)
 *     Gold     #fbbf24 — IRBWiz              (bottom-left)
 *     Violet   #7c3aed — ScholarlyFit        (bottom-right)
 *   Plus a white graduation cap at center.
 *
 * Wordmark:
 *   "symbiotic" — Plus Jakarta Sans 300, 48px, white/65%
 *   "SCHOLAR"   — Plus Jakarta Sans 300, 35px, gold #fbbf24
 *   Both compressed via textLength="372" to match tagline width exactly.
 *
 * Tagline:
 *   "ADVANCING RESEARCH THROUGH AI" — PJS 500, 10.5px, slate-400 #94a3b8
 */
export default function SymbioticScholarLogo({ height = 55 }) {
  return (
    <svg
      viewBox="0 0 516 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Symbiotic Scholar"
      style={{ display: 'block', height, width: 'auto' }}
    >
      {/* ── Orbital mark ──────────────────────────────────── */}
      <g transform="translate(60,60) scale(0.9)">
        {/* Badge circle */}
        <circle cx="0" cy="0" r="50" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>

        {/* Orbital rings */}
        <ellipse cx="0" cy="0" rx="38" ry="14" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" fill="none" transform="rotate(-30)"/>
        <ellipse cx="0" cy="0" rx="38" ry="14" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" fill="none" transform="rotate(30)"/>

        {/* Glow halos */}
        <circle cx="-33" cy="-19" r="12" fill="#6366F1" opacity="0.18"/>
        <circle cx="33"  cy="-19" r="12" fill="#0D9488" opacity="0.18"/>
        <circle cx="-33" cy="19"  r="12" fill="#fbbf24" opacity="0.18"/>
        <circle cx="33"  cy="19"  r="12" fill="#7c3aed" opacity="0.18"/>

        {/* Tool nodes */}
        <circle cx="-33" cy="-19" r="7" fill="#6366F1"/>
        <circle cx="33"  cy="-19" r="7" fill="#0D9488"/>
        <circle cx="-33" cy="19"  r="7" fill="#fbbf24"/>
        <circle cx="33"  cy="19"  r="7" fill="#7c3aed"/>

        {/* Graduation cap */}
        <polygon points="0,-22 -14,-13 14,-13" fill="white" opacity="0.95"/>
        <rect x="-16" y="-13" width="32" height="3.5" fill="#e2e8f0" rx="0.5"/>
        <rect x="14"  y="-13" width="1.5" height="9"  fill="#F59E0B"/>
        <circle cx="14.75" cy="-3" r="2.5" fill="#F59E0B"/>
      </g>

      {/*
        Wordmark: tspan approach — gap controlled by dx, no hardcoded x guessing.
        "symbiotic" at 48px: x-height ≈ 48×0.54 = 25.9px
        "SCHOLAR"   at 35px: cap-height ≈ 35×0.73 = 25.6px  → optically the same height.
        textLength on outer <text> squeezes both tspans to match tagline width exactly.
      */}
      <text x="124" y="69" textLength="372" lengthAdjust="spacingAndGlyphs">
        <tspan
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 300 }}
          fontSize="48"
          fill="rgba(255,255,255,0.65)"
        >symbiotic</tspan><tspan
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 300 }}
          fontSize="35"
          fill="#fbbf24"
          dx="10"
        >SCHOLAR</tspan>
      </text>

      {/* ── Tagline — same x and textLength as wordmark ──────── */}
      <text
        x="124" y="93"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 500 }}
        fontSize="10.5"
        fill="#94a3b8"
        textLength="372"
        lengthAdjust="spacing"
      >ADVANCING RESEARCH THROUGH AI</text>
    </svg>
  );
}
