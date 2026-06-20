import { useEffect, useState } from 'react'
import { getPublicBarbers, type PublicBarber } from '../api/barbers'
import { PageIntro } from '../components/PageIntro'
import mastersBg from '../assets/masters-bg.webp'
import masterAlex from '../assets/masters/master-alex.webp'
import masterAnton from '../assets/masters/master-anton.webp'
import masterDenis from '../assets/masters/master-denis.webp'
import masterMax from '../assets/masters/master-max.webp'
import { barbers } from '../data/site'

const masterPhotos = [masterAnton, masterMax, masterDenis, masterAlex]

const fallbackBarbers: PublicBarber[] = barbers.map((barber, index) => ({
  description: barber.note,
  experience: barber.experience,
  id: barber.name,
  name: barber.name,
  photoUrl: masterPhotos[index] ?? masterAnton,
  role: barber.role,
}))

export function MastersPage() {
  const [pageBarbers, setPageBarbers] = useState(fallbackBarbers)

  useEffect(() => {
    let isMounted = true

    getPublicBarbers()
      .then((nextBarbers) => {
        if (!isMounted || nextBarbers.length === 0) {
          return
        }

        setPageBarbers(nextBarbers)
      })
      .catch((error: unknown) => {
        console.warn('Failed to load public barbers', error)
      })

    return () => {
      isMounted = false
    }
  }, [])

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
        {pageBarbers.map((barber, index) => (
          <article className="master-card" key={barber.id}>
            <img
              className="master-card-photo"
              src={barber.photoUrl || masterPhotos[index % masterPhotos.length]}
              alt=""
              aria-hidden="true"
            />
            <div className="master-card-content">
              <p>{barber.role}</p>
              <h2>{barber.name}</h2>
              {barber.description && <span>{barber.description}</span>}
              {barber.experience && <strong>{barber.experience}</strong>}
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
