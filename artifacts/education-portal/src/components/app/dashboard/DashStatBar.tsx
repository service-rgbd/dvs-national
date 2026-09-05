import type { LucideIcon } from 'lucide-react';

type DashStatTone = 'primary' | 'accent' | 'neutral';

type DashStatItem = {
  label: string;
  value: number | string;
  hint?: string;
  icon?: LucideIcon;
  tone?: DashStatTone;
};

export type DashStatBarProps = {
  items: DashStatItem[];
};

function formatValue(value: number | string): string {
  return typeof value === 'number' ? value.toLocaleString('fr-FR') : value;
}

export function DashStatBar({ items }: DashStatBarProps) {
  return (
    <div className="dash-stat-grid" role="list" aria-label="Indicateurs clés">
      {items.map((item) => {
        const Icon = item.icon;
        const tone = item.tone ?? 'neutral';
        return (
          <article
            key={item.label}
            className={`dash-stat-card dash-stat-card--${tone}`}
            role="listitem"
          >
            {Icon ? (
              <span className="dash-stat-card-icon" aria-hidden="true">
                <Icon size={18} strokeWidth={1.75} />
              </span>
            ) : null}
            <div className="dash-stat-card-copy">
              <p className="dash-stat-card-label">{item.label}</p>
              <p className="dash-stat-card-value">{formatValue(item.value)}</p>
              {item.hint ? <p className="dash-stat-card-hint">{item.hint}</p> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
