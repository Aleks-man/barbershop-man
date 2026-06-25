import { useState } from 'react'

type AdminPasswordInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

export function AdminPasswordInput({
  label,
  onChange,
  value,
}: AdminPasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <label className="admin-password-field">
      {label}
      <span>
        <input
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          aria-label={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((currentValue) => !currentValue)}
        >
          <span aria-hidden="true" />
        </button>
      </span>
    </label>
  )
}
