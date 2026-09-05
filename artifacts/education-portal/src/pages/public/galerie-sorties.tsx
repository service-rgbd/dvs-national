import { useMemo, useState } from 'react';
import { AlertTriangle, ImageIcon, MapPin, Video } from 'lucide-react';

import { exposesAgentsAccess } from '@/config/agents-portal';

import { PublicPage } from '@/components/portal/PublicPage';
import { PublicPageHero } from '@/components/portal/PublicPageHero';
import { activityTypes } from '@/config/roles';
import { featuredOutingAlbums } from '@/content/featured-outings';
import { publicPageContent } from '@/content/pages';
import { publicRoutes } from '@/content/routes';
import { useListPublicMediaPublications } from '@workspace/api-client-react';

const SCHOOL_LEVEL_OPTIONS = [
  { value: '', label: 'Tous les niveaux' },
  { value: 'primaire', label: 'Primaire' },
  { value: 'secondaire', label: 'Secondaire' },
] as const;

const SCHOOL_LEVEL_LABELS: Record<string, string> = {
  primaire: 'Primaire',
  secondaire: 'Secondaire',
  mixte: 'Primaire & secondaire',
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function GalerieSortiesPage() {
  const content = publicPageContent.galerieSorties;
  const [mediaType, setMediaType] = useState<'photo' | 'video' | ''>('');
  const [activityType, setActivityType] = useState('');
  const [schoolLevel, setSchoolLevel] = useState<'primaire' | 'secondaire' | ''>('');

  const { data, isLoading, isError, refetch } = useListPublicMediaPublications({
    page: 1,
    pageSize: 24,
    mediaType: mediaType || undefined,
    activityType: activityType || undefined,
    schoolLevel: schoolLevel || undefined,
  });

  const filteredFeaturedAlbums = useMemo(() => {
    return featuredOutingAlbums.filter((album) => {
      if (activityType && album.activityType !== activityType) return false;
      if (!schoolLevel) return true;
      if (schoolLevel === 'primaire') {
        return album.schoolLevel === 'primaire' || album.schoolLevel === 'mixte';
      }
      return album.schoolLevel === 'secondaire' || album.schoolLevel === 'mixte';
    });
  }, [activityType, schoolLevel]);

  const apiPublications = data?.data ?? [];
  const hasApiResults = !isLoading && !isError && apiPublications.length > 0;
  const hasFeaturedResults = filteredFeaturedAlbums.length > 0;

  return (
    <PublicPage
      title={content.title}
      description={content.description}
      seoDescription={content.seoDescription}
      variant="editorial"
      breadcrumbs={[
        { label: 'Accueil', href: publicRoutes.home },
        { label: content.title },
      ]}
    >
      <PublicPageHero
        eyebrow="Sorties scolaires validées"
        title="Retour en images sur les activités autorisées"
        description={content.intro}
        image={featuredOutingAlbums[0]?.heroImage}
        stats={[
          { value: String(featuredOutingAlbums.length), label: 'Album(s) mis en avant' },
          { value: 'DREN → DVS', label: 'Circuit de validation' },
          { value: 'Photo · Vidéo', label: 'Formats acceptés' },
        ]}
        actions={[
          { label: 'Vie scolaire', href: publicRoutes.vieScolaire, variant: 'outline' },
          ...(exposesAgentsAccess()
            ? [{ label: 'Espace agents', href: publicRoutes.espaceAgents }]
            : [{ label: 'Activités scolaires', href: publicRoutes.activites }]),
        ]}
      />

      <section className="galerie-filters-panel" aria-label="Filtres de la galerie">
        <div className="galerie-filters-group">
          <p className="galerie-filters-label">Niveau scolaire</p>
          <div className="galerie-filters" role="tablist" aria-label="Niveau scolaire">
            {SCHOOL_LEVEL_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                role="tab"
                aria-selected={schoolLevel === option.value}
                className={schoolLevel === option.value ? 'is-active' : undefined}
                onClick={() => setSchoolLevel(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="galerie-filters-group">
          <p className="galerie-filters-label">Type de sortie</p>
          <div className="galerie-filters galerie-filters--wrap" role="tablist" aria-label="Type de sortie">
            <button
              type="button"
              role="tab"
              aria-selected={activityType === ''}
              className={activityType === '' ? 'is-active' : undefined}
              onClick={() => setActivityType('')}
            >
              Tous
            </button>
            {activityTypes.map((type) => (
              <button
                key={type}
                type="button"
                role="tab"
                aria-selected={activityType === type}
                className={activityType === type ? 'is-active' : undefined}
                onClick={() => setActivityType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div className="galerie-filters-group">
          <p className="galerie-filters-label">Format média</p>
          <div className="galerie-filters" role="tablist" aria-label="Type de média">
            <button
              type="button"
              role="tab"
              aria-selected={mediaType === ''}
              className={mediaType === '' ? 'is-active' : undefined}
              onClick={() => setMediaType('')}
            >
              Tous
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mediaType === 'photo'}
              className={mediaType === 'photo' ? 'is-active' : undefined}
              onClick={() => setMediaType('photo')}
            >
              Photos
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mediaType === 'video'}
              className={mediaType === 'video' ? 'is-active' : undefined}
              onClick={() => setMediaType('video')}
            >
              Vidéos
            </button>
          </div>
        </div>
      </section>

      {!hasFeaturedResults && !isLoading && !hasApiResults ? (
        <p className="galerie-state galerie-state--soft">
          Aucune sortie ne correspond aux filtres sélectionnés.
        </p>
      ) : null}

      {filteredFeaturedAlbums.map((album) => (
        <section className="galerie-featured-album" key={album.id} aria-labelledby={`album-${album.id}`}>
          <header className="galerie-featured-head">
            <div>
              <p className="galerie-featured-eyebrow">Album mis en avant</p>
              <h2 id={`album-${album.id}`}>{album.title}</h2>
              <p className="galerie-featured-subtitle">{album.subtitle}</p>
              <div className="galerie-featured-tags">
                <span className="galerie-tag">{album.activityType}</span>
                <span className="galerie-tag">{SCHOOL_LEVEL_LABELS[album.schoolLevel]}</span>
              </div>
            </div>
            <div className="galerie-featured-meta">
              <span>
                <MapPin size={14} aria-hidden="true" /> {album.location}
              </span>
              <time dateTime={album.publishedAt}>Publié le {formatDate(album.publishedAt)}</time>
            </div>
          </header>

          <figure className="galerie-featured-hero">
            <img src={album.heroImage.src} alt={album.heroImage.alt} loading="lazy" />
          </figure>

          <div className="galerie-featured-grid">
            {album.photos.map((photo, index) => (
              <figure className="galerie-featured-photo" key={photo.src}>
                <img src={photo.src} alt={photo.alt} loading="lazy" />
                <figcaption>{`Photo ${index + 1} — ${album.title}`}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}

      <section className="galerie-api-section" aria-labelledby="galerie-api-heading">
        <div className="galerie-toolbar">
          <div>
            <h2 id="galerie-api-heading">Publications PNIGVS</h2>
            <p>Dossiers média déposés par les établissements et validés par la DREN et la DVS.</p>
          </div>
        </div>

        {isLoading ? (
          <p className="galerie-state" role="status">
            Chargement des publications…
          </p>
        ) : null}

        {isError ? (
          <div className="galerie-state galerie-state--soft" role="status">
            <p>
              Les publications en ligne ne sont pas disponibles pour le moment. Les albums ci-dessus
              restent consultables.
            </p>
            <button type="button" className="btn-secondary" onClick={() => refetch()}>
              Réessayer
            </button>
          </div>
        ) : null}

        {!isLoading && !isError && !hasApiResults ? (
          <p className="galerie-state galerie-state--soft">
            Aucune publication supplémentaire pour le moment. Les établissements déposent leurs médias
            via l&apos;application PNIGVS après validation DREN/DVS.
          </p>
        ) : null}

        {hasApiResults ? (
          <div className="galerie-grid">
            {apiPublications.map((item) => {
              const previewUrl = item.coverDownloadUrl ?? undefined;

              return (
                <article key={item.id} className="galerie-card">
                  <div className="galerie-card-media">
                    {previewUrl && item.coverMediaType === 'photo' ? (
                      <img src={previewUrl} alt={item.title} loading="lazy" />
                    ) : previewUrl && item.coverMediaType === 'video' ? (
                      <video src={previewUrl} controls preload="metadata" />
                    ) : (
                      <div className="galerie-card-placeholder" aria-hidden="true">
                        {item.coverMediaType === 'video' ? <Video size={32} /> : <ImageIcon size={32} />}
                      </div>
                    )}
                  </div>
                  <div className="galerie-card-body">
                    <div className="galerie-card-tags">
                      <span className="galerie-tag">{item.activityType}</span>
                      {item.schoolLevel ? (
                        <span className="galerie-tag">{SCHOOL_LEVEL_LABELS[item.schoolLevel]}</span>
                      ) : null}
                      {item.incidentReported ? (
                        <span className="galerie-tag galerie-tag--alert">
                          <AlertTriangle size={12} aria-hidden="true" /> Incident signalé
                        </span>
                      ) : null}
                    </div>
                    <h3>{item.title}</h3>
                    <p>
                      {item.establishmentName} · {item.activityTitle}
                    </p>
                    {item.publishedAt ? (
                      <time dateTime={item.publishedAt}>Publié le {formatDate(item.publishedAt)}</time>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>
    </PublicPage>
  );
}
