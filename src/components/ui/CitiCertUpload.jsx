/**
 * CitiCertUpload.jsx
 *
 * Drag-and-drop / click-to-upload component for CITI training certificates.
 * Calls parseCitiCert() on the selected PDF and reports extracted dates via callbacks.
 */

import { useState, useRef } from 'react';
import { parseCitiCert } from '../../utils/citiCertParser';
import { Upload, FileCheck, X, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

/**
 * @param {object} props
 * @param {(completion: string, expiry: string) => void} props.onDatesExtracted
 * @param {(filename: string) => void} props.onFileSelected
 * @param {() => void} props.onRemove
 * @param {string} props.currentFileName   — filename stored in form state
 */
export default function CitiCertUpload({
  onDatesExtracted,
  onFileSelected,
  onRemove,
  currentFileName,
}) {
  const [status, setStatus]     = useState('idle');   // 'idle'|'parsing'|'full'|'partial'|'none'|'error'
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setStatus('error');
      return;
    }

    setStatus('parsing');
    onFileSelected(file.name);

    const result = await parseCitiCert(file);

    if (result.completionDate || result.expiryDate) {
      onDatesExtracted(result.completionDate, result.expiryDate);
    }
    setStatus(result.confidence);  // 'full' | 'partial' | 'none'
  };

  const handleInputChange = (e) => {
    handleFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleRemove = () => {
    setStatus('idle');
    onRemove();
    if (inputRef.current) inputRef.current.value = '';
  };

  // ── Feedback banner ─────────────────────────────────────────────────────────
  const Banner = () => {
    if (status === 'parsing') {
      return (
        <div className="flex items-center gap-2 rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-600">
          <Loader2 size={14} className="animate-spin shrink-0" />
          Reading certificate…
        </div>
      );
    }
    if (status === 'full') {
      return (
        <div className="flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
          <CheckCircle2 size={14} className="shrink-0" />
          Dates extracted from your certificate — please verify below.
        </div>
      );
    }
    if (status === 'partial') {
      return (
        <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-700">
          <AlertTriangle size={14} className="shrink-0" />
          Some dates were found — please check and complete any missing fields.
        </div>
      );
    }
    if (status === 'none') {
      return (
        <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-700">
          <AlertTriangle size={14} className="shrink-0" />
          Couldn&apos;t read dates from this PDF — please enter them manually above.
        </div>
      );
    }
    if (status === 'error') {
      return (
        <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          <AlertTriangle size={14} className="shrink-0" />
          Please upload a PDF file (.pdf).
        </div>
      );
    }
    return null;
  };

  // ── File already selected view ───────────────────────────────────────────────
  if (currentFileName && status !== 'idle') {
    return (
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
          <FileCheck size={15} className="text-emerald-500 shrink-0" />
          <span className="flex-1 truncate text-slate-700 font-medium">{currentFileName}</span>
          <button
            type="button"
            onClick={handleRemove}
            className="ml-1 text-slate-400 hover:text-red-500 transition-colors"
            aria-label="Remove certificate"
          >
            <X size={14} />
          </button>
        </div>
        <Banner />
      </div>
    );
  }

  // ── Drop zone ────────────────────────────────────────────────────────────────
  return (
    <div className="mt-3 space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={clsx(
          'w-full flex flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-5',
          'transition-colors cursor-pointer text-center',
          dragOver
            ? 'border-navy-400 bg-navy-50'
            : 'border-slate-300 bg-slate-50 hover:border-navy-300 hover:bg-slate-100',
        )}
      >
        <Upload size={20} className={clsx('shrink-0', dragOver ? 'text-navy-500' : 'text-slate-400')} />
        <div>
          <p className="text-sm font-medium text-slate-700">
            Upload CITI Certificate <span className="text-slate-400 font-normal">(optional)</span>
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Drop your PDF here or click to browse — we&apos;ll try to fill in the dates automatically
          </p>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleInputChange}
      />

      <Banner />
    </div>
  );
}
