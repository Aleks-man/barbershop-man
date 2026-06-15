import { PageIntro } from '../components/PageIntro'
import { barbers, schedule, services } from '../data/site'

export function BookingPage() {
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
