import { FormEvent, useState } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, FilePlus2 } from 'lucide-react';

import { ActivityCreateForm } from '@/components/app/activities/ActivityCreateForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { activityTypes } from '@/config/roles';
import { appRoutes } from '@/content/routes';
import { invalidateActivities, invalidateDashboard } from '@/lib/query-sync';
import { useCreateActivity, type ActivitySummary } from '@workspace/api-client-react';

type ActivityComposeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  needsEstablishment: boolean;
  establishmentName?: string;
};

export function ActivityComposeDialog({
  open,
  onOpenChange,
  needsEstablishment,
  establishmentName,
}: ActivityComposeDialogProps) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<string>(activityTypes[0]);
  const [description, setDescription] = useState('');
  const [location, setPlace] = useState('');
  const [establishmentId, setEstablishmentId] = useState('');
  const [formNonce, setFormNonce] = useState(0);
  const [created, setCreated] = useState<ActivitySummary | null>(null);

  const createActivity = useCreateActivity({
    mutation: {
      onSuccess: async (activity) => {
        await Promise.all([invalidateActivities(queryClient), invalidateDashboard(queryClient)]);
        setTitle('');
        setDescription('');
        setPlace('');
        if (needsEstablishment) {
          setEstablishmentId('');
        }
        setFormNonce((value) => value + 1);
        setCreated(activity);
      },
    },
  });

  function resetAndClose() {
    setCreated(null);
    setFormNonce((value) => value + 1);
    onOpenChange(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createActivity.mutate({
      data: {
        title: title.trim(),
        type,
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        establishmentId: needsEstablishment ? establishmentId || undefined : undefined,
      },
    });
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
      <DialogContent className="activity-compose-dialog" aria-describedby="activity-compose-desc">
        {created ? (
          <div className="activity-compose-success">
            <CheckCircle2 size={28} aria-hidden="true" />
            <DialogHeader>
              <DialogTitle>Activité enregistrée</DialogTitle>
              <DialogDescription id="activity-compose-desc">
                {created.title} est prête. Ouvrez maintenant le dossier d&apos;autorisation — vous restez
                dans le même parcours.
              </DialogDescription>
            </DialogHeader>
            <div className="activity-step-actions">
              <button type="button" className="dash-chip-btn" onClick={resetAndClose}>
                Plus tard
              </button>
              <Button
                type="button"
                className="app-pro-submit"
                onClick={() => {
                  resetAndClose();
                  setLocation(`${appRoutes.requests}?activity=${created.id}`);
                }}
              >
                <FilePlus2 size={16} aria-hidden="true" />
                Ouvrir un dossier
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle id="create-activity-heading">Nouvelle activité</DialogTitle>
              <DialogDescription id="activity-compose-desc">
                {establishmentName
                  ? `Rattachée à ${establishmentName}. Type, intitulé, lieu, puis enregistrement.`
                  : 'Type, intitulé, lieu, puis enregistrement. Ensuite seulement, le dossier d’autorisation.'}
              </DialogDescription>
            </DialogHeader>
            <ActivityCreateForm
              needsEstablishment={needsEstablishment}
              establishmentName={establishmentName}
              title={title}
              type={type}
              description={description}
              location={location}
              establishmentId={establishmentId}
              isPending={createActivity.isPending}
              onTitleChange={setTitle}
              onTypeChange={setType}
              onDescriptionChange={setDescription}
              onLocationChange={setPlace}
              onEstablishmentChange={setEstablishmentId}
              onSubmit={handleSubmit}
              hideHeader
              resetNonce={formNonce}
            />
            {createActivity.isError ? (
              <p className="pilot-empty" role="alert">
                Impossible d&apos;enregistrer l&apos;activité. Vérifiez les champs et réessayez.
              </p>
            ) : null}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
