import { ArrowRight, BookOpen, Facebook, Instagram, Sparkles, Youtube } from 'lucide-react';
import { Link } from 'wouter';

import { ArrowLink } from '@/components/portal/ArrowLink';
import { isDiscoverPortalSurface } from '@/config/agents-portal';
import { BreakingNewsTicker } from '@/components/portal/BreakingNewsTicker';
import { EstablishmentHomeCard } from '@/components/portal/EstablishmentHomeCard';
import { EditorialArticleGrid } from '@/components/portal/EditorialArticleGrid';
import { EditorialSectionTitle } from '@/components/portal/EditorialSectionTitle';
import { Visual } from '@/components/portal/Visual';
import {
  contactSection,
  establishmentsSection,
  experiencesSection,
  heroContent,
  newsSection,
  outingsSection,
  seasonalSection,
  servicesSection,
  staffSection,
} from '@/content';
import { publicRoutes } from '@/content/routes';
import { usePageSeo } from '@/hooks/use-page-seo';
import { siteSeo } from '@/content/seo';
import { useListEstablishments } from '@workspace/api-client-react';

export default function HomePage() {
  usePageSeo({ title: siteSeo.title, description: siteSeo.description });

  const { data: establishmentsData } = useListEstablishments({
    page: 1,
    pageSize: establishmentsSection.previewCount,
    status: 'active',
    sort: 'name',
    order: 'asc',
  });

  const previewEstablishments = establishmentsData?.data ?? [];

  return (
    <>
      <section className="hero-wrap" aria-labelledby="hero-title">
        <div className="container hero">
          <div className="hero-copy">
            <div className="eyebrow">{heroContent.eyebrow}</div>
            <h1 id="hero-title" data-testid="text-hero-title">
              {heroContent.title}
            </h1>
            <p>{heroContent.description}</p>
            <Link className="outline-btn" href={heroContent.ctaHref} data-testid="link-hero-article">
              {heroContent.ctaLabel} <BookOpen size={18} aria-hidden="true" />
            </Link>
          </div>
          <Visual variant="hero" caption={heroContent.visualCaption} alt={heroContent.visualAlt} />
        </div>
      </section>

      <BreakingNewsTicker items={newsSection.items} />

      <section className="container editorial-news-section" aria-labelledby="news-title">
        <div className="section-heading editorial-section-heading">
          <EditorialSectionTitle title={newsSection.title} id="news-title" />
          <Link className="accent-link" href={newsSection.viewAllHref} data-testid="link-all-news">
            {newsSection.viewAllLabel}
          </Link>
        </div>
        <EditorialArticleGrid items={newsSection.items} testIdPrefix="news" />
      </section>

      <section className="outings-section" id={outingsSection.id} aria-labelledby="outings-title">
        <div className="container">
          <div className="section-heading">
            <div>
              <div className="eyebrow">{outingsSection.eyebrow}</div>
              <h2 id="outings-title" data-testid="heading-outings">
                {outingsSection.title}
              </h2>
              <p>{outingsSection.description}</p>
            </div>
            <Link className="accent-link" href={outingsSection.viewAllHref} data-testid="link-all-outings">
              {outingsSection.viewAllLabel}
            </Link>
          </div>
          <div className="outings-collage" data-testid="gallery-outings">
            <figure className="outings-collage-main">
              <img
                src={outingsSection.heroImage.src}
                alt={outingsSection.heroImage.alt}
                loading="lazy"
                data-testid="img-outings-hero"
              />
            </figure>
            {outingsSection.photos.map((photo, index) => (
              <Link
                className={`outings-collage-item outings-collage-item--${index + 1}`}
                href={outingsSection.viewAllHref}
                key={photo.src}
                data-testid={`link-outing-photo-${index}`}
              >
                <img src={photo.src} alt={photo.alt} loading="lazy" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        className="establishments-home-section"
        id={establishmentsSection.id}
        aria-labelledby="establishments-home-title"
      >
        <div className="container">
          <div className="section-heading editorial-section-heading">
            <div>
              <EditorialSectionTitle
                title={establishmentsSection.title}
                id="establishments-home-title"
              />
              <p className="establishments-home-desc">{establishmentsSection.description}</p>
            </div>
            <Link className="accent-link" href={establishmentsSection.viewAllHref}>
              {establishmentsSection.viewAllLabel}
            </Link>
          </div>
          {previewEstablishments.length > 0 ? (
            <div className="est-home-grid">
              {previewEstablishments.map((establishment, index) => (
                <EstablishmentHomeCard
                  key={establishment.id}
                  establishment={establishment}
                  testId={`card-establishment-${index}`}
                />
              ))}
            </div>
          ) : (
            <p className="est-home-empty">
              L&apos;annuaire national sera affiché ici dès que le référentiel est disponible.
            </p>
          )}
        </div>
      </section>

      <section className="services-section" id="services" aria-labelledby="services-title">
        <div className="container">
          <div className="section-heading">
            <h2 id="services-title" data-testid="heading-services">
              {servicesSection.title}
            </h2>
            <p>{servicesSection.description}</p>
          </div>
          <div className="service-grid">
            {servicesSection.items.map(({ title, icon: Icon, href }, index) => (
              <Link className="service-card" href={href} key={title} data-testid={`card-service-${index}`}>
                <Icon aria-hidden="true" />
                <strong>{title}</strong>
                <ArrowRight size={19} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container" id={seasonalSection.id} aria-labelledby="rentree-title">
        <div className="section-heading">
          <h2 id="rentree-title" data-testid="heading-rentree">
            {seasonalSection.title}
          </h2>
          <Link className="accent-link" href={seasonalSection.viewAllHref} data-testid="link-all-rentree">
            {seasonalSection.viewAllLabel}
          </Link>
        </div>
        <div className="rentrée-grid">
          {seasonalSection.items.map((item, index) => (
            <article
              className={`rentrée-card ${!item.image ? 'simple' : ''}`}
              key={item.title}
              data-testid={`card-rentree-${index}`}
            >
              {item.image && (
                <div
                  className={`mini-visual ${item.image}`}
                  role="img"
                  aria-label="Illustration de la rentrée scolaire"
                />
              )}
              <div className="news-body">
                <h3>
                  <Link href={item.href} data-testid={`link-rentree-${index}`}>
                    {item.title}
                  </Link>
                </h3>
                <p>{item.text}</p>
                <ArrowLink href={item.href} testId={`link-rentree-action-${index}`}>
                  Accéder à la démarche
                </ArrowLink>
              </div>
            </article>
          ))}
        </div>
      </section>

      {!isDiscoverPortalSurface() ? (
      <section className="people-section" aria-labelledby="people-title">
        <div className="container">
          <div className="section-heading">
            <h2 id="people-title" data-testid="heading-people">
              {staffSection.title}
            </h2>
            <p>{staffSection.description}</p>
          </div>
          <div className="people-grid">
            <article className="people-feature">
              <Visual
                variant="people"
                caption={staffSection.feature.visualCaption}
                alt={staffSection.feature.visualAlt}
              />
              <div className="news-body">
                <p className="people-feature-eyebrow">Espace agents PNIGVS</p>
                <h3>{staffSection.feature.title}</h3>
                <p>{staffSection.feature.text}</p>
                <ArrowLink href={staffSection.feature.ctaHref} testId="link-rh-adviser">
                  {staffSection.feature.ctaLabel}
                </ArrowLink>
              </div>
            </article>
            <div className="people-categories">
              {staffSection.categories.map((category) => (
                <div className="people-category" key={category.id}>
                  <div className="people-category-head">
                    <h3>{category.title}</h3>
                  </div>
                  <ul className="people-category-links">
                    {category.links.map((title, index) => (
                      <li key={title}>
                        <Link
                          className="people-category-link"
                          href={publicRoutes.espaceAgents}
                          data-testid={`card-people-${category.id}-${index}`}
                        >
                          {title}
                          <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      ) : null}

      <section className="experiences" id="experiences" aria-labelledby="experiences-title">
        <div className="container">
          <div className="section-heading">
            <div>
              <div className="eyebrow">{experiencesSection.eyebrow}</div>
              <h2 id="experiences-title" data-testid="heading-experiences">
                {experiencesSection.title}
              </h2>
            </div>
            <p>{experiencesSection.description}</p>
          </div>
          <div className="experience-grid">
            {experiencesSection.items.map((item, index) => (
              <article className="experience-card" key={item.title} data-testid={`card-experience-${index}`}>
                <Sparkles size={21} aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <ArrowLink href={item.href} testId={`link-experience-${index}`}>
                  Découvrir le projet
                </ArrowLink>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact" aria-labelledby="contact-title">
        <div className="container contact-grid">
          <div>
            <h2 id="contact-title" data-testid="heading-contact">
              {contactSection.title}
            </h2>
            <p>{contactSection.description}</p>
          </div>
          <div className="contact-links">
            {contactSection.links.map((item, index) => (
              <Link href={publicRoutes.contact} key={item} data-testid={`link-contact-${index}`}>
                {item}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
        <div className="container social">
          <h2>{contactSection.socialTitle}</h2>
          <div className="social-links">
            {contactSection.socialNetworks.map((network) => (
              <Link href={publicRoutes.contact} key={network.id} data-testid={`link-social-${network.id}`}>
                {network.id === 'facebook' && <Facebook size={18} aria-hidden="true" />}
                {network.id === 'instagram' && <Instagram size={18} aria-hidden="true" />}
                {network.id === 'youtube' && <Youtube size={18} aria-hidden="true" />}
                {network.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
