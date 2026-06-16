import { Link, NavLink, Outlet } from 'react-router-dom'
import { SummaryItem } from './SummaryItem'

export function Layout() {
  return (
    <div className="site-shell">
      <header className="topbar" aria-label="Главная навигация">
        <Link className="brand" to="/" aria-label="На главную Gentleman&apos;s Room">
          <img className="brand-icon" src="/favicon.png" alt="" aria-hidden="true" />
          <span className="brand-name">
            Gentlemen&apos;s Room
          </span>
        </Link>
        <a className="phone-link" href="tel:+74951234567">
          +7 (495) 123-45-67
        </a>
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
      </header>

      <section className="floating-summary" aria-label="Коротко о барбершопе">
        <SummaryItem value="3" label="кресла" />
        <span className="summary-divider" aria-hidden="true">
          |
        </span>
        <SummaryItem value="4.9" label="оценка гостей" />
        <span className="summary-divider" aria-hidden="true">
          |
        </span>
        <SummaryItem value="10-22" label="работаем каждый день" />
      </section>

      <Outlet />
    </div>
  )
}
