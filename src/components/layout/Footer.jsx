/**
 * Footer — Symbiotic Scholar Suite brand footer for IRBWiz
 * 3-column layout: Brand | Resources | Symbiotic Scholar
 *
 * Resources column includes a "Legal Disclaimer" button that opens a
 * modal explaining output accuracy, IRB discretion, and tool limitations.
 */
import { useState, useEffect } from 'react';
import IRBWizLogo from './IRBWizLogo';

const DARKER  = '#0a1628';
const BORDER  = '#1a2e4a';
const MUTED   = '#94a3b8';
const SOFT    = '#64748b';
const BRIGHT  = '#e2e8f0';
const GOLD    = '#fbbf24';
const GREEN   = '#10b981';   // Symbiotic Scholar
const PURPLE  = '#a78bfa';   // Dr. Dissertation
const TEAL    = '#2dd4bf';   // Peer-Review PRO

// ─── Disclaimer Modal ─────────────────────────────────────────────────────────
const DISCLAIMERS = [
  {
    icon: '✅',
    title: 'Regulatory Framework Is Accurate',
    body: 'The review categories (Exempt, Expedited, Full Board), CFR citations (e.g., 45 CFR 46.104(d), 45 CFR 46.110), and document templates are grounded in real federal regulations — the Common Rule (45 CFR 46) and the Belmont Report. The classification logic follows the actual statutory decision criteria used by IRBs nationwide.',
  },
  {
    icon: '⚖️',
    title: 'IRBs Have Final Authority',
    body: 'IRBs hold regulatory discretion in applying the Common Rule. Two IRBs reviewing the same protocol may reach different conclusions based on institutional policies, local context, or reviewer judgment. IRBWiz provides the most defensible classification based on the information you enter — it does not constitute a binding determination and cannot predict your institution\'s specific decision.',
  },
  {
    icon: '📄',
    title: 'Preparation Aid — Not IRB Approval',
    body: 'IRBWiz generates starting-point documents for IRB submission: protocol descriptions, consent forms, recruitment materials, and special forms. All generated documents must be reviewed by your institution\'s IRB and may be modified before or after submission. Use of this tool does not constitute IRB approval, guarantee approval, or substitute for consultation with your institution\'s IRB office.',
  },
];

function DisclaimerModal({ onClose }) {
  // Close on Escape key
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(2, 10, 26, 0.85)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div style={{
        background: '#0e1e35',
        border: '1px solid #1a2e4a',
        borderRadius: 16,
        width: '100%',
        maxWidth: 580,
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid #1a2e4a',
        }}>
          <div>
            <h2 style={{ color: BRIGHT, fontSize: 17, fontWeight: 700, margin: 0 }}>
              Legal &amp; Accuracy Disclaimer
            </h2>
            <p style={{ color: MUTED, fontSize: 12, margin: '4px 0 0', lineHeight: 1.4 }}>
              Please read before relying on IRBWiz output for a real submission
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close disclaimer"
            style={{
              background: 'none', border: '1px solid #1a2e4a', borderRadius: 8,
              color: MUTED, cursor: 'pointer', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, flexShrink: 0, marginLeft: 12,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {DISCLAIMERS.map((d, i) => (
              <div key={i} style={{
                background: '#162236',
                border: '1px solid #1a2e4a',
                borderLeft: '3px solid #2c64a5',
                borderRadius: 10,
                padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{d.icon}</span>
                  <h3 style={{ color: BRIGHT, fontSize: 14, fontWeight: 700, margin: 0 }}>
                    {d.title}
                  </h3>
                </div>
                <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                  {d.body}
                </p>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <p style={{
            color: SOFT, fontSize: 11, lineHeight: 1.6,
            marginTop: 18, marginBottom: 0,
            borderTop: '1px solid #1a2e4a', paddingTop: 14,
          }}>
            IRBWiz is an AI-assisted preparation tool developed by{' '}
            <a href="https://symbioticscholar.com" target="_blank" rel="noopener noreferrer"
              style={{ color: GREEN }}>Symbiotic Scholar</a>.
            {' '}Always consult your institution&apos;s IRB office before submitting any
            research protocol. For questions, contact{' '}
            <a href="mailto:hello@symbioticscholar.com"
              style={{ color: GOLD }}>hello@symbioticscholar.com</a>.
          </p>

        </div>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
export default function Footer() {
  const year = new Date().getFullYear();
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  return (
    <>
      {showDisclaimer && <DisclaimerModal onClose={() => setShowDisclaimer(false)} />}

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

          {/* Resources column */}
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
            <FooterLink href="https://www.doctordissertation.com" external label="Dr. Dissertation" color={PURPLE} />
            <FooterLink href="https://peerreviewpro.com" external label="Peer-Review PRO" color={TEAL} />
            <FooterLink href="https://irbwiz.help" external label="IRBWiz" color={GOLD} />
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
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <a href="https://irbwiz.help/privacy" target="_blank" rel="noopener noreferrer" style={{ color: SOFT, textDecoration: 'none' }}>Privacy Policy</a>
            <a href="https://irbwiz.help/terms" target="_blank" rel="noopener noreferrer" style={{ color: SOFT, textDecoration: 'none' }}>Terms of Service</a>
            <button
              onClick={() => setShowDisclaimer(true)}
              style={{
                background: 'none', border: 'none', padding: 0,
                fontSize: 12, color: SOFT, cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => e.target.style.color = MUTED}
              onMouseLeave={e => e.target.style.color = SOFT}
            >
              Legal Disclaimer
            </button>
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
             style={{ color: GREEN, textDecoration: 'none' }}>Symbiotic Scholar</a>
          {' '}family of AI-powered academic tools.{' '}
          Also see:{' '}
          <a href="https://www.doctordissertation.com" target="_blank" rel="noopener noreferrer"
             style={{ color: PURPLE, textDecoration: 'none' }}>Dr. Dissertation</a>
          {' '}·{' '}
          <a href="https://peerreviewpro.com" target="_blank" rel="noopener noreferrer"
             style={{ color: TEAL, textDecoration: 'none' }}>Peer-Review PRO</a>
        </div>
      </footer>
    </>
  );
}

function FooterLink({ href, label, external = false, color = MUTED }) {
  const style = {
    display: 'block',
    fontSize: 13,
    color,
    textDecoration: 'none',
    marginBottom: 9,
  };
  return external
    ? <a href={href} target="_blank" rel="noopener noreferrer" style={style}>{label}</a>
    : <a href={href} style={style}>{label}</a>;
}
