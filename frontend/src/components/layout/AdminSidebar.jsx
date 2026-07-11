import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBar, Package, Users, Storefront, ArrowLeft, List, X,
} from '../../utils/icons'

const links = [
  { to: '/admin', label: 'Dashboard', icon: ChartBar },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/restaurants', label: 'Restaurants', icon: Storefront },
]

function AdminSidebar({ mobileOpen, onMobileClose }) {
  const location = useLocation()

  const NavLinks = ({ onClick }) => (
    <nav className="flex-1 space-y-2 overflow-y-auto p-4">
      {links.map((link) => {
        const isActive = location.pathname === link.to
        return (
          <Link
            key={link.to}
            to={link.to}
            onClick={onClick}
            className={`group flex items-center gap-3 rounded-lg px-4 py-3 transition ${
              isActive
                ? 'bg-white text-primary shadow-lg shadow-black/15'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className={`grid h-10 w-10 place-items-center rounded-lg transition ${
              isActive ? 'bg-primary text-white' : 'bg-white/10 text-slate-200 group-hover:bg-white/15'
            }`}>
              <link.icon className="h-5 w-5" />
            </span>
            <span className="font-medium">{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      <aside className="fixed bottom-0 left-0 top-0 z-30 hidden w-64 flex-col bg-slate-950 text-white shadow-2xl shadow-slate-950/20 lg:flex">
        <div className="border-b border-white/10 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-300">Control Center</p>
          <h2 className="mt-2 font-display text-3xl tracking-wider">
            FoodHub<span className="text-primary-300">Admin</span>
          </h2>
        </div>
        <NavLinks />
        <div className="border-t border-white/10 p-4">
          <Link to="/" className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/10 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to FoodHub
          </Link>
        </div>
      </aside>

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
              className="fixed bottom-0 left-0 top-0 z-50 flex w-72 flex-col bg-slate-950 text-white shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-white/10 p-6">
                <h2 className="font-display text-3xl tracking-wider">
                  FoodHub<span className="text-primary-300">Admin</span>
                </h2>
                <button onClick={onMobileClose} className="rounded-lg p-2 transition hover:bg-white/10" aria-label="Close admin menu">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <NavLinks onClick={onMobileClose} />
              <div className="border-t border-white/10 p-4">
                <Link to="/" className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/10 hover:text-white">
                  <ArrowLeft className="w-4 h-4" /> Back to FoodHub
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default AdminSidebar
