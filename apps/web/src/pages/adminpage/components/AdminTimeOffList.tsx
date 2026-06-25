import type { AdminBarber, AdminTimeOff } from '../../../api/admin'
import { formatAdminDateTime } from '../../../utils/dateTime'

type AdminTimeOffListProps = {
  filteredTimeOffs: AdminTimeOff[]
  isAdminSession: boolean
  isLoading: boolean
  timeOffBarber?: AdminBarber
  onDeleteTimeOff: (timeOffId: string) => void
}

export function AdminTimeOffList({
  filteredTimeOffs,
  isAdminSession,
  isLoading,
  onDeleteTimeOff,
  timeOffBarber,
}: AdminTimeOffListProps) {
  return (
    <section className="admin-manager admin-availability-list-panel">
      <header>
        <div>
          <span className="admin-eyebrow">Закрытые периоды</span>
          <h2>{timeOffBarber?.name ?? 'Все мастера'}</h2>
        </div>
      </header>
      {filteredTimeOffs.length === 0 ? (
        <p className="admin-muted">Закрытых периодов пока нет.</p>
      ) : (
        <div className="admin-time-off-list">
          {filteredTimeOffs.map((timeOff) => (
            <article className="admin-time-off-card" key={timeOff.id}>
              <div>
                <strong>{timeOff.reason}</strong>
                <span>
                  {formatAdminDateTime(timeOff.startsAt)} -{' '}
                  {formatAdminDateTime(timeOff.endsAt)}
                </span>
                {isAdminSession && <small>{timeOff.barber.name}</small>}
              </div>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onDeleteTimeOff(timeOff.id)}
              >
                Отменить
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
