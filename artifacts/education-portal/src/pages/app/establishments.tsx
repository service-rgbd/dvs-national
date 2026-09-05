import { AppPage } from '@/components/app/AppPage';
import { EstablishmentDirectory } from '@/components/app/establishments/EstablishmentDirectory';
import { EstablishmentScopeBanner } from '@/components/app/establishments/EstablishmentScopeBanner';
import { AppProLoading } from '@/components/app/pro/AppProLoading';
import { AppProPageShell } from '@/components/app/pro/AppProPageShell';
import { useGetAppDashboard } from '@workspace/api-client-react';

export default function AppEstablishmentsPage() {
  const { data, isLoading, isError, refetch } = useGetAppDashboard();

  return (
    <AppPage
      title="Annuaire des établissements"
      description="Référentiel filtré selon votre périmètre — recherche intelligente, filtres et fiches scolaires."
    >
      <AppProPageShell>
        {isLoading ? <AppProLoading label="Chargement du référentiel…" /> : null}

        {isError ? (
          <div className="dash-empty-state" role="alert">
            <p className="dash-empty-state-title">Référentiel indisponible</p>
            <p className="dash-empty">Impossible de charger les données établissements.</p>
            <div className="dash-empty-action">
              <button type="button" className="btn-secondary" onClick={() => refetch()}>
                Réessayer
              </button>
            </div>
          </div>
        ) : null}

        {data && !isLoading ? (
          <>
            <EstablishmentScopeBanner profile={data.profile} kpis={data.kpis} />
            <EstablishmentDirectory />
          </>
        ) : null}
      </AppProPageShell>
    </AppPage>
  );
}
