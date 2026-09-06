import { Link, useLocation } from 'wouter';

import { ADMIN_SECTIONS, isAdminSectionActive } from '@/config/admin-sections';

export function AdminSectionTabs() {
  const [location] = useLocation();

  return (
    <nav className="admin-section-tabs" aria-label="Sections administration">
      {ADMIN_SECTIONS.map((section) => {
        const Icon = section.icon;
        const isActive = isAdminSectionActive(location, section.href);
        return (
          <Link
            key={section.id}
            href={section.href}
            className={isActive ? 'admin-section-tab is-active' : 'admin-section-tab'}
            aria-current={isActive ? 'page' : undefined}
            title={section.description}
          >
            <span className="admin-section-tab-icon" aria-hidden="true">
              <Icon size={16} />
            </span>
            <span className="admin-section-tab-label">{section.label}</span>
            <span className="admin-section-tab-short">{section.shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
