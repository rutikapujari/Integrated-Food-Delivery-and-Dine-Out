import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { notify } from '../../utils/toast'
import ProtectedRoute from './ProtectedRoute'
import Loader from '../common/Loader'

function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!loading && isAuthenticated && user?.role !== 'admin') {
      notify.error('Access denied. Admin privileges required.')
    }
  }, [loading, isAuthenticated, user])

  if (loading) return <Loader variant="page" />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />

  return children
}

export default AdminRoute
