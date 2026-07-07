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
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 lg:ml-64">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              onClick={() => setMobileOpen(true)}
            >
              <List className="w-5 h-5" />
            </button>
            <h1 className="text-lg md:text-xl font-semibold text-slate-800">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <NotificationBell unread={unread} onClick={() => setNotifOpen(!notifOpen)} />
              <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.name}</span>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
