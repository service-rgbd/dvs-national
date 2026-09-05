import type { ReactNode } from 'react';
import { Link } from 'wouter';

import { institution } from '@/config/institution';

type InstitutionBrandProps = {
  variant?: 'public' | 'app-sidebar';
  href?: string;
  className?: string;
  title?: string;
  testId?: string;
};

export function InstitutionBrand({
  variant = 'public',
  href,
  className,
  title,
  testId,
}: InstitutionBrandProps) {
  const label =
    title ??
    `${institution.ministry.fullName} — ${institution.direction.fullName} — ${institution.platform.fullName}`;

  const content: ReactNode = (
    <>
      <span className="brand-mark" aria-hidden="true" />
      <span className="institution-brand-text">
        {institution.ministry.brandLines.map((line, index) => (
          <span key={line}>
            {line}
            {index < institution.ministry.brandLines.length - 1 ? <br /> : null}
          </span>
        ))}
        {variant === 'public' ? (
          <small>{institution.motto}</small>
        ) : (
          <small>
            {institution.direction.shortName} · {institution.platform.name}
          </small>
        )}
      </span>
    </>
  );

  const rootClass =
    variant === 'app-sidebar'
      ? `app-pro-brand-link institution-brand institution-brand--sidebar${className ? ` ${className}` : ''}`
      : `brand institution-brand institution-brand--public${className ? ` ${className}` : ''}`;

  if (href) {
    return (
      <Link
        href={href}
        className={rootClass}
        aria-label={label}
        title={label}
        data-testid={testId}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={rootClass} aria-label={label} title={label}>
      {content}
    </div>
  );
}
