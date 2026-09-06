import { AdminParamGroup, AdminStatusBadge } from '@/components/app/admin/AdminParamGroup';
import { AdminAccountsManager } from '@/components/app/admin/AdminAccountsManager';
import { AdminShell } from '@/components/app/admin/AdminShell';
import { DashSurface } from '@/components/dash/DashSurface';
import { ACCOUNT_LIFECYCLE_RULES, BOOTSTRAP_COMMAND, CDC_REFERENCES } from '@/config/admin-rules';

const LIFECYCLE_PHASES = [...new Set(ACCOUNT_LIFECYCLE_RULES.map((rule) => rule.phase))];

export default function AdminAccountsPage() {
  return (
    <AdminShell sectionId="accounts">
      <DashSurface className="admin-sheet">
        <div className="admin-param-stack">
          <AdminAccountsManager />

          <AdminParamGroup
            id="admin-lifecycle"
            title="Cycle de vie des comptes"
            description="Phases ordonnées de provisionnement à la suspension — conformité CDC §4.8 et §3."
            cdcRef={CDC_REFERENCES.auth}
            headingId="admin-lifecycle-heading"
            defaultOpen
          >
            {LIFECYCLE_PHASES.map((phase) => {
              const phaseRules = ACCOUNT_LIFECYCLE_RULES.filter((rule) => rule.phase === phase);
              return (
                <section key={phase} className="admin-lifecycle-phase" aria-label={phase}>
                  <h3 className="admin-lifecycle-phase-title">{phase}</h3>
                  <div className="admin-table-desktop">
                    <div className="app-pro-admin-table-wrap">
                      <table className="app-pro-admin-table">
                        <caption className="sr-only">{phase} — règles comptes agents</caption>
                        <thead>
                          <tr>
                            <th scope="col">Ordre</th>
                            <th scope="col">Action</th>
                            <th scope="col">Règle</th>
                            <th scope="col">Réf.</th>
                            <th scope="col">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {phaseRules.map((rule) => (
                            <tr key={rule.order}>
                              <td>{rule.order}</td>
                              <td>
                                <strong>{rule.action}</strong>
                              </td>
                              <td>{rule.rule}</td>
                              <td>
                                <span className="admin-param-ref admin-param-ref--inline">{rule.cdcRef}</span>
                              </td>
                              <td>
                                <AdminStatusBadge status={rule.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <ul className="admin-cards">
                    {phaseRules.map((rule) => (
                      <li key={rule.order} className="admin-card">
                        <p className="admin-card-title">
                          {rule.order}. {rule.action}
                        </p>
                        <dl className="admin-card-dl">
                          <div>
                            <dt>Règle</dt>
                            <dd>{rule.rule}</dd>
                          </div>
                          <div>
                            <dt>Réf.</dt>
                            <dd>
                              <span className="admin-param-ref admin-param-ref--inline">{rule.cdcRef}</span>
                            </dd>
                          </div>
                          <div>
                            <dt>Statut</dt>
                            <dd>
                              <AdminStatusBadge status={rule.status} />
                            </dd>
                          </div>
                        </dl>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </AdminParamGroup>

          <AdminParamGroup
            id="admin-bootstrap"
            title="Provisionnement initial"
            description="Commande CLI et variables obligatoires pour le compte directeur DVS."
            cdcRef={CDC_REFERENCES.auth}
            headingId="admin-bootstrap-heading"
          >
            <dl className="admin-settings-grid">
              <div className="admin-settings-row">
                <dt>Commande bootstrap</dt>
                <dd>
                  <code>{BOOTSTRAP_COMMAND}</code>
                </dd>
              </div>
              <div className="admin-settings-row">
                <dt>Variables requises</dt>
                <dd>
                  <code>PNIGVS_ADMIN_EMAIL</code>, <code>PNIGVS_ADMIN_PASSWORD</code>,{' '}
                  <code>PNIGVS_ADMIN_FULL_NAME</code>
                </dd>
              </div>
              <div className="admin-settings-row">
                <dt>Interface graphique</dt>
                <dd>Création et désactivation des comptes directeurs — voir ci-dessus.</dd>
              </div>
            </dl>
          </AdminParamGroup>
        </div>
      </DashSurface>
    </AdminShell>
  );
}
