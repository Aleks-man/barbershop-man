import type { AdminAppointment } from '../../../api/admin'
import { BookingDatePicker } from '../../../components/BookingDatePicker'
import { BookingSelect, type BookingSelectOption } from '../../../components/BookingSelect'

type AdminRescheduleModalProps = {
  appointment: AdminAppointment
  isUpdating: boolean
  rescheduleDate: string
  rescheduleTime: string
  rescheduleTimeOptions: BookingSelectOption[]
  onClose: () => void
  onReschedule: () => void
  onRescheduleDateChange: (date: string) => void
  onRescheduleTimeChange: (time: string) => void
}

export function AdminRescheduleModal({
  appointment,
  isUpdating,
  onClose,
  onReschedule,
  onRescheduleDateChange,
  onRescheduleTimeChange,
  rescheduleDate,
  rescheduleTime,
  rescheduleTimeOptions,
}: AdminRescheduleModalProps) {
  return (
    <div className="admin-modal-backdrop">
      <section className="admin-modal" aria-modal="true" role="dialog">
        <header>
          <div>
            <span className="admin-eyebrow">Перенос записи</span>
            <h2>{appointment.customerName}</h2>
          </div>
          <button type="button" onClick={onClose}>
            Закрыть
          </button>
        </header>
        <BookingDatePicker
          label="Новая дата"
          placeholder="Выберите дату"
          value={rescheduleDate}
          onChange={onRescheduleDateChange}
        />
        <BookingSelect
          disabled={!rescheduleDate || rescheduleTimeOptions.length === 0}
          label="Новое время"
          name="rescheduleTime"
          options={rescheduleTimeOptions}
          placeholder={
            rescheduleDate ? 'Выберите время' : 'Сначала выберите дату'
          }
          value={rescheduleTime}
          onChange={onRescheduleTimeChange}
        />
        <button
          type="button"
          disabled={isUpdating || !rescheduleDate || !rescheduleTime}
          onClick={onReschedule}
        >
          Сохранить перенос
        </button>
      </section>
    </div>
  )
}
