import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { BookingPage } from './pages/BookingPage'
import { HomePage } from './pages/HomePage'
import { MastersPage } from './pages/MastersPage'
import { ServicesPage } from './pages/ServicesPage'
import './styles/layout.css'
import './styles/pages.css'
import './styles/home.css'
import './styles/services.css'
import './styles/masters.css'
import './styles/booking.css'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="masters" element={<MastersPage />} />
        <Route path="booking" element={<BookingPage />} />
      </Route>
    </Routes>
  )
}

export default App
