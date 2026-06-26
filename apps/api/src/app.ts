import cors from 'cors'
import type { ErrorRequestHandler } from 'express'
import express from 'express'
import { fileURLToPath } from 'node:url'
import { adminRouter } from './routes/admin.js'
import { appointmentsRouter } from './routes/appointments.js'
import { availabilityRouter } from './routes/availability.js'
import { config } from './config.js'
import { barbersRouter } from './routes/barbers.js'
import { servicesRouter } from './routes/services.js'

export const app = express()

const isPrivateNetworkHost = (host: string) =>
  host === 'localhost' ||
  host === '127.0.0.1' ||
  host.startsWith('10.') ||
  host.startsWith('192.168.') ||
  /^172\.(1[6-9]|2\d|3[01])\./.test(host)

const isDevelopmentOrigin = (origin: string) => {
  if (config.nodeEnv === 'production') {
    return false
  }

  try {
    const url = new URL(origin)

    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      isPrivateNetworkHost(url.hostname)
    )
  } catch {
    return false
  }
}

const allowedOrigins =
  config.corsOrigins.length > 0
    ? config.corsOrigins
    : config.nodeEnv === 'production'
      ? []
      : []

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || isDevelopmentOrigin(origin)) {
        callback(null, true)
        return
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`))
    },
  }),
)
app.use(express.json({ limit: '6mb' }))
app.use('/uploads', express.static(fileURLToPath(new URL('../uploads', import.meta.url))))

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    service: 'barbershop-api',
  })
})

app.use('/api/barbers', barbersRouter)
app.use('/api/services', servicesRouter)
app.use('/api/availability', availabilityRouter)
app.use('/api/appointments', appointmentsRouter)
app.use('/api/admin', adminRouter)

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next
  console.error(error)

  response.status(500).json({
    error: 'Internal server error',
  })
}

app.use(errorHandler)
