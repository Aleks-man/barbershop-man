import { Link } from 'react-router-dom'
import bookingBg from '../assets/booking-bg.webp'
import { SocialLinks } from './SocialLinks'

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
            <dd>Симферополь, Смежный 10</dd>
          </div>
          <div>
            <dt>Телефон</dt>
            <dd>
              <a href="tel:+79781234567">+7 (978) 123-45-67</a>
            </dd>
          </div>
          <div>
            <dt>Время работы</dt>
            <dd>ежедневно 10:00-21:00</dd>
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
