import { useEffect, useState } from 'react'

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 360)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <button
      className={`back-to-top${isVisible ? ' is-visible' : ''}`}
      type="button"
      aria-label="Наверх"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.25" />
        <path d="m8.6 13.2 3.4-3.4 3.4 3.4" />
      </svg>
    </button>
  )
}
