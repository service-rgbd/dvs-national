import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Activity, Search } from 'lucide-react';
import { useListActivities } from '@workspace/api-client-react';

import { AdminParamGroup, AdminStatusBadge } from '@/components/app/admin/AdminParamGroup';
import { AdminShell } from '@/components/app/admin/AdminShell';
import { AppProLoading } from '@/components/app/pro/AppProLoading';
import { AUDIT_RULES, CDC_REFERENCES } from '@/config/admin-rules';
import { appRoutes } from '@/content/routes';

export default function AdminAuditPage() {
  const { data: activitiesData, isLoading: activitiesLoading } = useListActivities({
    page: 1,
    pageSize: 50,
  });

  const [auditSearch, setAuditSearch] = useState('');
  const [auditSort, setAuditSort] = useState<'date' | 'title' | 'type'>('date');
  const [auditOrder, setAuditOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAudit = useMemo(() => {
    const activities = activitiesData?.data ?? [];
    const query = auditSearch.trim().toLowerCase();

    const rows = query
      ? activities.filter(
          (item) =>
            item.title.toLowerCase().includes(query) ||
            item.type.toLowerCase().includes(query) ||
            (item.description?.toLowerCase().includes(query) ?? false),
        )
      : activities;

    return [...rows].sort((a, b) => {
      let cmp = 0;
      if (auditSort === 'date') {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (auditSort === 'title') {
        cmp = a.title.localeCompare(b.title, 'fr');
      } else {
        cmp = a.type.localeCompare(b.type, 'fr');
      }
      return auditOrder === 'asc' ? cmp : -cmp;
    });
  }, [activitiesData?.data, auditOrder, auditSearch, auditSort]);

  return (
    <AdminShell sectionId="audit">
      <div className="admin-param-stack">
        <AdminParamGroup
          id="admin-audit-rules"
          title="Règles de traçabilité"
          description="Périmètres audités, rétention et conformité CDC §4.9."
          cdcRef={CDC_REFERENCES.audit}
          headingId="admin-audit-rules-heading"
          defaultOpen
        >
          <div className="app-pro-admin-table-wrap">
            <table className="app-pro-admin-table">
              <caption className="sr-only">Règles de traçabilité PNIGVS</caption>
              <thead>
                <tr>
                  <th scope="col">Catégorie</th>
                  <th scope="col">Périmètre</th>
                  <th scope="col">Rétention</th>
                  <th scope="col">Statut</th>
                  <th scope="col">Réf.</th>
                </tr>
              </thead>
              <tbody>
                {AUDIT_RULES.map((rule) => (
                  <tr key={rule.category}>
                    <td>
                      <strong>{rule.category}</strong>
                    </td>
                    <td>{rule.scope}</td>
                    <td>{rule.retention}</td>
                    <td>
                      <AdminStatusBadge status={rule.status} />
                    </td>
                    <td>
                      <span className="admin-param-ref admin-param-ref--inline">{rule.cdcRef}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminParamGroup>

        <AdminParamGroup
          id="admin-audit-log"
          title="Journal d'activité"
          description="Événements métier enregistrés — activités scolaires consultables."
          cdcRef={CDC_REFERENCES.audit}
          headingId="admin-audit-log-heading"
        >
          <div className="app-pro-admin-toolbar">
            <div className="app-directory-field">
              <label htmlFor="admin-audit-search">Rechercher</label>
              <div className="app-directory-search-row">
                <Search size={16} aria-hidden="true" />
                <input
                  id="admin-audit-search"
                  type="search"
                  value={auditSearch}
                  onChange={(event) => setAuditSearch(event.target.value)}
                  placeholder="Titre, type, description…"
                />
              </div>
            </div>
            <div className="app-directory-field">
              <label htmlFor="admin-audit-sort">Tri</label>
              <select
                id="admin-audit-sort"
                className="app-pro-select"
                value={auditSort}
                onChange={(event) => setAuditSort(event.target.value as typeof auditSort)}
              >
                <option value="date">Date</option>
                <option value="title">Titre</option>
                <option value="type">Type</option>
              </select>
            </div>
            <div className="app-directory-field">
              <label htmlFor="admin-audit-order">Ordre</label>
              <select
                id="admin-audit-order"
                className="app-pro-select"
                value={auditOrder}
                onChange={(event) => setAuditOrder(event.target.value as 'asc' | 'desc')}
              >
                <option value="desc">Plus récent</option>
                <option value="asc">Plus ancien</option>
              </select>
            </div>
          </div>

          {activitiesLoading ? (
            <AppProLoading label="Chargement du journal…" inline />
          ) : filteredAudit.length === 0 ? (
            <p className="app-pro-muted">Aucun événement correspondant aux critères.</p>
          ) : (
            <>
              <p className="app-directory-summary" role="status">
                <strong>{filteredAudit.length}</strong> événement
                {filteredAudit.length > 1 ? 's' : ''}
              </p>
              <div className="app-pro-admin-table-wrap">
                <table className="app-pro-admin-table app-pro-audit-table">
                  <caption className="sr-only">Journal d&apos;activité PNIGVS</caption>
                  <thead>
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Type</th>
                      <th scope="col">Titre</th>
                      <th scope="col">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAudit.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <time dateTime={item.createdAt}>
                            {new Date(item.createdAt).toLocaleString('fr-FR')}
                          </time>
                        </td>
                        <td>
                          <span className="app-pro-tag">{item.type}</span>
                        </td>
                        <td>{item.title}</td>
                        <td>{item.description ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="app-pro-admin-actions">
            <Link href={appRoutes.activities} className="dash-panel-link">
              <Activity size={14} aria-hidden="true" /> Toutes les activités →
            </Link>
            <Link href={appRoutes.statistics} className="dash-panel-link">
              Statistiques & rapports →
            </Link>
          </div>
        </AdminParamGroup>
      </div>
    </AdminShell>
  );
}
