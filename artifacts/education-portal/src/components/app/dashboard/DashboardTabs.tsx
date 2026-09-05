type DashboardTab = {
  id: string;
  label: string;
};

type DashboardTabsProps = {
  tabs: DashboardTab[];
  activeId: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
};

export function DashboardTabs({
  tabs,
  activeId,
  onChange,
  ariaLabel = 'Vues du tableau de bord',
}: DashboardTabsProps) {
  return (
    <div className="dash-tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`dash-tab-${tab.id}`}
          aria-selected={activeId === tab.id}
          aria-controls={`dash-panel-${tab.id}`}
          className={activeId === tab.id ? 'dash-tab is-active' : 'dash-tab'}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
