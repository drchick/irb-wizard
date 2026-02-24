/**
 * Footer — Symbiotic Scholar Suite brand footer for IRBWiz
 * 3-column layout: Brand | Resources | Symbiotic Scholar
 *
 * Bottom bar includes modal pop-outs for:
 *   Privacy Policy · Terms of Service · Legal Disclaimer
 */
import { useState, useEffect } from 'react';
import IRBWizLogo from './IRBWizLogo';

const DARKER  = '#0a1628';
const BORDER  = '#1a2e4a';
const MUTED   = '#94a3b8';
const SOFT    = '#64748b';
const BRIGHT  = '#e2e8f0';
const GOLD    = '#fbbf24';
const GREEN   = '#10b981';
const PURPLE  = '#a78bfa';
const TEAL    = '#2dd4bf';

// ─── Shared PolicyModal ───────────────────────────────────────────────────────
// sections: [{ title, body }]  |  footnote: optional bottom note string/JSX
function PolicyModal({ title, subtitle, sections, footnote, onClose }) {
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
        background: 'rgba(2, 10, 26, 0.88)',
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
        maxWidth: 600,
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 1,
          background: '#0e1e35',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid #1a2e4a',
        }}>
          <div>
            <h2 style={{ color: BRIGHT, fontSize: 17, fontWeight: 700, margin: 0 }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ color: MUTED, fontSize: 12, margin: '4px 0 0', lineHeight: 1.4 }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {sections.map((s, i) => (
              <div key={i}>
                <h3 style={{
                  color: BRIGHT, fontSize: 13, fontWeight: 700,
                  margin: '0 0 6px', textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {s.title}
                </h3>
                <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.75 }}>
                  {s.body}
                </div>
                {i < sections.length - 1 && (
                  <div style={{ borderBottom: '1px solid #1a2e4a', marginTop: 20 }} />
                )}
              </div>
            ))}
          </div>

          {footnote && (
            <p style={{
              color: SOFT, fontSize: 11, lineHeight: 1.6,
              marginTop: 24, marginBottom: 0,
              borderTop: '1px solid #1a2e4a', paddingTop: 14,
            }}>
              {footnote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Privacy Policy content ───────────────────────────────────────────────────
const PRIVACY_SECTIONS = [
  {
    title: 'Information We Collect',
    body: (
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        <li style={{ marginBottom: 6 }}><strong style={{ color: BRIGHT }}>Account information</strong> — name, email address, and institution when you create an account.</li>
        <li style={{ marginBottom: 6 }}><strong style={{ color: BRIGHT }}>Protocol content</strong> — the research details you enter into the wizard to generate documents. This data is stored to provide the service.</li>
        <li style={{ marginBottom: 6 }}><strong style={{ color: BRIGHT }}>Usage data</strong> — pages visited, features used, and study types submitted, used to improve the product.</li>
        <li><strong style={{ color: BRIGHT }}>Payment information</strong> — processed entirely by Stripe. We never store or see full card numbers or banking details.</li>
      </ul>
    ),
  },
  {
    title: 'How We Use Your Information',
    body: (
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        <li style={{ marginBottom: 6 }}>To provide, operate, and improve IRBWiz.</li>
        <li style={{ marginBottom: 6 }}>To process payments via Stripe and send purchase receipts.</li>
        <li style={{ marginBottom: 6 }}>To send transactional emails (account notices, support responses).</li>
        <li style={{ marginBottom: 6 }}><strong style={{ color: BRIGHT }}>We do not sell your personal data</strong> to third parties.</li>
        <li><strong style={{ color: BRIGHT }}>We do not use your protocol content to train AI models.</strong></li>
      </ul>
    ),
  },
  {
    title: 'Data Storage & Security',
    body: 'Account data, credits, and protocol inputs are stored in Supabase (hosted on AWS infrastructure). Data is encrypted in transit (TLS) and at rest. We retain your data for as long as your account is active. You may request deletion of your data at any time by emailing hello@symbioticscholar.com.',
  },
  {
    title: 'Third-Party Services',
    body: (
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        <li style={{ marginBottom: 6 }}><strong style={{ color: BRIGHT }}>Stripe</strong> — payment processing. Subject to Stripe's privacy policy.</li>
        <li style={{ marginBottom: 6 }}><strong style={{ color: BRIGHT }}>Supabase</strong> — database and authentication.</li>
        <li style={{ marginBottom: 6 }}><strong style={{ color: BRIGHT }}>Anthropic Claude API</strong> — AI-powered protocol review. Content submitted for AI analysis is subject to Anthropic's data use policy.</li>
        <li><strong style={{ color: BRIGHT }}>Resend</strong> — transactional email delivery.</li>
      </ul>
    ),
  },
  {
    title: 'Cookies',
    body: 'We use essential cookies for authentication and session management only. We do not use advertising, tracking, or analytics cookies.',
  },
  {
    title: 'Your Privacy Rights',
    body: 'You may request access to, correction of, or deletion of your personal data at any time by contacting hello@symbioticscholar.com. California residents have additional rights under the CCPA. EU/EEA residents have rights under the GDPR, including the right to data portability.',
  },
  {
    title: 'Contact',
    body: (
      <>
        For privacy questions or data requests, email{' '}
        <a href="mailto:hello@symbioticscholar.com" style={{ color: GOLD }}>
          hello@symbioticscholar.com
        </a>.
        IRBWiz is operated by Symbiotic Scholar.
      </>
    ),
  },
];

// ─── Terms of Service content ─────────────────────────────────────────────────
const TERMS_SECTIONS = [
  {
    title: 'Acceptance of Terms',
    body: 'By accessing or using IRBWiz, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service. We may update these terms from time to time; continued use constitutes acceptance of the updated terms.',
  },
  {
    title: 'Description of Service',
    body: 'IRBWiz is an AI-assisted tool for preparing IRB protocol documents, including protocol descriptions, consent forms, and recruitment materials. It is a preparation aid only. Use of IRBWiz does not constitute IRB review, approval, or compliance certification.',
  },
  {
    title: 'User Responsibilities',
    body: (
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        <li style={{ marginBottom: 6 }}>You are solely responsible for the accuracy and completeness of the information you enter.</li>
        <li style={{ marginBottom: 6 }}>You must review all generated documents before submission to your institution's IRB.</li>
        <li style={{ marginBottom: 6 }}>You must comply with your institution's IRB policies, procedures, and any applicable federal, state, or local regulations.</li>
        <li>You may not use IRBWiz for unlawful purposes or to generate documents for research involving deception, coercion, or undue risk to human subjects without proper oversight.</li>
      </ul>
    ),
  },
  {
    title: 'Payment Terms',
    body: (
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        <li style={{ marginBottom: 6 }}>Credits are deducted when AI-powered features are used and are non-refundable once consumed.</li>
        <li style={{ marginBottom: 6 }}>Unused credits from single or pack purchases are non-refundable unless required by applicable law.</li>
        <li style={{ marginBottom: 6 }}>Annual plans may be cancelled before renewal; no partial-year refunds are issued.</li>
        <li>Pricing is subject to change with 30 days' advance notice.</li>
      </ul>
    ),
  },
  {
    title: 'No Guarantee of IRB Approval',
    body: 'IRBWiz provides assistance with protocol preparation based on 45 CFR 46 and general IRB best practices. We make no representation or warranty that any protocol prepared using IRBWiz will be approved by any IRB. Approval decisions rest entirely with the reviewing institution.',
  },
  {
    title: 'Intellectual Property',
    body: 'The documents you generate using IRBWiz belong to you. IRBWiz\'s software, branding, underlying algorithms, document templates, and all associated intellectual property remain the exclusive property of Symbiotic Scholar. You may not reverse-engineer, copy, or redistribute the platform.',
  },
  {
    title: 'Limitation of Liability',
    body: 'To the maximum extent permitted by law, IRBWiz and Symbiotic Scholar are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the service — including, without limitation, IRB rejection, research delays, or regulatory non-compliance. The service is provided "as is" without warranties of any kind.',
  },
  {
    title: 'Governing Law',
    body: 'These Terms are governed by the laws of the State of Connecticut, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Fairfield County, Connecticut.',
  },
  {
    title: 'Contact',
    body: (
      <>
        Questions about these Terms? Email{' '}
        <a href="mailto:hello@symbioticscholar.com" style={{ color: GOLD }}>
          hello@symbioticscholar.com
        </a>.
      </>
    ),
  },
];

// ─── Disclaimer content ───────────────────────────────────────────────────────
const DISCLAIMER_SECTIONS = [
  {
    title: '✅  Regulatory Framework Is Accurate',
    body: 'The review categories (Exempt, Expedited, Full Board), CFR citations (e.g., 45 CFR 46.104(d), 45 CFR 46.110), and document templates are grounded in real federal regulations — the Common Rule (45 CFR 46) and the Belmont Report. The classification logic follows the actual statutory decision criteria used by IRBs nationwide.',
  },
  {
    title: '⚖️  IRBs Have Final Authority',
    body: 'IRBs hold regulatory discretion in applying the Common Rule. Two IRBs reviewing the same protocol may reach different conclusions based on institutional policies, local context, or reviewer judgment. IRBWiz provides the most defensible classification based on the information you enter — it does not constitute a binding determination and cannot predict your institution\'s specific decision.',
  },
  {
    title: '📄  Preparation Aid — Not IRB Approval',
    body: 'IRBWiz generates starting-point documents for IRB submission: protocol descriptions, consent forms, recruitment materials, and special forms. All generated documents must be reviewed by your institution\'s IRB and may be modified before or after submission. Use of this tool does not constitute IRB approval, guarantee approval, or substitute for consultation with your institution\'s IRB office.',
  },
];

// ─── Shared bottom-bar button style ──────────────────────────────────────────
function BottomBarButton({ label, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'none', border: 'none', padding: 0,
        fontSize: 12, color: hovered ? MUTED : SOFT,
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'color 0.15s',
      }}
    >
      {label}
    </button>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
export default function Footer() {
  const year = new Date().getFullYear();
  const [modal, setModal] = useState(null); // 'privacy' | 'terms' | 'disclaimer' | null

  const LAST_UPDATED = 'February 2026';

  return (
    <>
      {modal === 'privacy' && (
        <PolicyModal
          title="Privacy Policy"
          subtitle={`Effective date: ${LAST_UPDATED} · IRBWiz by Symbiotic Scholar`}
          sections={PRIVACY_SECTIONS}
          footnote={`Last updated: ${LAST_UPDATED}. This policy applies to irbwiz.help and related services operated by Symbiotic Scholar.`}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'terms' && (
        <PolicyModal
          title="Terms of Service"
          subtitle={`Effective date: ${LAST_UPDATED} · IRBWiz by Symbiotic Scholar`}
          sections={TERMS_SECTIONS}
          footnote={`Last updated: ${LAST_UPDATED}. By using IRBWiz you agree to these terms.`}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'disclaimer' && (
        <PolicyModal
          title="Legal & Accuracy Disclaimer"
          subtitle="Please read before relying on IRBWiz output for a real submission"
          sections={DISCLAIMER_SECTIONS}
          footnote={
            <>
              IRBWiz is an AI-assisted preparation tool developed by{' '}
              <a href="https://symbioticscholar.com" target="_blank" rel="noopener noreferrer"
                style={{ color: GREEN }}>Symbiotic Scholar</a>.
              {' '}Always consult your institution's IRB office before submitting any research protocol.
              {' '}Questions? Email{' '}
              <a href="mailto:hello@symbioticscholar.com" style={{ color: GOLD }}>
                hello@symbioticscholar.com
              </a>.
            </>
          }
          onClose={() => setModal(null)}
        />
      )}

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
            <BottomBarButton label="Privacy Policy"   onClick={() => setModal('privacy')} />
            <BottomBarButton label="Terms of Service" onClick={() => setModal('terms')} />
            <BottomBarButton label="Legal Disclaimer" onClick={() => setModal('disclaimer')} />
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
