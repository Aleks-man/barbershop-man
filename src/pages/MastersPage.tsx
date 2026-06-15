import { PageIntro } from '../components/PageIntro'
import { barbers } from '../data/site'

export function MastersPage() {
  return (
    <main className="page-shell">
      <PageIntro
        eyebrow="Мастера"
        title="Разные руки, один стандарт."
        text="Выбирайте мастера по стилю и темпу. Мы сохраняем заметки после визита, чтобы следующая стрижка начиналась точнее."
      />
      <div className="master-grid">
        {barbers.map((barber) => (
          <article className="master-card" key={barber.name}>
            <div className="avatar" aria-hidden="true">
              {barber.name.slice(0, 1)}
            </div>
            <p>{barber.role}</p>
            <h2>{barber.name}</h2>
            <span>{barber.note}</span>
            <strong>{barber.experience}</strong>
          </article>
        ))}
      </div>
    </main>
  )
}
