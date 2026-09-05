import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getGetAppEstablishmentByIdQueryOptions } from '@workspace/api-client-react';

import { AppPage } from '@/components/app/AppPage';
import { EstablishmentDetailView } from '@/components/app/establishments/EstablishmentDetailView';
import { AppProEmpty } from '@/components/app/pro/AppProEmpty';
import { AppProLoading } from '@/components/app/pro/AppProLoading';
import { AppProPageShell } from '@/components/app/pro/AppProPageShell';
import { appRoutes } from '@/content/routes';

export default function AppEstablishmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? '';

  const { data, isLoading, isError, refetch } = useQuery({
    ...getGetAppEstablishmentByIdQueryOptions(id),
    enabled: Boolean(id),
  });

  if (!id) {
    return (
      <AppPage
        title="Fiche introuvable"
        breadcrumb={[
          { label: 'Établissements', href: appRoutes.establishments },
          { label: 'Erreur' },
        ]}
      >
        <AppProEmpty title="Identifiant manquant" description="Aucun établissement spécifié." />
      </AppPage>
    );
  }

  if (isLoading) {
    return (
      <AppPage
        title="Fiche établissement"
        breadcrumb={[
          { label: 'Établissements', href: appRoutes.establishments },
          { label: 'Chargement' },
        ]}
      >
        <AppProLoading label="Chargement de la fiche scolaire…" />
      </AppPage>
    );
  }

  if (isError || !data) {
    return (
      <AppPage
        title="Fiche établissement"
        breadcrumb={[
          { label: 'Établissements', href: appRoutes.establishments },
          { label: 'Introuvable' },
        ]}
      >
        <AppProEmpty
          title="Fiche indisponible"
          description="Cet établissement n'existe pas ou n'est pas accessible dans votre périmètre."
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
      title={data.name}
      breadcrumb={[
        { label: 'Établissements', href: appRoutes.establishments },
        { label: data.name },
      ]}
      action={
        <Link href={appRoutes.establishments} className="dash-panel-link app-pro-header-action">
          <ArrowLeft size={14} aria-hidden="true" /> Retour à l&apos;annuaire
        </Link>
      }
    >
      <AppProPageShell>
        <EstablishmentDetailView data={data} />
      </AppProPageShell>
    </AppPage>
  );
}
