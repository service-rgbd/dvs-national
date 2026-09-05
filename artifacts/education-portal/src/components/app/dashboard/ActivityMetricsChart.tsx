import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { AppProPanel } from '@/components/app/pro/AppProPanel';
import { CHART_COLORS } from '@/components/app/dashboard/dashboard-chart-utils';

type ActivityMetricsChartProps = {
  series: { label: string; value: number }[];
  headingId?: string;
};

function ActivityTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="dash-chart-tooltip">
      <span>{label}</span>
      <strong>{payload[0].value.toLocaleString('fr-FR')}</strong>
    </div>
  );
}

export function ActivityMetricsChart({
  series,
  headingId = 'dash-activity-heading',
}: ActivityMetricsChartProps) {
  const hasData = series.some((point) => point.value > 0);

  return (
    <AppProPanel title="Activité administrative" headingId={headingId}>
      <p className="dash-panel-subtitle">
        Demandes, activités et documents — tendance hebdomadaire (périmètre courant).
      </p>
      {!hasData ? (
        <p className="dash-empty">Aucune activité enregistrée sur la période.</p>
      ) : (
        <div className="dash-chart-canvas">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="dashActivityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#eef0ee" />
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} width={28} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ActivityTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                fill="url(#dashActivityFill)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </AppProPanel>
  );
}
