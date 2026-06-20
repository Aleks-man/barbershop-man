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
        description: true,
        experience: true,
        id: true,
        name: true,
        photoUrl: true,
        role: true,
      },
    })

    response.json({ barbers })
  } catch (error) {
    next(error)
  }
})
