import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home' 
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Boards from './pages/Boards'
import BoardDetail from './pages/BoardDetail'
import Chat from './pages/Chat' 
import ForgotPassword from './pages/ForgotPassword'

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '16px 24px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          },
          success: {
            icon: '✅',
            style: {
              background: '#0f172a',
              border: '1px solid #22c55e',
            },
          },
          error: {
            icon: '❌',
            style: {
              background: '#0f172a',
              border: '1px solid #ef4444',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/boards" element={<Boards />} />
        <Route path="/boards/:id" element={<BoardDetail />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:boardId" element={<Chat />} />     
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App