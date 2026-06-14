import { Link, NavLink, Outlet, Route, Routes } from 'react-router-dom'
import heroImage from './assets/barbershop-hero.png'
import './App.css'

const services = [
  {
    title: 'Мужская стрижка',
    duration: '55 мин',
    details: 'Подберем форму под голову, волосы и привычный стиль. В конце - мытье и укладка.',
    price: '3 200 ₽',
  },
  {
    title: 'Борода и контур',
    duration: '40 мин',
    details: 'Оформим длину, выстроим контур и уберем лишнее, чтобы борода выглядела собранно.',
    price: '2 400 ₽',
  },
  {
    title: 'Стрижка и борода',
    duration: '95 мин',
    details: 'Полный визит: стрижка, борода, укладка и простые рекомендации по уходу.',
    price: '4 900 ₽',
  },
  {
    title: 'Фейд',
    duration: '70 мин',
    details: 'Чистый переход от короткой зоны к длине сверху, без резких ступеней и грязного контура.',
    price: '3 600 ₽',
  },
]

const barbers = [
  {
    name: 'Антон',
    role: 'Классические формы',
    note: 'Чистая геометрия, спокойная посадка и работа без спешки.',
    experience: '9 лет опыта',
  },
  {
    name: 'Макс',
    role: 'Фейды и текстура',
    note: 'Четкие переходы, современный силуэт и естественное движение волос.',
    experience: '7 лет опыта',
  },
  {
    name: 'Денис',
    role: 'Бороды',
    note: 'Работа лезвием, плотный контур и выверенные пропорции.',
    experience: '11 лет опыта',
  },
]

const schedule = [
  ['Пн-Пт', '10:00-22:00'],
  ['Суббота', '11:00-21:00'],
  ['Воскресенье', '12:00-20:00'],
]

function Layout() {
  return (
    <div className="site-shell">
      <header className="topbar" aria-label="Главная навигация">
        <Link className="brand" to="/" aria-label="На главную Мужской Цех">
          <span className="brand-mark">МЦ</span>
          <span className="brand-name">
            <span>Мужской</span>
            <strong>Цех</strong>
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

function HomePage() {
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

function ServicesPage() {
  return (
    <main className="page-shell">
      <PageIntro
        eyebrow="Услуги"
        title="Мужской уход без лишних слов."
        text="Точные стрижки, аккуратные фейды, оформление бороды и профессиональный уход. Мы создаем образ, который работает на вас каждый день."
      />
      <div className="service-list">
        {services.map((service) => (
          <article className="service-row" key={service.title}>
            <div>
              <p>{service.duration}</p>
              <h2>{service.title}</h2>
              <span>{service.details}</span>
            </div>
            <strong>{service.price}</strong>
          </article>
        ))}
      </div>
    </main>
  )
}

function MastersPage() {
  return (
    <main className="page-shell">
      <PageIntro
        eyebrow="Мастера"
        title="Разные руки, один стандарт."
        text="Выбирайте мастера по стилю и темпу. Мы сохраняем заметки после визита, чтобы следующая стрижка начиналась точнее."
      />
      <div className="master-grid">
        {barbers.map((barber) => (
          <article className="master-card" key={barber.name}>
            <div className="avatar" aria-hidden="true">
              {barber.name.slice(0, 1)}
            </div>
            <p>{barber.role}</p>
            <h2>{barber.name}</h2>
            <span>{barber.note}</span>
            <strong>{barber.experience}</strong>
          </article>
        ))}
      </div>
    </main>
  )
}

function BookingPage() {
  return (
    <main className="page-shell booking-page">
      <section className="booking-panel">
        <PageIntro
          eyebrow="Запись"
          title="Запишитесь на удобное время."
          text="Выберите услугу и оставьте заявку онлайн. Мы свяжемся с вами для подтверждения записи и ответим на любые вопросы."
        />
        <div className="schedule-list" aria-label="Часы работы">
          {schedule.map(([day, time]) => (
            <div key={day}>
              <span>{day}</span>
              <strong>{time}</strong>
            </div>
          ))}
        </div>
      </section>

      <form className="booking-form">
        <label>
          Имя
          <input type="text" name="name" placeholder="Иван" />
        </label>
        <label>
          Услуга
          <select name="service" defaultValue="Стрижка и борода">
            {services.map((service) => (
              <option key={service.title}>{service.title}</option>
            ))}
          </select>
        </label>
        <label>
          Мастер
          <select name="barber" defaultValue="Антон">
            {barbers.map((barber) => (
              <option key={barber.name}>{barber.name}</option>
            ))}
          </select>
        </label>
        <label>
          Телефон
          <input type="tel" name="phone" placeholder="+7 999 000 00 00" />
        </label>
        <button type="button">Оставить заявку</button>
      </form>
    </main>
  )
}

function PageIntro({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string
  title: string
  text: string
}) {
  return (
    <div className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <span>{text}</span>
    </div>
  )
}

function SummaryItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="summary-item">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="masters" element={<MastersPage />} />
        <Route path="booking" element={<BookingPage />} />
      </Route>
    </Routes>
  )
}

export default App
