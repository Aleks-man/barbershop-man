import type { BookingSelectOption } from '../components/BookingSelect'

type BarberResponse = {
  barbers: Array<{
    id: string
    name: string
  }>
}

type ServiceResponse = {
  services: Array<{
    id: string
    title: string
  }>
}

type BookingOptions = {
  barberOptions: BookingSelectOption[]
  serviceOptions: BookingSelectOption[]
}

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to load ${url}`)
  }

  return response.json() as Promise<T>
}

export const getBookingOptions = async (): Promise<BookingOptions> => {
  const [barberResponse, serviceResponse] = await Promise.all([
    fetchJson<BarberResponse>('/api/barbers'),
    fetchJson<ServiceResponse>('/api/services'),
  ])

  return {
    barberOptions: barberResponse.barbers.map((barber) => ({
      label: barber.name,
      value: barber.id,
    })),
    serviceOptions: serviceResponse.services.map((service) => ({
      label: service.title,
      value: service.id,
    })),
  }
}
