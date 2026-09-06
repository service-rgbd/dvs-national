import type {
  ActivitySummary,
  AppDashboardKpis,
  AppDashboardProfile,
  RequestSummary,
  StatisticsBreakdownItem,
} from '@workspace/api-client-react';

import type { RequestActorKind } from '@/config/request-permissions';
import { requestFilterHref } from '@/config/request-status-filters';
import { REQUEST_STATUS_LABELS } from '@/config/workflow-labels';

export type PilotageViewpoint = 'overview' | 'queue' | 'activities' | 'reports';

export type StatusCount = {
  key: string;
  label: string;
  count: number;
};

export type AttentionItem = {
  label: string;
  hint: string;
  count: number;
  href: string;
};

export type SituationBrief = {
  kicker: string;
  title: string;
  lead: string;
  paragraphs: string[];
  attention: AttentionItem[];
};

const OPEN_STATUSES = [
  'draft',
  'submitted',
  'under_review',
  'forwarded',
  'returned_for_correction',
] as const;

const DECIDED_STATUSES = ['approved', 'rejected', 'cancelled', 'archived'] as const;

const CIRCUIT_ORDER = [
  'draft',
  'submitted',
  'under_review',
  'forwarded',
  'returned_for_correction',
  'approved',
  'rejected',
  'cancelled',
  'archived',
] as const;

export function countByStatus(requests: RequestSummary[]): Record<string, number> {
  return requests.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});
}

export function countsFromBreakdown(items: StatisticsBreakdownItem[]): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item.key] = item.count;
    return acc;
  }, {});
}

export function statusValue(counts: Record<string, number>, key: string): number {
  return counts[key] ?? 0;
}

export function sumStatuses(counts: Record<string, number>, keys: readonly string[]): number {
  return keys.reduce((sum, key) => sum + statusValue(counts, key), 0);
}

export function buildStatusBreakdown(counts: Record<string, number>): StatusCount[] {
  return CIRCUIT_ORDER.map((key) => ({
    key,
    label: REQUEST_STATUS_LABELS[key] ?? key,
    count: statusValue(counts, key),
  })).filter((item) => item.count > 0);
}

export function buildActorCircuit(actor: RequestActorKind, counts: Record<string, number>): StatusCount[] {
  const keys =
    actor === 'dvs'
      ? ['submitted', 'under_review', 'forwarded', 'approved', 'rejected']
      : actor === 'drena'
        ? ['submitted', 'under_review', 'forwarded']
        : ['draft', 'submitted', 'returned_for_correction', 'approved'];

  return keys.map((key) => ({
    key,
    label: REQUEST_STATUS_LABELS[key] ?? key,
    count: statusValue(counts, key),
  }));
}

export function countActivitiesByType(activities: ActivitySummary[]): StatusCount[] {
  const grouped = activities.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([key, count]) => ({ key, label: key, count }))
    .sort((a, b) => b.count - a.count);
}

function qty(count: number, singular: string, plural: string): string {
  return `${count.toLocaleString('fr-FR')} ${count === 1 ? singular : plural}`;
}

export function buildSituationBrief(input: {
  actor: RequestActorKind;
  profile: AppDashboardProfile;
  kpis: AppDashboardKpis;
  counts: Record<string, number>;
  listedTotal: number;
}): SituationBrief {
  const { actor, profile, kpis, counts, listedTotal } = input;
  const submitted = statusValue(counts, 'submitted');
  const underReview = statusValue(counts, 'under_review');
  const forwarded = statusValue(counts, 'forwarded');
  const drafts = statusValue(counts, 'draft');
  const returned = statusValue(counts, 'returned_for_correction');
  const approved = statusValue(counts, 'approved');
  const rejected = statusValue(counts, 'rejected');
  const decided = sumStatuses(counts, DECIDED_STATUSES);
  const open = sumStatuses(counts, OPEN_STATUSES);
  const approvedRate = decided > 0 ? Math.round((approved / decided) * 100) : null;
  const sampleNote =
    listedTotal > 0
      ? `Les statuts ci-dessous portent sur ${qty(listedTotal, 'dossier suivi', 'dossiers suivis')} dans votre périmètre.`
      : 'Aucun dossier d’autorisation n’est encore ouvert dans ce périmètre.';

  if (actor === 'dvs') {
    return {
      kicker: 'Note de situation · DVS',
      title: 'Validation des autorisations de vie scolaire',
      lead: `${profile.scopeLabel}. ${qty(
        kpis.requestsPending + kpis.requestsUnderReview,
        'dossier reste',
        'dossiers restent',
      )} à instruire ou à trancher dans le circuit Établissement → DREN → DVS.`,
      paragraphs: [
        `Le référentiel suivi compte ${qty(kpis.establishments, 'établissement', 'établissements')} et ${qty(
          kpis.activities,
          'activité scolaire',
          'activités scolaires',
        )} (sorties, compétitions, événements).`,
        sampleNote,
        open > 0
          ? `File ouverte : ${qty(submitted, 'dossier soumis', 'dossiers soumis')}, ${qty(
              underReview,
              'en analyse DREN',
              'en analyse DREN',
            )}, ${qty(forwarded, 'transmis à la DVS', 'transmis à la DVS')}${
              returned > 0 ? `, ${qty(returned, 'renvoyé pour correction', 'renvoyés pour correction')}` : ''
            }.`
          : 'Aucun dossier n’est actuellement ouvert dans le circuit d’autorisation.',
        approvedRate != null
          ? `Parmi les dossiers déjà tranchés, ${approvedRate} % ont été validés (${qty(
              approved,
              'autorisation',
              'autorisations',
            )}, ${qty(rejected, 'rejet définitif', 'rejets définitifs')}). Toute décision défavorable exige un motif et notifie l’établissement.`
          : 'Aucune décision finale n’a encore été rendue sur ce périmètre.',
      ],
      attention: [
        {
          label: 'Transmis à la DVS',
          hint: 'Décision à rendre (valider, renvoyer ou rejeter)',
          count: forwarded,
          href: requestFilterHref('forwarded'),
        },
        {
          label: 'En analyse DREN',
          hint: 'Suivi des dossiers encore instruits en région',
          count: underReview,
          href: requestFilterHref('under_review'),
        },
        {
          label: 'Soumis',
          hint: 'Nouveaux dossiers entrants',
          count: submitted,
          href: requestFilterHref('submitted'),
        },
      ],
    };
  }

  if (actor === 'drena') {
    return {
      kicker: 'Note de situation · DREN',
      title: 'Instruction régionale des autorisations',
      lead: `${profile.scopeLabel}. Priorité : prendre en analyse les dossiers soumis par les établissements, puis transmettre à la DVS.`,
      paragraphs: [
        `Votre périmètre recense ${qty(kpis.establishments, 'établissement', 'établissements')} et ${qty(
          kpis.activities,
          'activité',
          'activités',
        )}.`,
        sampleNote,
        submitted > 0
          ? `${qty(submitted, 'dossier soumis attend', 'dossiers soumis attendent')} une prise en analyse DREN.`
          : 'Aucun dossier soumis n’est en attente de prise en charge.',
        underReview > 0 || forwarded > 0
          ? `${qty(underReview, 'dossier est', 'dossiers sont')} déjà en analyse. ${qty(
              forwarded,
              'dossier a',
              'dossiers ont',
            )} été transmis à la DVS pour décision.`
          : 'Aucun dossier n’est encore en analyse ni transmis à la DVS.',
      ],
      attention: [
        {
          label: 'Soumis',
          hint: 'À prendre en analyse',
          count: submitted,
          href: requestFilterHref('submitted'),
        },
        {
          label: 'En analyse',
          hint: 'Instruction en cours avant transmission',
          count: underReview,
          href: requestFilterHref('under_review'),
        },
        {
          label: 'Transmis à la DVS',
          hint: 'Suivi des dossiers déjà envoyés',
          count: forwarded,
          href: requestFilterHref('forwarded'),
        },
      ],
    };
  }

  return {
    kicker: 'Votre établissement',
    title: profile.scopeLabel,
    lead: 'Deux étapes seulement : enregistrez l’activité, puis ouvrez le dossier d’autorisation. La DREN instruit ensuite (checklist Voyage Découverte).',
    paragraphs: [
      `Vous suivez ${qty(kpis.activities, 'activité enregistrée', 'activités enregistrées')} et ${qty(
        listedTotal || kpis.requestsPending + kpis.requestsUnderReview,
        'dossier',
        'dossiers',
      )} dans le circuit d’autorisation.`,
      drafts > 0 || returned > 0
        ? `${qty(drafts, 'brouillon reste', 'brouillons restent')} à compléter${
            returned > 0
              ? ` et ${qty(returned, 'dossier a été renvoyé', 'dossiers ont été renvoyés')} pour correction`
              : ''
          }.`
        : 'Aucun brouillon ni renvoi pour correction n’est en attente.',
      open - drafts - returned > 0
        ? `${qty(
            submitted + underReview + forwarded,
            'dossier est',
            'dossiers sont',
          )} déjà dans le circuit DREN ou DVS.`
        : 'Aucun dossier n’est actuellement en instruction régionale ou nationale.',
      decided > 0
        ? `Décisions reçues : ${qty(approved, 'autorisation validée', 'autorisations validées')}, ${qty(
            rejected,
            'rejet',
            'rejets',
          )}.`
        : 'Aucune décision finale n’a encore été notifiée pour cet établissement.',
    ],
    attention: [
      {
        label: 'Brouillons',
        hint: 'À compléter puis soumettre à la DREN',
        count: drafts,
        href: requestFilterHref('draft'),
      },
      {
        label: 'Renvoyés',
        hint: 'Corriger puis resoumettre',
        count: returned,
        href: requestFilterHref('returned_for_correction'),
      },
      {
        label: 'En circuit',
        hint: 'Soumis, en analyse ou transmis à la DVS',
        count: submitted + underReview + forwarded,
        href: requestFilterHref(),
      },
    ],
  };
}

export function priorityRequests(actor: RequestActorKind, requests: RequestSummary[]): RequestSummary[] {
  const priority =
    actor === 'dvs'
      ? ['forwarded', 'under_review', 'submitted']
      : actor === 'drena'
        ? ['submitted', 'under_review', 'forwarded']
        : ['draft', 'returned_for_correction', 'submitted'];

  return [...requests]
    .filter((item) => priority.includes(item.status))
    .sort((a, b) => {
      const rank = (status: string) => priority.indexOf(status);
      const byStatus = rank(a.status) - rank(b.status);
      if (byStatus !== 0) return byStatus;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
}

export function formatShortDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatLongDate(value: Date = new Date()): string {
  return value.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
