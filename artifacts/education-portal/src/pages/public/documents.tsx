import { useState } from 'react';
import { ArrowRight, FileText, Loader2 } from 'lucide-react';
import { Link } from 'wouter';

import { DocumentList } from '@/components/app/DocumentList';
import { PublicPage } from '@/components/portal/PublicPage';
import { PublicPageStrip } from '@/components/portal/PublicPageStrip';
import {
  DOCUMENT_CATEGORY_LABELS,
  documentCategories,
  type DocumentCategory,
} from '@/config/document-labels';
import { documentsPageContent } from '@/content/documents-page';
import { publicPageContent } from '@/content/pages';
import { publicRoutes } from '@/content/routes';
import { useListPublicDocuments } from '@workspace/api-client-react';

export default function DocumentsPage() {
  const content = publicPageContent.documents;
  const page = documentsPageContent;
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | ''>('');

  const { data, isLoading, isError, refetch } = useListPublicDocuments({
    page: 1,
    pageSize: 30,
    category: categoryFilter || undefined,
  });

  const documents = data?.data ?? [];
  const categoryHint =
    page.categorySummary[categoryFilter] ?? page.categorySummary[''];

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

      <div className="documents-layout">
        <main className="documents-main">
          <section className="public-section" aria-labelledby="public-docs-heading">
            <div className="public-section-head editorial-section-heading">
              <h2 id="public-docs-heading">
                <FileText size={18} aria-hidden="true" /> Bibliothèque documentaire
              </h2>
            </div>

            <div className="public-filter-row public-filter-row--compact" role="tablist" aria-label="Filtrer par catégorie">
              <button
                type="button"
                role="tab"
                aria-selected={categoryFilter === ''}
                className={categoryFilter === '' ? 'public-filter-pill is-active' : 'public-filter-pill'}
                onClick={() => setCategoryFilter('')}
              >
                Tous
              </button>
              {documentCategories.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={categoryFilter === item}
                  className={categoryFilter === item ? 'public-filter-pill is-active' : 'public-filter-pill'}
                  onClick={() => setCategoryFilter(item)}
                >
                  {DOCUMENT_CATEGORY_LABELS[item]}
                </button>
              ))}
            </div>

            <p className="public-one-line-hint">{categoryHint}</p>

            {isLoading ? (
              <div className="public-inline-status" role="status">
                <Loader2 className="animate-spin" aria-hidden="true" />
                Chargement de la bibliothèque…
              </div>
            ) : null}

            {isError ? (
              <div className="public-inline-alert" role="alert">
                <p>La bibliothèque documentaire est momentanément indisponible.</p>
                <button type="button" className="outline-btn" onClick={() => refetch()}>
                  Réessayer
                </button>
              </div>
            ) : null}

            {!isLoading && !isError ? (
              <DocumentList
                documents={documents}
                emptyTitle="Aucun document public pour le moment"
                emptyDescription="Les circulaires et rapports officiels seront publiés ici dès leur mise à disposition par la DVS."
              />
            ) : null}
          </section>
        </main>

        <aside className="documents-spots" aria-labelledby="documents-spots-heading">
          <h2 id="documents-spots-heading" className="documents-spots-title">
            Ressources liées
          </h2>
          <ul className="documents-spots-list">
            {page.spots.map((spot) => (
              <li key={spot.id}>
                <Link href={spot.href} className="documents-spot">
                  <span className="documents-spot-tag">{spot.tag}</span>
                  <strong>{spot.title}</strong>
                  <span className="documents-spot-text">{spot.text}</span>
                  <span className="documents-spot-link">
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
