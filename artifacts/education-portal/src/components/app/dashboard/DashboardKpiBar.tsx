import { Building2, CalendarDays, ClipboardList, FolderOpen } from 'lucide-react';

import { DashStatBar } from '@/components/app/dashboard/DashStatBar';
import { useGetAppDashboard } from '@workspace/api-client-react';
import type { DashStatBarProps } from '@/components/app/dashboard/DashStatBar';

type DashboardKpiBarProps = {
  items?: DashStatBarProps['items'];
};

export function DashboardKpiBar({ items }: DashboardKpiBarProps) {
  const { data } = useGetAppDashboard();

  if (items) {
    return <DashStatBar items={items} />;
  }

  if (!data) return null;

  return (
    <DashStatBar
      items={[
        {
          label: 'Établissements',
          value: data.kpis.establishments,
          hint: data.profile.scopeLabel,
          icon: Building2,
        },
        {
          label: 'Activités',
          value: data.kpis.activities,
          hint: 'Scolaires',
          icon: CalendarDays,
        },
        {
          label: 'En attente',
          value: data.kpis.requestsPending,
          hint: 'Demandes',
          icon: ClipboardList,
        },
        {
          label: 'En analyse',
          value: data.kpis.requestsUnderReview,
          hint: 'DREN / DVS',
          icon: FolderOpen,
        },
      ]}
    />
  );
}
