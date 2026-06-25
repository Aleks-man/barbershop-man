import type { AdminAppointment } from '../../api/admin'
import { matchesDatePeriod } from '../../utils/dateTime'
import type { AdminClient, AdminTab, AppointmentPeriod } from './types'

export const getAppointmentTab = (appointment: AdminAppointment): AdminTab => {
  if (appointment.status === 'CANCELLED') {
    return 'cancelled'
  }

  return new Date(appointment.endsAt) < new Date() ? 'completed' : 'upcoming'
}

const statusLabels: Record<string, string> = {
  CANCELLED: 'Отменена',
  COMPLETED: 'Ожидает',
  CONFIRMED: 'Активна',
  PENDING: 'Ожидает',
}

export const getStatusLabel = (appointment: AdminAppointment) =>
  getAppointmentTab(appointment) === 'completed'
    ? 'Выполнена'
    : (statusLabels[appointment.status] ?? appointment.status)

export const getStatusTone = (appointment: AdminAppointment) => {
  const tab = getAppointmentTab(appointment)

  if (tab === 'completed') {
    return 'completed'
  }

  if (tab === 'cancelled') {
    return 'cancelled'
  }

  return 'upcoming'
}

export const matchesPeriod = (
  appointment: AdminAppointment,
  period: AppointmentPeriod,
  customDate: string,
) => matchesDatePeriod(appointment.startsAt, period, customDate)

export const getPhoneHref = (phone: string) =>
  `tel:${phone.replace(/[^\d+]/g, '')}`

export const buildClients = (
  appointments: AdminAppointment[],
): AdminClient[] => {
  const clientsByPhone = new Map<string, AdminClient>()

  appointments.forEach((appointment) => {
    const existingClient = clientsByPhone.get(appointment.customerPhone)
    const nextVisitTime = new Date(appointment.startsAt).getTime()

    if (!existingClient) {
      clientsByPhone.set(appointment.customerPhone, {
        barberNames: new Set([appointment.barber.name]),
        lastVisit: appointment.startsAt,
        name: appointment.customerName,
        phone: appointment.customerPhone,
        visits: 1,
      })
      return
    }

    clientsByPhone.set(appointment.customerPhone, {
      barberNames: new Set([
        ...existingClient.barberNames,
        appointment.barber.name,
      ]),
      lastVisit:
        nextVisitTime > new Date(existingClient.lastVisit).getTime()
          ? appointment.startsAt
          : existingClient.lastVisit,
      name: existingClient.name || appointment.customerName,
      phone: appointment.customerPhone,
      visits: existingClient.visits + 1,
    })
  })

  return Array.from(clientsByPhone.values()).sort(
    (firstClient, secondClient) =>
      firstClient.name.localeCompare(secondClient.name, 'ru'),
  )
}

export const filterClients = (
  clients: AdminClient[],
  clientSearch: string,
) => {
  const searchValue = clientSearch.trim().toLowerCase()

  if (!searchValue) {
    return clients
  }

  const searchDigits = searchValue.replace(/\D/g, '')

  return clients.filter((client) => {
    const clientDigits = client.phone.replace(/\D/g, '')

    return (
      client.name.toLowerCase().includes(searchValue) ||
      client.phone.toLowerCase().includes(searchValue) ||
      (Boolean(searchDigits) && clientDigits.includes(searchDigits))
    )
  })
}
