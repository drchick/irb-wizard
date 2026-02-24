/**
 * pages/index.jsx — IRBWiz landing page
 * Full-width, large hero, spacious sections
 */
import { useRouter } from 'next/router';
import Link from 'next/link';
import HomeNav from '../components/layout/HomeNav';
import Footer  from '../components/layout/Footer';
import {
  ClipboardList, Sparkles, FileDown,
  GraduationCap, FlaskConical, CheckCircle2, ArrowRight,
  ShieldCheck, Clock, FileText, Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const { user } = useAuth();
  const router   = useRouter();
  const handleStart = () => router.push(user ? '/wizard' : '/login');

  return (
    <section className="relative bg-navy-900 text-white overflow-hidden">
      {/* Background gradient accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-navy-700/40 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full px-8 lg:px-14 py-32 md:py-48 lg:py-56">
        <div className="max-w-5xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-navy-800/80 border border-navy-600 rounded-full px-4 py-1.5 text-xs font-semibold text-gold-400 uppercase tracking-widest mb-8">
            <Zap size={11} className="fill-gold-400" />
            Part of the Symbiotic Scholar Suite
          </div>

          {/* Main headline */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold leading-[0.9] tracking-tight mb-8"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-gold-400">IRB</span>
            <span className="text-white">Wiz</span>
          </h1>

          {/* Subheadline */}
          <p className="text-2xl md:text-3xl lg:text-4xl font-light text-slate-200 max-w-3xl leading-snug mb-6">
            AI-powered IRB protocol preparation<br className="hidden md:block" /> for serious researchers.
          </p>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-12">
            Answer 10 guided questions — get a complete, submission-ready IRB protocol package.
            No legal jargon. No weeks of confusion. Just clean documents, ready to submit.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-14">
            <button onClick={handleStart}
              className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-10 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-gold-500/20">
              Start Your Protocol <ArrowRight size={20} />
            </button>
            <a href="#pricing"
              className="inline-flex items-center justify-center gap-2 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-10 py-4 rounded-xl text-lg transition-colors">
              See Pricing ↓
            </a>
          </div>

          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 border border-navy-700 rounded-xl px-5 py-3 text-sm text-slate-400">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            Built for University of Bridgeport IRB — adaptable to any US institution
          </div>
        </div>
      </div>

      {/* Bottom gradient fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-white pointer-events-none" />
    </section>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
function StatsBar() {
  return (
    <section className="bg-white border-b border-slate-100">
      <div className="w-full px-8 lg:px-14 py-10">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6 md:gap-12 text-center">
          {[
            { icon: FileText,    value: '11',         label: 'IRB documents generated per protocol' },
            { icon: Clock,       value: '10+ hours',  label: 'saved per submission' },
            { icon: ShieldCheck, value: '45 CFR 46',  label: 'federal compliance built in' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon size={22} className="text-navy-400" />
              <p className="text-3xl md:text-4xl font-bold text-navy-900">{value}</p>
              <p className="text-xs md:text-sm text-slate-500 max-w-[140px]">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ──────────────────────────────────────────────────────────────
const HOW_STEPS = [
  { icon: ClipboardList, number: '01', title: 'Answer 10 guided questions',      desc: 'Our wizard walks you through every IRB requirement — study design, subjects, risks, consent, and more. No legal jargon, just plain-language prompts.' },
  { icon: Sparkles,      number: '02', title: 'Get AI-powered review',            desc: "Claude AI reviews each section for consistency and compliance with 45 CFR 46. Your likely review level (Exempt, Expedited, or Full Board) updates in real time." },
  { icon: FileDown,      number: '03', title: 'Download your complete package',   desc: 'Get every document you need: Protocol Description, Consent Form, Recruitment Materials, Parental Permission, HIPAA Authorization — all as formatted Word files.' },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-28 px-8 lg:px-14">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <p className="text-gold-500 text-sm font-semibold uppercase tracking-widest mb-3">Process</p>
          <h2 className="text-4xl md:text-5xl font-bold text-navy-900">How IRBWiz Works</h2>
          <p className="text-slate-500 mt-4 text-xl max-w-2xl">From blank page to submission-ready package in one sitting.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {HOW_STEPS.map((step, i) => (
            <div key={i} className="relative">
              {i < HOW_STEPS.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(50%+3.5rem)] w-[calc(100%-7rem)] h-px bg-navy-100" />
              )}
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-navy-50 border border-navy-100 mb-6">
                <step.icon size={30} className="text-navy-600" />
                <span className="absolute -top-2.5 -right-2.5 bg-navy-800 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">
                  {step.number}
                </span>
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-3">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Who It's For ──────────────────────────────────────────────────────────────
function WhoItsFor() {
  return (
    <section id="features" className="bg-slate-50 py-28 px-8 lg:px-14">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <p className="text-gold-500 text-sm font-semibold uppercase tracking-widest mb-3">Who It's For</p>
          <h2 className="text-4xl md:text-5xl font-bold text-navy-900">Built for Every Researcher</h2>
          <p className="text-slate-500 mt-4 text-xl max-w-2xl">Whether you're writing your first protocol or your fiftieth.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-10 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-navy-50 flex items-center justify-center shrink-0">
                <GraduationCap size={28} className="text-navy-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy-900">Student Researchers</h3>
                <p className="text-sm text-slate-500">Undergrad · Master's · PhD</p>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed mb-6">
              Stop spending weeks decoding IRB regulations. IRBWiz guides you through every requirement,
              flags problems before your advisor sees them, and generates all the documents you need to submit.
            </p>
            <ul className="space-y-2.5">
              {['Plain-language explanations of federal rules','Flags common student mistakes before submission','Faculty advisor requirements built in','CITI certificate verification'].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />{item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-10 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gold-50 flex items-center justify-center shrink-0">
                <FlaskConical size={28} className="text-gold-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy-900">Faculty Researchers</h3>
                <p className="text-sm text-slate-500">Assistant · Associate · Full Professor</p>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed mb-6">
              Speed up your lab's IRB submissions. Get consistent, complete, IRB-ready document packages
              every time — for your own protocols and every student you advise.
            </p>
            <ul className="space-y-2.5">
              {['Full document suite in minutes, not days','AI review flags consistency issues instantly','Standardized templates across your lab','Supports Exempt, Expedited, and Full Board protocols'].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ───────────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: 'Starter',
    price: '$9',
    per: '1 report credit',
    perCredit: '$9.00/credit',
    highlight: false,
    description: 'Perfect for a thesis, dissertation, or one-time project.',
    features: ['1 protocol report credit','Full 10-step protocol wizard','AI section reviews (free)','Complete 11-document package','Download as Word (.docx) files'],
    cta: 'Buy Starter Pack',
    ctaStyle: 'border',
  },
  {
    name: 'Standard',
    price: '$20',
    per: '3 report credits',
    perCredit: '$6.67/credit',
    highlight: true,
    badge: 'Most Popular',
    description: 'For faculty or students with multiple protocols to file.',
    features: ['3 protocol report credits','Everything in Starter','Save vs Starter','Credits never expire','Priority email support'],
    cta: 'Buy Standard Pack',
    ctaStyle: 'filled',
  },
  {
    name: 'Pro',
    price: '$50',
    per: '10 report credits',
    perCredit: '$5.00/credit',
    highlight: false,
    description: 'For labs, research centers, and heavy users.',
    features: ['10 protocol report credits','Everything in Standard','Best per-credit rate','Ideal for labs & departments','Invoice/PO billing available'],
    cta: 'Buy Pro Pack',
    ctaStyle: 'border',
  },
];

function Pricing() {
  const { user } = useAuth();
  const router   = useRouter();
  const handleCta = () => router.push(user ? '/account' : '/login');

  return (
    <section id="pricing" className="bg-white py-28 px-8 lg:px-14">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <p className="text-gold-500 text-sm font-semibold uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-bold text-navy-900">Simple Credit Packs</h2>
          <p className="text-slate-500 mt-4 text-xl max-w-2xl">
            Pay per protocol — not a monthly subscription you'll forget to cancel.
            <span className="text-emerald-600 font-medium"> Beta users get 1 free credit to start.</span>
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan) => (
            <div key={plan.name}
              className={`relative rounded-2xl border p-10 flex flex-col ${
                plan.highlight
                  ? 'border-navy-400 bg-navy-900 text-white shadow-2xl scale-[1.02]'
                  : 'border-slate-200 bg-white'
              }`}>
              {plan.badge && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold-500 text-navy-900 text-xs font-bold px-4 py-1.5 rounded-full">
                  {plan.badge}
                </span>
              )}
              <div className="mb-8">
                <h3 className={`font-bold text-xl mb-1 ${plan.highlight ? 'text-white' : 'text-navy-900'}`}>{plan.name}</h3>
                <div className="flex items-end gap-1.5 mt-3 mb-1">
                  <span className={`text-5xl font-bold ${plan.highlight ? 'text-gold-400' : 'text-navy-800'}`}>{plan.price}</span>
                </div>
                <p className={`text-sm font-medium ${plan.highlight ? 'text-slate-300' : 'text-slate-600'}`}>{plan.per}</p>
                <p className={`text-xs mt-0.5 ${plan.highlight ? 'text-gold-400/80' : 'text-emerald-600'}`}>{plan.perCredit}</p>
                <p className={`text-sm mt-4 leading-relaxed ${plan.highlight ? 'text-slate-300' : 'text-slate-600'}`}>{plan.description}</p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${plan.highlight ? 'text-gold-400' : 'text-emerald-500'}`} />
                    <span className={plan.highlight ? 'text-slate-200' : 'text-slate-700'}>{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={handleCta}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-colors ${
                  plan.ctaStyle === 'filled'
                    ? 'bg-gold-500 hover:bg-gold-400 text-navy-900'
                    : plan.highlight
                    ? 'border border-slate-500 text-slate-300 hover:border-white hover:text-white'
                    : 'border border-navy-200 text-navy-700 hover:bg-navy-50'
                }`}>
                {plan.cta} →
              </button>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-slate-400 mt-10">
          Department / institutional licensing available.{' '}
          <a href="mailto:hello@irbwiz.help" className="underline hover:text-slate-600">Contact us</a> for custom pricing.
        </p>
      </div>
    </section>
  );
}

// ─── CTA Banner ────────────────────────────────────────────────────────────────
function CTABanner() {
  const { user } = useAuth();
  const router   = useRouter();
  return (
    <section className="bg-navy-900 py-28 px-8 lg:px-14 text-white text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
          Ready to simplify your <span className="text-gold-400">IRB submission?</span>
        </h2>
        <p className="text-xl text-slate-400 mb-10">
          Join researchers who've stopped dreading the IRB process.
          Your first protocol is on us.
        </p>
        <button onClick={() => router.push(user ? '/wizard' : '/login')}
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-12 py-4 rounded-xl text-lg transition-colors">
          Start Free <ArrowRight size={20} />
        </button>
      </div>
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <HomeNav />
      <main className="flex-1">
        <Hero />
        <StatsBar />
        <HowItWorks />
        <WhoItsFor />
        <Pricing />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
