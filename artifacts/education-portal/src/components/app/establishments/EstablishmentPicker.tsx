import { useState } from 'react';
import { Search } from 'lucide-react';
import { useListAppEstablishments } from '@workspace/api-client-react';

import { useDebouncedValue } from '@/hooks/use-debounced-value';

type EstablishmentPickerProps = {
  id?: string;
  value: string;
  onChange: (establishmentId: string) => void;
  required?: boolean;
  disabled?: boolean;
};

export function EstablishmentPicker({
  id = 'establishment-picker',
  value,
  onChange,
  required = false,
  disabled = false,
}: EstablishmentPickerProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isFetching } = useListAppEstablishments({
    page: 1,
    pageSize: 50,
    search: debouncedSearch.trim() || undefined,
    sort: 'name',
    order: 'asc',
  });

  const items = data?.data ?? [];

  return (
    <div className="app-establishment-picker">
      <div className="app-establishment-picker-search">
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher par nom, code ou localité…"
          aria-label="Filtrer les établissements"
          disabled={disabled}
        />
      </div>

      <select
        id={id}
        className="app-pro-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled || isLoading}
      >
        <option value="">
          {isLoading ? 'Chargement…' : 'Sélectionner un établissement…'}
        </option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name} ({item.establishmentCode}) — {item.locality.name}
          </option>
        ))}
      </select>

      {!isLoading && debouncedSearch.trim() && items.length === 0 ? (
        <p className="app-pro-muted">Aucun établissement trouvé dans votre périmètre.</p>
      ) : null}

      {isFetching && !isLoading ? (
        <p className="app-pro-muted" role="status">
          Mise à jour de la liste…
        </p>
      ) : null}
    </div>
  );
}
