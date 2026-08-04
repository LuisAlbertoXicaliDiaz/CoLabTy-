import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Boards from './pages/Boards'
import BoardDetail from './pages/BoardDetail'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/boards" element={<Boards />} />
      <Route path="/boards/:id" element={<BoardDetail />} />
      
      {/* Ruta por defecto: redirige al login si entras a la raíz */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App