/**
 * examples.jsx — Sample Protocol Showcase
 *
 * Shows 6 pre-built study examples covering each IRB review type.
 * Each card displays the computed review determination (via classifyReview)
 * and key reasons inline — no wizard navigation required to see results.
 *
 * Clicking "View Full Report" loads the study directly at Step 9 (Review
 * Determination) with all steps pre-visited, so the user can immediately
 * see the review result, run the AI assessment, and generate documents.
 *
 * Admin tracking: loading an example fires POST /api/track-example.
 */
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import HomeNav from '../components/layout/HomeNav';
import Footer from '../components/layout/Footer';
import { SAMPLE_STUDIES } from '../data/sampleStudies';
import { classifyReview } from '../utils/reviewClassifier';
import {
  CheckCircle2,
  Clock,
  ShieldAlert,
  BookOpen,
  FlaskConical,
  BarChart3,
  FileText,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Info,
  AlertTriangle,
  FileSearch,
  Lightbulb,
} from 'lucide-react';

// ─── Review-type display config ──────────────────────────────────────────────
const REVIEW_META = {
  EXEMPT: {
    label: 'Exempt',
    Icon: CheckCircle2,
    bg:     'bg-emerald-900/40',
    border: 'border-emerald-700/60',
    text:   'text-emerald-400',
    dot:    'bg-emerald-400',
    pill:   'bg-emerald-900/70 text-emerald-300 border-emerald-700',
    resultBg: 'bg-emerald-950/60 border-emerald-800/60',
    description:
      'The lowest level of IRB oversight. Exempt studies still require IRB determination but are excused from continuing review. Typically involves anonymous surveys, publicly available data, or normal educational practices.',
  },
  EXPEDITED: {
    label: 'Expedited',
    Icon: Clock,
    bg:     'bg-amber-900/30',
    border: 'border-amber-700/60',
    text:   'text-amber-400',
    dot:    'bg-amber-400',
    pill:   'bg-amber-900/60 text-amber-300 border-amber-700',
    resultBg: 'bg-amber-950/40 border-amber-800/50',
    description:
      'Reviewed by the IRB Chair or a designated reviewer rather than the full board. Used for minimal-risk research that does not qualify for exemption — such as audio/video recordings, identifiable interview data, or minor venipuncture.',
  },
  FULL_BOARD: {
    label: 'Full Board',
    Icon: ShieldAlert,
    bg:     'bg-red-900/30',
    border: 'border-red-700/60',
    text:   'text-red-400',
    dot:    'bg-red-400',
    pill:   'bg-red-900/60 text-red-300 border-red-700',
    resultBg: 'bg-red-950/40 border-red-800/50',
    description:
      'Requires review and vote by the full IRB committee at a convened meeting. Required whenever research poses greater-than-minimal risk, involves prisoners, or uses deception without adequate debriefing.',
  },
};

const METHOD_ICONS = {
  Quantitative: BarChart3,
  Qualitative:  BookOpen,
  'Mixed Methods': FlaskConical,
  Secondary:    FileText,
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

// ─── Inline review result panel ──────────────────────────────────────────────
function ReviewResultPanel({ result, meta }) {
  if (!result) return null;

  const FlagIcon = result.type === 'FULL_BOARD' ? AlertTriangle : Info;
  const topRecs  = (result.recommendations ?? []).slice(0, 2);

  return (
    <div className={`rounded-xl border ${meta.resultBg} p-4 space-y-3`}>
      {/* Header row */}
      <div className="flex items-center gap-2">
        <meta.Icon size={15} className={meta.text} />
        <span className={`font-bold text-sm ${meta.text}`}>
          {result.type === 'EXEMPT'      && `Exempt — ${result.categoryLabel ?? ''}`}
          {result.type === 'EXPEDITED'   && `Expedited — ${result.categoryLabel ?? ''}`}
          {result.type === 'FULL_BOARD'  && 'Full Board Review Required'}
        </span>
        <span className="ml-auto text-xs text-slate-500">
          {Math.round((result.confidence ?? 0) * 100)}% confidence
        </span>
      </div>

      {/* Determination reasons */}
      <ul className="space-y-1">
        {(result.reasons ?? []).map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
            {r}
          </li>
        ))}
      </ul>

      {/* Flags */}
      {(result.flags ?? []).length > 0 && (
        <div className="space-y-1 border-t border-navy-700/60 pt-2">
          {result.flags.slice(0, 2).map((f, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-slate-400">
              <FlagIcon size={11} className={
                f.severity === 'high' ? 'text-red-400 mt-0.5' :
                f.severity === 'medium' ? 'text-amber-400 mt-0.5' : 'text-slate-500 mt-0.5'
              } />
              {f.message}
            </div>
          ))}
        </div>
      )}

      {/* Top recommendations */}
      {topRecs.length > 0 && (
        <div className="border-t border-navy-700/60 pt-2 space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Lightbulb size={10} /> Key Recommendations
          </p>
          {topRecs.map((rec, i) => (
            <div key={i} className="text-xs text-slate-300">
              <span className="font-semibold text-slate-200">{rec.title}: </span>
              {rec.body.length > 120 ? rec.body.slice(0, 120) + '…' : rec.body}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Individual study card ───────────────────────────────────────────────────
function StudyCard({ study, onLoad }) {
  const [expanded, setExpanded] = useState(false);
  const meta = REVIEW_META[study.expectedReview];
  const ReviewIcon = meta.Icon;

  // Compute the actual review result using the real classifier
  const result = useMemo(() => classifyReview(study.formData), [study.formData]);

  const methodWord = Object.keys(METHOD_ICONS).find(k => study.methodology.includes(k));
  const MethodIcon = METHOD_ICONS[methodWord] || BarChart3;

  return (
    <div className={`rounded-2xl border ${meta.border} ${meta.bg} overflow-hidden`}>
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
            <p className="text-slate-400 text-sm mt-1 leading-relaxed">
              {study.description}
            </p>
          </div>
        </div>

        {/* ── Inline review result (always visible) ── */}
        <div className="mt-4">
          <ReviewResultPanel result={result} meta={meta} />
        </div>

        {/* Expand / collapse deeper rationale */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? 'Hide details' : 'Why this review type? (detailed rationale)'}
        </button>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-navy-700/60 pt-4">
          {/* Key factors */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Key Protocol Factors
            </p>
            <ul className="space-y-1.5">
              {study.keyFactors.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal rationale */}
          <div className="rounded-xl bg-navy-900/60 border border-navy-700 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Info size={12} /> Regulatory Rationale
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              {study.reviewRationale}
            </p>
          </div>

          <p className="text-xs text-slate-500">
            <span className="font-medium text-slate-400">Full Methodology:</span>{' '}
            {study.methodology}
          </p>
        </div>
      )}

      {/* CTA footer */}
      <div className={`px-5 py-4 border-t ${meta.border} flex items-center justify-between gap-4 bg-navy-900/50`}>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <FileSearch size={13} />
          Open in wizard → view all 10 steps, run AI assessment &amp; generate documents
        </div>
        <button
          onClick={() => onLoad(study)}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors bg-gold-500 hover:bg-gold-400 text-navy-900"
        >
          View Full Report <ArrowRight size={14} />
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
      <h2 className="text-white font-bold text-xl mb-2">Opening Report…</h2>
      <p className="text-slate-400 text-sm text-center max-w-xs">
        Loading <span className="text-white font-medium">{study.shortTitle}</span>
        <br />
        <span className="text-slate-500 text-xs">Taking you to the Review Determination (Step 9)</span>
      </p>
      <div className="mt-6 w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function ExamplesPage() {
  const router  = useRouter();
  const [loading, setLoading] = useState(null);

  async function handleLoad(study) {
    setLoading(study);

    // Fire-and-forget tracking
    fetch('/api/track-example', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studyId: study.id, studyTitle: study.shortTitle }),
    }).catch(() => {});

    // Store payload: formData + targetStep so WizardProvider loads at Step 9
    localStorage.setItem(
      'irb_wizard_load_example',
      JSON.stringify({ formData: study.formData, targetStep: 9 })
    );

    await new Promise(r => setTimeout(r, 600));
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
              <Sparkles size={12} /> Live Examples — Real Review Determinations
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              See IRBWiz in Action
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-6">
              Six realistic IRB protocols — one for every review pathway.
              Each card shows the <span className="text-white font-medium">actual computed review determination</span> from
              the rules-based classifier. Click <span className="text-white font-medium">View Full Report</span> to
              open the complete protocol in the wizard at Step 9, then run the AI assessment and generate documents.
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

        {/* ── Review-type explainer ── */}
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
                <div className="flex items-center gap-3 mb-2">
                  <meta.Icon size={20} className={meta.text} />
                  <h2 className={`text-xl font-extrabold ${meta.text}`}>
                    {group.heading}
                  </h2>
                </div>
                <p className="text-slate-500 text-sm mb-6 ml-8">{group.sub}</p>
                <div className="space-y-5">
                  {group.studies.map(study => (
                    <StudyCard key={study.id} study={study} onLoad={handleLoad} />
                  ))}
                </div>
              </section>
            );
          })}

          {/* ── How it works ── */}
          <section className="rounded-2xl bg-navy-800/60 border border-navy-700 p-8 text-center">
            <h3 className="text-white font-bold text-xl mb-3">What Happens When You Click &ldquo;View Full Report&rdquo;</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left mt-6">
              {[
                {
                  n: '1',
                  title: 'Opens at Step 9',
                  body: 'The complete protocol is pre-loaded. You land on Step 9 — Review Determination — where you see the rules-based result immediately. All steps are already accessible via the sidebar.',
                },
                {
                  n: '2',
                  title: 'Browse All 10 Steps',
                  body: 'Navigate freely through every step to see exactly how each field was answered. Compare the Exempt vs. Full Board protocols side by side to understand what makes the difference.',
                },
                {
                  n: '3',
                  title: 'Run AI & Generate Docs',
                  body: 'Use 1 credit to run the full AI assessment on Step 9, then navigate to Step 10 to generate the Protocol Description, Consent Form, or Exempt Info Sheet.',
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
              <Link href="/wizard"
                className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-6 py-2.5 rounded-lg text-sm transition-colors">
                Start Your Own Protocol <ArrowRight size={14} />
              </Link>
              <Link href="/#pricing"
                className="inline-flex items-center gap-2 border border-navy-600 hover:border-navy-400 text-slate-300 hover:text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
                View Pricing
              </Link>
            </div>
          </section>

          {/* Disclaimer */}
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
