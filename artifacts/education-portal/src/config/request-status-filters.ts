import type { RequestStatusParamParameter } from '@workspace/api-client-react';

import { appRoutes } from '@/content/routes';
import { REQUEST_STATUS_LABELS } from '@/config/workflow-labels';

export type RequestStatusFilter = {
  id: string;
  label: string;
  status?: RequestStatusParamParameter;
  group: 'active' | 'closed';
};

/** Sous-catégories workflow Établissement → DREN → DVS. */
export const REQUEST_STATUS_FILTERS: RequestStatusFilter[] = [
  { id: 'all', label: 'Tous', group: 'active' },
  { id: 'draft', label: REQUEST_STATUS_LABELS.draft, status: 'draft', group: 'active' },
  { id: 'submitted', label: REQUEST_STATUS_LABELS.submitted, status: 'submitted', group: 'active' },
  { id: 'under_review', label: 'En analyse DREN', status: 'under_review', group: 'active' },
  { id: 'forwarded', label: REQUEST_STATUS_LABELS.forwarded, status: 'forwarded', group: 'active' },
  { id: 'approved', label: REQUEST_STATUS_LABELS.approved, status: 'approved', group: 'closed' },
  { id: 'rejected', label: REQUEST_STATUS_LABELS.rejected, status: 'rejected', group: 'closed' },
  { id: 'cancelled', label: REQUEST_STATUS_LABELS.cancelled, status: 'cancelled', group: 'closed' },
  { id: 'returned', label: REQUEST_STATUS_LABELS.returned_for_correction, status: 'returned_for_correction', group: 'active' },
  { id: 'archived', label: REQUEST_STATUS_LABELS.archived, status: 'archived', group: 'closed' },
];

export function requestFilterHref(status?: RequestStatusParamParameter): string {
  return status ? `${appRoutes.requests}?status=${status}` : appRoutes.requests;
}

export function requestFilterLabel(status?: string | null): string {
  if (!status) return 'Tous';
  return REQUEST_STATUS_LABELS[status] ?? status;
}
