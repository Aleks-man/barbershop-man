import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getAdminNotifications,
  markAdminNotificationsRead,
  type AdminAppointment,
  type AdminNotification,
} from '../../../api/admin'
import { apiUrl } from '../../../api/client'
import {
  announceOverlayOpen,
  getOverlaySourceId,
  overlayOpenEvent,
} from '../../../utils/overlayEvents'
import type { NotificationMode } from '../components/AdminNotifications'
import type { AdminSession } from '../types'

type UseAdminNotificationsParams = {
  session: AdminSession | null
  onAppointmentCreated: (appointment: AdminAppointment) => void
}

export function useAdminNotifications({
  onAppointmentCreated,
  session,
}: UseAdminNotificationsParams) {
  const notificationsRef = useRef<HTMLDivElement | null>(null)
  const isNotificationsOpenRef = useRef(false)
  const notificationOverlayId = useRef('admin-notifications')
  const token = session?.token ?? ''
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [notificationMode, setNotificationMode] =
    useState<NotificationMode>('unread')
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  const hydrateNotifications = useCallback(
    (nextNotifications: AdminNotification[]) => {
      setNotifications(nextNotifications)
      setUnreadNotifications(nextNotifications.length)
    },
    [],
  )

  const resetNotifications = useCallback(() => {
    setNotifications([])
    setIsNotificationsOpen(false)
    setUnreadNotifications(0)
    setNotificationMode('unread')
  }, [])

  const closeNotifications = useCallback(() => {
    setIsNotificationsOpen(false)
    setUnreadNotifications(0)
    setNotificationMode('unread')
  }, [])

  const loadNotifications = useCallback(
    async (mode: NotificationMode) => {
      if (!token) {
        return []
      }

      setIsLoadingNotifications(true)

      try {
        const nextNotifications = await getAdminNotifications(token, mode)

        setNotifications(nextNotifications)

        if (mode === 'unread') {
          setUnreadNotifications(nextNotifications.length)
        }

        return nextNotifications
      } catch (error: unknown) {
        console.warn('Failed to load notifications', error)
        return []
      } finally {
        setIsLoadingNotifications(false)
      }
    },
    [token],
  )

  const openNotifications = useCallback(async () => {
    announceOverlayOpen(notificationOverlayId.current)
    setIsNotificationsOpen(true)
    setNotificationMode('unread')
    setUnreadNotifications(0)
    const unreadNotificationsList = await loadNotifications('unread')

    if (!token || unreadNotificationsList.length === 0) {
      return
    }

    void markAdminNotificationsRead(token).catch((error: unknown) => {
      console.warn('Failed to mark notifications read', error)
    })
  }, [loadNotifications, token])

  const toggleNotifications = useCallback(() => {
    if (isNotificationsOpen) {
      closeNotifications()
      return
    }

    void openNotifications()
  }, [closeNotifications, isNotificationsOpen, openNotifications])

  const showAllNotifications = useCallback(() => {
    setNotificationMode('all')
    void loadNotifications('all')
  }, [loadNotifications])

  const showUnreadNotifications = useCallback(() => {
    setNotificationMode('unread')
    void loadNotifications('unread')
  }, [loadNotifications])

  const loadUnreadNotifications = useCallback(() => {
    void loadNotifications('unread')
  }, [loadNotifications])


  useEffect(() => {
    isNotificationsOpenRef.current = isNotificationsOpen
  }, [isNotificationsOpen])

  useEffect(() => {
    if (!isNotificationsOpen) {
      return
    }

    const handleOverlayOpen = (event: Event) => {
      if (getOverlaySourceId(event) !== notificationOverlayId.current) {
        closeNotifications()
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        closeNotifications()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeNotifications()
      }
    }

    window.addEventListener(overlayOpenEvent, handleOverlayOpen)
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener(overlayOpenEvent, handleOverlayOpen)
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeNotifications, isNotificationsOpen])

  useEffect(() => {
    if (!session) {
      return
    }

    const events = new EventSource(
      apiUrl(`/api/admin/events?token=${encodeURIComponent(session.token)}`),
    )

    events.addEventListener('appointment-created', (event) => {
      const data = JSON.parse(event.data) as { notification: AdminNotification }
      const notification = data.notification

      onAppointmentCreated(notification.appointment)
      setNotifications((currentNotifications) =>
        currentNotifications.some(
          (currentNotification) => currentNotification.id === notification.id,
        )
          ? currentNotifications
          : [notification, ...currentNotifications],
      )
      setUnreadNotifications((currentCount) =>
        isNotificationsOpenRef.current ? currentCount : currentCount + 1,
      )

      if (isNotificationsOpenRef.current) {
        void markAdminNotificationsRead(session.token).catch((error: unknown) => {
          console.warn('Failed to mark notifications read', error)
        })
      }
    })

    return () => {
      events.close()
    }
  }, [onAppointmentCreated, session])

  return {
    hydrateNotifications,
    isLoadingNotifications,
    isNotificationsOpen,
    loadUnreadNotifications,
    notificationMode,
    notifications,
    notificationsRef,
    resetNotifications,
    showAllNotifications,
    showUnreadNotifications,
    toggleNotifications,
    unreadNotifications,
  }
}
