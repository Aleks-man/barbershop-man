import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { BookingPage } from './pages/BookingPage'
import { GalleryPage } from './pages/GalleryPage'
import { HomePage } from './pages/HomePage'
import { MastersPage } from './pages/MastersPage'
import { ServicesPage } from './pages/ServicesPage'
import { roomGallery, workGallery } from './data/gallery'
import './styles/layout.css'
import './styles/pages.css'
import './styles/home.css'
import './styles/services.css'
import './styles/masters.css'
import './styles/booking.css'
import './styles/gallery.css'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="masters" element={<MastersPage />} />
        <Route path="booking" element={<BookingPage />} />
        <Route
          path="works"
          element={
            <GalleryPage
              eyebrow="Галерея"
              title="Наши работы"
              text="Подборка стрижек, бороды и деталей, которые показывают характер работы мастеров."
              images={workGallery}
            />
          }
        />
        <Route
          path="room"
          element={
            <GalleryPage
              eyebrow="Галерея"
              title="Наша мастерская"
              text="Интерьер, рабочие места и атмосфера Gentleman's Room без лишнего шума."
              images={roomGallery}
            />
          }
        />
      </Route>
    </Routes>
  )
}

export default App
