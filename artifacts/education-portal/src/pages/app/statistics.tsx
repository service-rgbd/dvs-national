import { FormEvent, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { AppPage } from '@/components/app/AppPage';
import { PilotageKpiBand } from '@/components/app/dashboard/PilotageKpiBand';
import { StatisticsCharts } from '@/components/app/StatisticsCharts';
import { AppProEmpty } from '@/components/app/pro/AppProEmpty';
import { AppProLoading } from '@/components/app/pro/AppProLoading';
import { AppProPageShell } from '@/components/app/pro/AppProPageShell';
import { DashSurface } from '@/components/dash/DashSurface';
import { REPORT_TYPE_LABELS, reportTypes, type ReportType } from '@/config/report-labels';
import { invalidateDocuments, invalidateReports } from '@/lib/query-sync';
import '@/styles/statistics.css';
import {
  useAuthMe,
  useGenerateReport,
  useGetAppStatistics,
  useListReports,
} from '@workspace/api-client-react';

function formatReportDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR');
}

export default function AppStatisticsPage() {
  const queryClient = useQueryClient();
  const { data: authData } = useAuthMe();
  const roleCodes = authData?.user.roles.map((role) => role.code) ?? [];
  const canGenerateReports = roleCodes.some(
    (code) => code === 'dvs_director' || code === 'dvs_staff',
  );

  const [reportType, setReportType] = useState<ReportType>('monthly');

  const { data, isLoading, isError, refetch } = useGetAppStatistics();
  const { data: reportsData, isLoading: reportsLoading } = useListReports({
    page: 1,
    pageSize: 10,
  });

  const generateReport = useGenerateReport({
    mutation: {
      onSuccess: async () => {
        await Promise.all([invalidateReports(queryClient), invalidateDocuments(queryClient)]);
      },
    },
  });

  function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    generateReport.mutate({ data: { type: reportType } });
  }

  const reports = reportsData?.data ?? [];
  const periodLabel = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <AppPage
      title="Statistiques"
      description="Indicateurs et exports de pilotage — périmètre DVS / DREN."
      action={
        <div className="dash-period-picker" aria-label="Période affichée">
          <span>Période</span>
          <strong>{periodLabel}</strong>
        </div>
      }
    >
      <AppProPageShell>
        {isLoading ? <AppProLoading label="Chargement des statistiques…" /> : null}

        {isError ? (
          <AppProEmpty
            title="Chargement impossible"
            description="Les statistiques métier sont indisponibles."
            action={
              <button type="button" className="dash-chip-btn" onClick={() => refetch()}>
                Réessayer
              </button>
            }
          />
        ) : null}

        {data && !isLoading ? (
          <>
            <PilotageKpiBand
              items={[
                {
                  id: 'buildings',
                  icon: 'buildings',
                  label: 'Établissements',
                  value: data.kpis.establishments,
                  hint: 'Référentiel du périmètre',
                },
                {
                  id: 'activities',
                  icon: 'activities',
                  label: 'Activités',
                  value: data.kpis.activities,
                  hint: 'Sorties et événements',
                },
                {
                  id: 'inbox',
                  icon: 'inbox',
                  label: 'En attente',
                  value: data.kpis.requestsPending,
                  hint: 'Dossiers soumis, non encore instruits',
                },
                {
                  id: 'review',
                  icon: 'review',
                  label: 'En analyse',
                  value: data.kpis.requestsUnderReview,
                  hint: 'Instruction DREN ou DVS',
                },
              ]}
            />

            <StatisticsCharts
              requestsByStatus={data.requestsByStatus}
              activitiesByType={data.activitiesByType}
            />
          </>
        ) : null}

        <div className="stats-reports">
          <DashSurface>
            <section className="stats-panel" aria-labelledby="reports-generate-heading">
              <header className="stats-panel-head">
                <h2 id="reports-generate-heading">Générer un rapport</h2>
                <p>Export JSON des indicateurs, déposé dans les fichiers scolaires.</p>
              </header>

              {canGenerateReports ? (
                <form className="stats-report-form" onSubmit={handleGenerate}>
                  <label htmlFor="report-type">Type de rapport</label>
                  <select
                    id="report-type"
                    value={reportType}
                    onChange={(event) => setReportType(event.target.value as ReportType)}
                  >
                    {reportTypes.map((type) => (
                      <option key={type} value={type}>
                        {REPORT_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="dash-chip-btn" disabled={generateReport.isPending}>
                    {generateReport.isPending ? (
                      <>
                        <Loader2 className="animate-spin" size={14} aria-hidden="true" />
                        Génération…
                      </>
                    ) : (
                      'Générer le rapport'
                    )}
                  </button>
                </form>
              ) : (
                <p className="stats-muted">La génération de rapports est réservée aux profils DVS.</p>
              )}
            </section>
          </DashSurface>

          <DashSurface>
            <section className="stats-panel" aria-labelledby="reports-heading">
              <header className="stats-panel-head">
                <h2 id="reports-heading">Rapports générés</h2>
                <p>{reports.length.toLocaleString('fr-FR')} export{reports.length > 1 ? 's' : ''} récent{reports.length > 1 ? 's' : ''}.</p>
              </header>

              {reportsLoading ? <AppProLoading label="Chargement des rapports…" inline /> : null}

              {!reportsLoading && reports.length === 0 ? (
                <p className="stats-muted">Aucun rapport enregistré pour le moment.</p>
              ) : null}

              {reports.length > 0 ? (
                <ul className="stats-report-list">
                  {reports.map((report) => (
                    <li key={report.id}>
                      <div>
                        <strong>{REPORT_TYPE_LABELS[report.type as ReportType] ?? report.type}</strong>
                        <span>
                          {formatReportDate(report.periodStart)} → {formatReportDate(report.periodEnd)}
                        </span>
                      </div>
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
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          </DashSurface>
        </div>
      </AppProPageShell>
    </AppPage>
  );
}
