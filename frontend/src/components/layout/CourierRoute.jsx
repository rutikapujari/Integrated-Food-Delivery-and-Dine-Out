import { useSelector } from 'react-redux'
import { Link, Navigate, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { notify } from '../../utils/toast'
import Loader from '../common/Loader'
import { Truck } from '../../utils/icons'

function CourierRoute() {
  const { user, isAuthenticated, loading } = useSelector((state) => state.courierAuth)

  useEffect(() => {
    if (!loading && isAuthenticated && user?.role !== 'courier') {
      notify.error('This is the delivery partner panel. Switch to a courier account to manage deliveries.')
    }
  }, [loading, isAuthenticated, user])

  if (loading) return <Loader variant="page" />
  if (!isAuthenticated) return <Navigate to="/courier/login" replace />

  if (user?.role !== 'courier') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-bg px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-border p-8 text-center shadow-[var(--shadow-card)]">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <Truck className="h-9 w-9" weight="duotone" />
          </span>
          <h2 className="mt-5 font-display text-2xl">Delivery Partner Panel</h2>
          <p className="mt-2 text-muted-foreground">
            This area is for FoodHub delivery partners. Sign in with a courier account,
            or become a partner to start delivering.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              to="/courier/login"
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Courier Sign In
            </Link>
            <Link
              to="/courier/register"
              className="w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-surface-muted"
            >
              Become a Delivery Partner
            </Link>
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
              Back to FoodHub
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <Outlet />
}

export default CourierRoute
