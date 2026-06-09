import { Routes, Route, Navigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { useWebSocket } from './hooks/useWebSocket'
import HomePage from './pages/HomePage'
import LobbyPage from './pages/LobbyPage'
import GamePage from './pages/GamePage'
import ErrorToast from './components/ErrorToast'
import NoticeToast from './components/NoticeToast'

export default function App() {
  // localPlayer is initialized synchronously in the store (initLocalPlayer),
  // so the WebSocket below always connects with a real player id.
  useWebSocket() // establish connection globally

  return (
    <>
      <Analytics />
      <ErrorToast />
      <NoticeToast />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lobby/:roomCode" element={<LobbyPage />} />
        <Route path="/game/:roomCode" element={<GamePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
