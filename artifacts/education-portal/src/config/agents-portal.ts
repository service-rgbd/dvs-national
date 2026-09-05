import { appRoutes, publicRoutes } from '@/content/routes';

export type PortalSurface = 'full' | 'public' | 'agents' | 'discover';

const rawSurface = import.meta.env.VITE_PORTAL_SURFACE as PortalSurface | undefined;

/** `full` = dev local (tout sur un même origin). */
export const portalSurface: PortalSurface = rawSurface ?? 'full';

export function getAgentsPortalOrigin(): string {
  const origin = import.meta.env.VITE_AGENTS_PORTAL_URL?.trim();
  return origin ? origin.replace(/\/$/, '') : '';
}

/** URL de connexion : sous-domaine agents en prod publique, /login en local. */
export function agentsLoginUrl(): string {
  const origin = getAgentsPortalOrigin();
  return origin ? `${origin}${appRoutes.login}` : appRoutes.login;
}

export function agentsAppUrl(path = appRoutes.app): string {
  const origin = getAgentsPortalOrigin();
  if (!origin) return path;
  return path.startsWith('/') ? `${origin}${path}` : `${origin}/${path}`;
}

export function isPublicPortalSurface(): boolean {
  return portalSurface === 'public';
}

export function isAgentsPortalSurface(): boolean {
  return portalSurface === 'agents';
}

export function isDiscoverPortalSurface(): boolean {
  return portalSurface === 'discover';
}

/** La vitrine publique n'expose aucun accès login / espace agents. */
export function exposesAgentsAccess(): boolean {
  return portalSurface !== 'discover';
}

export function isAgentsDestinationHref(href: string): boolean {
  const normalized = href.trim();
  if (!normalized) return false;

  const agentsOrigin = getAgentsPortalOrigin();
  if (agentsOrigin && normalized.startsWith(agentsOrigin)) {
    const path = normalized.slice(agentsOrigin.length) || '/';
    return (
      path === appRoutes.login ||
      path.startsWith(`${appRoutes.login}/`) ||
      path.startsWith(`${appRoutes.login}?`) ||
      path === appRoutes.app ||
      path.startsWith(`${appRoutes.app}/`) ||
      path === publicRoutes.espaceAgents ||
      path.startsWith(`${publicRoutes.espaceAgents}/`)
    );
  }

  return (
    normalized === appRoutes.login ||
    normalized.startsWith(`${appRoutes.login}/`) ||
    normalized.startsWith(`${appRoutes.login}?`) ||
    normalized === appRoutes.app ||
    normalized.startsWith(`${appRoutes.app}/`) ||
    normalized === publicRoutes.espaceAgents ||
    normalized.startsWith(`${publicRoutes.espaceAgents}/`) ||
    normalized.startsWith(`${publicRoutes.espaceAgents}?`)
  );
}

export function getInstitutionalPortalOrigin(): string {
  const origin = import.meta.env.VITE_INSTITUTIONAL_PORTAL_URL?.trim();
  return origin ? origin.replace(/\/$/, '') : '';
}
