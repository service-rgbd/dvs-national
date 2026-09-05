import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'wouter';

import { PublicPage } from '@/components/portal/PublicPage';
import { PublicPageStrip } from '@/components/portal/PublicPageStrip';
import { dvsContact } from '@/content/contact';
import { publicPageContent } from '@/content/pages';
import { publicRoutes } from '@/content/routes';

function buildMapEmbedUrl(lat: number, lng: number, zoom: number) {
  const delta = 0.012;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join('%2C');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}#map=${zoom}/${lat}/${lng}`;
}

export default function ContactPage() {
  const content = publicPageContent.contact;
  const contact = dvsContact;

  return (
    <PublicPage
      title={content.title}
      description={content.description}
      seoDescription={content.seoDescription}
      variant="editorial"
      breadcrumbs={[
        { label: 'Accueil', href: publicRoutes.home },
        { label: content.title },
      ]}
    >
      <PublicPageStrip
        title="Contact DVS"
        summary={`${contact.direction} · ${contact.district} · ${contact.city}, ${contact.country}`}
      />

      <div className="public-contact-layout">
        <section className="public-contact-grid" aria-labelledby="contact-coords-heading">
          <div className="public-block">
            <h2 id="contact-coords-heading">Coordonnées DVS</h2>
            <ul className="public-contact-facts">
              <li>
                <MapPin size={16} aria-hidden="true" />
                <span>
                  <strong>{contact.direction}</strong>
                  <br />
                  {contact.ministry}
                  <br />
                  {contact.address} — {contact.poBox}
                  <br />
                  {contact.district}, {contact.city}
                </span>
              </li>
              <li>
                <Mail size={16} aria-hidden="true" />
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              <li>
                <Phone size={16} aria-hidden="true" />
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
              </li>
              <li>
                <Clock size={16} aria-hidden="true" />
                {contact.hours}
              </li>
            </ul>
          </div>

          <div className="public-block">
            <h2>Interlocuteurs</h2>
            <ul className="public-contact-spots">
              {contact.spots.map((spot) => (
                <li key={spot.id}>
                  <strong>{spot.title}</strong>
                  <span>{spot.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="public-contact-map" aria-labelledby="contact-map-heading">
          <h2 id="contact-map-heading">Localisation</h2>
          <p className="public-one-line-hint">
            Siège DVS — {contact.address}, {contact.poBox}, {contact.city}
          </p>
          <div className="public-contact-map-frame">
            <iframe
              title={`Carte — ${contact.direction}, ${contact.city}`}
              src={buildMapEmbedUrl(contact.mapLat, contact.mapLng, contact.mapZoom)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        <nav className="public-quick-links public-quick-links--inline" aria-label="Liens utiles">
          {contact.quickLinks.map((link) => (
            <Link href={link.href} className="public-quick-link" key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </PublicPage>
  );
}
