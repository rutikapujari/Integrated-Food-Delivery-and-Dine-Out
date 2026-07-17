import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {links.map((link) => {
        const isActive = location.pathname === link.to
        return (
          <Link
            key={link.to}
            to={link.to}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <link.icon className="w-5 h-5" />
            <span className="font-medium">{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  const SidebarFooter = () => (
    <div className="border-t border-slate-700">
      <button
        onClick={logout}
        className="flex items-center gap-2 w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors"
      >
        <SignOut className="w-4 h-4" /> Sign Out
      </button>
      <Link to="/" className="flex items-center gap-2 px-4 py-3 text-slate-400 hover:text-white text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to FoodHub
      </Link>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white flex-col z-30">
        <div className="p-6 border-b border-slate-700">
          <Link to="/admin" className="font-display text-2xl tracking-wider hover:opacity-80 transition-opacity">
            FoodHub<span className="text-primary">Admin</span>
          </Link>
        </div>
        <NavLinks />
        <SidebarFooter />
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
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-slate-900 text-white flex flex-col z-50"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <Link to="/admin" onClick={onMobileClose} className="font-display text-2xl tracking-wider hover:opacity-80 transition-opacity">
                  FoodHub<span className="text-primary">Admin</span>
                </Link>
                <button onClick={onMobileClose} className="p-2 rounded-lg hover:bg-slate-800">
                  <X className="w-5 h-5" />
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
