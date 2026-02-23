/**
 * citiCertParser.js
 *
 * Extracts CITI training completion and expiry dates from a PDF certificate
 * using pdf.js (loaded lazily via dynamic import).
 *
 * Returns: { completionDate, expiryDate, confidence }
 *   completionDate / expiryDate — ISO "YYYY-MM-DD" strings, or '' if not found
 *   confidence — 'full' | 'partial' | 'none'
 */

// ─── Date pattern helpers ─────────────────────────────────────────────────────

const MONTH_NAMES = {
  january: '01', february: '02', march: '03',    april: '04',
  may: '05',     june: '06',     july: '07',      august: '08',
  september: '09', october: '10', november: '11', december: '12',
  jan: '01', feb: '02', mar: '03', apr: '04',
  jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

/** Convert any recognised date string to YYYY-MM-DD, or return ''. */
function normaliseDate(raw) {
  if (!raw) return '';
  const s = raw.trim();

  // MM/DD/YYYY  or  M/D/YYYY
  let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const [, mo, d, y] = m;
    return `${y}-${mo.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }

  // YYYY-MM-DD
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return s;

  // Month D, YYYY  or  Month DD, YYYY  (e.g. "January 5, 2024")
  m = s.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (m) {
    const mo = MONTH_NAMES[m[1].toLowerCase()];
    if (mo) return `${m[3]}-${mo}-${m[2].padStart(2,'0')}`;
  }

  // D Month YYYY  (e.g. "5 January 2024")
  m = s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (m) {
    const mo = MONTH_NAMES[m[2].toLowerCase()];
    if (mo) return `${m[3]}-${mo}-${m[1].padStart(2,'0')}`;
  }

  return '';
}

// ─── PDF text extraction ──────────────────────────────────────────────────────

/** Extract all text from a PDF File object using pdf.js. */
async function extractPdfText(file) {
  // Dynamic import keeps pdf.js out of the initial bundle
  const pdfjsLib = await import('pdfjs-dist');

  // Point the worker at the CDN copy (no bundler config needed)
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page  = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map(item => item.str).join(' ') + '\n';
  }
  return fullText;
}

// ─── Date extraction ─────────────────────────────────────────────────────────

/**
 * Look for labelled date patterns in the extracted PDF text.
 *
 * CITI certificates typically include lines like:
 *   "Completion Date: 01/15/2024"
 *   "Expiration Date: 01/15/2027"
 * but the exact wording varies slightly across certificate types.
 */
function extractDates(text) {
  // Normalise whitespace
  const t = text.replace(/\s+/g, ' ');

  // Generic date value pattern (covers MM/DD/YYYY, YYYY-MM-DD, "Month D, YYYY")
  const D = String.raw`(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|[A-Za-z]+ \d{1,2},? \d{4}|\d{1,2} [A-Za-z]+ \d{4})`;

  // Labels that precede the completion date
  const completionRe = new RegExp(
    String.raw`(?:Completion Date|Date Completed|Completed|Course Completed)\s*[:\-–]?\s*` + D,
    'i'
  );

  // Labels that precede the expiry date
  const expiryRe = new RegExp(
    String.raw`(?:Expiration Date|Expiry Date|Expires?|Valid Through|Renewal Due|Renew By)\s*[:\-–]?\s*` + D,
    'i'
  );

  const compMatch  = t.match(completionRe);
  const expiryMatch = t.match(expiryRe);

  return {
    completionDate: normaliseDate(compMatch?.[1]  ?? ''),
    expiryDate:     normaliseDate(expiryMatch?.[1] ?? ''),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parse a CITI certificate PDF and return extracted dates.
 *
 * @param {File} file — a PDF File object from an <input type="file">
 * @returns {Promise<{ completionDate: string, expiryDate: string, confidence: 'full'|'partial'|'none' }>}
 */
export async function parseCitiCert(file) {
  try {
    const text = await extractPdfText(file);
    const { completionDate, expiryDate } = extractDates(text);

    const hasCompletion = completionDate !== '';
    const hasExpiry     = expiryDate !== '';

    let confidence;
    if (hasCompletion && hasExpiry)   confidence = 'full';
    else if (hasCompletion || hasExpiry) confidence = 'partial';
    else                                 confidence = 'none';

    return { completionDate, expiryDate, confidence };
  } catch (err) {
    console.warn('[citiCertParser] PDF parse failed:', err);
    return { completionDate: '', expiryDate: '', confidence: 'none' };
  }
}
