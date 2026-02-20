import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

export default function ProtectedRoute() {
  const { session, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner className="h-screen" />
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
