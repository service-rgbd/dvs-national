import { Filter, Sparkles } from 'lucide-react';
import { Link, useLocation, useSearch } from 'wouter';
import { useMemo } from 'react';

import type { RequestActorKind } from '@/config/request-permissions';
import { getRequestFilterNavConfig } from '@/config/request-status-nav';
import {
  REQUEST_STATUS_FILTERS,
  requestFilterHref,
} from '@/config/request-status-filters';

type RequestStatusNavProps = {
  actorKind?: RequestActorKind;
};

export function RequestStatusNav({ actorKind }: RequestStatusNavProps) {
  const [location] = useLocation();
  const search = useSearch();
  const activeStatus = useMemo(() => {
    return new URLSearchParams(search).get('status') ?? '';
  }, [search, location]);

  const navConfig = actorKind ? getRequestFilterNavConfig(actorKind) : null;
  const activeFilters = REQUEST_STATUS_FILTERS.filter((item) => item.group === 'active');
  const closedFilters = REQUEST_STATUS_FILTERS.filter((item) => item.group === 'closed');

  function isActive(status?: string): boolean {
    return status ? activeStatus === status : !activeStatus;
  }

  return (
    <section className="request-status-panel" aria-label="Filtrer les demandes par statut">
      <header className="request-status-panel-head">
        <div className="request-status-panel-head-main">
          <span className="request-status-panel-icon" aria-hidden="true">
            <Filter size={18} strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="request-status-panel-title">
              {navConfig?.title ?? 'Filtrer les dossiers'}
            </h2>
            {navConfig ? (
              <p className="request-status-panel-desc">{navConfig.description}</p>
            ) : null}
          </div>
        </div>
        {activeStatus ? (
          <Link href={appRoutesClear()} className="request-status-panel-reset">
            Effacer le filtre
          </Link>
        ) : null}
      </header>

      {navConfig ? (
        <div className="request-status-quick">
          <p className="request-status-quick-label">
            <Sparkles size={13} aria-hidden="true" />
            Accès rapide
          </p>
          <ul className="request-status-quick-list">
            {navConfig.quickFilters.map((filter) => {
              const active = isActive(filter.status);
              return (
                <li key={filter.id}>
                  <Link
                    href={filter.href}
                    className={active ? 'request-status-quick-card is-active' : 'request-status-quick-card'}
                    aria-current={active ? 'page' : undefined}
                  >
                    <strong>{filter.label}</strong>
                    <span>{filter.description}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="request-status-groups">
        <div className="request-status-group">
          <div className="request-status-group-head">
            <h3>En cours</h3>
            <span>Dossiers actifs du circuit</span>
          </div>
          <ul className="request-status-pills">
            {activeFilters.map((filter) => {
              const href = requestFilterHref(filter.status);
              const active = isActive(filter.status);
              return (
                <li key={filter.id}>
                  <Link
                    href={href}
                    className={active ? 'request-status-pill is-active' : 'request-status-pill'}
                    aria-current={active ? 'page' : undefined}
                  >
                    {filter.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="request-status-group">
          <div className="request-status-group-head">
            <h3>Clôturés</h3>
            <span>Décisions et archives</span>
          </div>
          <ul className="request-status-pills">
            {closedFilters.map((filter) => {
              const href = requestFilterHref(filter.status);
              const active = activeStatus === filter.status;
              return (
                <li key={filter.id}>
                  <Link
                    href={href}
                    className={active ? 'request-status-pill is-active' : 'request-status-pill'}
                    aria-current={active ? 'page' : undefined}
                  >
                    {filter.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function appRoutesClear(): string {
  return requestFilterHref();
}
