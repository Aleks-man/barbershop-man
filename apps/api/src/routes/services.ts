import { Router } from 'express'
import { prisma } from '../prisma.js'

export const servicesRouter = Router()

servicesRouter.get('/', async (_request, response, next) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        title: 'asc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        durationMin: true,
        priceCents: true,
      },
    })

    response.json({ services })
  } catch (error) {
    next(error)
  }
})
