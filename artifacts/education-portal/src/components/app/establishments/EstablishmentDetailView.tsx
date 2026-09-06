import {
  CalendarDays,
  Camera,
  GraduationCap,
  Hash,
  ListOrdered,
  Mail,
  MapPin,
  Phone,
  School,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'wouter';
import type { EstablishmentDetail } from '@workspace/api-client-react';
import { useListActivities, useListPublicMediaPublications } from '@workspace/api-client-react';

import { appRoutes } from '@/content/routes';
import { liveQueryHookOptions } from '@/lib/query-sync';

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  pending: 'En attente',
  archived: 'Archivé',
};

const TEACHING_ORDER_LABELS: Record<string, string> = {
  LAIC: 'Enseignement laïc',
  CATHOLIQUE: 'Enseignement catholique',
  ISLAMIQUE: 'Enseignement islamique',
  METHODISTE: 'Enseignement méthodiste',
  AUTRE_CONFESSION: 'Autre confession',
};

type EstablishmentDetailViewProps = {
  data: EstablishmentDetail;
};

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function displayValue(value: string | number | null | undefined, fallback = '—'): string {
  if (value == null || value === '') return fallback;
  return String(value);
}

function teachingOrderLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return TEACHING_ORDER_LABELS[value] ?? value;
}

function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

function Fact({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
}) {
  return (
    <div className="est-sheet-fact">
      <dt>
        <Icon size={13} aria-hidden="true" />
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}

function EstablishmentRelated({
  establishmentId,
  establishmentName,
}: {
  establishmentId: string;
  establishmentName: string;
}) {
  const { data: activitiesData } = useListActivities({ page: 1, pageSize: 50 }, liveQueryHookOptions());
  const { data: photosData } = useListPublicMediaPublications(
    { page: 1, pageSize: 12, establishmentId, mediaType: 'photo' },
    liveQueryHookOptions(),
  );

  const activities = (activitiesData?.data ?? [])
    .filter((activity) => activity.establishmentId === establishmentId)
    .slice(0, 6);
  const photos = (photosData?.data ?? []).filter(
    (item) => item.coverMediaType === 'photo' || item.fileCount > 0,
  );

  return (
    <div className="est-related">
      <section className="est-sheet-section" aria-labelledby="est-activities-heading">
        <header className="est-sheet-head">
          <h2 id="est-activities-heading">Activités scolaires</h2>
          <Link href={appRoutes.activities}>Toutes les activités</Link>
        </header>
        {activities.length === 0 ? (
          <p className="est-related-empty">Aucune activité enregistrée pour {establishmentName}.</p>
        ) : (
          <ul className="est-related-list">
            {activities.map((activity) => (
              <li key={activity.id}>
                <CalendarDays size={14} aria-hidden="true" />
                <span>
                  <strong>{activity.title}</strong>
                  <em>
                    {activity.type}
                    {activity.scheduledAt ? ` · ${formatDate(activity.scheduledAt)}` : ''}
                  </em>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="est-sheet-section" aria-labelledby="est-photos-heading">
        <header className="est-sheet-head">
          <h2 id="est-photos-heading">Photos publiées</h2>
          <Link href={appRoutes.mediaPublications}>Galerie</Link>
        </header>
        {photos.length === 0 ? (
          <p className="est-related-empty">Aucune photo publiée pour cet établissement.</p>
        ) : (
          <ul className="est-photo-grid">
            {photos.map((photo) => (
              <li key={photo.id}>
                <Link href={appRoutes.mediaPublicationDetail(photo.id)} className="est-photo-link">
                  {photo.coverDownloadUrl && photo.coverMediaType === 'photo' ? (
                    <img src={photo.coverDownloadUrl} alt="" loading="lazy" />
                  ) : (
                    <span className="est-photo-fallback" aria-hidden="true">
                      <Camera size={18} />
                    </span>
                  )}
                  <span>{photo.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function EstablishmentDetailView({ data }: EstablishmentDetailViewProps) {
  const locationLine = [data.region.name, data.drena.name, data.locality.name]
    .filter(Boolean)
    .join(' · ');

  const contactParts = data.contacts
    ?.split(/[,;/|]/)
    .map((part) => part.trim())
    .filter(Boolean);

  const hasContacts = Boolean(data.email || contactParts?.length);

  const geoPath = [
    { label: 'Région', name: data.region.name },
    { label: 'DREN', name: data.drena.name },
    data.ddena ? { label: 'DDEN', name: data.ddena.name } : null,
    data.department ? { label: 'Département', name: data.department.name } : null,
    { label: 'Localité', name: data.locality.name },
  ].filter((item): item is { label: string; name: string } => Boolean(item));

  return (
    <div className="est-detail">
      <header className="est-detail-hero">
        <div className="est-detail-hero-main">
          <div className="est-detail-hero-icon" aria-hidden="true">
            <School size={36} strokeWidth={1.6} />
          </div>
          <div className="est-detail-hero-copy">
            <p className="est-detail-hero-eyebrow">Établissement scolaire</p>
            <h1 className="est-detail-hero-title">{data.name}</h1>
            <p className="est-detail-hero-location">
              <MapPin size={14} aria-hidden="true" />
              {locationLine}
            </p>
            <p className="est-detail-hero-legend">
              <span>{statusLabel(data.status)}</span>
              {data.teachingOrder ? <span>{teachingOrderLabel(data.teachingOrder)}</span> : null}
              <span>Code {data.establishmentCode}</span>
            </p>
          </div>
        </div>
      </header>

      <section className="est-sheet-section" aria-labelledby="est-id-heading">
        <h2 id="est-id-heading">Identification</h2>
        <dl className="est-sheet-facts">
          <Fact icon={Shield} label="Statut" value={statusLabel(data.status)} />
          <Fact icon={Hash} label="Code" value={data.establishmentCode} />
          <Fact icon={ListOrdered} label="N° de liste" value={displayValue(data.listNumber)} />
          <Fact icon={CalendarDays} label="Mise à jour" value={formatDate(data.updatedAt)} />
        </dl>
      </section>

      <section className="est-sheet-section" aria-labelledby="est-school-heading">
        <h2 id="est-school-heading">Cycles</h2>
        <dl className="est-sheet-facts">
          <Fact icon={GraduationCap} label="Ordre" value={teachingOrderLabel(data.teachingOrder)} />
          <Fact icon={GraduationCap} label="Autorisé" value={displayValue(data.authorizedCycle)} />
          <Fact icon={GraduationCap} label="Reconnu" value={displayValue(data.recognizedCycle)} />
        </dl>
      </section>

      <section className="est-sheet-section" aria-labelledby="est-geo-heading">
        <h2 id="est-geo-heading">Localité</h2>
        <p className="est-geo-line">
          {geoPath.map((place, index) => (
            <span key={`${place.label}-${place.name}`}>
              {index > 0 ? ' · ' : null}
              <em>{place.label}</em> {place.name}
            </span>
          ))}
        </p>
      </section>

      {hasContacts ? (
        <section className="est-sheet-section est-sheet-contacts-block" aria-labelledby="est-contact-heading">
          <h2 id="est-contact-heading">Coordonnées</h2>
          <p className="est-contact-line">
            {data.email ? (
              <a href={`mailto:${data.email}`}>
                <Mail size={14} aria-hidden="true" />
                {data.email}
              </a>
            ) : null}
            {contactParts?.map((contact) => (
              <a key={contact} href={`tel:${contact.replace(/\s+/g, '')}`}>
                <Phone size={14} aria-hidden="true" />
                {contact}
              </a>
            ))}
          </p>
        </section>
      ) : null}

      <EstablishmentRelated establishmentId={data.id} establishmentName={data.name} />
    </div>
  );
}
