import type { ReactNode } from 'react';

import { usePageSeo } from '@/hooks/use-page-seo';
import { publicRoutes } from '@/content/routes';

import { PageShell } from './PageShell';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PublicPageProps = {
  title: string;
  description?: string;
  seoDescription?: string;
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
  variant?: 'default' | 'narrow' | 'editorial';
};

export function PublicPage({
  title,
  description,
  seoDescription,
  breadcrumbs,
  children,
  variant = 'default',
}: PublicPageProps) {
  usePageSeo({ title, description: seoDescription ?? description });

  const crumbs: BreadcrumbItem[] = breadcrumbs ?? [
    { label: 'Accueil', href: publicRoutes.home },
    { label: title },
  ];

  return (
    <PageShell
      title={title}
      description={description}
      breadcrumbs={crumbs}
      variant={variant === 'narrow' ? 'narrow' : 'default'}
      layout={variant === 'editorial' ? 'editorial' : 'default'}
    >
      {children}
    </PageShell>
  );
}
