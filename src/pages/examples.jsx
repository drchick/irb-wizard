/**
 * examples.jsx — Sample Protocol Showcase
 *
 * Six pre-built studies covering every IRB review type.
 * Each card shows:
 *   1. Inline computed review determination (classifyReview)
 *   2. "Preview Report" → full-screen modal with generated Protocol Description
 *      + Info Sheet or Consent Form tabs — NO login or credits required
 *   3. "Open in Wizard" → wizard at Step 9 with all steps pre-visited
 *
 * Admin tracking: loading an example fires POST /api/track-example.
 */
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import HomeNav from '../components/layout/HomeNav';
import Footer from '../components/layout/Footer';
import IRBWizLogo from '../components/layout/IRBWizLogo';
import { SAMPLE_STUDIES } from '../data/sampleStudies';
import { classifyReview }             from '../utils/reviewClassifier';
import {
  generateProtocolDescription, generateExemptConsentSheet, generateFullConsentForm,
  generateParentalPermissionForm, generateChildAssentForm, generateDebriefingScript,
  generateHIPAAAuthorization, generateRecruitmentEmail, generateRecruitmentFlyer,
  generateClassAnnouncement, generateSocialMediaPost,
} from '../utils/documentGenerator';
import {
  generateProtocolDescriptionDocx, generateExemptConsentSheetDocx, generateFullConsentFormDocx,
  generateParentalPermissionFormDocx, generateChildAssentFormDocx, generateDebriefingScriptDocx,
  generateHIPAAAuthorizationDocx, generateRecruitmentEmailDocx, generateRecruitmentFlyerDocx,
  generateClassAnnouncementDocx, generateSocialMediaPostDocx,
} from '../utils/docxGenerator';
import {
  CheckCircle2, Clock, ShieldAlert,
  BookOpen, FlaskConical, BarChart3, FileText,
  ChevronDown, ChevronUp, ArrowRight, Sparkles,
  Info, AlertTriangle, Lightbulb, Mail, Megaphone, Users, Shield,
  X, Download, ExternalLink,
} from 'lucide-react';

// ─── Review-type display config ──────────────────────────────────────────────
const REVIEW_META = {
  EXEMPT: {
    label: 'Exempt', Icon: CheckCircle2,
    bg:        'bg-navy-900/60',
    border:    'border-emerald-700/50',
    cardBorder:'border-emerald-400/60',
    text:      'text-emerald-400',
    lightText: 'text-emerald-600',
    dot:       'bg-emerald-400',
    pill:      'bg-emerald-900/70 text-emerald-300 border-emerald-700',
    resultBg:  'bg-navy-900 border-emerald-700/60',
    accentBar: 'border-l-4 border-l-emerald-500',
    howBg:     'bg-emerald-50 border-emerald-200',
    description:
      'Lowest oversight level. Excused from continuing review. Typically anonymous surveys, public data, or normal educational practices.',
  },
  EXPEDITED: {
    label: 'Expedited', Icon: Clock,
    bg:        'bg-navy-900/60',
    border:    'border-amber-700/50',
    cardBorder:'border-amber-400/60',
    text:      'text-amber-400',
    lightText: 'text-amber-600',
    dot:       'bg-amber-400',
    pill:      'bg-amber-900/60 text-amber-300 border-amber-700',
    resultBg:  'bg-navy-900 border-amber-700/60',
    accentBar: 'border-l-4 border-l-amber-500',
    howBg:     'bg-amber-50 border-amber-200',
    description:
      'Reviewed by IRB Chair only. Minimal-risk research that doesn\'t qualify for exemption — recordings, identifiable interviews, minor venipuncture.',
  },
  FULL_BOARD: {
    label: 'Full Board', Icon: ShieldAlert,
    bg:        'bg-navy-900/60',
    border:    'border-red-700/50',
    cardBorder:'border-red-400/60',
    text:      'text-red-400',
    lightText: 'text-red-600',
    dot:       'bg-red-400',
    pill:      'bg-red-900/60 text-red-300 border-red-700',
    resultBg:  'bg-navy-900 border-red-700/60',
    accentBar: 'border-l-4 border-l-red-500',
    howBg:     'bg-red-50 border-red-200',
    description:
      'Full committee vote required. Greater-than-minimal risk, prisoner research, or deception without proper debriefing.',
  },
};

const METHOD_ICONS = {
  Quantitative:    BarChart3,
  Qualitative:     BookOpen,
  'Mixed Methods': FlaskConical,
  Secondary:       FileText,
};

const GROUPS = [
  { reviewType: 'EXEMPT',     heading: 'Exempt Studies',     sub: '45 CFR 46.104(d)', studies: SAMPLE_STUDIES.filter(s => s.expectedReview === 'EXEMPT')     },
  { reviewType: 'EXPEDITED',  heading: 'Expedited Studies',  sub: '45 CFR 46.110',    studies: SAMPLE_STUDIES.filter(s => s.expectedReview === 'EXPEDITED')  },
  { reviewType: 'FULL_BOARD', heading: 'Full Board Studies', sub: '45 CFR 46.108',    studies: SAMPLE_STUDIES.filter(s => s.expectedReview === 'FULL_BOARD') },
];

// ─── Inline review result (dark panel — good contrast on both light and dark cards) ──
function ReviewResultPanel({ result, meta }) {
  if (!result) return null;
  const FlagIcon = result.type === 'FULL_BOARD' ? AlertTriangle : Info;
  const topRecs  = (result.recommendations ?? []).slice(0, 2);

  return (
    <div className={`rounded-xl border ${meta.resultBg} ${meta.accentBar} p-4 space-y-3`}>
      <div className="flex items-center gap-2">
        <meta.Icon size={15} className={meta.text} />
        <span className={`font-bold text-sm ${meta.text}`}>
          {result.type === 'EXEMPT'     && `Exempt — ${result.categoryLabel ?? ''}`}
          {result.type === 'EXPEDITED'  && `Expedited — ${result.categoryLabel ?? ''}`}
          {result.type === 'FULL_BOARD' && 'Full Board Review Required'}
        </span>
        <span className="ml-auto text-xs text-slate-400">
          {Math.round((result.confidence ?? 0) * 100)}% confidence
        </span>
      </div>

      <ul className="space-y-1">
        {(result.reasons ?? []).map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-slate-200">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
            {r}
          </li>
        ))}
      </ul>

      {(result.flags ?? []).length > 0 && (
        <div className="space-y-1 border-t border-navy-700 pt-2">
          {result.flags.slice(0, 2).map((f, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
              <FlagIcon size={11} className={
                f.severity === 'high'   ? 'text-red-400 mt-0.5 shrink-0' :
                f.severity === 'medium' ? 'text-amber-400 mt-0.5 shrink-0' :
                'text-slate-400 mt-0.5 shrink-0'
              } />
              {f.message}
            </div>
          ))}
        </div>
      )}

      {topRecs.length > 0 && (
        <div className="border-t border-navy-700 pt-2 space-y-1.5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Lightbulb size={10} /> Key Recommendations
          </p>
          {topRecs.map((rec, i) => (
            <div key={i} className="text-xs text-slate-200">
              <span className="font-semibold text-white">{rec.title}: </span>
              {rec.body.length > 130 ? rec.body.slice(0, 130) + '…' : rec.body}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Document list builder ────────────────────────────────────────────────────
function getDocList(study) {
  const fd       = study.formData;
  const isExempt = study.expectedReview === 'EXEMPT';
  const hasMinors    = fd.subjects?.includesMinors === true;
  const hasDeception = fd.procedures?.involvesDeception === true;
  const hasHIPAA     = fd.data?.hipaaApplicable === true;

  const list = [
    // ── Core ──
    {
      id: 'protocol', group: 'Core Documents', Icon: FileText,
      label: 'Protocol Description',
      textFn:  () => generateProtocolDescription(fd),
      docxFn:  () => generateProtocolDescriptionDocx(fd),
      filename: `${study.id}_protocol`,
    },
    {
      id: 'consent', group: 'Core Documents', Icon: Shield,
      label: isExempt ? 'Information Sheet (Exempt)' : 'Informed Consent Form',
      textFn:  () => isExempt ? generateExemptConsentSheet(fd) : generateFullConsentForm(fd),
      docxFn:  () => isExempt ? generateExemptConsentSheetDocx(fd) : generateFullConsentFormDocx(fd),
      filename: `${study.id}_${isExempt ? 'info_sheet' : 'consent_form'}`,
    },
    // ── Recruitment ──
    {
      id: 'email', group: 'Recruitment Materials', Icon: Mail,
      label: 'Recruitment Email',
      textFn:  () => generateRecruitmentEmail(fd),
      docxFn:  () => generateRecruitmentEmailDocx(fd),
      filename: `${study.id}_recruitment_email`,
    },
    {
      id: 'flyer', group: 'Recruitment Materials', Icon: Megaphone,
      label: 'Recruitment Flyer',
      textFn:  () => generateRecruitmentFlyer(fd),
      docxFn:  () => generateRecruitmentFlyerDocx(fd),
      filename: `${study.id}_recruitment_flyer`,
    },
    {
      id: 'class', group: 'Recruitment Materials', Icon: BookOpen,
      label: 'Class Announcement',
      textFn:  () => generateClassAnnouncement(fd),
      docxFn:  () => generateClassAnnouncementDocx(fd),
      filename: `${study.id}_class_announcement`,
    },
    {
      id: 'social', group: 'Recruitment Materials', Icon: Sparkles,
      label: 'Social Media Post',
      textFn:  () => generateSocialMediaPost(fd),
      docxFn:  () => generateSocialMediaPostDocx(fd),
      filename: `${study.id}_social_media`,
    },
  ];

  // ── Conditional ──
  if (hasMinors) {
    list.push({
      id: 'parental', group: 'Special Forms', Icon: Users,
      label: 'Parental Permission Form',
      textFn:  () => generateParentalPermissionForm(fd),
      docxFn:  () => generateParentalPermissionFormDocx(fd),
      filename: `${study.id}_parental_permission`,
    });
    list.push({
      id: 'assent', group: 'Special Forms', Icon: FileText,
      label: 'Child Assent Form',
      textFn:  () => generateChildAssentForm(fd),
      docxFn:  () => generateChildAssentFormDocx(fd),
      filename: `${study.id}_child_assent`,
    });
  }
  if (hasDeception) {
    list.push({
      id: 'debrief', group: 'Special Forms', Icon: Info,
      label: 'Debriefing Script',
      textFn:  () => generateDebriefingScript(fd),
      docxFn:  () => generateDebriefingScriptDocx(fd),
      filename: `${study.id}_debriefing`,
    });
  }
  if (hasHIPAA) {
    list.push({
      id: 'hipaa', group: 'Special Forms', Icon: Shield,
      label: 'HIPAA Authorization',
      textFn:  () => generateHIPAAAuthorization(fd),
      docxFn:  () => generateHIPAAAuthorizationDocx(fd),
      filename: `${study.id}_hipaa`,
    });
  }

  return list;
}

// ─── Document Preview Modal ───────────────────────────────────────────────────
function DocumentPreviewModal({ study, onClose, onOpenWizard }) {
  const meta    = REVIEW_META[study.expectedReview];
  const docList = useMemo(() => getDocList(study), [study]);
  const [activeId, setActiveId]     = useState('protocol');
  const [docxLoading, setDocxLoading] = useState(false);

  const activeDoc = docList.find(d => d.id === activeId) ?? docList[0];

  // Generate text for active doc (recomputed only when active changes)
  const docText = useMemo(() => {
    try { return activeDoc.textFn(); } catch { return 'Document generation error.'; }
  }, [activeDoc]);

  // Group docs by section
  const groups = useMemo(() => {
    const map = {};
    docList.forEach(d => {
      if (!map[d.group]) map[d.group] = [];
      map[d.group].push(d);
    });
    return map;
  }, [docList]);

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  // Download .docx for active document
  const handleDocxDownload = useCallback(async () => {
    setDocxLoading(true);
    try {
      const blob = await activeDoc.docxFn();
      const url  = URL.createObjectURL(blob);
      Object.assign(document.createElement('a'), { href: url, download: `${activeDoc.filename}.docx` }).click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error('DOCX generation failed', err); }
    finally { setDocxLoading(false); }
  }, [activeDoc]);

  // Download .txt for active document
  const handleTxtDownload = useCallback(() => {
    const url = URL.createObjectURL(new Blob([docText], { type: 'text/plain' }));
    Object.assign(document.createElement('a'), { href: url, download: `${activeDoc.filename}.txt` }).click();
    URL.revokeObjectURL(url);
  }, [docText, activeDoc]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-navy-950/98 backdrop-blur-sm">

      {/* ── Header ── */}
      <div className="shrink-0 border-b border-navy-700 bg-navy-900 px-5 py-3 flex items-center gap-3">
        <span className={`hidden sm:inline-flex items-center border text-xs font-semibold px-2.5 py-0.5 rounded-full ${meta.pill}`}>
          {study.badge}
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-sm truncate">{study.shortTitle}</h2>
          <p className="text-slate-400 text-xs hidden sm:block">
            {docList.length}-document protocol package · University of Bridgeport
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleDocxDownload} disabled={docxLoading}
            className="hidden sm:flex items-center gap-1.5 bg-navy-700 hover:bg-navy-600 disabled:opacity-60 border border-navy-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
            {docxLoading
              ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Download size={13} />}
            {docxLoading ? 'Generating…' : 'Download .docx'}
          </button>
          <button onClick={() => { onClose(); onOpenWizard(study); }}
            className="flex items-center gap-1.5 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors">
            <ExternalLink size={13} /> Open in Wizard
          </button>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-navy-600 hover:border-navy-400 text-slate-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Body: sidebar + content ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left sidebar */}
        <div className="w-52 shrink-0 border-r border-navy-700 bg-navy-900/70 overflow-y-auto flex flex-col">
          {Object.entries(groups).map(([groupName, docs]) => (
            <div key={groupName} className="pt-4 pb-1">
              <p className="px-4 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {groupName}
              </p>
              {docs.map(doc => {
                const DocIcon = doc.Icon;
                const active  = activeId === doc.id;
                return (
                  <button key={doc.id} onClick={() => setActiveId(doc.id)}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors
                      ${active
                        ? `bg-navy-800 text-white font-semibold border-r-2 ${meta.border}`
                        : 'text-slate-400 hover:text-white hover:bg-navy-800/50'
                      }`}>
                    <DocIcon size={13} className="shrink-0 opacity-70" />
                    <span className="text-xs truncate leading-snug">{doc.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
          <div className="flex-1" />
          <p className="px-4 py-4 text-xs text-slate-600 leading-relaxed">
            Sample documents for demonstration only. Load in wizard to customize.
          </p>
        </div>

        {/* Main document area */}
        <div className="flex-1 overflow-y-auto bg-navy-950 px-4 py-5 sm:px-8">
          <div className="max-w-3xl mx-auto">

            {/* Document toolbar */}
            <div className="flex items-center justify-between mb-4 gap-3">
              <div className="flex items-center gap-2">
                <activeDoc.Icon size={15} className={`${meta.text} shrink-0`} />
                <h3 className="text-white font-bold text-sm">{activeDoc.label}</h3>
                <span className="text-xs text-slate-500 bg-navy-800 border border-navy-700 px-2 py-0.5 rounded-full">
                  {activeDoc.group}
                </span>
              </div>
              <button onClick={handleTxtDownload}
                className="flex items-center gap-1.5 border border-navy-600 hover:border-navy-400 text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg transition-colors shrink-0">
                <Download size={11} /> .txt
              </button>
            </div>

            {/* Paper */}
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono truncate">{activeDoc.label} — {study.badge}</span>
                <span className="text-xs text-slate-400 font-mono shrink-0 ml-4">University of Bridgeport · IRBWiz</span>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-xs text-slate-800 p-8 leading-relaxed">
                {docText}
              </pre>
            </div>

            {/* Nav between docs */}
            <div className="mt-5 flex items-center justify-between">
              {(() => {
                const idx  = docList.findIndex(d => d.id === activeId);
                const prev = docList[idx - 1];
                const next = docList[idx + 1];
                return (
                  <>
                    <button onClick={() => prev && setActiveId(prev.id)} disabled={!prev}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronUp size={13} className="rotate-[-90deg]" />
                      {prev ? prev.label : 'First document'}
                    </button>
                    <span className="text-xs text-slate-600">{docList.findIndex(d => d.id === activeId) + 1} / {docList.length}</span>
                    <button onClick={() => next && setActiveId(next.id)} disabled={!next}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      {next ? next.label : 'Last document'}
                      <ChevronUp size={13} className="rotate-90" />
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Individual study card (light background) ─────────────────────────────────
function StudyCard({ study, onPreview, onLoad }) {
  const [expanded, setExpanded] = useState(false);
  const meta = REVIEW_META[study.expectedReview];
  const ReviewIcon = meta.Icon;
  const result = useMemo(() => classifyReview(study.formData), [study.formData]);
  const methodWord = Object.keys(METHOD_ICONS).find(k => study.methodology.includes(k));
  const MethodIcon = METHOD_ICONS[methodWord] || BarChart3;

  return (
    <div className={`rounded-2xl border ${meta.cardBorder} bg-white shadow-sm overflow-hidden`}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${meta.cardBorder} bg-slate-50`}>
            <ReviewIcon size={20} className={meta.lightText} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`inline-flex items-center border text-xs font-semibold px-2.5 py-0.5 rounded-full ${meta.pill}`}>
                {study.badge}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-600 border border-slate-200 bg-slate-100 px-2.5 py-0.5 rounded-full">
                <MethodIcon size={11} />
                {study.methodology.split(' · ')[0]}
              </span>
              <span className="text-xs text-slate-500 border border-slate-200 bg-slate-50 px-2.5 py-0.5 rounded-full">
                {study.discipline}
              </span>
            </div>
            <h3 className="text-slate-900 font-bold text-base leading-snug">{study.shortTitle}</h3>
            <p className="text-slate-600 text-sm mt-1 leading-relaxed">{study.description}</p>
          </div>
        </div>

        {/* Inline review result (dark panel — high contrast inside light card) */}
        <div className="mt-4">
          <ReviewResultPanel result={result} meta={meta} />
        </div>

        {/* Expand rationale */}
        <button onClick={() => setExpanded(e => !e)}
          className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors">
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? 'Hide details' : 'Why this review type?'}
        </button>
      </div>

      {/* Expanded rationale panel */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-200 pt-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Key Protocol Factors</p>
            <ul className="space-y-1.5">
              {study.keyFactors.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Info size={12} /> Regulatory Rationale
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">{study.reviewRationale}</p>
          </div>
          <p className="text-xs text-slate-500">
            <span className="font-medium text-slate-600">Methodology:</span> {study.methodology}
          </p>
        </div>
      )}

      {/* CTA footer */}
      <div className="px-5 py-4 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3 bg-slate-50">
        <p className="text-xs text-slate-500 flex-1 hidden sm:block">
          Preview the generated IRB documents or open the full interactive wizard
        </p>
        <button onClick={() => onPreview(study)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors
            border ${meta.cardBorder} ${meta.lightText} hover:bg-slate-100`}>
          <FileText size={14} /> Preview Report
        </button>
        <button onClick={() => onLoad(study)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors bg-gold-500 hover:bg-gold-400 text-navy-900">
          Open in Wizard <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Wizard loading overlay ───────────────────────────────────────────────────
function LoadingOverlay({ study }) {
  if (!study) return null;
  const meta = REVIEW_META[study.expectedReview];
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-navy-950/95 backdrop-blur-sm">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${meta.border} ${meta.bg} mb-6`}>
        <meta.Icon size={28} className={meta.text} />
      </div>
      <h2 className="text-white font-bold text-xl mb-2">Opening in Wizard…</h2>
      <p className="text-slate-400 text-sm text-center max-w-xs">
        <span className="text-white font-medium">{study.shortTitle}</span>
        <br /><span className="text-slate-500 text-xs">Landing at Step 9 — Review Determination</span>
      </p>
      <div className="mt-6 w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ExamplesPage() {
  const router = useRouter();
  const [preview, setPreview]   = useState(null); // study shown in doc modal
  const [loading, setLoading]   = useState(null); // study being wizard-loaded

  async function handleLoad(study) {
    setPreview(null);   // close modal if open
    setLoading(study);
    fetch('/api/track-example', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studyId: study.id, studyTitle: study.shortTitle }),
    }).catch(() => {});
    localStorage.setItem(
      'irb_wizard_load_example',
      JSON.stringify({ formData: study.formData, targetStep: 9 })
    );
    await new Promise(r => setTimeout(r, 600));
    router.push('/wizard');
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <HomeNav />
      {loading && <LoadingOverlay study={loading} />}

      {/* ── Document preview modal ── */}
      {preview && (
        <DocumentPreviewModal
          study={preview}
          onClose={() => setPreview(null)}
          onOpenWizard={handleLoad}
        />
      )}

      <main className="flex-1">

        {/* ── Hero — dark navy ──────────────────────────────────────── */}
        <section className="bg-navy-950 py-16 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-gold-400 bg-gold-500/10 border border-gold-500/20 px-3 py-1.5 rounded-full mb-6">
              <Sparkles size={12} /> Live Examples — Real Generated Documents
            </div>

            {/* IRBWiz logo replacing "IRBWiz" text */}
            <div className="flex justify-center mb-5">
              <IRBWizLogo size={72} variant="full" theme="dark" />
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              See It in Action
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-6">
              Six realistic protocols — one for every IRB review pathway.
              Each card shows the <span className="text-white font-medium">computed review determination</span>.
              Click <span className="text-white font-medium">Preview Report</span> to read the full generated
              Protocol Description and Consent Form — no login or credits needed.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              {Object.entries(REVIEW_META).map(([type, meta]) => (
                <span key={type} className={`inline-flex items-center gap-1.5 border px-3 py-1.5 rounded-full ${meta.pill}`}>
                  <meta.Icon size={12} /> {meta.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Review type explainer — gradient transition ───────────── */}
        <section className="py-10 px-6 bg-gradient-to-b from-navy-900 to-slate-100">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
            {Object.entries(REVIEW_META).map(([type, meta]) => (
              <div key={type} className={`rounded-xl p-5 border ${meta.border} ${meta.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <meta.Icon size={16} className={meta.text} />
                  <span className={`font-bold text-sm ${meta.text}`}>{meta.label} Review</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{meta.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Study groups — white background ──────────────────────── */}
        <div className="bg-white">
          <div className="max-w-5xl mx-auto px-6 py-14 space-y-16">
            {GROUPS.map(group => {
              const meta = REVIEW_META[group.reviewType];
              return (
                <section key={group.reviewType}>
                  <div className="flex items-center gap-3 mb-1">
                    <meta.Icon size={20} className={meta.lightText} />
                    <h2 className={`text-xl font-extrabold ${meta.lightText}`}>{group.heading}</h2>
                  </div>
                  <p className="text-slate-500 text-sm mb-6 ml-8">{group.sub}</p>
                  <div className="space-y-5">
                    {group.studies.map(study => (
                      <StudyCard key={study.id} study={study}
                        onPreview={setPreview}
                        onLoad={handleLoad}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* How it works */}
            <section className="rounded-2xl bg-slate-50 border border-slate-200 p-8">
              <h3 className="text-slate-900 font-bold text-xl mb-6 text-center">Three Ways to Explore</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    n: '1', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200',
                    title: 'Read It Here',
                    body: 'Click "Preview Report" on any card to open the full Protocol Description and Consent Form right on this page — no login, no credits needed.',
                  },
                  {
                    n: '2', color: 'text-gold-700', bg: 'bg-gold-50 border-gold-200',
                    title: 'Explore the Wizard',
                    body: '"Open in Wizard" drops you at Step 9 with all steps pre-filled. Navigate freely to compare how the Exempt and Full Board protocols differ at every step.',
                  },
                  {
                    n: '3', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200',
                    title: 'Run the AI',
                    body: 'From Step 9, use 1 credit to run the AI assessment — see how Claude\'s analysis compares to the rules-based determination, then generate your final documents.',
                  },
                ].map(item => (
                  <div key={item.n} className={`rounded-xl p-5 border ${item.bg} flex gap-4`}>
                    <div className={`w-8 h-8 rounded-full border ${item.bg} ${item.color} font-bold text-sm flex items-center justify-center shrink-0`}>
                      {item.n}
                    </div>
                    <div>
                      <p className={`font-bold text-sm mb-1 ${item.color}`}>{item.title}</p>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.body}</p>
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
                  className="inline-flex items-center gap-2 border border-slate-300 hover:border-slate-500 text-slate-600 hover:text-slate-900 font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
                  View Pricing
                </Link>
              </div>
            </section>

            <p className="text-center text-xs text-slate-400 leading-relaxed max-w-2xl mx-auto">
              These are fictional study examples created for demonstration purposes only.
              Names, institutions, and study details are illustrative. Always consult your
              institution&apos;s IRB office before submitting any actual research protocol.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
