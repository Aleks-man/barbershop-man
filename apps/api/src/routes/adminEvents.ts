import { Router } from 'express'
import { getStaffSession } from '../adminAuth.js'
import { addAdminEventClient } from '../adminEvents.js'

export const adminEventsRouter = Router()

adminEventsRouter.get('/', (request, response) => {
  const token = String(request.query.token ?? '')
  const session = getStaffSession(token)

  if (!session) {
    response.status(401).json({
      error: 'Unauthorized',
    })
    return
  }

  addAdminEventClient(response, session)
})
