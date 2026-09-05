import type { ComponentType, ReactNode } from 'react';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppLayout } from '@/layouts/AppLayout';

export function withAppShell<P extends Record<string, unknown>>(Page: ComponentType<P>) {
  return function AppShellRoute(props: P) {
    return (
      <RequireAuth>
        <AppLayout>
          <Page {...props} />
        </AppLayout>
      </RequireAuth>
    );
  };
}

export function withAppModule<P extends Record<string, unknown>>(
  Page: ComponentType<P>,
  ModuleGuard: ComponentType<{ children: ReactNode }>,
) {
  return function AppModuleRoute(props: P) {
    return (
      <RequireAuth>
        <AppLayout>
          <ModuleGuard>
            <Page {...props} />
          </ModuleGuard>
        </AppLayout>
      </RequireAuth>
    );
  };
}
