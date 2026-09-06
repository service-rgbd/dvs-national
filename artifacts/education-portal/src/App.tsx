import type { ComponentType, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Redirect, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

import { AppModuleGuard } from '@/components/auth/app-module-guards';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PublicLayout } from '@/layouts/PublicLayout';
import { withAppShell } from '@/layouts/with-app-shell';
import ActivitesPubliquesPage from '@/pages/public/activites';
import ActualitesPage from '@/pages/public/actualites';
import GalerieSortiesPage from '@/pages/public/galerie-sorties';
import ContactPage from '@/pages/public/contact';
import DocumentsPage from '@/pages/public/documents';
import EspaceAgentsPage from '@/pages/public/espace-agents';
import EtablissementsPage from '@/pages/public/etablissements';
import EtablissementDetailPage from '@/pages/public/etablissement-detail';
import HomePage from '@/pages/public/home';
import MinisterePage from '@/pages/public/ministere';
import RecherchePage from '@/pages/public/recherche';
import ServicesPage from '@/pages/public/services';
import StatistiquesPage from '@/pages/public/statistiques';
import VieScolairePage from '@/pages/public/vie-scolaire';
import LoginPage from '@/pages/auth/login';
import AppDashboardPage from '@/pages/app/dashboard';
import AppEstablishmentsPage from '@/pages/app/establishments';
import AppEstablishmentDetailPage from '@/pages/app/establishment-detail';
import AppActivitiesPage from '@/pages/app/activities';
import AppRequestsPage from '@/pages/app/requests';
import AppRequestDetailPage from '@/pages/app/request-detail';
import AppMediaPublicationsPage from '@/pages/app/media-publications';
import AppMediaPublicationDetailPage from '@/pages/app/media-publication-detail';
import AppStatisticsPage from '@/pages/app/statistics';
import AppDocumentsPage from '@/pages/app/documents';
import AppAdministrationPage from '@/pages/app/administration';
import AdminAccountsPage from '@/pages/app/admin/accounts';
import AdminRolesPage from '@/pages/app/admin/roles';
import AdminSettingsPage from '@/pages/app/admin/settings';
import AdminAuditPage from '@/pages/app/admin/audit-log';
import AppProfilePage from '@/pages/app/profile';
import AppNotificationsPage from '@/pages/app/notifications';
import NotFound from '@/pages/not-found';
import { appRoutes, publicRoutes } from '@/content/routes';
import type { AppModuleId } from '@/config/app-modules';
import { portalSurface } from '@/config/agents-portal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

function withAppModule(moduleId: AppModuleId | null, Page: ComponentType) {
  const WrappedPage = moduleId
    ? function GuardedPage() {
        return (
          <AppModuleGuard moduleId={moduleId}>
            <Page />
          </AppModuleGuard>
        );
      }
    : Page;

  return withAppShell(WrappedPage);
}

function PublicRouter() {
  return (
    <Switch>
      <Route path={publicRoutes.home} component={HomePage} />
      <Route path={publicRoutes.ministere} component={MinisterePage} />
      <Route path={publicRoutes.vieScolaire} component={VieScolairePage} />
      <Route path="/etablissements/:id" component={EtablissementDetailPage} />
      <Route path={publicRoutes.etablissements} component={EtablissementsPage} />
      <Route path={publicRoutes.services} component={ServicesPage} />
      <Route path={publicRoutes.actualites} component={ActualitesPage} />
      <Route path={publicRoutes.galerieSorties} component={GalerieSortiesPage} />
      <Route path={publicRoutes.documents} component={DocumentsPage} />
      <Route path={publicRoutes.statistiques} component={StatistiquesPage} />
      <Route path={publicRoutes.contact} component={ContactPage} />
      <Route path={publicRoutes.recherche} component={RecherchePage} />
      <Route path={publicRoutes.espaceAgents} component={EspaceAgentsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function appRouteElements() {
  return [
    <Route key="app-est-detail" path="/app/etablissements/:id" component={withAppModule('establishments', AppEstablishmentDetailPage)} />,
    <Route key="app-establishments" path={appRoutes.establishments} component={withAppModule('establishments', AppEstablishmentsPage)} />,
    <Route key="app-activities" path={appRoutes.activities} component={withAppModule('activities', AppActivitiesPage)} />,
    <Route key="app-requests" path={appRoutes.requests} component={withAppModule('requests', AppRequestsPage)} />,
    <Route key="app-request-detail" path="/app/demandes/:id" component={withAppModule('requests', AppRequestDetailPage)} />,
    <Route key="app-media" path={appRoutes.mediaPublications} component={withAppModule('mediaPublications', AppMediaPublicationsPage)} />,
    <Route key="app-media-detail" path="/app/publications-medias/:id" component={withAppModule('mediaPublications', AppMediaPublicationDetailPage)} />,
    <Route key="app-documents" path={appRoutes.documents} component={withAppModule('documents', AppDocumentsPage)} />,
    <Route key="app-statistics" path={appRoutes.statistics} component={withAppModule('statistics', AppStatisticsPage)} />,
    <Route key="app-admin-audit" path={appRoutes.adminAudit} component={withAppModule('administration', AdminAuditPage)} />,
    <Route key="app-admin-settings" path={appRoutes.adminSettings} component={withAppModule('administration', AdminSettingsPage)} />,
    <Route key="app-admin-roles" path={appRoutes.adminRoles} component={withAppModule('administration', AdminRolesPage)} />,
    <Route key="app-admin-accounts" path={appRoutes.adminAccounts} component={withAppModule('administration', AdminAccountsPage)} />,
    <Route key="app-administration" path={appRoutes.administration} component={withAppModule('administration', AppAdministrationPage)} />,
    <Route key="app-profile" path={appRoutes.profile} component={withAppModule('profile', AppProfilePage)} />,
    <Route key="app-notifications" path={appRoutes.notifications} component={withAppModule(null, AppNotificationsPage)} />,
    <Route key="app-dashboard" path={appRoutes.app} component={withAppModule(null, AppDashboardPage)} />,
  ];
}

function FullRouter() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        {appRouteElements()}
        <Route path={appRoutes.login} component={LoginPage} />
        <Route>
          <PublicLayout>
            <PublicRouter />
          </PublicLayout>
        </Route>
      </Switch>
    </RoutedErrorBoundary>
  );
}

function PublicOnlyRouter() {
  return (
    <RoutedErrorBoundary>
      <PublicLayout>
        <PublicRouter />
      </PublicLayout>
    </RoutedErrorBoundary>
  );
}

function AgentsOnlyRouter() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        {appRouteElements()}
        <Route path={appRoutes.login} component={LoginPage} />
        <Route path={publicRoutes.home}>
          <Redirect to={appRoutes.login} />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function DiscoverRouter() {
  return (
    <Switch>
      <Route path={publicRoutes.home} component={HomePage} />
      <Route path={publicRoutes.activites} component={ActivitesPubliquesPage} />
      <Route path={publicRoutes.vieScolaire} component={VieScolairePage} />
      <Route path="/etablissements/:id" component={EtablissementDetailPage} />
      <Route path={publicRoutes.etablissements} component={EtablissementsPage} />
      <Route path={publicRoutes.services} component={ServicesPage} />
      <Route path={publicRoutes.actualites} component={ActualitesPage} />
      <Route path={publicRoutes.galerieSorties} component={GalerieSortiesPage} />
      <Route path={publicRoutes.statistiques} component={StatistiquesPage} />
      <Route path={publicRoutes.contact} component={ContactPage} />
      <Route path={publicRoutes.recherche} component={RecherchePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function DiscoverOnlyRouter() {
  return (
    <RoutedErrorBoundary>
      <PublicLayout>
        <DiscoverRouter />
      </PublicLayout>
    </RoutedErrorBoundary>
  );
}

function Router() {
  if (portalSurface === 'public') {
    return <PublicOnlyRouter />;
  }
  if (portalSurface === 'discover') {
    return <DiscoverOnlyRouter />;
  }
  if (portalSurface === 'agents') {
    return <AgentsOnlyRouter />;
  }
  return <FullRouter />;
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
