import { LogOut, Menu, Settings, X } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';

import { InstitutionBrand } from '@/components/brand/InstitutionBrand';
import { DrenContactButton } from '@/components/app/layout/DrenContactButton';
import { NotificationBell } from '@/components/app/layout/NotificationBell';
import { ProfileMenu } from '@/components/app/layout/ProfileMenu';
import { canAccessModule, getAccessibleModules } from '@/config/app-modules';
import { getModuleIcon } from '@/config/app-module-icons';
import { appModules } from '@/config/app-modules';
import { isAdminPath } from '@/config/admin-sections';
import { useIsMobile } from '@/hooks/use-mobile';
import { appRoutes, publicRoutes } from '@/content/routes';
import { useAuthLogout, useAuthMe } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

type AppLayoutProps = {
  children: ReactNode;
};

type OverlayKind = 'menu' | null;

const TOP_NAV_IDS = [
  'dashboard',
  'establishments',
  'activities',
  'requests',
  'mediaPublications',
  'documents',
  'statistics',
] as const;

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
  return location === href || location.startsWith(`${href}/`) || location.startsWith(`${href}?`) || location.startsWith(`${href}#`);
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { data } = useAuthMe();
  const user = data?.user;
  const roleCodes = user?.roles.map((role) => role.code) ?? [];
  const modules = getAccessibleModules(roleCodes);
  const topNav = TOP_NAV_IDS.map((id) => modules.find((module) => module.id === id)).filter(
    (module): module is NonNullable<typeof module> => Boolean(module),
  );
  const administrationModule = appModules.find((module) => module.id === 'administration');
  const canOpenSettings = administrationModule
    ? canAccessModule(administrationModule, roleCodes)
    : false;
  const settingsHref = appRoutes.administration;
  const [overlay, setOverlay] = useState<OverlayKind>(null);
  const [headerHeight, setHeaderHeight] = useState(52);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOverlay(null);
  }, [location]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const update = () => setHeaderHeight(Math.round(header.getBoundingClientRect().height));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isMobile && overlay === 'menu') {
      setOverlay(null);
    }
  }, [isMobile, overlay]);

  useEffect(() => {
    document.body.style.overflow = overlay ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [overlay]);

  const logout = useAuthLogout({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        window.location.href = publicRoutes.espaceAgents;
      },
    },
  });

  function closeOverlay() {
    setOverlay(null);
    if (overlay === 'menu') {
      menuButtonRef.current?.focus();
    }
  }

  const shellClass = [
    'dash-shell',
    'app-pro-shell',
    overlay ? 'is-sheet-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const sheetStyle = { '--dash-sheet-top': `${headerHeight}px` } as CSSProperties;

  function renderNavLinks(idPrefix: string) {
    return topNav.map((module) => {
      const isDashboard = module.href === appRoutes.app;
      const isActive = isPathActive(location, module.href, isDashboard);

      const Icon = getModuleIcon(module.id);

      return (
        <Link
          key={`${idPrefix}-${module.id}`}
          href={module.href}
          className={isActive ? 'dash-nav-link is-active' : 'dash-nav-link'}
          aria-current={isActive ? 'page' : undefined}
          title={module.description}
        >
          <span className={`dash-nav-icon${module.id === 'mediaPublications' ? ' dash-nav-icon--camera' : ''}`} aria-hidden="true">
            <Icon size={16} strokeWidth={1.75} />
          </span>
          {module.shortLabel ?? module.label}
        </Link>
      );
    });
  }

  return (
    <div className={shellClass}>
      <header className="dash-topnav" ref={headerRef}>
        <InstitutionBrand variant="app-top" href={appRoutes.app} />

        <nav className="dash-topnav-links" aria-label="Menu métier">
          {renderNavLinks('desktop')}
        </nav>

        <div className="dash-topnav-actions">
          <DrenContactButton />
          <div className="dash-notif">
            <NotificationBell />
          </div>

          {!isMobile && user ? (
            <ProfileMenu
              fullName={user.fullName}
              initials={userInitials(user.fullName)}
              canOpenSettings={canOpenSettings}
              settingsHref={settingsHref}
              settingsActive={isAdminPath(location)}
              onLogout={() => logout.mutate()}
              logoutPending={logout.isPending}
            />
          ) : null}

          {isMobile ? (
            <button
              ref={menuButtonRef}
              type="button"
              className="dash-icon-btn dash-menu-toggle"
              aria-label={overlay === 'menu' ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={overlay === 'menu'}
              aria-controls="dash-mobile-nav"
              onClick={() => setOverlay(overlay === 'menu' ? null : 'menu')}
            >
              {overlay === 'menu' ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            </button>
          ) : null}
        </div>
      </header>

      {isMobile && overlay === 'menu' ? (
        <nav
          id="dash-mobile-nav"
          className="dash-sheet dash-sheet--menu"
          aria-label="Menu métier"
          style={sheetStyle}
        >
          <header className="dash-sheet-head">
            <div>
              <strong>Menu</strong>
              <p>Navigation</p>
            </div>
            <button
              type="button"
              className="dash-icon-btn dash-icon-btn--ghost"
              aria-label="Fermer le menu"
              onClick={closeOverlay}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </header>
          {user ? (
            <Link href={appRoutes.profile} className="dash-sheet-profile" onClick={closeOverlay}>
              <span className="dash-avatar" aria-hidden="true">
                {userInitials(user.fullName)}
              </span>
              <span>
                <strong>{user.fullName}</strong>
                <em>Mon profil</em>
              </span>
            </Link>
          ) : null}
          <div className="dash-sheet-body dash-sheet-nav">
            {renderNavLinks('mobile')}
          </div>
          <footer className="dash-sheet-foot dash-sheet-foot--actions">
            <DrenContactButton variant="sheet" />
            {canOpenSettings ? (
              <Link href={settingsHref} className="dash-sheet-action" onClick={closeOverlay}>
                <Settings size={16} aria-hidden="true" />
                Administration
              </Link>
            ) : null}
            <button
              type="button"
              className="dash-sheet-action"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              <LogOut size={16} aria-hidden="true" />
              Déconnexion
            </button>
          </footer>
        </nav>
      ) : null}

      <main className="dash-main app-pro-content">
        <div className="dash-main-inner app-pro-inner">{children}</div>
      </main>
    </div>
  );
}
