import type { FormEvent } from 'react'
import { AdminPasswordInput } from './AdminPasswordInput'

type AdminPasswordChangeViewProps = {
  errorMessage: string
  isLoading: boolean
  newPassword: string
  repeatedPassword: string
  onErrorReset: () => void
  onNewPasswordChange: (value: string) => void
  onPasswordSave: () => void
  onRepeatedPasswordChange: (value: string) => void
}

export function AdminPasswordChangeView({
  errorMessage,
  isLoading,
  newPassword,
  onErrorReset,
  onNewPasswordChange,
  onPasswordSave,
  onRepeatedPasswordChange,
  repeatedPassword,
}: AdminPasswordChangeViewProps) {
  const isReady =
    newPassword.trim().length >= 6 &&
    repeatedPassword.trim().length >= 6 &&
    newPassword === repeatedPassword

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onPasswordSave()
  }

  return (
    <form className="admin-login" onSubmit={handleSubmit}>
      <span className="admin-eyebrow">Gentleman's Room</span>
      <h1>Смените временный пароль</h1>
      <AdminPasswordInput
        label="Новый пароль"
        value={newPassword}
        onChange={(value) => {
          onNewPasswordChange(value)
          onErrorReset()
        }}
      />
      <AdminPasswordInput
        label="Повторите пароль"
        value={repeatedPassword}
        onChange={(value) => {
          onRepeatedPasswordChange(value)
          onErrorReset()
        }}
      />
      <button
        type="submit"
        className="admin-login-submit"
        disabled={isLoading || !isReady}
      >
        Сохранить
      </button>
      {newPassword &&
        repeatedPassword &&
        newPassword !== repeatedPassword &&
        !errorMessage && <p role="status">Пароли не совпадают.</p>}
      {errorMessage && <p role="status">{errorMessage}</p>}
    </form>
  )
}
