import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useAuthMe } from '@workspace/api-client-react';

import { AdminParamGroup } from '@/components/app/admin/AdminParamGroup';
import { AdminShell } from '@/components/app/admin/AdminShell';
import {
  CDC_REFERENCES,
  MODULE_PERMISSION_MATRIX,
  RBAC_PROFILES,
  RBAC_TIERS,
  WORKFLOW_RULES,
  type RbacTier,
} from '@/config/admin-rules';

export default function AdminRolesPage() {
  const { data } = useAuthMe();
  const user = data?.user;
  const [roleSearch, setRoleSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<RbacTier | 'all'>('all');

  const filteredProfiles = useMemo(() => {
    const query = roleSearch.trim().toLowerCase();
    return RBAC_PROFILES.filter((profile) => {
      const matchesTier = tierFilter === 'all' || profile.tier === tierFilter;
      if (!matchesTier) return false;
      if (!query) return true;
      return (
        profile.code.toLowerCase().includes(query) ||
        profile.category.toLowerCase().includes(query) ||
        profile.role.toLowerCase().includes(query) ||
        profile.perimeter.toLowerCase().includes(query) ||
        profile.moduleAccess.toLowerCase().includes(query)
      );
    }).sort((a, b) => {
      const tierOrder =
        RBAC_TIERS.find((tier) => tier.id === a.tier)!.order -
        RBAC_TIERS.find((tier) => tier.id === b.tier)!.order;
      if (tierOrder !== 0) return tierOrder;
      return a.category.localeCompare(b.category, 'fr');
    });
  }, [roleSearch, tierFilter]);

  return (
    <AdminShell sectionId="roles">
      <div className="admin-param-stack">
        {user && user.roles.length > 0 ? (
          <AdminParamGroup
            id="admin-my-roles"
            title="Vos rôles actifs"
            description="Profils RBAC attribués à la session en cours."
            cdcRef={CDC_REFERENCES.rbac}
            headingId="admin-my-roles-heading"
            defaultOpen
          >
            <ul className="app-pro-role-list">
              {user.roles.map((role) => (
                <li key={role.code}>
                  <strong>{role.label}</strong>
                  <span className="app-pro-tag">{role.code}</span>
                </li>
              ))}
            </ul>
          </AdminParamGroup>
        ) : null}

        <AdminParamGroup
          id="admin-rbac"
          title="Profils RBAC par niveau"
          description="Hiérarchie national → régional → établissement → partenaire."
          cdcRef={CDC_REFERENCES.profiles}
          headingId="admin-rbac-heading"
          defaultOpen={!user?.roles.length}
        >
          <div className="app-pro-admin-toolbar">
            <div className="app-directory-field">
              <label htmlFor="admin-role-search">Rechercher un profil</label>
              <div className="app-directory-search-row">
                <Search size={16} aria-hidden="true" />
                <input
                  id="admin-role-search"
                  type="search"
                  value={roleSearch}
                  onChange={(event) => setRoleSearch(event.target.value)}
                  placeholder="Code, profil, périmètre…"
                />
              </div>
            </div>
            <div className="app-directory-field">
              <label htmlFor="admin-role-tier">Niveau</label>
              <select
                id="admin-role-tier"
                className="app-pro-select"
                value={tierFilter}
                onChange={(event) => setTierFilter(event.target.value as RbacTier | 'all')}
              >
                <option value="all">Tous les niveaux</option>
                {RBAC_TIERS.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="app-directory-summary" role="status">
            <strong>{filteredProfiles.length}</strong>{' '}
            {filteredProfiles.length > 1 ? 'profils affichés' : 'profil affiché'}
          </p>

          <div className="app-pro-admin-table-wrap">
            <table className="app-pro-admin-table">
              <caption className="sr-only">Profils RBAC PNIGVS par niveau</caption>
              <thead>
                <tr>
                  <th scope="col">Niveau</th>
                  <th scope="col">Code</th>
                  <th scope="col">Profil</th>
                  <th scope="col">Périmètre</th>
                  <th scope="col">Accès</th>
                  <th scope="col">Modules</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((profile) => (
                  <tr key={profile.code}>
                    <td>
                      <span className="app-pro-tag">
                        {RBAC_TIERS.find((tier) => tier.id === profile.tier)?.label ?? profile.tier}
                      </span>
                    </td>
                    <td>
                      <code>{profile.code}</code>
                    </td>
                    <td>{profile.category}</td>
                    <td>{profile.perimeter}</td>
                    <td>{profile.accessLevel}</td>
                    <td>{profile.moduleAccess}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminParamGroup>

        <AdminParamGroup
          id="admin-modules"
          title="Matrice modules applicatifs"
          description="Modules PNIGVS et rôles autorisés par fonctionnalité."
          cdcRef={CDC_REFERENCES.rbac}
          headingId="admin-modules-heading"
        >
          <div className="app-pro-admin-table-wrap">
            <table className="app-pro-admin-table">
              <caption className="sr-only">Matrice modules et permissions</caption>
              <thead>
                <tr>
                  <th scope="col">Module</th>
                  <th scope="col">Description</th>
                  <th scope="col">Rôles autorisés</th>
                  <th scope="col">Réf.</th>
                </tr>
              </thead>
              <tbody>
                {MODULE_PERMISSION_MATRIX.map((row) => (
                  <tr key={row.moduleId}>
                    <td>
                      <strong>{row.module}</strong>
                    </td>
                    <td>{row.description}</td>
                    <td>{row.authorizedRoles}</td>
                    <td>
                      <span className="admin-param-ref admin-param-ref--inline">{row.cdcRef}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminParamGroup>

        <AdminParamGroup
          id="admin-workflow-rules"
          title="Règles de transition workflow"
          description="Actions autorisées, statuts source/cible et rôles validateurs."
          cdcRef={CDC_REFERENCES.workflow}
          headingId="admin-workflow-rules-heading"
        >
          <div className="app-pro-admin-table-wrap">
            <table className="app-pro-admin-table">
              <caption className="sr-only">Règles workflow demandes d'autorisation</caption>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Action</th>
                  <th scope="col">De</th>
                  <th scope="col">Vers</th>
                  <th scope="col">Rôles</th>
                  <th scope="col">Règle</th>
                </tr>
              </thead>
              <tbody>
                {WORKFLOW_RULES.map((rule) => (
                  <tr key={rule.action}>
                    <td>{rule.order}</td>
                    <td>
                      <strong>{rule.actionLabel}</strong>
                      <br />
                      <code>{rule.action}</code>
                    </td>
                    <td>{rule.fromLabel}</td>
                    <td>{rule.toLabel}</td>
                    <td>{rule.authorizedRoles}</td>
                    <td>{rule.rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminParamGroup>
      </div>
    </AdminShell>
  );
}
