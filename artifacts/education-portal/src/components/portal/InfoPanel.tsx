import type { ReactNode } from 'react';

type InfoPanelProps = {
  title: string;
  children: ReactNode;
};

export function InfoPanel({ title, children }: InfoPanelProps) {
  return (
    <section className="info-panel">
      <h2>{title}</h2>
      <div className="info-panel-content">{children}</div>
    </section>
  );
}
