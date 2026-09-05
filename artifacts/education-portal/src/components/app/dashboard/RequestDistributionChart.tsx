import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { AppProPanel } from '@/components/app/pro/AppProPanel';
import { ChartBar3DShape } from '@/components/app/dashboard/ChartBar3D';
import type { ChartBreakdownItem } from '@/components/app/dashboard/dashboard-chart-utils';
import { CHART_COLORS } from '@/components/app/dashboard/dashboard-chart-utils';

type RequestDistributionChartProps = {
  data: ChartBreakdownItem[];
  title?: string;
  subtitle?: string;
  headingId?: string;
};

function DistributionTooltip({
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

export function RequestDistributionChart({
  data,
  title = 'Répartition des demandes',
  subtitle = 'Répartition par statut de workflow dans votre périmètre.',
  headingId = 'dash-distribution-heading',
}: RequestDistributionChartProps) {
  const filtered = data.filter((item) => item.count > 0);

  return (
    <AppProPanel title={title} headingId={headingId}>
      <p className="dash-panel-subtitle">{subtitle}</p>
      {filtered.length === 0 ? (
        <p className="dash-empty">Aucune demande enregistrée.</p>
      ) : (
        <div className="dash-chart-canvas chart-canvas-3d">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={filtered} margin={{ top: 16, right: 12, left: 0, bottom: 48 }} barCategoryGap="22%">
              <CartesianGrid vertical={false} stroke="#eef0ee" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#64748b', fontSize: 10 }}
                interval={0}
                angle={-22}
                textAnchor="end"
                height={56}
                axisLine={{ stroke: '#eef0ee' }}
                tickLine={false}
              />
              <YAxis allowDecimals={false} width={28} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<DistributionTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.06)' }} />
              <Bar dataKey="count" shape={ChartBar3DShape} maxBarSize={36}>
                {filtered.map((entry, index) => (
                  <Cell key={entry.key} fill={CHART_COLORS.series[index % CHART_COLORS.series.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </AppProPanel>
  );
}
