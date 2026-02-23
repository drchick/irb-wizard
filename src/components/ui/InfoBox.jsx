import clsx from 'clsx';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Lightbulb } from 'lucide-react';

const variants = {
  info:    { icon: Info,          bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-800',   icon_color: 'text-blue-500'   },
  success: { icon: CheckCircle2,  bg: 'bg-emerald-50',border: 'border-emerald-200',text: 'text-emerald-800',icon_color: 'text-emerald-500' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-800',  icon_color: 'text-amber-500'  },
  error:   { icon: AlertCircle,   bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-800',    icon_color: 'text-red-500'    },
  tip:     { icon: Lightbulb,     bg: 'bg-gold-50',   border: 'border-gold-200',   text: 'text-gold-800',   icon_color: 'text-gold-500'   },
};

export function InfoBox({ variant = 'info', title, children, className }) {
  const { icon: Icon, bg, border, text, icon_color } = variants[variant] || variants.info;
  return (
    <div className={clsx('rounded-lg border p-4', bg, border, className)}>
      <div className="flex gap-3">
        <Icon size={18} className={clsx('shrink-0 mt-0.5', icon_color)} />
        <div className={clsx('text-sm', text)}>
          {title && <p className="font-semibold mb-0.5">{title}</p>}
          <div className="leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function IssueList({ issues }) {
  if (!issues || issues.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {issues.map((issue, i) => (
        <div
          key={i}
          className={clsx(
            'rounded-lg border p-3 flex gap-3',
            issue.severity === 'error'   && 'bg-red-50 border-red-200',
            issue.severity === 'warning' && 'bg-amber-50 border-amber-200',
            issue.severity === 'info'    && 'bg-blue-50 border-blue-200',
          )}
        >
          {issue.severity === 'error'   && <AlertCircle  size={16} className="text-red-500 shrink-0 mt-0.5" />}
          {issue.severity === 'warning' && <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />}
          {issue.severity === 'info'    && <Info          size={16} className="text-blue-500 shrink-0 mt-0.5" />}
          <div>
            <p className={clsx(
              'text-xs font-semibold',
              issue.severity === 'error'   && 'text-red-700',
              issue.severity === 'warning' && 'text-amber-700',
              issue.severity === 'info'    && 'text-blue-700',
            )}>{issue.title}</p>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{issue.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
