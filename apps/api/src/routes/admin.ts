import { Router } from 'express'
import { createAdminToken, requireAdmin } from '../adminAuth.js'
import { config } from '../config.js'
import { prisma } from '../prisma.js'

type LoginBody = {
  password?: unknown
}

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
            name: true,
          },
        },
        service: {
          select: {
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
