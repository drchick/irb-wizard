/**
 * /terms — IRBWiz Terms of Service (dedicated page)
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

function Li({ children }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-gold-500 mt-1 shrink-0">›</span>
      <span>{children}</span>
    </li>
  );
}

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service — IRBWiz</title>
        <meta name="description" content="IRBWiz Terms of Service — your rights and responsibilities when using the platform." />
      </Head>

      <div className="min-h-screen flex flex-col bg-navy-950 text-slate-300">
        <HomeNav />

        <main className="flex-1 py-14 px-4">
          <div className="max-w-3xl mx-auto">

            {/* Header */}
            <div className="mb-10">
              <p className="text-xs font-semibold text-gold-500 uppercase tracking-widest mb-2">Legal</p>
              <h1 className="text-4xl font-bold text-white mb-3">Terms of Service</h1>
              <p className="text-slate-500 text-sm">Last updated: {LAST_UPDATED} · Effective: {LAST_UPDATED}</p>
            </div>

            {/* Intro box */}
            <div className="bg-navy-800 border border-navy-700 rounded-xl p-5 mb-10 text-slate-400 text-sm leading-relaxed">
              These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of IRBWiz, operated by{' '}
              <strong className="text-slate-200">Symbiotic Scholar LLC</strong> at{' '}
              <strong className="text-slate-200">irbwiz.help</strong>. By creating an account or using IRBWiz,
              you agree to be bound by these Terms and our{' '}
              <Link href="/privacy" className="text-gold-400 hover:text-gold-300 underline">Privacy Policy</Link>.
              If you do not agree, do not use IRBWiz.
            </div>

            <Section number="1" title="Description of Service">
              <p>
                IRBWiz is an AI-assisted tool for preparing Institutional Review Board (IRB) protocol documents,
                including protocol descriptions, information sheets, consent forms, and recruitment materials.
                It is a <strong className="text-slate-200">preparation aid only.</strong>
              </p>
              <div className="bg-red-950/30 border border-red-800/40 rounded-lg p-3 mt-2">
                <p className="text-red-300 font-semibold text-xs uppercase tracking-wide mb-1">Important Disclaimer</p>
                <p className="text-red-200/80">
                  Use of IRBWiz does not constitute IRB review, IRB approval, or certification of regulatory
                  compliance. All generated documents must be reviewed by your institution's IRB before
                  submission. IRBWiz is not affiliated with, endorsed by, or a substitute for any institutional
                  IRB office.
                </p>
              </div>
              <p className="mt-3">
                IRBWiz is part of the <strong className="text-slate-200">Symbiotic Scholar Suite</strong> of
                AI-powered academic tools. Features include: a 10-step protocol wizard, rules-based IRB review
                classification (Exempt / Expedited / Full Board per 45 CFR 46), AI-powered per-section review
                via Anthropic Claude, and automated document generation.
              </p>
            </Section>

            <Section number="2" title="Eligibility">
              <p>You may use IRBWiz only if:</p>
              <ul className="space-y-1.5 mt-2">
                <Li>You are at least 18 years old</Li>
                <Li>You are a currently enrolled student, faculty member, researcher, or academic administrator at an accredited institution, or an independent researcher subject to IRB oversight</Li>
                <Li>You have the legal capacity to enter into a binding contract in your jurisdiction</Li>
                <Li>You are not barred from using the service under any applicable law or institutional policy</Li>
              </ul>
              <p className="mt-3">By registering, you represent that the information you provide is accurate and complete.</p>
            </Section>

            <Section number="3" title="User Responsibilities">
              <p>You are solely responsible for:</p>
              <ul className="space-y-1.5 mt-2">
                <Li>The accuracy, completeness, and truthfulness of all information you enter into the wizard</Li>
                <Li>Reviewing all AI-generated documents before submission — AI output may contain errors or omissions</Li>
                <Li>Complying with your institution's IRB policies, procedures, forms, and submission requirements</Li>
                <Li>Complying with all applicable federal regulations, including 45 CFR 46 (the Common Rule), 21 CFR 50 and 56 (FDA regulations where applicable), HIPAA, FERPA, and any state or local laws</Li>
                <Li>Obtaining proper IRB approval before commencing any human subjects research</Li>
                <Li>Consulting your institution's IRB office and legal counsel for complex regulatory questions</Li>
              </ul>
              <p className="mt-3">
                You may not use IRBWiz to generate documents for research that is designed to deceive, coerce,
                or cause undue harm to human subjects, or for any unlawful purpose.
              </p>
              <p className="mt-3">
                <strong className="text-slate-200">Do not enter real participant identifying information</strong> (names,
                SSNs, medical record numbers, or other PHI/PII) into the wizard. Describe your study population
                in general research terms only.
              </p>
            </Section>

            <Section number="4" title="Accounts">
              <p>
                You are responsible for maintaining the confidentiality of your login credentials and for all
                activity that occurs under your account. Notify us immediately at{' '}
                <a href={`mailto:${CONTACT}`} className="text-gold-400 hover:text-gold-300 underline">{CONTACT}</a>{' '}
                if you suspect unauthorized access.
              </p>
              <p>
                You may not share, sell, or transfer your account. Institutional or shared accounts require
                prior written agreement with Symbiotic Scholar LLC. We reserve the right to suspend or
                terminate accounts that violate these Terms.
              </p>
            </Section>

            <Section number="5" title="Credits & Payments">
              <p>
                Certain AI-powered features require credits. Beta users receive 1 free credit upon registration.
                Additional credits are available as single purchases or packs.
              </p>
              <ul className="space-y-1.5 mt-2">
                <Li>Credits are deducted when AI review features are used and are non-refundable once consumed</Li>
                <Li>Unused credits from single or pack purchases are non-refundable unless required by applicable law</Li>
                <Li>Annual plans may be cancelled before renewal; no partial-year refunds are issued</Li>
                <Li>Pricing is subject to change with 30 days' advance notice to registered users</Li>
                <Li>All payments are processed by Stripe, Inc. By making a purchase, you also agree to <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:text-gold-300 underline">Stripe's Terms of Service</a></Li>
              </ul>
              <p className="mt-3">
                If you believe a charge was made in error, contact us at{' '}
                <a href={`mailto:${CONTACT}`} className="text-gold-400 hover:text-gold-300 underline">{CONTACT}</a>{' '}
                within 14 days of the transaction.
              </p>
            </Section>

            <Section number="6" title="No Guarantee of IRB Approval">
              <p>
                IRBWiz provides AI-assisted document preparation based on 45 CFR 46, the Belmont Report, and
                general IRB best practices. Our rules-based classifier applies the statutory criteria for Exempt,
                Expedited, and Full Board review to the information you provide.
              </p>
              <p>
                <strong className="text-slate-200">We make no representation or warranty that any protocol
                prepared using IRBWiz will be approved by any IRB.</strong> IRBs exercise independent regulatory
                discretion. Two IRBs reviewing the same protocol may reach different conclusions based on
                institutional policy, local context, and reviewer judgment. The IRBWiz determination is a
                starting point — not a binding regulatory finding.
              </p>
            </Section>

            <Section number="7" title="AI-Generated Content">
              <p>
                IRBWiz uses Anthropic's Claude AI to generate review feedback and assist with protocol content.
                AI-generated content:
              </p>
              <ul className="space-y-1.5 mt-2">
                <Li>May contain inaccuracies, omissions, or outdated regulatory references</Li>
                <Li>Must be reviewed and verified by you before use in any official submission</Li>
                <Li>Does not constitute legal advice, regulatory guidance, or professional opinion</Li>
                <Li>Is not a substitute for consultation with your institution's IRB, legal counsel, or compliance office</Li>
              </ul>
            </Section>

            <Section number="8" title="Intellectual Property">
              <p>
                <strong className="text-slate-200">Documents you generate belong to you.</strong> IRBWiz grants
                you a non-exclusive license to use, download, and submit the protocol documents you create for
                your own research purposes.
              </p>
              <p>
                IRBWiz's platform software, branding, the ScholarlyFit Score algorithm (in affiliated products),
                document templates, underlying AI prompts, wizard logic, and all associated intellectual property
                remain the exclusive property of Symbiotic Scholar LLC. You may not reverse-engineer, copy,
                redistribute, or resell the platform or its outputs for commercial purposes.
              </p>
            </Section>

            <Section number="9" title="Acceptable Use">
              <p>You agree not to:</p>
              <ul className="space-y-1.5 mt-2">
                <Li>Enter false, fabricated, or misleading information into the wizard</Li>
                <Li>Use IRBWiz to prepare protocols for research you do not intend to submit to an IRB</Li>
                <Li>Scrape, crawl, or systematically extract content from the platform</Li>
                <Li>Attempt to circumvent credit systems, rate limits, or access controls</Li>
                <Li>Use the platform for any unlawful purpose or in violation of applicable law</Li>
                <Li>Impersonate any researcher, institution, or IRB official</Li>
              </ul>
            </Section>

            <Section number="10" title="Disclaimers & Limitation of Liability">
              <p className="text-slate-500 uppercase text-xs font-semibold tracking-wide">
                The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind.
              </p>
              <p>
                We do not warrant that IRBWiz will be uninterrupted, error-free, or that AI-generated content
                will be accurate or complete. We are not responsible for IRB rejection, research delays,
                regulatory non-compliance, or any other outcome arising from your use of IRBWiz-generated documents.
              </p>
              <p>
                To the maximum extent permitted by applicable law, Symbiotic Scholar LLC's total liability
                for any claim arising from your use of IRBWiz shall not exceed the greater of (a) $50 USD
                or (b) the total amount you paid us in the 90 days preceding the claim.
              </p>
              <p>
                We are not liable for indirect, incidental, special, consequential, or punitive damages,
                including loss of research data, academic standing, grant funding, or reputational harm.
              </p>
            </Section>

            <Section number="11" title="Indemnification">
              <p>
                You agree to indemnify and hold harmless Symbiotic Scholar LLC, its officers, directors,
                employees, and agents from any claims, damages, or expenses (including attorney's fees)
                arising from: (a) your use of IRBWiz; (b) your violation of these Terms; (c) any content
                you submit; or (d) your violation of any law or third-party right.
              </p>
            </Section>

            <Section number="12" title="Termination">
              <p>
                You may close your account at any time by contacting us at{' '}
                <a href={`mailto:${CONTACT}`} className="text-gold-400 hover:text-gold-300 underline">{CONTACT}</a>.
                Unused credits are forfeited upon account closure and are non-refundable except as required by law.
              </p>
              <p>
                We may suspend or terminate your account immediately if you violate these Terms, engage in
                fraudulent activity, or if required by law. Termination does not limit any other remedies
                available to us.
              </p>
            </Section>

            <Section number="13" title="Governing Law & Disputes">
              <p>
                These Terms are governed by the laws of the State of Connecticut, without regard to conflict
                of law principles. Any disputes shall be resolved in the state or federal courts of Fairfield
                County, Connecticut.
              </p>
              <p>
                Before filing a formal claim, we encourage you to contact us at{' '}
                <a href={`mailto:${CONTACT}`} className="text-gold-400 hover:text-gold-300 underline">{CONTACT}</a>{' '}
                to seek an informal resolution. Most issues can be resolved quickly this way.
              </p>
            </Section>

            <Section number="14" title="Changes to These Terms">
              <p>
                We may modify these Terms at any time. We will provide at least 14 days' notice of material
                changes by email to registered users and by updating the date above. Continued use after
                changes take effect constitutes acceptance. If you do not agree to revised Terms, you must
                stop using IRBWiz and close your account.
              </p>
            </Section>

            <Section number="15" title="Contact">
              <div className="bg-navy-800 border border-navy-700 rounded-lg p-4 text-sm">
                <p className="font-semibold text-slate-200 mb-1">Symbiotic Scholar LLC</p>
                <p>Email: <a href={`mailto:${CONTACT}`} className="text-gold-400 hover:text-gold-300 underline">{CONTACT}</a></p>
                <p>Website: <a href="https://irbwiz.help" className="text-gold-400 hover:text-gold-300 underline">irbwiz.help</a></p>
              </div>
            </Section>

            {/* Bottom nav */}
            <div className="border-t border-navy-800 pt-6 text-xs text-slate-600 flex flex-col sm:flex-row gap-3 justify-between">
              <span>© {new Date().getFullYear()} IRBWiz by Symbiotic Scholar LLC. All rights reserved.</span>
              <div className="flex gap-4">
                <Link href="/privacy" className="hover:text-slate-400 transition">Privacy Policy</Link>
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
