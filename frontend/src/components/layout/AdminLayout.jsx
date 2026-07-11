import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AdminSidebar from './AdminSidebar'
import NotificationBell from '../notification/NotificationBell'
import NotificationDropdown from '../notification/NotificationDropdown'
import { List } from '../../utils/icons'

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/orders': 'Orders',
  '/admin/users': 'Users',
  '/admin/restaurants': 'Restaurants',
}

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  const { unread } = useSelector((state) => state.notification)

  const pageTitle = pageTitles[location.pathname] || 'Admin'

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.14),transparent_32rem),linear-gradient(180deg,#fff7ed_0%,#f8fafc_34%,#f1f5f9_100%)]">
      <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-20 border-b border-white/70 bg-white/85 px-4 py-3 shadow-sm shadow-slate-200/60 backdrop-blur md:px-6">
          <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-primary/30 hover:bg-primary-light lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open admin menu"
            >
              <List className="w-5 h-5" />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">FoodHub Admin</p>
              <h1 className="text-xl font-bold text-slate-900 md:text-2xl">{pageTitle}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <NotificationBell unread={unread} onClick={() => setNotifOpen(!notifOpen)} />
              <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-sm font-bold text-white shadow-sm shadow-primary/30">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="hidden max-w-36 truncate pr-2 text-sm font-semibold text-slate-700 sm:block">{user?.name || 'Admin'}</span>
            </div>
          </div>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
