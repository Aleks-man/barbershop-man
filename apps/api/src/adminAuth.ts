import crypto from 'node:crypto'
import type { RequestHandler } from 'express'
import { config } from './config.js'

const tokenLifetimeMs = 24 * 60 * 60 * 1000

export type StaffSession = {
  barberId?: string
  role: 'admin' | 'barber'
}

const toBase64Url = (value: string) => Buffer.from(value).toString('base64url')

const sign = (payload: string) =>
  crypto.createHmac('sha256', config.adminTokenSecret).update(payload).digest('base64url')

const createStaffToken = (session: StaffSession) => {
  const payload = JSON.stringify({
    ...session,
    exp: Date.now() + tokenLifetimeMs,
  })
  const encodedPayload = toBase64Url(payload)

  return `${encodedPayload}.${sign(encodedPayload)}`
}

export const createAdminToken = () => createStaffToken({ role: 'admin' })

export const createBarberToken = (barberId: string) =>
  createStaffToken({
    barberId,
    role: 'barber',
  })

export const getStaffSession = (token: string): StaffSession | null => {
  const [encodedPayload, signature] = token.split('.')

  if (!encodedPayload || !signature || sign(encodedPayload) !== signature) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as {
      barberId?: unknown
      exp?: unknown
      role?: unknown
    }

    if (typeof payload.exp !== 'number' || payload.exp <= Date.now()) {
      return null
    }

    if (payload.role === 'admin') {
      return { role: 'admin' }
    }

    if (payload.role === 'barber' && typeof payload.barberId === 'string') {
      return {
        barberId: payload.barberId,
        role: 'barber',
      }
    }

    return null
  } catch {
    return null
  }
}

export const requireStaff: RequestHandler = (request, response, next) => {
  const authorization = request.header('authorization') ?? ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : ''
  const session = getStaffSession(token)

  if (!session) {
    response.status(401).json({
      error: 'Unauthorized',
    })
    return
  }

  response.locals.session = session
  next()
}

export const requireAdmin: RequestHandler = (request, response, next) => {
  requireStaff(request, response, () => {
    const session = response.locals.session as StaffSession

    if (session.role !== 'admin') {
      response.status(403).json({
        error: 'Forbidden',
      })
      return
    }

    next()
  })
}

export const getResponseSession = (locals: Record<string, unknown>) =>
  locals.session as StaffSession

export const canManageBarber = (session: StaffSession, barberId: string) =>
  session.role === 'admin' || session.barberId === barberId
