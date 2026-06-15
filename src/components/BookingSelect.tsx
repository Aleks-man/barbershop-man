import { useId, useState } from 'react'

type BookingSelectProps = {
  label: string
  name: string
  options: string[]
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export function BookingSelect({
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

  const closeMenu = () => {
    if (!isOpen) {
      return
    }

    setIsClosing(true)
    window.setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 160)
  }

  const toggleMenu = () => {
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
          aria-expanded={isOpen && !isClosing}
          aria-haspopup="listbox"
          onClick={toggleMenu}
        >
          <span className={value ? undefined : 'booking-select-placeholder'}>
            {value || placeholder}
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
                aria-selected={option === value}
                key={option}
                role="option"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option)
                  closeMenu()
                }}
              >
                {option}
              </button>
            ))}
          </span>
        )}
      </span>
    </label>
  )
}
