import type { MediaPublicationStatus } from '@workspace/api-client-react';

import { appRoutes } from '@/content/routes';

export type MediaStatusFilter = {
  status: MediaPublicationStatus;
  label: string;
  group: 'active' | 'closed';
};

export const MEDIA_STATUS_FILTERS: MediaStatusFilter[] = [
  { status: 'draft', label: 'Brouillons', group: 'active' },
  { status: 'submitted', label: 'Soumis', group: 'active' },
  { status: 'under_review', label: 'En analyse', group: 'active' },
  { status: 'approved', label: 'Validés DVS', group: 'active' },
  { status: 'published', label: 'Publiés', group: 'closed' },
  { status: 'rejected', label: 'Rejetés', group: 'closed' },
  { status: 'cancelled', label: 'Annulés', group: 'closed' },
];

export const MEDIA_STATUS_LABELS: Record<MediaPublicationStatus, string> = {
  draft: 'Brouillon',
  submitted: 'Soumis',
  under_review: 'En analyse',
  approved: 'Validé DVS',
  published: 'Publié',
  rejected: 'Rejeté',
  cancelled: 'Annulé',
};

export function mediaFilterHref(status: MediaPublicationStatus): string {
  return `${appRoutes.mediaPublications}?status=${status}`;
}

export function mediaFilterLabel(status: string): string {
  return MEDIA_STATUS_LABELS[status as MediaPublicationStatus] ?? status;
}

export function mediaStatusBadgeClass(status: string): string {
  switch (status) {
    case 'published':
    case 'approved':
      return 'status-badge status-approved';
    case 'rejected':
    case 'cancelled':
      return 'status-badge status-rejected';
    case 'submitted':
      return 'status-badge status-pending';
    case 'under_review':
      return 'status-badge status-review';
    default:
      return 'status-badge status-draft';
  }
}
