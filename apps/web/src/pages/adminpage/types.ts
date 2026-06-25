import type {
  AdminAppointment,
  AdminSessionRole,
} from '../../api/admin'
import type { ReactNode } from 'react'
import type { DatePeriod } from '../../utils/dateTime'

export type AdminSession = {
  barberId?: string
  isProtected?: boolean
  mustChangePassword?: boolean
  name?: string
  role: AdminSessionRole
  token: string
}

export type AdminTab = 'upcoming' | 'completed' | 'cancelled'
export type AppointmentPeriod = DatePeriod
export type AdminView = 'schedule' | 'clients' | 'barbers' | 'availability'

export type AdminClient = {
  barberNames: Set<string>
  lastVisit: string
  name: string
  phone: string
  visits: number
}

export type AppointmentActionRenderer = (
  appointment: AdminAppointment,
) => ReactNode
