import type { MouseEvent, ReactNode } from 'react';
import { Link } from 'wouter';

type AppResourceLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  prefetch?: () => void;
  onNavigate?: () => void;
  ariaLabel?: string;
};

export function AppResourceLink({
  href,
  className,
  children,
  prefetch,
  onNavigate,
  ariaLabel,
}: AppResourceLinkProps) {
  function handlePrefetch() {
    prefetch?.();
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onNavigate?.();
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.button !== 0) return;
  }

  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
