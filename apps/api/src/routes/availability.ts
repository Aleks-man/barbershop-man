import { AppointmentStatus } from '@prisma/client'
import { Router } from 'express'
import {
  addMinutes,
  businessHoursByDay,
  formatTime,
  hasOverlap,
  parseDate,
  setTime,
  slotStepMin,
} from '../bookingTime.js'
import { prisma } from '../prisma.js'

export const availabilityRouter = Router()

const getActiveBookingEntities = async (serviceId: string, barberId: string) =>
  Promise.all([
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

const getDaySlots = async ({
  barberId,
  date,
  durationMin,
}: {
  barberId: string
  date: Date
  durationMin: number
}) => {
    const businessHours =
    businessHoursByDay[date.getDay() as keyof typeof businessHoursByDay]
  const dayStart = setTime(date, businessHours.start)
  const dayEnd = setTime(date, businessHours.end)

    if (!dayStart || !dayEnd) {
    return []
    }

    const [appointments, timeOffs] = await Promise.all([
      prisma.appointment.findMany({
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
      }),
      prisma.barberTimeOff.findMany({
        where: {
          barberId,
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
      }),
    ])

    const now = new Date()
    const slots: string[] = []

    for (
      let slotStart = new Date(dayStart);
    addMinutes(slotStart, durationMin) <= dayEnd;
      slotStart = addMinutes(slotStart, slotStepMin)
    ) {
    const slotEnd = addMinutes(slotStart, durationMin)

      if (
        slotStart <= now ||
        hasOverlap(slotStart, slotEnd, appointments) ||
        hasOverlap(slotStart, slotEnd, timeOffs)
      ) {
        continue
      }

      slots.push(formatTime(slotStart))
    }

  return slots
}

const getDateValue = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

availabilityRouter.get('/month', async (request, response, next) => {
  try {
    const serviceId = String(request.query.serviceId ?? '')
    const barberId = String(request.query.barberId ?? '')
    const year = Number(request.query.year)
    const month = Number(request.query.month)

    if (!serviceId || !barberId || !year || month < 1 || month > 12) {
      response.status(400).json({
        error: 'serviceId, barberId, year and month are required',
      })
      return
    }

    const [service, barber] = await getActiveBookingEntities(serviceId, barberId)

    if (!service || !barber) {
      response.status(404).json({
        error: 'Service or barber not found',
      })
      return
    }

    const daysInMonth = new Date(year, month, 0).getDate()
    const unavailableDates: string[] = []

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month - 1, day)
      const slots = await getDaySlots({
        barberId,
        date,
        durationMin: service.durationMin,
      })

      if (slots.length === 0) {
        unavailableDates.push(getDateValue(date))
      }
    }

    response.json({
      month,
      unavailableDates,
      year,
    })
  } catch (error) {
    next(error)
  }
})

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

    const [service, barber] = await getActiveBookingEntities(serviceId, barberId)

    if (!service || !barber) {
      response.status(404).json({
        error: 'Service or barber not found',
      })
      return
    }

    const slots = await getDaySlots({
      barberId,
      date: selectedDate,
      durationMin: service.durationMin,
    })

    response.json({
      date,
      slots,
    })
  } catch (error) {
    next(error)
  }
})
