import { Building2, MapPinned, ShieldCheck, Users } from 'lucide-react';
import type { AppDashboardResponse } from '@workspace/api-client-react';

type EstablishmentScopeBannerProps = {
  profile: AppDashboardResponse['profile'];
  kpis: AppDashboardResponse['kpis'];
};

function scopeKind(profile: AppDashboardResponse['profile']): string {
  if (profile.establishmentId) return 'Établissement';
  if (profile.drenaId) return 'DRENA';
  if (profile.regionId) return 'Région';
  return 'National';
}

export function EstablishmentScopeBanner({ profile, kpis }: EstablishmentScopeBannerProps) {
  const kind = scopeKind(profile);

  return (
    <section className="est-scope-banner" aria-labelledby="est-scope-heading">
      <div className="est-scope-banner-main">
        <div className="est-scope-banner-icon" aria-hidden="true">
          <ShieldCheck size={22} strokeWidth={1.75} />
        </div>
        <div className="est-scope-banner-copy">
          <p className="est-scope-banner-eyebrow">Filtrage RBAC actif</p>
          <h2 id="est-scope-heading">{profile.scopeLabel}</h2>
          <p className="est-scope-banner-role">
            <span className="est-scope-banner-badge">{kind}</span>
            {profile.primaryRoleLabel}
          </p>
        </div>
      </div>

      <ul className="est-scope-banner-stats">
        <li>
          <Building2 size={16} aria-hidden="true" />
          <div>
            <strong>{kpis.establishments.toLocaleString('fr-FR')}</strong>
            <span>Établissements visibles</span>
          </div>
        </li>
        <li>
          <Users size={16} aria-hidden="true" />
          <div>
            <strong>{kpis.activities.toLocaleString('fr-FR')}</strong>
            <span>Activités liées</span>
          </div>
        </li>
        <li>
          <MapPinned size={16} aria-hidden="true" />
          <div>
            <strong>{(kpis.requestsPending + kpis.requestsUnderReview).toLocaleString('fr-FR')}</strong>
            <span>Demandes en cours</span>
          </div>
        </li>
      </ul>
    </section>
  );
}
