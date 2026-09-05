import { exposesAgentsAccess, isAgentsDestinationHref } from '@/config/agents-portal';
import { PortalLink } from '@/components/portal/PortalLink';

type PublicPageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: { src: string; alt: string };
  stats?: { label: string; value: string }[];
  actions?: { label: string; href: string; variant?: 'primary' | 'outline' }[];
  compact?: boolean;
  visualSize?: 'default' | 'large';
};

export function PublicPageHero({
  eyebrow,
  title,
  description,
  image,
  stats,
  actions,
  compact = false,
  visualSize = 'default',
}: PublicPageHeroProps) {
  return (
    <section
      className={`public-hero${compact ? ' public-hero--compact' : ''}`}
      aria-labelledby="public-hero-title"
    >
      <div className="public-hero-inner">
        <div className="public-hero-copy">
          {eyebrow ? <p className="public-hero-eyebrow">{eyebrow}</p> : null}
          <h1 id="public-hero-title">{title}</h1>
          {description ? <p className="public-hero-desc">{description}</p> : null}
          {stats && stats.length > 0 ? (
            <dl className="public-hero-stats">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {actions && actions.length > 0 ? (
            <div className="public-hero-actions">
              {actions
                .filter(
                  (action) =>
                    exposesAgentsAccess() || !isAgentsDestinationHref(action.href),
                )
                .map((action) => (
                <PortalLink
                  key={action.href}
                  href={action.href}
                  className={action.variant === 'outline' ? 'outline-btn' : 'public-hero-btn'}
                >
                  {action.label}
                </PortalLink>
              ))}
            </div>
          ) : null}
        </div>
        {image ? (
          <figure
            className={`public-hero-visual${visualSize === 'large' ? ' public-hero-visual--large' : ''}`}
          >
            <img src={image.src} alt={image.alt} loading="eager" decoding="async" />
          </figure>
        ) : null}
      </div>
    </section>
  );
}
