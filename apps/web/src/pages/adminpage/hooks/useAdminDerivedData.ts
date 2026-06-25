import { useMemo } from 'react'
import type {
  AdminAppointment,
  AdminBarber,
  AdminTimeOff,
} from '../../../api/admin'
import { tabs } from '../constants'
import {
  buildClients,
  filterClients,
  getAppointmentTab,
  matchesPeriod,
} from '../helpers'
import type { AdminTab, AppointmentPeriod } from '../types'

type UseAdminDerivedDataParams = {
  appointmentDate: string
  appointmentPeriod: AppointmentPeriod
  appointments: AdminAppointment[]
  barbers: AdminBarber[]
  clientSearch: string
  isAdminSession: boolean
  selectedBarberId: string
  selectedTab: AdminTab
  timeOffBarberId: string
  timeOffEndDate: string
  timeOffEndTime: string
  timeOffs: AdminTimeOff[]
  timeOffStartDate: string
  timeOffStartTime: string
}

export function useAdminDerivedData({
  appointmentDate,
  appointmentPeriod,
  appointments,
  barbers,
  clientSearch,
  isAdminSession,
  selectedBarberId,
  selectedTab,
  timeOffBarberId,
  timeOffEndDate,
  timeOffEndTime,
  timeOffs,
  timeOffStartDate,
  timeOffStartTime,
}: UseAdminDerivedDataParams) {
  const activeBarbers = useMemo(
    () => barbers.filter((barber) => barber.isActive !== false),
    [barbers],
  )
  const hiddenBarbers = useMemo(
    () => barbers.filter((barber) => barber.isActive === false),
    [barbers],
  )
  const selectedBarber = activeBarbers.find(
    (barber) => barber.id === selectedBarberId,
  )
  const timeOffBarber = activeBarbers.find(
    (barber) => barber.id === timeOffBarberId,
  )
  const activeBarberOptions = useMemo(
    () =>
      activeBarbers.map((barber) => ({
        label: barber.name,
        value: barber.id,
      })),
    [activeBarbers],
  )
  const filteredTimeOffs = useMemo(
    () =>
      timeOffs.filter((timeOff) =>
        isAdminSession
          ? !timeOffBarberId || timeOff.barber.id === timeOffBarberId
          : true,
      ),
    [isAdminSession, timeOffBarberId, timeOffs],
  )
  const timeOffStartsAt =
    timeOffStartDate && timeOffStartTime
      ? new Date(`${timeOffStartDate}T${timeOffStartTime}:00`)
      : null
  const timeOffEndsAt =
    timeOffEndDate && timeOffEndTime
      ? new Date(`${timeOffEndDate}T${timeOffEndTime}:00`)
      : null
  const isTimeOffRangeValid =
    Boolean(timeOffStartsAt && timeOffEndsAt) &&
    Number(timeOffStartsAt) < Number(timeOffEndsAt)
  const canViewAllBarbers = isAdminSession && !selectedBarberId
  const scopedAppointments = useMemo(
    () =>
      canViewAllBarbers
        ? appointments
        : appointments.filter(
            (appointment) => appointment.barber.id === selectedBarberId,
          ),
    [appointments, canViewAllBarbers, selectedBarberId],
  )
  const periodAppointments = useMemo(
    () =>
      scopedAppointments.filter((appointment) =>
        matchesPeriod(appointment, appointmentPeriod, appointmentDate),
      ),
    [appointmentDate, appointmentPeriod, scopedAppointments],
  )
  const filteredAppointments = useMemo(
    () =>
      periodAppointments.filter(
        (appointment) => getAppointmentTab(appointment) === selectedTab,
      ),
    [periodAppointments, selectedTab],
  )
  const tabCounts = useMemo(
    () =>
      tabs.reduce<Record<AdminTab, number>>(
        (counts, tab) => ({
          ...counts,
          [tab.value]: periodAppointments.filter(
            (appointment) => getAppointmentTab(appointment) === tab.value,
          ).length,
        }),
        {
          cancelled: 0,
          completed: 0,
          upcoming: 0,
        },
      ),
    [periodAppointments],
  )
  const clientSourceAppointments = useMemo(
    () =>
      isAdminSession
        ? appointments
        : appointments.filter(
            (appointment) => appointment.barber.id === selectedBarberId,
          ),
    [appointments, isAdminSession, selectedBarberId],
  )
  const clients = useMemo(
    () => buildClients(clientSourceAppointments),
    [clientSourceAppointments],
  )
  const filteredClients = useMemo(
    () => filterClients(clients, clientSearch),
    [clientSearch, clients],
  )

  return {
    activeBarberOptions,
    activeBarbers,
    canViewAllBarbers,
    filteredAppointments,
    filteredClients,
    filteredTimeOffs,
    hiddenBarbers,
    isTimeOffRangeValid,
    selectedBarber,
    tabCounts,
    timeOffBarber,
  }
}
