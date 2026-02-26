/**
 * /privacy — IRBWiz Privacy Policy (dedicated page)
 * Accessible without authentication; linked from footer and Stripe checkout.
 */
import Head from 'next/head';
import Link from 'next/link';
import HomeNav from '../components/layout/HomeNav';
import Footer from '../components/layout/Footer';

const LAST_UPDATED = 'February 25, 2026';
const CONTACT = 'hello@symbioticscholar.com';

function Section({ number, title, children }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-white mb-3 pb-2 border-b border-navy-700 flex items-center gap-2">
        <span className="text-gold-400 text-sm font-mono">{number}.</span> {title}
      </h2>
      <div className="space-y-3 text-slate-400 leading-relaxed text-sm">{children}</div>
    </section>
  );
}

function Sub({ title, children }) {
  return (
    <div className="mt-4">
      <h3 className="font-semibold text-slate-200 mb-1.5 text-sm">{title}</h3>
      <div className="text-slate-400 space-y-2 text-sm">{children}</div>
    </div>
  );
}

function Li({ children }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-gold-500 mt-1 shrink-0">›</span>
      <span>{children}</span>
    </li>
  );
}

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — IRBWiz</title>
        <meta name="description" content="IRBWiz Privacy Policy — how we collect, use, and protect your research and personal data." />
      </Head>

      <div className="min-h-screen flex flex-col bg-navy-950 text-slate-300">
        <HomeNav />

        <main className="flex-1 py-14 px-4">
          <div className="max-w-3xl mx-auto">

            {/* Header */}
            <div className="mb-10">
              <p className="text-xs font-semibold text-gold-500 uppercase tracking-widest mb-2">Legal</p>
              <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
              <p className="text-slate-500 text-sm">Last updated: {LAST_UPDATED} · Effective: {LAST_UPDATED}</p>
            </div>

            {/* Intro box */}
            <div className="bg-navy-800 border border-navy-700 rounded-xl p-5 mb-10 text-slate-400 text-sm leading-relaxed">
              IRBWiz is operated by <strong className="text-slate-200">Symbiotic Scholar LLC</strong> at{' '}
              <strong className="text-slate-200">irbwiz.help</strong>. This Privacy Policy explains what
              information we collect when you use IRBWiz, how we use it, who we share it with, and your
              rights regarding your data. By creating an account or using the service, you agree to this
              policy. If you do not agree, please do not use IRBWiz.
            </div>

            {/* ── Privacy at a Glance ─────────────────────────────────────── */}
            <div className="bg-navy-800/50 border border-navy-700 rounded-2xl p-6 mb-10">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
                ⊕ Your Privacy at a Glance
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">

                <div>
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">✓ What we use your data for</p>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    <li>• Save your protocol drafts and let you return to them</li>
                    <li>• Generate AI-powered reviews (opt-in, costs credits)</li>
                    <li>• Process credit purchases securely via Stripe</li>
                    <li>• Send account and receipt emails via Resend</li>
                    <li>• Improve the wizard and diagnose technical errors</li>
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">✗ What we NEVER do</p>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    <li>• Sell, rent, or trade your personal data</li>
                    <li>• Store your credit card number or CVV</li>
                    <li>• Share your protocol content with other users</li>
                    <li>• Use your content to train AI models</li>
                    <li>• Use advertising or cross-site tracking scripts</li>
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">🔒 How we protect your data</p>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    <li>• TLS encryption for all data in transit</li>
                    <li>• AES-256 encryption at rest (AWS/Supabase)</li>
                    <li>• Row-level security — your data is yours alone</li>
                    <li>• API keys server-side only, never in the browser</li>
                    <li>• Stripe webhook signature verification on payments</li>
                  </ul>
                </div>

              </div>
              <div className="border-t border-navy-700 pt-4">
                <p className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-2">👤 Your rights — always available, no questions asked</p>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-400 mb-3">
                  <span><strong className="text-slate-300">Access</strong> — get a copy of your data</span>
                  <span><strong className="text-slate-300">Correct</strong> — update anything</span>
                  <span><strong className="text-slate-300">Delete</strong> — full removal within 30 days</span>
                  <span><strong className="text-slate-300">Export</strong> — portable format</span>
                  <span><strong className="text-slate-300">Opt out of AI</strong> — AI reviews are always opt-in</span>
                </div>
                <p className="text-xs text-slate-500">
                  Email <a href="mailto:hello@symbioticscholar.com" className="text-gold-400 hover:text-gold-300 underline">hello@symbioticscholar.com</a> — we respond within 30 days.
                </p>
              </div>
            </div>

            <Section number="1" title="Information We Collect">
              <Sub title="Account Information">
                <p>When you register, we collect your name, email address, and password (bcrypt-hashed — never stored in plain text). We also record your role (researcher, faculty, student) and institutional affiliation if provided.</p>
              </Sub>

              <Sub title="Research Protocol Content">
                <p>IRBWiz stores the answers you enter across the 10-step wizard, including: study title, research objectives, participant population, inclusion/exclusion criteria, recruitment strategies, procedures, risks and benefits, data security measures, and consent form language. This content is stored so you can return to drafts and retrieve generated documents.</p>
                <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-3 mt-2">
                  <p className="text-amber-300 font-medium mb-1 text-xs uppercase tracking-wide">⚠ Sensitive Research Data Notice</p>
                  <p>IRB protocols often describe research involving vulnerable populations, medical or psychological procedures, or sensitive topics. <strong className="text-amber-200">Do not enter real participant names, identifying information, or PHI (Protected Health Information) into the wizard.</strong> Describe participant characteristics in general research terms only.</p>
                </div>
              </Sub>

              <Sub title="AI Review Inputs">
                <p>When you request an AI-powered review (which costs credits), your protocol content for that step is transmitted to Anthropic's Claude API for analysis. See Section 4 for details on what is shared and how it is handled.</p>
              </Sub>

              <Sub title="Usage and Analytics Data">
                <p>We collect standard server-side logs: pages visited, features used, study types submitted, AI review requests made, and error events. This data is used to improve IRBWiz and diagnose issues. We do not use third-party browser analytics scripts or advertising trackers.</p>
              </Sub>

              <Sub title="Payment Information">
                <p>Credit purchases are processed by <strong className="text-slate-200">Stripe, Inc.</strong> We never receive, store, or process your full credit card number, CVV, or banking credentials. We receive from Stripe: payment confirmation, transaction amount, and session metadata (user ID, credit quantity) for fulfillment.</p>
              </Sub>

              <Sub title="Contact Form Submissions">
                <p>If you contact us via the contact form, we collect your name, email, and message content in order to respond. These are stored in our database and not shared with third parties.</p>
              </Sub>
            </Section>

            <Section number="2" title="How We Use Your Information">
              <ul className="space-y-2">
                <Li>Provide the IRBWiz service: storing your protocol drafts, generating documents, and presenting AI-powered review feedback</Li>
                <Li>Process credit purchases and maintain your credit balance and purchase history</Li>
                <Li>Send transactional emails: account confirmation, password reset, purchase receipts, and support responses — via <strong className="text-slate-300">Resend, Inc.</strong></Li>
                <Li>Detect fraud, abuse, and security incidents</Li>
                <Li>Improve the wizard logic, document templates, and AI review prompts</Li>
                <Li>Respond to your support requests and contact form messages</Li>
              </ul>
              <p className="mt-3 text-slate-500 text-xs">
                We do <strong className="text-slate-300">not</strong> sell, rent, or trade your personal information or protocol content to third parties for marketing or commercial purposes.
              </p>
            </Section>

            <Section number="3" title="FERPA, HIPAA & Human Subjects Research">
              <p>IRBWiz serves academic researchers at universities subject to FERPA. IRB protocols may involve descriptions of student participants, educational records research, or health-related studies.</p>

              <Sub title="FERPA">
                <p>IRBWiz does not access official student educational records from your institution. Any student-related data you enter is submitted voluntarily by you as a researcher describing your study design — not sourced from institutional records. If your research involves student educational records, your institution's IRB and FERPA compliance officer should be consulted before submission.</p>
              </Sub>

              <Sub title="HIPAA">
                <p>IRBWiz is <strong className="text-slate-200">not a HIPAA-covered entity</strong> and is not designed to store Protected Health Information (PHI). If your research involves health data, describe it in de-identified research terms within the wizard. Do not enter actual patient records, medical record numbers, or other PHI. Your institution's IRB and privacy officer should guide you on HIPAA compliance for health research protocols.</p>
              </Sub>

              <Sub title="Research Participant Privacy">
                <p>Participant privacy is the core purpose of IRB oversight. We design IRBWiz to support that mission: your protocol data is isolated per user account, protected by row-level security, and never shared with other researchers on the platform.</p>
              </Sub>
            </Section>

            <Section number="4" title="Artificial Intelligence & Third-Party Services">
              <Sub title="Anthropic, Inc. (Claude AI)">
                <p>
                  When you trigger an AI review (per-section or comprehensive), the relevant protocol content for that step is sent to <strong className="text-slate-200">Anthropic, Inc.</strong> via their API. Anthropic processes this data to generate the review feedback you see. Key points:
                </p>
                <ul className="space-y-1.5 mt-2">
                  <Li>We send only the protocol content fields relevant to the step being reviewed — not your name, email, or institution</Li>
                  <Li><strong className="text-slate-300">We do not use your protocol content to train AI models</strong></Li>
                  <Li>Anthropic's data usage is governed by their <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:text-gold-300 underline">Privacy Policy</a></Li>
                  <Li>AI-generated reviews are advisory only — they do not constitute IRB review or approval</Li>
                </ul>
              </Sub>

              <Sub title="Supabase, Inc. (Database & Authentication)">
                <p>All user account data, protocol drafts, credit balances, and purchase records are stored in a <strong className="text-slate-200">Supabase</strong>-managed PostgreSQL database hosted on AWS infrastructure in the United States. Data is encrypted at rest (AES-256) and in transit (TLS 1.2+). Row-level security policies ensure that each user can only access their own data.</p>
              </Sub>

              <Sub title="Stripe, Inc. (Payments)">
                <p>All payment processing is handled by Stripe. Your payment card data goes directly to Stripe's PCI-compliant systems and is never transmitted to or stored by IRBWiz. Stripe's <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:text-gold-300 underline">Privacy Policy</a> governs your payment data.</p>
              </Sub>

              <Sub title="Resend, Inc. (Email Delivery)">
                <p>Transactional emails (account confirmation, password reset, receipts) are sent via Resend. Your email address is shared with Resend solely to deliver emails you have triggered. Resend does not receive your protocol content.</p>
              </Sub>

              <Sub title="Vercel, Inc. (Hosting & Edge Network)">
                <p>IRBWiz is deployed on Vercel's infrastructure. Standard HTTP request data (IP addresses, request paths, response times) passes through Vercel's servers for routing and CDN purposes.</p>
              </Sub>
            </Section>

            <Section number="5" title="Data Sharing">
              <p>We share your information only in these circumstances:</p>
              <ul className="space-y-2 mt-2">
                <Li><strong className="text-slate-300">Service providers</strong> — as described in Section 4, with the minimum data necessary for each to perform their function</Li>
                <Li><strong className="text-slate-300">Legal compliance</strong> — if required by applicable law, subpoena, court order, or governmental authority</Li>
                <Li><strong className="text-slate-300">Business transfer</strong> — in connection with a merger, acquisition, or sale of assets, with advance notice to users</Li>
                <Li><strong className="text-slate-300">Safety</strong> — to prevent imminent harm to a person or property where disclosure is legally permitted</Li>
              </ul>
              <p className="mt-3">We do not share your protocol content with other IRBWiz users, your institution, or any IRB without your explicit action (e.g., downloading and submitting documents yourself).</p>
            </Section>

            <Section number="6" title="Data Retention">
              <p>We retain your account and protocol data for as long as your account remains active. If you request account deletion, we will delete or anonymize your personal data and protocol content within <strong className="text-slate-200">30 days</strong>, except:</p>
              <ul className="space-y-1.5 mt-2">
                <Li>Stripe transaction records, which are retained for 7 years for financial compliance</Li>
                <Li>Aggregated, anonymized usage statistics that cannot be traced back to you</Li>
                <Li>Data we are required to retain by applicable law</Li>
              </ul>
            </Section>

            <Section number="7" title="Your Rights & Choices">
              <p>You have the right to:</p>
              <ul className="space-y-1.5 mt-2">
                <Li><strong className="text-slate-300">Access</strong> — request a copy of the personal data we hold about you</Li>
                <Li><strong className="text-slate-300">Correct</strong> — update your name or email via account settings</Li>
                <Li><strong className="text-slate-300">Delete</strong> — request deletion of your account and all associated protocol data</Li>
                <Li><strong className="text-slate-300">Export</strong> — request a portable copy of your data</Li>
                <Li><strong className="text-slate-300">Opt out of AI review</strong> — AI reviews are opt-in and credit-gated; you may choose not to use this feature</Li>
                <Li><strong className="text-slate-300">CCPA (California)</strong> — California residents may request disclosure of personal data categories collected and shared, and may opt out of the sale of personal data (we do not sell personal data)</Li>
                <Li><strong className="text-slate-300">GDPR (EU/EEA)</strong> — if you are located in the EU or EEA, you have rights to access, rectification, erasure, restriction, portability, and to object to processing</Li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, email{' '}
                <a href={`mailto:${CONTACT}`} className="text-gold-400 hover:text-gold-300 underline">{CONTACT}</a>.
                We will respond within 30 days.
              </p>
            </Section>

            <Section number="8" title="Security">
              <p>IRBWiz implements multiple layers of protection:</p>
              <ul className="space-y-1.5 mt-2">
                <Li>TLS encryption for all data in transit</Li>
                <Li>AES-256 encryption for data at rest (Supabase/AWS)</Li>
                <Li>Row-level security on all database tables — no user can access another user's data</Li>
                <Li>API keys (Anthropic, Stripe, Supabase service role) are server-side only, never exposed to the browser</Li>
                <Li>Stripe webhook signature verification to prevent fake payment events</Li>
                <Li>bcrypt password hashing — plaintext passwords are never stored</Li>
              </ul>
              <p className="mt-3">No system is 100% secure. If you believe your account has been compromised, contact us immediately at <a href={`mailto:${CONTACT}`} className="text-gold-400 hover:text-gold-300 underline">{CONTACT}</a>.</p>
            </Section>

            <Section number="9" title="Cookies">
              <p>IRBWiz uses only essential cookies for authentication session management (Supabase JWT tokens). We do not use advertising cookies, cross-site tracking cookies, or third-party analytics scripts. You cannot opt out of essential authentication cookies without losing the ability to stay logged in.</p>
            </Section>

            <Section number="10" title="Children's Privacy">
              <p>IRBWiz is designed for university-level researchers, faculty, and graduate students. We do not knowingly collect personal information from anyone under the age of 18. If we discover that a minor has created an account, we will delete it promptly.</p>
            </Section>

            <Section number="11" title="Changes to This Policy">
              <p>We may update this Privacy Policy from time to time. We will notify registered users of material changes by email and will update the date at the top of this page. Continued use of IRBWiz after changes take effect constitutes acceptance of the revised policy.</p>
            </Section>

            <Section number="12" title="Contact">
              <div className="bg-navy-800 border border-navy-700 rounded-lg p-4 text-sm">
                <p className="font-semibold text-slate-200 mb-1">Symbiotic Scholar LLC — Privacy</p>
                <p>Email: <a href={`mailto:${CONTACT}`} className="text-gold-400 hover:text-gold-300 underline">{CONTACT}</a></p>
                <p>Website: <a href="https://irbwiz.help" className="text-gold-400 hover:text-gold-300 underline">irbwiz.help</a></p>
              </div>
            </Section>

            {/* Bottom nav */}
            <div className="border-t border-navy-800 pt-6 text-xs text-slate-600 flex flex-col sm:flex-row gap-3 justify-between">
              <span>© {new Date().getFullYear()} IRBWiz by Symbiotic Scholar LLC. All rights reserved.</span>
              <div className="flex gap-4">
                <Link href="/terms" className="hover:text-slate-400 transition">Terms of Service</Link>
                <Link href="/" className="hover:text-slate-400 transition">← Back to IRBWiz</Link>
              </div>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
