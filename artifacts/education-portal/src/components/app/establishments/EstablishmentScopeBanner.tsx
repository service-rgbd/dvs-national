import { Building2, MapPinned, Users } from 'lucide-react';
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
        <p className="est-scope-banner-eyebrow">{kind}</p>
        <h2 id="est-scope-heading">{profile.scopeLabel}</h2>
        <p className="est-scope-banner-role">{profile.primaryRoleLabel}</p>
      </div>

      <ul className="est-scope-banner-stats">
        <li>
          <Building2 size={14} aria-hidden="true" />
          <strong>{kpis.establishments.toLocaleString('fr-FR')}</strong>
          <span>Établissements</span>
        </li>
        <li>
          <Users size={14} aria-hidden="true" />
          <strong>{kpis.activities.toLocaleString('fr-FR')}</strong>
          <span>Activités</span>
        </li>
        <li>
          <MapPinned size={14} aria-hidden="true" />
          <strong>{(kpis.requestsPending + kpis.requestsUnderReview).toLocaleString('fr-FR')}</strong>
          <span>En cours</span>
        </li>
      </ul>
    </section>
  );
}
