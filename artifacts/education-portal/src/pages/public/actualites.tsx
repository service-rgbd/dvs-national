import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

import { BreakingNewsTicker } from '@/components/portal/BreakingNewsTicker';
import { EditorialArticleGrid } from '@/components/portal/EditorialArticleGrid';
import { EditorialSectionTitle } from '@/components/portal/EditorialSectionTitle';
import { PublicPage } from '@/components/portal/PublicPage';
import { PublicPageStrip } from '@/components/portal/PublicPageStrip';
import { actualitesPageContent } from '@/content/actualites';
import { newsSection } from '@/content/homepage';
import { publicPageContent } from '@/content/pages';
import { publicRoutes } from '@/content/routes';

export default function ActualitesPage() {
  const content = publicPageContent.actualites;
  const page = actualitesPageContent;

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
      <PublicPageStrip title={page.stripTitle} summary={page.stripSummary} />

      <BreakingNewsTicker items={newsSection.items} />

      <div className="actualites-layout">
        <main className="actualites-main">
          <section className="public-section editorial-news-section" aria-labelledby="actualites-grid-heading">
            <div className="public-section-head editorial-section-heading">
              <EditorialSectionTitle title="Fil d'actualités" id="actualites-grid-heading" />
            </div>
            <EditorialArticleGrid items={newsSection.items} testIdPrefix="actualite" />
          </section>

          <section className="actualites-info" aria-labelledby="actualites-info-heading">
            <h2 id="actualites-info-heading" className="actualites-info-title">
              Informations
            </h2>
            <div className="actualites-info-grid">
              {page.infoBlocks.map((block) => (
                <article className="actualites-info-block" key={block.title}>
                  <h3>{block.title}</h3>
                  <ul>
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        </main>

        <aside className="actualites-spots" aria-labelledby="actualites-spots-heading">
          <h2 id="actualites-spots-heading" className="actualites-spots-title">
            {page.spotsTitle}
          </h2>
          <ul className="actualites-spots-list">
            {page.spots.map((spot) => (
              <li key={spot.id}>
                <Link href={spot.href} className="actualites-spot">
                  <span className="actualites-spot-tag">{spot.tag}</span>
                  <strong>{spot.title}</strong>
                  <p>{spot.text}</p>
                  <span className="actualites-spot-link">
                    Accéder <ArrowRight size={14} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </PublicPage>
  );
}
