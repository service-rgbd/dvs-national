import type { MediaPublicationStatus, MediaPublicationSummary } from '@workspace/api-client-react';

export type MediaPeriodFilter = 'all' | 'today' | 'week' | 'month' | 'year';
export type MediaKindFilter = 'all' | 'photo' | 'video';
export type MediaSortKey = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function matchesPeriod(value: Date, period: MediaPeriodFilter, now: Date): boolean {
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

function searchableText(item: MediaPublicationSummary): string {
  return [item.title, item.activityTitle, item.establishmentName, item.description, item.activityType]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('fr-FR');
}

export function filterAndSortMediaPublications(
  items: MediaPublicationSummary[],
  input: {
    query: string;
    status: string;
    kind: MediaKindFilter;
    period: MediaPeriodFilter;
    sort: MediaSortKey;
  },
): MediaPublicationSummary[] {
  const tokens = input.query
    .trim()
    .toLocaleLowerCase('fr-FR')
    .split(/\s+/)
    .filter(Boolean);
  const now = new Date();

  const filtered = items.filter((item) => {
    if (input.status && item.status !== (input.status as MediaPublicationStatus)) return false;
    if (input.kind !== 'all' && item.coverMediaType && item.coverMediaType !== input.kind) {
      return false;
    }
    if (input.kind === 'photo' && item.coverMediaType === 'video') return false;
    if (input.kind === 'video' && item.coverMediaType === 'photo') return false;
    if (!matchesPeriod(new Date(item.updatedAt ?? item.createdAt), input.period, now)) return false;
    if (tokens.length === 0) return true;
    const haystack = searchableText(item);
    return tokens.every((token) => haystack.includes(token));
  });

  return filtered.sort((left, right) => {
    if (input.sort === 'name-asc') {
      return left.title.localeCompare(right.title, 'fr', { sensitivity: 'base' });
    }
    if (input.sort === 'name-desc') {
      return right.title.localeCompare(left.title, 'fr', { sensitivity: 'base' });
    }
    const delta =
      new Date(left.updatedAt ?? left.createdAt).getTime() -
      new Date(right.updatedAt ?? right.createdAt).getTime();
    return input.sort === 'date-asc' ? delta : -delta;
  });
}
