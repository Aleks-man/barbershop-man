import { PageIntro } from '../components/PageIntro'
import mastersBg from '../assets/masters-bg.webp'
import { barbers } from '../data/site'

export function MastersPage() {
  return (
    <main
      className="page-shell page-shell--visual masters-page"
      style={{ backgroundImage: `url(${mastersBg})` }}
    >
      <PageIntro
        eyebrow="Мастера"
        title="Мастера, которым доверяют свой стиль."
        text="Познакомьтесь с нашей командой, изучите работы и выберите барбера, который понимает, каким должен быть ваш образ."
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
  );
}
