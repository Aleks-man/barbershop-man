import { useEffect, useId, useMemo, useState } from 'react'
import {
  announceOverlayOpen,
  getOverlaySourceId,
  overlayOpenEvent,
} from '../utils/overlayEvents'

type BookingDatePickerProps = {
  allowPastDates?: boolean
  disabled?: boolean
  highlightedDates?: Set<string>
  label: string
  placeholder: string
  unavailableDates?: string[]
  value: string
  onChange: (value: string) => void
  onVisibleMonthChange?: (month: { month: number; year: number }) => void
}

const dayFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  weekday: 'short',
})

const monthFormatter = new Intl.DateTimeFormat('ru-RU', {
  month: 'long',
  year: 'numeric',
})

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const getDateValue = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const getStartOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

const getMonthGrid = (monthDate: Date) => {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const firstWeekDay = (firstDay.getDay() + 6) % 7
  const gridStart = new Date(firstDay)
  gridStart.setDate(firstDay.getDate() - firstWeekDay)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)

    return date
  })
}

const formatDisplayDate = (value: string) => {
  if (!value) {
    return ''
  }

  const [year, month, day] = value.split('-').map(Number)

  return dayFormatter.format(new Date(year, month - 1, day))
}

export function BookingDatePicker({
  allowPastDates = false,
  disabled = false,
  highlightedDates,
  label,
  placeholder,
  unavailableDates = [],
  value,
  onChange,
  onVisibleMonthChange,
}: BookingDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() => getStartOfDay(new Date()))
  const menuId = useId()
  const overlayId = useId()
  const today = useMemo(() => getStartOfDay(new Date()), [])
  const dates = getMonthGrid(visibleMonth)
  const selectedText = formatDisplayDate(value)
  const unavailableDateSet = useMemo(() => new Set(unavailableDates), [unavailableDates])

  useEffect(() => {
    onVisibleMonthChange?.({
      month: visibleMonth.getMonth() + 1,
      year: visibleMonth.getFullYear(),
    })
  }, [onVisibleMonthChange, visibleMonth])

  useEffect(() => {
    const handleOverlayOpen = (event: Event) => {
      if (getOverlaySourceId(event) !== overlayId) {
        setIsOpen(false)
      }
    }

    window.addEventListener(overlayOpenEvent, handleOverlayOpen)

    return () => window.removeEventListener(overlayOpenEvent, handleOverlayOpen)
  }, [overlayId])

  const closeCalendar = () => {
    if (disabled) {
      return
    }

    setIsOpen(false)
  }

  const showPreviousMonth = () => {
    setVisibleMonth(
      (currentMonth) =>
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    )
  }

  const showNextMonth = () => {
    setVisibleMonth(
      (currentMonth) =>
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    )
  }

  return (
    <div className="booking-date-label">
      <span>{label}</span>
      <span
        className="booking-date"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            closeCalendar()
          }
        }}
      >
        <button
          type="button"
          className="booking-date-trigger"
          aria-controls={menuId}
          aria-disabled={disabled}
          aria-expanded={!disabled && isOpen}
          aria-haspopup="dialog"
          disabled={disabled}
          onClick={() => {
            if (disabled) {
              return
            }

            setIsOpen((currentValue) => {
              if (currentValue) {
                return false
              }

              announceOverlayOpen(overlayId)
              return true
            })
          }}
        >
          <span className={selectedText ? undefined : 'booking-select-placeholder'}>
            {selectedText || placeholder}
          </span>
        </button>
        {isOpen && (
          <span className="booking-calendar" id={menuId} role="dialog">
            <span className="booking-calendar-header">
              <button type="button" aria-label="Предыдущий месяц" onClick={showPreviousMonth}>
                {'<'}
              </button>
              <strong>{monthFormatter.format(visibleMonth)}</strong>
              <button type="button" aria-label="Следующий месяц" onClick={showNextMonth}>
                {'>'}
              </button>
            </span>
            <span className="booking-calendar-weekdays" aria-hidden="true">
              {weekDays.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </span>
            <span className="booking-calendar-grid">
              {dates.map((date) => {
                const dateValue = getDateValue(date)
                const isPastDate = !allowPastDates && date < today
                const isHighlightedDate = highlightedDates?.has(dateValue) ?? false
                const isUnavailableDate = unavailableDateSet.has(dateValue)
                const isOutsideMonth = date.getMonth() !== visibleMonth.getMonth()

                return (
                  <button
                    type="button"
                    className="booking-calendar-day"
                    disabled={isPastDate}
                    aria-disabled={isUnavailableDate}
                    aria-pressed={dateValue === value}
                    data-highlighted={isHighlightedDate}
                    data-outside-month={isOutsideMonth}
                    data-unavailable={isUnavailableDate}
                    key={dateValue}
                    onClick={() => {
                      if (isUnavailableDate) {
                        return
                      }

                      onChange(dateValue)
                      closeCalendar()
                    }}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </span>
          </span>
          )}
      </span>
    </div>
  )
}
