/**
 * examples.jsx — Sample Protocol Showcase
 *
 * Shows 6 pre-built study examples covering each IRB review type.
 * Visitors can "Load in Wizard" to pre-populate the wizard with any study's
 * formData, then walk through all 10 steps and see the real AI output.
 *
 * Admin tracking: loading an example fires POST /api/track-example so the
 * Usage tab in the admin panel records which examples are being used.
 */
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import HomeNav from '../components/layout/HomeNav';
import Footer from '../components/layout/Footer';
import { SAMPLE_STUDIES } from '../data/sampleStudies';
import {
  CheckCircle2,
  Clock,
  ShieldAlert,
  BookOpen,
  FlaskConical,
  BarChart3,
  Users,
  FileText,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';

// ─── Review-type display config ──────────────────────────────────────────────
const REVIEW_META = {
  EXEMPT: {
    label: 'Exempt',
    Icon: CheckCircle2,
    bg:   'bg-emerald-900/40',
    border: 'border-emerald-700/60',
    text: 'text-emerald-400',
    pill: 'bg-emerald-900/70 text-emerald-300 border-emerald-700',
    description:
      'The lowest level of IRB oversight. Exempt studies still require IRB determination but are excused from continuing review. Typically involves anonymous surveys, publicly available data, or normal educational practices.',
  },
  EXPEDITED: {
    label: 'Expedited',
    Icon: Clock,
    bg:   'bg-amber-900/30',
    border: 'border-amber-700/60',
    text: 'text-amber-400',
    pill: 'bg-amber-900/60 text-amber-300 border-amber-700',
    description:
      'Reviewed by the IRB Chair or a designated reviewer rather than the full board. Used for minimal-risk research that does not qualify for exemption — such as audio/video recordings, identifiable interview data, or minor venipuncture.',
  },
  FULL_BOARD: {
    label: 'Full Board',
    Icon: ShieldAlert,
    bg:   'bg-red-900/30',
    border: 'border-red-700/60',
    text: 'text-red-400',
    pill: 'bg-red-900/60 text-red-300 border-red-700',
    description:
      'Requires review and vote by the full IRB committee at a convened meeting. Required whenever research poses greater-than-minimal risk, involves prisoners, or uses deception without adequate debriefing. Most involved and time-consuming pathway.',
  },
};

const METHOD_ICONS = {
  'Quantitative': BarChart3,
  'Qualitative':  BookOpen,
  'Mixed Methods': FlaskConical,
  'Secondary':    FileText,
};

// ─── Grouped sections ────────────────────────────────────────────────────────
const GROUPS = [
  {
    reviewType: 'EXEMPT',
    heading: 'Exempt Studies',
    sub: '45 CFR 46.104(d) — No continuing review required',
    studies: SAMPLE_STUDIES.filter(s => s.expectedReview === 'EXEMPT'),
  },
  {
    reviewType: 'EXPEDITED',
    heading: 'Expedited Studies',
    sub: '45 CFR 46.110 — Reviewed by IRB Chair or designated reviewer',
    studies: SAMPLE_STUDIES.filter(s => s.expectedReview === 'EXPEDITED'),
  },
  {
    reviewType: 'FULL_BOARD',
    heading: 'Full Board Studies',
    sub: '45 CFR 46.108 — Requires convened committee vote',
    studies: SAMPLE_STUDIES.filter(s => s.expectedReview === 'FULL_BOARD'),
  },
];

// ─── Individual study card ───────────────────────────────────────────────────
function StudyCard({ study, onLoad }) {
  const [expanded, setExpanded] = useState(false);
  const meta = REVIEW_META[study.expectedReview];
  const ReviewIcon = meta.Icon;

  // Parse methodology for icon
  const methodWord = Object.keys(METHOD_ICONS).find(k =>
    study.methodology.includes(k)
  );
  const MethodIcon = METHOD_ICONS[methodWord] || BarChart3;

  return (
    <div className={`rounded-2xl border ${meta.border} ${meta.bg} overflow-hidden transition-all`}>
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${meta.border} bg-navy-900/60`}>
            <ReviewIcon size={20} className={meta.text} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`inline-flex items-center border text-xs font-semibold px-2.5 py-0.5 rounded-full ${meta.pill}`}>
                {study.badge}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 border border-navy-700 bg-navy-800/60 px-2.5 py-0.5 rounded-full">
                <MethodIcon size={11} />
                {study.methodology.split(' · ')[0]}
              </span>
              <span className="text-xs text-slate-600 border border-navy-700 bg-navy-800/40 px-2.5 py-0.5 rounded-full">
                {study.discipline}
              </span>
            </div>

            <h3 className="text-white font-bold text-base leading-snug">
              {study.shortTitle}
            </h3>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed line-clamp-2">
              {study.description}
            </p>
          </div>
        </div>

        {/* Expand / collapse */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? 'Hide details' : 'Why this review type?'}
        </button>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-navy-700/60 pt-4">
          {/* Key factors */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Key Factors Driving This Determination
            </p>
            <ul className="space-y-1.5">
              {study.keyFactors.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${meta.text.replace('text-', 'bg-')}`} />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Rationale */}
          <div className="rounded-xl bg-navy-900/60 border border-navy-700 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Info size={12} /> Review Rationale
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              {study.reviewRationale}
            </p>
          </div>

          {/* Methodology detail */}
          <p className="text-xs text-slate-500">
            <span className="font-medium text-slate-400">Methodology:</span>{' '}
            {study.methodology}
          </p>
        </div>
      )}

      {/* CTA footer */}
      <div className={`px-5 py-4 border-t ${meta.border} flex items-center justify-between gap-4 bg-navy-900/40`}>
        <p className="text-xs text-slate-500 leading-relaxed">
          Load this study to see the full wizard walkthrough, AI review, and generated documents.
        </p>
        <button
          onClick={() => onLoad(study)}
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors
            bg-gold-500 hover:bg-gold-400 text-navy-900`}
        >
          Load in Wizard <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Loading overlay ─────────────────────────────────────────────────────────
function LoadingOverlay({ study }) {
  if (!study) return null;
  const meta = REVIEW_META[study.expectedReview];
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-navy-950/95 backdrop-blur-sm">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${meta.border} ${meta.bg} mb-6`}>
        <meta.Icon size={28} className={meta.text} />
      </div>
      <h2 className="text-white font-bold text-xl mb-2">Loading Study…</h2>
      <p className="text-slate-400 text-sm text-center max-w-xs">
        Pre-populating the wizard with{' '}
        <span className="text-white font-medium">{study.shortTitle}</span>
      </p>
      <div className="mt-6 w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function ExamplesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(null); // study being loaded

  async function handleLoad(study) {
    setLoading(study);

    // Fire-and-forget tracking (admin visibility)
    fetch('/api/track-example', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studyId: study.id, studyTitle: study.shortTitle }),
    }).catch(() => {});

    // Write formData to localStorage — WizardProvider reads it on mount
    localStorage.setItem(
      'irb_wizard_load_example',
      JSON.stringify(study.formData)
    );

    // Brief delay so the overlay is visible, then navigate
    await new Promise(r => setTimeout(r, 700));
    router.push('/wizard');
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <HomeNav />
      <LoadingOverlay study={loading} />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="py-16 px-6 text-center border-b border-navy-800">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-gold-400 bg-gold-500/10 border border-gold-500/20 px-3 py-1.5 rounded-full mb-5">
              <Sparkles size={12} /> Live Examples — Fully Interactive
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              See IRBWiz in Action
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-6">
              Explore six realistic IRB protocols — one for each major review pathway.
              Click <span className="text-white font-medium">Load in Wizard</span> to
              walk through any study step-by-step, view the AI assessment, and download
              the generated documents.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-300">
              {Object.entries(REVIEW_META).map(([type, meta]) => (
                <span key={type} className={`inline-flex items-center gap-1.5 border px-3 py-1.5 rounded-full ${meta.pill}`}>
                  <meta.Icon size={12} /> {meta.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Review-type explainer row ── */}
        <section className="py-10 px-6 border-b border-navy-800 bg-navy-900/30">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
            {Object.entries(REVIEW_META).map(([type, meta]) => (
              <div key={type} className={`rounded-xl p-5 border ${meta.border} ${meta.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <meta.Icon size={16} className={meta.text} />
                  <span className={`font-bold text-sm ${meta.text}`}>{meta.label} Review</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{meta.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Study groups ── */}
        <div className="max-w-5xl mx-auto px-6 py-14 space-y-16">
          {GROUPS.map(group => {
            const meta = REVIEW_META[group.reviewType];
            return (
              <section key={group.reviewType}>
                {/* Group heading */}
                <div className="flex items-center gap-3 mb-2">
                  <meta.Icon size={20} className={meta.text} />
                  <h2 className={`text-xl font-extrabold ${meta.text}`}>
                    {group.heading}
                  </h2>
                </div>
                <p className="text-slate-500 text-sm mb-6 ml-8">{group.sub}</p>

                <div className="space-y-5">
                  {group.studies.map(study => (
                    <StudyCard
                      key={study.id}
                      study={study}
                      onLoad={handleLoad}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          {/* ── How this works callout ── */}
          <section className="rounded-2xl bg-navy-800/60 border border-navy-700 p-8 text-center">
            <h3 className="text-white font-bold text-xl mb-3">How the Examples Work</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left mt-6">
              {[
                {
                  n: '1',
                  title: 'Click "Load in Wizard"',
                  body: 'The study\'s complete protocol data is pre-loaded into the wizard — all 10 steps filled in exactly as a real researcher would submit.',
                },
                {
                  n: '2',
                  title: 'Walk Through the Steps',
                  body: 'Browse each step to see how the researcher answered. The rules-based classifier gives you an instant review determination on Step 9.',
                },
                {
                  n: '3',
                  title: 'Run the AI Assessment',
                  body: 'Use a credit to run the full AI assessment and see a side-by-side comparison with the rules-based result, plus detailed recommendations.',
                },
              ].map(item => (
                <div key={item.n} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/30 text-gold-400 font-bold text-sm flex items-center justify-center shrink-0">
                    {item.n}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">{item.title}</p>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link
                href="/wizard"
                className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                Start Your Own Protocol <ArrowRight size={14} />
              </Link>
              <Link
                href="/#pricing"
                className="inline-flex items-center gap-2 border border-navy-600 hover:border-navy-400 text-slate-300 hover:text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </section>

          {/* ── Disclaimer ── */}
          <p className="text-center text-xs text-slate-600 leading-relaxed max-w-2xl mx-auto">
            These are fictional study examples created for demonstration purposes only. They are not
            real IRB submissions. Names, institutions, and study details are illustrative. Always
            consult your institution&apos;s IRB office before submitting any actual research protocol.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
