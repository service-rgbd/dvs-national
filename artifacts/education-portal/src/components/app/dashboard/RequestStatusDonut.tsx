import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { AppProPanel } from '@/components/app/pro/AppProPanel';
import type { ChartBreakdownItem } from '@/components/app/dashboard/dashboard-chart-utils';
import { CHART_COLORS } from '@/components/app/dashboard/dashboard-chart-utils';

type RequestStatusDonutProps = {
  data: ChartBreakdownItem[];
  headingId?: string;
};

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { label: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="dash-chart-tooltip">
      <span>{item.payload.label ?? item.name}</span>
      <strong>{item.value.toLocaleString('fr-FR')}</strong>
    </div>
  );
}

export function RequestStatusDonut({ data, headingId = 'dash-donut-heading' }: RequestStatusDonutProps) {
  const filtered = data.filter((item) => item.count > 0);
  const total = filtered.reduce((sum, item) => sum + item.count, 0);
  const processed = filtered
    .filter((item) => ['approved', 'rejected', 'archived'].includes(item.key))
    .reduce((sum, item) => sum + item.count, 0);
  const rate = total > 0 ? Math.round((processed / total) * 100) : 0;

  return (
    <AppProPanel title="État des dossiers" headingId={headingId}>
      {total === 0 ? (
        <p className="dash-empty">Aucun dossier enregistré dans votre périmètre.</p>
      ) : (
        <>
          <div className="dash-donut-summary">
            <p className="dash-donut-rate">{rate} %</p>
            <p className="dash-donut-caption">Dossiers traités</p>
          </div>
          <div className="dash-donut-chart">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={filtered}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={1}
                  stroke="none"
                >
                  {filtered.map((entry, index) => (
                    <Cell key={entry.key} fill={CHART_COLORS.series[index % CHART_COLORS.series.length]} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="dash-donut-legend">
            {filtered.map((item, index) => (
              <li key={item.key}>
                <span
                  className="dash-donut-swatch"
                  style={{ background: CHART_COLORS.series[index % CHART_COLORS.series.length] }}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
                <strong>{item.count.toLocaleString('fr-FR')}</strong>
              </li>
            ))}
          </ul>
        </>
      )}
    </AppProPanel>
  );
}
