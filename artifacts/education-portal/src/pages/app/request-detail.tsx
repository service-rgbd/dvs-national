import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useRoute } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';

import { AppPage } from '@/components/app/AppPage';
import { RequestDetailView } from '@/components/app/requests/RequestDetailView';
import { buildTransitionPayload } from '@/components/app/requests/RequestVoyageDecouvertePanel';
import { AppProEmpty } from '@/components/app/pro/AppProEmpty';
import { AppProLoading } from '@/components/app/pro/AppProLoading';
import { AppProPageShell } from '@/components/app/pro/AppProPageShell';
import { appRoutes } from '@/content/routes';
import {
  findRequestSummaryInCache,
  summaryToDetailPlaceholder,
} from '@/lib/prefetch-app-data';
import {
  LIVE_POLL_MS,
  LIVE_STALE_MS,
  invalidateAfterRequestWorkflow,
  liveQueryHookOptions,
} from '@/lib/query-sync';
import {
  emptyChecklistState,
  emptyDvsValidationState,
  isChecklistComplete,
  isDvsValidationComplete,
} from '@/config/voyage-decouverte-rules';
import '@/styles/requests.css';
import type { WorkflowAction } from '@workspace/api-client-react';
import {
  getGetRequestByIdQueryKey,
  useGetAppDashboard,
  useGetRequestById,
  useTransitionRequest,
} from '@workspace/api-client-react';
import { ApiError } from '@workspace/api-client-react';

function mergeBooleanRecord(
  base: Record<string, boolean | undefined> | undefined,
  fallback: Record<string, boolean>,
): Record<string, boolean> {
  return {
    ...fallback,
    ...(base as Record<string, boolean> | undefined),
  };
}

export default function AppRequestDetailPage() {
  const [, params] = useRoute('/app/demandes/:id');
  const requestId = params?.id ?? '';
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [checklistDraft, setChecklistDraft] = useState(emptyChecklistState());
  const [dvsValidationDraft, setDvsValidationDraft] = useState(emptyDvsValidationState());
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const { data: dashboardData } = useGetAppDashboard(liveQueryHookOptions());
  const { data, isLoading, isError, isFetching, refetch } = useGetRequestById(requestId, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: {
      staleTime: LIVE_STALE_MS,
      refetchInterval: LIVE_POLL_MS,
      refetchOnWindowFocus: true,
      placeholderData: () => {
        const summary = findRequestSummaryInCache(queryClient, requestId);
        return summary ? summaryToDetailPlaceholder(summary) : undefined;
      },
    } as any,
  });

  const isHydratingDetail = Boolean(data && data.history.length === 0 && isFetching);

  useEffect(() => {
    if (!data) return;
    setChecklistDraft(mergeBooleanRecord(data.checklist, emptyChecklistState()));
    setDvsValidationDraft(mergeBooleanRecord(data.dvsValidation, emptyDvsValidationState()));
  }, [data?.id, data?.updatedAt]);

  const transition = useTransitionRequest({
    mutation: {
      retry: (failureCount, error) => {
        if (failureCount >= 2) return false;
        if (error instanceof ApiError) {
          return error.status === 503 || error.status >= 500;
        }
        return false;
      },
      retryDelay: (attempt) => Math.min(1000 * attempt, 3000),
      onSuccess: async (updated) => {
        setActionError(null);
        setActionSuccess('Action enregistrée — dossier mis à jour.');
        queryClient.setQueryData(getGetRequestByIdQueryKey(requestId), updated);
        void invalidateAfterRequestWorkflow(queryClient);
        setReason('');
      },
      onError: async (error) => {
        setActionSuccess(null);
        const previousStatus = data?.status;
        const refreshed = await refetch();
        if (previousStatus && refreshed.data?.status !== previousStatus) {
          setActionSuccess('Action enregistrée — dossier mis à jour.');
          setActionError(null);
          return;
        }
        if (error instanceof ApiError) {
          const payload = error.data as { error?: { code?: string; message?: string } } | null;
          if (error.status === 503 || payload?.error?.code === 'DATABASE_UNAVAILABLE') {
            setActionError(
              'La base de données met du temps à répondre. Patientez quelques secondes, puis réessayez une seule fois.',
            );
            return;
          }
          setActionError(payload?.error?.message ?? 'Action impossible sur ce dossier.');
          return;
        }
        setActionError('Action impossible. Vérifiez votre connexion et réessayez.');
      },
    },
  });

  function validateBeforeAction(action: WorkflowAction): string | null {
    if ((action === 'submit' || action === 'resubmit') && !isChecklistComplete(checklistDraft)) {
      return 'Cochez les deux cases de la checklist Voyage Découverte avant de soumettre.';
    }
    if (action === 'approve' && !isDvsValidationComplete(dvsValidationDraft)) {
      return 'Validez les trois contrôles DVS avant d\'accorder l\'autorisation.';
    }
    return null;
  }

  function runAction(action: WorkflowAction) {
    const validationError = validateBeforeAction(action);
    if (validationError) {
      setActionSuccess(null);
      setActionError(validationError);
      return;
    }
    setActionError(null);
    setActionSuccess(null);
    transition.mutate({
      id: requestId,
      data: buildTransitionPayload(action, {
        reason,
        checklistDraft,
        dvsValidationDraft,
      }),
    });
  }

  function handleReasonSubmit(action: WorkflowAction, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reason.trim()) {
      setActionError('Un motif est requis pour cette action.');
      return;
    }
    setActionError(null);
    setActionSuccess(null);
    transition.mutate({
      id: requestId,
      data: buildTransitionPayload(action, {
        reason,
        checklistDraft,
        dvsValidationDraft,
      }),
    });
  }

  if (!requestId) {
    return (
      <AppPage title="Demande introuvable" breadcrumb={[{ label: 'Demandes', href: appRoutes.requests }, { label: 'Erreur' }]}>
        <AppProEmpty title="Identifiant manquant" description="URL de dossier invalide." />
      </AppPage>
    );
  }

  if (isLoading && !data) {
    return (
      <AppPage title="Dossier de demande" breadcrumb={[{ label: 'Demandes', href: appRoutes.requests }, { label: 'Chargement' }]}>
        <AppProLoading label="Chargement du dossier…" />
      </AppPage>
    );
  }

  if (isError || !data) {
    return (
      <AppPage title="Dossier de demande" breadcrumb={[{ label: 'Demandes', href: appRoutes.requests }, { label: 'Introuvable' }]}>
        <AppProEmpty
          title="Dossier introuvable"
          description="Cette demande n'existe pas ou n'est pas accessible dans votre périmètre."
          action={
            <button type="button" className="btn-secondary" onClick={() => refetch()}>
              Réessayer
            </button>
          }
        />
      </AppPage>
    );
  }

  return (
    <AppPage
      title="Dossier de demande"
      description={`${data.establishmentName} — ${data.activityTitle ?? 'Activité'}`}
      breadcrumb={[
        { label: 'Demandes', href: appRoutes.requests },
        { label: data.activityTitle ?? 'Dossier' },
      ]}
      action={
        <Link href={appRoutes.requests} className="dash-panel-link app-pro-header-action">
          <ArrowLeft size={14} aria-hidden="true" /> Retour aux demandes
        </Link>
      }
    >
      <AppProPageShell>
        {isHydratingDetail ? (
          <p className="request-detail-sync" role="status" aria-live="polite">
            Chargement du détail du dossier…
          </p>
        ) : null}
        {actionError ? (
          <p className="request-action-feedback request-action-feedback--error" role="alert">
            {actionError}
          </p>
        ) : null}
        {actionSuccess ? (
          <p className="request-action-feedback request-action-feedback--success" role="status">
            {actionSuccess}
          </p>
        ) : null}
        <RequestDetailView
          data={data}
          profile={dashboardData?.profile}
          isPending={transition.isPending}
          checklistDraft={checklistDraft}
          dvsValidationDraft={dvsValidationDraft}
          onChecklistChange={(id, checked) =>
            setChecklistDraft((current) => ({ ...current, [id]: checked }))
          }
          onDvsValidationChange={(id, checked) =>
            setDvsValidationDraft((current) => ({ ...current, [id]: checked }))
          }
          reason={reason}
          onReasonChange={setReason}
          onAction={runAction}
          onReasonSubmit={handleReasonSubmit}
        />
      </AppProPageShell>
    </AppPage>
  );
}
