import { Link } from 'wouter';

import type { NewsItem } from '@/content/homepage';

function formatNewsDate(value: string): string {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

type EditorialArticleGridProps = {
  items: NewsItem[];
  testIdPrefix?: string;
};

export function EditorialArticleGrid({ items, testIdPrefix = 'article' }: EditorialArticleGridProps) {
  return (
    <div className="editorial-articles-grid" role="list">
      {items.map((item, index) => (
        <article
          className="editorial-article-card"
          key={item.title}
          role="listitem"
          data-testid={`card-${testIdPrefix}-${index}`}
        >
          <Link
            href={item.href}
            className="editorial-article-link"
            data-testid={`link-${testIdPrefix}-${index}`}
          >
            <div
              className={`editorial-article-thumb ${item.image ?? item.tag.toLowerCase()}`}
              aria-hidden="true"
            />
            <div className="editorial-article-body">
              <span className="editorial-article-tag">{item.tag}</span>
              <h3>{item.title}</h3>
              {item.date ? (
                <time className="editorial-article-date" dateTime={item.date}>
                  {formatNewsDate(item.date)}
                </time>
              ) : null}
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
