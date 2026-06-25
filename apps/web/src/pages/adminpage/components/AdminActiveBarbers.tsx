import type { AdminBarber } from '../../../api/admin'
import { getPhoneHref } from '../helpers'

type AdminActiveBarbersProps = {
  activeBarbers: AdminBarber[]
  selectedBarberId: string
  onSelectBarberSchedule: (barberId: string) => void
}

export function AdminActiveBarbers({
  activeBarbers,
  onSelectBarberSchedule,
  selectedBarberId,
}: AdminActiveBarbersProps) {
  return (
    <section className="admin-manager">
      <header>
        <div>
          <span className="admin-eyebrow">Команда</span>
          <h2>Активные мастера</h2>
        </div>
      </header>
      <nav className="admin-barbers" aria-label="Мастера">
        {activeBarbers.map((barber) => (
          <article className="admin-barber-card" key={barber.id}>
            <button
              type="button"
              aria-pressed={barber.id === selectedBarberId}
              onClick={() => onSelectBarberSchedule(barber.id)}
            >
              <span>{barber.name}</span>
              {barber.role && <small>{barber.role}</small>}
            </button>
            {barber.phone && (
              <a className="admin-phone-link" href={getPhoneHref(barber.phone)}>
                {barber.phone}
              </a>
            )}
          </article>
        ))}
      </nav>
    </section>
  )
}
