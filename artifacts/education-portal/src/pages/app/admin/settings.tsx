import { Link } from 'wouter';
import { LogOut, Server } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthLogout } from '@workspace/api-client-react';

import {
  AdminParamGroup,
  AdminSettingsGrid,
  AdminStatusBadge,
} from '@/components/app/admin/AdminParamGroup';
import { AdminShell } from '@/components/app/admin/AdminShell';
import { DashSurface } from '@/components/dash/DashSurface';
import { Button } from '@/components/ui/button';
import {
  ACTIVITY_TYPE_RULES,
  CDC_REFERENCES,
  ENV_PARAM_GROUPS,
  PLATFORM_SETTINGS,
  SECURITY_RULES,
} from '@/config/admin-rules';
import { publicRoutes } from '@/content/routes';

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();

  const logout = useAuthLogout({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        window.location.href = publicRoutes.espaceAgents;
      },
    },
  });

  return (
    <AdminShell sectionId="settings">
      <DashSurface className="admin-sheet">
        <div className="admin-param-stack">
          <AdminParamGroup
            id="admin-platform"
            title="Institution & plateforme"
            description="Identité institutionnelle, sigle PNIGVS et paramètres système."
            cdcRef={CDC_REFERENCES.platform}
            headingId="admin-platform-heading"
            defaultOpen
          >
            <div className="admin-settings-sections">
              {PLATFORM_SETTINGS.map((group) => (
                <section key={group.group} className="admin-settings-block">
                  <h3 className="admin-settings-block-title">{group.group}</h3>
                  <AdminSettingsGrid items={group.items} />
                </section>
              ))}
            </div>
          </AdminParamGroup>

          <AdminParamGroup
            id="admin-security"
            title="Sécurité & contrôle d'accès"
            description="Politiques obligatoires et options prévues."
            cdcRef={CDC_REFERENCES.auth}
            headingId="admin-security-heading"
          >
            <div className="admin-table-desktop">
              <div className="app-pro-admin-table-wrap">
                <table className="app-pro-admin-table">
                  <caption className="sr-only">Règles de sécurité PNIGVS</caption>
                  <thead>
                    <tr>
                      <th scope="col">Paramètre</th>
                      <th scope="col">Valeur / règle</th>
                      <th scope="col">Obligatoire</th>
                      <th scope="col">Réf.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SECURITY_RULES.map((rule) => (
                      <tr key={rule.id}>
                        <td>
                          <strong>{rule.label}</strong>
                        </td>
                        <td>{rule.value}</td>
                        <td>
                          {rule.mandatory ? (
                            <span className="admin-status-badge admin-status-badge--active">Oui</span>
                          ) : (
                            <AdminStatusBadge status="planned" />
                          )}
                        </td>
                        <td>
                          <span className="admin-param-ref admin-param-ref--inline">{rule.cdcRef}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <ul className="admin-cards">
              {SECURITY_RULES.map((rule) => (
                <li key={rule.id} className="admin-card">
                  <p className="admin-card-title">{rule.label}</p>
                  <p className="admin-card-meta">{rule.value}</p>
                  <dl className="admin-card-dl">
                    <div>
                      <dt>Obligatoire</dt>
                      <dd>
                        {rule.mandatory ? (
                          <span className="admin-status-badge admin-status-badge--active">Oui</span>
                        ) : (
                          <AdminStatusBadge status="planned" />
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Réf.</dt>
                      <dd>
                        <span className="admin-param-ref admin-param-ref--inline">{rule.cdcRef}</span>
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </AdminParamGroup>

          <AdminParamGroup
            id="admin-env"
            title="Variables d'environnement"
            description="Secrets et configuration serveur — jamais commités dans le dépôt."
            cdcRef={CDC_REFERENCES.auth}
            headingId="admin-env-heading"
          >
            <div className="admin-env-groups">
              {ENV_PARAM_GROUPS.map((group) => (
                <section key={group.id} className="admin-settings-block">
                  <h3 className="admin-settings-block-title">{group.label}</h3>
                  <p className="app-pro-muted admin-settings-block-desc">{group.description}</p>
                  <div className="admin-table-desktop">
                    <div className="app-pro-admin-table-wrap">
                      <table className="app-pro-admin-table">
                        <caption className="sr-only">{group.label}</caption>
                        <thead>
                          <tr>
                            <th scope="col">Variable</th>
                            <th scope="col">Type</th>
                            <th scope="col">Requis</th>
                            <th scope="col">Règle</th>
                            <th scope="col">Exemple</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.params.map((param) => (
                            <tr key={param.key}>
                              <td>
                                <code>{param.key}</code>
                              </td>
                              <td>{param.type}</td>
                              <td>
                                {param.required ? (
                                  <span className="admin-status-badge admin-status-badge--active">Oui</span>
                                ) : (
                                  'Non'
                                )}
                              </td>
                              <td>{param.rule}</td>
                              <td>{param.example ? <code>{param.example}</code> : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <ul className="admin-cards">
                    {group.params.map((param) => (
                      <li key={param.key} className="admin-card">
                        <p className="admin-card-title">
                          <code>{param.key}</code>
                        </p>
                        <p className="admin-card-meta">{param.rule}</p>
                        <dl className="admin-card-dl">
                          <div>
                            <dt>Type</dt>
                            <dd>{param.type}</dd>
                          </div>
                          <div>
                            <dt>Requis</dt>
                            <dd>
                              {param.required ? (
                                <span className="admin-status-badge admin-status-badge--active">Oui</span>
                              ) : (
                                'Non'
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt>Exemple</dt>
                            <dd>{param.example ? <code>{param.example}</code> : '—'}</dd>
                          </div>
                        </dl>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </AdminParamGroup>

          <AdminParamGroup
            id="admin-activity-types"
            title="Types d'activités scolaires"
            description="Catégories soumises au workflow Établissement → DREN → DVS."
            cdcRef={CDC_REFERENCES.workflow}
            headingId="admin-activity-types-heading"
          >
            <ol className="admin-rules-list">
              {ACTIVITY_TYPE_RULES.map((item) => (
                <li key={item.type}>
                  <strong>
                    {item.order}. {item.type}
                  </strong>{' '}
                  — {item.rule}
                </li>
              ))}
            </ol>
          </AdminParamGroup>

          <AdminParamGroup
            id="admin-session-actions"
            title="Actions session"
            description="Gestion de la session administrateur active."
            headingId="admin-session-actions-heading"
          >
            <div className="app-pro-admin-actions">
              <Button
                type="button"
                variant="outline"
                className="app-pro-btn-outline"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
              >
                <LogOut size={16} aria-hidden="true" />
                {logout.isPending ? 'Déconnexion…' : 'Terminer la session'}
              </Button>
              <Link href={publicRoutes.home} className="dash-panel-link">
                <Server size={14} aria-hidden="true" /> Portail public →
              </Link>
            </div>
          </AdminParamGroup>
        </div>
      </DashSurface>
    </AdminShell>
  );
}
