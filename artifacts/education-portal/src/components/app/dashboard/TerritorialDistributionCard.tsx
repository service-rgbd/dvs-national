import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { AppProPanel } from '@/components/app/pro/AppProPanel';
import type { TerritorialBreakdownItem } from '@/components/app/dashboard/dashboard-chart-utils';
import { CHART_COLORS } from '@/components/app/dashboard/dashboard-chart-utils';

type TerritorialDistributionCardProps = {
  data: TerritorialBreakdownItem[];
  headingId?: string;
};

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

export function TerritorialDistributionCard({
  data,
  headingId = 'dash-territorial-heading',
}: TerritorialDistributionCardProps) {
  const hasData = data.some((item) => item.count > 0);
  const chartData = [...data]
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <AppProPanel title="Répartition territoriale" headingId={headingId}>
      {!hasData ? (
        <p className="dash-empty">
          Les données régionales s&apos;afficheront dès que l&apos;API de répartition par région / DRENA
          sera connectée à votre périmètre.
        </p>
      ) : (
        <div className="dash-chart-canvas dash-territorial-chart">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
              barCategoryGap="18%"
            >
              <CartesianGrid horizontal={false} stroke="#eef0ee" />
              <XAxis type="number" allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="label"
                width={96}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0, 135, 81, 0.04)' }} />
              <Bar dataKey="count" fill={CHART_COLORS.primary} radius={0} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </AppProPanel>
  );
}
