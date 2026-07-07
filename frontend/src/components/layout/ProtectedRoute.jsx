import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import Loader from '../common/Loader'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useSelector((state) => state.auth)
  const location = useLocation()

  if (loading && !isAuthenticated) {
    return <Loader variant="page" />
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  return children
}

export default ProtectedRoute
