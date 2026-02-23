import clsx from 'clsx';
import { ShieldCheck, ShieldAlert, Shield, HelpCircle } from 'lucide-react';

const config = {
  EXEMPT:             { label: 'Exempt',       Icon: ShieldCheck,  cls: 'badge-exempt'    },
  EXPEDITED:          { label: 'Expedited',    Icon: ShieldAlert,  cls: 'badge-expedited' },
  FULL_BOARD:         { label: 'Full Board',   Icon: Shield,       cls: 'badge-full'      },
  NOT_RESEARCH:       { label: 'Not Research', Icon: ShieldCheck,  cls: 'badge-exempt'    },
  NOT_HUMAN_SUBJECTS: { label: 'No Humans',    Icon: ShieldCheck,  cls: 'badge-exempt'    },
  INSUFFICIENT_INFO:  { label: 'Pending',      Icon: HelpCircle,   cls: 'badge-unknown'   },
};

export function ReviewBadge({ type, compact }) {
  const { label, Icon, cls } = config[type] || config.INSUFFICIENT_INFO;
  return (
    <span className={cls}>
      <Icon size={12} />
      {!compact && 'Review: '}{label}
    </span>
  );
}
