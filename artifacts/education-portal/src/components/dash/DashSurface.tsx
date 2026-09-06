import type { ReactNode } from 'react';

type DashSurfaceProps = {
  children: ReactNode;
  className?: string;
};

export function DashSurface({ children, className }: DashSurfaceProps) {
  return <div className={className ? `dash-surface ${className}` : 'dash-surface'}>{children}</div>;
}
