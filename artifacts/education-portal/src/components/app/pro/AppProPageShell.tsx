import type { ReactNode } from 'react';

type AppProPageShellProps = {
  children: ReactNode;
};

export function AppProPageShell({ children }: AppProPageShellProps) {
  return <div className="dash-v2">{children}</div>;
}
