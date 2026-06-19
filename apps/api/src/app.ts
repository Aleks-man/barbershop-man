import cors from 'cors'
import express from 'express'

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
