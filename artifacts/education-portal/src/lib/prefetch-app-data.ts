import type { QueryClient } from '@tanstack/react-query';
import type { NotificationItem, RequestDetail, RequestSummary } from '@workspace/api-client-react';
import {
  getGetMediaPublicationByIdQueryOptions,
  getGetRequestByIdQueryOptions,
} from '@workspace/api-client-react';

export function prefetchRequestDetail(queryClient: QueryClient, requestId: string): void {
  if (!requestId) return;
  void queryClient.prefetchQuery(getGetRequestByIdQueryOptions(requestId));
}

export function prefetchMediaPublication(queryClient: QueryClient, publicationId: string): void {
  if (!publicationId) return;
  void queryClient.prefetchQuery(getGetMediaPublicationByIdQueryOptions(publicationId));
}

export function findRequestSummaryInCache(
  queryClient: QueryClient,
  requestId: string,
): RequestSummary | undefined {
  const entries = queryClient.getQueriesData<{ data: RequestSummary[] }>({
    queryKey: ['/api/requests'],
  });

  for (const [, value] of entries) {
    const hit = value?.data?.find((row) => row.id === requestId);
    if (hit) return hit;
  }

  return undefined;
}

export function summaryToDetailPlaceholder(summary: RequestSummary): RequestDetail {
  return {
    ...summary,
    history: [],
    allowedActions: [],
  };
}

export function markNotificationReadOptimistic(
  queryClient: QueryClient,
  notificationId: string,
): void {
  queryClient.setQueriesData<{ data: NotificationItem[] }>(
    { queryKey: ['/api/notifications'] },
    (current) => {
      if (!current?.data) return current;
      return {
        ...current,
        data: current.data.map((item) =>
          item.id === notificationId ? { ...item, isRead: true } : item,
        ),
      };
    },
  );
}
