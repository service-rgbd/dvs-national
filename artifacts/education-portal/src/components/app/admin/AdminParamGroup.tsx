import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

type AdminParamGroupProps = {
  id: string;
  title: string;
  description?: string;
  cdcRef?: string;
  headingId: string;
  children: ReactNode;
  action?: ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
};

export function AdminParamGroup({
  id,
  title,
  description,
  cdcRef,
  headingId,
  children,
  action,
  defaultOpen = false,
  collapsible = true,
}: AdminParamGroupProps) {
  if (!collapsible) {
    return (
      <section className="admin-param-group admin-param-group--static" aria-labelledby={headingId}>
        <header className="admin-param-group-head">
          <div className="admin-param-group-head-copy">
            {cdcRef ? <span className="admin-param-ref">{cdcRef}</span> : null}
            <h2 id={headingId}>{title}</h2>
            {description ? <p className="app-pro-muted">{description}</p> : null}
          </div>
          {action}
        </header>
        <div className="admin-param-group-body">{children}</div>
      </section>
    );
  }

  return (
    <details
      id={id}
      className="admin-param-group"
      open={defaultOpen}
      data-admin-section={id}
    >
      <summary className="admin-param-group-head">
        <div className="admin-param-group-head-copy">
          {cdcRef ? <span className="admin-param-ref">{cdcRef}</span> : null}
          <h2 id={headingId}>{title}</h2>
          {description ? <p className="app-pro-muted">{description}</p> : null}
        </div>
        <span className="admin-param-group-actions">
          {action}
          <ChevronDown size={18} className="admin-param-chevron" aria-hidden="true" />
        </span>
      </summary>
      <div className="admin-param-group-body">{children}</div>
    </details>
  );
}

type AdminSettingsGridProps = {
  items: { key: string; value: string }[];
};

export function AdminSettingsGrid({ items }: AdminSettingsGridProps) {
  return (
    <dl className="admin-settings-grid">
      {items.map((item) => (
        <div key={item.key} className="admin-settings-row">
          <dt>{item.key}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

type AdminStatusBadgeProps = {
  status: 'active' | 'planned';
};

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  return (
    <span className={`admin-status-badge admin-status-badge--${status}`}>
      {status === 'active' ? 'Actif' : 'Phase 2'}
    </span>
  );
}
