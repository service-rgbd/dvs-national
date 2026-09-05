import { Building2, FileText, Loader2 } from 'lucide-react';
import { Link } from 'wouter';

import { PublicPage } from '@/components/portal/PublicPage';
import { PublicPageStrip } from '@/components/portal/PublicPageStrip';
import { PublicStatisticsCharts } from '@/components/portal/PublicStatisticsCharts';
import { publicPageContent } from '@/content/pages';
import { publicRoutes } from '@/content/routes';
import { statistiquesPageContent } from '@/content/statistiques-page';
import { useGetPublicStatistics } from '@workspace/api-client-react';

export default function StatistiquesPage() {
  const content = publicPageContent.statistiques;
  const page = statistiquesPageContent;
  const { data, isLoading, isError, refetch } = useGetPublicStatistics();

  const stripSummary =
    data && !isLoading
      ? `${page.stripSummary} · ${data.establishments.toLocaleString('fr-FR')} référencés · ${data.establishmentsActive.toLocaleString('fr-FR')} actifs`
      : page.stripSummary;

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
      <PublicPageStrip title={page.stripTitle} summary={stripSummary} />

      <section className="public-section" aria-labelledby="public-stats-heading">
        <div className="public-section-head editorial-section-heading">
          <h2 id="public-stats-heading">Indicateurs nationaux</h2>
        </div>

        {isLoading ? (
          <div className="public-inline-status" role="status">
            <Loader2 className="animate-spin" aria-hidden="true" />
            Chargement des indicateurs…
          </div>
        ) : null}

        {isError ? (
          <div className="public-inline-alert" role="alert">
            <p>Statistiques indisponibles pour le moment.</p>
            <button type="button" className="outline-btn" onClick={() => refetch()}>
              Réessayer
            </button>
          </div>
        ) : null}

        {data && !isLoading ? (
          <>
            <p className="public-one-line-hint">
              Référentiel national PNIGVS — {data.establishments.toLocaleString('fr-FR')} établissements
              référencés, {data.establishmentsActive.toLocaleString('fr-FR')} actifs · mise à jour{' '}
              {new Date(data.updatedAt).toLocaleString('fr-FR', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </p>

            <PublicStatisticsCharts
              establishments={data.establishments}
              establishmentsActive={data.establishmentsActive}
            />
          </>
        ) : null}
      </section>

      <nav className="public-quick-links public-quick-links--inline" aria-label="Liens complémentaires">
        <Link href={publicRoutes.etablissements} className="public-quick-link">
          <Building2 size={16} aria-hidden="true" />
          Annuaire des établissements
        </Link>
        <Link href={publicRoutes.documents} className="public-quick-link">
          <FileText size={16} aria-hidden="true" />
          Rapports et documents publics
        </Link>
      </nav>
    </PublicPage>
  );
}
