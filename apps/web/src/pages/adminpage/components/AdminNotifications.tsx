import type { AdminNotification } from '../../../api/admin'
import { formatAdminDateTime } from '../../../utils/dateTime'

export type NotificationMode = 'all' | 'unread'

type AdminNotificationsProps = {
  isLoading: boolean
  isOpen: boolean
  mode: NotificationMode
  notifications: AdminNotification[]
  unreadCount: number
  onShowAll: () => void
  onShowUnread: () => void
  onToggle: () => void
}

const getPhoneHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

export function AdminNotifications({
  isLoading,
  isOpen,
  mode,
  notifications,
  onShowAll,
  onShowUnread,
  onToggle,
  unreadCount,
}: AdminNotificationsProps) {
  return (
    <>
      <button
        type="button"
        className="admin-notification-button"
        aria-expanded={isOpen}
        aria-label="Уведомления"
        onClick={onToggle}
      >
        <span aria-hidden="true" />
        {unreadCount > 0 && (
          <strong>{unreadCount > 9 ? '9+' : unreadCount}</strong>
        )}
      </button>
      {isOpen && (
        <section className="admin-notification-panel">
          <header>
            <span>Уведомления</span>
            <small>{notifications.length}</small>
          </header>
          <div className="admin-notification-tabs">
            <button
              type="button"
              aria-pressed={mode === 'unread'}
              onClick={onShowUnread}
            >
              Новые
            </button>
            <button
              type="button"
              aria-pressed={mode === 'all'}
              onClick={onShowAll}
            >
              Все уведомления
            </button>
          </div>
          {notifications.length === 0 ? (
            <p>
              {isLoading
                ? 'Загружаем уведомления...'
                : mode === 'all'
                  ? 'История уведомлений пока пуста.'
                  : 'Новых уведомлений пока нет.'}
            </p>
          ) : (
            <div className="admin-notification-list">
              {notifications.map((notification) => (
                <article key={notification.id}>
                  <div>
                    <strong>{notification.appointment.service.title}</strong>
                    <span
                      className={`admin-status admin-status--${
                        notification.readAt ? 'completed' : 'upcoming'
                      }`}
                    >
                      {notification.readAt ? 'Прочитано' : 'Новое'}
                    </span>
                  </div>
                  <span>
                    Запись: {formatAdminDateTime(notification.appointment.startsAt)}
                  </span>
                  <span>Мастер: {notification.appointment.barber.name}</span>
                  <small>
                    Клиент записался: {formatAdminDateTime(notification.createdAt)}
                  </small>
                  <small>Клиент: {notification.appointment.customerName}</small>
                  <small>
                    Телефон:{' '}
                    <a
                      className="admin-phone-link"
                      href={getPhoneHref(notification.appointment.customerPhone)}
                    >
                      {notification.appointment.customerPhone}
                    </a>
                  </small>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  )
}
