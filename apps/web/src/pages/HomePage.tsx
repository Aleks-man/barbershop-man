import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicBarbers, type PublicBarber } from "../api/barbers";
import heroImage from "../assets/barbershop-hero.webp";
import bookingBg from "../assets/booking-bg.webp";
import heroBeardCard from "../assets/home-card-beard.webp";
import heroClubCard from "../assets/home-card-club.webp";
import heroHaircutCard from "../assets/home-card-haircut.webp";
import masterAlex from "../assets/masters/master-alex.webp";
import masterAnton from "../assets/masters/master-anton.webp";
import masterDenis from "../assets/masters/master-denis.webp";
import masterMax from "../assets/masters/master-max.webp";
import mastersBg from "../assets/masters-bg.webp";
import { SocialLinks } from "../components/SocialLinks";
import { roomGallery, workGallery } from "../data/gallery";

const mapUrl = "https://yandex.ru/maps/?text=РЎРёРјС„РµСЂРѕРїРѕР»СЊ%2C%20РЎРјРµР¶РЅС‹Р№%2010";

const heroFeatureCards = [
  {
    title: "РњСѓР¶СЃРєРёРµ СЃС‚СЂРёР¶РєРё",
    text: "РРЅРґРёРІРёРґСѓР°Р»СЊРЅС‹Р№ РїРѕРґС…РѕРґ Рє РєР°Р¶РґРѕРјСѓ РѕР±СЂР°Р·Сѓ",
    image: heroHaircutCard,
  },
  {
    title: "Р‘РѕСЂРѕРґР° Рё РєРѕРЅС‚СѓСЂ",
    text: "РўРѕС‡РЅС‹Рµ Р»РёРЅРёРё Рё РІРЅРёРјР°РЅРёРµ Рє РґРµС‚Р°Р»СЏРј",
    image: heroBeardCard,
  },
  {
    title: "РђС‚РјРѕСЃС„РµСЂР° РєР»СѓР±Р°",
    text: "РџСЂРѕСЃС‚СЂР°РЅСЃС‚РІРѕ РґР»СЏ РѕС‚РґС‹С…Р° Рё РєРѕРјС„РѕСЂС‚Р°",
    image: heroClubCard,
  },
];
const masterPhotos = [masterAnton, masterMax, masterDenis, masterAlex]

const fallbackMasters: PublicBarber[] = [
  {
    description: null,
    experience: "9 лет опыта",
    id: "anton",
    name: "Антон",
    photoUrl: masterAnton,
    role: "Классические формы",
  },
  {
    description: null,
    experience: "6 лет опыта",
    id: "max",
    name: "Макс",
    photoUrl: masterMax,
    role: "Фейды и текстура",
  },
  {
    description: null,
    experience: "11 лет опыта",
    id: "denis",
    name: "Денис",
    photoUrl: masterDenis,
    role: "Борода и бритье",
  },
  {
    description: null,
    experience: "10 лет опыта",
    id: "alex",
    name: "Алекс",
    photoUrl: masterAlex,
    role: "Классические стрижки",
  },
];
const homeGallerySections = [
  {
    title: "РќР°С€Рё СЂР°Р±РѕС‚С‹",
    text: "РЎС‚СЂРёР¶РєРё, Р±РѕСЂРѕРґР° Рё РґРµС‚Р°Р»Рё РіРѕС‚РѕРІРѕРіРѕ РѕР±СЂР°Р·Р°.",
    href: "/works",
    images: workGallery.slice(0, 4),
  },
  {
    title: "РќР°С€Р° РјР°СЃС‚РµСЂСЃРєР°СЏ",
    text: "РРЅС‚РµСЂСЊРµСЂ, СЂР°Р±РѕС‡РёРµ РјРµСЃС‚Р° Рё Р°С‚РјРѕСЃС„РµСЂР° GentlemanвЂ™s Room.",
    href: "/room",
    images: roomGallery.slice(0, 4),
  },
];

export function HomePage() {
  const [masters, setMasters] = useState(fallbackMasters)

  useEffect(() => {
    let isMounted = true

    getPublicBarbers()
      .then((nextBarbers) => {
        if (!isMounted || nextBarbers.length === 0) {
          return
        }

        setMasters(nextBarbers.slice(0, 4))
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
          alt="РРЅС‚РµСЂСЊРµСЂ СЃРѕРІСЂРµРјРµРЅРЅРѕРіРѕ Р±Р°СЂР±РµСЂС€РѕРїР° СЃ РєРѕР¶Р°РЅС‹Рј РєСЂРµСЃР»РѕРј Рё Р·РµСЂРєР°Р»СЊРЅРѕР№ СЃС‚РµРЅРѕР№"
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
            <p className="eyebrow">РўРµСЂСЂРёС‚РѕСЂРёСЏ РјСѓР¶СЃРєРѕРіРѕ СЃС‚РёР»СЏ</p>
            <h1>РЎС‚РёР»СЊ РЅР°С‡РёРЅР°РµС‚СЃСЏ СЃ С…Р°СЂР°РєС‚РµСЂР°.</h1>
            <p className="hero-text">
              РџСЂРѕС„РµСЃСЃРёРѕРЅР°Р»СЊРЅС‹Рµ СЃС‚СЂРёР¶РєРё, РѕС„РѕСЂРјР»РµРЅРёРµ Р±РѕСЂРѕРґС‹ Рё СѓС…РѕРґ Р·Р° РІРѕР»РѕСЃР°РјРё РІ
              Р°С‚РјРѕСЃС„РµСЂРµ РЅР°СЃС‚РѕСЏС‰РµРіРѕ РјСѓР¶СЃРєРѕРіРѕ РєР»СѓР±Р°.
            </p>
            <div
              className="hero-feature-grid"
              aria-label="РћСЃРЅРѕРІРЅС‹Рµ РЅР°РїСЂР°РІР»РµРЅРёСЏ"
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
                Р—Р°РїРёСЃР°С‚СЊСЃСЏ
              </Link>
              <Link className="secondary-action" to="/services">
                РЎРјРѕС‚СЂРµС‚СЊ СѓСЃР»СѓРіРё
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-bar" aria-label="РљРѕСЂРѕС‚РєРѕ Рѕ Р±Р°СЂР±РµСЂС€РѕРїРµ">
        <span>в… 4.9 РїРѕ РѕС‚Р·С‹РІР°Рј</span>
        <span>Р•Р¶РµРґРЅРµРІРЅРѕ 10:00-21:00</span>
        <span>РЎРёРјС„РµСЂРѕРїРѕР»СЊ, РЎРјРµР¶РЅС‹Р№ 10</span>
      </section>

      <section className="home-section home-gallery-section">
        <div className="home-section-heading">
          <p className="eyebrow">Р“Р°Р»РµСЂРµСЏ</p>
          <h2>
            РњСѓР¶СЃРєРёРµ СЃС‚СЂРёР¶РєРё, СѓС…РѕРґ Р·Р° Р±РѕСЂРѕРґРѕР№ Рё Р°С‚РјРѕСЃС„РµСЂР°, РІ РєРѕС‚РѕСЂСѓСЋ С…РѕС‡РµС‚СЃСЏ
            РІРѕР·РІСЂР°С‰Р°С‚СЊСЃСЏ.
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
                РЎРјРѕС‚СЂРµС‚СЊ РґР°Р»РµРµ
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
            <p className="eyebrow">РњР°СЃС‚РµСЂР°</p>
            <h2>Р›СЋРґРё, РєРѕС‚РѕСЂС‹Рј РґРѕРІРµСЂСЏСЋС‚ СЃС‚РёР»СЊ.</h2>
          </div>
          <div className="home-card-grid">
            {masters.map((master, index) => (
              <article className="home-card master-preview-card" key={master.id}>
                <img
                  src={master.photoUrl || masterPhotos[index % masterPhotos.length]}
                  alt=""
                  aria-hidden="true"
                />
                <div className="master-preview-content">
                  <h3>{master.name}</h3>
                  <p>{master.role}</p>
                  {master.experience && <strong>{master.experience}</strong>}
                </div>
              </article>
            ))}
          </div>
          <Link className="section-link" to="/masters">
            Р’С‹Р±СЂР°С‚СЊ РјР°СЃС‚РµСЂР°
          </Link>
        </div>
      </section>

      <section
        className="home-visual-band contacts-cta-band"
        style={{ backgroundImage: `url(${bookingBg})` }}
      >
        <div className="home-section contacts-cta">
          <div>
            <p className="eyebrow">Р—Р°РїРёСЃСЊ</p>
            <h2>Р“РѕС‚РѕРІС‹ Рє РЅРѕРІРѕРјСѓ РѕР±СЂР°Р·Сѓ?</h2>
            <p>
              Р’С‹Р±РµСЂРёС‚Рµ СѓРґРѕР±РЅРѕРµ РІСЂРµРјСЏ РёР»Рё СЃРІСЏР¶РёС‚РµСЃСЊ СЃ РЅР°РјРё Р»СЋР±С‹Рј СѓРґРѕР±РЅС‹Рј
              СЃРїРѕСЃРѕР±РѕРј.
            </p>
          </div>
          <dl className="contacts-list">
            <div>
              <dt>РђРґСЂРµСЃ</dt>
              <dd>
                <a className="address-map-link contacts-address-link" href={mapUrl} target="_blank" rel="noreferrer">
                  <span className="address-lines">
                    <span>РЎРёРјС„РµСЂРѕРїРѕР»СЊ</span>
                    <span>РЎРјРµР¶РЅС‹Р№ 10</span>
                  </span>
                </a>
              </dd>
            </div>
            <div>
              <dt>РўРµР»РµС„РѕРЅ</dt>
              <dd>
                <a className="contacts-phone-link" href="tel:+74951234567">+7 (978) 123-45-67</a>
              </dd>
            </div>
            <div>
              <dt>Р’СЂРµРјСЏ СЂР°Р±РѕС‚С‹</dt>
              <dd>
                <span className="contacts-time">РµР¶РµРґРЅРµРІРЅРѕ 10:00-21:00</span>
              </dd>
            </div>
            <div className="contacts-list-socials">
              <SocialLinks />
            </div>
          </dl>
          <div className="contacts-cta-actions">
            <Link className="primary-action contacts-cta-action" to="/booking">
              Р—Р°РїРёСЃР°С‚СЊСЃСЏ
            </Link>
            <a
              className="secondary-action contacts-cta-action"
              href="tel:+74951234567"
            >
              РџРѕР·РІРѕРЅРёС‚СЊ
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
