import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { ChartBar3DShape } from '@/components/app/dashboard/ChartBar3D';

type BreakdownItem = {
  key: string;
  label: string;
  count: number;
};

type StatisticsChartsProps = {
  requestsByStatus: BreakdownItem[];
  activitiesByType: BreakdownItem[];
};

const CHART_COLORS = ['#008751', '#f77f00', '#175cd3', '#0d9488', '#64748b', '#b42318'];
const GRID_STROKE = '#e1e5ed';

function ChartTooltip({
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
    <div className="dash-chart-tooltip chart-tooltip-3d">
      <span>{label}</span>
      <strong>{payload[0].value.toLocaleString('fr-FR')}</strong>
    </div>
  );
}

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="dash-chart-tooltip chart-tooltip-3d">
      <span>{payload[0].name}</span>
      <strong>{payload[0].value.toLocaleString('fr-FR')}</strong>
    </div>
  );
}

export function StatisticsCharts({ requestsByStatus, activitiesByType }: StatisticsChartsProps) {
  const hasRequests = requestsByStatus.some((item) => item.count > 0);
  const hasActivities = activitiesByType.some((item) => item.count > 0);

  if (!hasRequests && !hasActivities) {
    return (
      <p className="stats-empty-hint">
        Les graphiques s&apos;afficheront dès que des activités et demandes seront enregistrées dans votre périmètre.
      </p>
    );
  }

  const tickStyle = { fill: '#64748b', fontSize: 11 };

  return (
    <div className="stats-charts-grid stats-charts-grid--3d">
      {hasRequests ? (
        <section className="stats-chart-block chart-panel-3d" aria-labelledby="requests-chart-heading">
          <h3 id="requests-chart-heading">Demandes par statut</h3>
          <div className="dash-chart-canvas chart-canvas-3d">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={requestsByStatus}
                margin={{ left: 0, right: 12, top: 16, bottom: 4 }}
                barCategoryGap="24%"
              >
                <CartesianGrid vertical={false} horizontal stroke={GRID_STROKE} strokeDasharray="" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: GRID_STROKE }}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  height={56}
                  tick={tickStyle}
                />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} tick={tickStyle} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0, 135, 81, 0.06)' }} />
                <Bar dataKey="count" shape={ChartBar3DShape} maxBarSize={40}>
                  {requestsByStatus.map((entry, index) => (
                    <Cell key={entry.key} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : null}

      {hasActivities ? (
        <section className="stats-chart-block chart-panel-3d" aria-labelledby="activities-chart-heading">
          <h3 id="activities-chart-heading">Activités par type</h3>
          <div className="dash-chart-canvas chart-canvas-3d chart-canvas-3d--split">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={activitiesByType.filter((item) => item.count > 0)}
                  dataKey="count"
                  nameKey="label"
                  cx="38%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={2}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {activitiesByType.map((entry, index) => (
                    <Cell key={entry.key} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="chart-3d-legend">
              {activitiesByType
                .filter((item) => item.count > 0)
                .map((item, index) => (
                  <li key={item.key}>
                    <span
                      className="chart-3d-legend-swatch"
                      style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span>{item.label}</span>
                    <strong>{item.count.toLocaleString('fr-FR')}</strong>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}
