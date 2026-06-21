import { type CSSProperties, useEffect, useMemo, useState } from 'react'
import { getAvailability } from '../api/availability'
import {
  createAdminBarber,
  getAdminAppointments,
  getAdminBarbers,
  hideAdminBarber,
  loginAdmin,
  rescheduleAdminAppointment,
  uploadAdminBarberPhoto,
  updateAdminAppointmentStatus,
  type AdminAppointment,
  type AdminBarber,
  type AdminSessionRole,
} from '../api/admin'
import { BookingDatePicker } from '../components/BookingDatePicker'
import { BookingSelect, type BookingSelectOption } from '../components/BookingSelect'
import adminBg from '../assets/admin-bg.webp'

const tokenStorageKey = 'barbershop-admin-token'
const sessionStorageKey = 'barbershop-admin-session'
const defaultBarberPassword = '111111'

const adminPageStyle = {
  '--admin-bg': `url(${adminBg})`,
} as CSSProperties

type AdminSession = {
  barberId?: string
  name?: string
  role: AdminSessionRole
  token: string
}

const readStoredSession = () => {
  const storedSession = sessionStorage.getItem(sessionStorageKey)

  if (!storedSession) {
    const legacyToken = sessionStorage.getItem(tokenStorageKey)

    return legacyToken ? { role: 'admin' as const, token: legacyToken } : null
  }

  try {
    return JSON.parse(storedSession) as AdminSession
  } catch {
    sessionStorage.removeItem(sessionStorageKey)
    return null
  }
}

type AdminTab = 'upcoming' | 'completed' | 'cancelled'
type AppointmentPeriod = 'all' | 'today' | 'tomorrow' | 'custom'
type AppointmentScope = 'selected' | 'all'
type AdminView = 'schedule' | 'clients' | 'barbers'

const tabs: Array<{ label: string; value: AdminTab }> = [
  { label: 'Ожидают', value: 'upcoming' },
  { label: 'Выполнено', value: 'completed' },
  { label: 'Отменены', value: 'cancelled' },
]

const periods: Array<{ label: string; value: AppointmentPeriod }> = [
  { label: 'Все', value: 'all' },
  { label: 'Сегодня', value: 'today' },
  { label: 'Завтра', value: 'tomorrow' },
]

const adminViews: Array<{ label: string; value: AdminView }> = [
  { label: 'Расписание', value: 'schedule' },
  { label: 'Клиенты', value: 'clients' },
  { label: 'Мастера', value: 'barbers' },
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
  COMPLETED: 'Ожидает',
  CONFIRMED: 'Активна',
  PENDING: 'Ожидает',
}

const getStatusLabel = (appointment: AdminAppointment) =>
  getAppointmentTab(appointment) === 'completed'
    ? 'Выполнена'
    : statusLabels[appointment.status] ?? appointment.status

const getStatusTone = (appointment: AdminAppointment) => {
  const tab = getAppointmentTab(appointment)

  if (tab === 'completed') {
    return 'completed'
  }

  if (tab === 'cancelled') {
    return 'cancelled'
  }

  return 'upcoming'
}

const getDayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)

  return nextDate
}

const isSameDay = (date: Date, targetDate: Date) =>
  date.getFullYear() === targetDate.getFullYear() &&
  date.getMonth() === targetDate.getMonth() &&
  date.getDate() === targetDate.getDate()

const matchesPeriod = (
  appointment: AdminAppointment,
  period: AppointmentPeriod,
  customDate: string,
) => {
  if (period === 'all') {
    return true
  }

  const appointmentDate = new Date(appointment.startsAt)
  const today = getDayStart(new Date())
  const targetDate =
    period === 'custom' && customDate
      ? getDayStart(new Date(`${customDate}T00:00:00`))
      : period === 'today'
        ? today
        : addDays(today, 1)

  return isSameDay(appointmentDate, targetDate)
}

export function AdminPage() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([])
  const [barbers, setBarbers] = useState<AdminBarber[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [session, setSession] = useState<AdminSession | null>(() => readStoredSession())
  const [isCheckingSession, setIsCheckingSession] = useState(Boolean(session))
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingLoginBarbers, setIsLoadingLoginBarbers] = useState(false)
  const [loginBarbersMessage, setLoginBarbersMessage] = useState('')
  const [loginBarbers, setLoginBarbers] = useState<AdminBarber[]>([])
  const [loginBarberId, setLoginBarberId] = useState('')
  const [loginRole, setLoginRole] = useState<AdminSessionRole>('admin')
  const [newBarberDescription, setNewBarberDescription] = useState('')
  const [newBarberExperience, setNewBarberExperience] = useState('')
  const [newBarberName, setNewBarberName] = useState('')
  const [newBarberPassword, setNewBarberPassword] = useState(defaultBarberPassword)
  const [newBarberPhotoUrl, setNewBarberPhotoUrl] = useState('')
  const [newBarberRole, setNewBarberRole] = useState('')
  const [password, setPassword] = useState('')
  const [adminView, setAdminView] = useState<AdminView>('schedule')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentPeriod, setAppointmentPeriod] = useState<AppointmentPeriod>('all')
  const [appointmentScope, setAppointmentScope] = useState<AppointmentScope>('selected')
  const [clientSearch, setClientSearch] = useState('')
  const [selectedBarberId, setSelectedBarberId] = useState('')
  const [selectedTab, setSelectedTab] = useState<AdminTab>('upcoming')
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState('')
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [rescheduleTimeOptions, setRescheduleTimeOptions] = useState<BookingSelectOption[]>([])
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState('')
  const token = session?.token ?? ''
  const isAdminSession = session?.role === 'admin'

  const rescheduleAppointment = appointments.find(
    (appointment) => appointment.id === rescheduleAppointmentId,
  )

  const loadLoginBarbers = () => {
    setIsLoadingLoginBarbers(true)
    setLoginBarbersMessage('')

    fetch('/api/barbers')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load barbers')
        }

        return response.json() as Promise<{ barbers: AdminBarber[] }>
      })
      .then((data) => {
        setLoginBarbers(data.barbers)
        setLoginBarberId((currentBarberId) => currentBarberId || data.barbers[0]?.id || '')
        setLoginBarbersMessage(data.barbers.length === 0 ? 'В базе пока нет активных мастеров.' : '')
      })
      .catch(() => {
        setLoginBarbers([])
        setLoginBarberId('')
        setLoginBarbersMessage('Не удалось загрузить мастеров из базы. Проверьте, что backend запущен.')
      })
      .finally(() => {
        setIsLoadingLoginBarbers(false)
      })
  }

  useEffect(() => {
    if (session) {
      return
    }

    let isMounted = true

    fetch('/api/barbers')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load barbers')
        }

        return response.json() as Promise<{ barbers: AdminBarber[] }>
      })
      .then((data) => {
        if (!isMounted) {
          return
        }

        setLoginBarbers(data.barbers)
        setLoginBarberId((currentBarberId) => currentBarberId || data.barbers[0]?.id || '')
        setLoginBarbersMessage(data.barbers.length === 0 ? 'В базе пока нет активных мастеров.' : '')
      })
      .catch(() => {
        if (isMounted) {
          setLoginBarbers([])
          setLoginBarberId('')
          setLoginBarbersMessage('Не удалось загрузить мастеров из базы. Проверьте, что backend запущен.')
        }
      })

    return () => {
      isMounted = false
    }
  }, [session])

  useEffect(() => {
    if (!session) {
      return
    }

    Promise.all([getAdminBarbers(session.token), getAdminAppointments(session.token)])
      .then(([nextBarbers, nextAppointments]) => {
        setBarbers(nextBarbers)
        setAppointments(nextAppointments)
        setSelectedBarberId((currentBarberId) =>
          session.role === 'barber'
            ? session.barberId || nextBarbers[0]?.id || ''
            : currentBarberId || nextBarbers[0]?.id || '',
        )
        setErrorMessage('')
      })
      .catch(() => {
        sessionStorage.removeItem(tokenStorageKey)
        sessionStorage.removeItem(sessionStorageKey)
        setSession(null)
        setAppointments([])
        setBarbers([])
        setErrorMessage('Сессия истекла. Войдите снова.')
      })
      .finally(() => {
        setIsCheckingSession(false)
      })
  }, [session])

  const selectedBarber = barbers.find((barber) => barber.id === selectedBarberId)
  const canViewAllBarbers = isAdminSession && appointmentScope === 'all'
  const scopedAppointments = useMemo(
    () =>
      canViewAllBarbers
        ? appointments
        : appointments.filter((appointment) => appointment.barber.id === selectedBarberId),
    [appointments, canViewAllBarbers, selectedBarberId],
  )
  const periodAppointments = useMemo(
    () =>
      scopedAppointments.filter((appointment) =>
        matchesPeriod(appointment, appointmentPeriod, appointmentDate),
      ),
    [appointmentDate, appointmentPeriod, scopedAppointments],
  )
  const filteredAppointments = useMemo(
    () =>
      periodAppointments.filter((appointment) => getAppointmentTab(appointment) === selectedTab),
    [periodAppointments, selectedTab],
  )
  const tabCounts = useMemo(
    () =>
      tabs.reduce<Record<AdminTab, number>>(
        (counts, tab) => ({
          ...counts,
          [tab.value]: periodAppointments.filter((appointment) => getAppointmentTab(appointment) === tab.value)
            .length,
        }),
        {
          cancelled: 0,
          completed: 0,
          upcoming: 0,
        },
      ),
    [periodAppointments],
  )
  const clientSourceAppointments = useMemo(
    () =>
      isAdminSession
        ? appointments
        : appointments.filter((appointment) => appointment.barber.id === selectedBarberId),
    [appointments, isAdminSession, selectedBarberId],
  )
  const clients = useMemo(() => {
    const clientsByPhone = new Map<
      string,
      { barberNames: Set<string>; lastVisit: string; name: string; phone: string; visits: number }
    >()

    clientSourceAppointments.forEach((appointment) => {
      const existingClient = clientsByPhone.get(appointment.customerPhone)
      const nextVisitTime = new Date(appointment.startsAt).getTime()

      if (!existingClient) {
        clientsByPhone.set(appointment.customerPhone, {
          barberNames: new Set([appointment.barber.name]),
          lastVisit: appointment.startsAt,
          name: appointment.customerName,
          phone: appointment.customerPhone,
          visits: 1,
        })
        return
      }

      clientsByPhone.set(appointment.customerPhone, {
        barberNames: new Set([...existingClient.barberNames, appointment.barber.name]),
        lastVisit:
          nextVisitTime > new Date(existingClient.lastVisit).getTime()
            ? appointment.startsAt
            : existingClient.lastVisit,
        name: existingClient.name || appointment.customerName,
        phone: appointment.customerPhone,
        visits: existingClient.visits + 1,
      })
    })

    return Array.from(clientsByPhone.values()).sort((firstClient, secondClient) =>
      firstClient.name.localeCompare(secondClient.name, 'ru'),
    )
  }, [clientSourceAppointments])
  const filteredClients = useMemo(() => {
    const searchValue = clientSearch.trim().toLowerCase()

    if (!searchValue) {
      return clients
    }

    const searchDigits = searchValue.replace(/\D/g, '')

    return clients.filter((client) => {
      const clientDigits = client.phone.replace(/\D/g, '')

      return (
        client.name.toLowerCase().includes(searchValue) ||
        client.phone.toLowerCase().includes(searchValue) ||
        (Boolean(searchDigits) && clientDigits.includes(searchDigits))
      )
    })
  }, [clientSearch, clients])
  const loginBarberOptions = useMemo(
    () =>
      loginBarbers.map((barber) => ({
        label: barber.name,
        value: barber.id,
      })),
    [loginBarbers],
  )

  const handleLogin = async () => {
    if (!password.trim() || (loginRole === 'barber' && !loginBarberId)) {
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await loginAdmin({
        barberId: loginRole === 'barber' ? loginBarberId : undefined,
        password,
        role: loginRole,
      })
      const nextSession: AdminSession = {
        barberId: response.barberId,
        name: response.name,
        role: response.role,
        token: response.token,
      }

      sessionStorage.removeItem(tokenStorageKey)
      sessionStorage.setItem(sessionStorageKey, JSON.stringify(nextSession))
      setSession(nextSession)
      setIsCheckingSession(true)
      setPassword('')
    } catch {
      setErrorMessage('Неверный пароль.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem(tokenStorageKey)
    sessionStorage.removeItem(sessionStorageKey)
    setSession(null)
    setAppointments([])
    setBarbers([])
    setAdminView('schedule')
    setAppointmentDate('')
    setAppointmentPeriod('all')
    setAppointmentScope('selected')
    setClientSearch('')
    setSelectedBarberId('')
  }

  const handleCreateBarber = async () => {
    if (!isAdminSession || !newBarberName.trim()) {
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const uploadedPhoto =
        newBarberPhotoUrl.startsWith('data:image/')
          ? await uploadAdminBarberPhoto({
              dataUrl: newBarberPhotoUrl,
              token,
            })
          : null
      const response = await createAdminBarber({
        description: newBarberDescription,
        experience: newBarberExperience,
        name: newBarberName,
        password: newBarberPassword || defaultBarberPassword,
        photoUrl: uploadedPhoto?.photoUrl ?? newBarberPhotoUrl,
        role: newBarberRole,
        token,
      })

      setBarbers((currentBarbers) => [...currentBarbers, response.barber])
      setSelectedBarberId((currentBarberId) => currentBarberId || response.barber.id)
      setNewBarberDescription('')
      setNewBarberExperience('')
      setNewBarberName('')
      setNewBarberPassword(defaultBarberPassword)
      setNewBarberPhotoUrl('')
      setNewBarberRole('')
    } catch {
      setErrorMessage('Не удалось добавить мастера.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBarberPhotoChange = (file: File | undefined) => {
    if (!file) {
      setNewBarberPhotoUrl('')
      return
    }

    const reader = new FileReader()

    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        setNewBarberPhotoUrl(reader.result)
      }
    })
    reader.readAsDataURL(file)
  }

  const handleHideBarber = async (barberId: string) => {
    if (!isAdminSession) {
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      await hideAdminBarber({
        barberId,
        token,
      })

      setBarbers((currentBarbers) => {
        const nextBarbers = currentBarbers.filter((barber) => barber.id !== barberId)

        if (selectedBarberId === barberId) {
          setSelectedBarberId(nextBarbers[0]?.id || '')
        }

        return nextBarbers
      })
    } catch {
      setErrorMessage('Не удалось скрыть мастера. Проверьте, что у него нет будущих записей.')
    } finally {
      setIsLoading(false)
    }
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

  if (!session) {
    return (
      <main className="admin-page" style={adminPageStyle}>
        <div className="page-text-logo admin-text-logo" aria-hidden="true">
          <img src="/gentlemansroom_text_logo_transparent.png" alt="" />
        </div>
        <form
          className="admin-login"
          onSubmit={(event) => {
            event.preventDefault()
            void handleLogin()
          }}
        >
          <span className="admin-eyebrow">Gentleman's Room</span>
          <h1>Вход в админку</h1>
          <div className="admin-login-roles" role="tablist" aria-label="Роль входа">
            <button
              type="button"
              aria-selected={loginRole === 'admin'}
              onClick={() => {
                setLoginRole('admin')
                setErrorMessage('')
              }}
            >
              Админ
            </button>
            <button
              type="button"
              aria-selected={loginRole === 'barber'}
              onClick={() => {
                setLoginRole('barber')
                setErrorMessage('')
                loadLoginBarbers()
              }}
            >
              Мастер
            </button>
          </div>
          {loginRole === 'barber' && (
            <>
              <BookingSelect
                disabled={isLoadingLoginBarbers}
                label="Мастер"
                name="loginBarber"
                options={loginBarberOptions}
                placeholder={
                  isLoadingLoginBarbers ? 'Загружаем мастеров' : 'Выберите мастера'
                }
                value={loginBarberId}
                onChange={(nextBarberId) => {
                  setLoginBarberId(nextBarberId)
                  setErrorMessage('')
                }}
              />
              {loginBarbersMessage && <p className="admin-login-note">{loginBarbersMessage}</p>}
            </>
          )}
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
          <button
            type="button"
            className="admin-login-submit"
            disabled={isLoading || !password.trim() || (loginRole === 'barber' && !loginBarberId)}
            onClick={handleLogin}
          >
            Войти
          </button>
          {errorMessage && <p role="status">{errorMessage}</p>}
        </form>
      </main>
    )
  }

  return (
    <main className="admin-page" style={adminPageStyle}>
      <div className="page-text-logo admin-text-logo" aria-hidden="true">
        <img src="/gentlemansroom_text_logo_transparent.png" alt="" />
      </div>
      <section className="admin-shell">
        <header className="admin-header">
          <div>
            <span className="admin-eyebrow">{isAdminSession ? 'Админка' : 'Кабинет мастера'}</span>
            <h1>{isAdminSession ? 'Расписание мастеров' : 'Мои записи'}</h1>
          </div>
          <button type="button" onClick={handleLogout}>
            Выйти
          </button>
        </header>

        <nav className="admin-view-tabs" aria-label="Разделы админки">
          {adminViews.map((view) => (
            <button
              type="button"
              aria-pressed={adminView === view.value}
              key={view.value}
              onClick={() => setAdminView(view.value)}
            >
              {view.label}
            </button>
          ))}
        </nav>

        {isCheckingSession && <p className="admin-muted">Загружаем расписание...</p>}
        {errorMessage && <p className="admin-alert">{errorMessage}</p>}

        {!isCheckingSession && barbers.length > 0 && adminView === 'schedule' && (
          <>
            {isAdminSession && (
              <nav className="admin-barbers" aria-label="Мастера">
                {barbers.map((barber) => (
                  <button
                    type="button"
                    aria-pressed={barber.id === selectedBarberId}
                    key={barber.id}
                    onClick={() => {
                      setAppointmentScope('selected')
                      setSelectedBarberId(barber.id)
                      setSelectedTab('upcoming')
                    }}
                  >
                    <span>{barber.name}</span>
                    {barber.role && <small>{barber.role}</small>}
                  </button>
                ))}
              </nav>
            )}

            <section className="admin-schedule">
              <header className="admin-schedule-header">
                <div>
                  <span className="admin-eyebrow">{canViewAllBarbers ? 'Обзор' : 'Мастер'}</span>
                  <h2>{canViewAllBarbers ? 'Все мастера' : selectedBarber?.name}</h2>
                </div>
                {isAdminSession && selectedBarber && !canViewAllBarbers && (
                  <button
                    type="button"
                    className="admin-danger-button"
                    disabled={isLoading}
                    onClick={() => void handleHideBarber(selectedBarber.id)}
                  >
                    Скрыть мастера
                  </button>
                )}
              </header>

              <div className="admin-schedule-tools">
                {isAdminSession && (
                  <div className="admin-filter-group">
                    <span>Показывать</span>
                    <div className="admin-segmented" aria-label="Область записей">
                      <button
                        type="button"
                        aria-pressed={appointmentScope === 'selected'}
                        onClick={() => setAppointmentScope('selected')}
                      >
                        Выбранный мастер
                      </button>
                      <button
                        type="button"
                        aria-pressed={appointmentScope === 'all'}
                        onClick={() => setAppointmentScope('all')}
                      >
                        Все мастера
                      </button>
                    </div>
                  </div>
                )}
                <div className="admin-filter-group">
                  <span>Период</span>
                  <div className="admin-segmented" aria-label="Период записей">
                    {periods.map((period) => (
                      <button
                        type="button"
                        aria-pressed={appointmentPeriod === period.value}
                        key={period.value}
                        onClick={() => {
                          setAppointmentDate('')
                          setAppointmentPeriod(period.value)
                        }}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
                  <div className="admin-period-date">
                    <BookingDatePicker
                      allowPastDates
                      label="Дата"
                      placeholder="Выбрать дату"
                      value={appointmentDate}
                      onChange={(nextDate) => {
                        setAppointmentDate(nextDate)
                        setAppointmentPeriod('custom')
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-stats" role="tablist" aria-label="Статус записей">
                {tabs.map((tab) => (
                  <button
                    type="button"
                    aria-selected={selectedTab === tab.value}
                    key={tab.value}
                    role="tab"
                    onClick={() => setSelectedTab(tab.value)}
                  >
                    <span>{tab.label}</span>
                    <strong>{tabCounts[tab.value]}</strong>
                  </button>
                ))}
              </div>

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
                          {canViewAllBarbers && <th>Мастер</th>}
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
                            {canViewAllBarbers && <td>{appointment.barber.name}</td>}
                            <td>{appointment.customerName}</td>
                            <td>{appointment.customerPhone}</td>
                            <td>{appointment.service.title}</td>
                            <td>
                              <span className={`admin-status admin-status--${getStatusTone(appointment)}`}>
                                {getStatusLabel(appointment)}
                              </span>
                            </td>
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
                          <span className={`admin-status admin-status--${getStatusTone(appointment)}`}>
                            {getStatusLabel(appointment)}
                          </span>
                        </header>
                        <dl>
                          {canViewAllBarbers && (
                            <div>
                              <dt>Мастер</dt>
                              <dd>{appointment.barber.name}</dd>
                            </div>
                          )}
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

        {!isCheckingSession && adminView === 'clients' && (
          <section className="admin-clients-page">
            <header className="admin-section-header">
              <div>
                <span className="admin-eyebrow">Клиенты</span>
                <h2>{isAdminSession ? 'Список клиентов' : 'Мои клиенты'}</h2>
              </div>
              <strong>{filteredClients.length}</strong>
            </header>

            <label className="admin-client-search">
              Поиск
              <input
                type="search"
                placeholder="Имя или телефон"
                value={clientSearch}
                onChange={(event) => setClientSearch(event.target.value)}
              />
            </label>

            {filteredClients.length === 0 ? (
              <p className="admin-muted">Клиенты не найдены.</p>
            ) : (
              <>
                <div className="admin-table-wrap admin-clients-table-wrap">
                  <table className="admin-table admin-clients-table">
                    <thead>
                      <tr>
                        <th>Клиент</th>
                        <th>Телефон</th>
                        <th>Визиты</th>
                        <th>Последний визит</th>
                        {isAdminSession && <th>Мастера</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.map((client) => (
                        <tr key={client.phone}>
                          <td>{client.name}</td>
                          <td>
                            <a href={`tel:${client.phone}`}>{client.phone}</a>
                          </td>
                          <td>{client.visits}</td>
                          <td>{dateTimeFormatter.format(new Date(client.lastVisit))}</td>
                          {isAdminSession && <td>{Array.from(client.barberNames).join(', ')}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="admin-client-list">
                  {filteredClients.map((client) => (
                    <article className="admin-client-card" key={client.phone}>
                      <div>
                        <strong>{client.name}</strong>
                        <a href={`tel:${client.phone}`}>{client.phone}</a>
                      </div>
                      <dl>
                        <div>
                          <dt>Визиты</dt>
                          <dd>{client.visits}</dd>
                        </div>
                        <div>
                          <dt>Последний визит</dt>
                          <dd>{dateTimeFormatter.format(new Date(client.lastVisit))}</dd>
                        </div>
                        {isAdminSession && (
                          <div>
                            <dt>Мастера</dt>
                            <dd>{Array.from(client.barberNames).join(', ')}</dd>
                          </div>
                        )}
                      </dl>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {!isCheckingSession && isAdminSession && adminView === 'barbers' && (
          <section className="admin-manager-page">
            <section className="admin-manager">
              <header>
                <div>
                  <span className="admin-eyebrow">Мастера</span>
                  <h2>Добавить мастера</h2>
                </div>
              </header>
              <div className="admin-manager-form">
                <label>
                  Имя
                  <input
                    type="text"
                    value={newBarberName}
                    onChange={(event) => setNewBarberName(event.target.value)}
                  />
                </label>
                <label>
                  Специализация
                  <input
                    type="text"
                    value={newBarberRole}
                    onChange={(event) => setNewBarberRole(event.target.value)}
                  />
                </label>
                <label>
                  Опыт
                  <input
                    type="text"
                    placeholder="Например: 7 лет опыта"
                    value={newBarberExperience}
                    onChange={(event) => setNewBarberExperience(event.target.value)}
                  />
                </label>
                <label>
                  Пароль
                  <input
                    type="text"
                    value={newBarberPassword}
                    onChange={(event) => setNewBarberPassword(event.target.value)}
                  />
                </label>
                <label className="admin-manager-form-wide">
                  Описание
                  <textarea
                    rows={3}
                    value={newBarberDescription}
                    onChange={(event) => setNewBarberDescription(event.target.value)}
                  />
                </label>
                <label className="admin-photo-upload">
                  Фото
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleBarberPhotoChange(event.target.files?.[0])}
                  />
                  <span>{newBarberPhotoUrl ? 'Заменить фото' : 'Добавить фото'}</span>
                </label>
                {newBarberPhotoUrl && (
                  <img
                    className="admin-manager-photo-preview"
                    src={newBarberPhotoUrl}
                    alt=""
                    aria-hidden="true"
                  />
                )}
                <button
                  type="button"
                  disabled={isLoading || !newBarberName.trim()}
                  onClick={() => void handleCreateBarber()}
                >
                  Добавить мастера
                </button>
              </div>
            </section>

            <section className="admin-manager">
              <header>
                <div>
                  <span className="admin-eyebrow">Команда</span>
                  <h2>Активные мастера</h2>
                </div>
              </header>
              <nav className="admin-barbers" aria-label="Мастера">
                {barbers.map((barber) => (
                  <button
                    type="button"
                    aria-pressed={barber.id === selectedBarberId}
                    key={barber.id}
                    onClick={() => {
                      setAppointmentScope('selected')
                      setSelectedBarberId(barber.id)
                      setAdminView('schedule')
                      setSelectedTab('upcoming')
                    }}
                  >
                    <span>{barber.name}</span>
                    {barber.role && <small>{barber.role}</small>}
                    {barber.password && <small>Пароль: {barber.password}</small>}
                  </button>
                ))}
              </nav>
            </section>
          </section>
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
