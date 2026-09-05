import {
  BarChart3,
  Building2,
  CalendarDays,
  Camera,
  FileCheck,
  FolderOpen,
  LayoutDashboard,
  Settings,
  User,
  type LucideIcon,
} from 'lucide-react';

import type { AppModuleId } from './app-modules';

export const appModuleIcons: Record<AppModuleId, LucideIcon> = {
  dashboard: LayoutDashboard,
  establishments: Building2,
  activities: CalendarDays,
  requests: FileCheck,
  mediaPublications: Camera,
  documents: FolderOpen,
  statistics: BarChart3,
  administration: Settings,
  profile: User,
};

export function getModuleIcon(id: AppModuleId): LucideIcon {
  return appModuleIcons[id];
}
