import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './Pages/Home'
import Login from './Pages/Login'
import Register from './Pages/Register'
import Flight from './Pages/Flight'
import Visa from './Pages/Visa'
import Tourism from './Pages/Tourism'
import About from './Pages/About'
import MyInvoices from './Pages/MyInvoices'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<About />} />
      <Route path="/flights" element={<ProtectedRoute><Flight /></ProtectedRoute>} />
      <Route path="/visa" element={<ProtectedRoute><Visa /></ProtectedRoute>} />
      <Route path="/tourism" element={<ProtectedRoute><Tourism /></ProtectedRoute>} />
      <Route path="/my-invoices" element={<ProtectedRoute><MyInvoices /></ProtectedRoute>} />
    </Routes>
  )
}
