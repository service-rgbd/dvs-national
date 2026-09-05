import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

type KpiAccent = 'primary' | 'accent' | 'blue' | 'teal';

type KpiItem = {
  label: string;
  value: number | string;
  hint?: string;
  icon?: LucideIcon;
  accent?: KpiAccent;
  trend?: { label: string; direction: 'up' | 'down' };
};

type AppProKpiRowProps = {
  items: KpiItem[];
};

/** ~20 % orange : 1 accent sur 4 cartes KPI */
const ACCENT_CYCLE: KpiAccent[] = ['primary', 'primary', 'primary', 'accent'];

const SPARKLINE_COLORS: Record<KpiAccent, string> = {
  primary: '#008751',
  accent: '#f77f00',
  blue: '#175cd3',
  teal: '#0d9488',
};

const SPARKLINE_PATHS = [
  'M0,28 L20,22 L40,26 L60,14 L80,18 L100,8 L120,12 L140,6 L160,10 L180,4 L200,8',
  'M0,20 L20,24 L40,16 L60,20 L80,12 L100,16 L120,10 L140,14 L160,8 L180,12 L200,6',
  'M0,24 L20,18 L40,22 L60,10 L80,14 L100,20 L120,12 L140,16 L160,10 L180,14 L200,8',
  'M0,16 L20,20 L40,12 L60,16 L80,8 L100,12 L120,18 L140,10 L160,14 L180,8 L200,12',
];

function formatKpiValue(value: number | string): string {
  return typeof value === 'number' ? value.toLocaleString('fr-FR') : value;
}

export function AppProKpiRow({ items }: AppProKpiRowProps) {
  return (
    <div className="app-pro-kpi-row" role="list">
      {items.map((item, index) => {
        const accent = item.accent ?? ACCENT_CYCLE[index % ACCENT_CYCLE.length];
        const Icon = item.icon;
        const color = SPARKLINE_COLORS[accent];

        return (
          <article key={item.label} className="app-pro-kpi-card" role="listitem">
            <div className="app-pro-kpi-head">
              {Icon ? (
                <span className={`app-pro-kpi-icon app-pro-kpi-icon--${accent}`} aria-hidden="true">
                  <Icon size={18} />
                </span>
              ) : null}
              {item.trend ? (
                <span className={`app-pro-kpi-trend app-pro-kpi-trend--${item.trend.direction}`}>
                  {item.trend.direction === 'up' ? (
                    <ArrowUpRight size={12} aria-hidden="true" />
                  ) : (
                    <ArrowDownRight size={12} aria-hidden="true" />
                  )}
                  {item.trend.label}
                </span>
              ) : null}
            </div>
            <p className="app-pro-kpi-value">{formatKpiValue(item.value)}</p>
            <p className="app-pro-kpi-label">{item.label}</p>
            {item.hint ? <p className="app-pro-kpi-hint">{item.hint}</p> : null}
            <div className="app-pro-kpi-sparkline" aria-hidden="true">
              <svg viewBox="0 0 200 32" preserveAspectRatio="none">
                <path
                  d={SPARKLINE_PATHS[index % SPARKLINE_PATHS.length]}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </article>
        );
      })}
    </div>
  );
}
