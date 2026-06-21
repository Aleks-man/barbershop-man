type LoginResponse = {
  barberId?: string
  name?: string
  role: AdminSessionRole
  token: string
}

export type AdminSessionRole = 'admin' | 'barber'

export type AdminAppointment = {
  id: string
  customerName: string
  customerPhone: string
  startsAt: string
  endsAt: string
  status: string
  barber: {
    id: string
    name: string
  }
  service: {
    id: string
    title: string
  }
}

export type AdminAppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export type AdminBarber = {
  description?: string | null
  experience?: string | null
  id: string
  isActive?: boolean
  name: string
  password?: string
  photoUrl?: string | null
  role: string | null
}

export type AdminTimeOff = {
  id: string
  reason: string
  startsAt: string
  endsAt: string
  barber: {
    id: string
    name: string
  }
}

type AppointmentsResponse = {
  appointments: AdminAppointment[]
}

type BarbersResponse = {
  barbers: AdminBarber[]
}

type TimeOffResponse = {
  timeOffs: AdminTimeOff[]
}

export const loginAdmin = async ({
  barberId,
  password,
  role,
}: {
  barberId?: string
  password: string
  role: AdminSessionRole
}) => {
  const response = await fetch('/api/admin/login', {
    body: JSON.stringify({ barberId, password, role }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Invalid password')
  }

  return (await response.json()) as LoginResponse
}

export const createAdminBarber = async ({
  name,
  password,
  description,
  experience,
  photoUrl,
  role,
  token,
}: {
  description: string
  experience: string
  name: string
  password: string
  photoUrl: string
  role: string
  token: string
}) => {
  const response = await fetch('/api/admin/barbers', {
    body: JSON.stringify({ description, experience, name, password, photoUrl, role }),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Failed to create barber')
  }

  return response.json() as Promise<{ barber: AdminBarber }>
}

export const uploadAdminBarberPhoto = async ({
  dataUrl,
  token,
}: {
  dataUrl: string
  token: string
}) => {
  const response = await fetch('/api/admin/barbers/photo', {
    body: JSON.stringify({ dataUrl }),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Failed to upload barber photo')
  }

  return response.json() as Promise<{ photoUrl: string }>
}

export const hideAdminBarber = async ({
  barberId,
  token,
}: {
  barberId: string
  token: string
}) => {
  const response = await fetch(`/api/admin/barbers/${barberId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to hide barber')
  }
}

export const deleteAdminBarber = async ({
  barberId,
  token,
}: {
  barberId: string
  token: string
}) => {
  const response = await fetch(`/api/admin/barbers/${barberId}/permanent`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete barber')
  }
}

export const restoreAdminBarber = async ({
  barberId,
  token,
}: {
  barberId: string
  token: string
}) => {
  const response = await fetch(`/api/admin/barbers/${barberId}/restore`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: 'PATCH',
  })

  if (!response.ok) {
    throw new Error('Failed to restore barber')
  }

  return response.json() as Promise<{ barber: AdminBarber }>
}

export const getAdminAppointments = async (token: string) => {
  const response = await fetch('/api/admin/appointments', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to load appointments')
  }

  const data = (await response.json()) as AppointmentsResponse

  return data.appointments
}

export const getAdminBarbers = async (token: string) => {
  const response = await fetch('/api/admin/barbers', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to load barbers')
  }

  const data = (await response.json()) as BarbersResponse

  return data.barbers
}

export const getAdminTimeOff = async (token: string) => {
  const response = await fetch('/api/admin/time-off', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to load time off')
  }

  const data = (await response.json()) as TimeOffResponse

  return data.timeOffs
}

export const createAdminTimeOff = async ({
  barberId,
  endTime,
  endDate,
  reason,
  startDate,
  startTime,
  token,
}: {
  barberId: string
  endDate: string
  endTime: string
  reason: string
  startDate: string
  startTime: string
  token: string
}) => {
  const response = await fetch('/api/admin/time-off', {
    body: JSON.stringify({ barberId, endDate, endTime, reason, startDate, startTime }),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Failed to create time off')
  }

  return response.json() as Promise<{ timeOff: AdminTimeOff }>
}

export const deleteAdminTimeOff = async ({
  timeOffId,
  token,
}: {
  timeOffId: string
  token: string
}) => {
  const response = await fetch(`/api/admin/time-off/${timeOffId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete time off')
  }
}

export const updateAdminAppointmentStatus = async ({
  appointmentId,
  status,
  token,
}: {
  appointmentId: string
  status: AdminAppointmentStatus
  token: string
}) => {
  const response = await fetch(`/api/admin/appointments/${appointmentId}/status`, {
    body: JSON.stringify({ status }),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    method: 'PATCH',
  })

  if (!response.ok) {
    throw new Error('Failed to update appointment status')
  }
}

export const rescheduleAdminAppointment = async ({
  appointmentId,
  date,
  time,
  token,
}: {
  appointmentId: string
  date: string
  time: string
  token: string
}) => {
  const response = await fetch(`/api/admin/appointments/${appointmentId}/reschedule`, {
    body: JSON.stringify({ date, time }),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    method: 'PATCH',
  })

  if (!response.ok) {
    throw new Error('Failed to reschedule appointment')
  }

  return response.json() as Promise<{
    appointment: {
      endsAt: string
      id: string
      startsAt: string
    }
  }>
}
