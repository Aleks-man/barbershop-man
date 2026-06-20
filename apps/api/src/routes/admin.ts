import { Router } from 'express'
import { AppointmentStatus } from '@prisma/client'
import { mkdir, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import {
  canManageBarber,
  createAdminToken,
  createBarberToken,
  getResponseSession,
  requireAdmin,
  requireStaff,
} from '../adminAuth.js'
import { addMinutes, businessHoursByDay, hasOverlap, parseDate, setTime } from '../bookingTime.js'
import { config } from '../config.js'
import { prisma } from '../prisma.js'

type LoginBody = {
  barberId?: unknown
  password?: unknown
  role?: unknown
}

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

const appointmentStatusValues = Object.values(AppointmentStatus)
const barberPhotoUploadDir = fileURLToPath(new URL('../../uploads/barbers', import.meta.url))
const allowedPhotoTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
])

export const adminRouter = Router()

adminRouter.post('/login', async (request, response, next) => {
  try {
    const body = request.body as LoginBody
    const barberId = typeof body.barberId === 'string' ? body.barberId.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const role = body.role === 'barber' ? 'barber' : 'admin'

    if (role === 'admin') {
      if (password !== config.adminPassword) {
        response.status(401).json({
          error: 'Invalid password',
        })
        return
      }

      response.json({
        role: 'admin',
        token: createAdminToken(),
      })
      return
    }

    const barber = await prisma.barber.findFirst({
      where: {
        id: barberId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        password: true,
      },
    })

    if (!barber || barber.password !== password) {
      response.status(401).json({
        error: 'Invalid password',
      })
      return
    }

    response.json({
      barberId: barber.id,
      name: barber.name,
      role: 'barber',
      token: createBarberToken(barber.id),
    })
  } catch (error) {
    next(error)
  }
})

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
          : {
              isActive: true,
            },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        password: session.role === 'admin',
        description: true,
        experience: true,
        photoUrl: true,
        role: true,
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
      select: {
        description: true,
        experience: true,
        id: true,
        name: true,
        password: true,
        photoUrl: true,
        role: true,
      },
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
