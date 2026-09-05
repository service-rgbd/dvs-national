import {
  BookOpen,
  Building2,
  CalendarClock,
  Hash,
  Mail,
  MapPin,
  Phone,
  School,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { EstablishmentDetail } from '@workspace/api-client-react';

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

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
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

function DetailField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="est-detail-field">
      <span className="est-detail-field-label">{label}</span>
      <span
        className={`est-detail-field-value${mono ? ' est-detail-field-value--mono' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  headingId,
  children,
  className,
}: {
  title: string;
  icon: ReactNode;
  headingId: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`est-detail-card${className ? ` ${className}` : ''}`}
      aria-labelledby={headingId}
    >
      <header className="est-detail-card-head">
        <span className="est-detail-card-icon" aria-hidden="true">
          {icon}
        </span>
        <h2 id={headingId}>{title}</h2>
      </header>
      <div className="est-detail-card-body">{children}</div>
    </section>
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

  return (
    <div className="est-detail">
      <header className="est-detail-hero">
        <div className="est-detail-hero-main">
          <div className="est-detail-hero-icon" aria-hidden="true">
            <Building2 size={28} strokeWidth={1.75} />
          </div>
          <div className="est-detail-hero-copy">
            <p className="est-detail-hero-eyebrow">Fiche établissement scolaire</p>
            <h1 className="est-detail-hero-title">{data.name}</h1>
            <p className="est-detail-hero-location">
              <MapPin size={14} aria-hidden="true" />
              {locationLine}
            </p>
          </div>
        </div>

        <div className="est-detail-hero-meta">
          <span className={`est-detail-status est-detail-status--${data.status}`}>
            {statusLabel(data.status)}
          </span>
          {data.teachingOrder ? (
            <span className="est-detail-chip">{teachingOrderLabel(data.teachingOrder)}</span>
          ) : null}
          <code className="est-detail-code">{data.establishmentCode}</code>
        </div>
      </header>

      <div className="est-detail-stat-bar" role="list">
        <div className="est-detail-stat" role="listitem">
          <span className="est-detail-stat-label">
            <Hash size={14} aria-hidden="true" /> Code
          </span>
          <strong className="est-detail-stat-value">{data.establishmentCode}</strong>
        </div>
        <div className="est-detail-stat" role="listitem">
          <span className="est-detail-stat-label">
            <School size={14} aria-hidden="true" /> N° liste
          </span>
          <strong className="est-detail-stat-value">
            {data.listNumber != null ? data.listNumber : '—'}
          </strong>
        </div>
        <div className="est-detail-stat" role="listitem">
          <span className="est-detail-stat-label">
            <BookOpen size={14} aria-hidden="true" /> Cycle autorisé
          </span>
          <strong className="est-detail-stat-value">
            {displayValue(data.authorizedCycle)}
          </strong>
        </div>
        <div className="est-detail-stat" role="listitem">
          <span className="est-detail-stat-label">
            <CalendarClock size={14} aria-hidden="true" /> Dernière MAJ
          </span>
          <strong className="est-detail-stat-value">{formatDate(data.updatedAt)}</strong>
        </div>
      </div>

      <div className="est-detail-grid">
        <div className="est-detail-main">
          <SectionCard
            title="Identification"
            icon={<Building2 size={18} />}
            headingId="est-id-heading"
          >
            <div className="est-detail-fields">
              <DetailField label="Nom officiel" value={data.name} />
              <DetailField
                label="Code établissement"
                value={<code>{data.establishmentCode}</code>}
                mono
              />
              <DetailField
                label="Numéro de liste"
                value={displayValue(data.listNumber)}
                mono
              />
              <DetailField
                label="Statut administratif"
                value={
                  <span className={`est-detail-status est-detail-status--${data.status}`}>
                    {statusLabel(data.status)}
                  </span>
                }
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Scolarité & cycles"
            icon={<BookOpen size={18} />}
            headingId="est-school-heading"
          >
            <div className="est-detail-fields est-detail-fields--cycles">
              <DetailField
                label="Ordre d'enseignement"
                value={teachingOrderLabel(data.teachingOrder)}
              />
              <DetailField
                label="Cycle autorisé"
                value={
                  data.authorizedCycle ? (
                    <span className="est-detail-cycle">{data.authorizedCycle}</span>
                  ) : (
                    '—'
                  )
                }
              />
              <DetailField
                label="Cycle reconnu"
                value={
                  data.recognizedCycle ? (
                    <span className="est-detail-cycle est-detail-cycle--muted">
                      {data.recognizedCycle}
                    </span>
                  ) : (
                    '—'
                  )
                }
              />
            </div>
          </SectionCard>

          {(data.sourceFile || data.sourceSheet) && (
            <SectionCard
              title="Traçabilité référentiel"
              icon={<Hash size={18} />}
              headingId="est-source-heading"
              className="est-detail-card--muted"
            >
              <div className="est-detail-fields">
                {data.sourceFile ? (
                  <DetailField label="Fichier source" value={data.sourceFile} mono />
                ) : null}
                {data.sourceSheet ? (
                  <DetailField label="Feuille source" value={data.sourceSheet} mono />
                ) : null}
                <DetailField label="Créé le" value={formatDate(data.createdAt)} />
                <DetailField label="Mis à jour le" value={formatDate(data.updatedAt)} />
              </div>
            </SectionCard>
          )}
        </div>

        <aside className="est-detail-aside">
          <SectionCard
            title="Périmètre géographique"
            icon={<MapPin size={18} />}
            headingId="est-geo-heading"
          >
            <ol className="est-detail-geo-path">
              <li>
                <span>Région</span>
                <strong>{data.region.name}</strong>
                {data.region.code ? (
                  <code className="est-detail-geo-code">{data.region.code}</code>
                ) : null}
              </li>
              <li>
                <span>DRENA</span>
                <strong>{data.drena.name}</strong>
                {data.drena.code ? (
                  <code className="est-detail-geo-code">{data.drena.code}</code>
                ) : null}
              </li>
              {data.ddena ? (
                <li>
                  <span>DDENA</span>
                  <strong>{data.ddena.name}</strong>
                  {data.ddena.code ? (
                    <code className="est-detail-geo-code">{data.ddena.code}</code>
                  ) : null}
                </li>
              ) : null}
              {data.department ? (
                <li>
                  <span>Département</span>
                  <strong>{data.department.name}</strong>
                  {data.department.code ? (
                    <code className="est-detail-geo-code">{data.department.code}</code>
                  ) : null}
                </li>
              ) : null}
              <li>
                <span>Localité</span>
                <strong>{data.locality.name}</strong>
              </li>
            </ol>
          </SectionCard>

          {(data.email || contactParts?.length) && (
            <SectionCard
              title="Coordonnées"
              icon={<Mail size={18} />}
              headingId="est-contact-heading"
            >
              <ul className="est-detail-contact-list">
                {data.email ? (
                  <li>
                    <a href={`mailto:${data.email}`} className="est-detail-contact-link">
                      <Mail size={16} aria-hidden="true" />
                      <span>
                        <span className="est-detail-contact-type">E-mail</span>
                        {data.email}
                      </span>
                    </a>
                  </li>
                ) : null}
                {contactParts?.map((contact) => (
                  <li key={contact}>
                    <a
                      href={`tel:${contact.replace(/\s+/g, '')}`}
                      className="est-detail-contact-link"
                    >
                      <Phone size={16} aria-hidden="true" />
                      <span>
                        <span className="est-detail-contact-type">Téléphone</span>
                        {contact}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
        </aside>
      </div>
    </div>
  );
}
