import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthProvider } from './contexts/AuthContext'
import { PresenceProvider } from './contexts/PresenceContext'
import { CallProvider } from './contexts/CallContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import IncomingCallModal from './components/call/IncomingCallModal'
import ActiveCallScreen from './components/call/ActiveCallScreen'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatViewPage from './pages/ChatViewPage'
import NewChatPage from './pages/NewChatPage'
import NewGroupPage from './pages/NewGroupPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PresenceProvider>
          <CallProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={null} />
                  <Route path="/chat/:id" element={<ChatViewPage />} />
                  <Route path="/new-chat" element={<NewChatPage />} />
                  <Route path="/new-group" element={<NewGroupPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <IncomingCallModal />
            <ActiveCallScreen />
          </CallProvider>
        </PresenceProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
