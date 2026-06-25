import type { FormEvent } from 'react'
import type { AdminSessionRole } from '../../../api/admin'
import { BookingSelect, type BookingSelectOption } from '../../../components/BookingSelect'
import { AdminPasswordInput } from './AdminPasswordInput'

type AdminLoginViewProps = {
  errorMessage: string
  isLoading: boolean
  isLoadingLoginBarbers: boolean
  loginBarberId: string
  loginBarberOptions: BookingSelectOption[]
  loginBarbersMessage: string
  loginRole: AdminSessionRole
  password: string
  onErrorReset: () => void
  onLogin: () => void
  onLoginBarberChange: (barberId: string) => void
  onLoginRoleChange: (role: AdminSessionRole) => void
  onLoadLoginBarbers: () => void
  onPasswordChange: (password: string) => void
}

export function AdminLoginView({
  errorMessage,
  isLoading,
  isLoadingLoginBarbers,
  loginBarberId,
  loginBarberOptions,
  loginBarbersMessage,
  loginRole,
  onErrorReset,
  onLoadLoginBarbers,
  onLogin,
  onLoginBarberChange,
  onLoginRoleChange,
  onPasswordChange,
  password,
}: AdminLoginViewProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onLogin()
  }

  return (
    <form className="admin-login" onSubmit={handleSubmit}>
      <span className="admin-eyebrow">Gentleman's Room</span>
      <h1>Вход в админку</h1>
      <div
        className="admin-login-roles"
        role="tablist"
        aria-label="Роль входа"
      >
        <button
          type="button"
          aria-selected={loginRole === 'admin'}
          onClick={() => {
            onLoginRoleChange('admin')
            onErrorReset()
          }}
        >
          Админ
        </button>
        <button
          type="button"
          aria-selected={loginRole === 'barber'}
          onClick={() => {
            onLoginRoleChange('barber')
            onErrorReset()
            onLoadLoginBarbers()
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
              isLoadingLoginBarbers
                ? 'Загружаем мастеров'
                : 'Выберите мастера'
            }
            value={loginBarberId}
            onChange={(nextBarberId) => {
              onLoginBarberChange(nextBarberId)
              onErrorReset()
            }}
          />
          {loginBarbersMessage && (
            <p className="admin-login-note">{loginBarbersMessage}</p>
          )}
        </>
      )}
      <AdminPasswordInput
        label="Пароль"
        value={password}
        onChange={(value) => {
          onPasswordChange(value)
          onErrorReset()
        }}
      />
      <button
        type="submit"
        className="admin-login-submit"
        disabled={
          isLoading ||
          !password.trim() ||
          (loginRole === 'barber' && !loginBarberId)
        }
      >
        Войти
      </button>
      {errorMessage && <p role="status">{errorMessage}</p>}
    </form>
  )
}
