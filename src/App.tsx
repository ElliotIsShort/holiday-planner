import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import VillasPage from './pages/VillasPage'
import AvailabilityPage from './pages/AvailabilityPage'
import ActivitiesPage from './pages/ActivitiesPage'
import LoadingSpinner from './components/LoadingSpinner'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  const { firebaseUser, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          firebaseUser ? <Navigate to="/" replace /> : <LoginPage />
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="villas" element={<VillasPage />} />
        <Route path="availability" element={<AvailabilityPage />} />
        <Route path="activities" element={<ActivitiesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
