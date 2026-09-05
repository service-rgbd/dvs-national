import {
  BarChart3,
  CalendarDays,
  Camera,
  ClipboardCheck,
  FileText,
  Shield,
  Users,
} from 'lucide-react';
import { Link } from 'wouter';

import { PublicFeatureGrid } from '@/components/portal/PublicFeatureGrid';
import { PortalLink } from '@/components/portal/PortalLink';
import { PublicPage } from '@/components/portal/PublicPage';
import { PublicPageHero } from '@/components/portal/PublicPageHero';
import { PublicWorkflowTimeline } from '@/components/portal/PublicWorkflowTimeline';
import { exposesAgentsAccess } from '@/config/agents-portal';
import { activityTypes, authorizationWorkflow } from '@/config/roles';
import { featuredOutingAlbum } from '@/content/featured-outings';
import { publicPageContent, vieScolaireModules } from '@/content/pages';
import { publicRoutes } from '@/content/routes';

export default function VieScolairePage() {
  const content = publicPageContent.vieScolaire;

  const features = [
    {
      title: 'Activités scolaires',
      description: 'Planification, programmation et suivi des sorties, compétitions et événements.',
      icon: CalendarDays,
      href: publicRoutes.services,
    },
    {
      title: 'Demandes d\'autorisation',
      description: 'Circuit Établissement → DREN → DVS avec notifications à chaque étape.',
      icon: ClipboardCheck,
      href: publicRoutes.services,
    },
    {
      title: 'Publications média',
      description: 'Photos et vidéos de sorties validées avant publication sur le portail.',
      icon: Camera,
      href: publicRoutes.galerieSorties,
    },
    {
      title: 'Statistiques nationales',
      description: 'Indicateurs de pilotage et rapports d\'activités sur l\'ensemble du territoire.',
      icon: BarChart3,
      href: publicRoutes.statistiques,
    },
    {
      title: 'Archives documentaires',
      description: 'Circulaires, rapports et ressources de vie scolaire accessibles au public.',
      icon: FileText,
      href: exposesAgentsAccess() ? publicRoutes.documents : publicRoutes.statistiques,
    },
    ...(exposesAgentsAccess()
      ? [
          {
            title: 'Espace agents sécurisé',
            description: 'Connexion réservée aux profils DVS, DREN, établissements et partenaires.',
            icon: Shield,
            href: publicRoutes.espaceAgents,
          },
        ]
      : []),
  ];

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
        eyebrow="PNIGVS · Vie scolaire"
        title="Digitaliser, coordonner et suivre les activités scolaires"
        description="La Direction de la Vie Scolaire centralise la gestion des activités, les demandes d'autorisation, les médias de sortie et le pilotage statistique sur l'ensemble du territoire national."
        image={featuredOutingAlbum.heroImage}
        visualSize="large"
        stats={[
          { value: '6', label: 'Piliers numériques' },
          { value: '3', label: 'Niveaux de validation' },
          { value: String(activityTypes.length), label: 'Types d\'activités' },
        ]}
        actions={[
          { label: 'Voir la galerie des sorties', href: publicRoutes.galerieSorties },
          { label: 'Services PNIGVS', href: publicRoutes.services, variant: 'outline' },
        ]}
      />

      <section className="public-section" aria-labelledby="vs-modules-heading">
        <div className="public-section-head">
          <h2 id="vs-modules-heading">Périmètre de la vie scolaire</h2>
          <p>Les modules PNIGVS couvrent l&apos;ensemble du cycle de vie des activités scolaires.</p>
        </div>
        <PublicFeatureGrid items={features} columns={3} />
      </section>

      <section className="public-section public-section--split" aria-labelledby="vs-types-heading">
        <div className="public-block">
          <h2 id="vs-types-heading">Types d&apos;activités suivies</h2>
          <ul className="public-tag-list">
            {activityTypes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="public-block">
          <h2>Capacités numériques</h2>
          <ul className="public-check-list">
            {vieScolaireModules.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <PublicWorkflowTimeline
        title="Workflow de demande d'autorisation"
        steps={authorizationWorkflow.map((step) => ({
          step: step.step,
          actor: step.actor,
          action: step.action,
        }))}
      />

      <section className="public-cta-band" aria-labelledby="vs-cta-heading">
        <div>
          <p className="public-cta-eyebrow">Exemple de sortie publiée</p>
          <h2 id="vs-cta-heading">{featuredOutingAlbum.title}</h2>
          <p>{featuredOutingAlbum.subtitle}</p>
        </div>
        <div className="public-cta-actions">
          <Link href={publicRoutes.galerieSorties} className="public-hero-btn">
            <Camera size={16} aria-hidden="true" /> Voir les photos
          </Link>
          {exposesAgentsAccess() ? (
            <PortalLink href={publicRoutes.espaceAgents} className="outline-btn">
              <Users size={16} aria-hidden="true" /> Espace agents
            </PortalLink>
          ) : null}
        </div>
      </section>
    </PublicPage>
  );
}
