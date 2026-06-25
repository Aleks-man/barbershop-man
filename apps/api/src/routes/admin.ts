import { Router } from 'express'
import { AppointmentStatus } from '@prisma/client'
import { mkdir, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import {
  canManageBarber,
  getResponseSession,
  requireAdmin,
  requireStaff,
} from '../adminAuth.js'
import {
  adminAppointmentSelect,
  adminBarberSelect,
  adminTimeOffSelect,
} from '../adminSelects.js'
import { addMinutes, businessHoursByDay, hasOverlap, parseDate, setTime } from '../bookingTime.js'
import { prisma } from '../prisma.js'
import { adminAuthRouter } from './adminAuthRoutes.js'
import { adminEventsRouter } from './adminEvents.js'
import { adminNotificationsRouter } from './adminNotifications.js'

type AppointmentStatusBody = {
  status?: unknown
}

type AppointmentRescheduleBody = {
  date?: unknown
  time?: unknown
}

type BarberBody = {
  description?: unknown
  experience?: unknown
  name?: unknown
  password?: unknown
  photoUrl?: unknown
  role?: unknown
}

type BarberPhotoBody = {
  dataUrl?: unknown
}

type BarberTimeOffBody = {
  barberId?: unknown
  endTime?: unknown
  endDate?: unknown
  reason?: unknown
  startDate?: unknown
  startTime?: unknown
}

const appointmentStatusValues = Object.values(AppointmentStatus)
const barberPhotoUploadDir = fileURLToPath(new URL('../../uploads/barbers', import.meta.url))
const allowedPhotoTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
])

export const adminRouter = Router()

adminRouter.use(adminAuthRouter)
adminRouter.use('/events', adminEventsRouter)
adminRouter.use('/notifications', adminNotificationsRouter)

adminRouter.get('/appointments', requireStaff, async (_request, response, next) => {
  try {
    const session = getResponseSession(response.locals)
    const appointments = await prisma.appointment.findMany({
      where:
        session.role === 'barber'
          ? {
              barberId: session.barberId,
            }
          : undefined,
      orderBy: {
        startsAt: 'asc',
      },
      select: adminAppointmentSelect,
    })

    response.json({ appointments })
  } catch (error) {
    next(error)
  }
})

adminRouter.patch('/appointments/:id/reschedule', requireStaff, async (request, response, next) => {
  try {
    const session = getResponseSession(response.locals)
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

    if (!canManageBarber(session, appointment.barberId)) {
      response.status(403).json({
        error: 'Forbidden',
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

    const [overlappingAppointments, overlappingTimeOffs] = await Promise.all([
      prisma.appointment.findMany({
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
      }),
      prisma.barberTimeOff.findMany({
        where: {
          barberId: appointment.barberId,
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

adminRouter.get('/barbers', requireStaff, async (_request, response, next) => {
  try {
    const session = getResponseSession(response.locals)
    const barbers = await prisma.barber.findMany({
      where:
        session.role === 'barber'
          ? {
              id: session.barberId,
              isActive: true,
            }
          : undefined,
      orderBy: {
        name: 'asc',
      },
      select: {
        ...adminBarberSelect,
        password: session.role === 'admin',
      },
    })

    response.json({ barbers })
  } catch (error) {
    next(error)
  }
})

adminRouter.post('/barbers', requireAdmin, async (request, response, next) => {
  try {
    const body = request.body as BarberBody
    const description = typeof body.description === 'string' ? body.description.trim() : ''
    const experience = typeof body.experience === 'string' ? body.experience.trim() : ''
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const password = typeof body.password === 'string' ? body.password.trim() : ''
    const photoUrl = typeof body.photoUrl === 'string' ? body.photoUrl.trim() : ''
    const role = typeof body.role === 'string' ? body.role.trim() : ''

    if (!name) {
      response.status(400).json({
        error: 'Name is required',
      })
      return
    }

    const barber = await prisma.barber.create({
      data: {
        description: description || null,
        experience: experience || null,
        name,
        password: password || '111111',
        photoUrl: photoUrl || null,
        role: role || null,
      },
      select: adminBarberSelect,
    })

    response.status(201).json({ barber })
  } catch (error) {
    next(error)
  }
})

adminRouter.post('/barbers/photo', requireAdmin, async (request, response, next) => {
  try {
    const body = request.body as BarberPhotoBody
    const dataUrl = typeof body.dataUrl === 'string' ? body.dataUrl : ''
    const match = /^data:(image\/(?:jpeg|png|webp));base64,([a-zA-Z0-9+/=]+)$/.exec(dataUrl)

    if (!match) {
      response.status(400).json({
        error: 'Invalid image',
      })
      return
    }

    const mimeType = match[1]
    const extension = allowedPhotoTypes.get(mimeType)
    const imageBuffer = Buffer.from(match[2], 'base64')

    if (!extension || imageBuffer.length > 3 * 1024 * 1024) {
      response.status(400).json({
        error: 'Image is too large or unsupported',
      })
      return
    }

    await mkdir(barberPhotoUploadDir, { recursive: true })

    const fileName = `${randomUUID()}.${extension}`
    await writeFile(new URL(`../../uploads/barbers/${fileName}`, import.meta.url), imageBuffer)

    response.status(201).json({
      photoUrl: `/uploads/barbers/${fileName}`,
    })
  } catch (error) {
    next(error)
  }
})

adminRouter.delete('/barbers/:id', requireAdmin, async (request, response, next) => {
  try {
    const barberId = String(request.params.id ?? '')
    const activeAppointments = await prisma.appointment.count({
      where: {
        barberId,
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
        startsAt: {
          gt: new Date(),
        },
      },
    })

    if (activeAppointments > 0) {
      response.status(409).json({
        error: 'Barber has active appointments',
      })
      return
    }

    await prisma.barber.update({
      where: {
        id: barberId,
      },
      data: {
        isActive: false,
      },
    })

    response.status(204).send()
  } catch (error) {
    next(error)
  }
})

adminRouter.delete('/barbers/:id/permanent', requireAdmin, async (request, response, next) => {
  try {
    const barberId = String(request.params.id ?? '')
    const barber = await prisma.barber.findUnique({
      where: {
        id: barberId,
      },
      select: {
        isActive: true,
      },
    })

    if (!barber || barber.isActive) {
      response.status(404).json({
        error: 'Hidden barber not found',
      })
      return
    }

    const appointmentsCount = await prisma.appointment.count({
      where: {
        barberId,
      },
    })

    if (appointmentsCount > 0) {
      response.status(409).json({
        error: 'Barber has appointments',
      })
      return
    }

    await prisma.barber.delete({
      where: {
        id: barberId,
      },
    })

    response.status(204).send()
  } catch (error) {
    next(error)
  }
})

adminRouter.patch('/barbers/:id/restore', requireAdmin, async (request, response, next) => {
  try {
    const barberId = String(request.params.id ?? '')

    const barber = await prisma.barber.update({
      where: {
        id: barberId,
      },
      data: {
        isActive: true,
      },
      select: adminBarberSelect,
    })

    response.json({ barber })
  } catch (error) {
    next(error)
  }
})

adminRouter.get('/time-off', requireStaff, async (_request, response, next) => {
  try {
    const session = getResponseSession(response.locals)
    const timeOffs = await prisma.barberTimeOff.findMany({
      where:
        session.role === 'barber'
          ? {
              barberId: session.barberId,
            }
          : undefined,
      orderBy: {
        startsAt: 'asc',
      },
      select: adminTimeOffSelect,
    })

    response.json({ timeOffs })
  } catch (error) {
    next(error)
  }
})

adminRouter.post('/time-off', requireStaff, async (request, response, next) => {
  try {
    const session = getResponseSession(response.locals)
    const body = request.body as BarberTimeOffBody
    const barberId =
      session.role === 'barber'
        ? session.barberId || ''
        : typeof body.barberId === 'string'
          ? body.barberId.trim()
          : ''
    const endDate = typeof body.endDate === 'string' ? body.endDate.trim() : ''
    const endTime = typeof body.endTime === 'string' ? body.endTime.trim() : ''
    const reason = typeof body.reason === 'string' ? body.reason.trim() : ''
    const startDate = typeof body.startDate === 'string' ? body.startDate.trim() : ''
    const startTime = typeof body.startTime === 'string' ? body.startTime.trim() : ''
    const selectedEndDate = parseDate(endDate)
    const selectedStartDate = parseDate(startDate)

    if (!barberId || !selectedStartDate || !selectedEndDate || !startTime || !endTime || !reason) {
      response.status(400).json({
        error: 'barberId, startDate, startTime, endDate, endTime and reason are required',
      })
      return
    }

    if (!canManageBarber(session, barberId)) {
      response.status(403).json({
        error: 'Forbidden',
      })
      return
    }

    const [barber, startsAt, endsAt] = await Promise.all([
      prisma.barber.findFirst({
        where: {
          id: barberId,
          isActive: true,
        },
      }),
      Promise.resolve(setTime(selectedStartDate, startTime)),
      Promise.resolve(setTime(selectedEndDate, endTime)),
    ])

    if (!barber || !startsAt || !endsAt || startsAt >= endsAt) {
      response.status(409).json({
        error: 'Selected period is not available',
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
        error: 'Selected period is not available',
      })
      return
    }

    const timeOff = await prisma.barberTimeOff.create({
      data: {
        barberId,
        endsAt,
        reason,
        startsAt,
      },
      select: adminTimeOffSelect,
    })

    response.status(201).json({ timeOff })
  } catch (error) {
    next(error)
  }
})

adminRouter.delete('/time-off/:id', requireStaff, async (request, response, next) => {
  try {
    const session = getResponseSession(response.locals)
    const timeOffId = String(request.params.id ?? '')
    const timeOff = await prisma.barberTimeOff.findUnique({
      where: {
        id: timeOffId,
      },
      select: {
        barberId: true,
      },
    })

    if (!timeOff) {
      response.status(404).json({
        error: 'Time off not found',
      })
      return
    }

    if (!canManageBarber(session, timeOff.barberId)) {
      response.status(403).json({
        error: 'Forbidden',
      })
      return
    }

    await prisma.barberTimeOff.delete({
      where: {
        id: timeOffId,
      },
    })

    response.status(204).send()
  } catch (error) {
    next(error)
  }
})

adminRouter.patch('/appointments/:id/status', requireStaff, async (request, response, next) => {
  try {
    const session = getResponseSession(response.locals)
    const appointmentId = String(request.params.id ?? '')
    const body = request.body as AppointmentStatusBody
    const status = typeof body.status === 'string' ? body.status : ''

    if (!appointmentStatusValues.includes(status as AppointmentStatus)) {
      response.status(400).json({
        error: 'Invalid status',
      })
      return
    }

    const currentAppointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      select: {
        barberId: true,
      },
    })

    if (!currentAppointment) {
      response.status(404).json({
        error: 'Appointment not found',
      })
      return
    }

    if (!canManageBarber(session, currentAppointment.barberId)) {
      response.status(403).json({
        error: 'Forbidden',
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
