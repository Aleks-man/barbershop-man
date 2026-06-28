import { apiFetch } from './client'

type CreateAppointmentInput = {
  barberId: string
  customerName: string
  customerPhone: string
  date: string
  privacyAccepted: boolean
  serviceId: string
  time: string
}

export const createAppointment = async (input: CreateAppointmentInput) => {
  const response = await apiFetch('/api/appointments', {
    body: JSON.stringify(input),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Failed to create appointment')
  }

  return response.json()
}
