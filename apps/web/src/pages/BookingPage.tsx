import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getAvailability, getAvailabilityMonth } from '../api/availability'
import { createAppointment } from '../api/appointments'
import { getBookingOptions } from '../api/bookingOptions'
import { BookingDatePicker } from '../components/BookingDatePicker'
import { BookingSelect, type BookingSelectOption } from '../components/BookingSelect'
import { PageIntro } from '../components/PageIntro'
import { formatPhoneInput, normalizePhone, phoneMask } from '../utils/phone'
import bookingBg from '../assets/booking-bg.webp'
import { barbers, bookingServices, schedule } from '../data/site'

const fallbackBarberOptions: BookingSelectOption[] = barbers.map((barber) => ({
  label: barber.name,
  value: barber.name,
}))

const fallbackServiceOptions: BookingSelectOption[] = bookingServices.map((service) => ({
  label: service,
  value: service,
}))

const normalizeOptionText = (value: string) => value.trim().toLowerCase().replaceAll('ё', 'е')

const findOptionValue = (options: BookingSelectOption[], requestedValue: string) => {
  if (!requestedValue) {
    return ''
  }

  const normalizedRequestedValue = normalizeOptionText(requestedValue)
  const option = options.find(
    (item) =>
      item.value === requestedValue ||
      item.label === requestedValue ||
      normalizeOptionText(item.value) === normalizedRequestedValue ||
      normalizeOptionText(item.label) === normalizedRequestedValue,
  )

  return option?.value ?? ''
}

const bookingDraftStorageKey = 'barbershop-booking-draft'

type BookingDraft = {
  barber: string
  date: string
  name: string
  phone: string
  privacyAccepted: boolean
  service: string
  time: string
}

const emptyBookingDraft: BookingDraft = {
  barber: '',
  date: '',
  name: '',
  phone: '',
  privacyAccepted: false,
  service: '',
  time: '',
}

const readBookingDraft = () => {
  try {
    const rawDraft = window.sessionStorage.getItem(bookingDraftStorageKey)

    if (!rawDraft) {
      return emptyBookingDraft
    }

    return {
      ...emptyBookingDraft,
      ...(JSON.parse(rawDraft) as Partial<BookingDraft>),
    }
  } catch {
    return emptyBookingDraft
  }
}

const writeBookingDraft = (draft: BookingDraft) => {
  try {
    window.sessionStorage.setItem(bookingDraftStorageKey, JSON.stringify(draft))
  } catch {
    // Browser storage can be unavailable in private mode.
  }
}

export function BookingPage() {
  const [searchParams] = useSearchParams()
  const requestedService = searchParams.get('service') ?? ''
  const requestedBarber = searchParams.get('barber') ?? ''
  const [bookingDraft] = useState(readBookingDraft)
  const [name, setName] = useState(bookingDraft.name)
  const [phone, setPhone] = useState(bookingDraft.phone)
  const [service, setService] = useState(() =>
    findOptionValue(fallbackServiceOptions, requestedService) || bookingDraft.service,
  )
  const [barber, setBarber] = useState(() => findOptionValue(fallbackBarberOptions, requestedBarber) || bookingDraft.barber)
  const [date, setDate] = useState(bookingDraft.date)
  const [time, setTime] = useState(bookingDraft.time)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(bookingDraft.privacyAccepted)
  const [statusMessage, setStatusMessage] = useState('')
  const [barberOptions, setBarberOptions] = useState(fallbackBarberOptions)
  const [serviceOptions, setServiceOptions] = useState(fallbackServiceOptions)
  const [availableTimeOptions, setAvailableTimeOptions] = useState<BookingSelectOption[] | null>(
    null,
  )
  const [calendarMonth, setCalendarMonth] = useState<{ month: number; year: number } | null>(null)
  const [unavailableDates, setUnavailableDates] = useState<string[]>([])
  const isLoadingAvailability = Boolean(service && barber && date && availableTimeOptions === null)
  const timeOptions = service && barber && date
    ? availableTimeOptions ?? []
    : []
  const normalizedPhone = normalizePhone(phone)
  const timePlaceholder = !service
    ? 'Сначала выберите услугу'
    : !barber
      ? 'Сначала выберите мастера'
      : !date
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
      time.trim() &&
      privacyAccepted,
  )
  const canSubmit = isFormReady && !isSubmitting
  const submitButtonText = isSubmitting
    ? 'Записываем...'
    : !service
      ? 'Сначала выберите услугу'
      : !barber
        ? 'Сначала выберите мастера'
        : 'Записаться'

  useEffect(() => {
    writeBookingDraft({
      barber,
      date,
      name,
      phone,
      privacyAccepted,
      service,
      time,
    })
  }, [barber, date, name, phone, privacyAccepted, service, time])

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
        setService(
          (currentService) =>
            findOptionValue(options.serviceOptions, currentService) ||
            findOptionValue(options.serviceOptions, requestedService) ||
            currentService,
        )
        setBarber(
          (currentBarber) =>
            findOptionValue(options.barberOptions, currentBarber) ||
            findOptionValue(options.barberOptions, requestedBarber) ||
            currentBarber,
        )
      })
      .catch((error: unknown) => {
        console.warn('Failed to load booking options from API', error)
      })

    return () => {
      isMounted = false
    }
  }, [requestedBarber, requestedService])

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

  useEffect(() => {
    if (!service || !barber || !calendarMonth) {
      return
    }

    let isMounted = true

    getAvailabilityMonth({
      barberId: barber,
      month: calendarMonth.month,
      serviceId: service,
      year: calendarMonth.year,
    })
      .then((nextUnavailableDates) => {
        if (!isMounted) {
          return
        }

        setUnavailableDates(nextUnavailableDates)
      })
      .catch((error: unknown) => {
        console.warn('Failed to load month availability from API', error)
        setUnavailableDates([])
      })

    return () => {
      isMounted = false
    }
  }, [barber, calendarMonth, service])

  const handleCalendarMonthChange = useCallback((nextMonth: { month: number; year: number }) => {
    setCalendarMonth((currentMonth) =>
      currentMonth?.month === nextMonth.month && currentMonth.year === nextMonth.year
        ? currentMonth
        : nextMonth,
    )
  }, [])

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
        privacyAccepted,
        serviceId: service,
        time,
      })

      setStatusMessage('Вы успешно записались. До встречи!')
      setName('')
      setPhone('')
      setService('')
      setBarber('')
      setDate('')
      setPrivacyAccepted(false)
      setTime('')
      setAvailableTimeOptions(null)
      setUnavailableDates([])
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
            setUnavailableDates([])
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
            setUnavailableDates([])
            setStatusMessage('')
          }}
        />
        <BookingDatePicker
          disabled={!service || !barber}
          label="Дата"
          placeholder={
            !service
              ? 'Сначала выберите услугу'
              : barber
                ? 'Выберите дату'
                : 'Сначала выберите мастера'
          }
          unavailableDates={service && barber ? unavailableDates : []}
          value={date}
          onChange={(nextDate) => {
            setDate(nextDate)
            setTime('')
            setAvailableTimeOptions(null)
            setStatusMessage('')
          }}
          onVisibleMonthChange={handleCalendarMonthChange}
        />
        <BookingSelect
          disabled={!service || !barber || !date || isLoadingAvailability || timeOptions.length === 0}
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
        <label className="booking-consent">
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(event) => {
              setPrivacyAccepted(event.currentTarget.checked)
              setStatusMessage('')
            }}
          />
          <span>
            Я согласен на обработку персональных данных и ознакомлен с{' '}
            <Link to="/privacy">Политикой конфиденциальности</Link>.
          </span>
        </label>
        <button type="button" disabled={!canSubmit} onClick={handleSubmit}>
          {submitButtonText}
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
