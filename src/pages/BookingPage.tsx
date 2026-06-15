import { BookingSelect } from '../components/BookingSelect'
import { PageIntro } from '../components/PageIntro'
import bookingBg from '../assets/booking-bg.png'
import { barbers, schedule, services } from '../data/site'

export function BookingPage() {
  return (
    <main
      className="page-shell page-shell--visual booking-page"
      style={{ backgroundImage: `url(${bookingBg})` }}
    >
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
        <BookingSelect
          label="Услуга"
          name="service"
          options={services.map((service) => service.title)}
          defaultValue="Стрижка и борода"
        />
        <BookingSelect
          label="Мастер"
          name="barber"
          options={barbers.map((barber) => barber.name)}
          defaultValue="Антон"
        />
        <label>
          Телефон
          <input type="tel" name="phone" placeholder="+7 999 000 00 00" />
        </label>
        <button type="button">Оставить заявку</button>
      </form>
    </main>
  )
}
