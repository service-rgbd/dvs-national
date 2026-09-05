import { useEffect, useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { useLocation } from 'wouter';

import { EmptyState } from '@/components/portal/EmptyState';
import { PublicPage } from '@/components/portal/PublicPage';
import { searchContent } from '@/content/homepage';
import { publicPageContent } from '@/content/pages';
import { publicRoutes } from '@/content/routes';

export default function RecherchePage() {
  const content = publicPageContent.recherche;
  const [location, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') ?? '';
    setQuery(q);
    setSubmitted(Boolean(q));
  }, [location]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    setSubmitted(true);
    setLocation(trimmed ? `${publicRoutes.recherche}?q=${encodeURIComponent(trimmed)}` : publicRoutes.recherche);
  };

  return (
    <PublicPage
      title={content.title}
      description={content.description}
      seoDescription={content.seoDescription}
      breadcrumbs={[
        { label: 'Accueil', href: publicRoutes.home },
        { label: content.title },
      ]}
      variant="narrow"
    >
      <form className="search-form search-form-page" onSubmit={handleSubmit} role="search">
        <label htmlFor="page-search">{searchContent.label}</label>
        <input
          id="page-search"
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSubmitted(false);
          }}
          placeholder={searchContent.placeholder}
          data-testid="input-page-search"
        />
        <button type="submit" aria-label={searchContent.submitAriaLabel} data-testid="button-page-search">
          <Search size={20} aria-hidden="true" />
        </button>
      </form>

      {submitted && (
        <div className="search-result" role="status" data-testid="status-page-search-results">
          {query.trim() ? searchContent.resultsMessage(query.trim()) : searchContent.emptyMessage}
        </div>
      )}

      {!submitted && (
        <EmptyState
          title="Recherche sur le portail PNIGVS"
          description="Saisissez un terme pour lancer une recherche. La recherche avancée sera connectée à l'API PNIGVS lors de la mise en service de l'annuaire et des contenus indexés."
        />
      )}
    </PublicPage>
  );
}
