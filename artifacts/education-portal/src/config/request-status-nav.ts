import type { RequestStatusParamParameter } from '@workspace/api-client-react';

import type { RequestActorKind } from './request-permissions';
import { requestFilterHref } from './request-status-filters';

export type RequestQuickFilter = {
  id: string;
  label: string;
  description: string;
  status?: RequestStatusParamParameter;
  href: string;
};

export type RequestFilterNavConfig = {
  title: string;
  description: string;
  quickFilters: RequestQuickFilter[];
};

function quickFilter(
  id: string,
  label: string,
  description: string,
  status?: RequestStatusParamParameter,
): RequestQuickFilter {
  return {
    id,
    label,
    description,
    status,
    href: requestFilterHref(status),
  };
}

export function getRequestFilterNavConfig(kind: RequestActorKind): RequestFilterNavConfig {
  if (kind === 'dvs') {
    return {
      title: 'Filtrage validateur · DVS',
      description:
        'Traitez en priorité les dossiers transmis à la DVS, puis ceux encore en analyse DREN.',
      quickFilters: [
        quickFilter('forwarded', 'Transmis DVS', 'Décision finale à rendre', 'forwarded'),
        quickFilter('under_review', 'En analyse DREN', 'Dossiers instruits en attente', 'under_review'),
        quickFilter('submitted', 'Soumis', 'Nouveaux dossiers entrants', 'submitted'),
      ],
    };
  }

  if (kind === 'drena') {
    return {
      title: 'Filtrage analyseur · DRENA',
      description: 'Priorisez les dossiers soumis par les établissements, puis ceux déjà en analyse.',
      quickFilters: [
        quickFilter('submitted', 'Soumis', 'À prendre en charge', 'submitted'),
        quickFilter('under_review', 'En analyse', 'Dossiers en cours d\'instruction', 'under_review'),
        quickFilter('forwarded', 'Transmis DVS', 'Suivi des dossiers envoyés', 'forwarded'),
      ],
    };
  }

  return {
    title: 'Filtrage établissement',
    description: 'Suivez vos brouillons, soumettez à la DREN et consultez l\'avancement.',
    quickFilters: [
      quickFilter('draft', 'Brouillons', 'Dossiers à compléter', 'draft'),
      quickFilter('submitted', 'Soumis', 'En attente DREN', 'submitted'),
      quickFilter('all', 'Tous', 'Vue complète du périmètre'),
    ],
  };
}
