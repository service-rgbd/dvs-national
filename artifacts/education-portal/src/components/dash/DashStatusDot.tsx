type DashStatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

type DashStatusDotProps = {
  label: string;
  tone?: DashStatusTone;
};

export function DashStatusDot({ label, tone = 'neutral' }: DashStatusDotProps) {
  return (
    <span className={`dash-status dash-status--${tone}`}>
      <span className="dash-status-dot" aria-hidden="true" />
      {label}
    </span>
  );
}
