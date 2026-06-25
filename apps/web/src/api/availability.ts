import type { BookingSelectOption } from '../components/BookingSelect'
import { apiFetch } from './client'

type AvailabilityResponse = {
  slots: string[]
}

type AvailabilityMonthResponse = {
  unavailableDates: string[]
}

export const getAvailability = async ({
  barberId,
  date,
  serviceId,
}: {
  barberId: string
  date: string
  serviceId: string
}): Promise<BookingSelectOption[]> => {
  const searchParams = new URLSearchParams({
    barberId,
    date,
    serviceId,
  })
  const response = await apiFetch(`/api/availability?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to load availability')
  }

  const data = (await response.json()) as AvailabilityResponse

  return data.slots.map((slot) => ({
    label: slot,
    value: slot,
  }))
}

export const getAvailabilityMonth = async ({
  barberId,
  month,
  serviceId,
  year,
}: {
  barberId: string
  month: number
  serviceId: string
  year: number
}) => {
  const searchParams = new URLSearchParams({
    barberId,
    month: String(month),
    serviceId,
    year: String(year),
  })
  const response = await apiFetch(`/api/availability/month?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to load month availability')
  }

  const data = (await response.json()) as AvailabilityMonthResponse

  return data.unavailableDates
}
