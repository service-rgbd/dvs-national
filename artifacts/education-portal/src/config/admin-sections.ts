import {
  FileText,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { appRoutes } from '@/content/routes';

export type AdminSectionId = 'overview' | 'accounts' | 'roles' | 'settings' | 'audit';

export type AdminSection = {
  id: AdminSectionId;
  label: string;
  shortLabel: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const ADMIN_SECTIONS: AdminSection[] = [
  {
    id: 'overview',
    label: 'Vue d\'ensemble',
    shortLabel: 'Aperçu',
    description: 'Session active, périmètre et raccourcis administration.',
    href: appRoutes.administration,
    icon: LayoutDashboard,
  },
  {
    id: 'accounts',
    label: 'Comptes agents',
    shortLabel: 'Comptes',
    description: 'Création, désactivation et réinitialisation des accès.',
    href: appRoutes.adminAccounts,
    icon: Users,
  },
  {
    id: 'roles',
    label: 'Rôles & permissions',
    shortLabel: 'Rôles',
    description: 'Matrice RBAC et périmètres géographiques.',
    href: appRoutes.adminRoles,
    icon: Shield,
  },
  {
    id: 'settings',
    label: 'Paramètres',
    shortLabel: 'Réglages',
    description: 'Configuration plateforme, sécurité et variables.',
    href: appRoutes.adminSettings,
    icon: Settings,
  },
  {
    id: 'audit',
    label: 'Journal d\'activité',
    shortLabel: 'Journal',
    description: 'Traçabilité activités scolaires et demandes d’autorisation.',
    href: appRoutes.adminAudit,
    icon: FileText,
  },
];

export function getAdminSection(id: AdminSectionId): AdminSection {
  const section = ADMIN_SECTIONS.find((item) => item.id === id);
  if (!section) throw new Error(`Section admin inconnue: ${id}`);
  return section;
}

export function isAdminPath(path: string): boolean {
  return path === appRoutes.administration || path.startsWith(`${appRoutes.administration}/`);
}

export function isAdminSectionActive(path: string, href: string): boolean {
  if (href === appRoutes.administration) {
    return path === href || path === `${href}/`;
  }
  return path === href || path.startsWith(`${href}/`);
}
