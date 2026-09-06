import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { CHART_COLORS } from '@/components/app/dashboard/dashboard-chart-utils';
import type { StatusCount } from '@/lib/pilotage';

type PilotageChartProps = {
  perimeter: StatusCount[];
  circuit: StatusCount[];
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload?: { label?: string } }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="dash-chart-tooltip">
      <span>{payload[0].payload?.label ?? label}</span>
      <strong>{payload[0].value.toLocaleString('fr-FR')}</strong>
    </div>
  );
}

export function PilotageChart({ perimeter, circuit }: PilotageChartProps) {
  const circuitActive = circuit.filter((item) => item.count > 0);
  const circuitTotal = circuit.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="pilot-charts">
      <section className="pilot-chart-block" aria-labelledby="pilot-perimeter-heading">
        <header className="pilot-chart-head">
          <h3 id="pilot-perimeter-heading">Volume du périmètre</h3>
          <p>Établissements, activités et dossiers suivis.</p>
        </header>
        <div className="pilot-chart-canvas">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={perimeter} margin={{ top: 8, right: 8, left: 0, bottom: 4 }} barCategoryGap="28%">
              <CartesianGrid vertical={false} stroke="color-mix(in srgb, var(--pnigvs-border) 80%, transparent)" />
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--pnigvs-muted)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                width={36}
                tick={{ fill: 'var(--pnigvs-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0, 135, 81, 0.06)' }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={48}>
                {perimeter.map((entry, index) => (
                  <Cell key={entry.key} fill={CHART_COLORS.series[index % CHART_COLORS.series.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="pilot-chart-block" aria-labelledby="pilot-circuit-heading">
        <header className="pilot-chart-head">
          <h3 id="pilot-circuit-heading">Circuit des autorisations</h3>
          <p>
            {circuitTotal > 0
              ? `${circuitTotal.toLocaleString('fr-FR')} dossier${circuitTotal > 1 ? 's' : ''} dans le workflow.`
              : 'Aucun dossier ouvert dans ces statuts.'}
          </p>
        </header>
        {circuitActive.length === 0 ? (
          <div className="pilot-chart-empty">
            <p>Le graphique se remplit dès qu&apos;un dossier est soumis, pris en analyse ou transmis.</p>
            <ul className="pilot-chart-zeros">
              {circuit.map((item) => (
                <li key={item.key}>
                  <span>{item.label}</span>
                  <strong>0</strong>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            <div className="pilot-chart-canvas pilot-chart-canvas--donut">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={circuitActive}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {circuitActive.map((entry, index) => (
                      <Cell key={entry.key} fill={CHART_COLORS.series[index % CHART_COLORS.series.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="pilot-chart-legend">
              {circuit.map((item, index) => (
                <li key={item.key}>
                  <span
                    className="pilot-chart-swatch"
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
      </section>
    </div>
  );
}
