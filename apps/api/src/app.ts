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

const developmentOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173']
const allowedOrigins =
  config.corsOrigins.length > 0
    ? config.corsOrigins
    : config.nodeEnv === 'production'
      ? []
      : developmentOrigins

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
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
