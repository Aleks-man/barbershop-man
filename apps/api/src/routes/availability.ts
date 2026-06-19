import { AppointmentStatus } from '@prisma/client'
import { Router } from 'express'
import { prisma } from '../prisma.js'

export const availabilityRouter = Router()

const businessHoursByDay = {
  0: { start: '12:00', end: '20:00' },
  1: { start: '10:00', end: '22:00' },
  2: { start: '10:00', end: '22:00' },
  3: { start: '10:00', end: '22:00' },
  4: { start: '10:00', end: '22:00' },
  5: { start: '10:00', end: '22:00' },
  6: { start: '11:00', end: '21:00' },
} as const

const slotStepMin = 30

const parseDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return null
  }

  const [, year, month, day] = match

  return new Date(Number(year), Number(month) - 1, Number(day))
}

const setTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  const nextDate = new Date(date)
  nextDate.setHours(hours, minutes, 0, 0)

  return nextDate
}

const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60 * 1000)

const formatTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

const hasOverlap = (
  slotStart: Date,
  slotEnd: Date,
  appointments: Array<{ startsAt: Date; endsAt: Date }>,
) =>
  appointments.some(
    (appointment) => slotStart < appointment.endsAt && slotEnd > appointment.startsAt,
  )

availabilityRouter.get('/', async (request, response, next) => {
  try {
    const serviceId = String(request.query.serviceId ?? '')
    const barberId = String(request.query.barberId ?? '')
    const date = String(request.query.date ?? '')
    const selectedDate = parseDate(date)

    if (!serviceId || !barberId || !selectedDate) {
      response.status(400).json({
        error: 'serviceId, barberId and date are required',
      })
      return
    }

    const [service, barber] = await Promise.all([
      prisma.service.findFirst({
        where: {
          id: serviceId,
          isActive: true,
        },
      }),
      prisma.barber.findFirst({
        where: {
          id: barberId,
          isActive: true,
        },
      }),
    ])

    if (!service || !barber) {
      response.status(404).json({
        error: 'Service or barber not found',
      })
      return
    }

    const businessHours =
      businessHoursByDay[selectedDate.getDay() as keyof typeof businessHoursByDay]
    const dayStart = setTime(selectedDate, businessHours.start)
    const dayEnd = setTime(selectedDate, businessHours.end)
    const appointments = await prisma.appointment.findMany({
      where: {
        barberId,
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
        startsAt: {
          lt: dayEnd,
        },
        endsAt: {
          gt: dayStart,
        },
      },
      select: {
        startsAt: true,
        endsAt: true,
      },
    })
    const now = new Date()
    const slots: string[] = []

    for (
      let slotStart = new Date(dayStart);
      addMinutes(slotStart, service.durationMin) <= dayEnd;
      slotStart = addMinutes(slotStart, slotStepMin)
    ) {
      const slotEnd = addMinutes(slotStart, service.durationMin)

      if (slotStart <= now || hasOverlap(slotStart, slotEnd, appointments)) {
        continue
      }

      slots.push(formatTime(slotStart))
    }

    response.json({
      date,
      slots,
    })
  } catch (error) {
    next(error)
  }
})
