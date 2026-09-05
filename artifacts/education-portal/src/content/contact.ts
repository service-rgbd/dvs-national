import { institution } from '@/config/institution';
import { publicRoutes } from './routes';

/** Coordonnées officielles — sources : education.gouv.ci, annuaire public DVS. */
export const dvsContact = {
  direction: institution.direction.fullName,
  ministry: institution.ministry.fullName,
  director: institution.contact.dvs.director,
  address: institution.contact.dvs.address,
  poBox: institution.contact.dvs.poBox,
  city: institution.contact.city,
  country: institution.contact.country,
  district: institution.contact.dvs.district,
  email: institution.contact.dvs.email,
  phone: institution.contact.dvs.phone,
  hours: institution.contact.dvs.hours,
  mapLat: institution.contact.dvs.mapLat,
  mapLng: institution.contact.dvs.mapLng,
  mapZoom: institution.contact.dvs.mapZoom,
  spots: [
    {
      id: 'dvs',
      title: 'Direction de la Vie Scolaire',
      text: 'Pilotage national, validation DVS, communication institutionnelle.',
    },
    {
      id: 'drena',
      title: 'Directions régionales (DREN)',
      text: 'Interlocuteurs territoriaux pour les établissements de votre région.',
    },
    {
      id: 'etablissements',
      title: 'Établissements scolaires',
      text: 'Chefs d\'établissement et responsables éducatifs — via l\'espace agents PNIGVS.',
    },
    {
      id: 'assistance',
      title: 'Assistance PNIGVS',
      text: 'Support technique et questions sur la plateforme numérique.',
    },
  ],
  quickLinks: [
    { label: 'Services PNIGVS', href: publicRoutes.services },
    { label: 'Espace agents', href: publicRoutes.espaceAgents },
    { label: 'Documents publics', href: publicRoutes.documents },
  ],
};
