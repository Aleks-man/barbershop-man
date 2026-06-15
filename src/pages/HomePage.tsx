import { Link } from 'react-router-dom'
import heroImage from '../assets/barbershop-hero.png'

export function HomePage() {
  return (
    <main>
      <section className="home-hero">
        <img
          className="home-hero-image"
          src={heroImage}
          alt="Интерьер современного барбершопа с кожаным креслом и зеркальной стеной"
        />
        <div className="home-hero-shade" />
        <div className="home-hero-content">
          <div className="hero-copy">
            <p className="eyebrow">Барбершоп в Москве</p>
            <h1>Стиль начинается с характера.</h1>
            <p className="hero-text">
              Профессиональные стрижки, оформление бороды и уход за волосами в
              атмосфере настоящего мужского клуба.
            </p>
            <div className="hero-actions">
              <Link className="primary-action" to="/booking">
                Записаться
              </Link>
              <Link className="secondary-action" to="/services">
                Смотреть услуги
              </Link>
            </div>
          </div>
        </div>
        <aside className="hero-status" aria-label="Свободные окна на сегодня">
          <span>Сегодня</span>
          <strong>4 свободных окна</strong>
          <Link to="/booking">Выбрать время</Link>
        </aside>
      </section>
    </main>
  )
}
