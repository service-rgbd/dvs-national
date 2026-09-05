import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useLocation } from 'wouter';

import { canAccessModule, type AppModule } from '@/config/app-modules';
import { appRoutes } from '@/content/routes';
import { useAuthMe } from '@workspace/api-client-react';

type RequireModuleProps = {
  module: AppModule;
  children: ReactNode;
};

export function RequireModule({ module, children }: RequireModuleProps) {
  const [, navigate] = useLocation();
  const { data, isLoading } = useAuthMe();
  const roleCodes = data?.user.roles.map((role) => role.code) ?? [];
  const allowed = canAccessModule(module, roleCodes);

  useEffect(() => {
    if (!isLoading && data?.user && !allowed) {
      navigate(appRoutes.app);
    }
  }, [allowed, data?.user, isLoading, navigate]);

  if (isLoading || !data?.user) {
    return (
      <div className="app-loading" role="status">
        <p>Chargement…</p>
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
