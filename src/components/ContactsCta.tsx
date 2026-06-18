import { Link } from 'react-router-dom'
import bookingBg from '../assets/booking-bg.webp'
import { SocialLinks } from './SocialLinks'

const mapUrl = 'https://yandex.ru/maps/?text=Симферополь%2C%20Смежный%2010'

export function ContactsCta() {
  return (
    <section
      className="home-visual-band contacts-cta-band site-footer-cta"
      style={{ backgroundImage: `url(${bookingBg})` }}
    >
      <div className="home-section contacts-cta">
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
              <a className="contacts-phone-link" href="tel:+79781234567">+7 (978) 123-45-67</a>
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
          <a className="secondary-action contacts-cta-action" href="tel:+74951234567">
            Позвонить
          </a>
        </div>
      </div>
    </section>
  )
}
