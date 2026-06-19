import type { BookingSelectOption } from '../components/BookingSelect'

type AvailabilityResponse = {
  slots: string[]
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
  const response = await fetch(`/api/availability?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to load availability')
  }

  const data = (await response.json()) as AvailabilityResponse

  return data.slots.map((slot) => ({
    label: slot,
    value: slot,
  }))
}
