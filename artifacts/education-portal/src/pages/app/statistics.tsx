import { FormEvent, useState } from 'react';
import { Building2, CalendarDays, ClipboardList, Download, FolderOpen, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { AppPage } from '@/components/app/AppPage';
import { DashStatBar } from '@/components/app/dashboard/DashStatBar';
import { AppProEmpty } from '@/components/app/pro/AppProEmpty';
import { AppProLoading } from '@/components/app/pro/AppProLoading';
import { AppProPageShell } from '@/components/app/pro/AppProPageShell';
import { AppProPanel } from '@/components/app/pro/AppProPanel';
import { StatisticsCharts } from '@/components/app/StatisticsCharts';
import { Button } from '@/components/ui/button';
import { REPORT_TYPE_LABELS, reportTypes, type ReportType } from '@/config/report-labels';
import { invalidateDocuments, invalidateReports } from '@/lib/query-sync';
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
      title="Statistiques & rapports"
      description="Indicateurs, graphiques et exports de pilotage — périmètre DVS / DREN."
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
              <button type="button" className="btn-secondary" onClick={() => refetch()}>
                Réessayer
              </button>
            }
          />
        ) : null}

        {data && !isLoading ? (
          <>
            <DashStatBar
              items={[
                { label: 'Établissements', value: data.kpis.establishments, icon: Building2 },
                { label: 'Activités', value: data.kpis.activities, icon: CalendarDays },
                { label: 'Demandes en attente', value: data.kpis.requestsPending, icon: ClipboardList },
                { label: 'En analyse DVS/DREN', value: data.kpis.requestsUnderReview, icon: FolderOpen },
              ]}
            />

            <AppProPanel title="Répartitions graphiques" headingId="charts-heading">
              <StatisticsCharts
                requestsByStatus={data.requestsByStatus}
                activitiesByType={data.activitiesByType}
              />
            </AppProPanel>
          </>
        ) : null}

        <div className="dash-workspace">
          <div className="dash-workspace-main">
            <AppProPanel title="Générer un rapport" headingId="reports-generate-heading">
              {canGenerateReports ? (
                <form className="app-pro-form app-pro-form-compact" onSubmit={handleGenerate}>
                  <div className="form-field">
                    <label htmlFor="report-type">Type de rapport</label>
                    <select
                      id="report-type"
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
                  <p className="app-pro-muted">
                    Export JSON des indicateurs de votre périmètre, enregistré dans les fichiers scolaires.
                  </p>
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
              ) : (
                <p className="app-pro-muted">La génération de rapports est réservée aux profils DVS.</p>
              )}
            </AppProPanel>
          </div>

          <div className="dash-workspace-aside">
            <AppProPanel
              title="Rapports générés"
              headingId="reports-heading"
              action={<span className="app-pro-count">{reports.length} rapport(s)</span>}
            >
              {reportsLoading ? <AppProLoading label="Chargement des rapports…" inline /> : null}

              {!reportsLoading && reports.length === 0 ? (
                <AppProEmpty
                  title="Aucun rapport enregistré"
                  description="Générez un rapport mensuel, annuel ou régional pour obtenir un export."
                />
              ) : null}

              {reports.length > 0 ? (
                <ul className="app-pro-data-list">
                  {reports.map((report) => (
                    <li key={report.id} className="app-pro-data-item">
                      <div>
                        <strong>{REPORT_TYPE_LABELS[report.type as ReportType] ?? report.type}</strong>
                        <p>
                          {formatReportDate(report.periodStart)} → {formatReportDate(report.periodEnd)}
                        </p>
                        {report.documentTitle ? <p className="app-pro-muted">{report.documentTitle}</p> : null}
                      </div>
                      {report.documentId ? (
                        <a
                          className="document-download-btn"
                          href={`/api/documents/${report.documentId}/download`}
                          download
                        >
                          <Download aria-hidden="true" />
                          Télécharger
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </AppProPanel>
          </div>
        </div>
      </AppProPageShell>
    </AppPage>
  );
}
