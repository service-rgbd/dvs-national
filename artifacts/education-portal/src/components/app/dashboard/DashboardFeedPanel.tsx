import type { ReactNode } from 'react';

import { AppResourceLink } from '@/components/app/navigation/AppResourceLink';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

type DashboardFeedPanelProps = {
  title: string;
  headingId: string;
  emptyMessage?: string;
  footerHref: string;
  footerLabel: string;
  children: ReactNode;
  isEmpty?: boolean;
};

export function DashboardFeedPanel({
  title,
  headingId,
  emptyMessage = 'Aucun élément.',
  footerHref,
  footerLabel,
  children,
  isEmpty = false,
}: DashboardFeedPanelProps) {
  return (
    <section className="dash-feed-panel" aria-labelledby={headingId}>
      <header className="dash-feed-panel-head">
        <h2 id={headingId}>{title}</h2>
      </header>
      <div className="dash-feed-panel-body">
        {isEmpty ? <p className="dash-feed-empty">{emptyMessage}</p> : children}
      </div>
      <footer className="dash-feed-panel-foot">
        <Link href={footerHref} className="dash-feed-panel-link">
          {footerLabel}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </footer>
    </section>
  );
}

type DashboardFeedRowProps = {
  title: string;
  meta?: string;
  date: string;
  badge?: ReactNode;
  href?: string;
  action?: ReactNode;
  onPrefetch?: () => void;
  onNavigate?: () => void;
  ariaLabel?: string;
};

export function DashboardFeedRow({
  title,
  meta,
  date,
  badge,
  href,
  action,
  onPrefetch,
  onNavigate,
  ariaLabel,
}: DashboardFeedRowProps) {
  const content = (
    <>
      <div className="dash-feed-row-main">
        {badge ? <div className="dash-feed-row-badge">{badge}</div> : null}
        <strong className="dash-feed-row-title">{title}</strong>
        {meta ? <p className="dash-feed-row-meta">{meta}</p> : null}
      </div>
      <div className="dash-feed-row-aside">
        <time className="dash-feed-row-date">{date}</time>
        {action}
      </div>
    </>
  );

  if (href) {
    return (
      <AppResourceLink
        href={href}
        className="dash-feed-row dash-feed-row--link"
        prefetch={onPrefetch}
        onNavigate={onNavigate}
        ariaLabel={ariaLabel ?? title}
      >
        {content}
      </AppResourceLink>
    );
  }

  return <div className="dash-feed-row">{content}</div>;
}
