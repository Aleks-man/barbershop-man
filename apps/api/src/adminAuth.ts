import crypto from 'node:crypto'
import type { RequestHandler } from 'express'
import { config } from './config.js'

const tokenLifetimeMs = 24 * 60 * 60 * 1000

const toBase64Url = (value: string) => Buffer.from(value).toString('base64url')

const sign = (payload: string) =>
  crypto.createHmac('sha256', config.adminTokenSecret).update(payload).digest('base64url')

export const createAdminToken = () => {
  const payload = JSON.stringify({
    exp: Date.now() + tokenLifetimeMs,
    role: 'admin',
  })
  const encodedPayload = toBase64Url(payload)

  return `${encodedPayload}.${sign(encodedPayload)}`
}

const isValidAdminToken = (token: string) => {
  const [encodedPayload, signature] = token.split('.')

  if (!encodedPayload || !signature || sign(encodedPayload) !== signature) {
    return false
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as {
      exp?: unknown
      role?: unknown
    }

    return payload.role === 'admin' && typeof payload.exp === 'number' && payload.exp > Date.now()
  } catch {
    return false
  }
}

export const requireAdmin: RequestHandler = (request, response, next) => {
  const authorization = request.header('authorization') ?? ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : ''

  if (!isValidAdminToken(token)) {
    response.status(401).json({
      error: 'Unauthorized',
    })
    return
  }

  next()
}
