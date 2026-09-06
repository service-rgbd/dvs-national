import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { Bell, LogOut, Settings, User } from 'lucide-react';

import { appRoutes } from '@/content/routes';

type ProfileMenuProps = {
  fullName: string;
  initials: string;
  canOpenSettings: boolean;
  settingsHref: string;
  settingsActive: boolean;
  onLogout: () => void;
  logoutPending: boolean;
};

export function ProfileMenu({
  fullName,
  initials,
  canOpenSettings,
  settingsHref,
  settingsActive,
  onLogout,
  logoutPending,
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className="dash-profile-menu" ref={rootRef}>
      <button
        type="button"
        className={`dash-profile-btn${open ? ' is-open' : ''}`}
        aria-label="Menu du compte"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="dash-avatar" aria-hidden="true">
          {initials}
        </span>
      </button>

      {open ? (
        <div className="dash-profile-dropdown" role="menu" aria-label="Compte">
          <p className="dash-profile-dropdown-name">{fullName}</p>
          <Link
            href={appRoutes.profile}
            className="dash-profile-dropdown-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <User size={15} aria-hidden="true" />
            Mon profil
          </Link>
          <Link
            href={appRoutes.notifications}
            className="dash-profile-dropdown-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <Bell size={15} aria-hidden="true" />
            Notifications
          </Link>
          {canOpenSettings ? (
            <Link
              href={settingsHref}
              className={`dash-profile-dropdown-item${settingsActive ? ' is-active' : ''}`}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <Settings size={15} aria-hidden="true" />
              Administration
            </Link>
          ) : null}
          <button
            type="button"
            className="dash-profile-dropdown-item"
            role="menuitem"
            onClick={onLogout}
            disabled={logoutPending}
          >
            <LogOut size={15} aria-hidden="true" />
            Déconnexion
          </button>
        </div>
      ) : null}
    </div>
  );
}
