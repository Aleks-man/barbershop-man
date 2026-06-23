import { AppointmentStatus } from '@prisma/client'
import { Router } from 'express'
import { addMinutes, businessHoursByDay, hasOverlap, parseDate, setTime } from '../bookingTime.js'
import { notifyAppointmentCreated } from '../adminEvents.js'
import { prisma } from '../prisma.js'

type AppointmentRequestBody = {
  barberId?: unknown
  customerName?: unknown
  customerPhone?: unknown
  date?: unknown
  serviceId?: unknown
  time?: unknown
}

const getRussianPhoneDigits = (value: string) => {
  const digits = value.replace(/\D/g, '')

  if (digits.startsWith('8') || digits.startsWith('7')) {
    return digits.slice(1)
  }

  return digits
}

const normalizeRussianPhone = (value: string) => {
  const digits = getRussianPhoneDigits(value)

  if (digits.length !== 10) {
    return ''
  }

  return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`
}

export const appointmentsRouter = Router()

appointmentsRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body as AppointmentRequestBody
    const barberId = typeof body.barberId === 'string' ? body.barberId.trim() : ''
    const customerName =
      typeof body.customerName === 'string' ? body.customerName.trim() : ''
    const customerPhone =
      typeof body.customerPhone === 'string' ? body.customerPhone.trim() : ''
    const normalizedCustomerPhone = normalizeRussianPhone(customerPhone)
    const date = typeof body.date === 'string' ? body.date.trim() : ''
    const serviceId = typeof body.serviceId === 'string' ? body.serviceId.trim() : ''
    const time = typeof body.time === 'string' ? body.time.trim() : ''
    const selectedDate = parseDate(date)

    if (
      !barberId ||
      !customerName ||
      !normalizedCustomerPhone ||
      !selectedDate ||
      !serviceId ||
      !time
    ) {
      response.status(400).json({
        error: 'barberId, serviceId, date, time, customerName and customerPhone are required',
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

    const startsAt = setTime(selectedDate, time)

    if (!startsAt) {
      response.status(400).json({
        error: 'Invalid time',
      })
      return
    }

    const endsAt = addMinutes(startsAt, service.durationMin)
    const businessHours =
      businessHoursByDay[selectedDate.getDay() as keyof typeof businessHoursByDay]
    const dayStart = setTime(selectedDate, businessHours.start)
    const dayEnd = setTime(selectedDate, businessHours.end)

    if (!dayStart || !dayEnd || startsAt < dayStart || endsAt > dayEnd || startsAt <= new Date()) {
      response.status(409).json({
        error: 'Selected time is not available',
      })
      return
    }

    const [overlappingAppointments, overlappingTimeOffs] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          barberId,
          status: {
            in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
          },
          startsAt: {
            lt: endsAt,
          },
          endsAt: {
            gt: startsAt,
          },
        },
        select: {
          endsAt: true,
          startsAt: true,
        },
      }),
      prisma.barberTimeOff.findMany({
        where: {
          barberId,
          startsAt: {
            lt: endsAt,
          },
          endsAt: {
            gt: startsAt,
          },
        },
        select: {
          endsAt: true,
          startsAt: true,
        },
      }),
    ])

    if (
      hasOverlap(startsAt, endsAt, overlappingAppointments) ||
      hasOverlap(startsAt, endsAt, overlappingTimeOffs)
    ) {
      response.status(409).json({
        error: 'Selected time is not available',
      })
      return
    }

    const appointment = await prisma.appointment.create({
      data: {
        barberId,
        customerName,
        customerPhone: normalizedCustomerPhone,
        endsAt,
        serviceId,
        startsAt,
      },
      select: {
        barber: {
          select: {
            id: true,
            name: true,
          },
        },
        customerName: true,
        customerPhone: true,
        endsAt: true,
        id: true,
        service: {
          select: {
            id: true,
            title: true,
          },
        },
        status: true,
        startsAt: true,
      },
    })

    const notifications = await prisma.$transaction([
      prisma.adminNotification.create({
        data: {
          appointmentId: appointment.id,
          recipientRole: 'admin',
        },
        select: {
          id: true,
          createdAt: true,
          readAt: true,
          recipientRole: true,
          barberId: true,
          appointment: {
            select: {
              id: true,
              customerName: true,
              customerPhone: true,
              startsAt: true,
              endsAt: true,
              status: true,
              barber: {
                select: {
                  id: true,
                  name: true,
                },
              },
              service: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      }),
      prisma.adminNotification.create({
        data: {
          appointmentId: appointment.id,
          barberId: appointment.barber.id,
          recipientRole: 'barber',
        },
        select: {
          id: true,
          createdAt: true,
          readAt: true,
          recipientRole: true,
          barberId: true,
          appointment: {
            select: {
              id: true,
              customerName: true,
              customerPhone: true,
              startsAt: true,
              endsAt: true,
              status: true,
              barber: {
                select: {
                  id: true,
                  name: true,
                },
              },
              service: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      }),
    ])

    notifyAppointmentCreated({ notifications })

    response.status(201).json({ appointment })
  } catch (error) {
    next(error)
  }
})
