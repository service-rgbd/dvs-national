import { useMemo, useState } from 'react';
import { ChevronDown, ImageIcon, Loader2, Video } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { MediaPublicationSummary } from '@workspace/api-client-react';
import {
  getGetPublicMediaPublicationByIdQueryOptions,
  useListPublicMediaPublications,
} from '@workspace/api-client-react';

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function groupPublicationsByCategory(items: MediaPublicationSummary[]) {
  const sorted = [...items].sort((a, b) => {
    const dateA = new Date(a.publishedAt ?? a.createdAt).getTime();
    const dateB = new Date(b.publishedAt ?? b.createdAt).getTime();
    return dateB - dateA;
  });

  const groups = new Map<string, MediaPublicationSummary[]>();
  for (const item of sorted) {
    const key = item.activityType || 'Autres sorties';
    const bucket = groups.get(key) ?? [];
    bucket.push(item);
    groups.set(key, bucket);
  }

  return Array.from(groups.entries());
}

type PublicationDossierProps = {
  publication: MediaPublicationSummary;
};

function PublicationDossier({ publication }: PublicationDossierProps) {
  const [open, setOpen] = useState(false);
  const displayDate = publication.publishedAt ?? publication.createdAt;

  const { data, isLoading, isError } = useQuery({
    ...getGetPublicMediaPublicationByIdQueryOptions(publication.id),
    enabled: open,
  });

  const files = data?.files ?? [];

  return (
    <article className="est-outing-dossier">
      <button
        type="button"
        className="est-outing-dossier-head"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <div className="est-outing-dossier-preview">
          {publication.coverDownloadUrl && publication.coverMediaType === 'photo' ? (
            <img src={publication.coverDownloadUrl} alt="" loading="lazy" />
          ) : publication.coverDownloadUrl && publication.coverMediaType === 'video' ? (
            <span className="est-outing-dossier-video-badge" aria-hidden="true">
              <Video size={20} />
            </span>
          ) : (
            <span className="est-outing-dossier-placeholder" aria-hidden="true">
              <ImageIcon size={20} />
            </span>
          )}
        </div>
        <div className="est-outing-dossier-copy">
          <h4>{publication.title}</h4>
          <p>{publication.activityTitle}</p>
          <time dateTime={displayDate}>Ajouté le {formatDate(displayDate)}</time>
          <span className="est-outing-dossier-count">
            {publication.fileCount} fichier{publication.fileCount > 1 ? 's' : ''}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`est-outing-dossier-chevron${open ? ' is-open' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="est-outing-dossier-body">
          {isLoading ? (
            <p className="est-outing-state" role="status">
              <Loader2 className="spin" size={16} aria-hidden="true" /> Chargement des médias…
            </p>
          ) : null}
          {isError ? (
            <p className="est-outing-state est-outing-state--muted">
              Impossible de charger les fichiers de ce dossier.
            </p>
          ) : null}
          {!isLoading && !isError && files.length === 0 ? (
            <p className="est-outing-state est-outing-state--muted">Aucun fichier dans ce dossier.</p>
          ) : null}
          {files.length > 0 ? (
            <div className="est-outing-media-grid">
              {files.map((file) => (
                <figure className="est-outing-media-item" key={file.id}>
                  {file.mediaType === 'photo' ? (
                    <a href={file.downloadUrl} target="_blank" rel="noreferrer">
                      <img src={file.downloadUrl} alt={file.caption ?? file.fileName} loading="lazy" />
                    </a>
                  ) : (
                    <video src={file.downloadUrl} controls preload="metadata" />
                  )}
                  <figcaption>{file.caption ?? file.fileName}</figcaption>
                </figure>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

type EstablishmentOutingsGalleryProps = {
  establishmentId: string;
  establishmentName: string;
};

export function EstablishmentOutingsGallery({
  establishmentId,
  establishmentName,
}: EstablishmentOutingsGalleryProps) {
  const { data, isLoading, isError } = useListPublicMediaPublications({
    establishmentId,
    page: 1,
    pageSize: 50,
  });

  const groups = useMemo(() => groupPublicationsByCategory(data?.data ?? []), [data?.data]);

  if (isLoading) {
    return (
      <section className="est-outings-section" aria-labelledby="est-outings-heading">
        <header className="est-outings-head">
          <h2 id="est-outings-heading">Sorties et médias publiés</h2>
          <p>Chargement des publications de {establishmentName}…</p>
        </header>
        <p className="est-outing-state" role="status">
          <Loader2 className="spin" size={18} aria-hidden="true" /> Chargement…
        </p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="est-outings-section" aria-labelledby="est-outings-heading">
        <header className="est-outings-head">
          <h2 id="est-outings-heading">Sorties et médias publiés</h2>
        </header>
        <p className="est-outing-state est-outing-state--muted">
          Les publications de sortie ne sont pas disponibles pour le moment.
        </p>
      </section>
    );
  }

  if (groups.length === 0) {
    return (
      <section className="est-outings-section" aria-labelledby="est-outings-heading">
        <header className="est-outings-head">
          <h2 id="est-outings-heading">Sorties et médias publiés</h2>
          <p>
            Aucune photo ou vidéo publiée pour le moment. Les dossiers validés par la DREN et la DVS
            apparaîtront ici, classés par type de sortie.
          </p>
        </header>
      </section>
    );
  }

  return (
    <section className="est-outings-section" aria-labelledby="est-outings-heading">
      <header className="est-outings-head">
        <h2 id="est-outings-heading">Sorties et médias publiés</h2>
        <p>
          Photos et vidéos de sorties validées, classées par catégorie et triées par date
          d&apos;ajout (du plus récent au plus ancien).
        </p>
      </header>

      {groups.map(([category, publications]) => (
        <div className="est-outings-category" key={category}>
          <h3 className="est-outings-category-title">{category}</h3>
          <div className="est-outings-dossiers">
            {publications.map((publication) => (
              <PublicationDossier key={publication.id} publication={publication} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
