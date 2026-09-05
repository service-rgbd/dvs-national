import { Link } from 'wouter';

import type { NewsItem } from '@/content/homepage';

type BreakingNewsTickerProps = {
  items: Pick<NewsItem, 'title' | 'href'>[];
};

export function BreakingNewsTicker({ items }: BreakingNewsTickerProps) {
  if (items.length === 0) return null;

  const loopItems = [...items, ...items];

  return (
    <section className="breaking-news" aria-label="Dernière minute">
      <div className="breaking-news-inner">
        <p className="breaking-news-label">Dernière minute</p>
        <div className="breaking-news-viewport">
          <div className="breaking-news-track" aria-live="off">
            {loopItems.map((item, index) => (
              <span className="breaking-news-item" key={`${item.title}-${index}`}>
                <Link href={item.href}>{item.title}</Link>
                <span className="breaking-news-sep" aria-hidden="true">
                  ·
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
