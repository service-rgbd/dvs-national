import { AlertCircle } from 'lucide-react';
import { Link } from 'wouter';

import { PublicPage } from '@/components/portal/PublicPage';
import { publicRoutes } from '@/content/routes';

export default function NotFound() {
  return (
    <PublicPage
      title="Page introuvable"
      description="La page demandée n'existe pas ou a été déplacée."
      seoDescription="Erreur 404 — page introuvable sur le portail PNIGVS."
      breadcrumbs={[
        { label: 'Accueil', href: publicRoutes.home },
        { label: 'Page introuvable' },
      ]}
    >
      <div className="empty-state" role="alert">
        <div className="empty-state-icon">
          <AlertCircle size={40} aria-hidden="true" />
        </div>
        <h2>Erreur 404</h2>
        <p>
          Vérifiez l'adresse saisie ou retournez à l'accueil du portail PNIGVS.
        </p>
        <div className="empty-state-action">
          <Link href={publicRoutes.home} className="outline-btn">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </PublicPage>
  );
}
