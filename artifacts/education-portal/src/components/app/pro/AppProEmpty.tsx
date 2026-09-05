import type { ReactNode } from 'react';

type AppProEmptyProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function AppProEmpty({ title, description, action }: AppProEmptyProps) {
  return (
    <div className="dash-empty-state" role="status">
      <p className="dash-empty-state-title">{title}</p>
      {description ? <p className="dash-empty">{description}</p> : null}
      {action ? <div className="dash-empty-action">{action}</div> : null}
    </div>
  );
}
