import { DragEvent, FormEvent, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImageIcon,
  Loader2,
  Upload,
  Video,
  X,
} from 'lucide-react';
import type { ActivitySummary } from '@workspace/api-client-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  detectMediaType,
  formatFileSize,
  MAX_FILES_PER_PUBLICATION,
  MAX_PHOTO_BYTES,
  MAX_VIDEO_BYTES,
} from '@/lib/media-utils';

export type MediaFileDraft = {
  id: string;
  file: File;
  mediaType: 'photo' | 'video';
  caption: string;
  previewUrl: string;
};

type MediaPublicationCreateFormProps = {
  activities: ActivitySummary[];
  activityId: string;
  title: string;
  description: string;
  files: MediaFileDraft[];
  isPending: boolean;
  hideHeader?: boolean;
  resetNonce?: number;
  onActivityChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFilesChange: (files: MediaFileDraft[]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const STEPS = [
  { id: 'sortie', label: 'Sortie' },
  { id: 'medias', label: 'Médias' },
  { id: 'confirm', label: 'Validation' },
] as const;

function makeDraft(file: File, mediaType: 'photo' | 'video'): MediaFileDraft {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
    file,
    mediaType,
    caption: '',
    previewUrl: URL.createObjectURL(file),
  };
}

export function MediaPublicationCreateForm({
  activities,
  activityId,
  title,
  description,
  files,
  isPending,
  hideHeader = false,
  resetNonce = 0,
  onActivityChange,
  onTitleChange,
  onDescriptionChange,
  onFilesChange,
  onSubmit,
}: MediaPublicationCreateFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const current = STEPS[step] ?? STEPS[0];
  const isLast = step === STEPS.length - 1;
  const selectedActivity = activities.find((item) => item.id === activityId);

  useEffect(() => {
    setStep(0);
    setError(null);
  }, [resetNonce]);

  function addFiles(selected: File[]) {
    setError(null);
    const next: MediaFileDraft[] = [];

    for (const file of selected) {
      const mediaType = detectMediaType(file);
      if (!mediaType) {
        setError(`Format non accepté : ${file.name}. Photos JPG/PNG/WebP/GIF, vidéos MP4/WebM.`);
        continue;
      }
      if (mediaType === 'photo' && file.size > MAX_PHOTO_BYTES) {
        setError(`${file.name} dépasse 10 Mo.`);
        continue;
      }
      if (mediaType === 'video' && file.size > MAX_VIDEO_BYTES) {
        setError(`${file.name} dépasse 50 Mo.`);
        continue;
      }
      next.push(makeDraft(file, mediaType));
    }

    const room = MAX_FILES_PER_PUBLICATION - files.length;
    if (next.length > room) {
      next.slice(room).forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setError(`Maximum ${MAX_FILES_PER_PUBLICATION} fichiers par dossier.`);
    }
    onFilesChange([...files, ...next.slice(0, Math.max(room, 0))]);
  }

  function removeFile(id: string) {
    const target = files.find((item) => item.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onFilesChange(files.filter((item) => item.id !== id));
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    addFiles(Array.from(event.dataTransfer.files ?? []));
  }

  function canContinue(): boolean {
    if (current.id === 'sortie') return Boolean(activityId) && title.trim().length >= 3;
    if (current.id === 'medias') return files.length > 0;
    return true;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!isLast) {
      event.preventDefault();
      if (canContinue()) setStep((value) => value + 1);
      return;
    }
    onSubmit(event);
  }

  return (
    <div className={hideHeader ? 'dash-form-block dash-form-block--bare' : 'dash-form-block'}>
      {hideHeader ? null : (
        <header className="dash-form-head">
          <h2 id="media-create-heading">Nouveau dossier média</h2>
          <p>Activité autorisée, photos ou vidéos, puis enregistrement en brouillon.</p>
        </header>
      )}

      <ol className="activity-stepper" aria-label="Étapes du dépôt">
        {STEPS.map((item, index) => (
          <li key={item.id} className={index === step ? 'is-current' : index < step ? 'is-done' : undefined}>
            <button type="button" onClick={() => index < step && setStep(index)} disabled={index > step}>
              <span>{index < step ? <Check size={12} aria-hidden="true" /> : index + 1}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ol>

      <form className="app-pro-form media-create-form" onSubmit={handleSubmit} aria-labelledby="media-create-heading">
        {current.id === 'sortie' ? (
          <>
            <div className="form-field">
              <label htmlFor="media-activity">Activité déjà autorisée</label>
              <select
                id="media-activity"
                className="app-pro-select"
                value={activityId}
                onChange={(event) => onActivityChange(event.target.value)}
                required
                disabled={activities.length === 0}
              >
                <option value="">
                  {activities.length === 0 ? 'Aucune sortie validée' : 'Choisir une sortie…'}
                </option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.title}
                  </option>
                ))}
              </select>
              <p className="activity-step-hint">
                Seules les activités dont le dossier d&apos;autorisation est validé par la DVS
                peuvent recevoir des photos.
              </p>
            </div>
            <div className="form-field">
              <label htmlFor="media-title">Titre du dossier</label>
              <Input
                id="media-title"
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                placeholder="Ex. Sortie au musée — album photos"
                minLength={3}
                maxLength={200}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="media-description">Légende générale (optionnel)</label>
              <Textarea
                id="media-description"
                className="app-pro-textarea"
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                rows={3}
                maxLength={5000}
                placeholder="Contexte, classes, lieu…"
              />
            </div>
          </>
        ) : null}

        {current.id === 'medias' ? (
          <>
            <label
              className={`media-dropzone${dragging ? ' is-dragging' : ''}`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                multiple
                onChange={(event) => {
                  addFiles(Array.from(event.target.files ?? []));
                  event.target.value = '';
                }}
              />
              <Upload size={22} aria-hidden="true" />
              <strong>Glissez les photos ici</strong>
              <span>ou cliquez pour parcourir — {files.length}/{MAX_FILES_PER_PUBLICATION} fichiers</span>
              <em>JPG, PNG, WebP, GIF · 10 Mo · Vidéos MP4/WebM · 3 min · 50 Mo</em>
            </label>

            {files.length > 0 ? (
              <ul className="media-draft-grid">
                {files.map((item) => (
                  <li key={item.id} className="media-draft-card">
                    <div className="media-draft-preview">
                      {item.mediaType === 'photo' ? (
                        <img src={item.previewUrl} alt="" />
                      ) : (
                        <video src={item.previewUrl} muted />
                      )}
                      <span className="media-draft-kind">
                        {item.mediaType === 'photo' ? <ImageIcon size={12} /> : <Video size={12} />}
                        {item.mediaType === 'photo' ? 'Photo' : 'Vidéo'}
                      </span>
                      <button type="button" className="media-draft-remove" onClick={() => removeFile(item.id)} aria-label={`Retirer ${item.file.name}`}>
                        <X size={14} />
                      </button>
                    </div>
                    <p className="media-draft-name">
                      {item.file.name}
                      <small>{formatFileSize(item.file.size)}</small>
                    </p>
                    <input
                      type="text"
                      value={item.caption}
                      onChange={(event) =>
                        onFilesChange(
                          files.map((entry) =>
                            entry.id === item.id ? { ...entry, caption: event.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="Légende (optionnel)"
                      maxLength={200}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}

        {current.id === 'confirm' ? (
          <dl className="activity-recap">
            <div>
              <dt>Sortie</dt>
              <dd>{selectedActivity?.title ?? '—'}</dd>
            </div>
            <div>
              <dt>Titre</dt>
              <dd>{title.trim() || '—'}</dd>
            </div>
            <div>
              <dt>Fichiers</dt>
              <dd>
                {files.filter((item) => item.mediaType === 'photo').length} photo(s) ·{' '}
                {files.filter((item) => item.mediaType === 'video').length} vidéo(s)
              </dd>
            </div>
          </dl>
        ) : null}

        {error ? (
          <p className="media-create-error" role="alert">
            {error}
          </p>
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
          <Button type="submit" disabled={isPending || !canContinue()} className="app-pro-submit">
            {isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" /> Envoi des fichiers…
              </>
            ) : isLast ? (
              <>
                <Check size={16} aria-hidden="true" /> Enregistrer le brouillon
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
