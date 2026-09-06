import { FormEvent, useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Landmark,
  Loader2,
  MapPin,
  Megaphone,
  Mic2,
  Trophy,
  Dumbbell,
} from 'lucide-react';

import { EstablishmentPicker } from '@/components/app/establishments/EstablishmentPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { activityTypes } from '@/config/roles';

const TYPE_ICONS: Record<string, typeof CalendarDays> = {
  'Sorties pédagogiques': Landmark,
  'Événements culturels': Mic2,
  Compétitions: Trophy,
  Conférences: Megaphone,
  'Campagnes éducatives': CalendarDays,
  'Activités sportives': Dumbbell,
};

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
  hideHeader?: boolean;
  resetNonce?: number;
  establishmentName?: string;
};

const STEPS = [
  { id: 'type', label: 'Type' },
  { id: 'title', label: 'Intitulé' },
  { id: 'context', label: 'Contexte' },
  { id: 'confirm', label: 'Validation' },
] as const;

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
  hideHeader = false,
  resetNonce = 0,
  establishmentName,
}: ActivityCreateFormProps) {
  const [step, setStep] = useState(0);
  const steps = needsEstablishment
    ? ([{ id: 'school', label: 'Établissement' }, ...STEPS] as const)
    : STEPS;
  const current = steps[step] ?? steps[0];
  const isLast = step === steps.length - 1;

  useEffect(() => {
    setStep(0);
  }, [resetNonce]);

  function canContinue(): boolean {
    if (current.id === 'school') return Boolean(establishmentId);
    if (current.id === 'type') return Boolean(type);
    if (current.id === 'title') return title.trim().length >= 3;
    return true;
  }

  function goNext() {
    if (!canContinue() || isLast) return;
    setStep((value) => value + 1);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!isLast) {
      event.preventDefault();
      goNext();
      return;
    }
    onSubmit(event);
  }

  return (
    <div className={hideHeader ? 'dash-form-block dash-form-block--bare' : 'dash-form-block'}>
      {hideHeader ? null : (
        <header className="dash-form-head">
          <h2 id="create-activity-heading">Nouvelle activité</h2>
          <p>Quatre étapes : type, intitulé, contexte, puis enregistrement.</p>
        </header>
      )}

      <ol className="activity-stepper" aria-label="Étapes de création">
        {steps.map((item, index) => (
          <li key={item.id} className={index === step ? 'is-current' : index < step ? 'is-done' : undefined}>
            <button type="button" onClick={() => index < step && setStep(index)} disabled={index > step}>
              <span>{index < step ? <Check size={12} aria-hidden="true" /> : index + 1}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ol>

      <form className="app-pro-form activity-create-form" onSubmit={handleSubmit} aria-labelledby="create-activity-heading">
        {establishmentName && current.id !== 'school' ? (
          <p className="activity-school-chip">Établissement · {establishmentName}</p>
        ) : null}
        {current.id === 'school' ? (
          <div className="form-field">
            <label htmlFor="activity-establishment">Établissement concerné</label>
            <EstablishmentPicker
              id="activity-establishment"
              value={establishmentId}
              onChange={onEstablishmentChange}
              required
            />
          </div>
        ) : null}

        {current.id === 'type' ? (
          <fieldset className="activity-type-grid">
            <legend>Quel type de sortie ?</legend>
            {activityTypes.map((item) => {
              const Icon = TYPE_ICONS[item] ?? CalendarDays;
              return (
                <label key={item} className={type === item ? 'is-selected' : undefined}>
                  <input
                    type="radio"
                    name="activity-type"
                    value={item}
                    checked={type === item}
                    onChange={() => onTypeChange(item)}
                  />
                  <Icon size={18} aria-hidden="true" />
                  <span>{item}</span>
                </label>
              );
            })}
          </fieldset>
        ) : null}

        {current.id === 'title' ? (
          <div className="form-field">
            <label htmlFor="activity-title">Intitulé de l&apos;activité</label>
            <Input
              id="activity-title"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              required
              maxLength={500}
              placeholder="Ex. Sortie pédagogique au musée des civilisations"
              autoFocus
            />
            <p className="activity-step-hint">Nom officiel tel qu&apos;il apparaîtra sur le dossier d&apos;autorisation.</p>
          </div>
        ) : null}

        {current.id === 'context' ? (
          <>
            <div className="form-field">
              <label htmlFor="activity-location">Lieu</label>
              <div className="activity-input-icon">
                <MapPin size={16} aria-hidden="true" />
                <Input
                  id="activity-location"
                  value={location}
                  onChange={(event) => onLocationChange(event.target.value)}
                  placeholder="Ex. Musée des civilisations, Cocody"
                />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="activity-description">Précisions (optionnel)</label>
              <Textarea
                id="activity-description"
                className="app-pro-textarea"
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                placeholder="Objectifs, classes concernées, contraintes…"
                rows={4}
              />
            </div>
          </>
        ) : null}

        {current.id === 'confirm' ? (
          <dl className="activity-recap">
            {needsEstablishment ? (
              <div>
                <dt>Établissement</dt>
                <dd>{establishmentId ? 'Sélectionné' : '—'}</dd>
              </div>
            ) : null}
            <div>
              <dt>Type</dt>
              <dd>{type}</dd>
            </div>
            <div>
              <dt>Intitulé</dt>
              <dd>{title.trim() || '—'}</dd>
            </div>
            <div>
              <dt>Lieu</dt>
              <dd>{location.trim() || 'Non précisé'}</dd>
            </div>
            <div>
              <dt>Précisions</dt>
              <dd>{description.trim() || 'Aucune'}</dd>
            </div>
          </dl>
        ) : null}

        <div className="activity-step-actions">
          {step > 0 ? (
            <button type="button" className="dash-chip-btn" onClick={() => setStep((value) => value - 1)}>
              <ArrowLeft size={14} aria-hidden="true" />
              Retour
            </button>
          ) : (
            <span />
          )}
          <Button type="submit" disabled={isPending || !canContinue()} className="app-pro-submit activity-create-submit">
            {isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" /> Enregistrement…
              </>
            ) : isLast ? (
              <>
                <Check size={16} aria-hidden="true" /> Enregistrer l&apos;activité
              </>
            ) : (
              <>
                Continuer
                <ArrowRight size={16} aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
