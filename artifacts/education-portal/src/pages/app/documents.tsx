import { useState } from 'react';
import { Plus } from 'lucide-react';

import { AppPage } from '@/components/app/AppPage';
import { PilotageKpiBand } from '@/components/app/dashboard/PilotageKpiBand';
import { DocumentComposeDialog } from '@/components/app/documents/DocumentComposeDialog';
import { DocumentList } from '@/components/app/DocumentList';
import { AppProEmpty } from '@/components/app/pro/AppProEmpty';
import { AppProLoading } from '@/components/app/pro/AppProLoading';
import { AppProPageShell } from '@/components/app/pro/AppProPageShell';
import { DashFilterBar } from '@/components/dash/DashFilterBar';
import { DashSurface } from '@/components/dash/DashSurface';
import {
  DOCUMENT_CATEGORY_DESCRIPTIONS,
  DOCUMENT_CATEGORY_LABELS,
  documentCategories,
  type DocumentCategory,
} from '@/config/document-labels';
import { liveQueryHookOptions } from '@/lib/query-sync';
import { useAuthMe, useGetAppDashboard, useListAppDocuments } from '@workspace/api-client-react';

export default function AppDocumentsPage() {
  const { data: authData } = useAuthMe();
  const { data: dashboard } = useGetAppDashboard(liveQueryHookOptions());
  const roleCodes = authData?.user.roles.map((role) => role.code) ?? [];
  const canPublishPublic = roleCodes.some(
    (code) => code === 'dvs_director' || code === 'dvs_staff',
  );

  const [composeOpen, setComposeOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | ''>('');

  const { data, isLoading, isError, refetch } = useListAppDocuments(
    {
      page: 1,
      pageSize: 30,
      category: categoryFilter || undefined,
    },
    liveQueryHookOptions(),
  );

  const documents = data?.data ?? [];
  const totalDocuments = data?.pagination.total ?? documents.length;
  const activeRequests = dashboard
    ? dashboard.kpis.requestsPending + dashboard.kpis.requestsUnderReview
    : 0;
  const filterHint = categoryFilter ? DOCUMENT_CATEGORY_DESCRIPTIONS[categoryFilter] : undefined;

  return (
    <AppPage
      title="Fichiers"
      description="Dépôt, consultation et téléchargement des documents de vie scolaire."
      action={
        <button type="button" className="dash-chip-btn" onClick={() => setComposeOpen(true)}>
          <Plus size={14} aria-hidden="true" />
          Déposer un fichier
        </button>
      }
    >
      <AppProPageShell>
        <DocumentComposeDialog
          open={composeOpen}
          onOpenChange={setComposeOpen}
          canPublishPublic={canPublishPublic}
        />

        {dashboard ? (
          <PilotageKpiBand
            items={[
              {
                id: 'documents',
                icon: 'files',
                label: 'Documents',
                value: totalDocuments,
                hint: 'Votre périmètre',
              },
              {
                id: 'buildings',
                icon: 'buildings',
                label: 'Établissements',
                value: dashboard.kpis.establishments,
                hint: 'Référentiel visible',
              },
              {
                id: 'activities',
                icon: 'activities',
                label: 'Activités',
                value: dashboard.kpis.activities,
                hint: 'Sorties et événements',
              },
              {
                id: 'requests',
                icon: 'inbox',
                label: 'Demandes actives',
                value: activeRequests,
                hint: 'En cours dans le circuit',
              },
            ]}
          />
        ) : null}

        <DashSurface className="document-library">
          <DashFilterBar
            filters={[
              {
                id: 'category',
                label: 'Catégorie',
                value: categoryFilter,
                onChange: (value) => setCategoryFilter(value as DocumentCategory | ''),
                options: [
                  { value: '', label: 'Toutes les catégories' },
                  ...documentCategories.map((item) => ({
                    value: item,
                    label: DOCUMENT_CATEGORY_LABELS[item],
                  })),
                ],
              },
            ]}
          />

          <p className="dash-filter-hint">
            {isLoading
              ? 'Chargement…'
              : `${totalDocuments.toLocaleString('fr-FR')} document${totalDocuments > 1 ? 's' : ''}`}
            {filterHint ? ` · ${filterHint}` : ''}
            {categoryFilter ? (
              <>
                {' · '}
                <button
                  type="button"
                  className="app-directory-reset-inline"
                  onClick={() => setCategoryFilter('')}
                >
                  Réinitialiser
                </button>
              </>
            ) : null}
          </p>

          {isLoading ? <AppProLoading label="Chargement des documents…" inline /> : null}

          {isError ? (
            <AppProEmpty
              title="Chargement impossible"
              description="L'API documentaire est indisponible."
              action={
                <button type="button" className="dash-chip-btn" onClick={() => refetch()}>
                  Réessayer
                </button>
              }
            />
          ) : null}

          {!isLoading && !isError ? (
            <DocumentList
              documents={documents}
              emptyTitle="Aucun fichier dans cette catégorie"
              emptyDescription="Déposez un document scolaire ou changez le filtre."
              onDeposit={() => setComposeOpen(true)}
            />
          ) : null}
        </DashSurface>
      </AppProPageShell>
    </AppPage>
  );
}
