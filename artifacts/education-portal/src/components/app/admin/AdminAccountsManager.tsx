import { FormEvent, useMemo, useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { userInitials } from '@/components/app/admin/admin-utils';
import { AdminParamGroup } from '@/components/app/admin/AdminParamGroup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { invalidateAdminUsers } from '@/lib/query-sync';
import {
  useCreateAdminUser,
  useListAdminUsers,
  useListAppEstablishments,
  useUpdateAdminUser,
} from '@workspace/api-client-react';

type AdminAccountsManagerProps = {
  headingId?: string;
};

export function AdminAccountsManager({ headingId = 'admin-accounts-manager-heading' }: AdminAccountsManagerProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [roleCode, setRoleCode] = useState<'school_head_primary' | 'school_head_secondary'>(
    'school_head_primary',
  );
  const [establishmentId, setEstablishmentId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { data: usersData, isLoading: usersLoading } = useListAdminUsers({
    page: 1,
    pageSize: 50,
    search: search.trim() || undefined,
  });

  const { data: establishmentsData } = useListAppEstablishments({
    page: 1,
    pageSize: 100,
    status: 'active',
  });

  const createUser = useCreateAdminUser({
    mutation: {
      onSuccess: async () => {
        await invalidateAdminUsers(queryClient);
        setEmail('');
        setFullName('');
        setPassword('');
        setEstablishmentId('');
        setFormError(null);
      },
      onError: () => setFormError('Impossible de créer le compte. Vérifiez les champs.'),
    },
  });

  const updateUser = useUpdateAdminUser({
    mutation: {
      onSuccess: async () => {
        await invalidateAdminUsers(queryClient);
      },
    },
  });

  const establishments = establishmentsData?.data ?? [];
  const users = usersData?.data ?? [];

  const establishmentOptions = useMemo(
    () =>
      establishments.map((item) => ({
        id: item.id,
        label: `${item.name} (${item.establishmentCode})`,
      })),
    [establishments],
  );

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    createUser.mutate({
      data: {
        email: email.trim(),
        fullName: fullName.trim(),
        password,
        roleCode,
        establishmentId,
      },
    });
  }

  function toggleStatus(userId: string, currentStatus: string) {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateUser.mutate({ id: userId, data: { status: nextStatus } });
  }

  return (
    <AdminParamGroup
      id="admin-accounts-manager"
      title="Comptes directeurs / fondateurs"
      description="Création et gestion des comptes établissement — réservée à la DVS."
      cdcRef="CDC §3 — Profils utilisateurs"
      headingId={headingId}
      defaultOpen
    >
      <form className="app-pro-form admin-accounts-form" onSubmit={handleCreate}>
        <p className="admin-accounts-intro">
          Seuls les directeurs ou fondateurs d&apos;école (primaire ou secondaire) peuvent recevoir
          un compte opérationnel.
        </p>

        <div className="admin-accounts-form-grid">
          <div className="form-field">
            <label htmlFor="admin-user-fullname">Nom complet</label>
            <Input
              id="admin-user-fullname"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="admin-user-email">E-mail</label>
            <Input
              id="admin-user-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="admin-user-password">Mot de passe initial (12 car. min.)</label>
            <Input
              id="admin-user-password"
              type="password"
              minLength={12}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="admin-user-role">Profil</label>
            <select
              id="admin-user-role"
              className="app-pro-select"
              value={roleCode}
              onChange={(event) =>
                setRoleCode(event.target.value as 'school_head_primary' | 'school_head_secondary')
              }
            >
              <option value="school_head_primary">Chef d&apos;établissement primaire</option>
              <option value="school_head_secondary">Chef d&apos;établissement secondaire</option>
            </select>
          </div>
          <div className="form-field admin-accounts-establishment-field">
            <label htmlFor="admin-user-establishment">Établissement</label>
            <select
              id="admin-user-establishment"
              className="app-pro-select"
              value={establishmentId}
              onChange={(event) => setEstablishmentId(event.target.value)}
              required
            >
              <option value="">Sélectionner…</option>
              {establishmentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {formError ? (
          <p className="admin-accounts-error" role="alert">
            {formError}
          </p>
        ) : null}

        <Button type="submit" disabled={createUser.isPending} className="admin-accounts-submit">
          {createUser.isPending ? (
            <>
              <Loader2 className="animate-spin" size={16} aria-hidden="true" /> Création…
            </>
          ) : (
            <>
              <UserPlus size={16} aria-hidden="true" /> Créer le compte
            </>
          )}
        </Button>
      </form>

      <div className="admin-accounts-list-head">
        <h3>Comptes existants</h3>
        <Input
          type="search"
          placeholder="Rechercher par nom ou e-mail…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Rechercher un compte"
        />
      </div>

      {usersLoading ? (
        <p className="admin-accounts-empty">Chargement des comptes…</p>
      ) : users.length === 0 ? (
        <p className="admin-accounts-empty">Aucun compte directeur enregistré.</p>
      ) : (
        <>
          <div className="admin-table-desktop">
            <div className="app-pro-admin-table-wrap">
              <table className="app-pro-admin-table">
                <caption className="sr-only">Comptes directeurs et fondateurs</caption>
                <thead>
                  <tr>
                    <th scope="col">Nom</th>
                    <th scope="col">E-mail</th>
                    <th scope="col">Profil</th>
                    <th scope="col">Établissement</th>
                    <th scope="col">Statut</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>{user.roleLabel}</td>
                      <td>{user.establishmentName ?? '—'}</td>
                      <td>
                        <span
                          className={`admin-status-badge admin-status-badge--${user.status === 'active' ? 'active' : 'inactive'}`}
                        >
                          {user.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-secondary btn-secondary--sm"
                          disabled={updateUser.isPending}
                          onClick={() => toggleStatus(user.id, user.status)}
                        >
                          {user.status === 'active' ? 'Désactiver' : 'Activer'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ul className="admin-cards">
            {users.map((user) => (
              <li key={user.id} className="admin-card">
                <div className="admin-card-head">
                  <span className="admin-card-avatar" aria-hidden="true">
                    {userInitials(user.fullName)}
                  </span>
                  <div>
                    <p className="admin-card-title">{user.fullName}</p>
                    <p className="admin-card-meta">{user.email}</p>
                  </div>
                </div>
                <dl className="admin-card-dl">
                  <div>
                    <dt>Profil</dt>
                    <dd>{user.roleLabel}</dd>
                  </div>
                  <div>
                    <dt>Établissement</dt>
                    <dd>{user.establishmentName ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>Statut</dt>
                    <dd>
                      <span
                        className={`admin-status-badge admin-status-badge--${user.status === 'active' ? 'active' : 'inactive'}`}
                      >
                        {user.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </dd>
                  </div>
                </dl>
                <div className="admin-card-actions">
                  <button
                    type="button"
                    className="btn-secondary btn-secondary--sm"
                    disabled={updateUser.isPending}
                    onClick={() => toggleStatus(user.id, user.status)}
                  >
                    {user.status === 'active' ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </AdminParamGroup>
  );
}
