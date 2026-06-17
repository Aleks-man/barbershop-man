import { Link } from 'react-router-dom'
import bookingBg from '../assets/booking-bg.webp'

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
  )
}
