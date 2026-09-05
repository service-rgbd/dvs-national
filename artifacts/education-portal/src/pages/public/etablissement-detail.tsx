import { Building2, Loader2, Mail, MapPin, Phone } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getGetEstablishmentByIdQueryOptions } from '@workspace/api-client-react';

import { EmptyState } from '@/components/portal/EmptyState';
import { EstablishmentOutingsGallery } from '@/components/portal/EstablishmentOutingsGallery';
import { PublicPage } from '@/components/portal/PublicPage';
import { PublicPageHero } from '@/components/portal/PublicPageHero';
import { publicPageContent } from '@/content/pages';
import { publicRoutes } from '@/content/routes';

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  pending: 'En attente',
  archived: 'Archivé',
};

function cycleLabel(cycle: string | null | undefined): string {
  if (!cycle) return '—';
  if (cycle.includes('1') && cycle.includes('2')) return 'Primaire & secondaire';
  if (cycle.includes('2')) return 'Secondaire';
  if (cycle.includes('1')) return 'Primaire';
  return cycle;
}

export default function EtablissementDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? '';
  const content = publicPageContent.etablissements;

  const { data, isLoading, isError, error, refetch } = useQuery({
    ...getGetEstablishmentByIdQueryOptions(id),
    enabled: Boolean(id),
  });

  if (!id) {
    return (
      <PublicPage
        title="Établissement introuvable"
        breadcrumbs={[{ label: 'Accueil', href: publicRoutes.home }, { label: 'Établissement introuvable' }]}
      >
        <EmptyState title="Identifiant manquant" description="Aucun établissement n'a été spécifié." />
      </PublicPage>
    );
  }

  return (
    <PublicPage
      title={data?.name ?? content.title}
      description={data ? `Code ${data.establishmentCode}` : content.description}
      seoDescription={data ? `${data.name} — ${data.establishmentCode}` : content.seoDescription}
      variant="editorial"
      breadcrumbs={[
        { label: 'Accueil', href: publicRoutes.home },
        { label: content.title, href: publicRoutes.etablissements },
        { label: data?.name ?? 'Fiche établissement' },
      ]}
    >
      {isLoading ? (
        <div className="est-profile-state" role="status">
          <Loader2 className="spin" size={24} aria-hidden="true" />
          Chargement de la fiche…
        </div>
      ) : null}

      {isError ? (
        <EmptyState
          title="Fiche indisponible"
          description={
            error instanceof Error ? error.message : 'Impossible de charger cet établissement.'
          }
          action={
            <div className="empty-state-action-group">
              <button type="button" className="outline-btn" onClick={() => refetch()}>
                Réessayer
              </button>
              <Link href={publicRoutes.etablissements} className="outline-btn">
                Retour à l&apos;annuaire
              </Link>
            </div>
          }
        />
      ) : null}

      {data ? (
        <>
          <PublicPageHero
            eyebrow="Fiche établissement · PNIGVS"
            title={data.name}
            description={`${data.locality.name} · ${data.drena.name} · ${data.region.name}`}
            stats={[
              { value: data.establishmentCode, label: 'Code établissement' },
              { value: cycleLabel(data.authorizedCycle), label: 'Cycle autorisé' },
              { value: STATUS_LABELS[data.status] ?? data.status, label: 'Statut' },
            ]}
            actions={[
              { label: 'Retour à l\'annuaire', href: publicRoutes.etablissements, variant: 'outline' },
              { label: 'Galerie nationale', href: publicRoutes.galerieSorties },
            ]}
          />

          <div className="est-profile-grid">
            <section className="est-profile-block" aria-labelledby="est-id-heading">
              <header className="est-profile-block-head">
                <Building2 size={18} aria-hidden="true" />
                <h2 id="est-id-heading">Identification</h2>
              </header>
              <dl className="est-profile-facts">
                <div>
                  <dt>Code</dt>
                  <dd>
                    <code>{data.establishmentCode}</code>
                  </dd>
                </div>
                <div>
                  <dt>Nom officiel</dt>
                  <dd>{data.name}</dd>
                </div>
                {data.listNumber != null ? (
                  <div>
                    <dt>N° de liste</dt>
                    <dd>{data.listNumber}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Statut</dt>
                  <dd>{STATUS_LABELS[data.status] ?? data.status}</dd>
                </div>
              </dl>
            </section>

            <section className="est-profile-block" aria-labelledby="est-geo-heading">
              <header className="est-profile-block-head">
                <MapPin size={18} aria-hidden="true" />
                <h2 id="est-geo-heading">Périmètre géographique</h2>
              </header>
              <dl className="est-profile-facts">
                <div>
                  <dt>Région</dt>
                  <dd>{data.region.name}</dd>
                </div>
                <div>
                  <dt>DRENA</dt>
                  <dd>{data.drena.name}</dd>
                </div>
                <div>
                  <dt>Localité</dt>
                  <dd>{data.locality.name}</dd>
                </div>
                {data.department ? (
                  <div>
                    <dt>Département</dt>
                    <dd>{data.department.name}</dd>
                  </div>
                ) : null}
                {data.ddena ? (
                  <div>
                    <dt>DDENA</dt>
                    <dd>{data.ddena.name}</dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section className="est-profile-block" aria-labelledby="est-school-heading">
              <header className="est-profile-block-head">
                <h2 id="est-school-heading">Scolarité</h2>
              </header>
              <dl className="est-profile-facts">
                <div>
                  <dt>Ordre d&apos;enseignement</dt>
                  <dd>{data.teachingOrder ?? '—'}</dd>
                </div>
                <div>
                  <dt>Cycle autorisé</dt>
                  <dd>{data.authorizedCycle ?? '—'}</dd>
                </div>
                <div>
                  <dt>Cycle reconnu</dt>
                  <dd>{data.recognizedCycle ?? '—'}</dd>
                </div>
              </dl>
            </section>

            {data.email || data.contacts ? (
              <section className="est-profile-block" aria-labelledby="est-contact-heading">
                <header className="est-profile-block-head">
                  <h2 id="est-contact-heading">Coordonnées</h2>
                </header>
                <dl className="est-profile-facts">
                  {data.email ? (
                    <div>
                      <dt>
                        <Mail size={14} aria-hidden="true" /> E-mail
                      </dt>
                      <dd>
                        <a href={`mailto:${data.email}`}>{data.email}</a>
                      </dd>
                    </div>
                  ) : null}
                  {data.contacts ? (
                    <div>
                      <dt>
                        <Phone size={14} aria-hidden="true" /> Contacts
                      </dt>
                      <dd>{data.contacts}</dd>
                    </div>
                  ) : null}
                </dl>
              </section>
            ) : null}
          </div>

          <EstablishmentOutingsGallery establishmentId={data.id} establishmentName={data.name} />
        </>
      ) : null}
    </PublicPage>
  );
}
