// IRBWiz Logo — Symbiotic Scholar Suite, University of Bridgeport
// Usage: <IRBWizLogo size={40} /> or <IRBWizLogo variant="full" />

export default function IRBWizLogo({ size = 40, variant = 'icon', className = '' }) {
  // Icon-only mode: just the shield emblem
  if (variant === 'icon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="IRBWiz"
      >
        {/* Shield base */}
        <path
          d="M20 3L5 9v10c0 8.5 6.5 16.4 15 18.4C29.5 35.4 36 27.5 36 19V9L20 3z"
          fill="#1e2d4e"
        />
        {/* Shield highlight */}
        <path
          d="M20 6L8 11v8c0 7 5.3 13.5 12 15.6V6z"
          fill="rgba(255,255,255,0.06)"
        />
        {/* Document lines — representing protocol */}
        <rect x="14" y="13" width="8" height="1.5" rx="0.75" fill="white" opacity="0.9"/>
        <rect x="14" y="17" width="12" height="1.5" rx="0.75" fill="white" opacity="0.7"/>
        <rect x="14" y="21" width="10" height="1.5" rx="0.75" fill="white" opacity="0.7"/>
        {/* AI spark — top right of shield */}
        <circle cx="27" cy="14" r="5" fill="#2563eb"/>
        <path
          d="M27 10.5v1.5M27 16v1.5M23.5 14h1.5M29 14h1.5M24.6 11.6l1.1 1.1M28.3 15.3l1.1 1.1M24.6 16.4l1.1-1.1M28.3 12.7l1.1-1.1"
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
        />
        {/* Check mark — review complete */}
        <path
          d="M16 26.5l2.5 2.5 5.5-5.5"
          stroke="#60a5fa"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Full lockup: icon + wordmark
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className={className}>
      <IRBWizLogo size={size} variant="icon" />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span style={{
          fontSize: size * 0.55,
          fontWeight: 800,
          color: '#1e2d4e',
          letterSpacing: '-0.02em',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          IRB<span style={{ color: '#2563eb' }}>Wiz</span>
        </span>
        <span style={{
          fontSize: size * 0.26,
          color: '#64748b',
          fontWeight: 500,
          letterSpacing: '0.02em',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          Symbiotic Scholar Suite
        </span>
      </div>
    </div>
  );
}
