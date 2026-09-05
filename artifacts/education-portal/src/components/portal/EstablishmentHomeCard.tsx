import { ArrowRight, Building2, MapPin } from 'lucide-react';
import { Link } from 'wouter';
import type { EstablishmentSummary } from '@workspace/api-client-react';

import { publicRoutes } from '@/content/routes';

type EstablishmentHomeCardProps = {
  establishment: EstablishmentSummary;
  testId?: string;
};

function cycleLabel(cycle: string | null | undefined): string {
  if (!cycle) return '—';
  if (cycle.includes('1') && cycle.includes('2')) return 'Primaire & secondaire';
  if (cycle.includes('2')) return 'Secondaire';
  if (cycle.includes('1')) return 'Primaire';
  return cycle;
}

export function EstablishmentHomeCard({ establishment, testId }: EstablishmentHomeCardProps) {
  return (
    <article className="est-home-card" data-testid={testId}>
      <Link href={publicRoutes.establishmentDetail(establishment.id)} className="est-home-card-link">
        <div className="est-home-card-icon" aria-hidden="true">
          <Building2 size={22} strokeWidth={1.75} />
        </div>
        <div className="est-home-card-body">
          <p className="est-home-card-code">
            <code>{establishment.establishmentCode}</code>
          </p>
          <h3>{establishment.name}</h3>
          <p className="est-home-card-meta">
            <MapPin size={14} aria-hidden="true" />
            {establishment.locality.name} · {establishment.drena.name}
          </p>
          <ul className="est-home-card-facts">
            <li>
              <span>Ordre</span>
              <strong>{establishment.teachingOrder ?? '—'}</strong>
            </li>
            <li>
              <span>Cycle</span>
              <strong>{cycleLabel(establishment.authorizedCycle)}</strong>
            </li>
          </ul>
        </div>
        <span className="est-home-card-action">
          Voir la fiche <ArrowRight size={16} aria-hidden="true" />
        </span>
      </Link>
    </article>
  );
}
