import {
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Users,
} from 'lucide-react';
import { Link } from 'wouter';

import { PublicFeatureGrid } from '@/components/portal/PublicFeatureGrid';
import { PortalLink } from '@/components/portal/PortalLink';
import { PublicPage } from '@/components/portal/PublicPage';
import { PublicPageHero } from '@/components/portal/PublicPageHero';
import { exposesAgentsAccess } from '@/config/agents-portal';
import { pnigvsModules, publicPageContent } from '@/content/pages';
import { publicRoutes } from '@/content/routes';

const discoverModuleHrefs = [
  publicRoutes.activites,
  publicRoutes.statistiques,
  publicRoutes.activites,
  publicRoutes.vieScolaire,
  publicRoutes.contact,
  publicRoutes.contact,
  publicRoutes.statistiques,
  publicRoutes.statistiques,
] as const;

const moduleIcons = [
  Lock,
  LayoutDashboard,
  CalendarDays,
  ClipboardCheck,
  Bell,
  MessageSquare,
  FileText,
  BarChart3,
] as const;

export default function ServicesPage() {
  const content = publicPageContent.services;

  const features = pnigvsModules.map((module, index) => ({
    title: module.title,
    description: module.description,
    icon: moduleIcons[index] ?? CalendarDays,
    href: exposesAgentsAccess()
      ? publicRoutes.espaceAgents
      : discoverModuleHrefs[index] ?? publicRoutes.vieScolaire,
  }));

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
      <PublicPageHero
        eyebrow="Plateforme PNIGVS"
        title="Services numériques de la vie scolaire"
        description="Modules fonctionnels pour la DVS, les DRENA, les établissements et les partenaires institutionnels — de l'authentification au pilotage statistique."
        stats={[
          { value: String(pnigvsModules.length), label: 'Modules métier' },
          { value: 'Sécurisé', label: 'Accès par profil' },
          { value: 'National', label: 'Couverture territoriale' },
        ]}
        actions={[
          { label: 'Se connecter', href: publicRoutes.espaceAgents },
          { label: 'Vie scolaire', href: publicRoutes.vieScolaire, variant: 'outline' },
        ]}
      />

      <section className="public-section" aria-labelledby="services-modules-heading">
        <div className="public-section-head">
          <h2 id="services-modules-heading">Catalogue des modules</h2>
          <p>Chaque service est activé selon le rôle et le périmètre de l&apos;agent connecté.</p>
        </div>
        <PublicFeatureGrid items={features} columns={2} />
      </section>

      {exposesAgentsAccess() ? (
      <section className="public-cta-band" aria-labelledby="services-access-heading">
        <div>
          <p className="public-cta-eyebrow">Accès professionnel</p>
          <h2 id="services-access-heading">Espace agents sécurisé</h2>
          <p>
            L&apos;application métier PNIGVS est accessible via l&apos;espace agents, avec
            authentification et gestion des rôles selon le cahier des charges.
          </p>
        </div>
        <div className="public-cta-actions">
          <PortalLink href={publicRoutes.espaceAgents} className="public-hero-btn">
            <Users size={16} aria-hidden="true" /> Se connecter
          </PortalLink>
          <Link href={publicRoutes.documents} className="outline-btn">
            Documents publics
          </Link>
        </div>
      </section>
      ) : null}

      <nav className="public-quick-links" aria-label="Liens utiles">
        <Link href={publicRoutes.etablissements} className="public-quick-link">
          Annuaire des établissements
        </Link>
        <Link href={publicRoutes.statistiques} className="public-quick-link">
          Statistiques publiques
        </Link>
        <Link href={publicRoutes.contact} className="public-quick-link">
          Contacter la DVS
        </Link>
      </nav>
    </PublicPage>
  );
}
