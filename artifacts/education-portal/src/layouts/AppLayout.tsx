import {
  ExternalLink,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';

import { Button } from '@/components/ui/button';
import { InstitutionBrand } from '@/components/brand/InstitutionBrand';
import { NavItemWithSub } from '@/components/app/layout/NavItemWithSub';
import { NotificationBell } from '@/components/app/layout/NotificationBell';
import { getAccessibleModules } from '@/config/app-modules';
import { groupAccessibleModules } from '@/config/app-nav-groups';
import { appNavSubMenus } from '@/config/app-nav-submenus';
import { getModuleIcon } from '@/config/app-module-icons';
import { appRoutes, publicRoutes } from '@/content/routes';
import { isAdminPath } from '@/config/admin-sections';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuthLogout, useAuthMe } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

type AppLayoutProps = {
  children: ReactNode;
};

const SIDEBAR_STORAGE_KEY = 'pnigvs-sidebar-collapsed';

function userInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

function isPathActive(location: string, href: string, isDashboard: boolean): boolean {
  if (isDashboard) {
    return location === appRoutes.app || location === `${appRoutes.app}/`;
  }
  if (href === appRoutes.administration) {
    return isAdminPath(location);
  }
  return location === href || location.startsWith(`${href}?`) || location.startsWith(`${href}#`);
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { data } = useAuthMe();
  const user = data?.user;
  const roleCodes = user?.roles.map((role) => role.code) ?? [];
  const modules = getAccessibleModules(roleCodes);
  const navGroups = groupAccessibleModules(modules);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    requests: true,
    administration: true,
  });

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === '1') setSidebarCollapsed(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarCollapsed ? '1' : '0');
  }, [sidebarCollapsed]);

  useEffect(() => {
    setOpenSubMenus((current) => {
      const next = { ...current };
      if (location.startsWith(appRoutes.requests)) {
        next.requests = true;
      }
      if (location.startsWith(appRoutes.administration)) {
        next.administration = true;
      }
      if (location.startsWith(appRoutes.establishments)) {
        next.establishments = true;
      }
      return next;
    });
  }, [location]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location]);

  useEffect(() => {
    if (!isMobile) {
      setMobileNavOpen(false);
      return;
    }

    document.body.style.overflow = mobileNavOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, mobileNavOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileNavOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const logout = useAuthLogout({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        window.location.href = publicRoutes.espaceAgents;
      },
    },
  });

  function toggleSubMenu(moduleId: string) {
    setOpenSubMenus((current) => ({ ...current, [moduleId]: !current[moduleId] }));
  }

  function toggleSidebar() {
    if (isMobile) {
      setMobileNavOpen((value) => !value);
      return;
    }

    setSidebarCollapsed((value) => !value);
  }

  const isSidebarCollapsed = !isMobile && sidebarCollapsed;
  const sidebarState = isMobile ? 'mobile' : sidebarCollapsed ? 'collapsed' : 'expanded';

  const shellClass = [
    'app-pro-shell',
    isSidebarCollapsed ? 'is-sidebar-collapsed' : '',
    isMobile && mobileNavOpen ? 'is-mobile-nav-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClass} data-sidebar-state={sidebarState}>
      {isMobile ? (
        <button
          type="button"
          className="app-pro-mobile-nav-backdrop"
          aria-label="Fermer le menu"
          aria-hidden={!mobileNavOpen}
          tabIndex={mobileNavOpen ? 0 : -1}
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside id="app-pro-sidebar" className="app-pro-sidebar" aria-label="Navigation métier">
        <div className="app-pro-sidebar-brand">
          <InstitutionBrand variant="app-sidebar" href={appRoutes.app} />
        </div>

        {user ? (
          <Link href={appRoutes.profile} className="app-pro-sidebar-user">
            <span className="app-pro-avatar" aria-hidden="true">
              {userInitials(user.fullName)}
            </span>
            <div className="app-pro-sidebar-user-info">
              <span className="app-pro-sidebar-user-name">{user.fullName}</span>
              <span className="app-pro-sidebar-user-role">
                {user.roles[0]?.label ?? 'Agent PNIGVS'}
              </span>
            </div>
          </Link>
        ) : null}

        <nav className="app-pro-nav" aria-label="Menu métier">
          {navGroups.map((group) => (
            <div className="app-pro-nav-group" key={group.id}>
              <p className="app-pro-nav-group-label">{group.label}</p>
              <ul>
                {group.modules.map((module) => {
                  const Icon = getModuleIcon(module.id);
                  const subItems = appNavSubMenus[module.id];
                  const isDashboard = module.href === appRoutes.app;
                  const isActive = isPathActive(location, module.href, isDashboard);
                  const isOpen = openSubMenus[module.id] ?? false;

                  if (subItems?.length) {
                    return (
                      <NavItemWithSub
                        key={module.id}
                        moduleId={module.id}
                        label={module.label}
                        description={module.description}
                        href={module.href}
                        isActive={isActive}
                        isOpen={isOpen}
                        location={location}
                        icon={<Icon size={18} />}
                        subItems={subItems}
                        onToggle={() => toggleSubMenu(module.id)}
                        onOpen={() =>
                          setOpenSubMenus((current) => ({ ...current, [module.id]: true }))
                        }
                      />
                    );
                  }

                  return (
                    <li key={module.id}>
                      <Link
                        href={module.href}
                        className={isActive ? 'app-pro-nav-link is-active' : 'app-pro-nav-link'}
                        aria-current={isActive ? 'page' : undefined}
                        title={module.description}
                      >
                        <span className="app-pro-nav-icon" aria-hidden="true">
                          <Icon size={18} />
                        </span>
                        <span className="app-pro-nav-text">{module.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="app-pro-sidebar-footer">
          <Link href={publicRoutes.home} className="app-pro-footer-link">
            <ExternalLink size={14} aria-hidden="true" />
            Portail public
          </Link>
        </div>
      </aside>

      <div className="app-pro-main">
        <header className="app-pro-topbar">
          <button
            type="button"
            className={`app-pro-icon-btn app-pro-menu-btn${
              isSidebarCollapsed ? ' app-pro-menu-btn--expand' : ' app-pro-menu-btn--collapse'
            }`}
            aria-label={
              isMobile
                ? mobileNavOpen
                  ? 'Fermer le menu'
                  : 'Ouvrir le menu'
                : sidebarCollapsed
                  ? 'Développer le menu'
                  : 'Réduire le menu'
            }
            aria-expanded={isMobile ? mobileNavOpen : !sidebarCollapsed}
            aria-controls="app-pro-sidebar"
            aria-pressed={isMobile ? mobileNavOpen : sidebarCollapsed}
            onClick={toggleSidebar}
          >
            {isMobile ? (
              <Menu size={18} aria-hidden="true" />
            ) : sidebarCollapsed ? (
              <PanelLeftOpen size={18} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={18} aria-hidden="true" />
            )}
          </button>

          <form
            className="app-pro-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              window.location.href = publicRoutes.recherche;
            }}
          >
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Rechercher un dossier, un usager, un document…"
              aria-label="Recherche globale"
            />
          </form>

          <div className="app-pro-topbar-actions">
            <NotificationBell />

            {user ? (
              <Link href={appRoutes.profile} className="app-pro-user">
                <span className="app-pro-avatar" aria-hidden="true">
                  {userInitials(user.fullName)}
                </span>
                <span className="app-pro-user-name">{user.fullName}</span>
              </Link>
            ) : null}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="app-pro-logout app-pro-btn-outline"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              <LogOut aria-hidden="true" />
              Déconnexion
            </Button>
          </div>
        </header>

        <main className="app-pro-content">
          <div className="app-pro-inner">{children}</div>
        </main>
      </div>
    </div>
  );
}
