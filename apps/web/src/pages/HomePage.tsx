import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicBarbers, type PublicBarber } from "../api/barbers";
import heroImage from "../assets/barbershop-hero.webp";
import bookingBg from "../assets/booking-bg.webp";
import heroBeardCard from "../assets/home-card-beard.webp";
import heroClubCard from "../assets/home-card-club.webp";
import heroHaircutCard from "../assets/home-card-haircut.webp";
import mastersBg from "../assets/masters-bg.webp";
import { SocialLinks } from "../components/SocialLinks";
import {
  fallbackPublicBarbers,
  getBarberPhoto,
  mergePublicBarberPresentation,
} from "../data/barberPresentation";
import { roomGallery, workGallery } from "../data/gallery";

const mapUrl = "https://yandex.ru/maps/?text=Симферополь%2C%20Смежный%2010";

const heroFeatureCards = [
  {
    title: "Мужские стрижки",
    text: "Индивидуальный подход к каждому образу",
    image: heroHaircutCard,
  },
  {
    title: "Борода и контур",
    text: "Точные линии и внимание к деталям",
    image: heroBeardCard,
  },
  {
    title: "Атмосфера клуба",
    text: "Пространство для отдыха и комфорта",
    image: heroClubCard,
  },
];

const homeGallerySections = [
  {
    title: "Наши работы",
    text: "Стрижки, борода и детали готового образа.",
    href: "/works",
    images: workGallery.slice(0, 4),
  },
  {
    title: "Наша мастерская",
    text: "Интерьер, рабочие места и атмосфера Gentleman’s Room.",
    href: "/room",
    images: roomGallery.slice(0, 4),
  },
];

export function HomePage() {
  const [previewBarbers, setPreviewBarbers] = useState<PublicBarber[]>(fallbackPublicBarbers)

  useEffect(() => {
    let isMounted = true

    getPublicBarbers()
      .then((nextBarbers) => {
        if (!isMounted) {
          return
        }

        setPreviewBarbers(mergePublicBarberPresentation(nextBarbers))
      })
      .catch((error: unknown) => {
        console.warn('Failed to load public barbers', error)
      })

    return () => {
      isMounted = false
    }
  }, [])

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
            <div
              className="hero-feature-grid"
              aria-label="Основные направления"
            >
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
        <span>Симферополь, Смежный 10</span>
      </section>

      <section className="home-section home-gallery-section">
        <div className="home-section-heading">
          <p className="eyebrow">Галерея</p>
          <h2>
            Мужские стрижки, уход за бородой и атмосфера, в которую хочется
            возвращаться.
          </h2>
        </div>
        <div className="home-gallery-split">
          {homeGallerySections.map((section) => (
            <article className="home-gallery-preview" key={section.title}>
              <div className="home-gallery-preview-heading">
                <div>
                  <h3>{section.title}</h3>
                  <p>{section.text}</p>
                </div>
              </div>
              <div className="home-gallery-grid">
                {section.images.map((image) => (
                  <Link to={section.href} key={image.src} aria-label={section.title}>
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                    />
                  </Link>
                ))}
              </div>
              <Link className="section-link" to={section.href}>
                Смотреть далее
              </Link>
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
            {previewBarbers.map((barber) => (
              <article className="home-card master-preview-card" key={barber.id}>
                <img src={getBarberPhoto(barber)} alt="" aria-hidden="true" />
                <div className="master-preview-content">
                  <h3>{barber.name}</h3>
                  {barber.role && <p>{barber.role}</p>}
                  {barber.experience && <strong>{barber.experience}</strong>}
                </div>
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
            <h2>Готовы к новому образу?</h2>
            <p>
              Выберите удобное время или свяжитесь с нами любым удобным
              способом.
            </p>
          </div>
          <dl className="contacts-list">
            <div>
              <dt>Адрес</dt>
              <dd>
                <a className="address-map-link contacts-address-link" href={mapUrl} target="_blank" rel="noreferrer">
                  <span className="address-lines">
                    <span>Симферополь</span>
                    <span>Смежный 10</span>
                  </span>
                </a>
              </dd>
            </div>
            <div>
              <dt>Телефон</dt>
              <dd>
                <a className="contacts-phone-link" href="tel:+74951234567">+7 (978) 123-45-67</a>
              </dd>
            </div>
            <div>
              <dt>Время работы</dt>
              <dd>
                <span className="contacts-time">ежедневно 10:00-21:00</span>
              </dd>
            </div>
            <div className="contacts-list-socials">
              <SocialLinks />
            </div>
          </dl>
          <div className="contacts-cta-actions">
            <Link className="primary-action contacts-cta-action" to="/booking">
              Записаться
            </Link>
            <a
              className="secondary-action contacts-cta-action"
              href="tel:+74951234567"
            >
              Позвонить
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
