import { Router } from 'express'
import { prisma } from '../prisma.js'

export const barbersRouter = Router()

barbersRouter.get('/', async (_request, response, next) => {
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
        description: true,
      },
    })

    response.json({ barbers })
  } catch (error) {
    next(error)
  }
})
