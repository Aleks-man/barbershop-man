import type { AdminBarber } from '../../../api/admin'

type AdminHiddenBarbersProps = {
  hiddenBarbers: AdminBarber[]
  isLoading: boolean
  onDeleteBarber: (barberId: string) => void
  onRestoreBarber: (barberId: string) => void
}

export function AdminHiddenBarbers({
  hiddenBarbers,
  isLoading,
  onDeleteBarber,
  onRestoreBarber,
}: AdminHiddenBarbersProps) {
  return (
    <section className="admin-manager">
      <header>
        <div>
          <span className="admin-eyebrow">Архив</span>
          <h2>Скрытые мастера</h2>
        </div>
      </header>
      {hiddenBarbers.length === 0 ? (
        <p className="admin-muted">Скрытых мастеров пока нет.</p>
      ) : (
        <nav className="admin-barbers" aria-label="Скрытые мастера">
          {hiddenBarbers.map((barber) => (
            <article className="admin-barber-archive-card" key={barber.id}>
              <span>{barber.name}</span>
              {barber.role && <small>{barber.role}</small>}
              <div className="admin-actions">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => onRestoreBarber(barber.id)}
                >
                  Восстановить
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => onDeleteBarber(barber.id)}
                >
                  Удалить
                </button>
              </div>
            </article>
          ))}
        </nav>
      )}
    </section>
  )
}
