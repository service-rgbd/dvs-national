export type ChartBreakdownItem = {
  key: string;
  label: string;
  count: number;
};

/** Données territoriales — brancher sur l'API régions/DRENA lorsque disponible. */
export type TerritorialBreakdownItem = ChartBreakdownItem;

export function buildWeeklySeries(total: number, labels: string[]) {
  if (total <= 0) {
    return labels.map((label) => ({ label, value: 0 }));
  }

  const weights = labels.map((_, index) => 0.7 + (index % 3) * 0.15);
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);

  return labels.map((label, index) => ({
    label,
    value: Math.max(0, Math.round((total * weights[index]) / weightSum)),
  }));
}

export function computeTrendPercent(current: number, baseline: number): { label: string; direction: 'up' | 'down' } {
  if (baseline <= 0) {
    return { label: current > 0 ? 'Nouveau' : 'Stable', direction: current > 0 ? 'up' : 'down' };
  }

  const delta = ((current - baseline) / baseline) * 100;
  const rounded = Math.abs(delta).toFixed(1).replace('.0', '');
  return {
    label: `${delta >= 0 ? '+' : '-'}${rounded} %`,
    direction: delta >= 0 ? 'up' : 'down',
  };
}

export const CHART_COLORS = {
  primary: 'var(--pnigvs-primary)',
  success: 'var(--pnigvs-success)',
  warning: 'var(--pnigvs-warning)',
  danger: 'var(--pnigvs-error)',
  info: 'var(--pnigvs-info)',
  neutral: '#64748b',
  series: ['#008751', '#f77f00', '#175cd3', '#0d9488', '#64748b', '#b42318'],
} as const;
