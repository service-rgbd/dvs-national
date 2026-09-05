import type { ReactNode } from 'react';
import { Link, useLocation, useSearch } from 'wouter';

import {
  flattenNavSubMenu,
  isNavSubGroups,
  type NavSubGroup,
  type NavSubItem,
  type NavSubMenu,
} from '@/config/app-nav-submenus';
import { isNavSubLinkActive } from '@/lib/nav-active';

type NavSubLinkProps = {
  item: NavSubItem;
  location: string;
  search: string;
};

export function NavSubLink({ item, location, search }: NavSubLinkProps) {
  const active = isNavSubLinkActive(location, item.href, search);
  const className = active ? 'app-pro-nav-sublink is-active' : 'app-pro-nav-sublink';

  return (
    <Link href={item.href} className={className} aria-current={active ? 'page' : undefined}>
      {item.label}
    </Link>
  );
}

function NavSubGroupBlock({
  group,
  location,
  search,
}: {
  group: NavSubGroup;
  location: string;
  search: string;
}) {
  return (
    <li className="app-pro-nav-sub-group">
      <span className="app-pro-nav-sub-label">{group.label}</span>
      <ul className="app-pro-nav-sub-nested">
        {group.items.map((item) => (
          <li key={item.href}>
            <NavSubLink item={item} location={location} search={search} />
          </li>
        ))}
      </ul>
    </li>
  );
}

type NavItemWithSubProps = {
  moduleId: string;
  label: string;
  description: string;
  href: string;
  isActive: boolean;
  isOpen: boolean;
  icon: ReactNode;
  subItems: NavSubMenu;
  location: string;
  onToggle: () => void;
  onOpen: () => void;
};

export function NavItemWithSub({
  moduleId,
  label,
  description,
  href,
  isActive,
  isOpen,
  icon,
  subItems,
  location,
  onToggle,
  onOpen,
}: NavItemWithSubProps) {
  const search = useSearch();
  const flatItems = flattenNavSubMenu(subItems);
  const grouped = isNavSubGroups(subItems);

  return (
    <li className={`app-pro-nav-item-has-sub${isOpen ? ' is-open' : ''}`}>
      <div className="app-pro-nav-row">
        <Link
          href={href}
          className={isActive ? 'app-pro-nav-link is-active' : 'app-pro-nav-link'}
          aria-current={isActive ? 'page' : undefined}
          title={description}
          onClick={onOpen}
        >
          <span className="app-pro-nav-icon" aria-hidden="true">
            {icon}
          </span>
          <span className="app-pro-nav-text">{label}</span>
          {flatItems.length > 0 ? (
            <span className="app-pro-nav-sub-count" aria-hidden="true">
              {flatItems.length}
            </span>
          ) : null}
        </Link>
        <button
          type="button"
          className="app-pro-nav-sub-toggle"
          aria-expanded={isOpen}
          aria-controls={`nav-sub-${moduleId}`}
          aria-label={`${isOpen ? 'Replier' : 'Déplier'} ${label}`}
          onClick={onToggle}
        >
          <span className="app-pro-nav-sub-chevron" aria-hidden="true" />
        </button>
      </div>
      {isOpen ? (
        <ul id={`nav-sub-${moduleId}`} className="app-pro-nav-sub">
          {grouped
            ? (subItems as NavSubGroup[]).map((group) => (
                <NavSubGroupBlock
                  key={group.label}
                  group={group}
                  location={location}
                  search={search}
                />
              ))
            : (subItems as NavSubItem[]).map((item) => (
                <li key={item.href}>
                  <NavSubLink item={item} location={location} search={search} />
                </li>
              ))}
        </ul>
      ) : null}
    </li>
  );
}
