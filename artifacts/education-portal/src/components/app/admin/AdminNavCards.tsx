import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

import { ADMIN_SECTIONS, type AdminSectionId } from '@/config/admin-sections';

type AdminNavCardsProps = {
  exclude?: AdminSectionId;
};

const SECTION_HINTS: Record<AdminSectionId, string> = {
  overview: 'Session et règles fondamentales',
  accounts: 'Cycle de vie et provisionnement',
  roles: 'RBAC, modules et workflow',
  settings: 'Institution, sécurité, variables',
  audit: 'Traçabilité et conformité',
};

export function AdminNavCards({ exclude = 'overview' }: AdminNavCardsProps) {
  const sections = ADMIN_SECTIONS.filter((section) => section.id !== exclude);

  return (
    <nav className="admin-nav-cards" aria-label="Sections administration">
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <Link key={section.id} href={section.href} className="admin-nav-card">
            <span className="admin-nav-card-icon" aria-hidden="true">
              <Icon size={20} />
            </span>
            <div className="admin-nav-card-copy">
              <strong>{section.label}</strong>
              <p>{SECTION_HINTS[section.id]}</p>
            </div>
            <ArrowRight size={16} className="admin-nav-card-arrow" aria-hidden="true" />
          </Link>
        );
      })}
    </nav>
  );
}
