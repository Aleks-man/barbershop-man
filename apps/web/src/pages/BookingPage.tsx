import { useEffect, useState } from 'react'
import { getBookingOptions } from '../api/bookingOptions'
import { BookingDatePicker } from '../components/BookingDatePicker'
import { BookingSelect, type BookingSelectOption } from '../components/BookingSelect'
import { PageIntro } from '../components/PageIntro'
import bookingBg from '../assets/booking-bg.webp'
import { barbers, bookingServices, bookingTimeSlots, schedule } from '../data/site'

const fallbackBarberOptions: BookingSelectOption[] = barbers.map((barber) => ({
  label: barber.name,
  value: barber.name,
}))

const fallbackServiceOptions: BookingSelectOption[] = bookingServices.map((service) => ({
  label: service,
  value: service,
}))

export function BookingPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [service, setService] = useState('')
  const [barber, setBarber] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [barberOptions, setBarberOptions] = useState(fallbackBarberOptions)
  const [serviceOptions, setServiceOptions] = useState(fallbackServiceOptions)
  const isFormReady = Boolean(
    name.trim() &&
      phone.trim() &&
      service.trim() &&
      barber.trim() &&
      date.trim() &&
      time.trim(),
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

  useEffect(() => {
    let isMounted = true

    getBookingOptions()
      .then((options) => {
        if (!isMounted) {
          return
        }

        setBarberOptions(options.barberOptions)
        setServiceOptions(options.serviceOptions)
      })
      .catch((error: unknown) => {
        console.warn('Failed to load booking options from API', error)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = () => {
    if (!isFormReady) {
      return
    }

    setStatusMessage('Заявка отправлена. Мы скоро свяжемся с вами.')
    setName('')
    setPhone('')
    setService('')
    setBarber('')
    setDate('')
    setTime('')
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
        <BookingSelect
          label="Услуга"
          name="service"
          options={serviceOptions}
          placeholder="Выберите услугу"
          value={service}
          onChange={(nextService) => {
            setService(nextService)
            setDate('')
            setTime('')
            setStatusMessage('')
          }}
        />
        <BookingSelect
          label="Мастер"
          name="barber"
          options={barberOptions}
          placeholder="Выберите мастера"
          value={barber}
          onChange={(nextBarber) => {
            setBarber(nextBarber)
            setDate('')
            setTime('')
            setStatusMessage('')
          }}
        />
        <BookingDatePicker
          disabled={!barber}
          label="Дата"
          placeholder={barber ? 'Выберите дату' : 'Сначала выберите мастера'}
          value={date}
          onChange={(nextDate) => {
            setDate(nextDate)
            setTime('')
            setStatusMessage('')
          }}
        />
        <BookingSelect
          disabled={!date}
          label="Время"
          name="time"
          options={bookingTimeSlots.map((slot) => ({ label: slot, value: slot }))}
          placeholder={date ? 'Выберите время' : 'Сначала выберите дату'}
          value={time}
          onChange={(nextTime) => {
            setTime(nextTime)
            setStatusMessage('')
          }}
        />
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
          Записаться
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
