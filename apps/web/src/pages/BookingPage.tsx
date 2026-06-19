import { useEffect, useState } from 'react'
import { getAvailability } from '../api/availability'
import { createAppointment } from '../api/appointments'
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

const fallbackTimeOptions: BookingSelectOption[] = bookingTimeSlots.map((slot) => ({
  label: slot,
  value: slot,
}))

const phoneMask = '+7 (___) ___-__-__'

const getPhoneDigits = (value: string) => {
  const digits = value.replace(/\D/g, '')

  if (digits.startsWith('8') || digits.startsWith('7')) {
    return digits.slice(1, 11)
  }

  return digits.slice(0, 10)
}

const formatPhoneInput = (value: string) => {
  const digits = getPhoneDigits(value)

  if (!digits) {
    return ''
  }

  if (digits.length <= 3) {
    return `+7 (${digits}`
  }

  if (digits.length <= 6) {
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3)}`
  }

  if (digits.length <= 8) {
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`
}

const normalizePhone = (value: string) => {
  const digits = getPhoneDigits(value)

  if (digits.length !== 10) {
    return ''
  }

  return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`
}

export function BookingPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [service, setService] = useState('')
  const [barber, setBarber] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [barberOptions, setBarberOptions] = useState(fallbackBarberOptions)
  const [serviceOptions, setServiceOptions] = useState(fallbackServiceOptions)
  const [availableTimeOptions, setAvailableTimeOptions] = useState<BookingSelectOption[] | null>(
    null,
  )
  const isLoadingAvailability = Boolean(service && barber && date && availableTimeOptions === null)
  const timeOptions = service && barber && date
    ? availableTimeOptions ?? []
    : fallbackTimeOptions
  const normalizedPhone = normalizePhone(phone)
  const timePlaceholder = !date
    ? 'Сначала выберите дату'
    : isLoadingAvailability
      ? 'Загружаем свободное время'
      : timeOptions.length > 0
        ? 'Выберите время'
        : 'Нет свободного времени'
  const isFormReady = Boolean(
    name.trim() &&
      normalizedPhone &&
      service.trim() &&
      barber.trim() &&
      date.trim() &&
      time.trim(),
  )
  const canSubmit = isFormReady && !isSubmitting

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

  useEffect(() => {
    if (!service || !barber || !date) {
      return
    }

    let isMounted = true

    getAvailability({
      barberId: barber,
      date,
      serviceId: service,
    })
      .then((slots) => {
        if (!isMounted) {
          return
        }

        setAvailableTimeOptions(slots)
      })
      .catch((error: unknown) => {
        console.warn('Failed to load availability from API', error)
        setAvailableTimeOptions([])
      })

    return () => {
      isMounted = false
    }
  }, [barber, date, service])

  const handleSubmit = async () => {
    if (!canSubmit) {
      return
    }

    setIsSubmitting(true)
    setStatusMessage('')

    try {
      await createAppointment({
        barberId: barber,
        customerName: name,
        customerPhone: normalizedPhone,
        date,
        serviceId: service,
        time,
      })

      setStatusMessage('Вы успешно записались. До встречи!')
      setName('')
      setPhone('')
      setService('')
      setBarber('')
      setDate('')
      setTime('')
      setAvailableTimeOptions(null)
    } catch (error: unknown) {
      console.warn('Failed to create appointment', error)
      setStatusMessage('Не удалось создать запись. Попробуйте выбрать другое время.')
    } finally {
      setIsSubmitting(false)
    }
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
            setAvailableTimeOptions(null)
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
            setAvailableTimeOptions(null)
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
            setAvailableTimeOptions(null)
            setStatusMessage('')
          }}
        />
        <BookingSelect
          disabled={!date || isLoadingAvailability || timeOptions.length === 0}
          label="Время"
          name="time"
          options={timeOptions}
          placeholder={timePlaceholder}
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
            autoComplete="tel"
            inputMode="numeric"
            placeholder={phoneMask}
            value={phone}
            onChange={(event) => {
              setPhone(formatPhoneInput(event.currentTarget.value))
              setStatusMessage('')
            }}
          />
        </label>
        <button type="button" disabled={!canSubmit} onClick={handleSubmit}>
          {isSubmitting ? 'Записываем...' : 'Записаться'}
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
