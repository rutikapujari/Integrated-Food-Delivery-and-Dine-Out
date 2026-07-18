import { useSelector, useDispatch } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchCurrentUser } from '../../redux/authSlice'
import { notify } from '../../utils/toast'
import Loader from '../common/Loader'

function AdminRoute() {
  const dispatch = useDispatch()
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!loading && isAuthenticated && user && user.role !== 'admin') {
      setRefreshing(true)
      dispatch(fetchCurrentUser()).unwrap().then(() => {
        setRefreshing(false)
      }).catch(() => {
        setRefreshing(false)
        notify.error('Access denied. Admin privileges required.')
      })
    }
  }, [dispatch, loading, isAuthenticated])

  if (loading || refreshing) return <Loader variant="page" />
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />

  return <Outlet />
}

export default AdminRoute
