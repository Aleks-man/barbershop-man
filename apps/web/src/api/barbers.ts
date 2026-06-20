export type PublicBarber = {
  description: string | null
  experience: string | null
  id: string
  name: string
  photoUrl: string | null
  role: string | null
}

type BarberResponse = {
  barbers: PublicBarber[]
}

export const getPublicBarbers = async () => {
  const response = await fetch('/api/barbers')

  if (!response.ok) {
    throw new Error('Failed to load barbers')
  }

  const data = (await response.json()) as BarberResponse

  return data.barbers
}
