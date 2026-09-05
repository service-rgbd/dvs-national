import { FormEvent, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import type { MediaPublicationStatusParamParameter } from '@workspace/api-client-react';

import { AppPage } from '@/components/app/AppPage';
import {
  MediaPublicationCreateForm,
  type MediaFileDraft,
} from '@/components/app/media-publications/MediaPublicationCreateForm';
import {
  MediaPublicationsList,
  MediaScopeBanner,
} from '@/components/app/media-publications/MediaPublicationWorkspace';
import { AppProPageShell } from '@/components/app/pro/AppProPageShell';
import { AppProPanel } from '@/components/app/pro/AppProPanel';
import {
  canCreateMediaPublication,
  getMediaActorConfig,
} from '@/config/media-publication-permissions';
import {
  MEDIA_STATUS_FILTERS,
  mediaFilterHref,
  mediaFilterLabel,
} from '@/config/media-publication-status-filters';
import { appRoutes } from '@/content/routes';
import { invalidateMediaPublications } from '@/lib/query-sync';
import {
  getVideoDurationSeconds,
  MAX_VIDEO_DURATION_SECONDS,
} from '@/lib/media-utils';
import {
  useCreateMediaPublication,
  useGetAppDashboard,
  useListActivities,
  useListMediaPublications,
  useListRequests,
} from '@workspace/api-client-react';
import '@/styles/media-publications.css';

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Lecture du fichier impossible.'));
        return;
      }
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('Contenu du fichier invalide.'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error('Lecture du fichier impossible.'));
    reader.readAsDataURL(file);
  });
}

export default function AppMediaPublicationsPage() {
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const [activityId, setActivityId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<MediaFileDraft[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const statusFilter = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('status') ?? undefined;
  }, [location]);

  const { data: dashboardData } = useGetAppDashboard();
  const { data: activitiesData } = useListActivities({ page: 1, pageSize: 100 });
  const { data: approvedRequestsData } = useListRequests({
    page: 1,
    pageSize: 100,
    status: 'approved',
  });
  const { data, isLoading, isError, refetch } = useListMediaPublications({
    page: 1,
    pageSize: 30,
    status: statusFilter as MediaPublicationStatusParamParameter | undefined,
  });

  const createPublication = useCreateMediaPublication({
    mutation: {
      onSuccess: async (result) => {
        await invalidateMediaPublications(queryClient);
        window.location.href = appRoutes.mediaPublicationDetail(result.id);
      },
      onError: () => {
        setSubmitError('Impossible de créer le dossier. Vérifiez l\'activité et les fichiers.');
      },
    },
  });

  const approvedActivityIds = new Set(
    (approvedRequestsData?.data ?? []).map((request) => request.activityId),
  );
  const eligibleActivities = (activitiesData?.data ?? []).filter((activity) =>
    approvedActivityIds.has(activity.id),
  );

  const profile = dashboardData?.profile;
  const canCreate = profile ? canCreateMediaPublication(profile.primaryRoleCode) : false;
  const actorConfig = profile ? getMediaActorConfig(profile) : null;
  const publications = data?.data ?? [];
  const filterLabel = statusFilter ? mediaFilterLabel(statusFilter) : undefined;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    if (!activityId || !title.trim() || files.length === 0) return;

    try {
      const payloadFiles = await Promise.all(
        files.map(async (item) => {
          const base = {
            fileName: item.file.name,
            mimeType: item.file.type,
            mediaType: item.mediaType,
            fileContentBase64: await readFileAsBase64(item.file),
            caption: item.caption.trim() || undefined,
          };

          if (item.mediaType === 'video') {
            const durationSeconds = await getVideoDurationSeconds(item.file);
            if (durationSeconds > MAX_VIDEO_DURATION_SECONDS) {
              throw new Error('VIDEO_TOO_LONG');
            }
            return { ...base, durationSeconds: Math.ceil(durationSeconds) };
          }

          return base;
        }),
      );

      createPublication.mutate({
        data: {
          activityId,
          title: title.trim(),
          description: description.trim() || undefined,
          files: payloadFiles,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'VIDEO_TOO_LONG') {
        setSubmitError('Chaque vidéo ne doit pas dépasser 3 minutes.');
        return;
      }
      setSubmitError('Erreur lors de la lecture des fichiers.');
    }
  }

  return (
    <AppPage
      title="Publications média"
      description="Photos et vidéos de sorties scolaires — validation DREN/DVS avant publication publique."
    >
      <AppProPageShell>
        {dashboardData ? (
          <MediaScopeBanner
            profile={dashboardData.profile}
            listedCount={publications.length}
            statusFilterLabel={filterLabel}
          />
        ) : null}

        <nav className="media-status-nav" aria-label="Filtres par statut">
          <a
            href={appRoutes.mediaPublications}
            className={!statusFilter ? 'is-active' : undefined}
          >
            Tous
          </a>
          {MEDIA_STATUS_FILTERS.map((filter) => (
            <a
              key={filter.status}
              href={mediaFilterHref(filter.status)}
              className={statusFilter === filter.status ? 'is-active' : undefined}
            >
              {filter.label}
            </a>
          ))}
        </nav>

        <div
          className={`dash-workspace dash-workspace--media${
            canCreate ? '' : ' dash-workspace--media-review'
          }`}
        >
          <section className="media-list-section" aria-labelledby="media-list-heading">
            <AppProPanel
              title={
                filterLabel ??
                (actorConfig?.kind === 'establishment'
                  ? 'Mes dossiers média'
                  : 'Dossiers du périmètre')
              }
              headingId="media-list-heading"
              className="media-list-panel"
              action={
                <span className="app-pro-count">
                  {publications.length} dossier(s){statusFilter ? ' · filtre actif' : ''}
                </span>
              }
            >
              <MediaPublicationsList
                publications={publications}
                isLoading={isLoading}
                isError={isError}
                statusFilterLabel={filterLabel}
                canCreate={canCreate}
                onRetry={() => refetch()}
              />
            </AppProPanel>
          </section>

          {canCreate ? (
            <aside className="media-aside" aria-label="Dépôt média">
              <MediaPublicationCreateForm
                activities={eligibleActivities}
                activityId={activityId}
                title={title}
                description={description}
                files={files}
                isPending={createPublication.isPending}
                onActivityChange={setActivityId}
                onTitleChange={setTitle}
                onDescriptionChange={setDescription}
                onFilesChange={setFiles}
                onSubmit={handleSubmit}
              />
              {eligibleActivities.length === 0 ? (
                <p className="media-create-warning">
                  Aucune activité avec demande validée n&apos;est disponible dans votre périmètre.
                </p>
              ) : null}
              {submitError ? (
                <p className="media-create-error" role="alert">
                  {submitError}
                </p>
              ) : null}
            </aside>
          ) : null}
        </div>
      </AppProPageShell>
    </AppPage>
  );
}
