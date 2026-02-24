/**
 * pages/index.jsx — IRBWiz marketing / landing page (Next.js)
 */
import { useRouter } from 'next/router';
import Link from 'next/link';
import HomeNav   from '../components/layout/HomeNav';
import Footer    from '../components/layout/Footer';
import {
  ClipboardList, Sparkles, FileDown,
  GraduationCap, FlaskConical, CheckCircle2, ArrowRight,
  ShieldCheck, Clock, FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const { user } = useAuth();
  const router   = useRouter();
  const handleStart = () => router.push(user ? '/wizard' : '/login');

  return (
    <section className="bg-navy-900 text-white py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-4">
          Part of the Symbiotic Scholar Suite
        </p>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
          <span className="text-gold-400">IRBWiz</span>
        </h1>
        <p className="text-2xl md:text-3xl font-light text-slate-200 mb-4">
          AI-powered IRB protocol preparation.
        </p>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          For researchers who have better things to do than decode federal regulations.
          Answer 10 guided questions — get a complete, submission-ready IRB protocol package.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleStart}
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-8 py-3.5 rounded-lg text-base transition-colors"
          >
            Start Your Protocol <ArrowRight size={18} />
          </button>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-8 py-3.5 rounded-lg text-base transition-colors"
          >
            See Pricing ↓
          </a>
        </div>
        <div className="mt-10 inline-flex items-center gap-2 bg-navy-800 border border-navy-600 rounded-full px-4 py-2 text-sm text-slate-400">
          <ShieldCheck size={14} className="text-emerald-400" />
          Built for University of Bridgeport IRB — adaptable to any US institution
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
const HOW_STEPS = [
  { icon: ClipboardList, number: '01', title: 'Answer 10 guided questions', desc: 'Our wizard walks you through every IRB requirement — study design, subjects, risks, consent, and more. No legal jargon, just plain-language prompts.' },
  { icon: Sparkles,      number: '02', title: 'Get AI-powered review',       desc: "Claude AI reviews each section for consistency and compliance with 45 CFR 46. You'll see your likely review level (Exempt, Expedited, or Full Board) update in real time." },
  { icon: FileDown,      number: '03', title: 'Download your complete package', desc: 'Get every document you need: Protocol Description, Consent Form, Recruitment Materials, Parental Permission, HIPAA Authorization, and more — all as formatted Word files.' },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-navy-900">How IRBWiz Works</h2>
          <p className="text-slate-500 mt-3 text-lg">From blank page to submission-ready package in one sitting.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {HOW_STEPS.map((step, i) => (
            <div key={i} className="relative text-center">
              {i < HOW_STEPS.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-0.5 bg-navy-100" />
              )}
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-navy-50 border-2 border-navy-100 mb-5">
                <step.icon size={28} className="text-navy-600" />
                <span className="absolute -top-2 -right-2 bg-navy-800 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {step.number}
                </span>
              </div>
              <h3 className="text-base font-bold text-navy-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Who It's For ─────────────────────────────────────────────────────────────
function WhoItsFor() {
  return (
    <section id="features" className="bg-slate-50 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-navy-900">Built for Every Researcher</h2>
          <p className="text-slate-500 mt-3 text-lg">Whether you're writing your first protocol or your fiftieth.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center">
                <GraduationCap size={24} className="text-navy-600" />
              </div>
              <div>
                <h3 className="font-bold text-navy-900">Student Researchers</h3>
                <p className="text-xs text-slate-500">Undergrad · Master's · PhD</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-5">
              Stop spending weeks decoding IRB regulations. IRBWiz guides you through every requirement,
              flags problems before your advisor sees them, and generates all the documents you need to submit.
            </p>
            <ul className="space-y-2">
              {['Plain-language explanations of federal rules','Flags common student mistakes before submission','Faculty advisor requirements built in','CITI certificate verification'].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />{item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gold-50 flex items-center justify-center">
                <FlaskConical size={24} className="text-gold-600" />
              </div>
              <div>
                <h3 className="font-bold text-navy-900">Faculty Researchers</h3>
                <p className="text-xs text-slate-500">Assistant · Associate · Full Professor</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-5">
              Speed up your lab's IRB submissions. Get consistent, complete, IRB-ready document packages
              every time — for your own protocols and every student you advise.
            </p>
            <ul className="space-y-2">
              {['Full document suite in minutes, not days','AI review flags consistency issues instantly','Standardized templates across your lab','Supports Exempt, Expedited, and Full Board protocols'].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          {[
            { icon: FileText,   value: '11',         label: 'IRB documents generated' },
            { icon: Clock,      value: '10+ hours',   label: 'saved per protocol' },
            { icon: ShieldCheck,value: '45 CFR 46',  label: 'federal compliance built in' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
              <Icon size={20} className="text-navy-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-navy-900">{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
const PLANS = [
  { name: 'Single Study',     price: '$14.99', per: 'per study',                   highlight: false, description: 'Perfect for a thesis, dissertation, or one-time research project.',       features: ['Full 10-step protocol wizard','AI-powered section reviews','Complete document package (11 docs)','Unlimited revisions to your protocol','Download as Word (.docx) files'],         cta: 'Get Started',  ctaStyle: 'border' },
  { name: 'Researcher Pack',  price: '$49.99', per: '5 studies ($9.99 each)',       highlight: true,  badge: 'Most Popular', description: 'For faculty, postdocs, or students with multiple protocols to file.',    features: ['Everything in Single Study','5 protocol credits — use anytime','Save 33% vs single-study pricing','Credits never expire','Priority email support'],                       cta: 'Buy 5-Pack',   ctaStyle: 'filled' },
  { name: 'Department Plan',  price: '$199',   per: 'per year · unlimited studies', highlight: false, description: 'For labs, research centers, and academic departments.',                  features: ['Everything in Researcher Pack','Unlimited protocol submissions','All team members included','Dedicated onboarding session','Invoice/PO billing available'],                   cta: 'Contact Us',   ctaStyle: 'border', external: true, ctaTo: 'mailto:hello@irbwiz.help' },
];

function Pricing() {
  const { user } = useAuth();
  const router   = useRouter();
  const handleCta = (plan) => {
    if (plan.external) { window.location.href = plan.ctaTo; return; }
    router.push(user ? '/wizard' : '/login');
  };

  return (
    <section id="pricing" className="bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-navy-900">Simple, Per-Study Pricing</h2>
          <p className="text-slate-500 mt-3 text-lg max-w-2xl mx-auto">
            Pay per protocol — not a monthly subscription you'll forget to cancel.
            Each study includes your full document package and unlimited revisions.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan) => (
            <div key={plan.name}
              className={`relative rounded-2xl border p-8 flex flex-col ${plan.highlight ? 'border-navy-400 bg-navy-900 text-white shadow-xl scale-[1.03]' : 'border-slate-200 bg-white text-navy-900'}`}
            >
              {plan.badge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gold-500 text-navy-900 text-xs font-bold px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}
              <div className="mb-6">
                <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? 'text-white' : 'text-navy-900'}`}>{plan.name}</h3>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-4xl font-bold ${plan.highlight ? 'text-gold-400' : 'text-navy-800'}`}>{plan.price}</span>
                </div>
                <p className={`text-xs ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{plan.per}</p>
                <p className={`text-sm mt-3 ${plan.highlight ? 'text-slate-300' : 'text-slate-600'}`}>{plan.description}</p>
              </div>
              <ul className="space-y-2.5 flex-1 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 size={15} className={`shrink-0 mt-0.5 ${plan.highlight ? 'text-gold-400' : 'text-emerald-500'}`} />
                    <span className={plan.highlight ? 'text-slate-200' : 'text-slate-700'}>{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => handleCta(plan)}
                className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
                  plan.ctaStyle === 'filled' ? 'bg-gold-500 hover:bg-gold-400 text-navy-900'
                  : plan.highlight ? 'border border-slate-500 text-slate-300 hover:border-slate-300 hover:text-white'
                  : 'border border-navy-300 text-navy-700 hover:bg-navy-50'
                }`}
              >
                {plan.cta} {plan.external ? '' : '→'}
              </button>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-400 mt-8">
          Institutional licensing available for universities and research hospitals.{' '}
          <a href="mailto:hello@irbwiz.help" className="underline hover:text-slate-600">Contact us</a> for custom pricing.
        </p>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <HomeNav />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <WhoItsFor />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
