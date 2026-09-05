import { ExternalLink } from 'lucide-react';
import { Link } from 'wouter';

import { PublicPage } from '@/components/portal/PublicPage';
import { PublicPageStrip } from '@/components/portal/PublicPageStrip';
import { institution } from '@/config/institution';
import { ministerePageContent } from '@/content/ministere-page';
import { publicPageContent } from '@/content/pages';
import { publicRoutes } from '@/content/routes';

export default function MinisterePage() {
  const content = publicPageContent.ministere;
  const page = ministerePageContent;

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

      <div className="ministere-page">
        <section className="ministere-chain" aria-label="Chaîne institutionnelle">
          <ol className="ministere-chain-list">
            {page.hierarchy.map((item, index) => (
              <li key={item.id} className="ministere-chain-item">
                <span className="ministere-chain-step" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="ministere-chain-body">
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="ministere-block" aria-labelledby="ministere-mena-heading">
          <h2 id="ministere-mena-heading">{institution.ministry.fullName}</h2>
          <p className="public-one-line-hint">
            Autorité de tutelle · {institution.republic}
          </p>
          <ul className="public-check-list">
            {page.ministry.missions.map((mission) => (
              <li key={mission}>{mission}</li>
            ))}
          </ul>
          <a
            className="ministere-external-link"
            href={page.ministry.website}
            target="_blank"
            rel="noopener noreferrer"
          >
            Site officiel du ministère
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </section>

        <section className="ministere-block ministere-block--dvs" aria-labelledby="ministere-dvs-heading">
          <h2 id="ministere-dvs-heading">{institution.direction.fullName}</h2>
          <p className="public-one-line-hint">
            {institution.direction.role} · Directeur : {page.dvs.director}
          </p>
          <ul className="public-check-list">
            {page.dvs.missions.map((mission) => (
              <li key={mission}>{mission}</li>
            ))}
          </ul>
          <Link href={publicRoutes.contact} className="ministere-inline-link">
            Coordonnées et localisation DVS →
          </Link>
        </section>

        <section className="ministere-block" aria-labelledby="ministere-pnigvs-heading">
          <h2 id="ministere-pnigvs-heading">{institution.platform.fullName}</h2>
          <p className="public-one-line-hint">
            {institution.platform.tagline} · {page.platform.meta}
          </p>
          <p className="ministere-lead">{institution.platform.description}</p>
        </section>

        <nav className="public-quick-links public-quick-links--inline" aria-label="Liens institutionnels">
          {page.footerLinks.map((link) => (
            <Link href={link.href} className="public-quick-link" key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </PublicPage>
  );
}
