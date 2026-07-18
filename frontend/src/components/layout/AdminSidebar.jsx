import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import {
  ChartBar, Package, Users, Storefront, ForkKnife, ArrowLeft, SignOut, X,
} from '../../utils/icons'

const links = [
  { to: '/admin', label: 'Dashboard', icon: ChartBar },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/restaurants', label: 'Restaurants', icon: Storefront },
  { to: '/admin/menu', label: 'Menu Items', icon: ForkKnife },
]

function AdminSidebar({ mobileOpen, onMobileClose }) {
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  const { logout } = useAuth()

  const NavLinks = ({ onClick }) => (
    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
      {links.map((link) => {
        const isActive = location.pathname === link.to
        const Icon = link.icon
        return (
          <Link
            key={link.to}
            to={link.to}
            onClick={onClick}
            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              isActive
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="admin-sidebar-active"
                className="absolute inset-0 bg-white/10 rounded-xl"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <Icon className="w-5 h-5 relative z-10" weight={isActive ? 'fill' : 'bold'} />
            <span className="relative z-10">{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  const SidebarFooter = () => (
    <div className="border-t border-white/10 p-3 space-y-1">
      <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/30 hover:text-white/60 hover:bg-white/5 transition-all">
        <ArrowLeft className="w-4.5 h-4.5" />
        Back to FoodHub
      </Link>
      <button
        onClick={logout}
        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
      >
        <SignOut className="w-4.5 h-4.5" />
        Sign Out
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-[#1B2838] text-white flex-col z-30 shadow-xl">
        <div className="p-5 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 rounded-xl bg-[#EA580C] flex items-center justify-center shadow-lg">
              <ForkKnife className="h-5 w-5 text-white" weight="fill" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide leading-none">FOODHUB</p>
              <p className="text-[10px] text-white/40 leading-none mt-0.5">admin panel</p>
            </div>
          </Link>
        </div>
        <NavLinks />
        <SidebarFooter />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-[#1B2838] text-white flex flex-col z-50 shadow-xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <Link to="/admin" onClick={onMobileClose} className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-[#EA580C] flex items-center justify-center shadow-lg">
                    <ForkKnife className="h-5 w-5 text-white" weight="fill" />
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-wide leading-none">FOODHUB</p>
                    <p className="text-[10px] text-white/40 leading-none mt-0.5">admin panel</p>
                  </div>
                </Link>
                <button onClick={onMobileClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
              <NavLinks onClick={onMobileClose} />
              <SidebarFooter />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default AdminSidebar
