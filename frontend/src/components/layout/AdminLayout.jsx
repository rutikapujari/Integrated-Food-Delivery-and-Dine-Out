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
  '/admin/menu': 'Menu Items',
}

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  const { unread } = useSelector((state) => state.notification)

  const pageTitle = pageTitles[location.pathname] || 'Admin'

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 lg:ml-64">
        <header className="h-14 bg-[#1B2838] text-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <List className="w-5 h-5" />
            </button>
            <h1 className="text-base md:text-lg font-bold tracking-wide">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="relative p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                <NotificationBell onClick={() => setNotifOpen(!notifOpen)} unread={unread} />
              </button>
              <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>
            <div className="h-6 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-[#EA580C] flex items-center justify-center text-sm font-bold shadow-md">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="text-sm font-medium text-white/80 hidden sm:block">{user?.name}</span>
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
