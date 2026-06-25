import { Router } from 'express'
import { getResponseSession, requireStaff } from '../adminAuth.js'
import { adminNotificationSelect } from '../adminSelects.js'
import { prisma } from '../prisma.js'

export const adminNotificationsRouter = Router()

adminNotificationsRouter.get('/', requireStaff, async (request, response, next) => {
  try {
    const session = getResponseSession(response.locals)
    const scope = request.query.scope === 'all' ? 'all' : 'unread'
    const notifications = await prisma.adminNotification.findMany({
      where:
        session.role === 'admin'
          ? {
              recipientRole: 'admin',
              readAt: scope === 'unread' ? null : undefined,
            }
          : {
              barberId: session.barberId,
              recipientRole: 'barber',
              readAt: scope === 'unread' ? null : undefined,
            },
      orderBy: {
        createdAt: 'desc',
      },
      take: scope === 'all' ? 100 : undefined,
      select: adminNotificationSelect,
    })

    response.json({ notifications })
  } catch (error) {
    next(error)
  }
})

adminNotificationsRouter.patch('/read', requireStaff, async (_request, response, next) => {
  try {
    const session = getResponseSession(response.locals)

    await prisma.adminNotification.updateMany({
      where:
        session.role === 'admin'
          ? {
              recipientRole: 'admin',
              readAt: null,
            }
          : {
              barberId: session.barberId,
              recipientRole: 'barber',
              readAt: null,
            },
      data: {
        readAt: new Date(),
      },
    })

    response.status(204).send()
  } catch (error) {
    next(error)
  }
})
