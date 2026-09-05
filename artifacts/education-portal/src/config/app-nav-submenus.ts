import type { AppModuleId } from './app-modules';
import { ADMIN_SECTIONS } from '@/config/admin-sections';
import { REQUEST_STATUS_FILTERS, requestFilterHref } from '@/config/request-status-filters';
import { appRoutes } from '@/content/routes';

export type NavSubItem = {
  label: string;
  href: string;
};

export type NavSubGroup = {
  label: string;
  items: NavSubItem[];
};

export type NavSubMenu = NavSubItem[] | NavSubGroup[];

export function isNavSubGroups(menu: NavSubMenu): menu is NavSubGroup[] {
  return menu.length > 0 && 'items' in menu[0];
}

export function flattenNavSubMenu(menu: NavSubMenu): NavSubItem[] {
  if (!isNavSubGroups(menu)) return menu;
  return menu.flatMap((group) => group.items);
}

/** Sous-menus sidebar — modules réellement disponibles dans PNIGVS. */
export const appNavSubMenus: Partial<Record<AppModuleId, NavSubMenu>> = {
  establishments: [
    { label: 'Annuaire complet', href: appRoutes.establishments },
    { label: 'Actifs', href: `${appRoutes.establishments}?status=active` },
    { label: 'En attente', href: `${appRoutes.establishments}?status=pending` },
    { label: 'Tri par code', href: `${appRoutes.establishments}?sort=establishmentCode&order=asc` },
  ],
  requests: [
    {
      label: 'En cours',
      items: REQUEST_STATUS_FILTERS.filter((filter) => filter.group === 'active').map((filter) => ({
        label: filter.label,
        href: requestFilterHref(filter.status),
      })),
    },
    {
      label: 'Clôturés',
      items: REQUEST_STATUS_FILTERS.filter((filter) => filter.group === 'closed').map((filter) => ({
        label: filter.label,
        href: requestFilterHref(filter.status),
      })),
    },
  ],
  administration: ADMIN_SECTIONS.map((section) => ({
    label: section.label,
    href: section.href,
  })),
};
