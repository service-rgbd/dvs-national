import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

type SubMetric = {
  label: string;
  value: string;
  trend?: 'up' | 'down';
};

type DashStatCardProps = {
  title: string;
  value: string;
  trend?: { label: string; direction: 'up' | 'down' };
  subMetrics?: SubMetric[];
  chart?: ReactNode;
  accent?: 'green' | 'blue' | 'neutral';
};

export function DashStatCard({
  title,
  value,
  trend,
  subMetrics,
  chart,
  accent = 'green',
}: DashStatCardProps) {
  return (
    <article className={`dash-stat-card dash-stat-card--${accent}`}>
      <header className="dash-stat-head">
        <h3>{title}</h3>
        {trend ? (
          <span className={`dash-trend dash-trend-${trend.direction}`}>
            {trend.direction === 'up' ? (
              <ArrowUpRight size={13} aria-hidden="true" />
            ) : (
              <ArrowDownRight size={13} aria-hidden="true" />
            )}
            <span>{trend.label}</span>
          </span>
        ) : null}
      </header>

      <p className="dash-stat-value">{value}</p>

      {chart ? <div className="dash-stat-chart">{chart}</div> : null}

      {subMetrics && subMetrics.length > 0 ? (
        <dl className="dash-stat-meta">
          {subMetrics.map((item) => (
            <div key={item.label} className="dash-stat-meta-item">
              <dt>{item.label}</dt>
              <dd>
                {item.value}
                {item.trend === 'up' ? ' ↑' : item.trend === 'down' ? ' ↓' : ''}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  );
}

/** @deprecated Utiliser DashStatCard */
export const DashboardMetricCard = DashStatCard;
