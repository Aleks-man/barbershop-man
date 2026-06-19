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

    if (!dayStart || !dayEnd) {
      response.status(400).json({
        error: 'Invalid business hours',
      })
      return
    }
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
