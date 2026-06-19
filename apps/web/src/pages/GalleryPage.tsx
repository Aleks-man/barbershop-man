import { useCallback, useEffect, useRef, useState } from 'react'
import type { TouchEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { GalleryImage } from '../data/gallery'

type GalleryPageProps = {
  eyebrow: string
  title: string
  text: string
  images: GalleryImage[]
}

export function GalleryPage({ eyebrow, title, text, images }: GalleryPageProps) {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const touchStartX = useRef<number | null>(null)

  const activeImage = activeIndex === null ? null : images[activeIndex]

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/')
  }

  const showPrevious = useCallback(() => {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null) {
        return currentIndex
      }

      return currentIndex === 0 ? images.length - 1 : currentIndex - 1
    })
  }, [images.length])

  const showNext = useCallback(() => {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null) {
        return currentIndex
      }

      return currentIndex === images.length - 1 ? 0 : currentIndex + 1
    })
  }, [images.length])

  const closeLightbox = useCallback(() => {
    setActiveIndex(null)
  }, [])

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length > 1) {
      touchStartX.current = null
      return
    }

    touchStartX.current = event.changedTouches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length > 0) {
      return
    }

    if (touchStartX.current === null) {
      return
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX.current
    const distance = touchEndX - touchStartX.current
    touchStartX.current = null

    if (Math.abs(distance) < 48) {
      return
    }

    if (distance > 0) {
      showPrevious()
      return
    }

    showNext()
  }

  useEffect(() => {
    if (activeIndex === null) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox()
      }

      if (event.key === 'ArrowLeft') {
        showPrevious()
      }

      if (event.key === 'ArrowRight') {
        showNext()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeIndex, closeLightbox, showNext, showPrevious])

  return (
    <main className="page-shell gallery-page gallery-page--plain-footer">
      <div className="page-intro gallery-intro">
        <p className="eyebrow gallery-eyebrow">
          <span>{eyebrow}</span>
          <button className="gallery-back-arrow" type="button" onClick={handleBack} aria-label="Назад">
            ↩
          </button>
        </p>
        <h1>{title}</h1>
        <span>{text}</span>
      </div>
      <div className="gallery-page-grid">
        {images.map((image, index) => (
          <article className="gallery-photo-card" key={image.src}>
            <button type="button" onClick={() => setActiveIndex(index)}>
              <img src={image.src} alt={image.alt} loading="lazy" />
            </button>
          </article>
        ))}
      </div>

      <button className="gallery-back-button" type="button" onClick={handleBack}>
        Назад
      </button>

      {activeImage && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.alt}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeLightbox()
            }
          }}
        >
          <div
            className="gallery-lightbox-image"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button className="gallery-lightbox-close" type="button" onClick={closeLightbox} aria-label="Закрыть">
              ×
            </button>
            <button className="gallery-lightbox-arrow gallery-lightbox-arrow--prev" type="button" onClick={showPrevious} aria-label="Предыдущее фото">
              ‹
            </button>
            <img src={activeImage.src} alt={activeImage.alt} />
            <button className="gallery-lightbox-arrow gallery-lightbox-arrow--next" type="button" onClick={showNext} aria-label="Следующее фото">
              ›
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
