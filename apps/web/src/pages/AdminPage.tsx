import { useEffect, useState } from 'react'
import {
  getAdminAppointments,
  loginAdmin,
  type AdminAppointment,
} from '../api/admin'

const tokenStorageKey = 'barbershop-admin-token'

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function AdminPage() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isCheckingSession, setIsCheckingSession] = useState(Boolean(sessionStorage.getItem(tokenStorageKey)))
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(() => sessionStorage.getItem(tokenStorageKey) ?? '')

  useEffect(() => {
    if (!token) {
      return
    }

    getAdminAppointments(token)
      .then((nextAppointments) => {
        setAppointments(nextAppointments)
        setErrorMessage('')
      })
      .catch(() => {
        sessionStorage.removeItem(tokenStorageKey)
        setToken('')
        setAppointments([])
        setErrorMessage('Сессия истекла. Войдите снова.')
      })
      .finally(() => {
        setIsCheckingSession(false)
      })
  }, [token])

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
  }

  if (!token) {
    return (
      <main className="admin-page">
        <form className="admin-login" onSubmit={(event) => event.preventDefault()}>
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
            <h1>Записи</h1>
          </div>
          <button type="button" onClick={handleLogout}>
            Выйти
          </button>
        </header>

        {isCheckingSession && <p className="admin-muted">Загружаем записи...</p>}
        {!isCheckingSession && appointments.length === 0 && (
          <p className="admin-muted">Записей пока нет.</p>
        )}

        {appointments.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Время</th>
                  <th>Клиент</th>
                  <th>Телефон</th>
                  <th>Мастер</th>
                  <th>Услуга</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{dateTimeFormatter.format(new Date(appointment.startsAt))}</td>
                    <td>{appointment.customerName}</td>
                    <td>{appointment.customerPhone}</td>
                    <td>{appointment.barber.name}</td>
                    <td>{appointment.service.title}</td>
                    <td>{appointment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
