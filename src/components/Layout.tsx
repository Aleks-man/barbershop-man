import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { BackToTopButton } from './BackToTopButton'
import { ContactsCta } from './ContactsCta'
import { ScrollToTop } from './ScrollToTop'

const mapUrl = 'https://yandex.ru/maps/?text=Симферополь%2C%20Смежный%2010'

export function Layout() {
  const { pathname } = useLocation()
  const isHomePage = pathname === '/'
  const isGalleryPage = pathname === '/works' || pathname === '/room'

  return (
    <div className={`site-shell${isGalleryPage ? ' site-shell--gallery' : ''}`}>
      <ScrollToTop />

      <header className="topbar" aria-label="Главная навигация">
        <div className="header-brandline">
          <Link className="brand" to="/" aria-label="На главную Gentleman's Room">
            <img className="brand-icon" src="/favicon-original.png" alt="" aria-hidden="true" />
          </Link>
          <address className="header-address">
            <a className="address-map-link" href={mapUrl} target="_blank" rel="noreferrer">
              <span className="address-lines">
                <span>Симферополь</span>
                <span>Смежный 10</span>
              </span>
            </a>
          </address>
        </div>

        <div className="header-actions">
          <nav className="nav-links">
            <NavLink to="/" end>
              Главная
            </NavLink>
            <NavLink to="/services">Услуги</NavLink>
            <NavLink to="/masters">Мастера</NavLink>
            <NavLink to="/booking">Запись</NavLink>
          </nav>
        </div>

        <a className="phone-link" href="tel:+79781234567">
          +7 (978) 123-45-67
        </a>
      </header>

      <nav className="mobile-nav" aria-label="Мобильная навигация">
        <NavLink to="/" end>
          Главная
        </NavLink>
        <NavLink to="/services">Услуги</NavLink>
        <NavLink to="/masters">Мастера</NavLink>
        <NavLink to="/booking">Запись</NavLink>
      </nav>

      <BackToTopButton />

      {!isHomePage && (
        <div className="page-text-logo" aria-hidden="true">
          <img src="/gentlemansroom_text_logo_transparent.png" alt="" />
        </div>
      )}

      <Outlet />

      {!isHomePage && <ContactsCta />}
    </div>
  )
}
