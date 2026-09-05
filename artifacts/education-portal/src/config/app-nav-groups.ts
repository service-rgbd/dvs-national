import type { AppModule, AppModuleId } from './app-modules';

export type AppNavGroup = {
  id: string;
  label: string;
  moduleIds: AppModuleId[];
};

/** Groupes de navigation latérale — sous-menus cohérents par domaine métier. */
export const appNavGroups: AppNavGroup[] = [
  {
    id: 'pilotage',
    label: 'Pilotage',
    moduleIds: ['dashboard', 'statistics'],
  },
  {
    id: 'operations',
    label: 'Opérations',
    moduleIds: ['establishments', 'activities', 'requests', 'mediaPublications', 'documents'],
  },
  {
    id: 'systeme',
    label: 'Système',
    moduleIds: ['administration', 'profile'],
  },
];

export type AppNavGroupWithModules = AppNavGroup & {
  modules: AppModule[];
};

export function groupAccessibleModules(modules: AppModule[]): AppNavGroupWithModules[] {
  const accessibleIds = new Set(modules.map((module) => module.id));

  return appNavGroups
    .map((group) => ({
      ...group,
      modules: group.moduleIds
        .map((id) => modules.find((module) => module.id === id))
        .filter((module): module is AppModule => Boolean(module)),
    }))
    .filter((group) => group.modules.length > 0 && group.moduleIds.some((id) => accessibleIds.has(id)));
}
