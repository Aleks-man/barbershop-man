import type { BookingSelectOption } from '../../components/BookingSelect'
import { createTimeOptions } from '../../utils/dateTime'
import type { AdminTab, AdminView, AppointmentPeriod } from './types'

export const tokenStorageKey = 'barbershop-admin-token'
export const sessionStorageKey = 'barbershop-admin-session'
export const defaultBarberPassword = '111111'

export const tabs: Array<{ label: string; value: AdminTab }> = [
  { label: 'Ожидают', value: 'upcoming' },
  { label: 'Выполнено', value: 'completed' },
  { label: 'Отменены', value: 'cancelled' },
]

export const periods: Array<{ label: string; value: AppointmentPeriod }> = [
  { label: 'Все', value: 'all' },
  { label: 'Сегодня', value: 'today' },
  { label: 'Завтра', value: 'tomorrow' },
]

export const adminViews: Array<{ label: string; value: AdminView }> = [
  { label: 'Расписание', value: 'schedule' },
  { label: 'Клиенты', value: 'clients' },
  { label: 'Доступность', value: 'availability' },
  { label: 'Мастера', value: 'barbers' },
]

export const timeOptions: BookingSelectOption[] = createTimeOptions({
  endHour: 22,
  startHour: 10,
})
