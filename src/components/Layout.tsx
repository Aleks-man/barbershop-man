import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ContactsCta } from './ContactsCta'

export function Layout() {
  const { pathname } = useLocation()
  const isHomePage = pathname === '/'

  return (
    <div className="site-shell">
      <header className="topbar" aria-label="Главная навигация">
        <div className="header-brandline">
          <Link className="brand" to="/" aria-label="На главную Gentleman's Room">
            <img className="brand-icon" src="/favicon-original.png" alt="" aria-hidden="true" />
          </Link>
          <address className="header-address">Москва, Тверская 12</address>
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

        <a className="phone-link" href="tel:+74951234567">
          +7 (495) 123-45-67
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
