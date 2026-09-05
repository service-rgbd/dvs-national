import {
  BarChart3,
  CalendarDays,
  Camera,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LogIn,
  Shield,
} from 'lucide-react';
import { PortalLink } from '@/components/portal/PortalLink';
import { PublicFeatureGrid } from '@/components/portal/PublicFeatureGrid';
import { PublicPage } from '@/components/portal/PublicPage';
import { PublicPageHero } from '@/components/portal/PublicPageHero';
import { agentsAppUrl, agentsLoginUrl } from '@/config/agents-portal';
import { userProfiles } from '@/config/roles';
import { publicPageContent } from '@/content/pages';
import { publicRoutes } from '@/content/routes';

type ProfileEntry = {
  id: string;
  label: string;
  role: string;
  access: string;
};

type ProfileCategory = {
  id: string;
  title: string;
  description: string;
  profiles: ProfileEntry[];
};

const profileCategories: ProfileCategory[] = [
  {
    id: 'direction',
    title: 'Direction centrale',
    description: 'Pilotage national et supervision institutionnelle de la vie scolaire.',
    profiles: [userProfiles.adminPrincipal, userProfiles.adminSecondary[0]],
  },
  {
    id: 'territorial',
    title: 'Réseau territorial',
    description: 'Coordination régionale des établissements et validation DREN.',
    profiles: [userProfiles.adminSecondary[1]],
  },
  {
    id: 'etablissements',
    title: 'Chefs d\'établissement',
    description: 'Gestion opérationnelle des activités au niveau de l\'établissement.',
    profiles: userProfiles.users.slice(0, 2),
  },
  {
    id: 'educatif',
    title: 'Corps éducatif',
    description: 'Encadrement pédagogique et suivi des activités scolaires.',
    profiles: [userProfiles.users[2]],
  },
  {
    id: 'partenaires',
    title: 'Partenaires institutionnels',
    description: 'Accès contrôlé pour les structures habilitées par la DVS.',
    profiles: [userProfiles.partners],
  },
];

const accessSteps = [
  {
    step: 1,
    title: 'Identifiez votre profil',
    text: 'Consultez les catégories ci-dessous pour vérifier que votre rôle est habilité.',
  },
  {
    step: 2,
    title: 'Connectez-vous',
    text: 'Utilisez vos identifiants PNIGVS pour accéder à l\'application métier.',
  },
  {
    step: 3,
    title: 'Accédez à vos modules',
    text: 'Le tableau de bord s\'adapte automatiquement à votre périmètre et vos permissions.',
  },
];

const agentsLoginHref = agentsLoginUrl();
const agentsAppHref = agentsAppUrl();

const agentModules = [
  {
    title: 'Tableau de bord',
    description: 'Vue d\'ensemble des activités, notifications et indicateurs clés.',
    icon: LayoutDashboard,
    href: agentsLoginHref,
  },
  {
    title: 'Activités scolaires',
    description: 'Planification, programmation et suivi des sorties et événements.',
    icon: CalendarDays,
    href: agentsLoginHref,
  },
  {
    title: 'Demandes d\'autorisation',
    description: 'Soumission, analyse DREN et validation DVS avec notifications.',
    icon: ClipboardCheck,
    href: agentsLoginHref,
  },
  {
    title: 'Publications média',
    description: 'Dépôt et validation des photos et vidéos de sorties scolaires.',
    icon: Camera,
    href: agentsLoginHref,
  },
  {
    title: 'Documents et archives',
    description: 'Circulaires, rapports et ressources institutionnelles.',
    icon: FileText,
    href: agentsLoginHref,
  },
  {
    title: 'Statistiques et rapports',
    description: 'Indicateurs de pilotage et production de rapports d\'activités.',
    icon: BarChart3,
    href: agentsLoginHref,
  },
];

export default function EspaceAgentsPage() {
  const content = publicPageContent.espaceAgents;
  const totalProfiles = profileCategories.reduce((sum, cat) => sum + cat.profiles.length, 0);

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
        eyebrow="Accès sécurisé · PNIGVS"
        title="Espace agents de la Direction de la Vie Scolaire"
        description="Connexion réservée aux agents DVS, responsables DREN, chefs d'établissement, responsables éducatifs et partenaires autorisés. L'application métier adapte les modules selon votre profil."
        stats={[
          { value: String(totalProfiles), label: 'Profils habilités' },
          { value: 'Actif', label: 'Authentification' },
          { value: 'RBAC', label: 'Gestion des rôles' },
        ]}
        actions={[
          { label: 'Se connecter au PNIGVS', href: agentsLoginHref },
          { label: 'Catalogue des services', href: publicRoutes.services, variant: 'outline' },
        ]}
      />

      <section className="agents-access-panel" aria-labelledby="agents-access-heading">
        <div className="agents-access-icon" aria-hidden="true">
          <Shield size={28} strokeWidth={1.75} />
        </div>
        <div className="agents-access-copy">
          <h2 id="agents-access-heading">Connexion à l&apos;application métier</h2>
          <p>
            L&apos;authentification PNIGVS est opérationnelle. Connectez-vous pour accéder au
            tableau de bord adapté à votre profil institutionnel.
          </p>
        </div>
        <div className="agents-access-actions">
          <PortalLink href={agentsLoginHref} className="public-hero-btn">
            <LogIn size={16} aria-hidden="true" /> Se connecter
          </PortalLink>
          <PortalLink href={agentsAppHref} className="outline-btn">
            Accéder à l&apos;application
          </PortalLink>
        </div>
      </section>

      <section className="public-section" aria-labelledby="agents-steps-heading">
        <div className="public-section-head">
          <h2 id="agents-steps-heading">Comment accéder à l&apos;espace agents</h2>
          <p>Trois étapes pour rejoindre l&apos;application métier PNIGVS.</p>
        </div>
        <ol className="agents-steps">
          {accessSteps.map((item) => (
            <li key={item.step} className="agents-step">
              <span className="agents-step-marker">{item.step}</span>
              <div className="agents-step-body">
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="public-section" aria-labelledby="agents-profiles-heading">
        <div className="public-section-head">
          <h2 id="agents-profiles-heading">Profils autorisés par catégorie</h2>
          <p>
            Répartition des rôles selon le cahier des charges PNIGVS — chaque profil dispose
            d&apos;un périmètre d&apos;accès défini.
          </p>
        </div>
        <div className="agents-profile-categories">
          {profileCategories.map((category) => (
            <article className="agents-category" key={category.id}>
              <header className="agents-category-head">
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </header>
              <ul className="agents-profile-list">
                {category.profiles.map((profile) => (
                  <li key={profile.id} className="agents-profile-item">
                    <div className="agents-profile-main">
                      <strong>{profile.role}</strong>
                      <span className="agents-profile-badge">{profile.label}</span>
                    </div>
                    <p className="agents-profile-access">{profile.access}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="public-section" aria-labelledby="agents-modules-heading">
        <div className="public-section-head">
          <h2 id="agents-modules-heading">Modules disponibles après connexion</h2>
          <p>Les fonctionnalités affichées dépendent de votre rôle et de votre périmètre territorial.</p>
        </div>
        <PublicFeatureGrid items={agentModules} columns={2} />
      </section>

      <section className="public-cta-band" aria-labelledby="agents-help-heading">
        <div>
          <p className="public-cta-eyebrow">Assistance</p>
          <h2 id="agents-help-heading">Besoin d&apos;aide ou d&apos;informations ?</h2>
          <p>
            Consultez le catalogue des services ou contactez la DVS pour toute question
            institutionnelle relative à votre accès.
          </p>
        </div>
        <div className="public-cta-actions">
          <PortalLink href={publicRoutes.services} className="public-hero-btn">
            Catalogue des services
          </PortalLink>
          <PortalLink href={publicRoutes.contact} className="outline-btn">
            Nous contacter
          </PortalLink>
        </div>
      </section>
    </PublicPage>
  );
}
