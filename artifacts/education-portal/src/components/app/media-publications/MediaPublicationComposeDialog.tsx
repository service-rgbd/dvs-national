import { FormEvent, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import type { ActivitySummary } from '@workspace/api-client-react';

import {
  MediaPublicationCreateForm,
  type MediaFileDraft,
} from '@/components/app/media-publications/MediaPublicationCreateForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { appRoutes } from '@/content/routes';
import { invalidateMediaPublications } from '@/lib/query-sync';
import {
  getVideoDurationSeconds,
  MAX_VIDEO_DURATION_SECONDS,
  readFileAsBase64,
} from '@/lib/media-utils';
import { useCreateMediaPublication } from '@workspace/api-client-react';

type MediaPublicationComposeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activities: ActivitySummary[];
};

function revokeAll(files: MediaFileDraft[]) {
  files.forEach((item) => URL.revokeObjectURL(item.previewUrl));
}

export function MediaPublicationComposeDialog({
  open,
  onOpenChange,
  activities,
}: MediaPublicationComposeDialogProps) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [activityId, setActivityId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<MediaFileDraft[]>([]);
  const [formNonce, setFormNonce] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const createPublication = useCreateMediaPublication({
    mutation: {
      onSuccess: async (result) => {
        await invalidateMediaPublications(queryClient);
        revokeAll(files);
        setFiles([]);
        setActivityId('');
        setTitle('');
        setDescription('');
        setFormNonce((value) => value + 1);
        setCreatedId(result.id);
      },
      onError: () => {
        setSubmitError('Impossible d’enregistrer. Vérifiez la sortie autorisée et les fichiers.');
      },
    },
  });

  function resetAndClose() {
    revokeAll(files);
    setFiles([]);
    setCreatedId(null);
    setSubmitError(null);
    setFormNonce((value) => value + 1);
    onOpenChange(false);
  }

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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          resetAndClose();
          return;
        }
        onOpenChange(true);
      }}
    >
      <DialogContent className="activity-compose-dialog media-compose-dialog" aria-describedby="media-compose-desc">
        {createdId ? (
          <div className="activity-compose-success">
            <CheckCircle2 size={28} aria-hidden="true" />
            <DialogHeader>
              <DialogTitle>Dossier enregistré</DialogTitle>
              <DialogDescription id="media-compose-desc">
                Les fichiers sont en brouillon. Soumettez-les à la DREN depuis la fiche.
              </DialogDescription>
            </DialogHeader>
            <div className="activity-step-actions">
              <button type="button" className="dash-chip-btn" onClick={resetAndClose}>
                Rester ici
              </button>
              <Button
                type="button"
                className="app-pro-submit"
                onClick={() => {
                  const id = createdId;
                  resetAndClose();
                  setLocation(appRoutes.mediaPublicationDetail(id));
                }}
              >
                Ouvrir le dossier
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle id="media-create-heading">Nouveau dossier média</DialogTitle>
              <DialogDescription id="media-compose-desc">
                Photos et vidéos d’une sortie déjà autorisée. Le dossier part ensuite à la DREN, puis à
                la DVS, avant d’apparaître sur le site public.
              </DialogDescription>
            </DialogHeader>
            {activities.length === 0 ? (
              <p className="media-create-warning">
                Aucune activité autorisée. Validez d’abord un dossier de sortie, puis revenez déposer
                les photos.{' '}
                <Link href={appRoutes.requests} onClick={resetAndClose}>
                  Voir les demandes
                </Link>
              </p>
            ) : (
              <MediaPublicationCreateForm
                activities={activities}
                activityId={activityId}
                title={title}
                description={description}
                files={files}
                isPending={createPublication.isPending}
                hideHeader
                resetNonce={formNonce}
                onActivityChange={setActivityId}
                onTitleChange={setTitle}
                onDescriptionChange={setDescription}
                onFilesChange={setFiles}
                onSubmit={handleSubmit}
              />
            )}
            {submitError ? (
              <p className="media-create-error" role="alert">
                {submitError}
              </p>
            ) : null}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
