import cors from 'cors'
import type { ErrorRequestHandler } from 'express'
import express from 'express'
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

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next
  console.error(error)

  response.status(500).json({
    error: 'Internal server error',
  })
}

app.use(errorHandler)
