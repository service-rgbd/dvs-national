import type { RequestActorKind } from '@/config/request-permissions';
import { appRoutes } from '@/content/routes';

export type NotificationRecord = {
  id: string;
  type?: string | null;
  title: string;
  body?: string | null;
  isRead: boolean;
  createdAt: string;
  resourceType?: string | null;
  resourceId?: string | null;
};

export type NotificationGroupId = 'inbox' | 'circuit' | 'activities' | 'other';

export type NotificationGroup = {
  id: NotificationGroupId;
  title: string;
  description: string;
  items: NotificationRecord[];
};

const GROUP_COPY: Record<
  RequestActorKind,
  Record<NotificationGroupId, { title: string; description: string }>
> = {
  establishment: {
    inbox: {
      title: 'Retours à traiter',
      description: 'Dossiers renvoyés pour correction.',
    },
    circuit: {
      title: 'Circuit d’autorisation',
      description: 'Décisions et statuts de vos demandes.',
    },
    activities: {
      title: 'Activités scolaires',
      description: 'Rappels J-7, J-1 et activités en cours.',
    },
    other: {
      title: 'Autres alertes',
      description: 'Messages hors circuit d’autorisation.',
    },
  },
  drena: {
    inbox: {
      title: 'Dossiers à analyser',
      description: 'Nouvelles soumissions des établissements de votre DREN.',
    },
    circuit: {
      title: 'Suivi du circuit',
      description: 'Transmissions et changements de statut.',
    },
    activities: {
      title: 'Activités scolaires',
      description: 'Rappels et suivis d’activités du périmètre.',
    },
    other: {
      title: 'Autres alertes',
      description: 'Messages hors instruction des dossiers.',
    },
  },
  dvs: {
    inbox: {
      title: 'Transmissions DREN',
      description: 'Dossiers transmis pour décision DVS.',
    },
    circuit: {
      title: 'Décisions et statuts',
      description: 'Suivi national des autorisations.',
    },
    activities: {
      title: 'Activités scolaires',
      description: 'Rappels des sorties validées.',
    },
    other: {
      title: 'Autres alertes',
      description: 'Messages hors décision DVS.',
    },
  },
};

export function notificationCenterIntro(kind: RequestActorKind): string {
  if (kind === 'drena') {
    return 'Centre des alertes de votre DREN : soumissions à instruire, suivi du circuit et rappels d’activités.';
  }
  if (kind === 'dvs') {
    return 'Centre des alertes DVS : transmissions des DREN, décisions du circuit et rappels d’activités.';
  }
  return 'Centre des alertes de votre établissement : retours de dossiers, décisions et rappels d’activités.';
}

export function notificationHref(item: {
  resourceType?: string | null;
  resourceId?: string | null;
}): string {
  if (item.resourceType === 'request' && item.resourceId) {
    return appRoutes.requestDetail(item.resourceId);
  }
  if (item.resourceType === 'activity' && item.resourceId) {
    return appRoutes.activities;
  }
  if (
    (item.resourceType === 'media_publication' || item.resourceType === 'media') &&
    item.resourceId
  ) {
    return appRoutes.mediaPublicationDetail(item.resourceId);
  }
  return appRoutes.notifications;
}

export function notificationGroupId(
  item: NotificationRecord,
  kind: RequestActorKind,
): NotificationGroupId {
  const type = item.type ?? '';

  if (type.startsWith('activity_')) return 'activities';

  if (kind === 'establishment' && type === 'request_returned_for_correction') {
    return 'inbox';
  }
  if (kind === 'drena' && type === 'request_submitted') {
    return 'inbox';
  }
  if (kind === 'dvs' && type === 'request_forwarded') {
    return 'inbox';
  }
  if (type.startsWith('request_')) return 'circuit';

  return 'other';
}

export function groupNotifications(
  items: NotificationRecord[],
  kind: RequestActorKind,
): NotificationGroup[] {
  const buckets: Record<NotificationGroupId, NotificationRecord[]> = {
    inbox: [],
    circuit: [],
    activities: [],
    other: [],
  };

  for (const item of items) {
    buckets[notificationGroupId(item, kind)].push(item);
  }

  const order: NotificationGroupId[] = ['inbox', 'circuit', 'activities', 'other'];

  return order
    .filter((id) => buckets[id].length > 0)
    .map((id) => ({
      id,
      title: GROUP_COPY[kind][id].title,
      description: GROUP_COPY[kind][id].description,
      items: buckets[id],
    }));
}

export function formatNotificationDate(value: string): string {
  return new Date(value).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
