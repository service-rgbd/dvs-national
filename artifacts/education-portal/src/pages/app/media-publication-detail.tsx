import { FormEvent, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useRoute } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import type { WorkflowAction } from '@workspace/api-client-react';

import { AppPage } from '@/components/app/AppPage';
import { MediaPublicationDetailView } from '@/components/app/media-publications/MediaPublicationDetailView';
import { AppProEmpty } from '@/components/app/pro/AppProEmpty';
import { AppProLoading } from '@/components/app/pro/AppProLoading';
import { AppProPageShell } from '@/components/app/pro/AppProPageShell';
import { canCreateMediaPublication } from '@/config/media-publication-permissions';
import { appRoutes } from '@/content/routes';
import { invalidateMediaPublications } from '@/lib/query-sync';
import '@/styles/media-publications.css';
import {
  getGetMediaPublicationByIdQueryKey,
  useGetAppDashboard,
  useGetMediaPublicationById,
  useReportMediaPublicationIncident,
  useTransitionMediaPublication,
} from '@workspace/api-client-react';

const INCIDENT_REPORT_STATUSES = new Set([
  'submitted',
  'under_review',
  'approved',
  'published',
]);

export default function AppMediaPublicationDetailPage() {
  const [, params] = useRoute('/app/publications-medias/:id');
  const publicationId = params?.id ?? '';
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');

  const { data: dashboardData } = useGetAppDashboard();
  const { data, isLoading, isError, refetch } = useGetMediaPublicationById(publicationId);

  const transition = useTransitionMediaPublication({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getGetMediaPublicationByIdQueryKey(publicationId),
        });
        await invalidateMediaPublications(queryClient);
        setReason('');
      },
    },
  });

  const reportIncident = useReportMediaPublicationIncident({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getGetMediaPublicationByIdQueryKey(publicationId),
        });
        await invalidateMediaPublications(queryClient);
        setIncidentDescription('');
      },
    },
  });

  function runAction(action: WorkflowAction) {
    transition.mutate({
      id: publicationId,
      data: {
        action,
        reason: action === 'reject' ? reason.trim() : undefined,
      },
    });
  }

  function handleReject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runAction('reject');
  }

  function handleIncidentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    reportIncident.mutate({
      id: publicationId,
      data: { description: incidentDescription.trim() },
    });
  }

  if (!publicationId) {
    return (
      <AppPage
        title="Publication introuvable"
        breadcrumb={[
          { label: 'Publications média', href: appRoutes.mediaPublications },
          { label: 'Erreur' },
        ]}
      >
        <AppProEmpty title="Identifiant manquant" description="URL de dossier invalide." />
      </AppPage>
    );
  }

  if (isLoading) {
    return (
      <AppPage
        title="Dossier média"
        breadcrumb={[
          { label: 'Publications média', href: appRoutes.mediaPublications },
          { label: 'Chargement' },
        ]}
      >
        <AppProLoading label="Chargement du dossier…" />
      </AppPage>
    );
  }

  if (isError || !data) {
    return (
      <AppPage
        title="Dossier média"
        breadcrumb={[
          { label: 'Publications média', href: appRoutes.mediaPublications },
          { label: 'Introuvable' },
        ]}
      >
        <AppProEmpty
          title="Dossier introuvable"
          description="Cette publication n'existe pas ou n'est pas accessible dans votre périmètre."
          action={
            <button type="button" className="btn-secondary" onClick={() => refetch()}>
              Réessayer
            </button>
          }
        />
      </AppPage>
    );
  }

  const profile = dashboardData?.profile;
  const canReportIncident = Boolean(
    profile &&
      canCreateMediaPublication(profile.primaryRoleCode) &&
      !data.incidentReported &&
      INCIDENT_REPORT_STATUSES.has(data.status),
  );

  return (
    <AppPage
      title="Dossier média"
      description={`${data.establishmentName} — ${data.activityTitle}`}
      breadcrumb={[
        { label: 'Publications média', href: appRoutes.mediaPublications },
        { label: data.title },
      ]}
      action={
        <Link href={appRoutes.mediaPublications} className="dash-panel-link app-pro-header-action">
          <ArrowLeft size={14} aria-hidden="true" /> Retour aux publications
        </Link>
      }
    >
      <AppProPageShell>
        <MediaPublicationDetailView
          data={data}
          profile={profile}
          isPending={transition.isPending}
          rejectReason={reason}
          onRejectReasonChange={setReason}
          onAction={runAction}
          onRejectSubmit={handleReject}
          canReportIncident={canReportIncident}
          incidentDescription={incidentDescription}
          onIncidentDescriptionChange={setIncidentDescription}
          onIncidentSubmit={handleIncidentSubmit}
          isIncidentPending={reportIncident.isPending}
        />
      </AppProPageShell>
    </AppPage>
  );
}
