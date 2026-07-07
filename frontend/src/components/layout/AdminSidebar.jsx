import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
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
  const { user } = useSelector((state) => state.auth)

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

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white flex-col z-30">
        <div className="p-6 border-b border-slate-700">
          <h2 className="font-display text-2xl tracking-wider">
            FoodHub<span className="text-primary">Admin</span>
          </h2>
        </div>
        <NavLinks />
        <div className="p-4 border-t border-slate-700">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
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
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-slate-900 text-white flex flex-col z-50"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h2 className="font-display text-2xl tracking-wider">
                  FoodHub<span className="text-primary">Admin</span>
                </h2>
                <button onClick={onMobileClose} className="p-2 rounded-lg hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <NavLinks onClick={onMobileClose} />
              <div className="p-4 border-t border-slate-700">
                <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
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
