import { useAuthMe } from '@workspace/api-client-react';

import { AdminNavCards } from '@/components/app/admin/AdminNavCards';
import { AdminParamGroup } from '@/components/app/admin/AdminParamGroup';
import { AdminShell } from '@/components/app/admin/AdminShell';
import { userInitials } from '@/components/app/admin/admin-utils';
import { ADMIN_FUNDAMENTAL_RULES, CDC_REFERENCES, WORKFLOW_CHAIN } from '@/config/admin-rules';

export default function AdminOverviewPage() {
  const { data } = useAuthMe();
  const user = data?.user;
  const isDirector = user?.roles.some((role) => role.code === 'dvs_director') ?? false;

  return (
    <AdminShell sectionId="overview">
      <div className="admin-param-stack">
        <AdminParamGroup
          id="admin-session"
          title="Session active"
          description="Administrateur connecté et niveau d'accès."
          cdcRef={CDC_REFERENCES.rbac}
          headingId="admin-session-heading"
          defaultOpen
        >
          {user ? (
            <>
              <dl className="app-pro-admin-kpi-row">
                <div className="app-pro-admin-kpi">
                  <dt>Identité</dt>
                  <dd>{user.fullName}</dd>
                </div>
                <div className="app-pro-admin-kpi">
                  <dt>Statut</dt>
                  <dd>{user.status}</dd>
                </div>
                <div className="app-pro-admin-kpi">
                  <dt>Rôle principal</dt>
                  <dd>{user.roles[0]?.label ?? '—'}</dd>
                </div>
              </dl>
              <div className="app-pro-profile-hero app-pro-admin-hero">
                <span className="app-pro-profile-avatar" aria-hidden="true">
                  {userInitials(user.fullName)}
                </span>
                <div>
                  <p className="app-pro-muted">{user.email}</p>
                  <span className="app-pro-admin-badge">
                    {isDirector ? 'Accès administrateur complet' : 'Accès DVS limité'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="app-pro-muted">Session non disponible.</p>
          )}
        </AdminParamGroup>

        <AdminParamGroup
          id="admin-rules"
          title="Règles fondamentales PNIGVS"
          description="Principes non négociables du cahier des charges."
          cdcRef={CDC_REFERENCES.profiles}
          headingId="admin-rules-heading"
        >
          <ol className="admin-rules-list">
            {ADMIN_FUNDAMENTAL_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </AdminParamGroup>

        <AdminParamGroup
          id="admin-chain"
          title="Chaîne de validation"
          description="Ordre officiel du workflow demandes d'autorisation."
          cdcRef={CDC_REFERENCES.workflow}
          headingId="admin-chain-heading"
        >
          <ol className="admin-workflow-chain">
            {WORKFLOW_CHAIN.map((step) => (
              <li key={step.step}>
                <span className="admin-workflow-step">{step.step}</span>
                <div>
                  <strong>{step.actor}</strong>
                  <p>{step.action}</p>
                </div>
              </li>
            ))}
          </ol>
        </AdminParamGroup>

        <AdminParamGroup
          id="admin-nav"
          title="Accès aux sections"
          description="Navigation vers chaque domaine de paramétrage."
          headingId="admin-nav-heading"
        >
          <AdminNavCards />
        </AdminParamGroup>
      </div>
    </AdminShell>
  );
}
