import masterAlex from '../assets/masters/master-alex.webp'
import masterAnton from '../assets/masters/master-anton.webp'
import masterDenis from '../assets/masters/master-denis.webp'
import masterMax from '../assets/masters/master-max.webp'
import type { PublicBarber } from '../api/barbers'
import { mediaUrl } from '../api/client'
import { barbers } from './site'

const fallbackPhotoByName = new Map([
  ['алекс', masterAlex],
  ['anton', masterAnton],
  ['антон', masterAnton],
  ['denis', masterDenis],
  ['денис', masterDenis],
  ['max', masterMax],
  ['макс', masterMax],
])

export const fallbackPublicBarbers = barbers.map((barber) => ({
  description: barber.note,
  experience: barber.experience,
  id: barber.name,
  name: barber.name,
  photoUrl: fallbackPhotoByName.get(barber.name.trim().toLowerCase()) ?? masterAnton,
  role: barber.role,
}))

const fallbackBarberByName = new Map(
  fallbackPublicBarbers.map((barber) => [barber.name.trim().toLowerCase(), barber]),
)

export const mergePublicBarberPresentation = (barbers: PublicBarber[]) =>
  barbers.map((barber) => {
    const fallbackBarber = fallbackBarberByName.get(barber.name.trim().toLowerCase())

    return {
      ...barber,
      description: barber.description || fallbackBarber?.description || null,
      experience: barber.experience || fallbackBarber?.experience || null,
      photoUrl: barber.photoUrl || fallbackBarber?.photoUrl || null,
      role: barber.role || fallbackBarber?.role || null,
    }
  })

export const getBarberPhoto = ({
  name,
  photoUrl,
}: {
  name: string
  photoUrl?: string | null
}) => mediaUrl(photoUrl) || fallbackPhotoByName.get(name.trim().toLowerCase()) || masterAnton
