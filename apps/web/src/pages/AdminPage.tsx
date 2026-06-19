import { useEffect, useMemo, useState } from 'react'
import { getAvailability } from '../api/availability'
import {
  getAdminAppointments,
  getAdminBarbers,
  loginAdmin,
  rescheduleAdminAppointment,
  updateAdminAppointmentStatus,
  type AdminAppointment,
  type AdminBarber,
} from '../api/admin'
import { BookingDatePicker } from '../components/BookingDatePicker'
import { BookingSelect, type BookingSelectOption } from '../components/BookingSelect'

const tokenStorageKey = 'barbershop-admin-token'

type AdminTab = 'upcoming' | 'completed' | 'cancelled'

const tabs: Array<{ label: string; value: AdminTab }> = [
  { label: 'Ожидают', value: 'upcoming' },
  { label: 'Выполнено', value: 'completed' },
  { label: 'Отменены', value: 'cancelled' },
]

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const getAppointmentTab = (appointment: AdminAppointment): AdminTab => {
  if (appointment.status === 'CANCELLED') {
    return 'cancelled'
  }

  return new Date(appointment.endsAt) < new Date() ? 'completed' : 'upcoming'
}

const statusLabels: Record<string, string> = {
  CANCELLED: 'Отменена',
  COMPLETED: 'Выполнена',
  CONFIRMED: 'Активна',
  PENDING: 'Ожидает',
}

const getStatusLabel = (appointment: AdminAppointment) =>
  getAppointmentTab(appointment) === 'completed'
    ? 'Выполнена'
    : statusLabels[appointment.status] ?? appointment.status

export function AdminPage() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([])
  const [barbers, setBarbers] = useState<AdminBarber[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isCheckingSession, setIsCheckingSession] = useState(
    Boolean(sessionStorage.getItem(tokenStorageKey)),
  )
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [selectedBarberId, setSelectedBarberId] = useState('')
  const [selectedTab, setSelectedTab] = useState<AdminTab>('upcoming')
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState('')
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [rescheduleTimeOptions, setRescheduleTimeOptions] = useState<BookingSelectOption[]>([])
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState('')
  const [token, setToken] = useState(() => sessionStorage.getItem(tokenStorageKey) ?? '')

  const rescheduleAppointment = appointments.find(
    (appointment) => appointment.id === rescheduleAppointmentId,
  )

  useEffect(() => {
    if (!token) {
      return
    }

    Promise.all([getAdminBarbers(token), getAdminAppointments(token)])
      .then(([nextBarbers, nextAppointments]) => {
        setBarbers(nextBarbers)
        setAppointments(nextAppointments)
        setSelectedBarberId((currentBarberId) => currentBarberId || nextBarbers[0]?.id || '')
        setErrorMessage('')
      })
      .catch(() => {
        sessionStorage.removeItem(tokenStorageKey)
        setToken('')
        setAppointments([])
        setBarbers([])
        setErrorMessage('Сессия истекла. Войдите снова.')
      })
      .finally(() => {
        setIsCheckingSession(false)
      })
  }, [token])

  const selectedBarber = barbers.find((barber) => barber.id === selectedBarberId)
  const filteredAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          appointment.barber.id === selectedBarberId &&
          getAppointmentTab(appointment) === selectedTab,
      ),
    [appointments, selectedBarberId, selectedTab],
  )
  const tabCounts = useMemo(
    () =>
      tabs.reduce<Record<AdminTab, number>>(
        (counts, tab) => ({
          ...counts,
          [tab.value]: appointments.filter(
            (appointment) =>
              appointment.barber.id === selectedBarberId &&
              getAppointmentTab(appointment) === tab.value,
          ).length,
        }),
        {
          cancelled: 0,
          completed: 0,
          upcoming: 0,
        },
      ),
    [appointments, selectedBarberId],
  )

  const handleLogin = async () => {
    if (!password.trim()) {
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await loginAdmin(password)
      sessionStorage.setItem(tokenStorageKey, response.token)
      setToken(response.token)
      setPassword('')
    } catch {
      setErrorMessage('Неверный пароль.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem(tokenStorageKey)
    setToken('')
    setAppointments([])
    setBarbers([])
    setSelectedBarberId('')
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    setUpdatingAppointmentId(appointmentId)
    setErrorMessage('')

    try {
      await updateAdminAppointmentStatus({
        appointmentId,
        status: 'CANCELLED',
        token,
      })

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: 'CANCELLED' }
            : appointment,
        ),
      )
    } catch {
      setErrorMessage('Не удалось отменить запись.')
    } finally {
      setUpdatingAppointmentId('')
    }
  }

  useEffect(() => {
    if (!rescheduleAppointment || !rescheduleDate) {
      return
    }

    let isMounted = true

    getAvailability({
      barberId: rescheduleAppointment.barber.id,
      date: rescheduleDate,
      serviceId: rescheduleAppointment.service.id,
    })
      .then((slots) => {
        if (!isMounted) {
          return
        }

        setRescheduleTimeOptions(slots)
      })
      .catch(() => {
        setRescheduleTimeOptions([])
      })

    return () => {
      isMounted = false
    }
  }, [rescheduleAppointment, rescheduleDate])

  const openRescheduleForm = (appointment: AdminAppointment) => {
    setRescheduleAppointmentId(appointment.id)
    setRescheduleDate('')
    setRescheduleTime('')
    setRescheduleTimeOptions([])
    setErrorMessage('')
  }

  const closeRescheduleForm = () => {
    setRescheduleAppointmentId('')
    setRescheduleDate('')
    setRescheduleTime('')
    setRescheduleTimeOptions([])
  }

  const handleRescheduleAppointment = async () => {
    if (!rescheduleAppointment || !rescheduleDate || !rescheduleTime) {
      return
    }

    setUpdatingAppointmentId(rescheduleAppointment.id)
    setErrorMessage('')

    try {
      const response = await rescheduleAdminAppointment({
        appointmentId: rescheduleAppointment.id,
        date: rescheduleDate,
        time: rescheduleTime,
        token,
      })

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === rescheduleAppointment.id
            ? {
                ...appointment,
                endsAt: response.appointment.endsAt,
                startsAt: response.appointment.startsAt,
              }
            : appointment,
        ),
      )
      closeRescheduleForm()
    } catch {
      setErrorMessage('Не удалось перенести запись. Выберите другое время.')
    } finally {
      setUpdatingAppointmentId('')
    }
  }

  const renderAppointmentActions = (appointment: AdminAppointment) => {
    if (selectedTab !== 'upcoming') {
      return null
    }

    return (
      <div className="admin-actions">
        <button
          type="button"
          disabled={updatingAppointmentId === appointment.id}
          onClick={() => openRescheduleForm(appointment)}
        >
          Перенести
        </button>
        <button
          type="button"
          disabled={updatingAppointmentId === appointment.id}
          onClick={() => void handleCancelAppointment(appointment.id)}
        >
          Отменить
        </button>
      </div>
    )
  }

  if (!token) {
    return (
      <main className="admin-page">
        <form
          className="admin-login"
          onSubmit={(event) => {
            event.preventDefault()
            void handleLogin()
          }}
        >
          <span className="admin-eyebrow">Gentleman's Room</span>
          <h1>Вход в админку</h1>
          <label>
            Пароль
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setErrorMessage('')
              }}
            />
          </label>
          <button type="button" disabled={isLoading || !password.trim()} onClick={handleLogin}>
            Войти
          </button>
          {errorMessage && <p role="status">{errorMessage}</p>}
        </form>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <header className="admin-header">
          <div>
            <span className="admin-eyebrow">Админка</span>
            <h1>Расписание мастеров</h1>
          </div>
          <button type="button" onClick={handleLogout}>
            Выйти
          </button>
        </header>

        {isCheckingSession && <p className="admin-muted">Загружаем расписание...</p>}
        {errorMessage && <p className="admin-alert">{errorMessage}</p>}

        {!isCheckingSession && barbers.length > 0 && (
          <>
            <nav className="admin-barbers" aria-label="Мастера">
              {barbers.map((barber) => (
                <button
                  type="button"
                  aria-pressed={barber.id === selectedBarberId}
                  key={barber.id}
                  onClick={() => {
                    setSelectedBarberId(barber.id)
                    setSelectedTab('upcoming')
                  }}
                >
                  <span>{barber.name}</span>
                  {barber.role && <small>{barber.role}</small>}
                </button>
              ))}
            </nav>

            <section className="admin-schedule">
              <header className="admin-schedule-header">
                <div>
                  <span className="admin-eyebrow">Мастер</span>
                  <h2>{selectedBarber?.name}</h2>
                </div>
                <div className="admin-tabs" role="tablist" aria-label="Статус записей">
                  {tabs.map((tab) => (
                    <button
                      type="button"
                      aria-selected={selectedTab === tab.value}
                      key={tab.value}
                      role="tab"
                      onClick={() => setSelectedTab(tab.value)}
                    >
                      {tab.label}
                      <span>{tabCounts[tab.value]}</span>
                    </button>
                  ))}
                </div>
              </header>

              {filteredAppointments.length === 0 && (
                <p className="admin-muted">Записей в этой вкладке пока нет.</p>
              )}

              {filteredAppointments.length > 0 && (
                <>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Время</th>
                          <th>Клиент</th>
                          <th>Телефон</th>
                          <th>Услуга</th>
                          <th>Статус</th>
                          <th>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAppointments.map((appointment) => (
                          <tr key={appointment.id}>
                            <td>{dateTimeFormatter.format(new Date(appointment.startsAt))}</td>
                            <td>{appointment.customerName}</td>
                            <td>{appointment.customerPhone}</td>
                            <td>{appointment.service.title}</td>
                            <td>{getStatusLabel(appointment)}</td>
                            <td>{renderAppointmentActions(appointment)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="admin-appointment-list">
                    {filteredAppointments.map((appointment) => (
                      <article className="admin-appointment-card" key={appointment.id}>
                        <header>
                          <strong>
                            {dateTimeFormatter.format(new Date(appointment.startsAt))}
                          </strong>
                          <span>{getStatusLabel(appointment)}</span>
                        </header>
                        <dl>
                          <div>
                            <dt>Клиент</dt>
                            <dd>{appointment.customerName}</dd>
                          </div>
                          <div>
                            <dt>Телефон</dt>
                            <dd>{appointment.customerPhone}</dd>
                          </div>
                          <div>
                            <dt>Услуга</dt>
                            <dd>{appointment.service.title}</dd>
                          </div>
                        </dl>
                        {renderAppointmentActions(appointment)}
                      </article>
                    ))}
                  </div>
                </>
              )}
            </section>
          </>
        )}

        {!isCheckingSession && barbers.length === 0 && (
          <p className="admin-muted">Мастера пока не добавлены.</p>
        )}
      </section>
      {rescheduleAppointment && (
        <div className="admin-modal-backdrop">
          <section className="admin-modal" aria-modal="true" role="dialog">
            <header>
              <div>
                <span className="admin-eyebrow">Перенос записи</span>
                <h2>{rescheduleAppointment.customerName}</h2>
              </div>
              <button type="button" onClick={closeRescheduleForm}>
                Закрыть
              </button>
            </header>
            <BookingDatePicker
              label="Новая дата"
              placeholder="Выберите дату"
              value={rescheduleDate}
              onChange={(nextDate) => {
                setRescheduleDate(nextDate)
                setRescheduleTime('')
                setRescheduleTimeOptions([])
              }}
            />
            <BookingSelect
              disabled={!rescheduleDate || rescheduleTimeOptions.length === 0}
              label="Новое время"
              name="rescheduleTime"
              options={rescheduleTimeOptions}
              placeholder={rescheduleDate ? 'Выберите время' : 'Сначала выберите дату'}
              value={rescheduleTime}
              onChange={setRescheduleTime}
            />
            <button
              type="button"
              disabled={
                updatingAppointmentId === rescheduleAppointment.id ||
                !rescheduleDate ||
                !rescheduleTime
              }
              onClick={() => void handleRescheduleAppointment()}
            >
              Сохранить перенос
            </button>
          </section>
        </div>
      )}
    </main>
  )
}
