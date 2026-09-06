import { Check, X } from 'lucide-react';
import { Link } from 'wouter';

import { DrenContactButton } from '@/components/app/layout/DrenContactButton';
import { getAccessibleModules, getPrimaryRoleCode } from '@/config/app-modules';
import { getRequestActorConfig } from '@/config/request-permissions';
import type { AppDashboardProfile, AuthUser } from '@workspace/api-client-react';

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  locked: 'Verrouillé',
  pending_verification: 'En attente de validation',
};

function statusTone(status: string): 'success' | 'warning' | 'neutral' {
  if (status === 'active') return 'success';
  if (status === 'pending_verification') return 'warning';
  return 'neutral';
}

export function userInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

type ProfileHeadProps = {
  user: AuthUser;
  profile?: AppDashboardProfile;
};

export function ProfileHead({ user, profile }: ProfileHeadProps) {
  return (
    <header className="profile-hero" id="profile-identity">
      <span className="profile-avatar" aria-hidden="true">
        {userInitials(user.fullName)}
      </span>
      <div className="profile-hero-copy">
        <h2 className="profile-name">{user.fullName}</h2>
        <p className="profile-hero-line">
          {user.email}
          <span aria-hidden="true">·</span>
          {profile?.primaryRoleLabel ?? user.roles[0]?.label ?? '—'}
          <span aria-hidden="true">·</span>
          {profile?.scopeLabel ?? '—'}
        </p>
      </div>
      <div className="profile-hero-actions">
        <DrenContactButton variant="chip" />
        <span className={`profile-status profile-status--${statusTone(user.status)}`}>
          {STATUS_LABELS[user.status] ?? user.status}
        </span>
      </div>
    </header>
  );
}

type ProfileDetailsProps = {
  user: AuthUser;
  profile?: AppDashboardProfile;
};

export function ProfileDetails({ user, profile }: ProfileDetailsProps) {
  const primaryCode = getPrimaryRoleCode(user.roles.map((role) => role.code));
  const otherRoles = user.roles.filter((role) => role.code !== primaryCode);

  return (
    <section className="profile-panel" id="profile-roles" aria-labelledby="profile-details-heading">
      <h3 id="profile-details-heading">Informations</h3>
      <dl className="profile-rows">
        <div>
          <dt>Nom</dt>
          <dd>{user.fullName}</dd>
        </div>
        <div>
          <dt>E-mail</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt>Rôle</dt>
          <dd>
            {profile?.primaryRoleLabel ?? user.roles[0]?.label ?? '—'}
            {otherRoles.length > 0 ? (
              <span className="profile-rows-extra">{otherRoles.map((role) => role.label).join(', ')}</span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt>Périmètre</dt>
          <dd>{profile?.scopeLabel ?? '—'}</dd>
        </div>
        <div>
          <dt>Statut</dt>
          <dd>{STATUS_LABELS[user.status] ?? user.status}</dd>
        </div>
        <div>
          <dt>Identifiant</dt>
          <dd className="profile-mono">{user.id}</dd>
        </div>
      </dl>
    </section>
  );
}

type ProfileAccessProps = {
  user: AuthUser;
  profile?: AppDashboardProfile;
};

export function ProfileAccess({ user, profile }: ProfileAccessProps) {
  const roleCodes = user.roles.map((role) => role.code);
  const actor = profile ? getRequestActorConfig(profile) : null;
  const modules = getAccessibleModules(roleCodes).filter((module) => module.id !== 'profile');

  return (
    <section className="profile-panel" id="profile-rights" aria-labelledby="profile-modules-heading">
      <div className="profile-block">
        <h3 id="profile-modules-heading">Modules</h3>
        <p className="profile-block-lead">Pages ouvertes avec ce compte.</p>
        <nav className="profile-modules" aria-label="Modules accessibles">
          {modules.map((module) => (
            <Link key={module.id} href={module.href}>
              {module.shortLabel ?? module.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="profile-block" id="profile-access">
        <h3>Accès</h3>
        <p className="profile-block-lead">Actions autorisées sur les dossiers d’autorisation.</p>
        {actor ? (
          <ul className="profile-rights">
            {actor.capabilities.map((capability) => (
              <li key={capability.id} className={capability.allowed ? 'is-allowed' : 'is-denied'}>
                <span>{capability.label}</span>
                <em>
                  {capability.allowed ? <Check size={13} aria-hidden="true" /> : <X size={13} aria-hidden="true" />}
                  {capability.allowed ? 'Oui' : 'Non'}
                </em>
              </li>
            ))}
          </ul>
        ) : (
          <p className="profile-empty">Aucun droit métier pour ce compte.</p>
        )}
      </div>
    </section>
  );
}
