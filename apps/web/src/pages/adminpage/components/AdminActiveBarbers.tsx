import type { AdminBarber } from '../../../api/admin'

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
          <button
            type="button"
            aria-pressed={barber.id === selectedBarberId}
            key={barber.id}
            onClick={() => onSelectBarberSchedule(barber.id)}
          >
            <span>{barber.name}</span>
            {barber.role && <small>{barber.role}</small>}
          </button>
        ))}
      </nav>
    </section>
  )
}
