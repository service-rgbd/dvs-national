import { FormEvent } from 'react';
import { Loader2, Plus } from 'lucide-react';

import { EstablishmentPicker } from '@/components/app/establishments/EstablishmentPicker';
import { AppProPanel } from '@/components/app/pro/AppProPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { activityTypes } from '@/config/roles';

type ActivityCreateFormProps = {
  needsEstablishment: boolean;
  title: string;
  type: string;
  description: string;
  location: string;
  establishmentId: string;
  isPending: boolean;
  onTitleChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onEstablishmentChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ActivityCreateForm({
  needsEstablishment,
  title,
  type,
  description,
  location,
  establishmentId,
  isPending,
  onTitleChange,
  onTypeChange,
  onDescriptionChange,
  onLocationChange,
  onEstablishmentChange,
  onSubmit,
}: ActivityCreateFormProps) {
  return (
    <AppProPanel title="Nouvelle activité" headingId="create-activity-heading" className="activity-create-panel">
      <p className="activity-create-intro">
        Renseignez les informations essentielles. Vous pourrez ensuite soumettre une demande
        d&apos;autorisation.
      </p>
      <form className="app-pro-form activity-create-form" onSubmit={onSubmit}>
        {needsEstablishment ? (
          <div className="form-field activity-create-form-full">
            <label htmlFor="activity-establishment">Établissement concerné</label>
            <EstablishmentPicker
              id="activity-establishment"
              value={establishmentId}
              onChange={onEstablishmentChange}
              required
            />
          </div>
        ) : null}

        <div className="activity-create-form-grid">
          <div className="form-field activity-create-form-full">
            <label htmlFor="activity-title">Titre de l&apos;activité</label>
            <Input
              id="activity-title"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              required
              maxLength={500}
              placeholder="Ex. Sortie pédagogique au musée des civilisations"
            />
          </div>

          <div className="form-field">
            <label htmlFor="activity-type">Type</label>
            <select
              id="activity-type"
              className="app-pro-select"
              value={type}
              onChange={(event) => onTypeChange(event.target.value)}
            >
              {activityTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="activity-location">Lieu (optionnel)</label>
            <Input
              id="activity-location"
              value={location}
              onChange={(event) => onLocationChange(event.target.value)}
              placeholder="Ex. Cocody, Abidjan"
            />
          </div>

          <div className="form-field activity-create-form-full">
            <label htmlFor="activity-description">Description (optionnel)</label>
            <Input
              id="activity-description"
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder="Objectifs, participants, contraintes…"
            />
          </div>
        </div>

        <Button type="submit" disabled={isPending} className="app-pro-submit activity-create-submit">
          {isPending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" /> Enregistrement…
            </>
          ) : (
            <>
              <Plus size={16} aria-hidden="true" /> Créer l&apos;activité
            </>
          )}
        </Button>
      </form>
    </AppProPanel>
  );
}
