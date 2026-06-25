import { Router } from 'express'
import {
  createAdminToken,
  createBarberToken,
  getResponseSession,
  requireStaff,
} from '../adminAuth.js'
import { config } from '../config.js'
import { hashPassword, verifyPasswordHash } from '../passwordHash.js'
import { prisma } from '../prisma.js'

type LoginBody = {
  barberId?: unknown
  password?: unknown
  role?: unknown
}

type PasswordChangeBody = {
  currentPassword?: unknown
  password?: unknown
}

export const adminAuthRouter = Router()

const adminCredentialRole = 'admin'

const getAdminCredential = () =>
  prisma.staffCredential.findUnique({
    where: {
      role: adminCredentialRole,
    },
  })

const verifyAdminPassword = async (password: string) => {
  const credential = await getAdminCredential()

  if (credential) {
    return verifyPasswordHash(password, credential.passwordHash)
  }

  if (password !== config.adminPassword) {
    return false
  }

  await prisma.staffCredential.create({
    data: {
      passwordHash: await hashPassword(password),
      role: adminCredentialRole,
    },
  })

  return true
}

const updateAdminPassword = async (password: string) => {
  await prisma.staffCredential.upsert({
    where: {
      role: adminCredentialRole,
    },
    create: {
      passwordHash: await hashPassword(password),
      role: adminCredentialRole,
    },
    update: {
      passwordHash: await hashPassword(password),
    },
  })
}

adminAuthRouter.post('/login', async (request, response, next) => {
  try {
    const body = request.body as LoginBody
    const barberId = typeof body.barberId === 'string' ? body.barberId.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const role = body.role === 'barber' ? 'barber' : 'admin'

    if (role === 'admin') {
      if (!(await verifyAdminPassword(password))) {
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
        mustChangePassword: true,
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
      mustChangePassword: barber.mustChangePassword,
      name: barber.name,
      role: 'barber',
      token: createBarberToken(barber.id),
    })
  } catch (error) {
    next(error)
  }
})

adminAuthRouter.patch('/password', requireStaff, async (request, response, next) => {
  try {
    const session = getResponseSession(response.locals)
    const body = request.body as PasswordChangeBody
    const currentPassword =
      typeof body.currentPassword === 'string' ? body.currentPassword : ''
    const password = typeof body.password === 'string' ? body.password.trim() : ''

    if (password.length < 6) {
      response.status(400).json({
        error: 'Password must be at least 6 characters',
      })
      return
    }

    if (session.role === 'admin') {
      if (!currentPassword || !(await verifyAdminPassword(currentPassword))) {
        response.status(401).json({
          error: 'Invalid current password',
        })
        return
      }

      await updateAdminPassword(password)
      response.status(204).send()
      return
    }

    if (session.role !== 'barber' || !session.barberId) {
      response.status(403).json({
        error: 'Forbidden',
      })
      return
    }

    const barber = await prisma.barber.findUnique({
      where: {
        id: session.barberId,
      },
      select: {
        mustChangePassword: true,
        passwordHash: true,
      },
    })

    if (!barber) {
      response.status(404).json({
        error: 'Barber not found',
      })
      return
    }

    if (!barber.mustChangePassword) {
      if (!currentPassword || !barber.passwordHash) {
        response.status(401).json({
          error: 'Invalid current password',
        })
        return
      }

      const isCurrentPasswordValid = await verifyPasswordHash(
        currentPassword,
        barber.passwordHash,
      )

      if (!isCurrentPasswordValid) {
        response.status(401).json({
          error: 'Invalid current password',
        })
        return
      }
    }

    await prisma.barber.update({
      where: {
        id: session.barberId,
      },
      data: {
        mustChangePassword: false,
        password: '',
        passwordHash: await hashPassword(password),
      },
    })

    response.status(204).send()
  } catch (error) {
    next(error)
  }
})
