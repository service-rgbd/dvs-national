import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useLocation } from 'wouter';

import { useAuthMe } from '@workspace/api-client-react';
import { appRoutes } from '@/content/routes';

type RequireAuthProps = {
  children: ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const [, navigate] = useLocation();
  const { data, isLoading, isError } = useAuthMe();

  useEffect(() => {
    if (!isLoading && (isError || !data?.user)) {
      const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`${appRoutes.login}?returnTo=${returnTo}`);
    }
  }, [data?.user, isError, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="app-pro-auth-loading" role="status">
        <div className="app-pro-auth-loading-card">
          <span className="app-pro-auth-mark" aria-hidden="true" />
          <p>Vérification de la session…</p>
        </div>
      </div>
    );
  }

  if (isError || !data?.user) {
    return null;
  }

  return <>{children}</>;
}
