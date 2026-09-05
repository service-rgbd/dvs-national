import type { ReactNode } from 'react';

import { RequireModule } from '@/components/auth/RequireModule';
import { appModules, type AppModuleId } from '@/config/app-modules';

export function AppModuleGuard({
  moduleId,
  children,
}: {
  moduleId: AppModuleId;
  children: ReactNode;
}) {
  const module = appModules.find((item) => item.id === moduleId);
  if (!module) return null;
  return <RequireModule module={module}>{children}</RequireModule>;
}
