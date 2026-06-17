import { useEffect, useState } from 'react'
import { BookingSelect } from '../components/BookingSelect'
import { PageIntro } from '../components/PageIntro'
import bookingBg from '../assets/booking-bg.webp'
import { barbers, schedule, services } from '../data/site'

export function BookingPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [service, setService] = useState('')
  const [barber, setBarber] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const isFormReady = Boolean(
    name.trim() && phone.trim() && service.trim() && barber.trim(),
  )

  useEffect(() => {
    if (!statusMessage) {
      return
    }

    const timerId = window.setTimeout(() => {
      setStatusMessage('')
    }, 3000)

    return () => window.clearTimeout(timerId)
  }, [statusMessage])

  const handleSubmit = () => {
    if (!isFormReady) {
      return
    }

    setStatusMessage('Заявка отправлена. Мы скоро свяжемся с вами.')
    setName('')
    setPhone('')
    setService('')
    setBarber('')
  }

  return (
    <main
      className="page-shell page-shell--visual booking-page"
      style={{ backgroundImage: `url(${bookingBg})` }}
    >
      <p className="eyebrow booking-page-eyebrow">Запись</p>

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

      <form className="booking-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          Имя
          <input
            type="text"
            name="name"
            placeholder="Сергей"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setStatusMessage('')
            }}
          />
        </label>
        <BookingSelect
          label="Услуга"
          name="service"
          options={services.map((service) => service.title)}
          placeholder="Выберите услугу"
          value={service}
          onChange={(nextService) => {
            setService(nextService)
            setStatusMessage('')
          }}
        />
        <BookingSelect
          label="Мастер"
          name="barber"
          options={barbers.map((barber) => barber.name)}
          placeholder="Выберите мастера"
          value={barber}
          onChange={(nextBarber) => {
            setBarber(nextBarber)
            setStatusMessage('')
          }}
        />
        <label>
          Телефон
          <input
            type="tel"
            name="phone"
            placeholder="+7 999 000 00 00"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value)
              setStatusMessage('')
            }}
          />
        </label>
        <button type="button" disabled={!isFormReady} onClick={handleSubmit}>
          Оставить заявку
        </button>
      </form>
      {statusMessage && (
        <p className="booking-toast" role="status">
          {statusMessage}
        </p>
      )}
    </main>
  )
}
