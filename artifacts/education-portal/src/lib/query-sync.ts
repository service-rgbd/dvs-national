import type { QueryClient, UseQueryOptions } from '@tanstack/react-query';

/** Rafraîchissement léger pour données métier (≈ temps réel). */
export const LIVE_POLL_MS = 20_000;
export const LIVE_STALE_MS = 10_000;

type LiveQueryOptions = Pick<
  UseQueryOptions<unknown, unknown, unknown, readonly unknown[]>,
  'staleTime' | 'refetchInterval' | 'refetchOnWindowFocus'
>;

export const liveQueryOptions: LiveQueryOptions = {
  staleTime: LIVE_STALE_MS,
  refetchInterval: LIVE_POLL_MS,
  refetchOnWindowFocus: true,
};

export const notificationQueryOptions: LiveQueryOptions = {
  staleTime: LIVE_STALE_MS,
  refetchInterval: LIVE_POLL_MS,
  refetchOnWindowFocus: true,
};

/** Enveloppe pour hooks Orval (queryKey ajouté par le générateur). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function liveQueryHookOptions(): any {
  return {
    query: {
      staleTime: LIVE_STALE_MS,
      refetchInterval: LIVE_POLL_MS,
      refetchOnWindowFocus: true,
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function notificationQueryHookOptions(): any {
  return liveQueryHookOptions();
}

export async function invalidateNotifications(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
}

export async function invalidateDashboard(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['/api/app/dashboard'] });
}

export async function invalidateRequests(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
}

export async function invalidateActivities(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
}

export async function invalidateAuth(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
}

export async function invalidateAfterRequestWorkflow(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    invalidateRequests(queryClient),
    invalidateDashboard(queryClient),
    invalidateNotifications(queryClient),
  ]);
}

export async function invalidateDocuments(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['/api/app/documents'] });
}

export async function invalidateReports(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['/api/app/reports'] });
}

export async function invalidateMediaPublications(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['/api/media-publications'] });
}

export async function invalidateAdminUsers(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['/api/app/admin/users'] });
}
