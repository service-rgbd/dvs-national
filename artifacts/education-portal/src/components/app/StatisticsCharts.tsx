import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { DashSurface } from '@/components/dash/DashSurface';

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
const GRID_STROKE = '#e4e8ee';

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
    <div className="dash-chart-tooltip">
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
    <div className="dash-chart-tooltip">
      <span>{payload[0].name}</span>
      <strong>{payload[0].value.toLocaleString('fr-FR')}</strong>
    </div>
  );
}

export function StatisticsCharts({ requestsByStatus, activitiesByType }: StatisticsChartsProps) {
  const requestRows = requestsByStatus.filter((item) => item.count > 0);
  const activityRows = activitiesByType.filter((item) => item.count > 0);
  const tickStyle = { fill: '#64748b', fontSize: 11 };

  if (requestRows.length === 0 && activityRows.length === 0) {
    return (
      <DashSurface>
        <p className="stats-empty">
          Les graphiques s&apos;afficheront dès que des activités et demandes seront enregistrées dans votre périmètre.
        </p>
      </DashSurface>
    );
  }

  return (
    <div className="stats-charts">
      {requestRows.length > 0 ? (
        <DashSurface>
          <section className="stats-chart" aria-labelledby="requests-chart-heading">
            <header>
              <h2 id="requests-chart-heading">Demandes par statut</h2>
              <p>Répartition du circuit d&apos;autorisation.</p>
            </header>
            <div className="stats-chart-canvas">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={requestRows} margin={{ left: 0, right: 8, top: 12, bottom: 8 }} barCategoryGap="28%">
                  <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tick={tickStyle}
                    height={42}
                  />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} tick={tickStyle} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0, 135, 81, 0.06)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={36}>
                    {requestRows.map((entry, index) => (
                      <Cell key={entry.key} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </DashSurface>
      ) : null}

      {activityRows.length > 0 ? (
        <DashSurface>
          <section className="stats-chart" aria-labelledby="activities-chart-heading">
            <header>
              <h2 id="activities-chart-heading">Activités par type</h2>
              <p>Volume des sorties selon la nature.</p>
            </header>
            <div className="stats-chart-split">
              <div className="stats-chart-canvas">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={activityRows}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={82}
                      paddingAngle={3}
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {activityRows.map((entry, index) => (
                        <Cell key={entry.key} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="stats-legend">
                {activityRows.map((item, index) => (
                  <li key={item.key}>
                    <span style={{ background: CHART_COLORS[index % CHART_COLORS.length] }} />
                    <em>{item.label}</em>
                    <strong>{item.count.toLocaleString('fr-FR')}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </DashSurface>
      ) : null}
    </div>
  );
}
