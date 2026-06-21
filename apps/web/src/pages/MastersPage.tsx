import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublicBarbers, type PublicBarber } from '../api/barbers'
import { PageIntro } from '../components/PageIntro'
import mastersBg from '../assets/masters-bg.webp'
import { fallbackPublicBarbers, getBarberPhoto } from '../data/barberPresentation'

const fallbackBarbers: PublicBarber[] = fallbackPublicBarbers

export function MastersPage() {
  const [pageBarbers, setPageBarbers] = useState(fallbackBarbers)

  useEffect(() => {
    let isMounted = true

    getPublicBarbers()
      .then((nextBarbers) => {
        if (!isMounted) {
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
        {pageBarbers.map((barber) => (
          <Link
            className="master-card"
            key={barber.id}
            to={`/booking?barber=${encodeURIComponent(barber.id)}`}
          >
            <img
              className="master-card-photo"
              src={getBarberPhoto(barber)}
              alt=""
              aria-hidden="true"
            />
            <div className="master-card-content">
              <p>{barber.role}</p>
              <h2>{barber.name}</h2>
              {barber.description && <span>{barber.description}</span>}
              {barber.experience && <strong>{barber.experience}</strong>}
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
