type DashKpiItem = {
  label: string;
  value: string | number;
  hint?: string;
  variant?: 'pill' | 'progress' | 'text';
  progress?: number;
};

export type DashKpiStripProps = {
  items: DashKpiItem[];
};

function formatValue(value: number | string): string {
  return typeof value === 'number' ? value.toLocaleString('fr-FR') : value;
}

export function DashKpiStrip({ items }: DashKpiStripProps) {
  return (
    <div className="dash-kpi-strip" role="list" aria-label="Indicateurs clés">
      {items.map((item) => {
        const variant = item.variant ?? 'pill';
        const progress = Math.max(0, Math.min(100, item.progress ?? 0));

        return (
          <div key={item.label} className={`dash-kpi dash-kpi--${variant}`} role="listitem">
            <span className="dash-kpi-label">{item.label}</span>
            {variant === 'progress' ? (
              <div
                className="dash-kpi-progress"
                role="img"
                aria-label={`${item.label} : ${progress} %`}
              >
                <span className="dash-kpi-progress-fill" style={{ width: `${progress}%` }} />
                <span className="dash-kpi-progress-value">{progress}%</span>
              </div>
            ) : variant === 'text' ? (
              <span className="dash-kpi-text">{formatValue(item.value)}</span>
            ) : (
              <span className="dash-kpi-pill">{formatValue(item.value)}</span>
            )}
            {item.hint ? <span className="dash-kpi-hint">{item.hint}</span> : null}
          </div>
        );
      })}
    </div>
  );
}
