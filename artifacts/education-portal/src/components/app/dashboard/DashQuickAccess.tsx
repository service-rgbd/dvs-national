import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

import type { AppModule } from '@/config/app-modules';
import { getModuleIcon } from '@/config/app-module-icons';

type DashQuickAccessProps = {
  modules: AppModule[];
  title?: string;
};

export function DashQuickAccess({ modules, title = 'Accès rapide' }: DashQuickAccessProps) {
  if (modules.length === 0) return null;

  return (
    <section className="dash-quick-panel" aria-labelledby="dash-quick-heading">
      <header className="dash-quick-panel-head">
        <h2 id="dash-quick-heading">{title}</h2>
      </header>
      <nav className="dash-quick-grid" aria-label={title}>
        {modules.map((module) => {
          const Icon = getModuleIcon(module.id);
          return (
            <Link key={module.id} href={module.href} className="dash-quick-tile">
              <span className="dash-quick-tile-icon" aria-hidden="true">
                <Icon size={18} />
              </span>
              <span className="dash-quick-tile-label">{module.label}</span>
              <ArrowRight size={12} className="dash-quick-tile-arrow" aria-hidden="true" />
            </Link>
          );
        })}
      </nav>
    </section>
  );
}
