type LoginResponse = {
  token: string
}

export type AdminAppointment = {
  id: string
  customerName: string
  customerPhone: string
  startsAt: string
  endsAt: string
  status: string
  barber: {
    name: string
  }
  service: {
    title: string
  }
}

type AppointmentsResponse = {
  appointments: AdminAppointment[]
}

export const loginAdmin = async (password: string) => {
  const response = await fetch('/api/admin/login', {
    body: JSON.stringify({ password }),
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
