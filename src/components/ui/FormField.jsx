import clsx from 'clsx';
import { Info } from 'lucide-react';
import { useState } from 'react';

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function Tooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block ml-1.5">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="text-slate-400 hover:text-navy-600 transition"
        aria-label="Help"
      >
        <Info size={14} />
      </button>
      {show && (
        <div className="absolute z-50 left-6 top-0 w-64 rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed shadow-lg text-slate-700">
          {text}
        </div>
      )}
    </span>
  );
}

// ─── Label ────────────────────────────────────────────────────────────────────
export function Label({ htmlFor, required, children, tooltip }) {
  return (
    <label htmlFor={htmlFor} className="field-label">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
      {tooltip && <Tooltip text={tooltip} />}
    </label>
  );
}

// ─── Text Input ───────────────────────────────────────────────────────────────
export function TextInput({ label, id, required, tooltip, hint, error, className, ...props }) {
  return (
    <div className={clsx('flex flex-col', className)}>
      {label && <Label htmlFor={id} required={required} tooltip={tooltip}>{label}</Label>}
      <input
        id={id}
        className={clsx('input-base', error && 'border-red-400 focus:border-red-500 focus:ring-red-200')}
        {...props}
      />
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-hint text-red-600">{error}</p>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({ label, id, required, tooltip, hint, error, rows = 4, className, ...props }) {
  return (
    <div className={clsx('flex flex-col', className)}>
      {label && <Label htmlFor={id} required={required} tooltip={tooltip}>{label}</Label>}
      <textarea
        id={id}
        rows={rows}
        className={clsx('input-base resize-y', error && 'border-red-400 focus:border-red-500 focus:ring-red-200')}
        {...props}
      />
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-hint text-red-600">{error}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, id, required, tooltip, hint, error, options = [], placeholder, className, ...props }) {
  return (
    <div className={clsx('flex flex-col', className)}>
      {label && <Label htmlFor={id} required={required} tooltip={tooltip}>{label}</Label>}
      <select
        id={id}
        className={clsx('input-base', error && 'border-red-400')}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt =>
          typeof opt === 'string'
            ? <option key={opt} value={opt}>{opt}</option>
            : <option key={opt.value} value={opt.value}>{opt.label}</option>
        )}
      </select>
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-hint text-red-600">{error}</p>}
    </div>
  );
}

// ─── Yes/No Radio ─────────────────────────────────────────────────────────────
export function YesNo({ label, name, value, onChange, tooltip, hint, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label required={required} tooltip={tooltip}>{label}</Label>
      <div className="flex gap-4">
        {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map(({ label: l, val }) => (
          <label key={String(val)} className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="radio"
              name={name}
              checked={value === val}
              onChange={() => onChange(val)}
              className="accent-navy-700 w-4 h-4"
            />
            <span className={clsx('text-sm font-medium', value === val ? 'text-navy-800' : 'text-slate-600')}>
              {l}
            </span>
          </label>
        ))}
      </div>
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

// ─── Checkbox Group ───────────────────────────────────────────────────────────
export function CheckboxGroup({ label, options, value = [], onChange, tooltip, hint, required }) {
  const toggle = (optValue) => {
    const next = value.includes(optValue)
      ? value.filter(v => v !== optValue)
      : [...value, optValue];
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-2">
      <Label required={required} tooltip={tooltip}>{label}</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map(opt => {
          const optValue = typeof opt === 'string' ? opt : opt.value;
          const optLabel = typeof opt === 'string' ? opt : opt.label;
          const optHint  = typeof opt === 'object' ? opt.hint : null;
          const checked  = value.includes(optValue);
          return (
            <label
              key={optValue}
              className={clsx(
                'flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition',
                checked ? 'border-navy-400 bg-navy-50' : 'border-slate-200 bg-white hover:border-slate-300'
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(optValue)}
                className="accent-navy-700 mt-0.5 w-4 h-4 shrink-0"
              />
              <span>
                <span className={clsx('text-sm font-medium', checked ? 'text-navy-800' : 'text-slate-700')}>
                  {optLabel}
                </span>
                {optHint && <span className="block text-xs text-slate-500 mt-0.5">{optHint}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

// ─── Tristate / Conditional ───────────────────────────────────────────────────
export function ConditionalYesNo({ label, name, value, onChange, tooltip, hint, required, children }) {
  return (
    <div className="flex flex-col gap-2">
      <YesNo label={label} name={name} value={value} onChange={onChange} tooltip={tooltip} hint={hint} required={required} />
      {value === true && children && (
        <div className="ml-6 mt-1 border-l-2 border-navy-200 pl-4 flex flex-col gap-3">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-navy-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-500 leading-relaxed">{description}</p>}
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ label }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-200" />
      </div>
      {label && (
        <div className="relative flex justify-start">
          <span className="bg-white pr-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
