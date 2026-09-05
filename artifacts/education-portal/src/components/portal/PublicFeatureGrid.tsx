import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { exposesAgentsAccess, isAgentsDestinationHref } from '@/config/agents-portal';
import { PortalLink } from '@/components/portal/PortalLink';

export type PublicFeatureItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
};

type PublicFeatureGridProps = {
  items: PublicFeatureItem[];
  columns?: 2 | 3;
};

export function PublicFeatureGrid({ items, columns = 3 }: PublicFeatureGridProps) {
  return (
    <ul className={`public-feature-list public-feature-list--${columns}`}>
      {items
        .filter((item) => !item.href || exposesAgentsAccess() || !isAgentsDestinationHref(item.href))
        .map((item) => {
        const Icon = item.icon;
        const inner = (
          <>
            <span className="public-feature-icon" aria-hidden="true">
              <Icon size={20} strokeWidth={1.75} />
            </span>
            <span className="public-feature-copy">
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </span>
            {item.href ? <ArrowRight size={16} className="public-feature-arrow" aria-hidden="true" /> : null}
          </>
        );

        return (
          <li key={item.title}>
            {item.href ? (
              <PortalLink className="public-feature-row" href={item.href}>
                {inner}
              </PortalLink>
            ) : (
              <div className="public-feature-row">{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
