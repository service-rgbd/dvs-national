import { FormEvent, useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Building2, Download, FilePlus2, Loader2, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { ActivityComposeDialog } from '@/components/app/activities/ActivityComposeDialog';
import { AppPage } from '@/components/app/AppPage';
import { DashboardNotificationsFeed } from '@/components/app/dashboard/DashboardNotificationsFeed';
import { DashboardTabs } from '@/components/app/dashboard/DashboardTabs';
import { PilotageChart } from '@/components/app/dashboard/PilotageChart';
import { PilotageEstablishmentCard } from '@/components/app/dashboard/PilotageEstablishmentCard';
import { PilotageKpiBand } from '@/components/app/dashboard/PilotageKpiBand';
import { AppProEmpty } from '@/components/app/pro/AppProEmpty';
import { AppProLoading } from '@/components/app/pro/AppProLoading';
import { AppProPageShell } from '@/components/app/pro/AppProPageShell';
import { DashStatusDot } from '@/components/dash/DashStatusDot';
import { DashSurface } from '@/components/dash/DashSurface';
import { Button } from '@/components/ui/button';
import { dashboardHeadlines } from '@/config/app-modules';
import { getRequestActorKind } from '@/config/request-permissions';
import { REPORT_TYPE_LABELS, reportTypes, type ReportType } from '@/config/report-labels';
import { type UserProfileId } from '@/config/roles';
import { REQUEST_STATUS_LABELS } from '@/config/workflow-labels';
import { appRoutes } from '@/content/routes';
import {
  buildActorCircuit,
  buildSituationBrief,
  countActivitiesByType,
  countByStatus,
  countsFromBreakdown,
  formatLongDate,
  formatShortDate,
  priorityRequests,
  statusValue,
  sumStatuses,
  type PilotageViewpoint,
} from '@/lib/pilotage';
import {
  invalidateDocuments,
  invalidateReports,
  liveQueryHookOptions,
  notificationQueryHookOptions,
} from '@/lib/query-sync';
import {
  useAuthMe,
  useGenerateReport,
  useGetAppDashboard,
  useGetAppStatistics,
  useListActivities,
  useListNotifications,
  useListReports,
  useListRequests,
  type ActivitySummary,
  type RequestSummary,
} from '@workspace/api-client-react';

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  switch (status) {
    case 'approved':
      return 'success';
    case 'rejected':
    case 'cancelled':
    case 'returned_for_correction':
      return 'danger';
    case 'submitted':
    case 'forwarded':
      return 'warning';
    case 'under_review':
      return 'info';
    default:
      return 'neutral';
  }
}

function RequestRows({
  requests,
  empty,
  onOpen,
}: {
  requests: RequestSummary[];
  empty: string;
  onOpen: (id: string) => void;
}) {
  if (requests.length === 0) {
    return <p className="pilot-empty">{empty}</p>;
  }

  return (
    <ul className="pilot-rows">
      {requests.map((row) => (
        <li key={row.id}>
          <button type="button" className="pilot-row" onClick={() => onOpen(row.id)}>
            <span className="pilot-row-main">
              <strong>{row.activityTitle ?? "Demande d'autorisation"}</strong>
              <span>{row.establishmentName}</span>
            </span>
            <span className="pilot-row-meta">
              <DashStatusDot
                label={REQUEST_STATUS_LABELS[row.status] ?? row.status}
                tone={statusTone(row.status)}
              />
              <time>{formatShortDate(String(row.updatedAt))}</time>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function ActivityRows({
  activities,
  onOpenRequest,
  empty,
}: {
  activities: ActivitySummary[];
  onOpenRequest?: (activityId: string) => void;
  empty: string;
}) {
  if (activities.length === 0) {
    return <p className="pilot-empty">{empty}</p>;
  }

  return (
    <ul className="pilot-rows">
      {activities.map((row) => (
        <li key={row.id}>
          <div className="pilot-row">
            <span className="pilot-row-main">
              <strong>{row.title}</strong>
              <span>
                {row.type}
                {row.location ? ` · ${row.location}` : ''}
              </span>
            </span>
            <span className="pilot-row-meta">
              <time>{formatShortDate(row.scheduledAt ?? row.createdAt)}</time>
              {onOpenRequest ? (
                <button type="button" className="dash-chip-btn" onClick={() => onOpenRequest(row.id)}>
                  <FilePlus2 size={14} aria-hidden="true" />
                  Dossier
                </button>
              ) : null}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function AppDashboardPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [view, setView] = useState<PilotageViewpoint>('overview');
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [composeOpen, setComposeOpen] = useState(false);

  const { data: authData } = useAuthMe();
  const roleCodes = authData?.user.roles.map((role) => role.code) ?? [];
  const isDvs = roleCodes.some((code) => code === 'dvs_director' || code === 'dvs_staff');

  const { data, isLoading, isError, refetch } = useGetAppDashboard(liveQueryHookOptions());
  const { data: requestsData } = useListRequests({ page: 1, pageSize: 50 }, liveQueryHookOptions());
  const { data: activitiesData } = useListActivities({ page: 1, pageSize: 20 }, liveQueryHookOptions());
  const { data: notificationsData } = useListNotifications(
    { unreadOnly: false },
    notificationQueryHookOptions(),
  );
  const { data: statistics } = useGetAppStatistics({
    query: { enabled: isDvs, ...liveQueryHookOptions().query },
  });
  const { data: reportsData } = useListReports(
    { page: 1, pageSize: 8 },
    { query: { enabled: isDvs, ...liveQueryHookOptions().query } },
  );

  const generateReport = useGenerateReport({
    mutation: {
      onSuccess: async () => {
        await Promise.all([invalidateReports(queryClient), invalidateDocuments(queryClient)]);
      },
    },
  });

  const actor = getRequestActorKind(data?.profile.primaryRoleCode ?? roleCodes[0] ?? '');
  const canCreateActivity = actor === 'establishment';
  const needsEstablishment = !data?.profile.establishmentId;
  const requests = requestsData?.data ?? [];
  const activities = activitiesData?.data ?? [];
  const listedTotal = requestsData?.pagination.total ?? requests.length;
  const officialCounts = statistics ? countsFromBreakdown(statistics.requestsByStatus) : null;
  const counts = officialCounts ?? countByStatus(requests);
  const circuit = buildActorCircuit(actor, counts);
  const activityBreakdown = statistics?.activitiesByType.filter((item) => item.count > 0)
    ?? countActivitiesByType(activities);
  const priority = priorityRequests(actor, requests).slice(0, 8);
  const decided = sumStatuses(counts, ['approved', 'rejected', 'cancelled', 'archived']);
  const approvedRate = decided > 0 ? Math.round((statusValue(counts, 'approved') / decided) * 100) : 0;

  const brief = useMemo(() => {
    if (!data) return null;
    return buildSituationBrief({
      actor,
      profile: data.profile,
      kpis: data.kpis,
      counts,
      listedTotal,
    });
  }, [actor, counts, data, listedTotal]);

  const headline = data
    ? `${data.profile.scopeLabel} · ${data.profile.primaryRoleLabel}`
    : dashboardHeadlines[(roleCodes[0] ?? 'unknown') as UserProfileId];

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'queue', label: actor === 'establishment' ? 'Mes dossiers' : 'File d\'instruction' },
    { id: 'activities', label: 'Activités' },
    ...(isDvs ? [{ id: 'reports', label: 'Rapports' }] : []),
  ];

  function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    generateReport.mutate({ data: { type: reportType } });
  }

  if (isLoading) {
    return (
      <AppPage title="Pilotage" description="Chargement de votre périmètre…" heading="hero">
        <AppProLoading label="Récupération des indicateurs du périmètre…" />
      </AppPage>
    );
  }

  if (isError || !data || !brief) {
    return (
      <AppPage title="Pilotage" heading="hero">
        <AppProEmpty
          title="Pilotage indisponible"
          description="Impossible de charger les indicateurs de votre périmètre."
          action={
            <button type="button" className="dash-chip-btn" onClick={() => refetch()}>
              Réessayer
            </button>
          }
        />
      </AppPage>
    );
  }

  const kpiItems =
    actor === 'dvs'
      ? [
          {
            id: 'inbox',
            icon: 'inbox' as const,
            label: 'À traiter',
            value: data.kpis.requestsPending + data.kpis.requestsUnderReview,
            hint: 'File DREN + DVS',
          },
          {
            id: 'approved',
            icon: 'approved' as const,
            label: 'Validés',
            value: `${approvedRate} %`,
            hint: decided > 0 ? `${decided.toLocaleString('fr-FR')} décisions` : 'Aucune décision',
          },
          {
            id: 'buildings',
            icon: 'buildings' as const,
            label: 'Établissements',
            value: data.kpis.establishments,
            hint: 'Référentiel national',
          },
          {
            id: 'activities',
            icon: 'activities' as const,
            label: 'Activités',
            value: data.kpis.activities,
            hint: 'Sorties et événements',
          },
        ]
      : actor === 'drena'
        ? [
            {
              id: 'submitted',
              icon: 'inbox' as const,
              label: 'Soumis',
              value: statusValue(counts, 'submitted'),
              hint: 'À prendre en analyse',
            },
            {
              id: 'review',
              icon: 'review' as const,
              label: 'En analyse',
              value: statusValue(counts, 'under_review'),
              hint: 'Instruction en cours',
            },
            {
              id: 'forward',
              icon: 'forward' as const,
              label: 'Transmis DVS',
              value: statusValue(counts, 'forwarded'),
              hint: 'En attente de décision',
            },
            {
              id: 'buildings',
              icon: 'buildings' as const,
              label: 'Établissements',
              value: data.kpis.establishments,
              hint: 'Référentiel du périmètre',
            },
          ]
        : [
            {
              id: 'draft',
              icon: 'draft' as const,
              label: 'Brouillons',
              value: statusValue(counts, 'draft'),
              hint: 'À compléter',
            },
            {
              id: 'circuit',
              icon: 'circuit' as const,
              label: 'En circuit',
              value: sumStatuses(counts, ['submitted', 'under_review', 'forwarded']),
              hint: 'DREN ou DVS',
            },
            {
              id: 'approved',
              icon: 'approved' as const,
              label: 'Validés',
              value: statusValue(counts, 'approved'),
              hint: 'Autorisations accordées',
            },
            {
              id: 'activities',
              icon: 'activities' as const,
              label: 'Activités',
              value: data.kpis.activities,
              hint: 'Base des demandes',
            },
          ];

  const perimeterSeries = [
    { key: 'establishments', label: 'Établissements', count: data.kpis.establishments },
    { key: 'activities', label: 'Activités', count: data.kpis.activities },
    { key: 'requests', label: 'Dossiers', count: listedTotal },
  ];

  return (
    <AppPage
      title="Pilotage"
      heading="hero"
      description={headline}
      action={
        canCreateActivity ? (
          <button type="button" className="dash-chip-btn" onClick={() => setComposeOpen(true)}>
            <Plus size={14} aria-hidden="true" />
            Nouvelle activité
          </button>
        ) : undefined
      }
    >
      <AppProPageShell>
        {canCreateActivity ? (
          <ActivityComposeDialog
            open={composeOpen}
            onOpenChange={setComposeOpen}
            needsEstablishment={needsEstablishment}
            establishmentName={data.profile.establishmentId ? data.profile.scopeLabel : undefined}
          />
        ) : null}
        <PilotageKpiBand items={kpiItems} />

        <DashboardTabs
          tabs={tabs}
          activeId={view}
          onChange={(id) => setView(id as PilotageViewpoint)}
          ariaLabel="Points de vue du pilotage"
        />

        {view === 'overview' ? (
          <div className="pilot-view" id="dash-panel-overview" role="tabpanel" aria-labelledby="dash-tab-overview">
            <div className="pilot-board">
              <DashSurface className="pilot-chart-surface">
                <div className="pilot-panel">
                  <header className="pilot-brief">
                    <div className="pilot-brief-identity">
                      <span className="pilot-brief-icon" aria-hidden="true">
                        <Building2 size={18} strokeWidth={1.75} />
                      </span>
                      <div className="pilot-brief-copy">
                        <p className="pilot-brief-kicker">{brief.kicker}</p>
                        <h2>{brief.title}</h2>
                        <p className="pilot-brief-meta">{formatLongDate()}</p>
                      </div>
                    </div>
                    <p className="pilot-brief-lead">{brief.lead}</p>
                  </header>
                  <PilotageChart perimeter={perimeterSeries} circuit={circuit} />
                </div>
              </DashSurface>

              <DashSurface className="pilot-quad">
                {data.profile.establishmentId ? (
                  <PilotageEstablishmentCard
                    establishmentId={data.profile.establishmentId}
                    fallbackName={data.profile.scopeLabel}
                  />
                ) : null}
                {canCreateActivity ? (
                  <div className="pilot-panel">
                    <header className="pilot-section-head">
                      <h2>Parcours d&apos;une sortie</h2>
                      <p>Tout se fait ici, sans changer de page.</p>
                    </header>
                    <ol className="pilot-process">
                      <li>
                        <strong>1. Activité</strong>
                        <span>Type, intitulé et lieu de la sortie.</span>
                      </li>
                      <li>
                        <strong>2. Dossier</strong>
                        <span>Autorisation en brouillon, puis soumission à la DREN.</span>
                      </li>
                    </ol>
                    <div className="pilot-panel-foot">
                      <button type="button" className="dash-chip-btn" onClick={() => setComposeOpen(true)}>
                        <Plus size={14} aria-hidden="true" />
                        Créer une activité
                      </button>
                      <Link href={appRoutes.requests} className="dash-chip-btn">
                        <FilePlus2 size={14} aria-hidden="true" />
                        Mes dossiers
                      </Link>
                    </div>
                  </div>
                ) : null}
                <div className="pilot-panel">
                  <header className="pilot-section-head">
                    <h2>Priorités</h2>
                    <p>Actions de votre profil dans le circuit.</p>
                  </header>
                  <ul className="pilot-attention">
                    {brief.attention.map((item) => (
                      <li key={item.label}>
                        <Link href={item.href} className="pilot-attention-link">
                          <span>
                            <strong>{item.label}</strong>
                            <span>{item.hint}</span>
                          </span>
                          <em>{item.count.toLocaleString('fr-FR')}</em>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <DashboardNotificationsFeed
                  framed={false}
                  notifications={(notificationsData?.data ?? []).slice(0, 5)}
                />
              </DashSurface>
            </div>
          </div>
        ) : null}

        {view === 'queue' ? (
          <div className="pilot-view" id="dash-panel-queue" role="tabpanel" aria-labelledby="dash-tab-queue">
            <DashSurface>
              <div className="pilot-panel">
                <header className="dash-form-head">
                  <h2>{actor === 'establishment' ? 'Dossiers de l\'établissement' : 'File d\'instruction'}</h2>
                  <p>
                    {actor === 'dvs'
                      ? 'Dossiers transmis, en analyse ou soumis — décision DVS et suivi régional.'
                      : actor === 'drena'
                        ? 'Dossiers soumis par les établissements de votre DRENA.'
                        : 'Brouillons, soumissions et retours de correction de votre établissement.'}
                  </p>
                </header>
                <RequestRows
                  requests={priority}
                  empty="Aucun dossier prioritaire dans votre file."
                  onOpen={(id) => setLocation(appRoutes.requestDetail(id))}
                />
                <div className="pilot-panel-foot">
                  <Link href={appRoutes.requests} className="dash-chip-btn">
                    Tous les dossiers
                  </Link>
                </div>
              </div>
            </DashSurface>
          </div>
        ) : null}

        {view === 'activities' ? (
          <div className="pilot-view" id="dash-panel-activities" role="tabpanel" aria-labelledby="dash-tab-activities">
            <div className="dash-home-secondary">
              <DashSurface>
                <div className="pilot-panel">
                  <header className="dash-form-head">
                    <h2>{actor === 'establishment' ? 'Vos activités' : 'Activités du périmètre'}</h2>
                    <p>
                      {actor === 'establishment'
                        ? 'Chaque sortie enregistrée peut ouvrir un dossier d’autorisation, sans quitter le Pilotage.'
                        : 'Sorties et événements suivis dans votre périmètre.'}
                    </p>
                  </header>
                  <ActivityRows
                    activities={activities}
                    empty={
                      actor === 'establishment'
                        ? 'Aucune activité pour le moment. Créez-en une pour pouvoir ouvrir un dossier.'
                        : 'Aucune activité scolaire dans ce périmètre.'
                    }
                    onOpenRequest={
                      canCreateActivity
                        ? (id) => setLocation(`${appRoutes.requests}?activity=${id}`)
                        : undefined
                    }
                  />
                  <div className="pilot-panel-foot">
                    {canCreateActivity ? (
                      <button type="button" className="dash-chip-btn" onClick={() => setComposeOpen(true)}>
                        <Plus size={14} aria-hidden="true" />
                        Nouvelle activité
                      </button>
                    ) : (
                      <Link href={appRoutes.activities} className="dash-chip-btn">
                        Voir le module activités
                      </Link>
                    )}
                  </div>
                </div>
              </DashSurface>
              {canCreateActivity ? null : (
              <DashSurface>
                  <div className="pilot-panel">
                    <header className="dash-form-head">
                      <h2>Types d&apos;activités</h2>
                      <p>
                        {statistics
                          ? 'Répartition officielle du périmètre.'
                          : 'Répartition des activités récemment chargées.'}
                      </p>
                    </header>
                    {activityBreakdown.length === 0 ? (
                      <p className="pilot-empty">Aucun type d&apos;activité à afficher.</p>
                    ) : (
                      <ul className="pilot-bars">
                        {activityBreakdown.map((item) => {
                          const total = activityBreakdown.reduce((sum, entry) => sum + entry.count, 0);
                          const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
                          return (
                            <li key={item.key}>
                              <div className="pilot-bar-head">
                                <span>{item.label}</span>
                                <strong>
                                  {item.count.toLocaleString('fr-FR')} · {percent} %
                                </strong>
                              </div>
                              <div className="pilot-bar-track" aria-hidden="true">
                                <span style={{ width: `${percent}%` }} />
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </DashSurface>
              )}
            </div>
          </div>
        ) : null}

        {view === 'reports' && isDvs ? (
          <div className="pilot-view" id="dash-panel-reports" role="tabpanel" aria-labelledby="dash-tab-reports">
            <div className="dash-home-secondary">
              <DashSurface>
                <div className="pilot-panel">
                  <header className="dash-form-head">
                    <h2>Rapport d&apos;autorisation</h2>
                    <p>
                      Export JSON des indicateurs de votre périmètre : établissements, activités scolaires et dossiers
                      d&apos;autorisation. Rien d&apos;autre n&apos;est agrégé.
                    </p>
                  </header>
                  <form className="app-pro-form" onSubmit={handleGenerate}>
                    <div className="form-field">
                      <label htmlFor="pilot-report-type">Période</label>
                      <select
                        id="pilot-report-type"
                        className="app-pro-select"
                        value={reportType}
                        onChange={(event) => setReportType(event.target.value as ReportType)}
                      >
                        {reportTypes.map((type) => (
                          <option key={type} value={type}>
                            {REPORT_TYPE_LABELS[type]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button type="submit" disabled={generateReport.isPending} className="app-pro-submit">
                      {generateReport.isPending ? (
                        <>
                          <Loader2 className="animate-spin" aria-hidden="true" /> Génération…
                        </>
                      ) : (
                        'Générer le rapport'
                      )}
                    </Button>
                  </form>
                </div>
              </DashSurface>

              <DashSurface>
                <div className="pilot-panel">
                  <header className="dash-form-head">
                    <h2>Rapports enregistrés</h2>
                    <p>Téléchargeables depuis les fichiers scolaires.</p>
                  </header>
                  {(reportsData?.data ?? []).length === 0 ? (
                    <p className="pilot-empty">Aucun rapport généré pour ce périmètre.</p>
                  ) : (
                    <ul className="pilot-rows">
                      {(reportsData?.data ?? []).map((report) => (
                        <li key={report.id}>
                          <div className="pilot-row">
                            <span className="pilot-row-main">
                              <strong>{REPORT_TYPE_LABELS[report.type as ReportType] ?? report.type}</strong>
                              <span>
                                {formatShortDate(report.periodStart)} → {formatShortDate(report.periodEnd)}
                                {report.documentTitle ? ` · ${report.documentTitle}` : ''}
                              </span>
                            </span>
                            {report.documentId ? (
                              <a
                                className="dash-chip-btn"
                                href={`/api/documents/${report.documentId}/download`}
                                download
                              >
                                <Download size={14} aria-hidden="true" />
                                Télécharger
                              </a>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="pilot-panel-foot">
                    <Link href={appRoutes.statistics} className="dash-chip-btn">
                      Page statistiques
                    </Link>
                    <Link href={appRoutes.documents} className="dash-chip-btn">
                      Fichiers
                    </Link>
                  </div>
                </div>
              </DashSurface>
            </div>
          </div>
        ) : null}
      </AppProPageShell>
    </AppPage>
  );
}
