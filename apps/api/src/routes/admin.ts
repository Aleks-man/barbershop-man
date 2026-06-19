import { Router } from 'express'
import { AppointmentStatus } from '@prisma/client'
import { createAdminToken, requireAdmin } from '../adminAuth.js'
import { addMinutes, businessHoursByDay, hasOverlap, parseDate, setTime } from '../bookingTime.js'
import { config } from '../config.js'
import { prisma } from '../prisma.js'

type LoginBody = {
  password?: unknown
}

type AppointmentStatusBody = {
  status?: unknown
}

type AppointmentRescheduleBody = {
  date?: unknown
  time?: unknown
}

const appointmentStatusValues = Object.values(AppointmentStatus)

export const adminRouter = Router()

adminRouter.post('/login', (request, response) => {
  const body = request.body as LoginBody
  const password = typeof body.password === 'string' ? body.password : ''

  if (password !== config.adminPassword) {
    response.status(401).json({
      error: 'Invalid password',
    })
    return
  }

  response.json({
    token: createAdminToken(),
  })
})

adminRouter.get('/appointments', requireAdmin, async (_request, response, next) => {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: {
        startsAt: 'asc',
      },
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
    })

    response.json({ appointments })
  } catch (error) {
    next(error)
  }
})

adminRouter.patch('/appointments/:id/reschedule', requireAdmin, async (request, response, next) => {
  try {
    const appointmentId = String(request.params.id ?? '')
    const body = request.body as AppointmentRescheduleBody
    const date = typeof body.date === 'string' ? body.date.trim() : ''
    const time = typeof body.time === 'string' ? body.time.trim() : ''
    const selectedDate = parseDate(date)

    if (!appointmentId || !selectedDate || !time) {
      response.status(400).json({
        error: 'date and time are required',
      })
      return
    }

    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        service: true,
      },
    })

    if (!appointment || appointment.status === AppointmentStatus.CANCELLED) {
      response.status(404).json({
        error: 'Appointment not found',
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

    const endsAt = addMinutes(startsAt, appointment.service.durationMin)
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

    const overlappingAppointments = await prisma.appointment.findMany({
      where: {
        id: {
          not: appointmentId,
        },
        barberId: appointment.barberId,
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
    })

    if (hasOverlap(startsAt, endsAt, overlappingAppointments)) {
      response.status(409).json({
        error: 'Selected time is not available',
      })
      return
    }

    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        endsAt,
        startsAt,
      },
      select: {
        id: true,
        startsAt: true,
        endsAt: true,
      },
    })

    response.json({ appointment: updatedAppointment })
  } catch (error) {
    next(error)
  }
})

adminRouter.get('/barbers', requireAdmin, async (_request, response, next) => {
  try {
    const barbers = await prisma.barber.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
    })

    response.json({ barbers })
  } catch (error) {
    next(error)
  }
})

adminRouter.patch('/appointments/:id/status', requireAdmin, async (request, response, next) => {
  try {
    const appointmentId = String(request.params.id ?? '')
    const body = request.body as AppointmentStatusBody
    const status = typeof body.status === 'string' ? body.status : ''

    if (!appointmentStatusValues.includes(status as AppointmentStatus)) {
      response.status(400).json({
        error: 'Invalid status',
      })
      return
    }

    const appointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: status as AppointmentStatus,
      },
      select: {
        id: true,
        status: true,
      },
    })

    response.json({ appointment })
  } catch (error) {
    next(error)
  }
})
