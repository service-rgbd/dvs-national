import type { ChangeEvent, ReactNode } from 'react';
import { Search, X } from 'lucide-react';

export type DashFilterOption = {
  value: string;
  label: string;
};

export type DashFilter = {
  id: string;
  label: string;
  value: string;
  options: DashFilterOption[];
  onChange: (value: string) => void;
};

type DashFilterBarProps = {
  filters?: DashFilter[];
  search?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  actions?: ReactNode;
};

export function DashFilterBar({
  filters = [],
  search,
  searchPlaceholder = 'Rechercher…',
  onSearchChange,
  actions,
}: DashFilterBarProps) {
  const hasSearch = typeof search === 'string' && onSearchChange;

  return (
    <div className="dash-toolbar">
      <div className="dash-toolbar-filters">
        {filters.map((filter) => (
          <label key={filter.id} className="dash-filter">
            <span className="sr-only">{filter.label}</span>
            <select
              value={filter.value}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => filter.onChange(event.target.value)}
              aria-label={filter.label}
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {hasSearch ? (
        <label className="dash-search">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Rechercher</span>
          <input
            type="search"
            value={search}
            placeholder={searchPlaceholder}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          {search ? (
            <button type="button" className="dash-search-clear" onClick={() => onSearchChange('')} aria-label="Effacer la recherche">
              <X size={14} aria-hidden="true" />
            </button>
          ) : null}
        </label>
      ) : null}

      {actions ? <div className="dash-toolbar-actions">{actions}</div> : null}
    </div>
  );
}
