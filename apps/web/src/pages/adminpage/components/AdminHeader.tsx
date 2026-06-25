import type { RefObject } from 'react'
import type { AdminNotification } from '../../../api/admin'
import { formatAdminHeaderDateTime } from '../../../utils/dateTime'
import {
  AdminNotifications,
  type NotificationMode,
} from './AdminNotifications'

type AdminHeaderProps = {
  currentTime: Date
  isAdminSession: boolean
  isLoadingNotifications: boolean
  isNotificationsOpen: boolean
  isPasswordChangeDisabled: boolean
  notificationMode: NotificationMode
  notifications: AdminNotification[]
  notificationsRef: RefObject<HTMLDivElement | null>
  unreadNotifications: number
  onLogout: () => void
  onPasswordChangeClick: () => void
  onShowAllNotifications: () => void
  onShowUnreadNotifications: () => void
  onToggleNotifications: () => void
}

export function AdminHeader({
  currentTime,
  isAdminSession,
  isLoadingNotifications,
  isNotificationsOpen,
  isPasswordChangeDisabled,
  notificationMode,
  notifications,
  notificationsRef,
  onLogout,
  onPasswordChangeClick,
  onShowAllNotifications,
  onShowUnreadNotifications,
  onToggleNotifications,
  unreadNotifications,
}: AdminHeaderProps) {
  return (
    <header className="admin-header">
      <div>
        <div className="admin-header-meta">
          <span className="admin-role-badge">
            {isAdminSession ? 'Админ' : 'Мастер'}
          </span>
          <div className="admin-notifications" ref={notificationsRef}>
            <AdminNotifications
              isLoading={isLoadingNotifications}
              isOpen={isNotificationsOpen}
              mode={notificationMode}
              notifications={notifications}
              unreadCount={unreadNotifications}
              onShowAll={onShowAllNotifications}
              onShowUnread={onShowUnreadNotifications}
              onToggle={onToggleNotifications}
            />
          </div>
        </div>
        <span className="admin-eyebrow">
          {formatAdminHeaderDateTime(currentTime)}
        </span>
        <h1>{isAdminSession ? 'Расписание мастеров' : 'Мои записи'}</h1>
      </div>
      <div className="admin-header-actions">
        <button
          type="button"
          disabled={isPasswordChangeDisabled}
          title={
            isPasswordChangeDisabled
              ? 'Пароль защищенного тестового аккаунта нельзя менять'
              : undefined
          }
          onClick={onPasswordChangeClick}
        >
          Сменить пароль
        </button>
        <button type="button" onClick={onLogout}>
          Выйти
        </button>
      </div>
    </header>
  )
}
