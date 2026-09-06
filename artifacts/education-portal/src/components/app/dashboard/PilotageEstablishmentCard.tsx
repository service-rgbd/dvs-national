import { Building2, MapPin } from 'lucide-react';
import { Link } from 'wouter';

import { appRoutes } from '@/content/routes';
import { useGetAppEstablishmentById } from '@workspace/api-client-react';

const TEACHING_ORDER_LABELS: Record<string, string> = {
  LAIC: 'Laïc',
  CATHOLIQUE: 'Catholique',
  ISLAMIQUE: 'Islamique',
  METHODISTE: 'Méthodiste',
  AUTRE_CONFESSION: 'Autre confession',
};

type PilotageEstablishmentCardProps = {
  establishmentId: string;
  fallbackName: string;
};

export function PilotageEstablishmentCard({
  establishmentId,
  fallbackName,
}: PilotageEstablishmentCardProps) {
  const { data } = useGetAppEstablishmentById(establishmentId);

  const name = data?.name ?? fallbackName;
  const cycle = data?.authorizedCycle ?? data?.recognizedCycle;
  const order = data?.teachingOrder ? TEACHING_ORDER_LABELS[data.teachingOrder] ?? data.teachingOrder : null;

  return (
    <section className="pilot-school" aria-labelledby="pilot-school-heading">
      <div className="pilot-school-icon" aria-hidden="true">
        <Building2 size={18} />
      </div>
      <div className="pilot-school-copy">
        <p className="pilot-brief-kicker">Établissement rattaché</p>
        <h2 id="pilot-school-heading">{name}</h2>
        <ul className="pilot-school-facts">
          {data?.establishmentCode ? <li>Code {data.establishmentCode}</li> : null}
          {data?.drena.name ? <li>{data.drena.name}</li> : null}
          {data?.locality.name ? (
            <li>
              <MapPin size={12} aria-hidden="true" />
              {data.locality.name}
            </li>
          ) : null}
          {cycle ? <li>Cycle {cycle}</li> : null}
          {order ? <li>{order}</li> : null}
        </ul>
        <Link href={appRoutes.establishmentDetail(establishmentId)} className="pilot-school-link">
          Voir la fiche
        </Link>
      </div>
    </section>
  );
}
