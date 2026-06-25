import { Router } from 'express'
import { createAdminToken, createBarberToken } from '../adminAuth.js'
import { config } from '../config.js'
import { hashPassword, verifyPasswordHash } from '../passwordHash.js'
import { prisma } from '../prisma.js'

type LoginBody = {
  barberId?: unknown
  password?: unknown
  role?: unknown
}

export const adminAuthRouter = Router()

adminAuthRouter.post('/login', async (request, response, next) => {
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
        passwordHash: true,
      },
    })

    if (!barber) {
      response.status(401).json({
        error: 'Invalid password',
      })
      return
    }

    const isValidPassword = barber.passwordHash
      ? await verifyPasswordHash(password, barber.passwordHash)
      : barber.password === password

    if (!isValidPassword) {
      response.status(401).json({
        error: 'Invalid password',
      })
      return
    }

    if (!barber.passwordHash) {
      await prisma.barber.update({
        where: {
          id: barber.id,
        },
        data: {
          password: '',
          passwordHash: await hashPassword(password),
        },
      })
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
