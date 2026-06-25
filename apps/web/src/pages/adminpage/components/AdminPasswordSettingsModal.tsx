import { useEffect, type FormEvent } from 'react'
import { AdminPasswordInput } from './AdminPasswordInput'

type AdminPasswordSettingsModalProps = {
  currentPassword: string
  errorMessage: string
  isLoading: boolean
  newPassword: string
  repeatedPassword: string
  onClose: () => void
  onCurrentPasswordChange: (value: string) => void
  onErrorReset: () => void
  onNewPasswordChange: (value: string) => void
  onPasswordSave: () => void
  onRepeatedPasswordChange: (value: string) => void
}

export function AdminPasswordSettingsModal({
  currentPassword,
  errorMessage,
  isLoading,
  newPassword,
  onClose,
  onCurrentPasswordChange,
  onErrorReset,
  onNewPasswordChange,
  onPasswordSave,
  onRepeatedPasswordChange,
  repeatedPassword,
}: AdminPasswordSettingsModalProps) {
  const isReady =
    currentPassword.trim().length > 0 &&
    newPassword.trim().length >= 6 &&
    repeatedPassword.trim().length >= 6 &&
    newPassword === repeatedPassword

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onPasswordSave()
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      className="admin-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <form className="admin-modal admin-password-modal" onSubmit={handleSubmit}>
        <header>
          <div>
            <span className="admin-eyebrow">Безопасность</span>
            <h2>Сменить пароль</h2>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            aria-label="Закрыть окно"
            onClick={onClose}
          >
            <span aria-hidden="true" />
          </button>
        </header>
        <AdminPasswordInput
          label="Текущий пароль"
          value={currentPassword}
          onChange={(value) => {
            onCurrentPasswordChange(value)
            onErrorReset()
          }}
        />
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
        {newPassword &&
          repeatedPassword &&
          newPassword !== repeatedPassword &&
          !errorMessage && <p role="status">Пароли не совпадают.</p>}
        {errorMessage && <p className="admin-alert" role="status">{errorMessage}</p>}
        <button type="submit" disabled={isLoading || !isReady}>
          Сохранить
        </button>
      </form>
    </div>
  )
}
