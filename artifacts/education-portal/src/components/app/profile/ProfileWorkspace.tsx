import { Bell, Mail, Shield, UserCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { AppResourceLink } from '@/components/app/navigation/AppResourceLink';
import { getPrimaryRoleCode, dashboardHeadlines } from '@/config/app-modules';
import { getRequestActorKind } from '@/config/request-permissions';
import type { UserProfileId } from '@/config/roles';
import { appRoutes } from '@/content/routes';
import { prefetchRequestDetail } from '@/lib/prefetch-app-data';
import type { AuthUser } from '@workspace/api-client-react';

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  locked: 'Verrouillé',
  pending_verification: 'En attente de validation',
};

type ProfileHeadProps = {
  user: AuthUser;
  scopeLabel?: string;
  primaryRoleLabel?: string;
  unreadCount: number;
};

export function userInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export function ProfileHead({ user, scopeLabel, primaryRoleLabel, unreadCount }: ProfileHeadProps) {
  const roleCodes = user.roles.map((role) => role.code);
  const primaryRole = getPrimaryRoleCode(roleCodes);
  const headline =
    primaryRole && primaryRole in dashboardHeadlines
      ? dashboardHeadlines[primaryRole as UserProfileId]
      : 'Compte PNIGVS';

  return (
    <header className="profile-head">
      <div className="profile-head-main">
        <span className="profile-avatar" aria-hidden="true">
          {userInitials(user.fullName)}
        </span>
        <div className="profile-head-copy">
          <p className="profile-head-eyebrow">Mon profil PNIGVS</p>
          <h2 className="profile-head-name">{user.fullName}</h2>
          <p className="profile-head-email">
            <Mail size={14} aria-hidden="true" />
            {user.email}
          </p>
          <p className="profile-head-role">{headline}</p>
        </div>
      </div>

      <ul className="profile-head-stats">
        <li>
          <Shield size={15} aria-hidden="true" />
          <div>
            <strong>{user.roles.length}</strong>
            <span>Rôle{user.roles.length > 1 ? 's' : ''}</span>
          </div>
        </li>
        <li>
          <Bell size={15} aria-hidden="true" />
          <div>
            <strong>{unreadCount}</strong>
            <span>Non lue{unreadCount > 1 ? 's' : ''}</span>
          </div>
        </li>
        {scopeLabel ? (
          <li>
            <UserCircle size={15} aria-hidden="true" />
            <div>
              <strong>{scopeLabel}</strong>
              <span>Périmètre</span>
            </div>
          </li>
        ) : null}
      </ul>

      <div className="profile-head-badges">
        <span className="profile-badge profile-badge--success">
          {STATUS_LABELS[user.status] ?? user.status}
        </span>
        {primaryRoleLabel ? (
          <span className="profile-badge">{primaryRoleLabel}</span>
        ) : null}
      </div>
    </header>
  );
}

type ProfileTabsProps = {
  activeTab: 'identity' | 'roles' | 'notifications';
  unreadCount: number;
  onChange: (tab: 'identity' | 'roles' | 'notifications') => void;
};

export function ProfileTabs({ activeTab, unreadCount, onChange }: ProfileTabsProps) {
  const tabs = [
    { id: 'identity' as const, label: 'Identité' },
    { id: 'roles' as const, label: 'Rôles & périmètre' },
    { id: 'notifications' as const, label: 'Notifications', count: unreadCount },
  ];

  return (
    <nav className="profile-tabs" aria-label="Sections du profil">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={activeTab === tab.id ? 'profile-tab is-active' : 'profile-tab'}
          aria-current={activeTab === tab.id ? 'page' : undefined}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.count && tab.count > 0 ? (
            <span className="profile-tab-count">{tab.count}</span>
          ) : null}
        </button>
      ))}
    </nav>
  );
}

type ProfileIdentityProps = {
  user: AuthUser;
};

export function ProfileIdentity({ user }: ProfileIdentityProps) {
  return (
    <section className="profile-section" aria-labelledby="profile-identity-heading">
      <header className="profile-section-head">
        <h3 id="profile-identity-heading">Identité du compte</h3>
        <p>Informations de session et identifiants de connexion.</p>
      </header>
      <dl className="profile-fields">
        <div>
          <dt>Nom complet</dt>
          <dd>{user.fullName}</dd>
        </div>
        <div>
          <dt>Adresse email</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt>Statut du compte</dt>
          <dd>{STATUS_LABELS[user.status] ?? user.status}</dd>
        </div>
        <div>
          <dt>Identifiant technique</dt>
          <dd className="profile-field-mono">{user.id}</dd>
        </div>
      </dl>
    </section>
  );
}

type ProfileRolesProps = {
  user: AuthUser;
  scopeLabel?: string;
  primaryRoleLabel?: string;
};

export function ProfileRoles({ user, scopeLabel, primaryRoleLabel }: ProfileRolesProps) {
  const roleCodes = user.roles.map((role) => role.code);
  const primaryCode = getPrimaryRoleCode(roleCodes);
  const actorKind = primaryCode ? getRequestActorKind(primaryCode) : null;

  const actorLabels: Record<string, string> = {
    establishment: 'Initiateur · Établissement',
    drena: 'Analyseur · DRENA',
    dvs: 'Validateur · DVS',
  };

  return (
    <section className="profile-section" aria-labelledby="profile-roles-heading">
      <header className="profile-section-head">
        <h3 id="profile-roles-heading">Rôles & périmètre RBAC</h3>
        <p>
          {user.roles.length} rôle{user.roles.length > 1 ? 's' : ''} métier
          {scopeLabel ? ` · Périmètre ${scopeLabel}` : ''}.
        </p>
      </header>

      {actorKind ? (
        <p className="profile-role-kind">{actorLabels[actorKind] ?? actorKind}</p>
      ) : null}

      <ul className="profile-role-list">
        {user.roles.map((role) => {
          const isPrimary = role.code === primaryCode;
          return (
            <li key={role.code} className={isPrimary ? 'is-primary' : undefined}>
              <div>
                <strong>{role.label}</strong>
                <span>{role.code}</span>
              </div>
              {isPrimary ? <span className="profile-role-tag">Rôle principal</span> : null}
            </li>
          );
        })}
      </ul>

      {primaryRoleLabel ? (
        <p className="profile-section-note">
          Profil actif : <strong>{primaryRoleLabel}</strong>
        </p>
      ) : null}
    </section>
  );
}

export type NotificationRow = {
  id: string;
  title: string;
  body?: string | null;
  isRead: boolean;
  createdAt: string;
  resourceType?: string | null;
  resourceId?: string | null;
};

type ProfileNotificationsProps = {
  notifications: NotificationRow[];
  unreadCount: number;
  search: string;
  filter: 'all' | 'unread' | 'read';
  sort: 'date' | 'title';
  order: 'asc' | 'desc';
  onSearchChange: (value: string) => void;
  onFilterChange: (value: 'all' | 'unread' | 'read') => void;
  onSortChange: (value: 'date' | 'title') => void;
  onOrderChange: (value: 'asc' | 'desc') => void;
  onReset: () => void;
  onMarkRead: (id: string) => void;
};

export function ProfileNotifications({
  notifications,
  unreadCount,
  search,
  filter,
  sort,
  order,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onOrderChange,
  onReset,
  onMarkRead,
}: ProfileNotificationsProps) {
  const queryClient = useQueryClient();

  return (
    <section className="profile-section" aria-labelledby="profile-notifications-heading">
      <header className="profile-section-head">
        <h3 id="profile-notifications-heading">Centre de notifications</h3>
        <p>
          {unreadCount} non lue{unreadCount > 1 ? 's' : ''} · {notifications.length} affichée
          {notifications.length > 1 ? 's' : ''}
        </p>
      </header>

      <div className="profile-notif-toolbar">
        <div className="profile-notif-field profile-notif-field--search">
          <label htmlFor="profile-notif-search">Rechercher</label>
          <input
            id="profile-notif-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Titre ou contenu…"
          />
        </div>
        <div className="profile-notif-field">
          <label htmlFor="profile-notif-filter">État</label>
          <select
            id="profile-notif-filter"
            className="app-pro-select"
            value={filter}
            onChange={(event) => onFilterChange(event.target.value as 'all' | 'unread' | 'read')}
          >
            <option value="all">Toutes</option>
            <option value="unread">Non lues</option>
            <option value="read">Lues</option>
          </select>
        </div>
        <div className="profile-notif-field">
          <label htmlFor="profile-notif-sort">Tri</label>
          <select
            id="profile-notif-sort"
            className="app-pro-select"
            value={sort}
            onChange={(event) => onSortChange(event.target.value as 'date' | 'title')}
          >
            <option value="date">Date</option>
            <option value="title">Titre</option>
          </select>
        </div>
        <div className="profile-notif-field">
          <label htmlFor="profile-notif-order">Ordre</label>
          <select
            id="profile-notif-order"
            className="app-pro-select"
            value={order}
            onChange={(event) => onOrderChange(event.target.value as 'asc' | 'desc')}
          >
            <option value="desc">Plus récent</option>
            <option value="asc">Plus ancien</option>
          </select>
        </div>
        <button type="button" className="profile-notif-reset" onClick={onReset}>
          Réinitialiser
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="profile-empty">Aucune notification pour ces critères.</p>
      ) : (
        <ul className="profile-notif-list">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={notification.isRead ? 'is-read' : 'is-unread'}
            >
              {notification.resourceType === 'request' && notification.resourceId ? (
                <AppResourceLink
                  href={appRoutes.requestDetail(notification.resourceId)}
                  className="profile-notif-row profile-notif-row--link"
                  ariaLabel={notification.title}
                  prefetch={() => prefetchRequestDetail(queryClient, notification.resourceId!)}
                  onNavigate={() => {
                    if (!notification.isRead) onMarkRead(notification.id);
                  }}
                >
                  <div className="profile-notif-main">
                    {!notification.isRead ? (
                      <span className="profile-notif-badge">Nouveau</span>
                    ) : null}
                    <strong>{notification.title}</strong>
                    {notification.body ? <p>{notification.body}</p> : null}
                    <time dateTime={notification.createdAt}>
                      {new Date(notification.createdAt).toLocaleString('fr-FR')}
                    </time>
                  </div>
                </AppResourceLink>
              ) : (
                <div className="profile-notif-row">
                  <div className="profile-notif-main">
                    {!notification.isRead ? (
                      <span className="profile-notif-badge">Nouveau</span>
                    ) : null}
                    <strong>{notification.title}</strong>
                    {notification.body ? <p>{notification.body}</p> : null}
                    <time dateTime={notification.createdAt}>
                      {new Date(notification.createdAt).toLocaleString('fr-FR')}
                    </time>
                  </div>
                </div>
              )}
              <div className="profile-notif-actions">
                {!notification.isRead ? (
                  <button type="button" onClick={() => onMarkRead(notification.id)}>
                    Marquer lue
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
