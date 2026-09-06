import { FormEvent } from 'react';
import { FilePlus2, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import type { ActivitySummary } from '@workspace/api-client-react';

import { Button } from '@/components/ui/button';
import { appRoutes } from '@/content/routes';

type RequestCreateFormProps = {
  activities: ActivitySummary[];
  activityId: string;
  description: string;
  isPending: boolean;
  onActivityChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function RequestCreateForm({
  activities,
  activityId,
  description,
  isPending,
  onActivityChange,
  onDescriptionChange,
  onSubmit,
}: RequestCreateFormProps) {
  const hasActivities = activities.length > 0;

  return (
    <div className="dash-form-block">
      <header className="dash-form-head">
        <h2 id="create-request-heading">Nouveau dossier</h2>
        <p>Liez une activité, puis soumettez depuis le détail.</p>
      </header>
      <form className="app-pro-form request-create-form" onSubmit={onSubmit} aria-labelledby="create-request-heading">
        <div className="form-field">
          <label htmlFor="request-activity">Activité concernée</label>
          <select
            id="request-activity"
            className="app-pro-select"
            value={activityId}
            onChange={(event) => onActivityChange(event.target.value)}
            required
            disabled={!hasActivities}
          >
            <option value="">
              {hasActivities ? 'Sélectionner une activité…' : 'Aucune activité disponible'}
            </option>
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.title} — {activity.establishmentName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="request-description">Motif / précisions (optionnel)</label>
          <textarea
            id="request-description"
            className="app-pro-textarea"
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            rows={4}
            placeholder="Contexte pédagogique, dates, public visé…"
          />
        </div>

        {!hasActivities ? (
          <p className="request-create-hint">
            Aucune activité.{' '}
            <Link href={appRoutes.activities} className="request-create-hint-link">
              Créer une activité
            </Link>
            .
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isPending || !activityId}
          className="app-pro-submit request-create-submit"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" /> Création…
            </>
          ) : (
            <>
              <FilePlus2 size={16} aria-hidden="true" /> Créer le dossier
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
