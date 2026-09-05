import { outingsSection } from './homepage';

export type FeaturedOutingAlbum = {
  id: string;
  title: string;
  subtitle: string;
  establishment: string;
  location: string;
  publishedAt: string;
  activityType: string;
  schoolLevel: 'primaire' | 'secondaire' | 'mixte';
  heroImage: { src: string; alt: string };
  photos: { src: string; alt: string }[];
};

/** Album mis en avant — Olympiades des métiers Abidjan 2025. */
export const featuredOutingAlbum: FeaturedOutingAlbum = {
  id: 'olympiades-abidjan-2025',
  title: outingsSection.title,
  subtitle: outingsSection.description,
  establishment: 'Lycée professionnel de référence — Abidjan',
  location: 'Abidjan, Côte d\'Ivoire',
  publishedAt: '2025-08-15',
  activityType: 'Compétitions',
  schoolLevel: 'secondaire',
  heroImage: outingsSection.heroImage,
  photos: outingsSection.photos,
};

export const featuredOutingAlbums: FeaturedOutingAlbum[] = [featuredOutingAlbum];
