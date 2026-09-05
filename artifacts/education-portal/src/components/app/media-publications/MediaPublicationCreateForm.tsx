import { ChangeEvent, FormEvent, useState } from 'react';
import { Upload } from 'lucide-react';
import type { ActivitySummary } from '@workspace/api-client-react';

import { AppProPanel } from '@/components/app/pro/AppProPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type MediaFileDraft = {
  file: File;
  mediaType: 'photo' | 'video';
  caption: string;
};

type MediaPublicationCreateFormProps = {
  activities: ActivitySummary[];
  activityId: string;
  title: string;
  description: string;
  files: MediaFileDraft[];
  isPending: boolean;
  onActivityChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFilesChange: (files: MediaFileDraft[]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

function detectMediaType(file: File): 'photo' | 'video' | null {
  if (PHOTO_TYPES.has(file.type)) return 'photo';
  if (VIDEO_TYPES.has(file.type)) return 'video';
  return null;
}

export function MediaPublicationCreateForm({
  activities,
  activityId,
  title,
  description,
  files,
  isPending,
  onActivityChange,
  onTitleChange,
  onDescriptionChange,
  onFilesChange,
  onSubmit,
}: MediaPublicationCreateFormProps) {
  const [error, setError] = useState<string | null>(null);

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    setError(null);
    const selected = Array.from(event.target.files ?? []);
    const next: MediaFileDraft[] = [];

    for (const file of selected) {
      const mediaType = detectMediaType(file);
      if (!mediaType) {
        setError(`Type non supporté : ${file.name}`);
        continue;
      }
      if (mediaType === 'photo' && file.size > 10 * 1024 * 1024) {
        setError(`Photo trop volumineuse (max 10 Mo) : ${file.name}`);
        continue;
      }
      if (mediaType === 'video' && file.size > 50 * 1024 * 1024) {
        setError(`Vidéo trop volumineuse (max 50 Mo) : ${file.name}`);
        continue;
      }
      next.push({ file, mediaType, caption: '' });
    }

    const merged = [...files, ...next].slice(0, 12);
    onFilesChange(merged);
    event.target.value = '';
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <AppProPanel
      title="Déposer un dossier média"
      headingId="media-create-heading"
      className="media-create-panel"
    >
      <form className="media-create-form" onSubmit={onSubmit}>
        <p className="media-create-hint">
          Sélectionnez une activité dont la demande d&apos;autorisation est validée, puis ajoutez
          jusqu&apos;à 12 fichiers (photos 10 Mo max, vidéos 3 min max).
        </p>

        <label className="media-create-field">
          <span>Activité autorisée</span>
          <select
            value={activityId}
            onChange={(event) => onActivityChange(event.target.value)}
            required
          >
            <option value="">Choisir une activité…</option>
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.title}
              </option>
            ))}
          </select>
        </label>

        <label className="media-create-field">
          <span>Titre du dossier</span>
          <Input
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Ex. Sortie au musée — photos"
            minLength={3}
            maxLength={200}
            required
          />
        </label>

        <label className="media-create-field">
          <span>Description (optionnelle)</span>
          <textarea
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            rows={3}
            maxLength={5000}
            placeholder="Contexte pédagogique, lieu, date…"
          />
        </label>

        <label className="media-create-field media-create-upload">
          <span>Fichiers photo / vidéo</span>
          <input type="file" accept="image/*,video/*" multiple onChange={handleFiles} />
          <span className="media-create-upload-btn">
            <Upload size={16} aria-hidden="true" /> Ajouter des fichiers
          </span>
        </label>

        {files.length > 0 ? (
          <ul className="media-create-files">
            {files.map((item, index) => (
              <li key={`${item.file.name}-${index}`}>
                <span>
                  {item.mediaType === 'photo' ? 'Photo' : 'Vidéo'} · {item.file.name}
                </span>
                <button type="button" onClick={() => removeFile(index)}>
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {error ? (
          <p className="media-create-error" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending || !activityId || !title.trim() || files.length === 0}>
          {isPending ? 'Envoi en cours…' : 'Créer le dossier (brouillon)'}
        </Button>
      </form>
    </AppProPanel>
  );
}
