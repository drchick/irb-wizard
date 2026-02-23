/**
 * Footer — Symbiotic Scholar Suite brand footer for IRBWiz
 * 3-column layout: Brand | Resources | Symbiotic Scholar
 */
import IRBWizLogo from './IRBWizLogo';

const DARKER  = '#0a1628';
const BORDER  = '#1a2e4a';
const MUTED   = '#94a3b8';
const SOFT    = '#64748b';
const BRIGHT  = '#e2e8f0';
const GOLD    = '#fbbf24';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="no-print"
      style={{ background: DARKER, color: MUTED, padding: '56px 24px 28px' }}
    >
      {/* ── 3-column grid ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr',
        gap: 48,
        maxWidth: 1000,
        margin: '0 auto 40px',
      }}>
        {/* Brand column */}
        <div>
          <IRBWizLogo size={38} variant="full" theme="dark" style={{ marginBottom: 14 }} />
          <p style={{ fontSize: 13, lineHeight: 1.75, marginTop: 14, maxWidth: 280 }}>
            AI-assisted IRB protocol preparation for researchers at the University of
            Bridgeport and beyond. Rules-based review classification guided by 45 CFR 46
            and the Belmont Report.
          </p>
        </div>

        {/* Resources column — includes IRB Review Guide */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: BRIGHT, marginBottom: 14 }}>
            Resources
          </h4>
          <FooterLink href="/irb-review-guide.html" label="IRB Review Guide" />
          <FooterLink href="https://www.bridgeport.edu/research/irb/" external label="UB IRB Office" />
          <FooterLink href="https://www.hhs.gov/ohrp/regulations-and-policy/regulations/45-cfr-46/index.html" external label="45 CFR 46" />
          <FooterLink href="https://www.hhs.gov/ohrp/regulations-and-policy/belmont-report/index.html" external label="Belmont Report" />
          <FooterLink href="https://about.citiprogram.org/" external label="CITI Training" />
        </div>

        {/* Suite column */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: BRIGHT, marginBottom: 14 }}>
            Symbiotic Scholar
          </h4>
          <FooterLink href="https://symbioticscholar.com" external label="Symbiotic Scholar" highlight />
          <FooterLink href="https://www.doctordissertation.com" external label="Dr. Dissertation" />
          <FooterLink href="https://peerreviewpro.com" external label="Peer-Review PRO" />
          <FooterLink href="#" label="IRBWiz" highlight />
        </div>
      </div>

      {/* ── Footer bottom ─────────────────────────────────────────────────── */}
      <div style={{
        borderTop: `1px solid ${BORDER}`,
        paddingTop: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 1000,
        margin: '0 auto',
        fontSize: 12,
        flexWrap: 'wrap',
        gap: 10,
        color: SOFT,
      }}>
        <span>© {year} IRBWiz by Symbiotic Scholar. All rights reserved.</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <a href="#" style={{ color: SOFT, textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: SOFT, textDecoration: 'none' }}>Terms of Service</a>
        </div>
      </div>

      {/* ── Symbiotic Scholar bar ─────────────────────────────────────────── */}
      <div style={{
        fontSize: 12,
        color: SOFT,
        textAlign: 'center',
        marginTop: 14,
        paddingTop: 14,
        borderTop: `1px solid ${BORDER}`,
        maxWidth: 1000,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        Part of the{' '}
        <a href="https://symbioticscholar.com" target="_blank" rel="noopener noreferrer"
           style={{ color: GOLD, textDecoration: 'none' }}>Symbiotic Scholar</a>
        {' '}family of AI-powered academic tools.{' '}
        Also see:{' '}
        <a href="https://www.doctordissertation.com" target="_blank" rel="noopener noreferrer"
           style={{ color: GOLD, textDecoration: 'none' }}>Dr. Dissertation</a>
        {' '}·{' '}
        <a href="https://peerreviewpro.com" target="_blank" rel="noopener noreferrer"
           style={{ color: GOLD, textDecoration: 'none' }}>Peer-Review PRO</a>
      </div>
    </footer>
  );
}

function FooterLink({ href, label, external = false, highlight = false }) {
  const style = {
    display: 'block',
    fontSize: 13,
    color: highlight ? GOLD : '#94a3b8',
    textDecoration: 'none',
    marginBottom: 9,
  };
  return external
    ? <a href={href} target="_blank" rel="noopener noreferrer" style={style}>{label}</a>
    : <a href={href} style={style}>{label}</a>;
}
