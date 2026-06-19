import { useId, useState } from 'react'

export type BookingSelectOption = {
  label: string
  value: string
}

type BookingSelectProps = {
  disabled?: boolean
  label: string
  name: string
  options: BookingSelectOption[]
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export function BookingSelect({
  disabled = false,
  label,
  name,
  options,
  placeholder,
  value,
  onChange,
}: BookingSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const listId = useId()
  const selectedOption = options.find((option) => option.value === value)

  const closeMenu = () => {
    if (!isOpen || disabled) {
      return
    }

    setIsClosing(true)
    window.setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 160)
  }

  const toggleMenu = () => {
    if (disabled) {
      return
    }

    if (isOpen) {
      closeMenu()
      return
    }

    setIsOpen(true)
  }

  return (
    <label className="booking-select-label">
      {label}
      <input type="hidden" name={name} value={value} />
      <span className="booking-select" onBlur={closeMenu}>
        <button
          type="button"
          className="booking-select-trigger"
          aria-controls={listId}
          aria-disabled={disabled}
          aria-expanded={!disabled && isOpen && !isClosing}
          aria-haspopup="listbox"
          disabled={disabled}
          onClick={toggleMenu}
        >
          <span className={value ? undefined : 'booking-select-placeholder'}>
            {selectedOption?.label || placeholder}
          </span>
        </button>
        {isOpen && (
          <span
            className={`booking-select-menu${isClosing ? ' is-closing' : ''}`}
            id={listId}
            role="listbox"
          >
            {options.map((option) => (
              <button
                type="button"
                className="booking-select-option"
                aria-selected={option.value === value}
                key={option.value}
                role="option"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option.value)
                  closeMenu()
                }}
              >
                {option.label}
              </button>
            ))}
          </span>
        )}
      </span>
    </label>
  )
}
