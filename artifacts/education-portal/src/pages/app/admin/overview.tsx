import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

import { AdminShell } from '@/components/app/admin/AdminShell';
import { userInitials } from '@/components/app/admin/admin-utils';
import { DashSurface } from '@/components/dash/DashSurface';
import { ADMIN_SECTIONS } from '@/config/admin-sections';
import { ADMIN_FUNDAMENTAL_RULES, CDC_REFERENCES, WORKFLOW_CHAIN } from '@/config/admin-rules';
import '@/styles/admin-overview.css';
import { liveQueryHookOptions } from '@/lib/query-sync';
import { useAuthMe, useGetAppDashboard } from '@workspace/api-client-react';

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  locked: 'Verrouillé',
  pending_verification: 'En attente de validation',
};

const SECTION_HINTS: Record<string, string> = {
  accounts: 'Cycle de vie et provisionnement',
  roles: 'RBAC, modules et workflow',
  settings: 'Institution, sécurité, variables',
  audit: 'Activités ↔ dossiers d’autorisation',
};

export default function AdminOverviewPage() {
  const { data } = useAuthMe();
  const { data: dashboard } = useGetAppDashboard(liveQueryHookOptions());
  const user = data?.user;
  const isDirector = user?.roles.some((role) => role.code === 'dvs_director') ?? false;
  const shortcuts = ADMIN_SECTIONS.filter((section) => section.id !== 'overview');

  return (
    <AdminShell sectionId="overview">
      <div className="admin-overview">
        <DashSurface className="admin-overview-sheet">
          <header className="admin-overview-hero">
            {user ? (
              <>
                <span className="admin-overview-avatar" aria-hidden="true">
                  {userInitials(user.fullName)}
                </span>
                <div className="admin-overview-hero-copy">
                  <p className="admin-overview-kicker">Session administrateur</p>
                  <h2>{user.fullName}</h2>
                  <p className="admin-overview-meta">
                    {user.email}
                    <span aria-hidden="true">·</span>
                    {user.roles[0]?.label ?? '—'}
                    <span aria-hidden="true">·</span>
                    {dashboard?.profile.scopeLabel ?? 'Périmètre DVS'}
                  </p>
                </div>
                <div className="admin-overview-hero-aside">
                  <span className={`admin-overview-status${isDirector ? ' is-full' : ''}`}>
                    {isDirector ? 'Accès complet' : 'Accès DVS limité'}
                  </span>
                  <span className="admin-overview-status-note">
                    {STATUS_LABELS[user.status] ?? user.status}
                  </span>
                </div>
              </>
            ) : (
              <p className="admin-overview-empty">Session non disponible.</p>
            )}
          </header>

          <dl className="admin-overview-kpis" aria-label="Indicateurs du périmètre">
            <div>
              <dt>Établissements</dt>
              <dd>{dashboard ? dashboard.kpis.establishments.toLocaleString('fr-FR') : '—'}</dd>
            </div>
            <div>
              <dt>Activités</dt>
              <dd>{dashboard ? dashboard.kpis.activities.toLocaleString('fr-FR') : '—'}</dd>
            </div>
            <div>
              <dt>Dossiers en cours</dt>
              <dd>
                {dashboard
                  ? (dashboard.kpis.requestsPending + dashboard.kpis.requestsUnderReview).toLocaleString('fr-FR')
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>Périmètre</dt>
              <dd>{dashboard?.profile.scopeLabel ?? '—'}</dd>
            </div>
          </dl>

          <div className="admin-overview-split">
            <section className="admin-overview-panel" aria-labelledby="admin-rules-heading">
              <h3 id="admin-rules-heading">Règles fondamentales</h3>
              <p className="admin-overview-lead">{CDC_REFERENCES.profiles}</p>
              <ol className="admin-overview-rules">
                {ADMIN_FUNDAMENTAL_RULES.map((rule, index) => (
                  <li key={rule}>
                    <em>{index + 1}</em>
                    <span>{rule}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="admin-overview-panel" aria-labelledby="admin-chain-heading">
              <h3 id="admin-chain-heading">Chaîne de validation</h3>
              <p className="admin-overview-lead">{CDC_REFERENCES.workflow}</p>
              <ol className="admin-overview-chain">
                {WORKFLOW_CHAIN.map((step) => (
                  <li key={step.step}>
                    <span className="admin-overview-step">{step.step}</span>
                    <strong>{step.actor}</strong>
                    <span>{step.action}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <nav className="admin-overview-links" aria-label="Sections administration">
            {shortcuts.map((section) => {
              const Icon = section.icon;
              return (
                <Link key={section.id} href={section.href} className="admin-overview-link">
                  <span className="admin-overview-link-icon" aria-hidden="true">
                    <Icon size={16} />
                  </span>
                  <span>
                    <strong>{section.label}</strong>
                    <em>{SECTION_HINTS[section.id]}</em>
                  </span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              );
            })}
          </nav>
        </DashSurface>
      </div>
    </AdminShell>
  );
}
