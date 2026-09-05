import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'wouter';

type ArrowLinkProps = {
  children: ReactNode;
  href: string;
  testId?: string;
};

export function ArrowLink({ children, href, testId }: ArrowLinkProps) {
  const className = 'arrow-link';

  if (href.startsWith('/') || href.startsWith('?')) {
    return (
      <Link href={href} className={className} data-testid={testId}>
        {children}
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    );
  }

  return (
    <a href={href} className={className} data-testid={testId}>
      {children}
      <ArrowRight size={18} aria-hidden="true" />
    </a>
  );
}
