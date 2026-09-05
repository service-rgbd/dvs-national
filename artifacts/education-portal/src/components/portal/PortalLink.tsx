import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link } from 'wouter';

import { exposesAgentsAccess, isAgentsDestinationHref } from '@/config/agents-portal';

type PortalLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'>;

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function PortalLink({ href, className, children, ...rest }: PortalLinkProps) {
  if (!exposesAgentsAccess() && isAgentsDestinationHref(href)) {
    return null;
  }

  if (isExternalHref(href)) {
    return (
      <a href={href} className={className} rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}
