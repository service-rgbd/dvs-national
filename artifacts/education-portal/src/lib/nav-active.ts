import { isAdminSectionActive } from '@/config/admin-sections';
import { appRoutes } from '@/content/routes';

function splitHref(href: string): { path: string; query: string } {
  const [pathPart, query = ''] = href.split('?');
  return { path: pathPart, query };
}

function readSearchParams(search: string): URLSearchParams {
  const normalized = search.startsWith('?') ? search.slice(1) : search;
  return new URLSearchParams(normalized);
}

/** Détermine si un lien de sous-menu sidebar est actif (path + query). */
export function isNavSubLinkActive(location: string, href: string, search = ''): boolean {
  if (href.startsWith(appRoutes.administration)) {
    return isAdminSectionActive(location, href);
  }

  const { path: hrefPath, query: hrefQuery } = splitHref(href);
  const onPath = location === hrefPath || location.startsWith(`${hrefPath}/`);

  if (!onPath) return false;

  const currentParams = readSearchParams(search);

  if (hrefQuery) {
    const expected = readSearchParams(hrefQuery);
    for (const [key, value] of expected.entries()) {
      if (currentParams.get(key) !== value) return false;
    }
    return true;
  }

  if (hrefPath === appRoutes.requests) {
    return !currentParams.has('status');
  }

  if (hrefPath === appRoutes.establishments) {
    return !currentParams.has('status') && !currentParams.has('sort');
  }

  return location === hrefPath;
}
