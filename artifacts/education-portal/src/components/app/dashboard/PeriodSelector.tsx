import type { ChangeEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';

export type PeriodPreset = 'today' | 'week' | 'month' | 'quarter';

type PeriodSelectorProps = {
  value?: PeriodPreset;
  onChange?: (preset: PeriodPreset) => void;
};

function formatRange(start: Date, end: Date): string {
  const fmt = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${fmt.format(start).toUpperCase()} → ${fmt.format(end).toUpperCase()}`;
}

function getRange(preset: PeriodPreset): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date(end);

  switch (preset) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(end.getDate() - 6);
      break;
    case 'quarter': {
      const quarterStart = Math.floor(end.getMonth() / 3) * 3;
      start.setMonth(quarterStart, 1);
      start.setHours(0, 0, 0, 0);
      break;
    }
    case 'month':
    default:
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
  }

  return { start, end };
}

const PRESET_LABELS: Record<PeriodPreset, string> = {
  today: 'Aujourd\'hui',
  week: 'Cette semaine',
  month: 'Ce mois',
  quarter: 'Ce trimestre',
};

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const [preset, setPreset] = useState<PeriodPreset>(value ?? 'month');
  const rangeLabel = useMemo(() => {
    const { start, end } = getRange(preset);
    return formatRange(start, end);
  }, [preset]);

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as PeriodPreset;
    setPreset(next);
    onChange?.(next);
  }

  return (
    <div className="dash-period-picker" aria-label="Période affichée">
      <label htmlFor="dash-period-select" className="dash-period-picker-label">
        Période
      </label>
      <div className="dash-period-picker-control">
        <select
          id="dash-period-select"
          className="dash-period-select"
          value={preset}
          onChange={handleChange}
          aria-describedby="dash-period-range"
        >
          {(Object.keys(PRESET_LABELS) as PeriodPreset[]).map((key) => (
            <option key={key} value={key}>
              {PRESET_LABELS[key]}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="dash-period-chevron" aria-hidden="true" />
      </div>
      <strong id="dash-period-range">{rangeLabel}</strong>
    </div>
  );
}
