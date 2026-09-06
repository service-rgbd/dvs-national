import type { ReactNode } from 'react';

import { Checkbox } from '@/components/ui/checkbox';

export type DashTableColumn<T> = {
  id: string;
  header: string;
  render: (row: T) => ReactNode;
};

type DashDataTableProps<T> = {
  rows: T[];
  columns: DashTableColumn<T>[];
  rowKey: (row: T) => string;
  selectedIds: string[];
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  empty: ReactNode;
  onRowOpen?: (row: T) => void;
};

export function DashDataTable<T>({
  rows,
  columns,
  rowKey,
  selectedIds,
  onToggleRow,
  onToggleAll,
  empty,
  onRowOpen,
}: DashDataTableProps<T>) {
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(rowKey(row)));

  if (rows.length === 0) {
    return <div className="dash-table-empty">{empty}</div>;
  }

  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            <th className="dash-table-check">
              <Checkbox
                checked={allSelected}
                onCheckedChange={() => onToggleAll()}
                aria-label="Sélectionner toutes les lignes"
              />
            </th>
            {columns.map((column) => (
              <th key={column.id}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = rowKey(row);
            const selected = selectedIds.includes(id);

            return (
              <tr
                key={id}
                className={selected ? 'is-selected' : undefined}
                onClick={onRowOpen ? () => onRowOpen(row) : undefined}
                data-clickable={onRowOpen ? 'true' : undefined}
              >
                <td className="dash-table-check" onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => onToggleRow(id)}
                    aria-label={`Sélectionner ${id}`}
                  />
                </td>
                {columns.map((column) => (
                  <td key={column.id}>{column.render(row)}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
