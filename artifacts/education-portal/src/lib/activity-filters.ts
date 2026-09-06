import type { ActivitySummary } from '@workspace/api-client-react';

export type ActivityPeriodFilter = 'all' | 'today' | 'week' | 'month' | 'year';
export type ActivitySortKey = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'type';

function activityDate(activity: ActivitySummary): Date {
  return new Date(activity.scheduledAt ?? activity.createdAt);
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function matchesPeriod(value: Date, period: ActivityPeriodFilter, now: Date): boolean {
  if (period === 'all') return true;
  const day = startOfDay(now);
  if (period === 'today') return value >= day;
  if (period === 'week') {
    const week = new Date(day);
    week.setDate(day.getDate() - 6);
    return value >= week;
  }
  if (period === 'month') {
    return value.getFullYear() === now.getFullYear() && value.getMonth() === now.getMonth();
  }
  return value.getFullYear() === now.getFullYear();
}

function searchableText(activity: ActivitySummary): string {
  return [
    activity.title,
    activity.type,
    activity.location,
    activity.establishmentName,
    activity.description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('fr-FR');
}

export function filterAndSortActivities(
  activities: ActivitySummary[],
  input: {
    query: string;
    type: string;
    period: ActivityPeriodFilter;
    sort: ActivitySortKey;
  },
): ActivitySummary[] {
  const tokens = input.query
    .trim()
    .toLocaleLowerCase('fr-FR')
    .split(/\s+/)
    .filter(Boolean);
  const now = new Date();

  const filtered = activities.filter((activity) => {
    if (input.type && activity.type !== input.type) return false;
    if (!matchesPeriod(activityDate(activity), input.period, now)) return false;
    if (tokens.length === 0) return true;
    const haystack = searchableText(activity);
    return tokens.every((token) => haystack.includes(token));
  });

  return filtered.sort((left, right) => {
    if (input.sort === 'name-asc') {
      return left.title.localeCompare(right.title, 'fr', { sensitivity: 'base' });
    }
    if (input.sort === 'name-desc') {
      return right.title.localeCompare(left.title, 'fr', { sensitivity: 'base' });
    }
    if (input.sort === 'type') {
      const byType = left.type.localeCompare(right.type, 'fr', { sensitivity: 'base' });
      if (byType !== 0) return byType;
      return left.title.localeCompare(right.title, 'fr', { sensitivity: 'base' });
    }
    const delta = activityDate(left).getTime() - activityDate(right).getTime();
    return input.sort === 'date-asc' ? delta : -delta;
  });
}
