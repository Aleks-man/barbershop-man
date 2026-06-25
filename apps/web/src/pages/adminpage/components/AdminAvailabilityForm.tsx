import { BookingDatePicker } from '../../../components/BookingDatePicker'
import { BookingSelect, type BookingSelectOption } from '../../../components/BookingSelect'
import type { AdminBarber } from '../../../api/admin'

type AdminAvailabilityFormProps = {
  activeBarberOptions: BookingSelectOption[]
  isAdminSession: boolean
  isLoading: boolean
  isTimeOffRangeValid: boolean
  sessionName?: string
  timeOffBarber?: AdminBarber
  timeOffBarberId: string
  timeOffEndDate: string
  timeOffEndTime: string
  timeOffReason: string
  timeOffStartDate: string
  timeOffStartTime: string
  timeOptions: BookingSelectOption[]
  onCreateTimeOff: () => void
  onErrorReset: () => void
  onTimeOffBarberChange: (barberId: string) => void
  onTimeOffEndDateChange: (date: string) => void
  onTimeOffEndTimeChange: (time: string) => void
  onTimeOffReasonChange: (reason: string) => void
  onTimeOffStartDateChange: (date: string) => void
  onTimeOffStartTimeChange: (time: string) => void
}

export function AdminAvailabilityForm({
  activeBarberOptions,
  isAdminSession,
  isLoading,
  isTimeOffRangeValid,
  onCreateTimeOff,
  onErrorReset,
  onTimeOffBarberChange,
  onTimeOffEndDateChange,
  onTimeOffEndTimeChange,
  onTimeOffReasonChange,
  onTimeOffStartDateChange,
  onTimeOffStartTimeChange,
  sessionName,
  timeOffBarber,
  timeOffBarberId,
  timeOffEndDate,
  timeOffEndTime,
  timeOffReason,
  timeOffStartDate,
  timeOffStartTime,
  timeOptions,
}: AdminAvailabilityFormProps) {
  return (
    <section className="admin-manager admin-availability-panel">
      <header>
        <div>
          <span className="admin-eyebrow">График</span>
          <h2>График доступности</h2>
        </div>
      </header>
      <div className="admin-availability-form">
        {isAdminSession ? (
          <BookingSelect
            label="Мастер"
            name="timeOffBarber"
            options={activeBarberOptions}
            placeholder="Выберите мастера"
            value={timeOffBarberId}
            onChange={(nextBarberId) => {
              onTimeOffBarberChange(nextBarberId)
              onErrorReset()
            }}
          />
        ) : (
          <label>
            Мастер
            <input
              type="text"
              value={timeOffBarber?.name ?? sessionName ?? ''}
              readOnly
            />
          </label>
        )}
        <fieldset className="admin-availability-period">
          <legend>Начало периода</legend>
          <BookingDatePicker
            label="Дата"
            placeholder="Выберите дату"
            value={timeOffStartDate}
            onChange={(nextDate) => {
              onTimeOffStartDateChange(nextDate)
              onErrorReset()
            }}
          />
          <BookingSelect
            label="Время"
            name="timeOffStart"
            options={timeOptions}
            placeholder="Начало"
            value={timeOffStartTime}
            onChange={(nextTime) => {
              onTimeOffStartTimeChange(nextTime)
              onErrorReset()
            }}
          />
        </fieldset>
        <fieldset className="admin-availability-period">
          <legend>Конец периода</legend>
          <BookingDatePicker
            label="Дата"
            placeholder="Выберите дату"
            value={timeOffEndDate}
            onChange={(nextDate) => {
              onTimeOffEndDateChange(nextDate)
              onErrorReset()
            }}
          />
          <BookingSelect
            label="Время"
            name="timeOffEnd"
            options={timeOptions}
            placeholder="Конец"
            value={timeOffEndTime}
            onChange={(nextTime) => {
              onTimeOffEndTimeChange(nextTime)
              onErrorReset()
            }}
          />
        </fieldset>
        <label className="admin-availability-reason">
          Причина
          <input
            type="text"
            placeholder="Например: отпуск"
            value={timeOffReason}
            onChange={(event) => {
              onTimeOffReasonChange(event.target.value)
              onErrorReset()
            }}
          />
        </label>
        <button
          type="button"
          disabled={
            isLoading ||
            !timeOffBarberId ||
            !isTimeOffRangeValid ||
            !timeOffReason.trim()
          }
          onClick={onCreateTimeOff}
        >
          Закрыть период
        </button>
      </div>
    </section>
  )
}
