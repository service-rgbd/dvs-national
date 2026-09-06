import { Link, useLocation, useSearch } from 'wouter';
import { useMemo } from 'react';

import { REQUEST_STATUS_FILTERS, requestFilterHref } from '@/config/request-status-filters';

export function RequestStatusNav() {
  const [location] = useLocation();
  const search = useSearch();
  const activeStatus = useMemo(() => {
    return new URLSearchParams(search).get('status') ?? '';
  }, [search, location]);

  return (
    <nav className="dash-status-row" aria-label="Filtrer les demandes">
      {REQUEST_STATUS_FILTERS.map((filter) => {
        const href = requestFilterHref(filter.status);
        const active = filter.status ? activeStatus === filter.status : !activeStatus;

        return (
          <Link
            key={filter.id}
            href={href}
            className={active ? 'dash-status-chip is-active' : 'dash-status-chip'}
            aria-current={active ? 'page' : undefined}
          >
            {filter.label}
          </Link>
        );
      })}
    </nav>
  );
}
