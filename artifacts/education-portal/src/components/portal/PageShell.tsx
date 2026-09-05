import type { ReactNode } from 'react';

import { Link } from 'wouter';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PageShellProps = {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
  variant?: 'default' | 'narrow';
  layout?: 'default' | 'editorial';
};

export function PageShell({
  title,
  description,
  breadcrumbs,
  children,
  variant = 'default',
  layout = 'default',
}: PageShellProps) {
  return (
    <div className={`page-shell page-shell-${variant}${layout === 'editorial' ? ' page-shell-editorial' : ''}`}>
      <div className="container">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="breadcrumb" aria-label="Fil d'Ariane">
            <ol>
              {breadcrumbs.map((item, index) => (
                <li key={`${item.label}-${index}`}>
                  {item.href && index < breadcrumbs.length - 1 ? (
                    <Link href={item.href}>{item.label}</Link>
                  ) : (
                    <span aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}>
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {layout !== 'editorial' ? (
          <header className="page-header">
            <h1>{title}</h1>
            {description ? <p className="page-lead">{description}</p> : null}
          </header>
        ) : null}
        <div className="page-body">{children}</div>
      </div>
    </div>
  );
}
