import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Facebook,
  GraduationCap,
  HeartPulse,
  Instagram,
  Landmark,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Youtube,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type IconType = typeof CalendarDays;

const news = [
  { title: 'Sciences : ouvrir la voie avec Elsa Lubek', text: 'Elles cherchent, enseignent, innovent, bousculent les idées reçues. Toutes dans l’équation donnent la parole à des femmes qui ont choisi les sciences.', tag: 'Portrait', image: 'portrait' },
  { title: 'Priorités pour l’année scolaire 2026-2027', text: 'La circulaire de rentrée présente les priorités de l’année scolaire : instruire, protéger et donner à chacun les moyens de réussir.', tag: 'Actualité', image: 'flag' },
  { title: 'Rapport 2025 de la médiatrice de l’Éducation nationale et de l’Enseignement supérieur', text: 'Catherine Becchetti-Bizot présente son rapport 2025 intitulé « Porter attention aux vulnérabilités, agir en faveur de la santé mentale. »', tag: 'Publication' },
  { title: 'Agir pour la santé mentale des enfants et des jeunes', text: 'D’après l’OMS, la santé mentale est un état de bien-être qui permet à chacun de réaliser son potentiel.', tag: 'Dossier' },
];

const services: { title: string; icon: IconType }[] = [
  { title: 'Le calendrier scolaire', icon: CalendarDays },
  { title: 'Les bourses de collège et de lycée', icon: Landmark },
  { title: 'La lutte contre le harcèlement', icon: ShieldCheck },
  { title: 'La préparation du bac et l’orientation', icon: GraduationCap },
  { title: 'La santé et le bien-être des élèves', icon: HeartPulse },
  { title: 'Les élèves à besoins éducatifs particuliers', icon: Users },
];

const rentrée = [
  { title: 'L’allocation de rentrée scolaire', text: 'L’allocation de rentrée scolaire (ARS) est versée, sous conditions de ressources, aux familles ayant au moins un enfant scolarisé âgé de 6 à 18 ans.', image: 'child' },
  { title: 'Calendrier scolaire', text: 'Retrouvez ici toutes les dates essentielles de l’année scolaire 2026-2027 : périodes de cours, vacances et jours fériés.', image: 'playground' },
  { title: 'Faire sa demande de bourse', text: "Vous n'avez pas consenti à l'étude automatique du droit à bourse au moment de l'inscription ? Vous pouvez faire une demande annuelle." },
  { title: 'Les fournitures scolaires', text: 'La réduction des charges financières qui pèsent sur les familles à chaque rentrée scolaire constitue une priorité.' },
];

const footerGroups = [
  { id: 'footer-sites', title: 'Sites Éducation', links: ['Devenir enseignant', 'Éduscol', 'Onisep', 'Cned', 'Réseau Canopé', 'CLEMI', 'France Éducation international', 'Institut des hautes études de l’éducation et de la formation', 'Enseignement supérieur et Recherche', 'Sites académiques', 'Céreq'] },
  { id: 'footer-reports', title: 'Rapports, publications et statistiques', links: ['Data.education.gouv.fr', 'Conseil d’évaluation de l’École', 'Conseil supérieur des programmes', 'Direction de l’évaluation, de la prospective et de la performance', 'Inspection générale de l’éducation, du sport et de la recherche'] },
];

const navigation = ['Ministère', 'Système éducatif', 'Enseignements', 'Vie scolaire', 'Métiers et ressources humaines', 'Bulletin officiel'];

function ArrowLink({ children, testId }: { children: ReactNode; testId: string }) {
  return <a href="#contact" className="arrow-link" data-testid={testId}>{children}<ArrowRight size={18} aria-hidden="true" /></a>;
}

function Visual({ variant }: { variant: 'hero' | 'people' }) {
  return (
    <div className={`visual visual-${variant}`} role="img" aria-label={variant === 'hero' ? 'Illustration éditoriale colorée autour de la lecture et de l’imaginaire' : 'Illustration éditoriale autour de l’accompagnement des personnels'}>
      <div className="visual-shape shape-a" />
      <div className="visual-shape shape-b" />
      <div className="visual-caption">{variant === 'hero' ? 'LIRE · IMAGINER · GRANDIR' : 'ÉDUQUER · ACCOMPAGNER'}</div>
    </div>
  );
}

function EducationHomepage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searched, setSearched] = useState(false);
  const [cookies, setCookies] = useState(true);
  const [cookieDetail, setCookieDetail] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearched(true);
    const params = new URLSearchParams(window.location.search);
    if (search.trim()) params.set('search', search.trim());
    else params.delete('search');
    window.history.replaceState({}, '', `${window.location.pathname}${params.toString() ? `?${params}` : ''}`);
  };

  const closeCookies = () => {
    setCookies(false);
    setCookieDetail(false);
  };

  return (
    <div className="education-page">
      <nav className="skip-links" aria-label="Liens d’évitement">
        <a href="#main-content" data-testid="link-skip-content">Accéder au contenu principal</a>
        <a href="#page-header--menu" data-testid="link-skip-menu">Accéder au menu</a>
        <a href="#search-block-form" data-testid="link-skip-search">Accéder à la recherche</a>
        <a href="#footer" data-testid="link-skip-footer">Accéder au pied de page</a>
      </nav>

      <header id="page-header">
        <div className="topline">
          <div className="container topline-inner">
            <a className="brand" href="#main-content" aria-label="Ministère de l'Éducation nationale, accueil" data-testid="link-brand-home">
              <span className="brand-mark" aria-hidden="true" />
              <span>MINISTÈRE<br />DE L’ÉDUCATION<br />NATIONALE<small>Liberté · Égalité · Fraternité</small></span>
            </a>
            <div className="header-right">
              <div className="top-links">
                <a href="#footer" data-testid="link-press">Espace presse</a>
                <a href="#footer" data-testid="link-statistics">Études et statistiques</a>
                <a href="#services" data-testid="link-parcoursup">Parcoursup <ExternalLink size={12} aria-hidden="true" /></a>
              </div>
              <div className="top-actions">
                <button className="search-trigger" onClick={() => setSearchOpen((value) => !value)} aria-expanded={searchOpen} aria-controls="search-block-form" data-testid="button-open-search">
                  <Search size={19} aria-hidden="true" /><span>Rechercher</span>
                </button>
                <button className="menu-trigger" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} aria-controls="page-header--menu" data-testid="button-open-menu">
                  <Menu size={23} aria-hidden="true" /><span>Menu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {searchOpen && (
          <div className="search-panel" id="search-block-form">
            <div className="container">
              <form className="search-form" onSubmit={submitSearch} role="search">
                <label htmlFor="site-search">Rechercher une information</label>
                <input ref={searchRef} id="site-search" type="search" value={search} onChange={(event) => { setSearch(event.target.value); setSearched(false); }} placeholder="Rechercher une information, une démarche ou un contact" data-testid="input-site-search" />
                <button aria-label="Lancer la recherche" data-testid="button-submit-search"><Search size={20} aria-hidden="true" /></button>
              </form>
              {searched && <div className="search-result" role="status" data-testid="status-search-results">{search ? `Résultats pour « ${search} » — consultez les rubriques ci-dessous.` : 'Saisissez un terme pour lancer une recherche.'}</div>}
            </div>
          </div>
        )}
        <nav id="page-header--menu" className="nav" aria-label="Navigation principale">
          <div className="container nav-inner">
            {navigation.map((item, index) => (
              <a href={index === 3 ? '#services' : '#footer'} key={item} data-testid={`link-nav-${index}`}>
                {item}{index < 5 && <ChevronDown className="nav-chevron" size={14} aria-hidden="true" />}
              </a>
            ))}
          </div>
        </nav>
        {menuOpen && (
          <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu principal" onClick={(event) => { if (event.target === event.currentTarget) setMenuOpen(false); }}>
            <button onClick={() => setMenuOpen(false)} aria-label="Fermer le menu" data-testid="button-close-menu"><X size={28} aria-hidden="true" /></button>
            {navigation.map((item, index) => (
              <a href={index === 3 ? '#services' : '#footer'} onClick={() => setMenuOpen(false)} key={item} data-testid={`link-mobile-nav-${index}`}>{item}<ChevronDown size={17} aria-hidden="true" /></a>
            ))}
          </div>
        )}
      </header>

      <main id="main-content">
        <section className="hero-wrap" aria-labelledby="hero-title">
          <div className="container hero">
            <div className="hero-copy">
              <div className="eyebrow">L’été, la lecture en partage</div>
              <h1 id="hero-title" data-testid="text-hero-title">Inciter les jeunes à voyager par l’imaginaire</h1>
              <p>Romans, poèmes, revues, bandes dessinées, nouvelles ou mangas, cet été tout se lit ! Où que tu sois, voyage dans les librairies ou les bibliothèques.</p>
              <a className="outline-btn" href="#experiences" data-testid="link-hero-article">Lire l’article <BookOpen size={18} aria-hidden="true" /></a>
            </div>
            <Visual variant="hero" />
          </div>
        </section>

        <section className="container" aria-labelledby="news-title">
          <div className="section-heading">
            <h2 id="news-title" data-testid="heading-news">À la une</h2>
            <a className="blue-link" href="#footer" data-testid="link-all-news">Toutes les actualités</a>
          </div>
          <div className="news-grid">
            {news.map((item, index) => (
              <article className={`news-card ${index < 2 ? 'featured' : ''}`} key={item.title} data-testid={`card-news-${index}`}>
                <div className={`news-image ${item.image ?? item.tag.toLowerCase()}`} aria-hidden="true" />
                <div className="news-body">
                  <div className="tag">{item.tag}</div>
                  <h3><a href="#experiences" data-testid={`link-news-${index}`}>{item.title}</a></h3>
                  <p>{item.text}</p>
                  {index > 1 && <ArrowLink testId={`link-news-more-${index}`}>Lire la suite</ArrowLink>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="services-section" id="services" aria-labelledby="services-title">
          <div className="container">
            <div className="section-heading">
              <h2 id="services-title" data-testid="heading-services">L’éducation nationale et vous</h2>
              <p>Les informations et démarches essentielles pour les familles, les élèves et les citoyens.</p>
            </div>
            <div className="service-grid">
              {services.map(({ title, icon: Icon }, index) => (
                <a className="service-card" href="#contact" key={title} data-testid={`card-service-${index}`}>
                  <Icon aria-hidden="true" /><strong>{title}</strong><ArrowRight className="ml-auto" size={19} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="container" aria-labelledby="rentree-title">
          <div className="section-heading">
            <h2 id="rentree-title" data-testid="heading-rentree">Préparer la rentrée</h2>
            <a className="blue-link" href="#contact" data-testid="link-all-rentree">Voir toutes les démarches</a>
          </div>
          <div className="rentrée-grid">
            {rentrée.map((item, index) => (
              <article className={`rentrée-card ${!item.image ? 'simple' : ''}`} key={item.title} data-testid={`card-rentree-${index}`}>
                {item.image && <div className={`mini-visual ${item.image}`} role="img" aria-label="Illustration de la rentrée scolaire" />}
                <div className="news-body">
                  <h3><a href="#contact" data-testid={`link-rentree-${index}`}>{item.title}</a></h3>
                  <p>{item.text}</p>
                  <ArrowLink testId={`link-rentree-action-${index}`}>Accéder à la démarche</ArrowLink>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="people-section" aria-labelledby="people-title">
          <div className="container">
            <div className="section-heading">
              <h2 id="people-title" data-testid="heading-people">Personnels de l’éducation nationale</h2>
              <p>Un accompagnement professionnel personnalisé et confidentiel, à chaque étape de votre parcours.</p>
            </div>
            <div className="people-grid">
              <article className="people-feature">
                <Visual variant="people" />
                <div className="news-body">
                  <h3>Le réseau des conseillers ressources humaines de proximité</h3>
                  <p>Vous vous posez des questions sur votre parcours professionnel ou vos perspectives d’évolution ? Le réseau des conseillers ressources humaines de proximité (CRHP) vous permet de bénéficier d’informations, de conseils ou d’un accompagnement personnalisé.</p>
                  <ArrowLink testId="link-rh-adviser">Contacter un conseiller RH de proximité</ArrowLink>
                </div>
              </article>
              <div className="people-links">
                {['La protection sociale complémentaire', 'La rémunération des enseignants', 'I-Prof, l’assistant carrière', 'L’éventail des missions et métiers pour les enseignants', 'Le portail mobilité des enseignants', 'Le Programme national de formation 2026-2027'].map((title, index) => (
                  <a className="quick-card" href="#contact" key={title} data-testid={`card-people-${index}`}>{title}<ArrowRight size={18} aria-hidden="true" /></a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="experiences" id="experiences" aria-labelledby="experiences-title">
          <div className="container">
            <div className="section-heading">
              <div><div className="eyebrow">Culture · sport · découverte</div><h2 id="experiences-title" data-testid="heading-experiences">Des expériences qui forment</h2></div>
              <p>Théâtre, lecture, cinéma, langues, sciences : les actions éducatives ouvrent les horizons et nourrissent la curiosité.</p>
            </div>
            <div className="experience-grid">
              {['Septembre Bouge : l’activité physique et sportive à l’honneur à la rentrée', 'La compétition des métiers WorldSkills', 'Masterclasses de cinéma : découvrir de grands films'].map((title, index) => (
                <article className="experience-card" key={title} data-testid={`card-experience-${index}`}>
                  <Sparkles size={21} aria-hidden="true" /><h3>{title}</h3>
                  <p>{index === 0 ? 'Une rentrée pour bouger, partager et prendre soin de sa santé.' : index === 1 ? 'Des savoir-faire, des talents et une jeunesse qui se révèle.' : 'Des rencontres pour regarder le monde autrement.'}</p>
                  <ArrowLink testId={`link-experience-${index}`}>Découvrir le projet</ArrowLink>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-title">
          <div className="container contact-grid">
            <div><h2 id="contact-title" data-testid="heading-contact">Nous contacter</h2><p>Trouvez rapidement le bon interlocuteur selon votre situation et votre besoin.</p></div>
            <div className="contact-links">
              {['Les établissements', 'Le ministre', 'Le médiateur', 'Les académies', 'Scolarité, diplômes, examens, orientation', 'Concours, emplois, carrières', 'Le délégué à la protection des données', 'Autres contacts'].map((item, index) => (
                <a href="#footer" key={item} data-testid={`link-contact-${index}`}>{item}<ArrowRight size={17} aria-hidden="true" /></a>
              ))}
            </div>
          </div>
          <div className="container social">
            <h2>Suivez-nous sur les réseaux sociaux</h2>
            <div className="social-links">
              <a href="#footer" data-testid="link-social-instagram"><Instagram size={18} aria-hidden="true" /> Instagram</a>
              <a href="#footer" data-testid="link-social-facebook"><Facebook size={18} aria-hidden="true" /> Facebook</a>
              <a href="#footer" data-testid="link-social-tiktok">TikTok</a>
              <a href="#footer" data-testid="link-social-linkedin">LinkedIn</a>
              <a href="#footer" data-testid="link-social-x">X</a>
              <a href="#footer" data-testid="link-social-youtube"><Youtube size={18} aria-hidden="true" /> YouTube</a>
              <a href="#footer" data-testid="link-social-bluesky">Bluesky</a>
            </div>
          </div>
        </section>
      </main>

      <footer id="footer">
        <div className="container">
          <div className="footer-groups">
            {footerGroups.map((group) => (
              <section className="footer-group" key={group.id} aria-labelledby={group.id}>
                <h2 id={group.id}>{group.title}</h2>
                <ul>{group.links.map((link, index) => <li key={link}><a href="#main-content" data-testid={`link-footer-${group.id}-${index}`}>{link} <ExternalLink size={11} aria-hidden="true" /></a></li>)}</ul>
              </section>
            ))}
          </div>
          <div className="footer-bottom">
            <div className="footer-signature">MINISTÈRE<br />DE L’ÉDUCATION NATIONALE<small>Liberté · Égalité · Fraternité</small></div>
            <div className="legal">
              <a href="#footer" data-testid="link-footer-press">Espace presse</a><a href="#contact" data-testid="link-footer-contact">Contactez-nous</a><a href="#footer" data-testid="link-legal">Mentions légales</a><a href="#footer" data-testid="link-privacy">Données personnelles et cookies</a>
              <a href="#footer" onClick={() => { setCookies(true); setCookieDetail(true); }} data-testid="link-cookie-management">Gestion des cookies</a>
              <a href="#footer" data-testid="link-accessibility">Déclaration d’accessibilité : partiellement conforme</a><a href="#footer" data-testid="link-legifrance">Légifrance</a><a href="#footer" data-testid="link-service-public">Service-Public.fr</a><a href="#footer" data-testid="link-info-gouv">Info.gouv.fr</a><a href="#footer" data-testid="link-data-gouv">Data.gouv.fr</a>
              <span>© Ministère de l’Éducation nationale · Licence Etalab 2.0</span>
            </div>
          </div>
        </div>
      </footer>

      {cookies && (
        <aside className="cookie" aria-labelledby="cookie-title" data-testid="panel-cookie">
          <button className="cookie-close" onClick={closeCookies} aria-label="Fermer la gestion des cookies" data-testid="button-close-cookies"><X size={18} aria-hidden="true" /></button>
          <h2 id="cookie-title">Bienvenue sur le site de l’Éducation nationale</h2>
          <p>Nous utilisons des cookies pour mesurer l’audience, améliorer le fonctionnement du site et évaluer nos campagnes. Votre choix est conservé pendant 13 mois.</p>
          {cookieDetail && <p><strong>Personnaliser :</strong> les cookies essentiels restent actifs ; les cookies de mesure d’audience sont désactivés par défaut.</p>}
          <a className="blue-link" href="#footer" data-testid="link-cookie-details">En savoir plus sur les données personnelles et les cookies</a>
          <div className="cookie-actions">
            <button className="primary" onClick={closeCookies} data-testid="button-accept-cookies"><Check size={15} aria-hidden="true" /> Tout accepter</button>
            <button onClick={closeCookies} data-testid="button-refuse-cookies">Tout refuser</button>
            <button onClick={() => setCookieDetail((value) => !value)} aria-expanded={cookieDetail} data-testid="button-customize-cookies">{cookieDetail ? 'Fermer les options' : 'Personnaliser'} {cookieDetail ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}</button>
          </div>
        </aside>
      )}
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={EducationHomepage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;