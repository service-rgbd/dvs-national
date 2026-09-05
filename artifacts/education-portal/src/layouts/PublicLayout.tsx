import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Menu,
  Search,
  X,
} from 'lucide-react';
import { useLocation } from 'wouter';

import { PortalLink as Link } from '@/components/portal/PortalLink';

import { InstitutionBrand } from '@/components/brand/InstitutionBrand';
import { institution } from '@/config/institution';
import {
  cookieBanner,
  getHeaderUtilityLinks,
  getMainNavigation,
  getFooterGroups,
  footerLegalLinks,
  searchContent,
  skipLinks,
  type NavSubmenuItem,
} from '@/content';
import { publicRoutes } from '@/content/routes';
import {
  hasCookieConsent,
  saveCookieConsent,
  type CookieConsentChoice,
} from '@/lib/cookie-consent';

type PublicLayoutProps = {
  children: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  const [location, setLocation] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [cookiesVisible, setCookiesVisible] = useState(() => !hasCookieConsent());
  const [cookieDetail, setCookieDetail] = useState(false);
  const [navPreview, setNavPreview] = useState<{ menuId: string; item: NavSubmenuItem } | null>(
    null,
  );
  const searchRef = useRef<HTMLInputElement>(null);

  const brandLabel = `${institution.platform.name} — ${institution.direction.fullName}, ${institution.ministry.fullName}, accueil`;
  const mainNavigation = getMainNavigation();
  const headerUtilityLinks = getHeaderUtilityLinks();
  const footerGroups = getFooterGroups();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    if (query) {
      setLocation(`${publicRoutes.recherche}?q=${encodeURIComponent(query)}`);
    } else {
      setLocation(publicRoutes.recherche);
    }
    setSearchOpen(false);
  };

  const dismissCookies = (choice: CookieConsentChoice) => {
    saveCookieConsent(choice);
    setCookiesVisible(false);
    setCookieDetail(false);
  };

  const closeCookiePanel = () => {
    setCookiesVisible(false);
    setCookieDetail(false);
  };

  const handleCloseCookies = () => {
    if (hasCookieConsent()) {
      closeCookiePanel();
    } else {
      dismissCookies('refused');
    }
  };

  const openCookieSettings = () => {
    setCookiesVisible(true);
    setCookieDetail(true);
  };

  const isActive = (href: string) => {
    if (href === publicRoutes.home) return location === publicRoutes.home;
    return location.startsWith(href);
  };

  return (
    <div className="education-page">
      <nav className="skip-links" aria-label="Liens d'évitement">
        {skipLinks.map((link) => (
          <a href={link.href} data-testid={link.testId} key={link.href}>
            {link.label}
          </a>
        ))}
      </nav>

      <header id="page-header">
        <div className="topline">
          <div className="container topline-inner">
            <InstitutionBrand
              variant="public"
              href={publicRoutes.home}
              title={brandLabel}
              testId="link-brand-home"
            />
            <div className="header-right">
              <div className="top-links">
                {headerUtilityLinks.map((link) => (
                  <Link href={link.href} data-testid={`link-${link.id}`} key={link.id}>
                    {link.label}
                    {'external' in link && link.external ? <ExternalLink size={12} aria-hidden="true" /> : null}
                  </Link>
                ))}
              </div>
              <div className="top-actions">
                <button
                  type="button"
                  className="search-trigger"
                  onClick={() => setSearchOpen((value) => !value)}
                  aria-expanded={searchOpen}
                  aria-controls="search-block-form"
                  data-testid="button-open-search"
                >
                  <Search size={19} aria-hidden="true" />
                  <span>Rechercher</span>
                </button>
                <button
                  type="button"
                  className="menu-trigger"
                  onClick={() => setMenuOpen(true)}
                  aria-expanded={menuOpen}
                  aria-controls="page-header--menu"
                  data-testid="button-open-menu"
                >
                  <Menu size={23} aria-hidden="true" />
                  <span>Menu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {searchOpen && (
          <div className="search-panel" id="search-block-form">
            <div className="container">
              <form className="search-form" onSubmit={submitSearch} role="search">
                <label htmlFor="site-search">{searchContent.label}</label>
                <input
                  ref={searchRef}
                  id="site-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={searchContent.placeholder}
                  data-testid="input-site-search"
                />
                <button type="submit" aria-label={searchContent.submitAriaLabel} data-testid="button-submit-search">
                  <Search size={20} aria-hidden="true" />
                </button>
              </form>
            </div>
          </div>
        )}
        <nav id="page-header--menu" className="nav" aria-label="Navigation principale">
          <div className="container nav-scroll">
            <div className="nav-inner">
              {mainNavigation.map((item, index) => {
                const previewItem =
                  navPreview?.menuId === item.id ? navPreview.item : item.submenu?.[0] ?? null;

                return (
                  <div
                    className={`nav-item${item.submenu?.length ? ' nav-item--has-submenu' : ''}`}
                    key={item.id}
                    onMouseEnter={() => {
                      if (item.submenu?.[0]) {
                        setNavPreview({ menuId: item.id, item: item.submenu[0] });
                      }
                    }}
                    onMouseLeave={() => {
                      setNavPreview((current) => (current?.menuId === item.id ? null : current));
                    }}
                    onFocusCapture={() => {
                      if (item.submenu?.[0]) {
                        setNavPreview({ menuId: item.id, item: item.submenu[0] });
                      }
                    }}
                    onBlurCapture={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                        setNavPreview((current) => (current?.menuId === item.id ? null : current));
                      }
                    }}
                  >
                    <Link
                      href={item.href}
                      className={`nav-link${isActive(item.href) ? ' nav-link-active' : ''}`}
                      aria-haspopup={item.submenu?.length ? 'menu' : undefined}
                      aria-expanded={item.submenu?.length ? false : undefined}
                      data-testid={`link-nav-${index}`}
                    >
                      <span className="nav-link-label">{item.label}</span>
                      {item.hasSubmenu ? (
                        <ChevronDown className="nav-chevron" size={14} aria-hidden="true" />
                      ) : null}
                    </Link>
                    {item.submenu?.length ? (
                      <div
                        className="nav-dropdown nav-dropdown--mega"
                        role="menu"
                        aria-label={`Sous-menu ${item.label}`}
                      >
                        <div className="nav-dropdown-body">
                          <div className="nav-dropdown-links">
                            <div className="nav-dropdown-header">{item.label}</div>
                            <ul className="nav-dropdown-list">
                              {item.submenu.map((subItem) => (
                                <li key={`${item.id}-${subItem.label}`}>
                                  <Link
                                    href={subItem.href}
                                    className={`nav-dropdown-link${
                                      previewItem?.label === subItem.label
                                        ? ' nav-dropdown-link--active'
                                        : ''
                                    }`}
                                    role="menuitem"
                                    onMouseEnter={() =>
                                      setNavPreview({ menuId: item.id, item: subItem })
                                    }
                                    onFocus={() =>
                                      setNavPreview({ menuId: item.id, item: subItem })
                                    }
                                  >
                                    <span className="nav-dropdown-link-label">{subItem.label}</span>
                                    {subItem.description ? (
                                      <span className="nav-dropdown-link-desc">
                                        {subItem.description}
                                      </span>
                                    ) : null}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {previewItem ? (
                            <div className="nav-dropdown-preview" aria-live="polite">
                              <p className="nav-dropdown-preview-eyebrow">{item.label}</p>
                              <p className="nav-dropdown-preview-title">{previewItem.label}</p>
                              {previewItem.description ? (
                                <p className="nav-dropdown-preview-desc">{previewItem.description}</p>
                              ) : null}
                              <Link href={previewItem.href} className="nav-dropdown-preview-cta">
                                Découvrir
                                <ExternalLink size={14} aria-hidden="true" />
                              </Link>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </nav>
        {menuOpen && (
          <div
            className="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu principal"
            onClick={(event) => {
              if (event.target === event.currentTarget) setMenuOpen(false);
            }}
          >
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu" data-testid="button-close-menu">
              <X size={28} aria-hidden="true" />
            </button>
            {mainNavigation.map((item, index) => (
              <div className="mobile-nav-group" key={item.id}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="mobile-nav-link"
                  data-testid={`link-mobile-nav-${index}`}
                >
                  {item.label}
                  {item.hasSubmenu ? <ChevronDown size={17} aria-hidden="true" /> : null}
                </Link>
                {item.submenu?.length ? (
                  <ul className="mobile-nav-submenu">
                    {item.submenu.map((subItem) => (
                      <li key={`${item.id}-mobile-${subItem.label}`}>
                        <Link href={subItem.href} onClick={() => setMenuOpen(false)}>
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </header>

      <main id="main-content">{children}</main>

      <footer id="footer">
        <div className="container">
          <div className="footer-groups">
            {footerGroups.map((group) => (
              <section className="footer-group" key={group.id} aria-labelledby={group.id}>
                <h2 id={group.id}>{group.title}</h2>
                <ul>
                  {group.links.map((link, index) => (
                    <li key={link.label}>
                      <Link href={link.href} data-testid={`link-footer-${group.id}-${index}`}>
                        {link.label} {link.external ? <ExternalLink size={11} aria-hidden="true" /> : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <div className="footer-bottom">
            <div className="footer-signature">
              {institution.direction.brandLines.map((line, index) => (
                <span key={line}>
                  {line}
                  {index < institution.direction.brandLines.length - 1 ? <br /> : null}
                </span>
              ))}
              <strong>{institution.platform.name}</strong>
              <small>{institution.platform.fullName}</small>
            </div>
            <div className="legal">
              {footerLegalLinks.map((link) =>
                'isCookieAction' in link && link.isCookieAction ? (
                  <button
                    type="button"
                    key={link.id}
                    className="legal-button"
                    onClick={openCookieSettings}
                    data-testid={`link-${link.id}`}
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link href={link.href} key={link.id} data-testid={`link-footer-${link.id}`}>
                    {link.label}
                  </Link>
                ),
              )}
              <span>© {institution.legal.copyright} · {institution.legal.license}</span>
            </div>
          </div>
        </div>
      </footer>

      {cookiesVisible && (
        <aside className="cookie" aria-labelledby="cookie-title" data-testid="panel-cookie">
          <button
            type="button"
            className="cookie-close"
            onClick={handleCloseCookies}
            aria-label="Fermer la gestion des cookies"
            data-testid="button-close-cookies"
          >
            <X size={18} aria-hidden="true" />
          </button>
          <h2 id="cookie-title">{cookieBanner.title}</h2>
          <p>{cookieBanner.description}</p>
          {cookieDetail ? <p><strong>{cookieBanner.customizeDetail}</strong></p> : null}
          <Link href={cookieBanner.detailsHref} className="accent-link" data-testid="link-cookie-details">
            {cookieBanner.detailsLabel}
          </Link>
          <div className="cookie-actions">
            <button type="button" className="primary" onClick={() => dismissCookies('accepted')} data-testid="button-accept-cookies">
              <Check size={15} aria-hidden="true" /> {cookieBanner.acceptLabel}
            </button>
            <button type="button" onClick={() => dismissCookies('refused')} data-testid="button-refuse-cookies">
              {cookieBanner.refuseLabel}
            </button>
            <button
              type="button"
              onClick={() => setCookieDetail((value) => !value)}
              aria-expanded={cookieDetail}
              data-testid="button-customize-cookies"
            >
              {cookieDetail ? cookieBanner.closeCustomizeLabel : cookieBanner.customizeLabel}
              {cookieDetail ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
