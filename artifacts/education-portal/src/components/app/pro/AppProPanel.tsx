import type { ReactNode } from 'react';

type AppProPanelProps = {
  title: string;
  headingId?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AppProPanel({
  title,
  headingId,
  action,
  children,
  className,
}: AppProPanelProps) {
  const id = headingId ?? `panel-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const panelClass = ['dash-panel', className ?? ''].filter(Boolean).join(' ');

  return (
    <section className={panelClass} aria-labelledby={id}>
      <div className="dash-panel-head">
        <h2 id={id}>{title}</h2>
        {action}
      </div>
      <div className="dash-panel-body">{children}</div>
    </section>
  );
}
