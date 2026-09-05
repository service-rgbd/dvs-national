type KpiItem = {
  label: string;
  value: number;
  hint?: string;
};

type KpiGridProps = {
  items: KpiItem[];
};

export function KpiGrid({ items }: KpiGridProps) {
  return (
    <div className="kpi-grid" role="list">
      {items.map((item) => (
        <article key={item.label} className="kpi-card" role="listitem">
          <p className="kpi-label">{item.label}</p>
          <p className="kpi-value">{item.value.toLocaleString('fr-FR')}</p>
          {item.hint ? <p className="kpi-hint">{item.hint}</p> : null}
        </article>
      ))}
    </div>
  );
}
