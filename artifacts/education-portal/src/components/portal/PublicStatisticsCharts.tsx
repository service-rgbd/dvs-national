import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from 'recharts';

import { ChartBar3DShape } from '@/components/app/dashboard/ChartBar3D';

const COLORS = ['#008751', '#f77f00', '#6366f1', '#94a3b8'];

type PublicStatisticsChartsProps = {
  establishments: number;
  establishmentsActive: number;
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="public-chart-tooltip">
      <strong>{label ?? payload[0]?.name}</strong>
      <span>{payload[0]?.value?.toLocaleString('fr-FR')}</span>
    </div>
  );
}

export function PublicStatisticsCharts({
  establishments,
  establishmentsActive,
}: PublicStatisticsChartsProps) {
  const inactive = Math.max(0, establishments - establishmentsActive);

  const barData = [
    { label: 'Référencés', count: establishments },
    { label: 'Actifs', count: establishmentsActive },
    { label: 'Inactifs', count: inactive },
  ];

  const pieData = [
    { name: 'Actifs', value: establishmentsActive },
    { name: 'Inactifs / autres', value: inactive },
  ].filter((item) => item.value > 0);

  const activeRate =
    establishments > 0 ? Math.round((establishmentsActive / establishments) * 100) : 0;

  return (
    <div className="public-stats-charts">
      <div className="public-chart-panel public-chart-panel--3d">
        <h3>Répartition du référentiel</h3>
        <div className="public-chart-canvas public-chart-canvas--3d">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} margin={{ top: 16, right: 8, left: 0, bottom: 8 }} barCategoryGap="20%">
              <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0, 135, 81, 0.06)' }} />
              <Bar dataKey="count" shape={ChartBar3DShape} maxBarSize={48}>
                {barData.map((entry, index) => (
                  <Cell key={entry.label} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="public-chart-panel public-chart-panel--3d">
        <h3>Taux d&apos;établissements actifs</h3>
        <div className="public-chart-canvas public-chart-canvas--3d public-chart-canvas--split">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={3}
              >
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="public-chart-kpi">
            <strong>{activeRate}%</strong>
            <span>actifs</span>
            <ul className="public-chart-legend">
              {pieData.map((item, index) => (
                <li key={item.name}>
                  <span className="public-chart-legend-swatch" style={{ background: COLORS[index] }} />
                  {item.name}
                  <strong>{item.value.toLocaleString('fr-FR')}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
