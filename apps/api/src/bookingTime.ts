export const businessHoursByDay = {
  0: { start: '12:00', end: '20:00' },
  1: { start: '10:00', end: '22:00' },
  2: { start: '10:00', end: '22:00' },
  3: { start: '10:00', end: '22:00' },
  4: { start: '10:00', end: '22:00' },
  5: { start: '10:00', end: '22:00' },
  6: { start: '11:00', end: '21:00' },
} as const

export const slotStepMin = 30

export const parseDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return null
  }

  const [, year, month, day] = match

  return new Date(Number(year), Number(month) - 1, Number(day))
}

export const setTime = (date: Date, time: string) => {
  const match = /^(\d{2}):(\d{2})$/.exec(time)

  if (!match) {
    return null
  }

  const [, hours, minutes] = match
  const nextDate = new Date(date)
  nextDate.setHours(Number(hours), Number(minutes), 0, 0)

  return nextDate
}

export const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60 * 1000)

export const formatTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

export const hasOverlap = (
  slotStart: Date,
  slotEnd: Date,
  appointments: Array<{ startsAt: Date; endsAt: Date }>,
) =>
  appointments.some(
    (appointment) => slotStart < appointment.endsAt && slotEnd > appointment.startsAt,
  )
