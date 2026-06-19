import cors from 'cors'
import type { ErrorRequestHandler } from 'express'
import express from 'express'
import { adminRouter } from './routes/admin.js'
import { appointmentsRouter } from './routes/appointments.js'
import { availabilityRouter } from './routes/availability.js'
import { barbersRouter } from './routes/barbers.js'
import { servicesRouter } from './routes/services.js'

export const app = express()

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
)
app.use(express.json())

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
