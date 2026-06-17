import { PageIntro } from '../components/PageIntro'
import mastersBg from '../assets/masters-bg.webp'
import masterAnton from '../assets/masters/master-anton.webp'
import masterDenis from '../assets/masters/master-denis.webp'
import masterMax from '../assets/masters/master-max.webp'
import { barbers } from '../data/site'

const masterPhotos = [masterAnton, masterMax, masterDenis]

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
        {barbers.map((barber, index) => (
          <article className="master-card" key={barber.name}>
            <img className="master-card-photo" src={masterPhotos[index]} alt="" aria-hidden="true" />
            <div className="master-card-content">
              <p>{barber.role}</p>
              <h2>{barber.name}</h2>
              <span>{barber.note}</span>
              <strong>{barber.experience}</strong>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
