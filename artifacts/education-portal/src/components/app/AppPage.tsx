import type { ReactNode } from 'react';
import { Link } from 'wouter';

import { appRoutes } from '@/content/routes';

type AppPageProps = {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  breadcrumb?: { label: string; href?: string }[];
  variant?: 'default' | 'dashboard';
  heading?: 'hero' | 'page';
  hideHeading?: boolean;
  className?: string;
};

export function AppPage({
  title,
  description,
  children,
  action,
  breadcrumb,
  variant = 'dashboard',
  heading = 'page',
  hideHeading = false,
  className,
}: AppPageProps) {
  const isDashboard = variant === 'dashboard';
  const crumbs = breadcrumb ?? [];
  const hasBreadcrumb = crumbs.length > 0;
  const showHeader = !hideHeading || Boolean(action) || hasBreadcrumb;
  const pageClass = [
    'app-pro-page',
    isDashboard ? 'app-pro-page--dashboard' : '',
    heading === 'hero' ? 'app-pro-page--hero' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={pageClass}>
      {showHeader ? (
        <header className={`dash-page-header${isDashboard ? ' dash-page-header--dashboard' : ''}`}>
          <div className="dash-page-header-copy">
            {isDashboard ? (
              <>
                {hasBreadcrumb ? (
                  <nav className="dash-breadcrumb dash-breadcrumb--compact" aria-label="Fil d'Ariane">
                    <Link href={appRoutes.app}>Accueil</Link>
                    {crumbs.map((crumb, index) => (
                      <span key={`${crumb.label}-${index}`} className="dash-breadcrumb-segment">
                        <span aria-hidden="true">/</span>
                        {crumb.href && index < crumbs.length - 1 ? (
                          <Link href={crumb.href}>{crumb.label}</Link>
                        ) : (
                          <span aria-current="page">{crumb.label}</span>
                        )}
                      </span>
                    ))}
                  </nav>
                ) : null}
                {hideHeading ? null : (
                  <>
                    <h1 className={`dash-page-title${heading === 'hero' ? ' dash-page-title--home' : ''}`}>
                      {title}
                    </h1>
                    {description ? <p className="dash-page-subtitle">{description}</p> : null}
                  </>
                )}
              </>
            ) : (
              <>
                <nav className="dash-breadcrumb" aria-label="Fil d'Ariane">
                  <Link href={appRoutes.app}>Accueil</Link>
                  {crumbs.map((crumb, index) => (
                    <span key={`${crumb.label}-${index}`} className="dash-breadcrumb-segment">
                      <span aria-hidden="true">/</span>
                      {crumb.href && index < crumbs.length - 1 ? (
                        <Link href={crumb.href}>{crumb.label}</Link>
                      ) : (
                        <span aria-current="page">{crumb.label}</span>
                      )}
                    </span>
                  ))}
                </nav>
                <h1 className="dash-page-title">{title}</h1>
                {description ? <p className="app-pro-lead">{description}</p> : null}
              </>
            )}
          </div>
          {action ? <div className="dash-page-header-action">{action}</div> : null}
        </header>
      ) : null}
      <div className="app-pro-page-body">{children}</div>
    </div>
  );
}
