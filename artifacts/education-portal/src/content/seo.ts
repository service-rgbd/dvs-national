import { institution } from '@/config/institution';

export const siteSeo = {
  lang: institution.locale,
  locale: 'fr_CI',
  title: `${institution.platform.name} — ${institution.direction.fullName}`,
  description: `${institution.platform.fullName}. ${institution.platform.description}`,
  ogType: 'website',
  ogSiteName: institution.platform.name,
  twitterCard: 'summary_large_image',
} as const;

export const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'GovernmentOrganization',
  name: institution.direction.fullName,
  alternateName: institution.platform.name,
  description: institution.platform.fullName,
  url: '/',
  areaServed: {
    '@type': 'Country',
    name: institution.country,
  },
  parentOrganization: {
    '@type': 'GovernmentOrganization',
    name: institution.ministry.fullName,
  },
};
