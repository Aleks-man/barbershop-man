import { Link } from 'react-router-dom'
import heroImage from '../assets/barbershop-hero.webp'
import bookingBg from '../assets/booking-bg.webp'
import heroBeardCard from '../assets/home-card-beard.webp'
import heroClubCard from '../assets/home-card-club.webp'
import heroHaircutCard from '../assets/home-card-haircut.webp'
import mastersBg from '../assets/masters-bg.webp'
import servicesBg from '../assets/services-bg-v2.webp'

const heroFeatureCards = [
  {
    title: 'Мужские стрижки',
    text: 'Классика и современные техники',
    image: heroHaircutCard,
  },
  {
    title: 'Борода и контур',
    text: 'Четкие линии и аккуратная форма',
    image: heroBeardCard,
  },
  {
    title: 'Атмосфера клуба',
    text: 'Комфортный отдых и внимание к деталям',
    image: heroClubCard,
  },
]

const popularServices = [
  ['Мужская стрижка', 'от 1 500 ₽'],
  ['Стрижка + борода', 'от 2 300 ₽'],
  ['Оформление бороды', 'от 900 ₽'],
]

const advantages = [
  [
    'Точная форма',
    'Подбираем стрижку под лицо, стиль и образ жизни.',
  ],
  ['Чистый контур', 'Аккуратно оформляем бороду и линии.'],
  ['Без суеты', 'Спокойная атмосфера мужского клуба.'],
]

const masters = [
  ['Антон', 'Классические формы', '9 лет опыта'],
  ['Макс', 'Фейды и текстура', '6 лет опыта'],
  ['Денис', 'Борода и бритье', '11 лет опыта'],
]

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
            <div className="hero-logo-lockup" aria-label="Gentleman's Room">
              <img
                src="/gentlemansroom_full_logo_transparent.png"
                alt="Gentleman's Room"
              />
            </div>
            <p className="eyebrow">Территория мужского стиля</p>
            <h1>Стиль начинается с характера.</h1>
            <p className="hero-text">
              Профессиональные стрижки, оформление бороды и уход за волосами в
              атмосфере настоящего мужского клуба.
            </p>
            <div className="hero-feature-grid" aria-label="Основные направления">
              {heroFeatureCards.map((card) => (
                <div className="hero-feature-item" key={card.title}>
                  <div className="hero-feature-title">
                    <h2>{card.title}</h2>
                  </div>
                  <article className="hero-feature-card">
                    <img src={card.image} alt="" aria-hidden="true" />
                    <div className="hero-feature-card-content">
                      <p>{card.text}</p>
                    </div>
                  </article>
                </div>
              ))}
            </div>
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
      </section>

      <section className="trust-bar" aria-label="Коротко о барбершопе">
        <span>★ 4.9 по отзывам</span>
        <span>Ежедневно 10:00-21:00</span>
        <span>Москва, Тверская 12</span>
      </section>

      <section
        className="home-visual-band popular-services-band"
        style={{ backgroundImage: `url(${servicesBg})` }}
      >
        <div className="home-section popular-services-section">
          <div className="home-section-heading">
            <p className="eyebrow">Популярные услуги</p>
            <h2>Базовый уход без лишних слов.</h2>
          </div>
          <div className="home-card-grid home-card-grid--services">
            {popularServices.map(([title, price]) => (
              <article className="home-card service-preview-card" key={title}>
                <h3>{title}</h3>
                <strong>{price}</strong>
              </article>
            ))}
          </div>
          <Link className="section-link" to="/services">
            Все услуги
          </Link>
        </div>
      </section>

      <section className="home-section advantages-section">
        <div className="home-section-heading">
          <p className="eyebrow">Почему выбирают нас</p>
          <h2>Аккуратность, которая видна сразу.</h2>
        </div>
        <div className="home-card-grid">
          {advantages.map(([title, text]) => (
            <article className="home-card advantage-card" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="home-visual-band masters-preview-band"
        style={{ backgroundImage: `url(${mastersBg})` }}
      >
        <div className="home-section masters-preview-section">
          <div className="home-section-heading">
            <p className="eyebrow">Мастера</p>
            <h2>Люди, которым доверяют стиль.</h2>
          </div>
          <div className="home-card-grid">
            {masters.map(([name, role, experience]) => (
              <article className="home-card master-preview-card" key={name}>
                <span className="master-preview-avatar">{name.slice(0, 1)}</span>
                <h3>{name}</h3>
                <p>{role}</p>
                <strong>{experience}</strong>
              </article>
            ))}
          </div>
          <Link className="section-link" to="/masters">
            Выбрать мастера
          </Link>
        </div>
      </section>

      <section
        className="home-visual-band contacts-cta-band"
        style={{ backgroundImage: `url(${bookingBg})` }}
      >
        <div className="home-section contacts-cta">
          <div>
            <p className="eyebrow">Запись</p>
            <h2>Готовы обновить образ?</h2>
            <p>
              Запишитесь онлайн или свяжитесь с нами удобным способом.
            </p>
          </div>
          <dl className="contacts-list">
            <div>
              <dt>Адрес</dt>
              <dd>Москва, Тверская 12</dd>
            </div>
            <div>
              <dt>Телефон</dt>
              <dd>
                <a href="tel:+74951234567">+7 (495) 123-45-67</a>
              </dd>
            </div>
            <div>
              <dt>Время работы</dt>
              <dd>ежедневно 10:00-21:00</dd>
            </div>
          </dl>
          <Link className="primary-action contacts-cta-action" to="/booking">
            Записаться
          </Link>
        </div>
      </section>
    </main>
  )
}
