import type { Response } from 'express'
import { randomUUID } from 'node:crypto'
import type { StaffSession } from './adminAuth.js'

type AdminEventClient = {
  id: string
  response: Response
  session: StaffSession
}

export type AppointmentCreatedEvent = {
  notifications: Array<{
    id: string
    createdAt: Date
    readAt: Date | null
    recipientRole: string
    barberId: string | null
    appointment: {
      id: string
      customerName: string
      customerPhone: string
      startsAt: Date
      endsAt: Date
      status: string
      barber: {
        id: string
        name: string
      }
      service: {
        id: string
        title: string
      }
    }
  }>
}

const clients = new Map<string, AdminEventClient>()

const canReceiveBarberEvent = (session: StaffSession, barberId: string) =>
  session.role === 'admin' || session.barberId === barberId

const sendEvent = (client: AdminEventClient, event: string, data: unknown) => {
  client.response.write(`event: ${event}\n`)
  client.response.write(`data: ${JSON.stringify(data)}\n\n`)
}

export const addAdminEventClient = (response: Response, session: StaffSession) => {
  const id = randomUUID()

  response.setHeader('Content-Type', 'text/event-stream')
  response.setHeader('Cache-Control', 'no-cache, no-transform')
  response.setHeader('Connection', 'keep-alive')
  response.flushHeaders()
  response.write(': connected\n\n')

  clients.set(id, {
    id,
    response,
    session,
  })

  const heartbeatId = setInterval(() => {
    response.write(': heartbeat\n\n')
  }, 25_000)

  response.on('close', () => {
    clearInterval(heartbeatId)
    clients.delete(id)
  })
}

export const notifyAppointmentCreated = (data: AppointmentCreatedEvent) => {
  clients.forEach((client) => {
    const notification = data.notifications.find((currentNotification) => {
      if (!canReceiveBarberEvent(client.session, currentNotification.appointment.barber.id)) {
        return false
      }

      return client.session.role === 'admin'
        ? currentNotification.recipientRole === 'admin'
        : currentNotification.barberId === client.session.barberId
    })

    if (!notification) {
      return
    }

    sendEvent(client, 'appointment-created', { notification })
  })
}
