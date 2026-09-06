import type { ReactNode } from 'react';
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileEdit,
  FileText,
  FolderOpen,
  Inbox,
  Send,
} from 'lucide-react';

import { DashSurface } from '@/components/dash/DashSurface';

export type PilotageKpiItem = {
  id: string;
  label: string;
  value: string | number;
  hint: string;
  icon: 'draft' | 'circuit' | 'approved' | 'activities' | 'inbox' | 'forward' | 'buildings' | 'review' | 'files';
};

const ICONS: Record<PilotageKpiItem['icon'], ReactNode> = {
  draft: <FileEdit size={14} strokeWidth={2} />,
  circuit: <FolderOpen size={14} strokeWidth={2} />,
  approved: <CheckCircle2 size={14} strokeWidth={2} />,
  activities: <CalendarDays size={14} strokeWidth={2} />,
  inbox: <Inbox size={14} strokeWidth={2} />,
  forward: <Send size={14} strokeWidth={2} />,
  buildings: <Building2 size={14} strokeWidth={2} />,
  review: <ClipboardList size={14} strokeWidth={2} />,
  files: <FileText size={14} strokeWidth={2} />,
};

type PilotageKpiBandProps = {
  items: PilotageKpiItem[];
};

export function PilotageKpiBand({ items }: PilotageKpiBandProps) {
  return (
    <DashSurface className="pilot-kpi-band">
      <section className="pilot-kpi-strip" aria-label="Indicateurs du périmètre">
        {items.map((item) => (
          <article
            key={item.id}
            className={`pilot-kpi-cell pilot-kpi-cell--${item.icon}`}
            title={item.hint}
          >
            <span className="pilot-kpi-icon" aria-hidden="true">
              {ICONS[item.icon]}
            </span>
            <span className="pilot-kpi-copy">
              <strong className="pilot-kpi-value">
                {typeof item.value === 'number' ? item.value.toLocaleString('fr-FR') : item.value}
              </strong>
              <span className="pilot-kpi-label">{item.label}</span>
            </span>
          </article>
        ))}
      </section>
    </DashSurface>
  );
}
