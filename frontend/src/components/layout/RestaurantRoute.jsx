import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { notify } from '../../utils/toast'
import Loader from '../common/Loader'

function RestaurantRoute() {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!loading && isAuthenticated && user?.role !== 'restaurant' && user?.role !== 'admin') {
      notify.error('This area is for restaurant partners only.')
    }
  }, [loading, isAuthenticated, user])

  if (loading) return <Loader variant="page" />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'restaurant' && user?.role !== 'admin') return <Navigate to="/" replace />

  return <Outlet />
}

export default RestaurantRoute
