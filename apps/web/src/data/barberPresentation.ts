import masterAlex from '../assets/masters/master-alex.webp'
import masterAnton from '../assets/masters/master-anton.webp'
import masterDenis from '../assets/masters/master-denis.webp'
import masterMax from '../assets/masters/master-max.webp'
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

export const getBarberPhoto = ({
  name,
  photoUrl,
}: {
  name: string
  photoUrl?: string | null
}) => photoUrl || fallbackPhotoByName.get(name.trim().toLowerCase()) || masterAnton
