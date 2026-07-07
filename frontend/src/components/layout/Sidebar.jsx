import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { X, House, Storefront, ForkKnife, User, ClipboardText, SignOut } from '../../utils/icons'

function Sidebar({ isOpen, onClose }) {
  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between mb-2">
              <Link to="/" className="font-display text-primary text-2xl tracking-wider" onClick={onClose}>
                FoodHub
              </Link>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <hr className="border-border" />

            <nav className="flex flex-col gap-1">
              {[
                { to: '/', label: 'Home', icon: House },
                { to: '/restaurants', label: 'Restaurants', icon: Storefront },
                { to: '/menu', label: 'Menu', icon: ForkKnife },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-surface-muted hover:text-primary transition-colors font-medium"
                >
                  <link.icon className="w-5 h-5" /> {link.label}
                </Link>
              ))}
            </nav>

            <hr className="border-border" />

            <div className="flex flex-col gap-1">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2">
                    <p className="font-semibold text-sm">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <Link to="/profile" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-muted">
                    <User className="w-5 h-5" /> Profile
                  </Link>
                  <Link to="/orders" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-muted">
                    <ClipboardText className="w-5 h-5" /> Orders
                  </Link>
                  <button onClick={() => { logout(); onClose() }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-surface-muted w-full text-left">
                    <SignOut className="w-5 h-5" /> Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary font-semibold hover:bg-surface-muted">
                  <User className="w-5 h-5" /> Sign In
                </Link>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export default Sidebar
